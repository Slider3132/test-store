import type { PaymentAdapterClient } from '@payloadcms/plugin-ecommerce/types'
import { stripeAdapterClient } from '@payloadcms/plugin-ecommerce/payments/stripe'

const provider = process.env.NEXT_PUBLIC_PAYMENT_PROVIDER || 'stripe'
const providerLabel = process.env.NEXT_PUBLIC_PAYMENT_PROVIDER_LABEL || 'Оплата карткою'

export const getClientPaymentMethods = (): PaymentAdapterClient[] => {
  if (provider === 'stripe') {
    return [
      stripeAdapterClient({
        publishableKey: process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY || '',
      }),
    ]
  }

  if (provider === 'external_redirect') {
    return [
      {
        name: 'external_redirect',
        label: providerLabel,
        confirmOrder: false,
        initiatePayment: true,
      },
    ]
  }

  return []
}

export const activeClientPaymentProvider = provider
