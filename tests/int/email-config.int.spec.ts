import { afterEach, describe, expect, it, vi } from 'vitest'

const productionEnv = {
  DATABASE_URL: 'postgres://postgres:password@127.0.0.1:5432/ecommerce-starter',
  EMAIL_FROM_ADDRESS: 'shop@example.com',
  EMAIL_FROM_NAME: 'Demo Shop',
  NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY: 'pk_test_env',
  PAYMENT_PROVIDER: 'disabled',
  PAYLOAD_SECRET: 'payload-secret',
  PREVIEW_SECRET: 'preview-secret',
  S3_ACCESS_KEY_ID: 'access-key',
  S3_BUCKET: 'media',
  S3_ENDPOINT: 'https://storage.example.com',
  S3_SECRET_ACCESS_KEY: 'secret-key',
  SMTP_HOST: 'smtp.example.com',
  SMTP_PASS: 'smtp-pass',
  SMTP_PORT: '587',
  SMTP_SKIP_VERIFY: 'false',
  SMTP_USER: 'smtp-user',
}

const nodemailerAdapterMock = vi.fn(async (args) => () => ({
  defaultFromAddress: args.defaultFromAddress,
  defaultFromName: args.defaultFromName,
  name: 'nodemailer',
  sendEmail: vi.fn(),
  transportOptions: args.transportOptions,
}))

vi.mock('@payloadcms/email-nodemailer', () => ({
  nodemailerAdapter: nodemailerAdapterMock,
}))

const importEmail = async () => {
  vi.resetModules()
  const email = await import('@/lib/email')
  return email
}

describe('email configuration', () => {
  afterEach(() => {
    vi.unstubAllEnvs()
    vi.resetModules()
    nodemailerAdapterMock.mockClear()
  })

  it('rejects production when SMTP configuration is incomplete', async () => {
    vi.stubEnv('NODE_ENV', 'production')

    Object.entries(productionEnv).forEach(([key, value]) => {
      if (key !== 'SMTP_PASS') vi.stubEnv(key, value)
    })
    vi.stubEnv('SMTP_PASS', '')

    await expect(importEmail()).rejects.toThrow(
      'Missing required production SMTP environment variable: SMTP_PASS',
    )
  })

  it('creates a nodemailer adapter from SMTP environment variables', async () => {
    vi.stubEnv('NODE_ENV', 'production')
    Object.entries(productionEnv).forEach(([key, value]) => vi.stubEnv(key, value))

    const { getEmailAdapter } = await importEmail()
    const adapter = await getEmailAdapter()

    expect(adapter).toBeTypeOf('function')
    expect(nodemailerAdapterMock).toHaveBeenCalledWith({
      defaultFromAddress: 'shop@example.com',
      defaultFromName: 'Demo Shop',
      skipVerify: false,
      transportOptions: {
        auth: {
          pass: 'smtp-pass',
          user: 'smtp-user',
        },
        host: 'smtp.example.com',
        port: 587,
        secure: false,
      },
    })
  })

  it('does not configure SMTP locally when SMTP_HOST is missing', async () => {
    vi.stubEnv('NODE_ENV', 'development')
    vi.stubEnv('SMTP_HOST', '')

    const { getEmailAdapter } = await importEmail()

    expect(getEmailAdapter()).toBeUndefined()
    expect(nodemailerAdapterMock).not.toHaveBeenCalled()
  })

  it('does not require SMTP during the Next production build phase', async () => {
    vi.stubEnv('NODE_ENV', 'production')
    vi.stubEnv('NEXT_PHASE', 'phase-production-build')
    vi.stubEnv('SMTP_HOST', '')

    const { getEmailAdapter } = await importEmail()

    expect(getEmailAdapter()).toBeUndefined()
    expect(nodemailerAdapterMock).not.toHaveBeenCalled()
  })
})
