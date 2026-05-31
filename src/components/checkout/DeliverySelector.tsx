'use client'

import React, { useEffect, useMemo, useState } from 'react'

import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { useDictionary } from '@/i18n/client'
import { cn } from '@/utilities/cn'

export type DeliveryProvider = 'pickup' | 'nova_poshta' | 'ukrposhta'

export type DeliverySelection = {
  provider: DeliveryProvider
  cityID?: string | null
  cityLabel?: string | null
  warehouseID?: string | null
  warehouseLabel?: string | null
  price?: number | null
  freeShipping?: boolean | null
}

type DeliveryMethodSettings = {
  enabled: boolean
  label?: string
  method: DeliveryProvider
  requiresCity?: boolean
  requiresWarehouse: boolean
}

type DeliverySettings = {
  fixedShippingPrice?: number | null
  freeShippingFrom?: number | null
  methods: DeliveryMethodSettings[]
  pickupInstructions?: string | null
}

type DeliveryOption = {
  id: string
  label: string
  provider: Exclude<DeliveryProvider, 'pickup'>
  cityID?: string
}

type Props = {
  cartSubtotal?: number | null
  className?: string
  disabled?: boolean
  onChange: (selection: DeliverySelection | null) => void
  value: DeliverySelection | null
}

const providerPath: Record<Exclude<DeliveryProvider, 'pickup'>, string> = {
  nova_poshta: 'nova-poshta',
  ukrposhta: 'ukrposhta',
}

const providerOrder: DeliveryProvider[] = ['nova_poshta', 'ukrposhta', 'pickup']

const extractOptions = (payload: unknown, key: 'cities' | 'warehouses'): DeliveryOption[] => {
  if (!payload || typeof payload !== 'object') return []

  const source = payload as Record<string, unknown>
  const value = source[key] || source.data

  return Array.isArray(value) ? (value as DeliveryOption[]) : []
}

const normalizeSettings = (payload: unknown): DeliverySettings => {
  if (!payload || typeof payload !== 'object') {
    return { methods: [] }
  }

  const envelope = payload as Record<string, unknown>
  const source =
    envelope.data && typeof envelope.data === 'object'
      ? (envelope.data as Record<string, unknown>)
      : envelope
  const rawMethods = source.methods
  const methods = Array.isArray(rawMethods)
    ? rawMethods
    : rawMethods && typeof rawMethods === 'object'
      ? Object.entries(rawMethods as Record<string, Record<string, unknown>>).map(([method, settings]) => ({
          ...settings,
          method,
        }))
      : []

  return {
    fixedShippingPrice:
      typeof source.fixedShippingPrice === 'number' ? source.fixedShippingPrice : null,
    freeShippingFrom: typeof source.freeShippingFrom === 'number' ? source.freeShippingFrom : null,
    methods: methods
      .map((method) => {
        if (!method || typeof method !== 'object') return null

        const settings = method as Record<string, unknown>
        const methodName = settings.method

        if (!providerOrder.includes(methodName as DeliveryProvider)) return null

        return {
          enabled: settings.enabled === true,
          label: typeof settings.label === 'string' ? settings.label : undefined,
          method: methodName as DeliveryProvider,
          requiresCity:
            typeof settings.requiresCity === 'boolean'
              ? settings.requiresCity
              : methodName !== 'pickup',
          requiresWarehouse: settings.requiresWarehouse === true,
        }
      })
      .filter(Boolean)
      .sort(
        (left, right) =>
          providerOrder.indexOf(left!.method) - providerOrder.indexOf(right!.method),
      ) as DeliveryMethodSettings[],
    pickupInstructions:
      typeof source.pickupInstructions === 'string' ? source.pickupInstructions : null,
  }
}

export const isDeliverySelectionValid = (
  selection: DeliverySelection | null,
  settings?: DeliverySettings | null,
) => {
  if (!selection?.provider) return false

  const method = settings?.methods.find((item) => item.method === selection.provider)

  if (settings && (!method || !method.enabled)) return false
  if (method?.requiresCity && !selection.cityID) return false
  if (method?.requiresWarehouse && !selection.warehouseID) return false

  return selection.provider === 'pickup' || Boolean(selection.cityID || !method?.requiresCity)
}

