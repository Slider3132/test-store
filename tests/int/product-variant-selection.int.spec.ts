import { describe, expect, it } from 'vitest'

import type { Product, Variant, VariantOption, VariantType } from '@/payload-types'
import {
  getDefaultAvailableVariant,
  getHydratedVariantTypes,
  getProductVariantHref,
  getSelectedOrDefaultVariant,
} from '@/components/product/variantSelection'

const colorType: VariantType = {
  id: 10,
  label: 'Color',
  name: 'color',
  updatedAt: '',
  createdAt: '',
}

const sizeType: VariantType = {
  id: 11,
  label: 'Size',
  name: 'size',
  updatedAt: '',
  createdAt: '',
}

const black: VariantOption = {
  id: 100,
  label: 'Black',
  value: 'black',
  variantType: colorType,
  updatedAt: '',
  createdAt: '',
}

const medium: VariantOption = {
  id: 101,
  label: 'M',
  value: 'm',
  variantType: sizeType,
  updatedAt: '',
  createdAt: '',
}

const small: VariantOption = {
  id: 102,
  label: 'S',
  value: 's',
  variantType: sizeType,
  updatedAt: '',
  createdAt: '',
}

const product = {
  id: 1,
  title: 'Variant product',
  slug: 'variant-product',
  enableVariants: true,
  variantTypes: [colorType, sizeType],
  variants: {
    docs: [
      {
        id: 201,
        product: 1,
        options: [black, small],
        inventory: 0,
        updatedAt: '',
        createdAt: '',
      },
      {
        id: 202,
        product: 1,
        options: [black, medium],
        inventory: 4,
        updatedAt: '',
        createdAt: '',
      },
    ] satisfies Variant[],
  },
} as Product

describe('product variant selection', () => {
  it('uses the first in-stock variant as the default', () => {
    expect(getDefaultAvailableVariant(product)?.id).toBe(202)
  })

  it('keeps an explicit selected variant from the URL', () => {
    const selected = getSelectedOrDefaultVariant(product, new URLSearchParams({ variant: '201' }))

    expect(selected?.id).toBe(201)
  })

  it('builds product hrefs with variant and option params for the default variant', () => {
    expect(getProductVariantHref(product, 'uk')).toBe(
      '/products/variant-product?color=100&size=101&variant=202',
    )
  })

  it('does not add query params for products without variants', () => {
    expect(
      getProductVariantHref(
        {
          id: 2,
          title: 'Simple product',
          slug: 'simple-product',
          enableVariants: false,
          updatedAt: '',
          createdAt: '',
        } as Product,
        'uk',
      ),
    ).toBe('/products/simple-product')
  })

  it('hydrates variant type options from variant docs', () => {
    const hydratedTypes = getHydratedVariantTypes({
      ...product,
      variantTypes: [10, 11],
    } as Product)

    expect(hydratedTypes.map((type) => type.name)).toEqual(['color', 'size'])
    expect(hydratedTypes[0].options?.docs?.map((option) => (typeof option === 'object' ? option.id : option))).toEqual([
      100,
    ])
    expect(hydratedTypes[1].options?.docs?.map((option) => (typeof option === 'object' ? option.id : option))).toEqual([
      102,
      101,
    ])
  })
})
