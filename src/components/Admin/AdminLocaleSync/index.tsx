'use client'

import { useLocale, useTranslation } from '@payloadcms/ui'
import { useRouter } from 'next/navigation'
import React, { useEffect } from 'react'

const cookieName = 'payload-lng'
const supportedLocales = ['uk', 'ru'] as const
const defaultLocale = 'uk'

type AdminLocale = (typeof supportedLocales)[number]

const isAdminLocale = (value: string | undefined): value is AdminLocale =>
  supportedLocales.includes(value as AdminLocale)

const getCookieValue = (name: string) =>
  document.cookie
    .split('; ')
    .find((cookie) => cookie.startsWith(`${name}=`))
    ?.split('=')
    .slice(1)
    .join('=')

const setAdminLanguageCookie = (locale: AdminLocale) => {
  document.cookie = `${cookieName}=${locale}; path=/; max-age=31536000; SameSite=Lax`
}

export const AdminLocaleSync: React.FC<{ children?: React.ReactNode }> = ({ children }) => {
  const locale = useLocale()
  const router = useRouter()
  const { i18n } = useTranslation()
  const activeLocale = isAdminLocale(locale?.code) ? locale.code : defaultLocale

  useEffect(() => {
    const currentCookieLocale = getCookieValue(cookieName)

    if (currentCookieLocale !== activeLocale || i18n.language !== activeLocale) {
      setAdminLanguageCookie(activeLocale)
      router.refresh()
    }
  }, [activeLocale, i18n.language, router])

  return <>{children}</>
}
