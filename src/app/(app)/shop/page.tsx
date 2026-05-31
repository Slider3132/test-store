import { CatalogListingSection } from '@/components/ProductListing/CatalogListingSection'
import configPromise from '@payload-config'
import { getPayload } from 'payload'
import { getRequestLocale } from '@/i18n/request'
import { getDictionary } from '@/i18n/dictionary'
import type { Metadata } from 'next'
import {
  getCatalogListingProducts,
  getParam,
  resolveCategoryProductType,
  type CatalogListingSearchParams,
} from '@/utilities/catalogListing'
import { sanitizeProductSort } from '@/utilities/sanitizeProductSort'

export async function generateMetadata(): Promise<Metadata> {
  const locale = await getRequestLocale()
  const dictionary = getDictionary(locale)

  return {
    description: dictionary.shop.searchDescription,
    title: dictionary.shop.shop,
  }
}

type SearchParams = CatalogListingSearchParams

type Props = {
  searchParams: Promise<SearchParams>
}

export default async function ShopPage({ searchParams }: Props) {
  const locale = await getRequestLocale()
  const searchParamsData = await searchParams
  const sanitizedSearchParamsData: SearchParams = {
    ...searchParamsData,
    sort: sanitizeProductSort(searchParamsData.sort),
  }
  const { category } = sanitizedSearchParamsData
  const payload = await getPayload({ config: configPromise })
  const selectedCategory = getParam(category)
  const selectedCategoryID = selectedCategory ? Number(selectedCategory) : undefined
  const selectedCategoryLookupID =
    typeof selectedCategoryID === 'number' && Number.isFinite(selectedCategoryID)
      ? selectedCategoryID
      : selectedCategory
  const selectedCategoryDoc = selectedCategory
    ? await payload.findByID({
        collection: 'categories',
        depth: 2,
        id: selectedCategoryLookupID!,
        locale,
      })
    : null
  const productType = await resolveCategoryProductType({
    category: selectedCategoryDoc,
    locale,
    payload,
  })
  const { page, products, searchValue } = await getCatalogListingProducts({
    categoryID:
      typeof selectedCategoryID === 'number' && Number.isFinite(selectedCategoryID)
        ? selectedCategoryID
        : undefined,
    locale,
    payload,
    productType,
    searchParams: sanitizedSearchParamsData,
  })

  return (
    <CatalogListingSection
      currentPage={page}
      locale={locale}
      pathname={locale === 'ru' ? '/ru/shop' : '/shop'}
      productType={productType}
      products={products}
      searchParams={sanitizedSearchParamsData}
      searchValue={searchValue}
    />
  )
}
