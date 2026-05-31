import type { Metadata } from 'next'

import { mergeOpenGraph } from '@/utilities/mergeOpenGraph'
import React from 'react'

import { ForgotPasswordForm } from '@/components/forms/ForgotPasswordForm'
import { getDictionary } from '@/i18n/dictionary'
import { getRequestLocale } from '@/i18n/request'
import { localizePath } from '@/i18n/config'

export default async function ForgotPasswordPage() {
  return (
    <div className="container py-16">
      <ForgotPasswordForm />
    </div>
  )
}

export async function generateMetadata(): Promise<Metadata> {
  const locale = await getRequestLocale()
  const dictionary = getDictionary(locale)

  return {
    description: dictionary.meta.forgotPasswordDescription,
    openGraph: mergeOpenGraph({
      title: dictionary.auth.forgotPassword,
      url: localizePath('/forgot-password', locale),
    }),
    title: dictionary.auth.forgotPassword,
  }
}
