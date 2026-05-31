import { MobileProductFilters } from '@/components/layout/search/MobileProductFilters'
import { PriceFilter } from '@/components/layout/search/PriceFilter'
import type { AppLocale } from '@/i18n/config'
import { getDictionary } from '@/i18n/dictionary'
import type { ProductType } from '@/payload-types'
import React from 'react'
import { ProductListing, type ListingSearchParams } from '.'

type ProductListingDocs = React.ComponentProps<typeof ProductListing>['products']

type Props = {
  currentPage: number
  locale: AppLocale
  pathname: string
  productType?: ProductType | null
  products: ProductListingDocs
  searchParams: ListingSearchParams
  searchValue?: string
  title?: string
}

export const CatalogListingSection: React.FC<Props> = ({
  currentPage,
  locale,
  pathname,
  productType,
  products,
  searchParams,
  searchValue,
  title,
}) => {
  const dictionary = getDictionary(locale)
  const resultsText = products.totalDocs === 1 ? dictionary.shop.result : dictionary.shop.results

  return (
    <div className="grid items-start gap-6 lg:grid-cols-[290px_1fr]">
      <aside className="hidden lg:block">
        <PriceFilter productType={productType} />
      </aside>
      <div className="min-h-screen w-full">
        {searchValue ? (
          <p className="mb-4">
            {products.docs?.length === 0
              ? dictionary.shop.noSearchResults
              : dictionary.shop.showing
                  .replace('{{count}}', String(products.totalDocs))
                  .replace('{{resultsText}}', resultsText)}
            <span className="font-bold">&quot;{searchValue}&quot;</span>
          </p>
        ) : null}

        <ProductListing
          currentPage={currentPage}
          emptyMessage={dictionary.shop.noProducts}
          locale={locale}
          mobileFilters={<MobileProductFilters productType={productType} />}
          pathname={pathname}
          products={products}
          searchParams={searchParams}
          title={title}
        />
      </div>
    </div>
  )
}
