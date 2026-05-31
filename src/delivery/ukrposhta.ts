import { env } from '@/lib/env'
import type { DeliveryCity, DeliveryWarehouse } from '@/delivery/types'

const buildURL = (path: string, searchParams: Record<string, string>) => {
  const url = new URL(path, env.ukrposhtaAPIBaseURL)

  Object.entries(searchParams).forEach(([key, value]) => {
    if (value) url.searchParams.set(key, value)
  })

  return url
}

const fetchUkrposhta = async <T>(url: URL): Promise<T[]> => {
  if (!env.ukrposhtaEnabled) return []

  const response = await fetch(url, {
    headers: {
      ...(env.ukrposhtaBearerToken
        ? {
            Authorization: `Bearer ${env.ukrposhtaBearerToken}`,
          }
        : {}),
    },
    next: {
      revalidate: 60 * 60,
    },
  })

  if (!response.ok) return []

  const payload = await response.json()

  if (Array.isArray(payload)) return payload as T[]
  if (Array.isArray(payload?.data)) return payload.data as T[]
  if (Array.isArray(payload?.entries)) return payload.entries as T[]

  return []
}

type UkrposhtaCity = {
  CITY_ID?: string | number
  CITY_UA?: string
  ID?: string | number
  NAME_UA?: string
  POSTCODE?: string
}

type UkrposhtaOffice = {
  CITY_ID?: string | number
  ID?: string | number
  NAME_UA?: string
  POSTCODE?: string
  STREET_UA?: string
}

export const searchUkrposhtaCities = async (query: string): Promise<DeliveryCity[]> => {
  const q = query.trim()
  if (q.length < 2) return []

  const url = buildURL('/address-classifier-ws/get_city_by_region_id_and_district_id_and_city_ua', {
    city_ua: q,
  })
  const cities = await fetchUkrposhta<UkrposhtaCity>(url)

  return cities
    .map((city) => {
      const id = city.CITY_ID || city.ID || city.POSTCODE
      const label = city.CITY_UA || city.NAME_UA

      if (!id || !label) return null

      return {
        id: String(id),
        label,
        provider: 'ukrposhta' as const,
        raw: city,
      }
    })
    .filter(Boolean) as DeliveryCity[]
}

export const searchUkrposhtaWarehouses = async ({
  cityID,
  query,
}: {
  cityID: string
  query?: string
}): Promise<DeliveryWarehouse[]> => {
  if (!cityID) return []

  const url = buildURL('/address-classifier-ws/get_postoffices_by_city_id', {
    city_id: cityID,
  })
  const offices = await fetchUkrposhta<UkrposhtaOffice>(url)
  const normalizedQuery = query?.trim().toLocaleLowerCase('uk') || ''

  return offices
    .map((office) => {
      const id = office.ID || office.POSTCODE
      const label = [office.POSTCODE, office.NAME_UA, office.STREET_UA].filter(Boolean).join(' - ')

      if (!id || !label) return null
      if (normalizedQuery && !label.toLocaleLowerCase('uk').includes(normalizedQuery)) return null

      return {
        cityID,
        id: String(id),
        label,
        provider: 'ukrposhta' as const,
        raw: office,
      }
    })
    .filter(Boolean) as DeliveryWarehouse[]
}
