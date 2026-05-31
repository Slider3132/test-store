import { NextResponse, type NextRequest } from 'next/server'

import { defaultLocale, isAppLocale } from '@/i18n/config'

const PUBLIC_FILE = /\.[^/]+$/

export function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl

  if (
    pathname.startsWith('/admin') ||
    pathname.startsWith('/api') ||
    pathname.startsWith('/_next') ||
    pathname.startsWith('/next') ||
    pathname.startsWith('/media') ||
    PUBLIC_FILE.test(pathname)
  ) {
    return NextResponse.next()
  }

  const segments = pathname.split('/').filter(Boolean)
  const requestedLocale = segments[0]
  const locale = isAppLocale(requestedLocale) ? requestedLocale : defaultLocale

  const requestHeaders = new Headers(request.headers)
  requestHeaders.set('x-app-locale', locale)

  if (locale !== defaultLocale) {
    const rewriteURL = request.nextUrl.clone()
    rewriteURL.pathname = `/${segments.slice(1).join('/')}`
    if (rewriteURL.pathname === '/') rewriteURL.pathname = '/'

    return NextResponse.rewrite(rewriteURL, {
      request: {
        headers: requestHeaders,
      },
    })
  }

  return NextResponse.next({
    request: {
      headers: requestHeaders,
    },
  })
}

export const config = {
  matcher: ['/((?!_next/static|_next/image|favicon.ico).*)'],
}
