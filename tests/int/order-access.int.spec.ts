import { beforeEach, describe, expect, it, vi } from 'vitest'

import { createOrderAccessToken, verifyOrderAccessToken } from '@/lib/orderAccess'

const findMock = vi.fn()
const sendEmailMock = vi.fn()
const loggerErrorMock = vi.fn()

vi.mock('@payload-config', () => ({
  default: {},
}))

vi.mock('payload', () => ({
  getPayload: vi.fn(async () => ({
    find: findMock,
    logger: {
      error: loggerErrorMock,
    },
    sendEmail: sendEmailMock,
  })),
}))

vi.mock('@/utilities/getURL', () => ({
  getServerSideURL: () => 'https://shop.example',
}))

describe('order access tokens', () => {
  beforeEach(() => {
    process.env.PAYLOAD_SECRET = 'test-order-access-secret'
    findMock.mockReset()
    sendEmailMock.mockReset()
    loggerErrorMock.mockReset()
    vi.restoreAllMocks()
  })

  it('creates an expiring signed token for an order and email', () => {
    const token = createOrderAccessToken({
      email: 'customer@example.com',
      orderID: 'order-123',
    })

    expect(token).toEqual(expect.any(String))
    expect(token.split('.')).toHaveLength(3)
    expect(
      verifyOrderAccessToken({
        email: 'customer@example.com',
        orderID: 'order-123',
        token,
      }),
    ).toBe(true)
  })

  it('rejects tokens for a different email or order', () => {
    const token = createOrderAccessToken({
      email: 'customer@example.com',
      orderID: 'order-123',
    })

    expect(
      verifyOrderAccessToken({
        email: 'other@example.com',
        orderID: 'order-123',
        token,
      }),
    ).toBe(false)
    expect(
      verifyOrderAccessToken({
        email: 'customer@example.com',
        orderID: 'order-456',
        token,
      }),
    ).toBe(false)
  })

  it('sends signed order links without logging the email body', async () => {
    const { sendOrderAccessEmail } = await import(
      '@/components/forms/FindOrderForm/sendOrderAccessEmail'
    )
    const consoleLogSpy = vi.spyOn(console, 'log').mockImplementation(() => undefined)

    findMock.mockResolvedValueOnce({
      docs: [
        {
          id: 'order-123',
          accessToken: 'legacy-permanent-token',
        },
      ],
    })

    const result = await sendOrderAccessEmail({
      email: 'customer@example.com',
      orderID: 'order-123',
    })

    expect(result).toEqual({ success: true })
    expect(consoleLogSpy).not.toHaveBeenCalled()
    expect(sendEmailMock).toHaveBeenCalledWith(
      expect.objectContaining({
        html: expect.stringContaining('orderToken='),
        to: 'customer@example.com',
      }),
    )
    expect(sendEmailMock.mock.calls[0][0].html).not.toContain('legacy-permanent-token')
    expect(sendEmailMock.mock.calls[0][0].html).not.toContain('accessToken=')
  })

  it('keeps legacy checkout redirect tokens working without an email during migration', async () => {
    const { canAccessOrderAsGuest } = await import('@/app/(app)/(account)/orders/[id]/page')

    expect(
      canAccessOrderAsGuest({
        accessToken: 'legacy-permanent-token',
        orderResult: {
          accessToken: 'legacy-permanent-token',
          customerEmail: 'customer@example.com',
        },
        requestedOrderID: 'order-123',
      }),
    ).toBe(true)
  })
})
