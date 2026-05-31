import { afterEach, describe, expect, it, vi } from 'vitest'

const productionEnv = {
  DATABASE_URL: 'postgres://postgres:password@127.0.0.1:5432/ecommerce-starter',
  NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY: 'pk_test_env',
  PAYMENT_EXTERNAL_CHECKOUT_URL: 'https://pay.example.com/checkout',
  PAYMENT_EXTERNAL_WEBHOOK_SECRET: 'external-secret',
  PAYMENT_PROVIDER: 'stripe',
  PAYLOAD_SECRET: 'payload-secret',
  PREVIEW_SECRET: 'preview-secret',
  STRIPE_SECRET_KEY: 'sk_test_env',
  STRIPE_WEBHOOKS_SIGNING_SECRET: 'whsec_test_env',
  S3_ACCESS_KEY_ID: 'access-key',
  S3_BUCKET: 'media',
  S3_ENDPOINT: 'https://storage.example.com',
  S3_SECRET_ACCESS_KEY: 'secret-key',
}

const importEnv = async () => {
  vi.resetModules()
  return import('@/lib/env')
}

describe('production environment validation', () => {
  afterEach(() => {
    vi.unstubAllEnvs()
    vi.resetModules()
  })

  it.each([
    'DATABASE_URL',
    'PAYLOAD_SECRET',
    'PREVIEW_SECRET',
  ])('rejects production when %s is missing', async (name) => {
    vi.stubEnv('NODE_ENV', 'production')

    Object.entries(productionEnv).forEach(([key, value]) => {
      if (key !== name) vi.stubEnv(key, value)
    })
    vi.stubEnv(name, '')

    await expect(importEnv()).rejects.toThrow(
      `Missing required production environment variable: ${name}`,
    )
  })

  it.each([
    'NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY',
    'STRIPE_SECRET_KEY',
    'STRIPE_WEBHOOKS_SIGNING_SECRET',
  ])('rejects production Stripe provider when %s is missing', async (name) => {
    vi.stubEnv('NODE_ENV', 'production')

    Object.entries(productionEnv).forEach(([key, value]) => {
      if (key !== name) vi.stubEnv(key, value)
    })
    vi.stubEnv(name, '')

    await expect(importEnv()).rejects.toThrow(
      `Missing required stripe environment variable: ${name}`,
    )
  })

  it.each(['PAYMENT_EXTERNAL_CHECKOUT_URL', 'PAYMENT_EXTERNAL_WEBHOOK_SECRET'])(
    'rejects production external redirect provider when %s is missing',
    async (name) => {
      vi.stubEnv('NODE_ENV', 'production')

      Object.entries(productionEnv).forEach(([key, value]) => {
        if (key !== name && key !== 'PAYMENT_PROVIDER') vi.stubEnv(key, value)
      })
      vi.stubEnv('PAYMENT_PROVIDER', 'external_redirect')
      vi.stubEnv(name, '')

      await expect(importEnv()).rejects.toThrow(
        `Missing required external_redirect environment variable: ${name}`,
      )
    },
  )

  it('does not require Stripe keys when production uses external redirect payments', async () => {
    vi.stubEnv('NODE_ENV', 'production')

    Object.entries(productionEnv).forEach(([key, value]) => {
      if (!key.includes('STRIPE') && key !== 'PAYMENT_PROVIDER') vi.stubEnv(key, value)
    })
    vi.stubEnv('PAYMENT_PROVIDER', 'external_redirect')

    const { paymentProvider } = await importEnv()

    expect(paymentProvider).toBe('external_redirect')
  })

  it('rejects production when S3 storage config is incomplete', async () => {
    vi.stubEnv('NODE_ENV', 'production')

    Object.entries(productionEnv).forEach(([key, value]) => {
      if (key !== 'S3_SECRET_ACCESS_KEY') vi.stubEnv(key, value)
    })
    vi.stubEnv('S3_SECRET_ACCESS_KEY', '')

    const { assertProductionStorageConfigured } = await importEnv()

    expect(() => assertProductionStorageConfigured()).toThrow(
      'Production requires S3-compatible media storage environment variables.',
    )
  })

  it('rejects production when S3 storage config is whitespace-only', async () => {
    vi.stubEnv('NODE_ENV', 'production')

    Object.entries(productionEnv).forEach(([key, value]) => {
      vi.stubEnv(key, value)
    })
    vi.stubEnv('S3_BUCKET', '   ')

    const { assertProductionStorageConfigured, hasS3StorageEnv } = await importEnv()

    expect(hasS3StorageEnv).toBe(false)
    expect(() => assertProductionStorageConfigured()).toThrow(
      'Production requires S3-compatible media storage environment variables.',
    )
  })

  it('allows an explicit database SSL verification override', async () => {
    vi.stubEnv('NODE_ENV', 'production')
    vi.stubEnv('DATABASE_SSL', 'true')
    vi.stubEnv('DATABASE_SSL_REJECT_UNAUTHORIZED', 'false')

    Object.entries(productionEnv).forEach(([key, value]) => {
      vi.stubEnv(key, value)
    })

    const { env } = await importEnv()

    expect(env.databaseSSLEnabled).toBe(true)
    expect(env.databaseSSLRejectUnauthorized).toBe(false)
  })

  it('allows local development to disable database SSL', async () => {
    vi.stubEnv('NODE_ENV', 'development')
    vi.stubEnv('DATABASE_SSL', 'false')

    const { env } = await importEnv()

    expect(env.databaseSSLEnabled).toBe(false)
  })

  it('allows local development without production-only variables', async () => {
    vi.stubEnv('NODE_ENV', 'development')
    Object.keys(productionEnv).forEach((key) => vi.stubEnv(key, ''))

    const { env, hasS3StorageEnv, isProduction } = await importEnv()

    expect(isProduction).toBe(false)
    expect(env.databaseURL).toBe('')
    expect(hasS3StorageEnv).toBe(false)
  })

  it('does not require runtime secrets during the Next production build phase', async () => {
    vi.stubEnv('NODE_ENV', 'production')
    vi.stubEnv('NEXT_PHASE', 'phase-production-build')
    Object.keys(productionEnv).forEach((key) => vi.stubEnv(key, ''))

    const { assertProductionStorageConfigured, env, isProduction } = await importEnv()

    expect(isProduction).toBe(false)
    expect(env.databaseURL).toBe('')
    expect(() => assertProductionStorageConfigured()).not.toThrow()
  })
})
