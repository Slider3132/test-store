import type { Product, Variant, VariantOption, VariantType } from '@/payload-types'
import { localizePath, type AppLocale } from '@/i18n/config'
import { createUrl } from '@/utilities/createUrl'

const isVariant = (variant: number | Variant | null | undefined): variant is Variant =>
  Boolean(variant && typeof variant === 'object')

const isVariantOption = (
  option: number | VariantOption | null | undefined,
): option is VariantOption => Boolean(option && typeof option === 'object')

const isVariantType = (type: number | VariantType | null | undefined): type is VariantType =>
  Boolean(type && typeof type === 'object')

export const getProductVariants = (product: Product | Partial<Product>): Variant[] =>
  product.variants?.docs?.filter(isVariant) || []

export const getDefaultAvailableVariant = (
  product: Product | Partial<Product>,
): Variant | undefined => {
  if (!product.enableVariants) return undefined

  const variants = getProductVariants(product)

  return variants.find((variant) => (variant.inventory || 0) > 0) || variants[0]
}

export const getSelectedOrDefaultVariant = (
  product: Product | Partial<Product>,
  searchParams: URLSearchParams,
): Variant | undefined => {
  if (!product.enableVariants) return undefined

  const variantID = searchParams.get('variant')
  const selectedVariant = getProductVariants(product).find(
    (variant) => String(variant.id) === variantID,
  )

  return selectedVariant || getDefaultAvailableVariant(product)
}

export const getVariantSearchParams = (
  product: Product | Partial<Product>,
  variant: Variant | undefined,
) => {
  const params = new URLSearchParams()

  if (!variant) return params

  const variantTypes = product.variantTypes?.filter(isVariantType) || []

  variant.options?.filter(isVariantOption).forEach((option) => {
    const variantType = isVariantType(option.variantType) ? option.variantType : undefined
    const typeName =
      variantType?.name ||
      variantTypes.find((type) =>
        type.options?.docs?.some((typeOption) => {
          if (typeof typeOption === 'object') return typeOption.id === option.id
          return typeOption === option.id
        }),
      )?.name

    if (typeName) params.set(typeName, String(option.id))
  })

  params.set('variant', String(variant.id))

  return params
}

export const getHydratedVariantTypes = (
  product: Product | Partial<Product>,
): VariantType[] => {
  const configuredTypeIDs = product.variantTypes?.map((type) =>
    typeof type === 'object' ? type.id : type,
  )
  const typeMap = new Map<number, VariantType>()
  const optionIDsByType = new Map<number, Set<number>>()
  const optionsByID = new Map<number, VariantOption>()

  getProductVariants(product).forEach((variant) => {
    variant.options?.filter(isVariantOption).forEach((option) => {
      const variantType = isVariantType(option.variantType) ? option.variantType : undefined

      if (!variantType) return

      typeMap.set(variantType.id, variantType)
      optionsByID.set(option.id, option)

      const optionIDs = optionIDsByType.get(variantType.id) || new Set<number>()
      optionIDs.add(option.id)
      optionIDsByType.set(variantType.id, optionIDs)
    })
  })

  const orderedTypeIDs =
    configuredTypeIDs?.length && configuredTypeIDs.some((id) => typeMap.has(Number(id)))
      ? configuredTypeIDs.map(Number).filter((id) => typeMap.has(id))
      : Array.from(typeMap.keys())

  return orderedTypeIDs.map((typeID) => {
    const type = typeMap.get(typeID)!
    const optionIDs = optionIDsByType.get(typeID) || new Set<number>()

    return {
      ...type,
      options: {
        ...(type.options || {}),
        docs: Array.from(optionIDs)
          .map((optionID) => optionsByID.get(optionID))
          .filter(isVariantOption),
      },
    }
  })
}

export const hydrateProductVariantTypes = <T extends Product | Partial<Product>>(product: T): T => {
  if (!product.enableVariants) return product

  return {
    ...product,
    variantTypes: getHydratedVariantTypes(product),
  }
}

export const getProductVariantHref = (
  product: Product | Partial<Product>,
  locale: AppLocale,
): string => {
  const slug = product.slug

  if (!slug) return localizePath('/catalog', locale)

  const href = localizePath(`/products/${slug}`, locale)
  const defaultVariant = getDefaultAvailableVariant(product)
  const params = getVariantSearchParams(product, defaultVariant)

  return createUrl(href, params)
}
