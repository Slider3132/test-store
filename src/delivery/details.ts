import type { DeliveryDetails, DeliveryMethod, DeliverySettings } from '@/delivery/types'

const deliveryMethods: DeliveryMethod[] = ['pickup', 'nova_poshta', 'ukrposhta']

const asString = (value: unknown) => (typeof value === 'string' ? value : undefined)
const asNumber = (value: unknown) => (typeof value === 'number' && Number.isFinite(value) ? value : undefined)
const asBoolean = (value: unknown) => (typeof value === 'boolean' ? value : undefined)

export const normalizeDeliveryDetails = (value: unknown): DeliveryDetails | undefined => {
  if (!value || typeof value !== 'object') return undefined

  const source = value as Record<string, unknown>
  const provider = asString(source.provider)

  if (provider && !deliveryMethods.includes(provider as DeliveryMethod)) return undefined

  return {
    cityID: asString(source.cityID) || null,
    cityLabel: asString(source.cityLabel) || null,
    freeShipping: asBoolean(source.freeShipping) ?? null,
    notes: asString(source.notes) || null,
    price: asNumber(source.price) ?? null,
    provider: (provider as DeliveryMethod | undefined) || null,
    recipientName: asString(source.recipientName) || null,
    recipientPhone: asString(source.recipientPhone) || null,
    trackingNumber: asString(source.trackingNumber) || null,
    warehouseID: asString(source.warehouseID) || null,
    warehouseLabel: asString(source.warehouseLabel) || null,
  }
}

export const extractDeliveryDetails = (value: unknown): DeliveryDetails | undefined => {
  if (!value || typeof value !== 'object') return undefined

  const source = value as Record<string, unknown>

  return (
    normalizeDeliveryDetails(source.deliveryDetails) ||
    normalizeDeliveryDetails(source.deliverySelection) ||
    normalizeDeliveryDetails(source)
  )
}

export const validateDeliveryDetails = (
  value: unknown,
  settings: DeliverySettings,
): DeliveryDetails => {
  const details = extractDeliveryDetails(value)

  if (!details?.provider) {
    throw new Error('Delivery details are required.')
  }

  const method = settings.methods[details.provider]

  if (!method?.enabled) {
    throw new Error('Selected delivery method is disabled.')
  }

  if (method.requiresCity && (!details.cityID || !details.cityLabel)) {
    throw new Error('Delivery city is required.')
  }

  if (method.requiresWarehouse && (!details.warehouseID || !details.warehouseLabel)) {
    throw new Error('Delivery warehouse is required.')
  }

  return {
    ...details,
    freeShipping: null,
    price: null,
  }
}

export const syncOrderTrackingFields = <T extends Record<string, unknown>>(data: T): T => {
  const deliveryDetails =
    data.deliveryDetails && typeof data.deliveryDetails === 'object'
      ? { ...(data.deliveryDetails as Record<string, unknown>) }
      : undefined
  const trackingNumber = asString(data.trackingNumber) || asString(deliveryDetails?.trackingNumber)

  if (!trackingNumber) return data

  return {
    ...data,
    deliveryDetails: {
      ...(deliveryDetails || {}),
      trackingNumber,
    },
    trackingNumber,
  }
}
