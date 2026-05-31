'use client'

import { createUrl } from '@/utilities/createUrl'
import { cn } from '@/utilities/cn'
import { useRouter } from 'next/navigation'
import React, { Fragment } from 'react'
import type { ListingSearchParams } from '.'

type Props = {
  currentPage: number
  locale: 'uk' | 'ru'
  pathname: string
  searchParams: ListingSearchParams
  totalPages: number
}

export const ListingPagination: React.FC<Props> = ({
  currentPage,
  locale,
  pathname,
  searchParams,
  totalPages,
}) => {
  const router = useRouter()

  if (totalPages <= 1) return null

  const getPageHref = (nextPage: number) => {
    const params = new URLSearchParams()

    Object.entries(searchParams).forEach(([key, value]) => {
      if (key === 'page' || value === undefined) return

      if (Array.isArray(value)) {
        value.forEach((item) => params.append(key, item))
        return
      }

      params.set(key, value)
    })

    if (nextPage > 1) params.set('page', String(nextPage))

    return createUrl(pathname, params)
  }

  const goToPage = (nextPage: number) => {
    router.push(getPageHref(nextPage), { scroll: false })
  }

  const visiblePages = Array.from({ length: totalPages }, (_, index) => index + 1).filter(
    (pageNumber) =>
      pageNumber === 1 || pageNumber === totalPages || Math.abs(pageNumber - currentPage) <= 1,
  )

  return (
    <nav className="mt-8 flex flex-wrap items-center justify-center gap-2" aria-label="Pagination">
      <button
        aria-disabled={currentPage <= 1}
        className={cn(
          'rounded-md border px-4 py-2 text-sm transition',
          currentPage <= 1
            ? 'pointer-events-none text-muted-foreground opacity-50'
            : 'hover:border-primary',
        )}
        disabled={currentPage <= 1}
        onClick={() => goToPage(Math.max(1, currentPage - 1))}
        type="button"
      >
        {locale === 'ru' ? 'Назад' : 'Назад'}
      </button>
      {visiblePages.map((pageNumber, index) => {
        const previousPage = visiblePages[index - 1]
        const shouldShowGap = previousPage && pageNumber - previousPage > 1

        return (
          <Fragment key={pageNumber}>
            {shouldShowGap ? <span className="px-1 text-muted-foreground">...</span> : null}
            <button
              aria-current={pageNumber === currentPage ? 'page' : undefined}
              className={cn(
                'grid size-10 place-items-center rounded-md border text-sm transition',
                pageNumber === currentPage
                  ? 'border-primary bg-primary text-primary-foreground'
                  : 'hover:border-primary',
              )}
              onClick={() => goToPage(pageNumber)}
              type="button"
            >
              {pageNumber}
            </button>
          </Fragment>
        )
      })}
      <button
        aria-disabled={currentPage >= totalPages}
        className={cn(
          'rounded-md border px-4 py-2 text-sm transition',
          currentPage >= totalPages
            ? 'pointer-events-none text-muted-foreground opacity-50'
            : 'hover:border-primary',
        )}
        disabled={currentPage >= totalPages}
        onClick={() => goToPage(Math.min(totalPages, currentPage + 1))}
        type="button"
      >
        {locale === 'ru' ? 'Далее' : 'Далі'}
      </button>
    </nav>
  )
}
