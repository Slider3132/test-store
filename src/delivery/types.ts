export type DeliveryMethod = 'pickup' | 'nova_poshta' | 'ukrposhta'

export type DeliveryProvider = Exclude<DeliveryMethod, 'pickup'>

export type DeliveryCity = {
  id: string
  label: string
  provider: DeliveryProvider
  raw?: unknown
}

export type DeliveryWarehouse = {
  cityID?: string
  id: string
  label: string
  provider: DeliveryProvider
  raw?: unknown
}

export type DeliveryDetails = {
  provider?: DeliveryMethod | null
  cityID?: string | null
  cityLabel?: string | null
  warehouseID?: string | null
  warehouseLabel?: string | null
  recipientName?: string | null
  recipientPhone?: string | null
  price?: number | null
  freeShipping?: boolean | null
  trackingNumber?: string | null
  notes?: string | null
}

export type DeliveryMethodSettings = {
  enabled: boolean
  requiresCity: boolean
  requiresWarehouse: boolean
}

export type DeliverySettings = {
  fixedShippingPrice: number | null
  freeShippingFrom: number | null
  methods: Record<DeliveryMethod, DeliveryMethodSettings>
  pickupInstructions?: string | null
}

export type DeliverySelection = {
  cityID?: string
  cityLabel?: string
  method: DeliveryMethod
  warehouseID?: string
  warehouseLabel?: string
}

export type DeliveryAPIStatus = 'ok' | 'disabled' | 'empty' | 'error'

export type DeliveryAPIResponse<T> = {
  data: T
  message?: string
  status: DeliveryAPIStatus
}
