import Link from 'next/link'
import React from 'react'

import { Button } from '@/components/ui/button'
import { getRequestLocale } from '@/i18n/request'
import { localizePath } from '@/i18n/config'

export default async function NotFound() {
  const locale = await getRequestLocale()

  return (
    <div className="container py-28">
      <div className="prose max-w-none">
        <h1 style={{ marginBottom: 0 }}>404</h1>
        <p className="mb-4">
          {locale === 'ru' ? 'Страница не найдена.' : 'Сторінку не знайдено.'}
        </p>
      </div>
      <Button asChild variant="default">
        <Link href={localizePath('/', locale)}>
          {locale === 'ru' ? 'На главную' : 'На головну'}
        </Link>
      </Button>
    </div>
  )
}
