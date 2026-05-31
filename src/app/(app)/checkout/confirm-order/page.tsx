import type { Metadata } from 'next'

import { mergeOpenGraph } from '@/utilities/mergeOpenGraph'
import React, { Fragment } from 'react'
import { ConfirmOrder } from '@/components/checkout/ConfirmOrder'
import { getDictionary } from '@/i18n/dictionary'
import { getRequestLocale } from '@/i18n/request'
import { localizePath } from '@/i18n/config'

type SearchParams = Promise<{ [key: string]: string | string[] | undefined }>

export default async function ConfirmOrderPage({
  searchParams: searchParamsPromise,
}: {
  searchParams: SearchParams
}) {
  const searchParams = await searchParamsPromise

  const paymentIntent = searchParams.paymentId

  return (
    <div className="container min-h-[90vh] flex py-12">
      <ConfirmOrder />
    </div>
  )
}

export async function generateMetadata(): Promise<Metadata> {
  const locale = await getRequestLocale()
  const dictionary = getDictionary(locale)

  return {
    description: dictionary.meta.confirmOrderDescription,
    openGraph: mergeOpenGraph({
      title: dictionary.meta.confirmOrder,
      url: localizePath('/checkout/confirm-order', locale),
    }),
    title: dictionary.meta.confirmOrder,
  }
}
