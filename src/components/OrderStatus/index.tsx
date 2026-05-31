import { getDictionary } from '@/i18n/dictionary'
import { type AppLocale } from '@/i18n/config'
import { cn } from '@/utilities/cn'

type Props = {
  status?: string | null
  className?: string
  locale?: AppLocale
}

export const OrderStatus: React.FC<Props> = ({ status, className, locale = 'uk' }) => {
  const dictionary = getDictionary(locale)
  const label = status ? dictionary.status[status as keyof typeof dictionary.status] || status : ''

  return (
    <div
      className={cn(
        'text-xs tracking-widest font-mono uppercase py-0 px-2 rounded w-fit',
        className,
        {
          'bg-primary/10': status === 'processing',
          'bg-success': status === 'completed',
        },
      )}
    >
      {label}
    </div>
  )
}
