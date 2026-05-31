'use client'
import { CMSLink } from '@/components/Link'
import { Cart } from '@/components/Cart'
import { OpenCartButton } from '@/components/Cart/OpenCart'
import { Media } from '@/components/Media'
import { Price } from '@/components/Price'
import Link from 'next/link'
import React, { Suspense } from 'react'

import { MobileCatalogMenu } from './MobileMenu'
import { HeaderSearch } from './HeaderSearch'
import type { Header } from 'src/payload-types'

import { LogoIcon } from '@/components/icons/logo'
import { usePathname, useRouter, useSearchParams } from 'next/navigation'
import { cn } from '@/utilities/cn'
import { localizePath, unlocalizePath, type AppLocale } from '@/i18n/config'
import { getCategoryHref } from '@/utilities/categoryLinks'
import { useDictionary } from '@/i18n/client'
import { Button } from '@/components/ui/button'
import { useAuth } from '@/providers/Auth'
import { useTheme } from '@/providers/Theme'
import { getSelectedRootCategories, getVisibleChildCategories } from './megaMenuTree'
import {
  ChevronRight,
  Grid2X2,
  Languages,
  LogIn,
  LogOut,
  Moon,
  Settings,
  Sun,
  User,
} from 'lucide-react'

type Props = {
  header: Header
  locale: AppLocale
  megaMenu: MegaMenuData
}

type MegaMenuProduct = {
  id: number | string
  image?: any
  price?: number | null
  slug?: string | null
  title?: string | null
}

type MegaMenuCategory = {
  description?: string | null
  featuredProducts?: MegaMenuProduct[]
  id: number | string
  image?: any
  parent?: number | string | null
  slug?: string | null
  title?: string | null
}

type MegaMenuData = {
  categories: MegaMenuCategory[]
  selectedCategoryIDs: Array<number | string>
}

