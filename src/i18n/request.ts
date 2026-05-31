import { headers } from 'next/headers'

import { defaultLocale, isAppLocale, type AppLocale } from './config'

export const getRequestLocale = async (): Promise<AppLocale> => {
  const requestHeaders = await headers()
  const locale = requestHeaders.get('x-app-locale') || undefined

  return isAppLocale(locale) ? locale : defaultLocale
}
