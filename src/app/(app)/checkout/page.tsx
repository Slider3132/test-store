import type { Metadata } from 'next'

import { mergeOpenGraph } from '@/utilities/mergeOpenGraph'
import React from 'react'

import { CheckoutPage } from '@/components/checkout/CheckoutPage'
import { getRequestLocale } from '@/i18n/request'
import { getDictionary } from '@/i18n/dictionary'
import { localizePath } from '@/i18n/config'
import { activePaymentProvider } from '@/payments/config'

export default async function Checkout() {
  const locale = await getRequestLocale()
  const dictionary = getDictionary(locale)

  return (
    <div className="container min-h-[90vh] flex">
      {activePaymentProvider === 'disabled' && (
        <div>
          {locale === 'ru'
            ? 'Checkout выключен: настройте PAYMENT_PROVIDER и переменные выбранного платежного интегратора.'
            : 'Checkout вимкнено: налаштуйте PAYMENT_PROVIDER і змінні вибраного платіжного інтегратора.'}
        </div>
      )}

      <h1 className="sr-only">{dictionary.common.checkout}</h1>

      <CheckoutPage />
    </div>
  )
}

export async function generateMetadata(): Promise<Metadata> {
  const locale = await getRequestLocale()
  const dictionary = getDictionary(locale)

  return {
    description: dictionary.meta.checkoutDescription,
    openGraph: mergeOpenGraph({
      title: dictionary.common.checkout,
      url: localizePath('/checkout', locale),
    }),
    title: dictionary.common.checkout,
  }
}
