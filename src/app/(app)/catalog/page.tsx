import { Media } from '@/components/Media'
import { Price } from '@/components/Price'
import { getDictionary } from '@/i18n/dictionary'
import { localizePath } from '@/i18n/config'
import { getRequestLocale } from '@/i18n/request'
import { getCategoryHref } from '@/utilities/categoryLinks'
import { getFeaturedProductCardsByID } from '@/utilities/getFeaturedProductCards'
import { ArrowUpRight } from 'lucide-react'
import type { Metadata } from 'next'
import Link from 'next/link'
import configPromise from '@payload-config'
import { getPayload } from 'payload'

export async function generateMetadata(): Promise<Metadata> {
  const locale = await getRequestLocale()
  const dictionary = getDictionary(locale)

  return {
    description: dictionary.shop.catalogDescription,
    title: dictionary.shop.catalog,
  }
}

export default async function CatalogPage() {
  const locale = await getRequestLocale()
  const dictionary = getDictionary(locale)
  const payload = await getPayload({ config: configPromise })
  const categories = await payload.find({
    collection: 'categories',
    depth: 2,
    limit: 200,
    locale,
    sort: 'title',
    where: {
      showInMegaMenu: {
        not_equals: false,
      },
    },
  })

  const rootCategories = categories.docs.filter((category) => !category.parent)
  const childCategoriesByParent = categories.docs.reduce<
    Record<string, typeof categories.docs>
  >((groups, category) => {
    const parentID =
      category.parent && typeof category.parent === 'object' ? category.parent.id : category.parent

    if (!parentID) return groups

    return {
      ...groups,
      [String(parentID)]: [...(groups[String(parentID)] || []), category],
    }
  }, {})
  const featuredProductIDs = categories.docs.flatMap((category) =>
    (category.featuredProducts || [])
      .map((product) => (typeof product === 'object' ? product.id : product))
      .filter((id): id is number => typeof id === 'number'),
  )
  const featuredProductsByID = await getFeaturedProductCardsByID({
    ids: featuredProductIDs,
    locale,
    payload,
  })

  return (
    <main className="container py-12 md:py-16">
      <section className="max-w-3xl">
        <p className="mb-3 text-xs uppercase tracking-widest text-muted-foreground">
          {dictionary.shop.catalog}
        </p>
        <h1 className="text-4xl font-semibold tracking-normal md:text-6xl">
          {dictionary.shop.catalogTitle}
        </h1>
        <p className="mt-5 text-base leading-7 text-muted-foreground md:text-lg">
          {dictionary.shop.catalogIntro}
        </p>
      </section>

      <section className="mt-12 grid gap-5 lg:grid-cols-3">
        {rootCategories.map((category) => {
          const childCategories = childCategoriesByParent[String(category.id)] || []
          const featuredProducts =
            category.featuredProducts
              ?.map((product) => {
                const productID = typeof product === 'object' ? product.id : product

                return featuredProductsByID.get(productID)
              })
              .filter((product) => product !== undefined) || []

          return (
            <article className="overflow-hidden rounded-lg border bg-card" key={category.id}>
              <Link
                className="group block border-b p-5 transition-colors hover:bg-muted/50"
                href={getCategoryHref(category, locale)}
              >
                <div className="flex items-start gap-4">
                  {category.image && typeof category.image === 'object' ? (
                    <Media
                      className="relative size-20 shrink-0 overflow-hidden rounded-md bg-background"
                      fill
                      imgClassName="object-cover"
                      resource={category.image}
                      size="80px"
                    />
                  ) : null}
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center gap-2">
                      <h2 className="text-xl font-semibold tracking-normal">{category.title}</h2>
                      <ArrowUpRight className="size-4 text-muted-foreground transition-transform group-hover:-translate-y-0.5 group-hover:translate-x-0.5" />
                    </div>
                    {category.description ? (
                      <p className="mt-2 line-clamp-2 text-sm leading-6 text-muted-foreground">
                        {category.description}
                      </p>
                    ) : null}
                  </div>
                </div>
              </Link>

              <div className="grid gap-5 p-5">
                {childCategories.length ? (
                  <div>
                    <h3 className="mb-3 text-xs uppercase tracking-widest text-muted-foreground">
                      {dictionary.shop.subcategories}
                    </h3>
                    <div className="flex flex-wrap gap-2">
                      {childCategories.map((childCategory) => (
                        <Link
                          className="rounded-full border px-3 py-1.5 text-sm transition-colors hover:border-primary/40 hover:text-primary"
                          href={getCategoryHref(childCategory, locale)}
                          key={childCategory.id}
                        >
                          {childCategory.title}
                        </Link>
                      ))}
                    </div>
                  </div>
                ) : null}

                {featuredProducts.length ? (
                  <div>
                    <h3 className="mb-3 text-xs uppercase tracking-widest text-muted-foreground">
                      {dictionary.shop.featuredProducts}
                    </h3>
                    <div className="grid gap-3">
                      {featuredProducts.slice(0, 3).map((product) => {
                        return (
                          <Link
                            className="grid grid-cols-[56px_1fr] gap-3 rounded-md border p-2 transition-colors hover:border-primary/30"
                            href={localizePath(`/products/${product.slug}`, locale)}
                            key={product.id}
                          >
                            {product.image ? (
                              <Media
                                className="relative aspect-square overflow-hidden rounded bg-background p-1"
                                fill
                                imgClassName="object-contain"
                                resource={product.image}
                                size="56px"
                              />
                            ) : (
                              <div className="aspect-square rounded bg-muted" />
                            )}
                            <div className="min-w-0">
                              <div className="truncate text-sm font-medium">{product.title}</div>
                              {typeof product.price === 'number' ? (
                                <Price
                                  amount={product.price}
                                  as="span"
                                  className="mt-1 block text-sm text-muted-foreground"
                                />
                              ) : null}
                            </div>
                          </Link>
                        )
                      })}
                    </div>
                  </div>
                ) : null}
              </div>
            </article>
          )
        })}
      </section>
    </main>
  )
}
