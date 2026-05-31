import { afterEach, describe, expect, it, vi } from 'vitest'

describe('delivery integrations', () => {
  afterEach(() => {
    vi.restoreAllMocks()
    vi.unstubAllEnvs()
    vi.resetModules()
  })

  it('does not call Nova Poshta when integration is disabled or missing a key', async () => {
    vi.stubEnv('NOVA_POSHTA_ENABLED', 'false')
    const fetchSpy = vi.spyOn(globalThis, 'fetch')

    const { searchNovaPoshtaCities } = await import('@/delivery/novaPoshta')

    await expect(searchNovaPoshtaCities('Київ')).resolves.toEqual([])
    expect(fetchSpy).not.toHaveBeenCalled()
  })

  it('does not call Ukrposhta when integration is disabled', async () => {
    vi.stubEnv('UKRPOSHTA_ENABLED', 'false')
    const fetchSpy = vi.spyOn(globalThis, 'fetch')

    const { searchUkrposhtaCities } = await import('@/delivery/ukrposhta')

    await expect(searchUkrposhtaCities('Київ')).resolves.toEqual([])
    expect(fetchSpy).not.toHaveBeenCalled()
  })

  it('returns client-safe delivery settings merged from env and admin settings', async () => {
    vi.stubEnv('NOVA_POSHTA_ENABLED', 'true')
    vi.stubEnv('NOVA_POSHTA_API_KEY', 'np-secret')
    vi.stubEnv('UKRPOSHTA_ENABLED', 'true')
    vi.stubEnv('UKRPOSHTA_BEARER_TOKEN', '')

    const { resolveDeliverySettings } = await import('@/delivery/settings')

    const settings = await resolveDeliverySettings({
      payload: {
        findGlobal: vi.fn(async () => ({
          delivery: {
            fixedShippingPrice: 75,
            freeShippingFrom: 1500,
            novaPoshtaEnabled: true,
            pickupEnabled: false,
            ukrposhtaEnabled: true,
          },
        })),
      },
    })

    expect(settings).toEqual({
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
        ukrposhta: {
          enabled: false,
          requiresCity: true,
          requiresWarehouse: true,
        },
      },
    })
    expect(JSON.stringify(settings)).not.toContain('np-secret')
  })

  it('returns disabled route responses without calling provider APIs', async () => {
    vi.stubEnv('NOVA_POSHTA_ENABLED', 'true')
    vi.stubEnv('NOVA_POSHTA_API_KEY', '')
    const fetchSpy = vi.spyOn(globalThis, 'fetch')

    const { GET } = await import('@/app/(app)/next/delivery/nova-poshta/cities/route')

    const response = await GET(
      new Request('https://example.test/next/delivery/nova-poshta/cities?q=Київ') as never,
    )

    await expect(response.json()).resolves.toEqual({
      data: [],
      message: 'Nova Poshta delivery is disabled.',
      status: 'disabled',
    })
    expect(fetchSpy).not.toHaveBeenCalled()
  })

  it('returns settings route responses without requiring Payload or leaking secrets', async () => {
    vi.stubEnv('DATABASE_URL', '')
    vi.stubEnv('NOVA_POSHTA_ENABLED', 'true')
    vi.stubEnv('NOVA_POSHTA_API_KEY', 'np-secret')
    vi.stubEnv('UKRPOSHTA_ENABLED', 'false')
    vi.stubEnv('UKRPOSHTA_BEARER_TOKEN', 'ukr-secret')

    const { GET } = await import('@/app/(app)/next/delivery/settings/route')

    const response = await GET()
    const body = await response.json()

    expect(body).toEqual({
      data: {
        fixedShippingPrice: null,
        freeShippingFrom: null,
        methods: {
          nova_poshta: {
            enabled: true,
            requiresCity: true,
            requiresWarehouse: true,
          },
          pickup: {
            enabled: true,
            requiresCity: false,
            requiresWarehouse: false,
          },
          ukrposhta: {
            enabled: false,
            requiresCity: true,
            requiresWarehouse: true,
          },
        },
      },
      status: 'ok',
    })
    expect(JSON.stringify(body)).not.toContain('np-secret')
    expect(JSON.stringify(body)).not.toContain('ukr-secret')
  })

  it('normalizes checkout deliverySelection payloads into server delivery details', async () => {
    const { extractDeliveryDetails } = await import('@/delivery/details')

    expect(
      extractDeliveryDetails({
        deliverySelection: {
          cityID: 'city-1',
          cityLabel: 'Київ',
          provider: 'nova_poshta',
          warehouseID: 'warehouse-1',
          warehouseLabel: 'Відділення 1',
        },
      }),
    ).toEqual({
      cityID: 'city-1',
      cityLabel: 'Київ',
      freeShipping: null,
      notes: null,
      price: null,
      provider: 'nova_poshta',
      recipientName: null,
      recipientPhone: null,
      trackingNumber: null,
      warehouseID: 'warehouse-1',
      warehouseLabel: 'Відділення 1',
    })
  })

  it('validates backend delivery details without trusting checkout delivery pricing', async () => {
    const { syncOrderTrackingFields, validateDeliveryDetails } = await import('@/delivery/details')

    const settings = {
      fixedShippingPrice: 75,
      freeShippingFrom: 1500,
      methods: {
        nova_poshta: {
          enabled: true,
          requiresCity: true,
          requiresWarehouse: true,
        },
        pickup: {
          enabled: true,
          requiresCity: false,
          requiresWarehouse: false,
        },
        ukrposhta: {
          enabled: false,
          requiresCity: true,
          requiresWarehouse: true,
        },
      },
    } as const

    expect(
      validateDeliveryDetails(
        {
          provider: 'nova_poshta',
          cityID: 'city-1',
          cityLabel: 'Київ',
          price: 999,
          warehouseID: 'warehouse-1',
          warehouseLabel: 'Відділення 1',
        },
        settings,
      ),
    ).toEqual(
      expect.objectContaining({
        price: null,
        provider: 'nova_poshta',
      }),
    )
    expect(() =>
      validateDeliveryDetails(
        {
          provider: 'nova_poshta',
          cityID: 'city-1',
          cityLabel: 'Київ',
        },
        settings,
      ),
    ).toThrow('Delivery warehouse is required.')
    expect(() =>
      validateDeliveryDetails(
        {
          provider: 'ukrposhta',
          cityID: 'city-1',
          cityLabel: 'Київ',
          warehouseID: 'warehouse-1',
          warehouseLabel: 'Відділення 1',
        },
        settings,
      ),
    ).toThrow('Selected delivery method is disabled.')

    expect(
      syncOrderTrackingFields({
        deliveryDetails: {
          provider: 'nova_poshta',
        },
        trackingNumber: '20450000000000',
      }),
    ).toEqual({
      deliveryDetails: {
        provider: 'nova_poshta',
        trackingNumber: '20450000000000',
      },
      trackingNumber: '20450000000000',
    })
  })
})
