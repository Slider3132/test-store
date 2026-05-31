'use client'

import { Media } from '@/components/Media'
import { Price } from '@/components/Price'
import { useDictionary } from '@/i18n/client'
import { localizePath, type AppLocale } from '@/i18n/config'
import { createUrl } from '@/utilities/createUrl'
import { cn } from '@/utilities/cn'
import { SearchIcon } from 'lucide-react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import React from 'react'

type SearchResult = {
  href: string
  id: number | string
  image?: any
  price?: number | null
  title?: string | null
}

type SearchResponse = {
  categories: SearchResult[]
  products: SearchResult[]
}

type Props = {
  className?: string
  locale: AppLocale
}

export const HeaderSearch: React.FC<Props> = ({ className, locale }) => {
  const dictionary = useDictionary()
  const router = useRouter()
  const rootRef = React.useRef<HTMLDivElement>(null)
  const [query, setQuery] = React.useState('')
  const [isFocused, setIsFocused] = React.useState(false)
  const [isLoading, setIsLoading] = React.useState(false)
  const [results, setResults] = React.useState<SearchResponse>({ categories: [], products: [] })
  const labels =
    locale === 'ru'
      ? {
          allResults: 'Все результаты',
          categories: 'Категории',
          noResults: 'Ничего не найдено',
          products: 'Товары',
        }
      : {
          allResults: 'Усі результати',
          categories: 'Категорії',
          noResults: 'Нічого не знайдено',
          products: 'Товари',
        }
  const trimmedQuery = query.trim()
  const showDropdown = isFocused && trimmedQuery.length >= 2
  const hasResults = results.products.length > 0 || results.categories.length > 0

  React.useEffect(() => {
    if (trimmedQuery.length < 2) {
      setResults({ categories: [], products: [] })
      setIsLoading(false)
      return
    }

    const controller = new AbortController()
    const timeoutID = window.setTimeout(async () => {
      setIsLoading(true)

      try {
        const params = new URLSearchParams({ locale, q: trimmedQuery })
        const response = await fetch(`/next/search?${params.toString()}`, {
          signal: controller.signal,
        })

        if (!response.ok) throw new Error('Search request failed')

        const data = (await response.json()) as SearchResponse
        setResults(data)
      } catch (error) {
        if (!controller.signal.aborted) {
          setResults({ categories: [], products: [] })
        }
      } finally {
        if (!controller.signal.aborted) {
          setIsLoading(false)
        }
      }
    }, 180)

    return () => {
      window.clearTimeout(timeoutID)
      controller.abort()
    }
  }, [locale, trimmedQuery])

  React.useEffect(() => {
    const closeOnOutsidePointer = (event: PointerEvent) => {
      const target = event.target

      if (!(target instanceof Node)) return
      if (rootRef.current?.contains(target)) return

      setIsFocused(false)
    }

    document.addEventListener('pointerdown', closeOnOutsidePointer)

    return () => {
      document.removeEventListener('pointerdown', closeOnOutsidePointer)
    }
  }, [])

  function submitSearch(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault()

    const params = new URLSearchParams()

    if (trimmedQuery) params.set('q', trimmedQuery)

    setIsFocused(false)
    router.push(createUrl(localizePath('/shop', locale), params))
  }

  function updateQuery(value: string) {
    setQuery(value)
    setIsFocused(true)
  }

  return (
    <div className={cn('relative w-full', className)} ref={rootRef}>
      <form className="relative" onSubmit={submitSearch}>
        <input
          aria-label={dictionary.shop.searchPlaceholder}
          autoComplete="off"
          className="h-11 w-full rounded-lg border bg-background px-4 pr-11 text-sm outline-none transition focus:border-primary focus:ring-2 focus:ring-primary/10"
          onChange={(event) => updateQuery(event.target.value)}
          onClick={() => setIsFocused(true)}
          onFocus={() => setIsFocused(true)}
          onInput={(event) => updateQuery(event.currentTarget.value)}
          placeholder={dictionary.shop.searchPlaceholder}
          type="search"
          value={query}
        />
        <button
          aria-label={dictionary.shop.searchPlaceholder}
          className="absolute right-2 top-1/2 grid size-8 -translate-y-1/2 place-items-center rounded-md text-muted-foreground transition hover:bg-muted hover:text-primary"
          type="submit"
        >
          <SearchIcon className="size-4" />
        </button>
      </form>

      {showDropdown ? (
        <div className="absolute left-0 right-0 top-full z-50 mt-2 overflow-hidden rounded-xl border bg-background shadow-xl">
          {isLoading ? (
            <div className="p-4 text-sm text-muted-foreground">{dictionary.common.loading}</div>
          ) : hasResults ? (
            <div className="max-h-[min(70vh,520px)] overflow-y-auto p-2">
              <SearchSection
                items={results.categories}
                label={labels.categories}
                onSelect={() => setIsFocused(false)}
                type="category"
              />
              <SearchSection
                items={results.products}
                label={labels.products}
                onSelect={() => setIsFocused(false)}
                type="product"
              />
              <Link
                className="mt-1 flex items-center justify-center rounded-lg border px-3 py-2 text-sm font-medium transition hover:border-primary/30 hover:bg-muted"
                href={createUrl(
                  localizePath('/shop', locale),
                  new URLSearchParams({ q: trimmedQuery }),
                )}
                onClick={() => setIsFocused(false)}
              >
                {labels.allResults}
              </Link>
            </div>
          ) : (
            <div className="p-4 text-sm text-muted-foreground">{labels.noResults}</div>
          )}
        </div>
      ) : null}
    </div>
  )
}

function SearchSection({
  items,
  label,
  onSelect,
  type,
}: {
  items: SearchResult[]
  label: string
  onSelect: () => void
  type: 'category' | 'product'
}) {
  if (!items.length) return null

  return (
    <div className="py-2">
      <div className="mb-2 px-2 text-xs uppercase tracking-widest text-muted-foreground">
        {label}
      </div>
      <div className="grid gap-1">
        {items.map((item) => (
          <Link
            className="grid grid-cols-[48px_1fr] gap-3 rounded-lg p-2 transition hover:bg-muted"
            href={item.href}
            key={`${type}-${item.id}`}
            onClick={onSelect}
          >
            {item.image ? (
              <Media
                className="relative aspect-square overflow-hidden rounded-md bg-muted p-1"
                fill
                imgClassName="object-contain"
                resource={item.image}
                size="48px"
              />
            ) : (
              <div className="aspect-square rounded-md bg-muted" />
            )}
            <div className="min-w-0 self-center">
              <div className="truncate text-sm font-medium">{item.title}</div>
              {type === 'product' && typeof item.price === 'number' ? (
                <div className="mt-0.5 text-xs text-muted-foreground">
                  <Price amount={item.price} />
                </div>
              ) : null}
            </div>
          </Link>
        ))}
      </div>
    </div>
  )
}
