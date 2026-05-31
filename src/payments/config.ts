import type { PaymentAdapter } from '@payloadcms/plugin-ecommerce/types'
import { stripeAdapter } from '@payloadcms/plugin-ecommerce/payments/stripe'

import { env, paymentProvider } from '@/lib/env'
import { externalRedirectAdapter } from '@/payments/externalRedirectAdapter'

export const activePaymentProvider = paymentProvider

export const getServerPaymentMethods = (): PaymentAdapter[] => {
  if (activePaymentProvider === 'stripe') {
    return [
      stripeAdapter({
        secretKey: env.stripeSecretKey,
        publishableKey: env.nextPublicStripePublishableKey,
        webhookSecret: env.stripeWebhooksSigningSecret,
      }),
    ]
  }

  if (activePaymentProvider === 'external_redirect') {
    return [externalRedirectAdapter()]
  }

  return []
}
