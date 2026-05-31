import { describe, expect, it } from 'vitest'

import { getDictionary } from '@/i18n/dictionary'

describe('getDictionary', () => {
  it('returns Ukrainian storefront copy by default', () => {
    expect(getDictionary('uk').cart.title).toBe('Кошик')
    expect(getDictionary('uk').common.checkout).toBe('Оформити замовлення')
  })

  it('returns Russian storefront copy for ru', () => {
    expect(getDictionary('ru').cart.title).toBe('Корзина')
    expect(getDictionary('ru').common.checkout).toBe('Оформить заказ')
  })
})
