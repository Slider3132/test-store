import { Media } from '@/components/Media'
import { CatalogListingSection } from '@/components/ProductListing/CatalogListingSection'
import { getDictionary } from '@/i18n/dictionary'
import { localizePath } from '@/i18n/config'
import { getRequestLocale } from '@/i18n/request'
import { getCategoryHref } from '@/utilities/categoryLinks'
import { getCategoryBreadcrumbs } from '@/utilities/categoryBreadcrumbs'
import {
  getCatalogListingProducts,
  getListingPage,
  resolveCategoryProductType,
  type CatalogListingSearchParams,
} from '@/utilities/catalogListing'
import { sanitizeProductSort } from '@/utilities/sanitizeProductSort'
import { ChevronRight, Home } from 'lucide-react'
import type { Metadata } from 'next'
import Link from 'next/link'
import { notFound } from 'next/navigation'
import configPromise from '@payload-config'
import { getPayload } from 'payload'
import { Fragment } from 'react'

type Props = {
  params: Promise<{ slug: string }>
  searchParams?: Promise<SearchParams>
}

type SearchParams = CatalogListingSearchParams

const getCategory = async (slug: string) => {
  const locale = await getRequestLocale()
  const payload = await getPayload({ config: configPromise })
  const categories = await payload.find({
    collection: 'categories',
    depth: 2,
    limit: 1,
    locale,
    where: {
      slug: {
        equals: slug,
      },
    },
  })

  return { category: categories.docs[0], locale, payload }
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params
  const { category } = await getCategory(slug)

  if (!category) return {}

  return {
    description: category.description || undefined,
    title: category.title,
  }
}

export default async function CategoryLandingPage({ params, searchParams }: Props) {
  const { slug } = await params
  const searchParamsData = (await searchParams) || {}
  const sanitizedSearchParamsData: SearchParams = {
    ...searchParamsData,
    sort: sanitizeProductSort(searchParamsData.sort),
  }
  const { category, locale, payload } = await getCategory(slug)

  if (!category) return notFound()

  const dictionary = getDictionary(locale)
  const breadcrumbs = getCategoryBreadcrumbs(category)
  const page = getListingPage(sanitizedSearchParamsData)
  const productType = await resolveCategoryProductType({
    category,
    locale,
    payload,
  })

  const childCategories = await payload.find({
    collection: 'categories',
    depth: 2,
    limit: 50,
    locale,
    sort: 'title',
    where: {
      parent: {
        equals: category.id,
      },
      showInMegaMenu: {
        not_equals: false,
      },
    },
  })
  const { products } = await getCatalogListingProducts({
    categoryID: category.id,
    includeSearch: false,
    locale,
    payload,
    productType,
    searchParams: sanitizedSearchParamsData,
  })

  return (
    <main className="container py-8 md:py-12">
      <nav className="mb-7 flex items-center gap-2 text-sm text-muted-foreground">
        <Link
          aria-label={dictionary.common.storeName}
          className="transition-colors hover:text-primary"
          href={localizePath('/', locale)}
        >
          <Home className="size-4" />
        </Link>
        <ChevronRight className="size-3" />
        <Link
          className="transition-colors hover:text-primary"
          href={localizePath('/catalog', locale)}
        >
          {dictionary.shop.catalog}
        </Link>
        {breadcrumbs.map((breadcrumb, index) => {
          const isLast = index === breadcrumbs.length - 1

          return (
            <Fragment key={breadcrumb.id}>
              <ChevronRight className="size-3" />
              {isLast ? (
                <span className="text-primary">{breadcrumb.title}</span>
              ) : (
                <Link
                  className="transition-colors hover:text-primary"
                  href={getCategoryHref(breadcrumb, locale)}
                >
                  {breadcrumb.title}
                </Link>
              )}
            </Fragment>
          )
        })}
      </nav>

      <h1 className="text-4xl font-semibold tracking-normal md:text-5xl">{category.title}</h1>

      <section className="relative mt-8 overflow-hidden rounded-xl border bg-card">
        <div className="relative min-h-[260px] md:min-h-[360px]">
          {category.image && typeof category.image === 'object' ? (
            <Media
              className="absolute inset-0"
              fill
              imgClassName="object-cover"
              priority
              resource={category.image}
              size="100vw"
            />
          ) : (
            <div className="absolute inset-0 bg-muted" />
          )}
          <div className="absolute inset-0 bg-gradient-to-r from-black/75 via-black/35 to-black/10" />
          <div className="relative flex min-h-[260px] max-w-2xl flex-col justify-center p-7 text-white md:min-h-[360px] md:p-12">
            <p className="mb-4 text-xs uppercase tracking-[0.24em] text-white/70">
              {dictionary.shop.category}
            </p>
            <h2 className="text-3xl font-semibold tracking-normal md:text-5xl">{category.title}</h2>
            {category.description ? (
              <p className="mt-5 max-w-xl text-base leading-7 text-white/85 md:text-lg">
                {category.description}
              </p>
            ) : null}
            <Link
              className="mt-8 inline-flex w-fit items-center rounded-full bg-white px-5 py-3 text-sm font-medium text-black transition-colors hover:bg-white/90"
              href="#category-products"
            >
              {dictionary.shop.viewProducts}
              <ChevronRight className="ml-2 size-4" />
            </Link>
          </div>
        </div>
      </section>

      {childCategories.docs.length ? (
        <section className="mt-10">
          <h2 className="mb-5 text-2xl font-semibold tracking-normal">
            {dictionary.shop.subcategories}
          </h2>
          <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-6">
            {childCategories.docs.map((childCategory) => (
              <Link
                className="group rounded-xl border bg-background p-4 text-center transition-colors hover:border-primary/30 hover:bg-muted/40"
                href={getCategoryHref(childCategory, locale)}
                key={childCategory.id}
              >
                <div className="relative mx-auto aspect-[4/3] w-full max-w-40 overflow-hidden rounded-lg bg-muted">
                  {childCategory.image && typeof childCategory.image === 'object' ? (
                    <Media
                      className="absolute inset-0"
                      fill
                      imgClassName="object-cover transition-transform duration-300 group-hover:scale-105"
                      resource={childCategory.image}
                      size="180px"
                    />
                  ) : null}
                </div>
                <div className="mt-4 text-sm font-medium text-primary group-hover:underline">
                  {childCategory.title}
                </div>
              </Link>
            ))}
          </div>
        </section>
      ) : null}

      <section className="mt-12 scroll-mt-28" id="category-products">
        <CatalogListingSection
          currentPage={page}
          locale={locale}
          pathname={localizePath(`/catalog/${category.slug || category.id}`, locale)}
          productType={productType}
          products={products}
          searchParams={sanitizedSearchParamsData}
          title={dictionary.shop.categoryProducts}
        />
      </section>
    </main>
  )
}
