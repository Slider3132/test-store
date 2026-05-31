import type { CollectionAfterReadHook, CollectionBeforeChangeHook } from 'payload'

import {
  fromBaseCurrencyAmount,
  priceEnabledField,
  priceField,
  toBaseCurrencyAmount,
  UAH,
} from '@/lib/currency'

export const syncPriceBeforeChange: CollectionBeforeChangeHook = ({ data }) => {
  if (!data) return data

  data.currency = UAH.code

  const basePrice = toBaseCurrencyAmount(data.price)
  if (typeof basePrice === 'number') {
    data[priceEnabledField] = true
    data[priceField] = basePrice
  } else if (typeof data[priceField] === 'number') {
    data.price = fromBaseCurrencyAmount(data[priceField])
    data[priceEnabledField] = true
  }

  return data
}

export const syncPriceAfterRead: CollectionAfterReadHook = ({ doc }) => {
  if (!doc) return doc

  doc.currency = doc.currency || UAH.code

  if (typeof doc.price !== 'number') {
    const price = fromBaseCurrencyAmount(doc[priceField])
    if (typeof price === 'number') {
      doc.price = price
    }
  }

  return doc
}
