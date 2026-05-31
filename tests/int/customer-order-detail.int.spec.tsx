import React from 'react'
import { render, screen } from '@testing-library/react'
import { beforeEach, describe, expect, it, vi } from 'vitest'

const findMock = vi.fn()
const authMock = vi.fn()

vi.mock('@payload-config', () => ({
  default: {},
}))

vi.mock('payload', () => ({
  getPayload: vi.fn(async () => ({
    auth: authMock,
    find: findMock,
  })),
}))

vi.mock('next/headers.js', () => ({
  headers: vi.fn(async () => new Headers()),
}))

vi.mock('next/navigation', () => ({
  notFound: vi.fn(() => {
    throw new Error('not found')
  }),
  usePathname: () => '/',
}))

vi.mock('@/i18n/request', () => ({
  getRequestLocale: vi.fn(async () => 'uk'),
}))

vi.mock('@/components/ProductItem', () => ({
  ProductItem: () => <div>Product item</div>,
}))

vi.mock('@/components/addresses/AddressItem', () => ({
  AddressItem: () => <div>Shipping address</div>,
}))

vi.mock('@/components/Price', () => ({
  Price: ({ amount }: { amount: number }) => <span>{amount}</span>,
}))

describe('customer order detail', () => {
  beforeEach(() => {
    authMock.mockResolvedValue({ user: { id: 7 } })
    findMock.mockReset()
  })

  it('renders payment fulfillment delivery and tracking details when present', async () => {
    const { default: OrderPage } = await import('@/app/(app)/(account)/orders/[id]/page')

    findMock.mockResolvedValueOnce({
      docs: [
        {
          amount: 1000,
          createdAt: '2026-05-25T00:00:00.000Z',
          customer: 7,
          deliveryDetails: {
            cityLabel: 'Київ',
            trackingNumber: 'TTN-123',
            warehouseLabel: 'Відділення 1',
          },
          deliveryMethod: 'nova_poshta',
          fulfillmentStatus: 'shipped',
          id: 123,
          items: [],
          paymentStatus: 'paid',
          shippingAddress: {
            city: 'Київ',
          },
          status: 'processing',
          updatedAt: '2026-05-25T00:00:00.000Z',
        },
      ],
    })

    render(
      await OrderPage({
        params: Promise.resolve({ id: '123' }),
        searchParams: Promise.resolve({}),
      }),
    )

    expect(screen.getByText('Статус оплати')).toBeTruthy()
    expect(screen.getByText('оплачено')).toBeTruthy()
    expect(screen.getByText('Статус виконання')).toBeTruthy()
    expect(screen.getByText('відправлено')).toBeTruthy()
    expect(screen.getByText('Спосіб доставки')).toBeTruthy()
    expect(screen.getByText('Нова пошта')).toBeTruthy()
    expect(screen.getByText('Деталі доставки')).toBeTruthy()
    expect(screen.getByText('Київ')).toBeTruthy()
    expect(screen.getByText('Відділення 1')).toBeTruthy()
    expect(screen.getByText('Трекінг')).toBeTruthy()
    expect(screen.getByText('TTN-123')).toBeTruthy()
  })
})
