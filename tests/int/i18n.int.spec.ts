import { describe, expect, it } from 'vitest'

import { localizePath } from '@/i18n/config'

describe('localizePath', () => {
  it('keeps Ukrainian routes unprefixed', () => {
    expect(localizePath('/shop', 'uk')).toBe('/shop')
    expect(localizePath('/products/hat', 'uk')).toBe('/products/hat')
  })

  it('prefixes Russian storefront routes', () => {
    expect(localizePath('/shop', 'ru')).toBe('/ru/shop')
    expect(localizePath('/products/hat', 'ru')).toBe('/ru/products/hat')
  })

  it('does not prefix admin or API routes', () => {
    expect(localizePath('/admin', 'ru')).toBe('/admin')
    expect(localizePath('/api/products', 'ru')).toBe('/api/products')
  })
})