export const DeliverySelector: React.FC<Props> = ({
  cartSubtotal,
  className,
  disabled,
  onChange,
  value,
}) => {
  const dictionary = useDictionary()
  const [settings, setSettings] = useState<DeliverySettings | null>(null)
  const [isLoadingSettings, setIsLoadingSettings] = useState(true)
  const [cityQuery, setCityQuery] = useState('')
  const [warehouseQuery, setWarehouseQuery] = useState('')
  const [cities, setCities] = useState<DeliveryOption[]>([])
  const [warehouses, setWarehouses] = useState<DeliveryOption[]>([])

  const enabledMethods = useMemo(
    () => settings?.methods.filter((method) => method.enabled) || [],
    [settings],
  )
  const selectedMethod = enabledMethods.find((method) => method.method === value?.provider)
  const shippingPrice =
    settings?.freeShippingFrom && cartSubtotal && cartSubtotal >= settings.freeShippingFrom
      ? 0
      : settings?.fixedShippingPrice ?? null

  useEffect(() => {
    const controller = new AbortController()

    const loadSettings = async () => {
      try {
        const response = await fetch('/next/delivery/settings', {
          signal: controller.signal,
        })
        const payload = await response.json()
        setSettings(normalizeSettings(payload))
      } catch (error) {
        if (!controller.signal.aborted) {
          setSettings({ methods: [] })
        }
      } finally {
        if (!controller.signal.aborted) {
          setIsLoadingSettings(false)
        }
      }
    }

    void loadSettings()

    return () => controller.abort()
  }, [])

  useEffect(() => {
    const provider = value?.provider

    if (!provider || provider === 'pickup' || cityQuery.trim().length < 2) {
      setCities([])
      return
    }

    const controller = new AbortController()
    const searchParams = new URLSearchParams({ q: cityQuery.trim() })

    const loadCities = async () => {
      try {
        const response = await fetch(`/next/delivery/${providerPath[provider]}/cities?${searchParams}`, {
          signal: controller.signal,
        })
        const payload = await response.json()
        setCities(extractOptions(payload, 'cities'))
      } catch (error) {
        if (!controller.signal.aborted) {
          setCities([])
        }
      }
    }

    void loadCities()

    return () => controller.abort()
  }, [cityQuery, value?.provider])

  useEffect(() => {
    const provider = value?.provider

    if (!provider || provider === 'pickup' || !value?.cityID || !selectedMethod?.requiresWarehouse) {
      setWarehouses([])
      return
    }

    const controller = new AbortController()
    const searchParams = new URLSearchParams({ cityID: value.cityID })
    if (warehouseQuery.trim()) searchParams.set('q', warehouseQuery.trim())

    const loadWarehouses = async () => {
      try {
        const response = await fetch(
          `/next/delivery/${providerPath[provider]}/warehouses?${searchParams}`,
          {
            signal: controller.signal,
          },
        )
        const payload = await response.json()
        setWarehouses(extractOptions(payload, 'warehouses'))
      } catch (error) {
        if (!controller.signal.aborted) {
          setWarehouses([])
        }
      }
    }

    void loadWarehouses()

    return () => controller.abort()
  }, [selectedMethod?.requiresWarehouse, value?.cityID, value?.provider, warehouseQuery])

  const getMethodLabel = (method: DeliveryMethodSettings) => {
    if (method.label) return method.label
    if (method.method === 'pickup') return dictionary.checkout.pickup || 'Pickup'
    if (method.method === 'nova_poshta') return dictionary.checkout.novaPoshta || 'Nova Poshta'
    return dictionary.checkout.ukrposhta || 'Ukrposhta'
  }

  const selectMethod = (method: DeliveryMethodSettings) => {
    const freeShipping = shippingPrice === 0
    onChange({
      freeShipping,
      price: shippingPrice,
      provider: method.method,
    })
    setCityQuery('')
    setWarehouseQuery('')
    setCities([])
    setWarehouses([])
  }

  const selectCity = (city: DeliveryOption) => {
    if (!value?.provider) return

    onChange({
      ...value,
      cityID: city.id,
      cityLabel: city.label,
      warehouseID: null,
      warehouseLabel: null,
    })
    setCityQuery(city.label)
    setWarehouseQuery('')
    setCities([])
    setWarehouses([])
  }

  const selectWarehouse = (warehouse: DeliveryOption) => {
    if (!value?.provider) return

    onChange({
      ...value,
      warehouseID: warehouse.id,
      warehouseLabel: warehouse.label,
    })
    setWarehouseQuery(warehouse.label)
    setWarehouses([])
  }

  if (isLoadingSettings) {
    return (
      <section className={cn('flex flex-col gap-3', className)}>
        <h2 className="font-medium text-3xl">{dictionary.checkout.delivery}</h2>
        <p className="text-muted-foreground">{dictionary.common.loading}</p>
      </section>
    )
  }

  if (!enabledMethods.length) {
    return (
      <section className={cn('flex flex-col gap-3', className)}>
        <h2 className="font-medium text-3xl">{dictionary.checkout.delivery}</h2>
        <p className="text-muted-foreground">{dictionary.checkout.deliveryUnavailable}</p>
      </section>
    )
  }

  return (
    <section className={cn('flex flex-col gap-5', className)}>
      <h2 className="font-medium text-3xl">{dictionary.checkout.delivery}</h2>

      <div aria-label={dictionary.checkout.deliveryMethod} className="flex flex-wrap gap-3" role="group">
        {enabledMethods.map((method) => {
          const isSelected = value?.provider === method.method

          return (
            <Button
              aria-pressed={isSelected}
              disabled={disabled}
              key={method.method}
              onClick={(event) => {
                event.preventDefault()
                selectMethod(method)
              }}
              type="button"
              variant={isSelected ? 'default' : 'outline'}
            >
              {getMethodLabel(method)}
            </Button>
          )
        })}
      </div>

      {value?.provider && value.provider !== 'pickup' && selectedMethod?.requiresCity && (
        <div className="flex flex-col gap-3">
          <div>
            <Label htmlFor="delivery-city">{dictionary.checkout.city}</Label>
            <Input
              disabled={disabled}
              id="delivery-city"
              onChange={(event) => {
                setCityQuery(event.target.value)
                onChange({
                  ...value,
                  cityID: null,
                  cityLabel: null,
                  warehouseID: null,
                  warehouseLabel: null,
                })
              }}
              placeholder={dictionary.checkout.deliveryCityPlaceholder}
              type="search"
              value={cityQuery}
            />
          </div>

          {cities.length > 0 && (
            <div aria-label={dictionary.checkout.selectCity} className="flex flex-col gap-2" role="listbox">
              {cities.map((city) => (
                <Button
                  className="justify-start"
                  disabled={disabled}
                  key={city.id}
                  onClick={(event) => {
                    event.preventDefault()
                    selectCity(city)
                  }}
                  type="button"
                  variant="outline"
                >
                  {city.label}
                </Button>
              ))}
            </div>
          )}
        </div>
      )}

      {value?.provider &&
        value.provider !== 'pickup' &&
        selectedMethod?.requiresWarehouse &&
        value.cityID && (
          <div className="flex flex-col gap-3">
            <div>
              <Label htmlFor="delivery-warehouse">{dictionary.checkout.warehouse}</Label>
              <Input
                disabled={disabled}
                id="delivery-warehouse"
                onChange={(event) => {
                  setWarehouseQuery(event.target.value)
                  onChange({
                    ...value,
                    warehouseID: null,
                    warehouseLabel: null,
                  })
                }}
                placeholder={dictionary.checkout.deliveryWarehousePlaceholder}
                type="search"
                value={warehouseQuery}
              />
            </div>

            {warehouses.length > 0 && (
              <div
                aria-label={dictionary.checkout.selectWarehouse}
                className="flex flex-col gap-2"
                role="listbox"
              >
                {warehouses.map((warehouse) => (
                  <Button
                    className="justify-start"
                    disabled={disabled}
                    key={warehouse.id}
                    onClick={(event) => {
                      event.preventDefault()
                      selectWarehouse(warehouse)
                    }}
                    type="button"
                    variant="outline"
                  >
                    {warehouse.label}
                  </Button>
                ))}
              </div>
            )}
          </div>
        )}

      {value?.provider === 'pickup' && settings?.pickupInstructions ? (
        <p className="text-muted-foreground">{settings.pickupInstructions}</p>
      ) : null}
    </section>
  )
}
