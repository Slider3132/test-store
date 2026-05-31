import { Grid } from '@/components/Grid'
import { ProductGridItem } from '@/components/ProductGridItem'
import { ShopSortSelect } from '@/components/layout/search/ShopSortSelect'
import { getDictionary } from '@/i18n/dictionary'
import type { AppLocale } from '@/i18n/config'
import { sorting } from '@/lib/constants'
import { priceField } from '@/lib/currency'
import type { Product } from '@/payload-types'
import { cn } from '@/utilities/cn'
import React from 'react'
import { ListingPagination } from './ListingPagination'
import { ViewModeToggle } from './ViewModeToggle'

export type ListingSearchParams = { [key: string]: string | string[] | undefined }

type ProductListingDocs = {
  docs: Partial<Product>[]
  page?: number | null
  totalDocs: number
  totalPages?: number | null
}

type Props = {
  currentPage: number
  emptyMessage: string
  locale: AppLocale
  mobileFilters?: React.ReactNode
  pathname: string
  products: ProductListingDocs
  searchParams: ListingSearchParams
  title?: string
}

export const ProductListing: React.FC<Props> = ({
  currentPage,
  emptyMessage,
  locale,
  mobileFilters,
  pathname,
  products,
  searchParams,
  title,
}) => {
  const dictionary = getDictionary(locale)
  const viewParam = Array.isArray(searchParams.view) ? searchParams.view[0] : searchParams.view
  const activeView = viewParam === '3' ? '3' : '4'
  const localizedSorting = sorting.map((item) => {
    if (item.slug === '-createdAt') return { ...item, title: dictionary.shop.latestArrivals }
    if (item.slug === priceField) return { ...item, title: dictionary.shop.priceLowToHigh }
    if (item.slug === `-${priceField}`) return { ...item, title: dictionary.shop.priceHighToLow }
    return { ...item, title: dictionary.shop.alphabetic }
  })
  const foundText =
    locale === 'ru'
      ? `Найдено ${products.totalDocs} товаров`
      : `Знайдено ${products.totalDocs} товарів`

  return (
    <div>
      <div className="mb-6 flex flex-col gap-4 border-b pb-4 md:flex-row md:items-center md:justify-between">
        <div>
          {title ? <h2 className="text-2xl font-semibold tracking-normal">{title}</h2> : null}
          <p className={cn('text-sm text-muted-foreground', title && 'mt-2')}>{foundText}</p>
        </div>
        <div className="flex flex-wrap items-center gap-3">
          <ShopSortSelect list={localizedSorting} />
          {mobileFilters}
          <ViewModeToggle activeView={activeView} />
        </div>
      </div>

      {products.docs.length ? (
        <Grid
          className={cn(
            'grid grid-cols-1 gap-5 sm:grid-cols-2',
            activeView === '3' ? 'xl:grid-cols-3' : 'lg:grid-cols-3 xl:grid-cols-4',
          )}
        >
          {products.docs.map((product) => (
            <ProductGridItem key={product.id} locale={locale} product={product} />
          ))}
        </Grid>
      ) : (
        <div className="rounded-xl border bg-card p-8 text-sm text-muted-foreground">
          {emptyMessage}
        </div>
      )}

      <ListingPagination
        currentPage={products.page || currentPage}
        locale={locale}
        pathname={pathname}
        searchParams={searchParams}
        totalPages={products.totalPages || 1}
      />
    </div>
  )
}
