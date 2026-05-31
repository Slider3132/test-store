import { describe, expect, it, vi } from 'vitest'

describe('external redirect payment adapter', () => {
  it('verifies HMAC webhook signatures', async () => {
    vi.resetModules()
    vi.stubEnv('PAYMENT_EXTERNAL_WEBHOOK_SECRET', 'webhook-secret')

    const { signExternalPaymentBody, verifyExternalPaymentSignature } = await import(
      '@/payments/externalRedirectAdapter'
    )

    const body = JSON.stringify({
      amount: 10000,
      currency: 'UAH',
      status: 'succeeded',
      transactionID: 123,
    })

    const signature = signExternalPaymentBody(body)

    expect(verifyExternalPaymentSignature({ body, signature })).toBe(true)
    expect(verifyExternalPaymentSignature({ body, signature: 'bad' })).toBe(false)
  })
})
