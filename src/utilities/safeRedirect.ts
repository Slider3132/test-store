import { unlocalizePath } from '@/i18n/config'

const isBlockedPath = (pathname: string) =>
  pathname.startsWith('/admin') || pathname.startsWith('/api') || pathname.startsWith('/next')

export const getSafeRedirect = (value: string | null | undefined, fallback: string) => {
  if (!value) return fallback
  if (!value.startsWith('/') || value.startsWith('//')) return fallback

  const [pathname = '/'] = value.split(/[?#]/)
  const normalizedPathname = unlocalizePath(pathname)

  if (isBlockedPath(pathname) || isBlockedPath(normalizedPathname)) {
    return fallback
  }

  return value
}
