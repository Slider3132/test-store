import type { Metadata } from 'next'

import { mergeOpenGraph } from '@/utilities/mergeOpenGraph'
import React from 'react'
import { FindOrderForm } from '@/components/forms/FindOrderForm'
import { getPayload } from 'payload'
import { headers as getHeaders } from 'next/headers.js'
import configPromise from '@payload-config'
import { getDictionary } from '@/i18n/dictionary'
import { getRequestLocale } from '@/i18n/request'
import { localizePath } from '@/i18n/config'

export default async function FindOrderPage() {
  const headers = await getHeaders()
  const payload = await getPayload({ config: configPromise })
  const { user } = await payload.auth({ headers })

  return (
    <div className="container py-16">
      <FindOrderForm initialEmail={user?.email} />
    </div>
  )
}

export async function generateMetadata(): Promise<Metadata> {
  const locale = await getRequestLocale()
  const dictionary = getDictionary(locale)

  return {
    description: dictionary.meta.findOrderDescription,
    openGraph: mergeOpenGraph({
      title: dictionary.findOrder.title,
      url: localizePath('/find-order', locale),
    }),
    title: dictionary.findOrder.title,
  }
}
