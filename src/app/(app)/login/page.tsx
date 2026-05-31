import type { Metadata } from 'next'

import { RenderParams } from '@/components/RenderParams'
import React from 'react'

import { headers as getHeaders } from 'next/headers'
import configPromise from '@payload-config'
import { getPayload } from 'payload'
import { LoginForm } from '@/components/forms/LoginForm'
import { redirect } from 'next/navigation'
import { getRequestLocale } from '@/i18n/request'
import { getDictionary } from '@/i18n/dictionary'
import { localizePath } from '@/i18n/config'

export default async function Login() {
  const locale = await getRequestLocale()
  const dictionary = getDictionary(locale)
  const headers = await getHeaders()
  const payload = await getPayload({ config: configPromise })
  const { user } = await payload.auth({ headers })

  if (user) {
    redirect(`${localizePath('/account', locale)}?warning=${encodeURIComponent(dictionary.auth.alreadyLoggedIn)}`)
  }

  return (
    <div className="container">
      <div className="max-w-xl mx-auto my-12">
        <RenderParams />

        <h1 className="mb-4 text-[1.8rem]">{dictionary.auth.login}</h1>
        <p className="mb-8">{dictionary.auth.loginIntro}</p>
        <LoginForm />
      </div>
    </div>
  )
}

export async function generateMetadata(): Promise<Metadata> {
  const locale = await getRequestLocale()
  const dictionary = getDictionary(locale)

  return {
    description: dictionary.meta.accountDescription,
    openGraph: {
      title: dictionary.auth.login,
      url: localizePath('/login', locale),
    },
    title: dictionary.auth.login,
  }
}
