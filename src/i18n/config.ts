export const defaultLocale = 'uk'
export const locales = ['uk', 'ru'] as const

export type AppLocale = (typeof locales)[number]

export const isAppLocale = (value: string | undefined): value is AppLocale =>
  value === 'uk' || value === 'ru'

export const localizePath = (path: string, locale: AppLocale) => {
  if (!path.startsWith('/') || path.startsWith('/api') || path.startsWith('/admin')) return path
  if (locale === defaultLocale) return path
  if (path === '/') return `/${locale}`
  if (path.startsWith(`/${locale}/`) || path === `/${locale}`) return path
  return `/${locale}${path}`
}

export const unlocalizePath = (path: string) => {
  if (path === '/ru') return '/'
  if (path.startsWith('/ru/')) return path.slice(3) || '/'
  return path
}
