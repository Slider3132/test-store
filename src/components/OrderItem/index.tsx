import { OrderStatus } from '@/components/OrderStatus'
import { Price } from '@/components/Price'
import { Button } from '@/components/ui/button'
import { Order } from '@/payload-types'
import { formatDateTime } from '@/utilities/formatDateTime'
import Link from 'next/link'
import { getDictionary } from '@/i18n/dictionary'
import { localizePath, type AppLocale } from '@/i18n/config'

type Props = {
  order: Order
  locale?: AppLocale
}

export const OrderItem: React.FC<Props> = ({ order, locale = 'uk' }) => {
  const dictionary = getDictionary(locale)
  const itemsLabel = order.items?.length === 1 ? dictionary.order.item : dictionary.order.items

  return (
    <div className="bg-card border rounded-lg px-4 py-2 md:px-6 md:py-4 flex flex-col sm:flex-row gap-12 sm:items-center sm:justify-between">
      <div className="flex flex-col gap-4">
        <h3 className="text-sm uppercase font-mono tracking-widest text-primary/50 truncate max-w-32 sm:max-w-none">{`#${order.id}`}</h3>

        <div className="flex flex-col-reverse sm:flex-row sm:items-center gap-6">
          <p className="text-xl">
            <time dateTime={order.createdAt}>
              {formatDateTime({ date: order.createdAt, format: 'MMMM dd, yyyy' })}
            </time>
          </p>

          {order.status && <OrderStatus status={order.status} />}
        </div>

        <p className="flex gap-2 text-xs text-primary/80">
          <span>
            {order.items?.length} {itemsLabel}
          </span>
          {order.amount && (
            <>
              <span>•</span>
              <Price as="span" amount={order.amount} currencyCode={order.currency ?? undefined} />
            </>
          )}
        </p>
      </div>

      <Button variant="outline" asChild className="self-start sm:self-auto">
        <Link href={localizePath(`/orders/${order.id}`, locale)}>{dictionary.order.view}</Link>
      </Button>
    </div>
  )
}
