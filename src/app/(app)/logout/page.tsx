import type { Metadata } from 'next'

import { mergeOpenGraph } from '@/utilities/mergeOpenGraph'
import React from 'react'

import { LogoutPage } from './LogoutPage'
import { getDictionary } from '@/i18n/dictionary'
import { getRequestLocale } from '@/i18n/request'
import { localizePath } from '@/i18n/config'

export default async function Logout() {
  return (
    <div className="container max-w-lg my-16">
      <LogoutPage />
    </div>
  )
}

export async function generateMetadata(): Promise<Metadata> {
  const locale = await getRequestLocale()
  const dictionary = getDictionary(locale)

  return {
    description: dictionary.meta.logoutDescription,
    openGraph: mergeOpenGraph({
      title: dictionary.meta.logout,
      url: localizePath('/logout', locale),
    }),
    title: dictionary.meta.logout,
  }
}
