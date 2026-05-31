export const adminLocales = [
  { code: 'uk', label: 'Українська' },
  { code: 'ru', label: 'Русский' },
] as const

export type AdminLocaleCode = (typeof adminLocales)[number]['code']

export const isAdminLocaleCode = (value: string | undefined): value is AdminLocaleCode =>
  adminLocales.some((locale) => locale.code === value)

export const buildLocaleHref = (currentHref: string, locale: AdminLocaleCode) => {
  const url = new URL(currentHref, 'http://localhost:3000')

  url.searchParams.set('locale', locale)

  return `${url.pathname}${url.search}${url.hash}`
}

export const getLocaleButtonState = (activeLocale: AdminLocaleCode, locale: AdminLocaleCode) => {
  const isActive = activeLocale === locale

  return {
    ariaCurrent: isActive ? ('true' as const) : undefined,
    isActive,
  }
}
