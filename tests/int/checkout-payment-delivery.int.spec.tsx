import React from 'react'
import { cleanup, fireEvent, render, screen, waitFor } from '@testing-library/react'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'

const initiatePaymentMock = vi.fn()

vi.mock('@stripe/stripe-js', () => ({
  loadStripe: () => null,
}))

vi.mock('@stripe/react-stripe-js', () => ({
  Elements: ({ children }: { children: React.ReactNode }) => <div>{children}</div>,
}))

vi.mock('sonner', () => ({
  toast: {
    error: vi.fn(),
  },
}))

vi.mock('next/link', () => ({
  default: ({ children, href }: { children: React.ReactNode; href: string }) => (
    <a href={href}>{children}</a>
  ),
}))

vi.mock('next/navigation', () => ({
  usePathname: () => '/',
  useRouter: () => ({
    refresh: vi.fn(),
  }),
}))

vi.mock('@/providers/Auth', () => ({
  useAuth: () => ({
    user: null,
  }),
}))

vi.mock('@/providers/Theme', () => ({
  useTheme: () => ({
    theme: 'light',
  }),
}))

vi.mock('@payloadcms/plugin-ecommerce/client/react', () => ({
  useAddresses: () => ({ addresses: [] }),
  useCart: () => ({
    cart: {
      items: [
        {
          product: {
            id: 1,
            title: 'Test product',
          },
          quantity: 1,
        },
      ],
      subtotal: 1000,
    },
  }),
  usePayments: () => ({
    initiatePayment: initiatePaymentMock,
    paymentMethods: [{ name: 'stripe' }],
  }),
}))

vi.mock('@/components/addresses/CreateAddressModal', () => ({
  CreateAddressModal: ({
    callback,
    disabled,
  }: {
    callback?: (address: Record<string, unknown>) => void
    disabled?: boolean
  }) => (
    <button
      disabled={disabled}
      onClick={() =>
        callback?.({
          addressLine1: '1 Main St',
          city: 'Kyiv',
          country: 'UA',
          firstName: 'Test',
          lastName: 'Customer',
        })
      }
      type="button"
    >
      create address
    </button>
  ),
}))

vi.mock('@/components/addresses/AddressItem', () => ({
  AddressItem: () => <div>Address item</div>,
}))

vi.mock('@/components/Media', () => ({
  Media: () => null,
}))

vi.mock('@/components/Price', () => ({
  Price: ({ amount }: { amount: number }) => <span>{amount}</span>,
}))

describe('CheckoutPage delivery integration', () => {
  beforeEach(() => {
    vi.restoreAllMocks()
    vi.unstubAllGlobals()
    initiatePaymentMock.mockReset()
    initiatePaymentMock.mockResolvedValue({ paymentUrl: 'https://pay.example' })
    vi.stubGlobal('location', {
      assign: vi.fn(),
    })
    vi.stubGlobal(
      'fetch',
      vi.fn(async (input: RequestInfo | URL) => {
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
      }),
    )
  })

  afterEach(() => {
    cleanup()
  })

  it('keeps payment disabled until delivery is valid and sends deliverySelection in additionalData', async () => {
    const { CheckoutPage } = await import('@/components/checkout/CheckoutPage')

    render(<CheckoutPage />)

    fireEvent.change(screen.getByLabelText('Email'), { target: { value: 'customer@example.com' } })
    fireEvent.click(screen.getByRole('button', { name: 'Продовжити як гість' }))
    fireEvent.click(screen.getByRole('button', { name: 'create address' }))

    const paymentButton = await screen.findByRole('button', { name: 'Перейти до оплати' })
    expect(paymentButton).toHaveProperty('disabled', true)

    fireEvent.click(await screen.findByRole('button', { name: 'Нова пошта' }))
    fireEvent.change(screen.getByLabelText('Місто'), { target: { value: 'Ки' } })
    fireEvent.click(await screen.findByRole('button', { name: 'Київ' }))
    fireEvent.change(screen.getByLabelText('Відділення'), { target: { value: '1' } })
    fireEvent.click(await screen.findByRole('button', { name: 'Відділення 1' }))

    await waitFor(() => expect(paymentButton).toHaveProperty('disabled', false))

    fireEvent.click(paymentButton)

    await waitFor(() => {
      expect(initiatePaymentMock).toHaveBeenCalledWith(
        'stripe',
        expect.objectContaining({
          additionalData: expect.objectContaining({
            deliverySelection: expect.objectContaining({
              cityID: 'city-1',
              provider: 'nova_poshta',
              warehouseID: 'warehouse-1',
            }),
          }),
        }),
      )
    })
  })
})
