import type { Metadata } from 'next'

import { RenderParams } from '@/components/RenderParams'
import { mergeOpenGraph } from '@/utilities/mergeOpenGraph'
import React from 'react'
import { headers as getHeaders } from 'next/headers'
import configPromise from '@payload-config'
import { getPayload } from 'payload'

import { CreateAccountForm } from '@/components/forms/CreateAccountForm'
import { redirect } from 'next/navigation'
import { getRequestLocale } from '@/i18n/request'
import { getDictionary } from '@/i18n/dictionary'
import { localizePath } from '@/i18n/config'

export default async function CreateAccount() {
  const locale = await getRequestLocale()
  const dictionary = getDictionary(locale)
  const headers = await getHeaders()
  const payload = await getPayload({ config: configPromise })
  const { user } = await payload.auth({ headers })

  if (user) {
    redirect(`${localizePath('/account', locale)}?warning=${encodeURIComponent(dictionary.auth.alreadyLoggedIn)}`)
  }

  return (
    <div className="container py-16">
      <h1 className="text-xl mb-4">{dictionary.auth.createAccount}</h1>
      <RenderParams />
      <CreateAccountForm />
    </div>
  )
}

export async function generateMetadata(): Promise<Metadata> {
  const locale = await getRequestLocale()
  const dictionary = getDictionary(locale)

  return {
    description: dictionary.meta.accountDescription,
    openGraph: mergeOpenGraph({
      title: dictionary.auth.createAccount,
      url: localizePath('/create-account', locale),
    }),
    title: dictionary.auth.createAccount,
  }
}
