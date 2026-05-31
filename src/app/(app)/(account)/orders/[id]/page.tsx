import type { Order } from '@/payload-types'
import type { Metadata } from 'next'

import { Price } from '@/components/Price'
import { Button } from '@/components/ui/button'
import { formatDateTime } from '@/utilities/formatDateTime'
import { mergeOpenGraph } from '@/utilities/mergeOpenGraph'
import Link from 'next/link'
import { notFound } from 'next/navigation'
import { ChevronLeftIcon } from 'lucide-react'
import { ProductItem } from '@/components/ProductItem'
import { headers as getHeaders } from 'next/headers.js'
import configPromise from '@payload-config'
import { getPayload } from 'payload'
import { OrderStatus } from '@/components/OrderStatus'
import { AddressItem } from '@/components/addresses/AddressItem'
import { getRequestLocale } from '@/i18n/request'
import { getDictionary } from '@/i18n/dictionary'
import { localizePath } from '@/i18n/config'
import { verifyOrderAccessToken } from '@/lib/orderAccess'

export const dynamic = 'force-dynamic'

type OrderDeliveryDetails = {
  cityLabel?: string | null
  provider?: 'pickup' | 'nova_poshta' | 'ukrposhta' | null
  trackingNumber?: string | null
  warehouseLabel?: string | null
}

type OrderWithDelivery = Order & {
  deliveryDetails?: OrderDeliveryDetails | null
  tracking?: string | null
  trackingNumber?: string | null
}

export const canAccessOrderAsGuest = ({
  accessToken,
  email,
  orderResult,
  orderToken,
  requestedOrderID,
}: {
  accessToken?: string
  email?: string
  orderResult?: Pick<Order, 'accessToken' | 'customerEmail'> | null
  orderToken?: string
  requestedOrderID: string
}) => {
  const canAccessWithOrderToken = Boolean(
    email &&
      orderToken &&
      verifyOrderAccessToken({ email, orderID: requestedOrderID, token: orderToken }),
  )
  const canAccessWithLegacyToken = Boolean(
    accessToken && orderResult?.accessToken && orderResult.accessToken === accessToken,
  )

  return Boolean(
    orderResult &&
      ((orderResult.customerEmail &&
        orderResult.customerEmail === email &&
        canAccessWithOrderToken) ||
        canAccessWithLegacyToken),
  )
}

type PageProps = {
  params: Promise<{ id: string }>
  searchParams: Promise<{ email?: string; accessToken?: string; orderToken?: string }>
}

