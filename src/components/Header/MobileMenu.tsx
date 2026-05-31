'use client'

import type { Header } from '@/payload-types'

import { CMSLink } from '@/components/Link'
import { Media } from '@/components/Media'
import { Price } from '@/components/Price'
import { Button } from '@/components/ui/button'
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
} from '@/components/ui/sheet'
import { useAuth } from '@/providers/Auth'
import { ChevronRight, Grid2X2, MenuIcon } from 'lucide-react'
import Link from 'next/link'
import { usePathname, useRouter, useSearchParams } from 'next/navigation'
import React, { useEffect, useMemo, useState } from 'react'
import { useDictionary, useLocale } from '@/i18n/client'
import { localizePath, unlocalizePath, type AppLocale } from '@/i18n/config'
import { getCategoryHref } from '@/utilities/categoryLinks'
import { cn } from '@/utilities/cn'
import { getSelectedRootCategories, getVisibleChildCategories } from './megaMenuTree'

type MobileMegaMenuData = {
  categories: Array<{
    description?: string | null
    featuredProducts?: Array<{
      id: number | string
      image?: any
      price?: number | null
      slug?: string | null
      title?: string | null
    }>
    id: number | string
    image?: any
    parent?: number | string | null
    slug?: string | null
    title?: string | null
  }>
  selectedCategoryIDs: Array<number | string>
}

interface Props {
  locale: AppLocale
  menu: Header['navItems']
  megaMenu: MobileMegaMenuData
}

export function MobileMenu({ locale, menu }: Props) {
  const { user } = useAuth()
  const dictionary = useDictionary()
  const currentLocale = useLocale()

  const pathname = usePathname()
  const router = useRouter()
  const searchParams = useSearchParams()
  const [isOpen, setIsOpen] = useState(false)
  const basePath = unlocalizePath(pathname || '/')
  const languageLink = (targetLocale: AppLocale) => localizePath(basePath, targetLocale)
  const closeMobileMenu = () => setIsOpen(false)
  const switchLocale = (targetLocale: AppLocale) => {
    const nextPath = languageLink(targetLocale)

    closeMobileMenu()
    React.startTransition(() => {
      router.push(nextPath, { scroll: false })
      router.refresh()
    })
  }

  useEffect(() => {
    const handleResize = () => {
      if (window.innerWidth > 768) {
        setIsOpen(false)
      }
    }
    window.addEventListener('resize', handleResize)
    return () => window.removeEventListener('resize', handleResize)
  }, [isOpen])

  useEffect(() => {
    setIsOpen(false)
  }, [pathname, searchParams])

  return (
    <Sheet onOpenChange={setIsOpen} open={isOpen}>
      <button
        aria-label={dictionary.common.menu}
        className="relative flex h-10 w-10 items-center justify-center rounded-md border border-neutral-200 text-black transition-colors dark:border-neutral-700 dark:bg-black dark:text-white"
        onClick={() => setIsOpen(true)}
        type="button"
      >
        <MenuIcon className="h-4" />
      </button>

      <SheetContent side="left" className="px-4">
        <SheetHeader className="px-0 pt-4 pb-0">
          <SheetTitle>{dictionary.common.storeName}</SheetTitle>

          <SheetDescription />
        </SheetHeader>

        <div className="py-4">
          {menu?.length ? (
            <ul className="flex w-full flex-col">
              {menu
                .filter((item) => !item.enableMegaMenu)
                .map((item) => (
                  <li className="py-2" key={item.id}>
                    <CMSLink
                      {...item.link}
                      appearance="link"
                      locale={locale}
                      onClick={closeMobileMenu}
                    />
                  </li>
                ))}
            </ul>
          ) : null}

          <div className="mt-4 border-t pt-4">
            <p className="mb-2 text-sm text-muted-foreground">{dictionary.common.language}</p>
            <div className="flex gap-2">
              <Button asChild variant={currentLocale === 'uk' ? 'default' : 'outline'}>
                <button onClick={() => switchLocale('uk')} type="button">
                  {dictionary.common.ukrainian}
                </button>
              </Button>
              <Button asChild variant={currentLocale === 'ru' ? 'default' : 'outline'}>
                <button onClick={() => switchLocale('ru')} type="button">
                  {dictionary.common.russian}
                </button>
              </Button>
            </div>
          </div>
        </div>

        {user ? (
          <div className="mt-4">
            <h2 className="text-xl mb-4">{dictionary.common.myAccount}</h2>
            <hr className="my-2" />
            <ul className="flex flex-col gap-2">
              <li>
                <Link href={localizePath('/orders', locale)}>{dictionary.account.orders}</Link>
              </li>
              <li>
                <Link href={localizePath('/account/addresses', locale)}>
                  {dictionary.account.addresses}
                </Link>
              </li>
              <li>
                <Link href={localizePath('/account', locale)}>
                  {dictionary.common.manageAccount}
                </Link>
              </li>
              <li className="mt-6">
                <Button asChild variant="outline">
                  <Link href={localizePath('/logout', locale)}>{dictionary.account.logOut}</Link>
                </Button>
              </li>
            </ul>
          </div>
        ) : (
          <div>
            <h2 className="text-xl mb-4">{dictionary.common.myAccount}</h2>
            <div className="mt-4 flex flex-col gap-2 sm:flex-row sm:items-center">
              <Button asChild className="w-full sm:flex-1" variant="outline">
                <Link href={localizePath('/login', locale)}>{dictionary.auth.login}</Link>
              </Button>
              <span className="text-center text-sm text-muted-foreground sm:text-base">
                {dictionary.checkout.or}
              </span>
              <Button asChild className="w-full sm:flex-1">
                <Link href={localizePath('/create-account', locale)}>
                  {dictionary.auth.createAccount}
                </Link>
              </Button>
            </div>
          </div>
        )}
      </SheetContent>
    </Sheet>
  )
}