export function HeaderClient({ header, locale, megaMenu }: Props) {
  const menu = (header.navItems || []).filter((item) => item.showInHeader !== false)
  const pathname = usePathname()
  const router = useRouter()
  const searchParams = useSearchParams()
  const headerRef = React.useRef<HTMLDivElement>(null)
  const headerActionsRef = React.useRef<HTMLDivElement>(null)
  const [visiblePathname, setVisiblePathname] = React.useState(pathname || '/')
  const [languageOpen, setLanguageOpen] = React.useState(false)
  const [accountOpen, setAccountOpen] = React.useState(false)
  const [megaMenuOpen, setMegaMenuOpen] = React.useState<string | null>(null)
  const [activeCategoryID, setActiveCategoryID] = React.useState<number | string | null>(null)
  const [hasMounted, setHasMounted] = React.useState(false)
  const dictionary = useDictionary()
  const { theme, setTheme } = useTheme()
  const { user } = useAuth()
  const canUseAdmin = Boolean(user?.roles?.includes('admin'))
  const activeLocale: AppLocale = visiblePathname.startsWith('/ru') ? 'ru' : 'uk'
  const basePath = unlocalizePath(visiblePathname)
  const queryString = searchParams.toString()

  const languageLink = (targetLocale: AppLocale) => {
    const path = localizePath(basePath, targetLocale)

    return queryString ? `${path}?${queryString}` : path
  }
  const switchLocale = (targetLocale: AppLocale) => {
    const nextPath = localizePath(basePath, targetLocale)
    const nextHref = languageLink(targetLocale)

    setVisiblePathname(nextPath)
    setLanguageOpen(false)
    setAccountOpen(false)
    setMegaMenuOpen(null)
    React.startTransition(() => {
      router.push(nextHref, { scroll: false })
      router.refresh()
    })
  }

  React.useEffect(() => {
    setHasMounted(true)
    setVisiblePathname(window.location.pathname || pathname || '/')
    setLanguageOpen(false)
    setAccountOpen(false)
    setMegaMenuOpen(null)
  }, [pathname])

  React.useEffect(() => {
    if (!languageOpen && !accountOpen && !megaMenuOpen) return

    const closeOnOutsidePointer = (event: PointerEvent) => {
      const target = event.target

      if (!(target instanceof Node)) return
      if (megaMenuOpen && headerRef.current?.contains(target)) return
      if (headerActionsRef.current?.contains(target)) return

      setLanguageOpen(false)
      setAccountOpen(false)
      setMegaMenuOpen(null)
    }

    const closeOnEscape = (event: KeyboardEvent) => {
      if (event.key !== 'Escape') return

      setLanguageOpen(false)
      setAccountOpen(false)
      setMegaMenuOpen(null)
    }

    document.addEventListener('pointerdown', closeOnOutsidePointer)
    document.addEventListener('keydown', closeOnEscape)

    return () => {
      document.removeEventListener('pointerdown', closeOnOutsidePointer)
      document.removeEventListener('keydown', closeOnEscape)
    }
  }, [accountOpen, languageOpen, megaMenuOpen])

  React.useEffect(() => {
    const visibleRootCategories = getSelectedRootCategories(
      megaMenu.categories,
      megaMenu.selectedCategoryIDs,
    )

    setActiveCategoryID(
      (current) => current || visibleRootCategories[0]?.id || megaMenu.categories[0]?.id || null,
    )
  }, [megaMenu.categories, megaMenu.selectedCategoryIDs])

  return (
    <div
      className="sticky top-0 z-50 border-b bg-background/95 shadow-sm backdrop-blur supports-[backdrop-filter]:bg-background/85"
      ref={headerRef}
    >
      <nav className="container flex h-[72px] items-end justify-between gap-2 md:items-center">
        <div className="flex min-w-0 flex-none items-end gap-1 pb-2 md:h-full md:items-center md:gap-6 md:pb-0">
          <Link
            aria-label={dictionary.common.storeName}
            className="relative z-30 flex h-10 shrink-0 items-center justify-center px-1 md:h-auto md:px-0"
            href={localizePath('/', activeLocale)}
          >
            <LogoIcon className="w-6 h-auto" />
          </Link>
          <div className="relative z-30 flex shrink-0 items-center gap-1 md:hidden">
            <Suspense fallback={null}>
              <MobileCatalogMenu locale={activeLocale} megaMenu={megaMenu} />
            </Suspense>
          </div>
          {menu.length ? (
            <ul className="hidden gap-4 text-sm md:flex md:items-center">
              {menu.map((item) => {
                const itemID = String(item.id)
                const hasMegaMenu = item.enableMegaMenu && megaMenu.categories.length > 0

                return (
                  <li key={item.id}>
                    {hasMegaMenu ? (
                      <button
                        aria-expanded={megaMenuOpen === itemID}
                        className={cn(
                          'flex items-center gap-2 rounded-md border border-primary/20 px-3 py-2 text-xs font-medium uppercase tracking-widest text-primary shadow-sm transition-[background-color,border-color,color,box-shadow,transform] duration-300 ease-out hover:-translate-y-px hover:bg-primary hover:text-primary-foreground hover:shadow-md',
                          (megaMenuOpen === itemID ||
                            pathname.includes(item.link.url || '/shop') ||
                            pathname.includes('/catalog')) &&
                            'border-primary bg-primary text-primary-foreground',
                        )}
                        onClick={() => {
                          setMegaMenuOpen((open) => (open === itemID ? null : itemID))
                          setLanguageOpen(false)
                          setAccountOpen(false)
                        }}
                        type="button"
                      >
                        <Grid2X2 className="size-4" />
                        {item.link.label}
                      </button>
                    ) : (
                      <CMSLink
                        {...item.link}
                        locale={locale}
                        size={'clear'}
                        className={cn('relative navLink', {
                          active:
                            item.link.url && item.link.url !== '/'
                              ? pathname.includes(item.link.url)
                              : false,
                        })}
                        appearance="nav"
                      />
                    )}
                  </li>
                )
              })}
            </ul>
          ) : null}
        </div>

        <HeaderSearch className="hidden max-w-2xl flex-1 md:block" locale={activeLocale} />

        <div
          ref={headerActionsRef}
          className="relative z-30 flex flex-none items-end justify-end gap-0.5 pb-2 md:items-center md:gap-1 md:pb-0"
        >
          <div className="relative">
            <HeaderIconButton
              active={languageOpen}
              aria-label={dictionary.common.languageMenu}
              onClick={() => {
                setLanguageOpen((open) => !open)
                setAccountOpen(false)
                setMegaMenuOpen(null)
              }}
              title={dictionary.common.languageMenu}
            >
              <Languages className="size-5" />
            </HeaderIconButton>
            {languageOpen ? (
              <HeaderMenu align="right">
                <HeaderMenuLink
                  active={activeLocale === 'uk'}
                  label={dictionary.common.ukrainian}
                  onClick={() => switchLocale('uk')}
                  shortLabel="UA"
                />
                <HeaderMenuLink
                  active={activeLocale === 'ru'}
                  label={dictionary.common.russian}
                  onClick={() => switchLocale('ru')}
                  shortLabel="RU"
                />
              </HeaderMenu>
            ) : null}
          </div>
          <HeaderIconButton
            aria-label={dictionary.common.themeToggle}
            onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')}
            title={
              hasMounted && theme === 'dark'
                ? dictionary.common.lightTheme
                : dictionary.common.darkTheme
            }
          >
            {hasMounted && theme === 'dark' ? (
              <Sun className="size-5" />
            ) : (
              <Moon className="size-5" />
            )}
          </HeaderIconButton>
          <div className="relative">
            <HeaderIconButton
              active={accountOpen}
              aria-label={dictionary.common.myAccount}
              onClick={() => {
                setAccountOpen((open) => !open)
                setLanguageOpen(false)
                setMegaMenuOpen(null)
              }}
              title={dictionary.common.myAccount}
            >
              {user ? (
                <span className="relative">
                  <User className="size-5" />
                  <span className="absolute -right-0.5 -top-0.5 size-2 rounded-full bg-primary" />
                </span>
              ) : (
                <User className="size-5" />
              )}
            </HeaderIconButton>
            {accountOpen ? (
              <HeaderMenu align="right">
                {user ? (
                  <>
                    <div className="max-w-56 truncate px-3 py-2 text-xs text-muted-foreground">
                      {user.email}
                    </div>
                    {canUseAdmin ? (
                      <HeaderMenuLink
                        href="/admin"
                        icon={<Settings className="size-4" />}
                        label={dictionary.common.admin}
                      />
                    ) : null}
                    <HeaderMenuLink
                      href={localizePath('/account', activeLocale)}
                      label={dictionary.common.profile}
                    />
                    <HeaderMenuLink
                      href={localizePath('/orders', activeLocale)}
                      label={dictionary.account.orders}
                    />
                    <HeaderMenuLink
                      href={localizePath('/logout', activeLocale)}
                      icon={<LogOut className="size-4" />}
                      label={dictionary.account.logOut}
                    />
                  </>
                ) : (
                  <>
                    <HeaderMenuLink
                      href={localizePath('/login', activeLocale)}
                      icon={<LogIn className="size-4" />}
                      label={dictionary.auth.login}
                    />
                    <HeaderMenuLink
                      href={localizePath('/create-account', activeLocale)}
                      label={dictionary.auth.createAccount}
                    />
                  </>
                )}
              </HeaderMenu>
            ) : null}
          </div>
          <Suspense fallback={<OpenCartButton />}>
            <Cart />
          </Suspense>
        </div>
      </nav>
      <div className="container pb-3 md:hidden">
        <HeaderSearch locale={activeLocale} />
      </div>
      {megaMenuOpen ? (
        <MegaMenuPanel
          activeCategoryID={activeCategoryID}
          locale={activeLocale}
          megaMenu={megaMenu}
          setActiveCategoryID={setActiveCategoryID}
        />
      ) : null}
    </div>
  )
}

