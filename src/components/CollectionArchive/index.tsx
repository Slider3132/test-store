import { cn } from '@/utilities/cn'
import React from 'react'

import type { Product } from '@/payload-types'
import { ProductGridItem } from '@/components/ProductGridItem'
import type { AppLocale } from '@/i18n/config'

export type Props = {
  appearance?: 'grid' | 'premiumGrid'
  locale: AppLocale
  posts: Product[]
}

export const CollectionArchive: React.FC<Props> = (props) => {
  const { appearance = 'grid', locale, posts } = props
  const isPremium = appearance === 'premiumGrid'

  return (
    <div className={cn('container')}>
      <div>
        <div
          className={cn(
            'grid grid-cols-4 sm:grid-cols-8 lg:grid-cols-12',
            isPremium ? 'gap-4 lg:gap-6' : 'gap-y-4 gap-x-4 lg:gap-y-8 lg:gap-x-8 xl:gap-x-8',
          )}
        >
          {posts?.map((result, index) => {
            if (typeof result === 'object' && result !== null) {
              return (
                <div
                  className={cn(isPremium ? 'col-span-4 lg:col-span-3' : 'col-span-4')}
                  key={index}
                >
                  <ProductGridItem
                    appearance={isPremium ? 'compact' : 'default'}
                    locale={locale}
                    product={result}
                  />
                </div>
              )
            }

            return null
          })}
        </div>
      </div>
    </div>
  )
}
