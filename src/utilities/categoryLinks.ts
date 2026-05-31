import { localizePath, type AppLocale } from '@/i18n/config'

export const getCategoryHref = (
  category: { id: number | string; slug?: string | null },
  locale: AppLocale,
) => localizePath(`/catalog/${category.slug || category.id}`, locale)
