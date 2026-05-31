import React, { useState } from 'react'
import { cleanup, fireEvent, render, screen, waitFor, within } from '@testing-library/react'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'

import { DeliverySelector, type DeliverySelection } from '@/components/checkout/DeliverySelector'

vi.mock('@/i18n/client', () => ({
  useDictionary: () => ({
    checkout: {
      city: 'City',
      delivery: 'Delivery',
      deliveryCityPlaceholder: 'Search city',
      deliveryMethod: 'Delivery method',
      deliveryUnavailable: 'Delivery is unavailable.',
      deliveryWarehousePlaceholder: 'Search warehouse',
      novaPoshta: 'Nova Poshta',
      pickup: 'Pickup',
      selectCity: 'Select city',
      selectWarehouse: 'Select warehouse',
      ukrposhta: 'Ukrposhta',
      warehouse: 'Warehouse',
    },
    common: {
      loading: 'Loading...',
    },
  }),
}))

const renderControlled = (onChange = vi.fn()) => {
  const Component = () => {
    const [value, setValue] = useState<DeliverySelection | null>(null)

    return (
      <DeliverySelector
        value={value}
        onChange={(nextValue) => {
          setValue(nextValue)
          onChange(nextValue)
        }}
      />
    )
  }

  const view = render(<Component />)

  return { onChange, ...view }
}

describe('DeliverySelector', () => {
  beforeEach(() => {
    vi.restoreAllMocks()
    vi.unstubAllGlobals()
  })

  afterEach(() => {
    cleanup()
  })

  it('loads settings, then selects a provider city and warehouse through delivery endpoints', async () => {
    const fetchMock = vi.fn(async (input: RequestInfo | URL) => {
      const url = String(input)

      if (url === '/next/delivery/settings') {
        return Response.json({
          fixedShippingPrice: 75,
          freeShippingFrom: 1500,
          methods: {
            nova_poshta: {
              enabled: true,
              requiresCity: true,
              requiresWarehouse: true,
            },
            pickup: {
              enabled: false,
              requiresCity: false,
              requiresWarehouse: false,
            },
          },
        })
      }

      if (url.startsWith('/next/delivery/nova-poshta/cities?')) {
        expect(new URL(url, 'https://shop.example').searchParams.get('q')).toBe('Ки')
        return Response.json({
          cities: [{ id: 'city-1', label: 'Київ', provider: 'nova_poshta' }],
        })
      }

      if (url.startsWith('/next/delivery/nova-poshta/warehouses?')) {
        const searchParams = new URL(url, 'https://shop.example').searchParams
        expect(searchParams.get('cityID')).toBe('city-1')
        expect(searchParams.get('q')).toBe('1')
        return Response.json({
          warehouses: [
            {
              cityID: 'city-1',
              id: 'warehouse-1',
              label: 'Відділення 1',
              provider: 'nova_poshta',
            },
          ],
        })
      }

      throw new Error(`Unexpected fetch ${url}`)
    })
    vi.stubGlobal('fetch', fetchMock)

    const { onChange } = renderControlled()

    fireEvent.click(await screen.findByRole('button', { name: 'Nova Poshta' }))
    fireEvent.change(screen.getByLabelText('City'), { target: { value: 'Ки' } })
    fireEvent.click(await screen.findByRole('button', { name: 'Київ' }))
    fireEvent.change(screen.getByLabelText('Warehouse'), { target: { value: '1' } })
    fireEvent.click(await screen.findByRole('button', { name: 'Відділення 1' }))

    await waitFor(() => {
      expect(onChange).toHaveBeenLastCalledWith(
        expect.objectContaining({
          cityID: 'city-1',
          cityLabel: 'Київ',
          provider: 'nova_poshta',
          price: 75,
          warehouseID: 'warehouse-1',
          warehouseLabel: 'Відділення 1',
        }),
      )
    })
    expect(fetchMock).toHaveBeenCalledWith('/next/delivery/settings', expect.any(Object))
    expect(fetchMock).toHaveBeenCalledWith(
      expect.stringMatching(/^\/next\/delivery\/nova-poshta\/cities\?/),
      expect.any(Object),
    )
    expect(fetchMock).toHaveBeenCalledWith(
      expect.stringMatching(/^\/next\/delivery\/nova-poshta\/warehouses\?/),
      expect.any(Object),
    )
  })

  it('supports pickup when it is the enabled method', async () => {
    vi.stubGlobal(
      'fetch',
      vi.fn(async () =>
        Response.json({
          methods: [{ enabled: true, label: 'Store pickup', method: 'pickup', requiresWarehouse: false }],
        }),
      ),
    )

    const { onChange } = renderControlled()

    const deliveryRegion = await screen.findByRole('group', { name: 'Delivery method' })
    fireEvent.click(within(deliveryRegion).getByRole('button', { name: 'Store pickup' }))

    expect(onChange).toHaveBeenLastCalledWith(
      expect.objectContaining({
        provider: 'pickup',
      }),
    )
  })
})