function MegaMenuPanel({
  activeCategoryID,
  locale,
  megaMenu,
  setActiveCategoryID,
}: {
  activeCategoryID: number | string | null
  locale: AppLocale
  megaMenu: MegaMenuData
  setActiveCategoryID: (id: number | string) => void
}) {
  const visibleRootCategories = getSelectedRootCategories(
    megaMenu.categories,
    megaMenu.selectedCategoryIDs,
  )
  const activeCategory =
    megaMenu.categories.find((category) => category.id === activeCategoryID) ||
    visibleRootCategories[0]
  const childCategories = getVisibleChildCategories(
    activeCategory,
    megaMenu.categories,
    megaMenu.selectedCategoryIDs,
  )
  const categoriesToShow = childCategories.length ? childCategories : visibleRootCategories
  const products = activeCategory?.featuredProducts || []
  const labels =
    locale === 'ru'
      ? {
          catalog: 'Каталог',
          categories: 'Категории',
          emptyProducts: 'Добавьте рекомендованные товары в категории.',
          featuredProducts: 'Рекомендованные товары',
          viewAllCategories: 'Все категории',
        }
      : {
          catalog: 'Каталог',
          categories: 'Категорії',
          emptyProducts: 'Додайте рекомендовані товари в категорії.',
          featuredProducts: 'Рекомендовані товари',
          viewAllCategories: 'Усі категорії',
        }

  return (
    <div className="absolute left-0 right-0 top-full border-b bg-background shadow-lg">
      <div className="container grid gap-6 py-6 lg:grid-cols-[280px_1fr_320px]">
        <div className="rounded-xl border bg-card p-2">
          <div className="mb-3 text-xs uppercase tracking-widest text-muted-foreground">
            {labels.catalog}
          </div>
          <div className="flex flex-col gap-1">
            <Link
              className="flex items-center justify-between rounded-lg px-3 py-2.5 text-sm font-medium transition-colors hover:bg-muted"
              href={localizePath('/catalog', locale)}
            >
              {labels.viewAllCategories}
              <Grid2X2 className="size-4 text-muted-foreground" />
            </Link>
            {visibleRootCategories.map((category) => (
              <button
                className={cn(
                  'flex items-center justify-between rounded-lg px-3 py-2.5 text-left text-sm transition-colors hover:bg-muted',
                  activeCategory?.id === category.id && 'bg-muted font-medium',
                )}
                key={category.id}
                onMouseEnter={() => setActiveCategoryID(category.id)}
                onFocus={() => setActiveCategoryID(category.id)}
                type="button"
              >
                <span>{category.title}</span>
                <ChevronRight className="size-4 text-muted-foreground" />
              </button>
            ))}
          </div>
        </div>

        <div className="rounded-xl border bg-muted/40 p-4">
          <div className="mb-3 text-xs uppercase tracking-widest text-muted-foreground">
            {labels.categories}
          </div>
          {activeCategory ? (
            <Link
              className="mb-3 flex items-center justify-between rounded-lg border bg-background px-4 py-3 font-medium transition-colors hover:border-primary/30"
              href={getCategoryHref(activeCategory, locale)}
            >
              {activeCategory.title}
              <ChevronRight className="size-4 text-muted-foreground" />
            </Link>
          ) : null}
          <div className="grid gap-3 sm:grid-cols-2">
            {categoriesToShow.map((category) => (
              <Link
                className="group rounded-lg bg-background p-4 transition-colors hover:bg-card"
                href={getCategoryHref(category, locale)}
                key={category.id}
              >
                <div className="font-medium group-hover:text-primary">{category.title}</div>
                {category.description ? (
                  <p className="mt-2 line-clamp-2 text-sm text-muted-foreground">
                    {category.description}
                  </p>
                ) : null}
              </Link>
            ))}
          </div>
        </div>

        <div className="rounded-xl border bg-card p-4">
          <div className="mb-3 text-xs uppercase tracking-widest text-muted-foreground">
            {labels.featuredProducts}
          </div>
          {products.length ? (
            <div className="grid gap-3">
              {products.slice(0, 3).map((product) => (
                <Link
                  className="grid grid-cols-[64px_1fr] gap-3 rounded-lg border bg-card p-2 transition-colors hover:border-primary/30"
                  href={localizePath(`/products/${product.slug}`, locale)}
                  key={product.id}
                >
                  {product.image ? (
                    <Media
                      className="relative aspect-square overflow-hidden rounded-md bg-background p-2"
                      fill
                      imgClassName="object-contain"
                      resource={product.image}
                      size="64px"
                    />
                  ) : (
                    <div className="aspect-square rounded-md bg-muted" />
                  )}
                  <div className="min-w-0 py-1">
                    <div className="truncate text-sm font-medium">{product.title}</div>
                    {typeof product.price === 'number' ? (
                      <div className="mt-1 text-sm text-muted-foreground">
                        <Price amount={product.price} />
                      </div>
                    ) : null}
                  </div>
                </Link>
              ))}
            </div>
          ) : (
            <p className="rounded-lg border bg-card p-4 text-sm text-muted-foreground">
              {labels.emptyProducts}
            </p>
          )}
        </div>
      </div>
    </div>
  )
}