export default async function Order({ params, searchParams }: PageProps) {
  const locale = await getRequestLocale()
  const dictionary = getDictionary(locale)
  const headers = await getHeaders()
  const payload = await getPayload({ config: configPromise })
  const { user } = await payload.auth({ headers })

  const { id } = await params
  const { email = '', accessToken = '', orderToken = '' } = await searchParams

  let order: Order | null = null

  try {
    const {
      docs: [orderResult],
    } = await payload.find({
      collection: 'orders',
      user,
      overrideAccess: !Boolean(user),
      depth: 2,
      where: {
        and: [
          {
            id: {
              equals: id,
            },
          },
          ...(user
            ? [
                {
                  customer: {
                    equals: user.id,
                  },
                },
              ]
            : [
                ...(email
                  ? [
                      {
                        customerEmail: {
                          equals: email,
                        },
                      },
                    ]
                  : [
                      {
                        accessToken: {
                          equals: accessToken,
                        },
                      },
                    ]),
              ]),
        ],
      },
      select: {
        amount: true,
        currency: true,
        items: true,
        customerEmail: true,
        customer: true,
        status: true,
        paymentStatus: true,
        fulfillmentStatus: true,
        deliveryMethod: true,
        deliveryDetails: true,
        tracking: true,
        trackingNumber: true,
        accessToken: true,
        createdAt: true,
        updatedAt: true,
        shippingAddress: true,
      },
    })

    const canAccessAsGuest =
      !user &&
      canAccessOrderAsGuest({
        accessToken,
        email,
        orderResult,
        orderToken,
        requestedOrderID: id,
      })
    const canAccessAsUser =
      user &&
      orderResult &&
      orderResult.customer &&
      (typeof orderResult.customer === 'object'
        ? orderResult.customer.id
        : orderResult.customer) === user.id

    if (orderResult && (canAccessAsGuest || canAccessAsUser)) {
      order = orderResult
    }
  } catch (error) {
    console.error(error)
  }

  if (!order) {
    notFound()
  }

  const orderWithDelivery = order as OrderWithDelivery
  const deliveryDetails = orderWithDelivery.deliveryDetails
  const trackingNumber =
    deliveryDetails?.trackingNumber || orderWithDelivery.trackingNumber || orderWithDelivery.tracking
  const deliveryMethod = deliveryDetails?.provider || order.deliveryMethod
  const deliveryMethodLabel = deliveryMethod
    ? deliveryMethod in dictionary.order.deliveryMethods
      ? dictionary.order.deliveryMethods[deliveryMethod as keyof typeof dictionary.order.deliveryMethods]
      : deliveryMethod
    : null

  return (
    <div className="">
      <div className="flex gap-8 justify-between items-center mb-6">
        {user ? (
          <div className="flex gap-4">
            <Button asChild variant="ghost">
              <Link href={localizePath('/orders', locale)}>
                <ChevronLeftIcon />
                {dictionary.account.allOrders}
              </Link>
            </Button>
          </div>
        ) : (
          <div></div>
        )}

        <h1 className="text-sm uppercase font-mono px-2 bg-primary/10 rounded tracking-[0.07em]">
          <span className="">{`${dictionary.order.number}${order.id}`}</span>
        </h1>
      </div>

      <div className="bg-card border rounded-lg px-6 py-4 flex flex-col gap-12">
        <div className="flex flex-col gap-6 lg:flex-row lg:justify-between">
          <div className="">
            <p className="font-mono uppercase text-primary/50 mb-1 text-sm">{dictionary.order.date}</p>
            <p className="text-lg">
              <time dateTime={order.createdAt}>
                {formatDateTime({ date: order.createdAt, format: 'MMMM dd, yyyy' })}
              </time>
            </p>
          </div>

          <div className="">
            <p className="font-mono uppercase text-primary/50 mb-1 text-sm">{dictionary.common.total}</p>
            {order.amount && <Price className="text-lg" amount={order.amount} />}
          </div>

          {order.status && (
            <div className="grow max-w-1/3">
              <p className="font-mono uppercase text-primary/50 mb-1 text-sm">{dictionary.order.status}</p>
              <OrderStatus className="text-sm" status={order.status} locale={locale} />
            </div>
          )}

          {order.paymentStatus && (
            <div className="">
              <p className="font-mono uppercase text-primary/50 mb-1 text-sm">
                {dictionary.order.paymentStatus}
              </p>
              <OrderStatus className="text-sm" status={order.paymentStatus} locale={locale} />
            </div>
          )}

          {order.fulfillmentStatus && (
            <div className="">
              <p className="font-mono uppercase text-primary/50 mb-1 text-sm">
                {dictionary.order.fulfillmentStatus}
              </p>
              <OrderStatus className="text-sm" status={order.fulfillmentStatus} locale={locale} />
            </div>
          )}
        </div>

        {order.items && (
          <div>
            <h2 className="font-mono text-primary/50 mb-4 uppercase text-sm">{dictionary.order.items}</h2>
            <ul className="flex flex-col gap-6">
              {order.items?.map((item, index) => {
                if (typeof item.product === 'string') {
                  return null
                }

                if (!item.product || typeof item.product !== 'object') {
                  return <div key={index}>{dictionary.order.detailsUnavailable}</div>
                }

                const variant =
                  item.variant && typeof item.variant === 'object' ? item.variant : undefined

                return (
                  <li key={item.id}>
                    <ProductItem
                      locale={locale}
                      product={item.product}
                      quantity={item.quantity}
                      variant={variant}
                    />
                  </li>
                )
              })}
            </ul>
          </div>
        )}

        {order.shippingAddress && (
          <div>
            <h2 className="font-mono text-primary/50 mb-4 uppercase text-sm">
              {dictionary.order.shippingAddress}
            </h2>

            {/* @ts-expect-error - some kind of type hell */}
            <AddressItem address={order.shippingAddress} hideActions />
          </div>
        )}

        {(deliveryMethodLabel || deliveryDetails?.cityLabel || deliveryDetails?.warehouseLabel) && (
          <div>
            <h2 className="font-mono text-primary/50 mb-4 uppercase text-sm">
              {dictionary.order.deliveryDetails}
            </h2>

            <dl className="grid gap-3 sm:grid-cols-2">
              {deliveryMethodLabel && (
                <div>
                  <dt className="font-mono uppercase text-primary/50 mb-1 text-xs">
                    {dictionary.order.deliveryMethod}
                  </dt>
                  <dd>{deliveryMethodLabel}</dd>
                </div>
              )}
              {deliveryDetails?.cityLabel && (
                <div>
                  <dt className="font-mono uppercase text-primary/50 mb-1 text-xs">
                    {dictionary.order.deliveryCity}
                  </dt>
                  <dd>{deliveryDetails.cityLabel}</dd>
                </div>
              )}
              {deliveryDetails?.warehouseLabel && (
                <div>
                  <dt className="font-mono uppercase text-primary/50 mb-1 text-xs">
                    {dictionary.order.deliveryWarehouse}
                  </dt>
                  <dd>{deliveryDetails.warehouseLabel}</dd>
                </div>
              )}
            </dl>
          </div>
        )}

        {trackingNumber && (
          <div>
            <h2 className="font-mono text-primary/50 mb-4 uppercase text-sm">
              {dictionary.order.tracking}
            </h2>
            <p>{trackingNumber}</p>
          </div>
        )}
      </div>
    </div>
  )
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { id } = await params

  return {
    description: `Order details for order ${id}.`,
    openGraph: mergeOpenGraph({
      title: `Order ${id}`,
      url: `/orders/${id}`,
    }),
    title: `Order ${id}`,
  }
}
