import { env } from '@/lib/env'
import type { DeliveryCity, DeliveryWarehouse } from '@/delivery/types'

const endpoint = 'https://api.novaposhta.ua/v2.0/json/'

const callNovaPoshta = async <T>({
  calledMethod,
  methodProperties,
  modelName = 'Address',
}: {
  calledMethod: string
  methodProperties: Record<string, unknown>
  modelName?: string
}): Promise<T[]> => {
  if (!env.novaPoshtaEnabled || !env.novaPoshtaAPIKey) return []

  const response = await fetch(endpoint, {
    body: JSON.stringify({
      apiKey: env.novaPoshtaAPIKey,
      calledMethod,
      methodProperties,
      modelName,
    }),
    headers: {
      'content-type': 'application/json',
    },
    method: 'POST',
    next: {
      revalidate: 60 * 60,
    },
  })

  if (!response.ok) return []

  const payload = (await response.json()) as {
    data?: T[]
    success?: boolean
  }

  if (!payload.success || !Array.isArray(payload.data)) return []

  return payload.data
}

type NovaPoshtaCity = {
  Description?: string
  DescriptionRu?: string
  Ref?: string
}

type NovaPoshtaWarehouse = {
  Description?: string
  DescriptionRu?: string
  Ref?: string
}

export const searchNovaPoshtaCities = async (query: string): Promise<DeliveryCity[]> => {
  const q = query.trim()
  if (q.length < 2) return []

  const cities = await callNovaPoshta<NovaPoshtaCity>({
    calledMethod: 'getCities',
    methodProperties: {
      FindByString: q,
      Limit: '20',
    },
  })

  return cities
    .filter((city) => city.Ref && city.Description)
    .map((city) => ({
      id: city.Ref!,
      label: city.Description!,
      provider: 'nova_poshta',
      raw: city,
    }))
}

export const searchNovaPoshtaWarehouses = async ({
  cityID,
  query,
}: {
  cityID: string
  query?: string
}): Promise<DeliveryWarehouse[]> => {
  if (!cityID) return []

  const warehouses = await callNovaPoshta<NovaPoshtaWarehouse>({
    calledMethod: 'getWarehouses',
    methodProperties: {
      CityRef: cityID,
      FindByString: query?.trim() || undefined,
      Limit: '50',
    },
  })

  return warehouses
    .filter((warehouse) => warehouse.Ref && warehouse.Description)
    .map((warehouse) => ({
      cityID,
      id: warehouse.Ref!,
      label: warehouse.Description!,
      provider: 'nova_poshta',
      raw: warehouse,
    }))
}
