import type { AppLocale } from '@/i18n/config'
import { priceField } from '@/lib/currency'
import type { Category, ProductType } from '@/payload-types'
import {
  getCategoryAndDescendantIDs,
  getProductCategoryWhere,
} from '@/utilities/getCategoryDescendantIDs'
import {
  getProductFilterWhere,
  type ProductFilterSearchParams,
} from '@/utilities/productFilterWhere'
import type { DefaultDocumentIDType, Payload, SelectType } from 'payload'

export type CatalogListingSearchParams = ProductFilterSearchParams

const getRelationshipID = (value: unknown): DefaultDocumentIDType | undefined => {
  if (!value) return undefined
  if (typeof value === 'object' && 'id' in value) return value.id as DefaultDocumentIDType
  return value as DefaultDocumentIDType
}

const getRelationshipDoc = <T>(value: unknown): T | null =>
  value && typeof value === 'object' && 'id' in value ? (value as T) : null

export const getParam = (value: string | string[] | undefined) =>
  Array.isArray(value) ? value[0] : value

export const getListingPage = (searchParams: CatalogListingSearchParams) =>
  Math.max(1, Number(getParam(searchParams.page)) || 1)

export const resolveCategoryProductType = async ({
  category,
  locale,
  payload,
}: {
  category?: Category | null
  locale: AppLocale
  payload: Payload
}): Promise<ProductType | null> => {
  let currentCategory = category
  const visited = new Set<string>()

  while (currentCategory) {
    const productType = getRelationshipDoc<ProductType>(currentCategory.productType)

    if (productType) return productType

    const productTypeID = getRelationshipID(currentCategory.productType)

    if (productTypeID) {
      return (await payload.findByID({
        collection: 'productTypes' as any,
        depth: 2,
        id: productTypeID,
        locale,
        overrideAccess: true,
      })) as ProductType
    }

    const parentID = getRelationshipID(currentCategory.parent)

    if (!parentID || visited.has(String(parentID))) return null

    visited.add(String(parentID))
    currentCategory = (await payload.findByID({
      collection: 'categories',
      depth: 2,
      id: parentID,
      locale,
      overrideAccess: false,
    })) as Category
  }

  return null
}

export const productListingSelect = {
  availableVariantOptions: true,
  categories: true,
  compareAtPrice: true,
  currency: true,
  enableVariants: true,
  gallery: true,
  inventory: true,
  price: true,
  reviewSummary: true,
  slug: true,
  title: true,
  [priceField]: true,
} satisfies SelectType

export const getCatalogListingProducts = async ({
  categoryID,
  includeSearch = true,
  locale,
  payload,
  productType,
  searchParams,
}: {
  categoryID?: DefaultDocumentIDType
  includeSearch?: boolean
  locale: AppLocale
  payload: Payload
  productType?: ProductType | null
  searchParams: CatalogListingSearchParams
}) => {
  const page = getListingPage(searchParams)
  const selectedSearchValue = getParam(searchParams.q)
  const selectedSort = getParam(searchParams.sort)
  const selectedMinPrice = Number(getParam(searchParams.minPrice))
  const selectedMaxPrice = Number(getParam(searchParams.maxPrice))
  const selectedAvailability = getParam(searchParams.availability)
  const hasMinPrice = Number.isFinite(selectedMinPrice) && selectedMinPrice >= 0
  const hasMaxPrice = Number.isFinite(selectedMaxPrice) && selectedMaxPrice >= 0
  const categoryFilterIDs = categoryID
    ? await getCategoryAndDescendantIDs({
        categoryID,
        payload,
      })
    : []

  const products = await payload.find({
    collection: 'products',
    draft: false,
    limit: 24,
    locale,
    overrideAccess: false,
    page,
    select: productListingSelect,
    sort: selectedSort || 'title',
    where: {
      and: [
        {
          _status: {
            equals: 'published',
          },
        },
        ...(includeSearch && selectedSearchValue
          ? [
              {
                or: [
                  {
                    title: {
                      like: selectedSearchValue,
                    },
                  },
                  {
                    slug: {
                      like: selectedSearchValue,
                    },
                  },
                ],
              },
            ]
          : []),
        ...(categoryFilterIDs.length ? [getProductCategoryWhere(categoryFilterIDs)] : []),
        ...getProductFilterWhere(searchParams, productType),
        ...(hasMinPrice
          ? [
              {
                [priceField]: {
                  greater_than_equal: Math.round(selectedMinPrice * 100),
                },
              },
            ]
          : []),
        ...(hasMaxPrice
          ? [
              {
                [priceField]: {
                  less_than_equal: Math.round(selectedMaxPrice * 100),
                },
              },
            ]
          : []),
        ...(selectedAvailability === 'in'
          ? [
              {
                inventory: {
                  greater_than: 0,
                },
              },
            ]
          : []),
        ...(selectedAvailability === 'out'
          ? [
              {
                inventory: {
                  less_than_equal: 0,
                },
              },
            ]
          : []),
      ],
    },
  })

  return {
    page,
    products,
    searchValue: selectedSearchValue,
  }
}
