import type { Product } from '@/payload-types'

import Link from 'next/link'
import React from 'react'
import clsx from 'clsx'
import { Media } from '@/components/Media'
import { Price } from '@/components/Price'
import type { AppLocale } from '@/i18n/config'
import { priceField } from '@/lib/currency'
import { AddProductCardButton } from './AddProductCardButton'
import { getProductVariantHref } from '@/components/product/variantSelection'

type Props = {
  appearance?: 'compact' | 'default' | 'premium'
  locale?: AppLocale
  product: Partial<Product>
}

export const ProductGridItem: React.FC<Props> = ({
  appearance = 'default',
  locale = 'uk',
  product,
}) => {
  const { gallery, title } = product

  let price = product[priceField]

  const variants = product.variants?.docs

  if (variants && variants.length > 0) {
    const variant = variants[0]
    if (
      variant &&
      typeof variant === 'object' &&
      variant?.[priceField] &&
      typeof variant[priceField] === 'number'
    ) {
      price = variant[priceField]
    }
  }

  const compareAtPrice =
    variants?.[0] &&
    typeof variants[0] === 'object' &&
    typeof variants[0].compareAtPrice === 'number'
      ? variants[0].compareAtPrice
      : product.compareAtPrice
  const image =
    gallery?.[0]?.image && typeof gallery[0]?.image !== 'string' ? gallery[0]?.image : false
  const oldPrice =
    typeof compareAtPrice === 'number'
      ? Math.round(compareAtPrice * 100)
      : typeof price === 'number'
        ? Math.round((price * 1.18) / 100) * 100
        : undefined
  const hasVariantStock =
    variants?.some((variant) => typeof variant === 'object' && (variant.inventory || 0) > 0) ??
    false
  const isOutOfStock = product.enableVariants ? !hasVariantStock && product.inventory === 0 : product.inventory === 0
  const canAddFromCard = !product.enableVariants && !isOutOfStock
  const productHref = getProductVariantHref(product, locale)
  const rating = product.reviewSummary?.rating
  const reviewCount = product.reviewSummary?.reviewCount
  const stockLabel =
    locale === 'ru'
      ? isOutOfStock
        ? 'Нет в наличии'
        : 'В наличии'
      : isOutOfStock
        ? 'Немає в наявності'
        : 'Є в наявності'

  return (
    <article
      className={clsx('relative h-full w-full group', {
        'rounded-lg border bg-card p-2.5 shadow-sm transition hover:border-primary/30 hover:shadow-md md:p-3':
          appearance === 'compact',
        'rounded-lg border bg-card p-3 transition-colors hover:border-primary/30 md:p-4':
          appearance === 'premium',
        'rounded-xl border bg-card p-3 shadow-sm transition hover:border-primary/30 hover:shadow-md':
          appearance === 'default',
      })}
    >
      <Link className="block" href={productHref}>
        {image ? (
          <Media
            className={clsx(
              appearance === 'compact'
                ? 'relative aspect-[4/3] overflow-hidden rounded-md bg-background p-3'
                : appearance === 'premium'
                ? 'relative aspect-square overflow-hidden rounded-md bg-background p-6'
                : 'relative aspect-square overflow-hidden rounded-lg bg-muted/40 p-4',
            )}
            height={80}
            imgClassName={clsx(
              'h-full w-full object-contain transition duration-300 ease-in-out group-hover:scale-103',
            )}
            resource={image}
            width={80}
          />
        ) : (
          <div
            className={clsx(
              'relative rounded-lg bg-muted',
              appearance === 'compact' ? 'aspect-[4/3]' : 'aspect-square',
            )}
          />
        )}

        <div className={clsx(appearance === 'compact' ? 'mt-2 min-h-10' : 'mt-3 min-h-11')}>
          <h3
            className={clsx(
              'line-clamp-2 font-medium transition group-hover:text-primary',
              appearance === 'compact' ? 'text-xs leading-5 md:text-sm' : 'text-sm leading-5',
            )}
          >
            {title}
          </h3>
        </div>
      </Link>

      {typeof rating === 'number' && rating > 0 ? (
        <div
          className={clsx(
            'flex items-center gap-1 text-xs',
            appearance === 'compact' ? 'mt-1.5' : 'mt-2',
          )}
        >
          <span className="text-amber-500">{'★'.repeat(Math.round(rating))}</span>
          {typeof reviewCount === 'number' && reviewCount > 0 ? (
            <span className="text-muted-foreground">{reviewCount}</span>
          ) : null}
        </div>
      ) : null}

      <div
        className={clsx(
          'flex items-end justify-between gap-3',
          appearance === 'compact' ? 'mt-2' : 'mt-3',
        )}
      >
        <div className="min-w-0">
          {oldPrice && (
            <Price
              amount={oldPrice}
              as="span"
              className="block text-xs text-muted-foreground line-through"
            />
          )}
          {typeof price === 'number' && (
            <Price
              amount={price}
              as="span"
              className={clsx(
                'block font-semibold text-red-600',
                appearance === 'compact' ? 'text-base' : 'text-lg',
              )}
            />
          )}
          <div className="mt-1 text-xs text-muted-foreground">{stockLabel}</div>
        </div>
        <AddProductCardButton
          disabled={!canAddFromCard && (isOutOfStock || !product.enableVariants)}
          href={product.enableVariants && !isOutOfStock ? productHref : undefined}
          productID={typeof product.id === 'number' ? product.id : undefined}
        />
      </div>
    </article>
  )
}