function HeaderIconButton({
  active,
  className,
  ...props
}: React.ComponentProps<typeof Button> & { active?: boolean }) {
  return (
    <Button
      size="clear"
      variant="ghost"
      className={cn(
        'relative flex size-11 items-center justify-center rounded-md p-0 text-primary/70 hover:text-primary',
        'max-md:size-10',
        active && 'text-primary',
        className,
      )}
      {...props}
    />
  )
}

function HeaderMenu({
  align = 'left',
  children,
}: {
  align?: 'left' | 'right'
  children: React.ReactNode
}) {
  return (
    <div
      className={cn(
        'absolute top-full z-50 mt-2 min-w-44 rounded-md border bg-background p-1 text-sm shadow-lg',
        align === 'right' ? 'right-0' : 'left-0',
      )}
    >
      {children}
    </div>
  )
}

function HeaderMenuLink({
  active,
  href,
  icon,
  label,
  onClick,
  shortLabel,
}: {
  active?: boolean
  href?: string
  icon?: React.ReactNode
  label: string
  onClick?: () => void
  shortLabel?: string
}) {
  const className = cn(
    'flex w-full items-center gap-2 rounded px-3 py-2 text-left text-primary/70 hover:bg-primary/5 hover:text-primary',
    active && 'bg-primary/5 text-primary',
  )
  const content = (
    <>
      {icon}
      {shortLabel ? <span className="font-mono text-xs tracking-widest">{shortLabel}</span> : null}
      <span>{label}</span>
    </>
  )

  return href ? (
    <Link aria-current={active ? 'page' : undefined} className={className} href={href}>
      {content}
    </Link>
  ) : (
    <button
      aria-current={active ? 'page' : undefined}
      className={className}
      onClick={onClick}
      type="button"
    >
      {content}
    </button>
  )
}
