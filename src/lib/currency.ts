import type { CurrenciesConfig, Currency } from '@payloadcms/plugin-ecommerce/types'

export const UAH: Currency = {
  code: 'UAH',
  decimals: 2,
  label: 'Ukrainian Hryvnia',
  symbol: '₴',
}

export const currenciesConfig: CurrenciesConfig = {
  defaultCurrency: UAH.code,
  supportedCurrencies: [UAH],
}

export const priceField = 'priceInUAH'
export const priceEnabledField = 'priceInUAHEnabled'

export const toBaseCurrencyAmount = (price: unknown) => {
  if (typeof price !== 'number' || Number.isNaN(price)) return undefined

  return Math.round(price * 100)
}

export const fromBaseCurrencyAmount = (price: unknown) => {
  if (typeof price !== 'number' || Number.isNaN(price)) return undefined

  return price / 100
}
