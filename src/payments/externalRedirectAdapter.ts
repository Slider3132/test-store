import crypto from 'crypto'
import type { Endpoint } from 'payload'
import type { PaymentAdapter, PaymentAdapterClient } from '@payloadcms/plugin-ecommerce/types'

import { env } from '@/lib/env'
import { getServerSideURL } from '@/utilities/getURL'
import { finalizePaidTransaction } from '@/payments/orderFinalization'
import { validateDeliveryDetails } from '@/delivery/details'
import { resolveDeliverySettings } from '@/delivery/settings'

const METHOD_NAME = 'external_redirect'

const getRelationshipID = (value: unknown) => {
  if (!value) return undefined
  if (typeof value === 'object' && 'id' in value) return value.id
  return value
}

const flattenCartItems = (items: any[]) =>
  items.map((item) => {
    const { product, variant, ...rest } = item
    const productID = getRelationshipID(product)
    const variantID = getRelationshipID(variant)

    return {
      ...rest,
      product: productID,
      quantity: item.quantity,
      ...(variantID ? { variant: variantID } : {}),
    }
  })

export const signExternalPaymentBody = (body: string, secret = env.externalPaymentWebhookSecret) =>
  crypto.createHmac('sha256', secret).update(body).digest('hex')

export const verifyExternalPaymentSignature = ({
  body,
  secret = env.externalPaymentWebhookSecret,
  signature,
}: {
  body: string
  secret?: string
  signature: string | null
}) => {
  if (!secret || !signature) return false

  const expected = signExternalPaymentBody(body, secret)
  const expectedBuffer = Buffer.from(expected, 'hex')
  const signatureBuffer = Buffer.from(signature, 'hex')

  return (
    expectedBuffer.length === signatureBuffer.length &&
    crypto.timingSafeEqual(expectedBuffer, signatureBuffer)
  )
}

const buildCheckoutURL = ({
  amount,
  currency,
  customerEmail,
  providerReference,
  transactionID,
}: {
  amount: number
  currency: string
  customerEmail: string
  providerReference: string
  transactionID: number | string
}) => {
  const checkoutURL = new URL(env.externalPaymentCheckoutURL)
  checkoutURL.searchParams.set('amount', String(amount))
  checkoutURL.searchParams.set('currency', currency)
  checkoutURL.searchParams.set('customerEmail', customerEmail)
  checkoutURL.searchParams.set('providerReference', providerReference)
  checkoutURL.searchParams.set('transactionID', String(transactionID))
  checkoutURL.searchParams.set('returnUrl', `${getServerSideURL()}/checkout/confirm-order`)

  return checkoutURL.toString()
}

const webhooksEndpoint = (): Endpoint => ({
  handler: async (req) => {
    const body = await req.text?.()
    const rawBody = body || ''
    const signature =
      req.headers.get('x-payment-signature') || req.headers.get('x-external-payment-signature')

    if (!verifyExternalPaymentSignature({ body: rawBody, signature })) {
      return Response.json({ message: 'Invalid payment signature.' }, { status: 401 })
    }

    const event = JSON.parse(rawBody) as {
      amount?: number
      currency?: string
      providerReference?: string
      status?: string
      transactionID?: number | string
    }

    if (!event.transactionID || event.status !== 'succeeded') {
      return Response.json({ received: true })
    }

    const transaction = (await req.payload.findByID({
      collection: 'transactions' as any,
      depth: 0,
      id: event.transactionID as any,
      overrideAccess: true,
      select: {
        amount: true,
        currency: true,
        externalRedirect: true,
        id: true,
      },
    })) as {
      amount?: number
      currency?: string
      externalRedirect?: {
        providerReference?: string
      }
      id: number | string
    }

    if (
      event.providerReference &&
      transaction.externalRedirect?.providerReference !== event.providerReference
    ) {
      return Response.json({ message: 'Invalid provider reference.' }, { status: 400 })
    }

    if (typeof event.amount === 'number' && transaction.amount !== event.amount) {
      return Response.json({ message: 'Invalid payment amount.' }, { status: 400 })
    }

    if (event.currency && transaction.currency !== event.currency) {
      return Response.json({ message: 'Invalid payment currency.' }, { status: 400 })
    }

    const result = await finalizePaidTransaction({
      req,
      transactionID: transaction.id,
    })

    return Response.json({ received: true, ...result })
  },
  method: 'post',
  path: '/webhooks',
})

export const externalRedirectAdapter = (): PaymentAdapter => ({
  name: METHOD_NAME,
  label: env.externalPaymentProviderLabel,
  group: {
    name: 'externalRedirect',
    type: 'group',
    admin: {
      condition: (data) => data?.paymentMethod === METHOD_NAME,
    },
    fields: [
      {
        name: 'providerReference',
        type: 'text',
        admin: {
          readOnly: true,
        },
      },
      {
        name: 'checkoutURL',
        type: 'text',
        admin: {
          readOnly: true,
        },
      },
      {
        name: 'shippingAddress',
        type: 'json',
        admin: {
          readOnly: true,
        },
      },
      {
        name: 'deliveryDetails',
        type: 'json',
        admin: {
          readOnly: true,
        },
      },
    ],
  },
  endpoints: [webhooksEndpoint()],
  initiatePayment: async ({ data, req, transactionsSlug }) => {
    const { billingAddress, cart, currency, customerEmail, shippingAddress } = data
    const amount = cart.subtotal
    const deliverySettings = await resolveDeliverySettings({ payload: req.payload })
    const deliveryDetails = validateDeliveryDetails(data, deliverySettings)

    if (!env.externalPaymentCheckoutURL) {
      throw new Error('PAYMENT_EXTERNAL_CHECKOUT_URL is required for external redirect payments.')
    }

    if (!amount || amount <= 0) {
      throw new Error('A valid amount is required to initiate a payment.')
    }

    const providerReference = crypto.randomUUID()
    const items = flattenCartItems(cart.items || [])

    const transaction = await req.payload.create({
      collection: transactionsSlug as any,
      data: {
        ...(req.user ? { customer: req.user.id } : { customerEmail }),
        amount,
        billingAddress,
        cart: cart.id,
        currency,
        externalRedirect: {
          deliveryDetails,
          providerReference,
          shippingAddress,
        },
        items,
        paymentMethod: METHOD_NAME,
        status: 'pending',
      },
      overrideAccess: true,
      req,
    })

    const redirectUrl = buildCheckoutURL({
      amount,
      currency,
      customerEmail,
      providerReference,
      transactionID: transaction.id,
    })

    await req.payload.update({
      collection: transactionsSlug as any,
      data: {
        externalRedirect: {
          checkoutURL: redirectUrl,
          deliveryDetails,
          providerReference,
          shippingAddress,
        },
      },
      id: transaction.id,
      overrideAccess: true,
      req,
    })

    return {
      message: 'Payment initiated successfully',
      providerReference,
      redirectUrl,
      transactionID: transaction.id,
    }
  },
  confirmOrder: async () => {
    throw new Error('External redirect payments must be confirmed by a signed provider webhook.')
  },
})

export const externalRedirectAdapterClient = (): PaymentAdapterClient => ({
  name: METHOD_NAME,
  label: env.externalPaymentProviderLabel,
  confirmOrder: false,
  initiatePayment: true,
})
