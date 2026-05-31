import type { Order } from '@/payload-types'
import type { Metadata } from 'next'

import { mergeOpenGraph } from '@/utilities/mergeOpenGraph'

import { OrderItem } from '@/components/OrderItem'
import { headers as getHeaders } from 'next/headers'
import configPromise from '@payload-config'
import { getPayload } from 'payload'
import { redirect } from 'next/navigation'
import { getRequestLocale } from '@/i18n/request'
import { getDictionary } from '@/i18n/dictionary'
import { localizePath } from '@/i18n/config'

export default async function Orders() {
  const locale = await getRequestLocale()
  const dictionary = getDictionary(locale)
  const headers = await getHeaders()
  const payload = await getPayload({ config: configPromise })
  const { user } = await payload.auth({ headers })

  let orders: Order[] | null = null

  if (!user) {
    redirect(
      `${localizePath('/login', locale)}?warning=${encodeURIComponent(
        locale === 'ru' ? 'Войдите, чтобы открыть заказы.' : 'Увійдіть, щоб відкрити замовлення.',
      )}`,
    )
  }

  try {
    const ordersResult = await payload.find({
      collection: 'orders',
      limit: 0,
      pagination: false,
      user,
      overrideAccess: false,
      where: {
        customer: {
          equals: user?.id,
        },
      },
    })

    orders = ordersResult?.docs || []
  } catch (error) {}

  return (
    <>
      <div className="border p-8 rounded-lg bg-primary-foreground w-full">
        <h1 className="text-3xl font-medium mb-8">{dictionary.account.orders}</h1>
        {(!orders || !Array.isArray(orders) || orders?.length === 0) && (
          <p className="">{dictionary.account.noOrders}</p>
        )}

        {orders && orders.length > 0 && (
          <ul className="flex flex-col gap-6">
            {orders?.map((order, index) => (
              <li key={order.id}>
                <OrderItem order={order} locale={locale} />
              </li>
            ))}
          </ul>
        )}
      </div>
    </>
  )
}

export async function generateMetadata(): Promise<Metadata> {
  const locale = await getRequestLocale()
  const dictionary = getDictionary(locale)

  return {
    description: dictionary.meta.ordersDescription,
    openGraph: mergeOpenGraph({
      title: dictionary.account.orders,
      url: localizePath('/orders', locale),
    }),
    title: dictionary.account.orders,
  }
}