export function MobileCatalogMenu({
  locale,
  megaMenu,
}: {
  locale: AppLocale
  megaMenu: MobileMegaMenuData
}) {
  const dictionary = useDictionary()
  const pathname = usePathname()
  const searchParams = useSearchParams()
  const [isOpen, setIsOpen] = useState(false)
  const megaMenuRootCategories = useMemo(() => {
    return getSelectedRootCategories(megaMenu.categories, megaMenu.selectedCategoryIDs)
  }, [megaMenu.categories, megaMenu.selectedCategoryIDs])
  const [activeCategoryID, setActiveCategoryID] = useState<number | string | null>(
    megaMenuRootCategories[0]?.id || null,
  )
  const activeCategory =
    megaMenu.categories.find((category) => category.id === activeCategoryID) ||
    megaMenuRootCategories[0]
  const childCategories = getVisibleChildCategories(
    activeCategory,
    megaMenu.categories,
    megaMenu.selectedCategoryIDs,
  )
  const featuredProducts = activeCategory?.featuredProducts || []
  const closeCatalogMenu = () => setIsOpen(false)

  useEffect(() => {
    setIsOpen(false)
  }, [pathname, searchParams])

  useEffect(() => {
    setActiveCategoryID((current) => current || megaMenuRootCategories[0]?.id || null)
  }, [megaMenuRootCategories])

  return (
    <Sheet onOpenChange={setIsOpen} open={isOpen}>
      <button
        aria-label={dictionary.shop.catalog}
        className="flex h-10 w-10 items-center justify-center rounded-md border border-neutral-200 text-black transition-colors hover:bg-muted dark:border-neutral-700 dark:bg-black dark:text-white"
        onClick={() => setIsOpen(true)}
        type="button"
      >
        <Grid2X2 className="size-4" />
        <span className="sr-only">{dictionary.shop.catalog}</span>
      </button>

      <SheetContent side="left" className="w-full overflow-y-auto px-4 sm:max-w-xl">
        <SheetHeader className="border-b px-0 pb-4 pt-4 text-left">
          <SheetTitle>{dictionary.shop.catalogTitle}</SheetTitle>
          <SheetDescription>{dictionary.shop.catalogDescription}</SheetDescription>
        </SheetHeader>

        <div className="grid grid-cols-[112px_1fr] gap-4 py-4">
          <div className="flex flex-col gap-1 border-r pr-2">
            {megaMenuRootCategories.map((category) => (
              <button
                className={cn(
                  'rounded-lg px-2 py-2 text-left text-xs leading-tight text-muted-foreground transition-colors hover:bg-muted hover:text-primary',
                  activeCategory?.id === category.id && 'bg-primary/10 text-primary',
                )}
                key={category.id}
                onClick={() => setActiveCategoryID(category.id)}
                type="button"
              >
                {category.title}
              </button>
            ))}
          </div>

          <div className="min-w-0 space-y-3">
            {activeCategory ? (
              <Link
                className="flex items-center justify-between rounded-lg border px-3 py-3 font-medium"
                href={getCategoryHref(activeCategory, locale)}
                onClick={closeCatalogMenu}
              >
                {activeCategory.title}
                <ChevronRight className="size-4 text-muted-foreground" />
              </Link>
            ) : null}

            {childCategories.length ? (
              <div className="rounded-lg border bg-muted/50 p-3">
                <div className="mb-2 text-xs text-muted-foreground">
                  {dictionary.shop.subcategories}
                </div>
                <div className="grid gap-2">
                  {childCategories.map((category) => (
                    <Link
                      className="flex items-center justify-between rounded-md bg-background px-3 py-2 text-sm"
                      href={getCategoryHref(category, locale)}
                      key={category.id}
                      onClick={closeCatalogMenu}
                    >
                      {category.title}
                      <ChevronRight className="size-4 text-muted-foreground" />
                    </Link>
                  ))}
                </div>
              </div>
            ) : null}

            {featuredProducts.length ? (
              <div>
                <div className="mb-2 text-xs text-muted-foreground">
                  {dictionary.shop.featuredProducts}
                </div>
                <div className="grid gap-2">
                  {featuredProducts.slice(0, 3).map((product) => (
                    <Link
                      className="grid grid-cols-[56px_1fr] gap-3 rounded-lg border p-2"
                      href={localizePath(`/products/${product.slug}`, locale)}
                      key={product.id}
                      onClick={closeCatalogMenu}
                    >
                      {product.image ? (
                        <Media
                          className="relative aspect-square overflow-hidden rounded-md bg-muted p-1"
                          fill
                          imgClassName="object-contain"
                          resource={product.image}
                          size="56px"
                        />
                      ) : (
                        <div className="aspect-square rounded-md bg-muted" />
                      )}
                      <div className="min-w-0">
                        <div className="truncate text-sm font-medium">{product.title}</div>
                        {typeof product.price === 'number' ? (
                          <div className="text-sm text-muted-foreground">
                            <Price amount={product.price} />
                          </div>
                        ) : null}
                      </div>
                    </Link>
                  ))}
                </div>
              </div>
            ) : null}

            <Button asChild className="w-full" variant="outline">
              <Link href={localizePath('/catalog', locale)} onClick={closeCatalogMenu}>
                {dictionary.shop.viewAllCategories}
              </Link>
            </Button>
          </div>
        </div>
      </SheetContent>
    </Sheet>
  )
}
