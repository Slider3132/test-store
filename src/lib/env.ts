const production = process.env.NODE_ENV === 'production'
const productionBuild = process.env.NEXT_PHASE === 'phase-production-build'
const productionRuntime = production && !productionBuild

export const envValue = (name: string) => process.env[name]?.trim()

const requiredInProduction = (name: string) => {
  const value = envValue(name)

  if (productionRuntime && (!value || value.trim().length === 0)) {
    throw new Error(`Missing required production environment variable: ${name}`)
  }

  return value
}

export const isProduction = productionRuntime

export type PaymentProvider = 'disabled' | 'external_redirect' | 'stripe'

const paymentProviderValue = envValue('PAYMENT_PROVIDER') || envValue('NEXT_PUBLIC_PAYMENT_PROVIDER')

export const paymentProvider: PaymentProvider =
  paymentProviderValue === 'stripe' || paymentProviderValue === 'external_redirect'
    ? paymentProviderValue
    : productionRuntime
      ? 'disabled'
      : 'stripe'

const requiredForProvider = (provider: PaymentProvider, name: string) => {
  const value = envValue(name)

  if (productionRuntime && paymentProvider === provider && (!value || value.length === 0)) {
    throw new Error(`Missing required ${provider} environment variable: ${name}`)
  }

  return value
}

export const env = {
  databaseURL: requiredInProduction('DATABASE_URL') || '',
  databaseSSLEnabled: envValue('DATABASE_SSL') === 'true' || productionRuntime,
  databaseSSLRejectUnauthorized: envValue('DATABASE_SSL_REJECT_UNAUTHORIZED') !== 'false',
  externalPaymentCheckoutURL: requiredForProvider('external_redirect', 'PAYMENT_EXTERNAL_CHECKOUT_URL') || '',
  externalPaymentProviderLabel:
    envValue('PAYMENT_EXTERNAL_PROVIDER_LABEL') || 'External payment provider',
  externalPaymentWebhookSecret:
    requiredForProvider('external_redirect', 'PAYMENT_EXTERNAL_WEBHOOK_SECRET') || '',
  novaPoshtaAPIKey: envValue('NOVA_POSHTA_API_KEY') || '',
  novaPoshtaEnabled: envValue('NOVA_POSHTA_ENABLED') === 'true',
  nextPublicPaymentProvider:
    envValue('NEXT_PUBLIC_PAYMENT_PROVIDER') || paymentProvider,
  nextPublicStripePublishableKey:
    requiredForProvider('stripe', 'NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY') || '',
  payloadSecret: requiredInProduction('PAYLOAD_SECRET') || '',
  previewSecret: requiredInProduction('PREVIEW_SECRET') || '',
  stripeSecretKey: requiredForProvider('stripe', 'STRIPE_SECRET_KEY') || '',
  stripeWebhooksSigningSecret: requiredForProvider('stripe', 'STRIPE_WEBHOOKS_SIGNING_SECRET') || '',
  ukrposhtaAPIBaseURL: envValue('UKRPOSHTA_API_BASE_URL') || 'https://www.ukrposhta.ua',
  ukrposhtaBearerToken: envValue('UKRPOSHTA_BEARER_TOKEN') || '',
  ukrposhtaEnabled: envValue('UKRPOSHTA_ENABLED') === 'true',
}

export const hasS3StorageEnv = Boolean(
  envValue('S3_BUCKET') &&
    envValue('S3_ENDPOINT') &&
    envValue('S3_ACCESS_KEY_ID') &&
    envValue('S3_SECRET_ACCESS_KEY'),
)

export const assertProductionStorageConfigured = () => {
  if (productionRuntime && !hasS3StorageEnv) {
    throw new Error('Production requires S3-compatible media storage environment variables.')
  }
}
