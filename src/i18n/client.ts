'use client'

import { usePathname } from 'next/navigation'

import { defaultLocale, isAppLocale, type AppLocale } from './config'
import { getDictionary } from './dictionary'

export const getLocaleFromPathname = (pathname: string | null): AppLocale => {
  const locale = pathname?.split('/').filter(Boolean)[0]

  return isAppLocale(locale) ? locale : defaultLocale
}

export const useLocale = (): AppLocale => getLocaleFromPathname(usePathname())

export const useDictionary = () => getDictionary(useLocale())
