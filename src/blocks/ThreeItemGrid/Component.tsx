import type { Media, Product, ThreeItemGridBlock as ThreeItemGridBlockProps } from '@/payload-types'

import { GridTileImage } from '@/components/Grid/tile'
import Link from 'next/link'
import React from 'react'
import type { DefaultDocumentIDType } from 'payload'
import { getRequestLocale } from '@/i18n/request'
import { localizePath, type AppLocale } from '@/i18n/config'
import { priceField } from '@/lib/currency'

type Props = { item: Product; locale: AppLocale; priority?: boolean; size: 'full' | 'half' }

export const ThreeItemGridItem: React.FC<Props> = ({ item, locale, size }) => {
  let price = item[priceField]

  if (item.enableVariants && item.variants?.docs?.length) {
    const variant = item.variants.docs[0]

    if (variant && typeof variant === 'object' && variant[priceField]) {
      price = variant[priceField]
    }
  }

  return (
    <div
      className={size === 'full' ? 'md:col-span-4 md:row-span-2' : 'md:col-span-2 md:row-span-1'}
    >
      <Link
        className="relative block aspect-square h-full w-full"
        href={localizePath(`/products/${item.slug}`, locale)}
      >
        <GridTileImage
          label={{
            amount: price!,
            position: size === 'full' ? 'center' : 'bottom',
            title: item.title,
          }}
          media={item.meta?.image as Media}
        />
      </Link>
    </div>
  )
}

export const ThreeItemGridBlock: React.FC<
  ThreeItemGridBlockProps & {
    id?: DefaultDocumentIDType
    className?: string
  }
> = async ({ products }) => {
  const locale = await getRequestLocale()
  if (!products || !products[0] || !products[1] || !products[2]) return null

  const [firstProduct, secondProduct, thirdProduct] = products

  return (
    <section className="container grid gap-4 pb-4 md:grid-cols-6 md:grid-rows-2">
      <ThreeItemGridItem item={firstProduct as Product} locale={locale} priority size="full" />
      <ThreeItemGridItem item={secondProduct as Product} locale={locale} priority size="half" />
      <ThreeItemGridItem item={thirdProduct as Product} locale={locale} size="half" />
    </section>
  )
}
