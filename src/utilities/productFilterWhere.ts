import type { Where } from 'payload'
import type { ProductType, VariantOption, VariantType } from '@/payload-types'

export type ProductFilterSearchParams = {
  [key: string]: string | string[] | undefined
}

const valuesFromParam = (value: string | string[] | undefined) => {
  if (!value) return []
  return (Array.isArray(value) ? value : [value]).filter(Boolean)
}

const relationIDFromParam = (value: string) => {
  const numberValue = Number(value)

  return Number.isFinite(numberValue) ? numberValue : value
}

const getVariantType = (value: number | VariantType): VariantType | null =>
  typeof value === 'object' ? value : null

const getVariantOption = (value: number | VariantOption): VariantOption | null =>
  typeof value === 'object' ? value : null

const isVariantOption = (value: VariantOption | null): value is VariantOption => Boolean(value)

const getAllowedVariantOptionIDs = (productType?: ProductType | null) => {
  const axes = productType?.variantAxes?.filter((axis) => axis.showInFilters !== false) || []

  return new Set(
    axes.flatMap((axis) => {
      const variantType = getVariantType(axis.variantType)

      return (
        variantType?.options?.docs
          ?.map(getVariantOption)
          .filter(isVariantOption)
          .map((option) => String(option.id)) || []
      )
    }),
  )
}

const getAllowedAttributeNames = (productType?: ProductType | null) =>
  new Set(
    productType?.attributes
      ?.filter(
        (attribute) =>
          attribute.showInFilters !== false &&
          attribute.inputType === 'select' &&
          attribute.options?.length,
      )
      .map((attribute) => attribute.name) || [],
  )

export const getProductFilterWhere = (
  searchParams: ProductFilterSearchParams,
  productType?: ProductType | null,
): Where[] => {
  const allowedVariantOptionIDs = getAllowedVariantOptionIDs(productType)
  const allowedAttributeNames = getAllowedAttributeNames(productType)
  const variantOptionIDs = valuesFromParam(searchParams.variantOption).filter((optionID) =>
    allowedVariantOptionIDs.has(String(relationIDFromParam(optionID))),
  )
  const attributeEntries: Where[] = Object.entries(searchParams)
    .filter(([key]) => key.startsWith('attr.'))
    .flatMap(([key, value]) => {
      const name = key.replace(/^attr\./, '')
      const values = valuesFromParam(value)

      if (!name || !values.length || !allowedAttributeNames.has(name)) return []

      const where: Where = {
        and: [
          {
            'attributeValues.name': {
              equals: name,
            },
          } as Where,
          {
            'attributeValues.value': {
              in: values,
            },
          } as Where,
        ],
      }

      return [where]
    })

  const variantEntries: Where[] = variantOptionIDs.map((optionID) => ({
    availableVariantOptions: {
      contains: relationIDFromParam(optionID),
    },
  }))

  return [...variantEntries, ...attributeEntries]
}
