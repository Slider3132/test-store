import type { Media, Product } from '@/payload-types'

import { RenderBlocks } from '@/blocks/RenderBlocks'
import { GridTileImage } from '@/components/Grid/tile'
import { Gallery } from '@/components/product/Gallery'
import { ProductDescription } from '@/components/product/ProductDescription'
import configPromise from '@payload-config'
import { getPayload } from 'payload'
import { draftMode } from 'next/headers'
import Link from 'next/link'
import { notFound } from 'next/navigation'
import React, { Suspense } from 'react'
import { Button } from '@/components/ui/button'
import { ChevronLeftIcon, ChevronRight, Home } from 'lucide-react'
import { Metadata } from 'next'
import { getRequestLocale } from '@/i18n/request'
import { localizePath, type AppLocale } from '@/i18n/config'
import { getDictionary } from '@/i18n/dictionary'
import { fromBaseCurrencyAmount, priceField, UAH } from '@/lib/currency'
import { getCategoryHref } from '@/utilities/categoryLinks'
import { getCategoryBreadcrumbs, getPrimaryProductCategory } from '@/utilities/categoryBreadcrumbs'
import { hydrateProductVariantTypes } from '@/components/product/variantSelection'

type Args = {
  params: Promise<{
    slug: string
  }>
}

export const toProductJsonLdPrice = (price: unknown) => fromBaseCurrencyAmount(price)

export async function generateMetadata({ params }: Args): Promise<Metadata> {
  const locale = await getRequestLocale()
  const { slug } = await params
  const product = await queryProductBySlug({ locale, slug })

  if (!product) return notFound()

  const gallery = product.gallery?.filter((item) => typeof item.image === 'object') || []

  const metaImage = typeof product.meta?.image === 'object' ? product.meta?.image : undefined
  const canIndex = product._status === 'published'

  const seoImage = metaImage || (gallery.length ? (gallery[0]?.image as Media) : undefined)

  return {
    description: product.meta?.description || '',
    openGraph: seoImage?.url
      ? {
          images: [
            {
              alt: seoImage?.alt,
              height: seoImage.height!,
              url: seoImage?.url,
              width: seoImage.width!,
            },
          ],
        }
      : null,
    robots: {
      follow: canIndex,
      googleBot: {
        follow: canIndex,
        index: canIndex,
      },
      index: canIndex,
    },
    title: product.meta?.title || product.title,
  }
}

export default async function ProductPage({ params }: Args) {
  const locale = await getRequestLocale()
  const dictionary = getDictionary(locale)
  const { slug } = await params
  const product = await queryProductBySlug({ locale, slug })

  if (!product) return notFound()

  const primaryCategory = getPrimaryProductCategory(product.categories || [])
  const categoryBreadcrumbs = primaryCategory ? getCategoryBreadcrumbs(primaryCategory) : []
  const gallery =
    product.gallery
      ?.filter((item) => typeof item.image === 'object')
      .map((item) => ({
        ...item,
        image: item.image as Media,
      })) || []

  const metaImage = typeof product.meta?.image === 'object' ? product.meta?.image : undefined
  const hasStock = product.enableVariants
    ? product?.variants?.docs?.some((variant) => {
        if (typeof variant !== 'object') return false
        return variant.inventory && variant?.inventory > 0
      })
    : product.inventory! > 0

  let price = product[priceField]

  if (product.enableVariants && product?.variants?.docs?.length) {
    price = product?.variants?.docs?.reduce((acc, variant) => {
      if (
        typeof variant === 'object' &&
        variant?.[priceField] &&
        acc &&
        variant?.[priceField] > acc
      ) {
        return variant[priceField]
      }
      return acc
    }, price)
  }

  const productJsonLd = {
    name: product.title,
    '@context': 'https://schema.org',
    '@type': 'Product',
    description: product.description,
    image: metaImage?.url,
    offers: {
      '@type': 'AggregateOffer',
      availability: hasStock ? 'https://schema.org/InStock' : 'https://schema.org/OutOfStock',
      price: toProductJsonLdPrice(price),
      priceCurrency: UAH.code,
    },
  }

  const relatedProducts =
    product.relatedProducts?.filter((relatedProduct) => typeof relatedProduct === 'object') ?? []

  return (
    <React.Fragment>
      <script
        dangerouslySetInnerHTML={{
          __html: JSON.stringify(productJsonLd),
        }}
        type="application/ld+json"
      />
      <div className="container pt-8 pb-8">
        <nav className="mb-5 flex flex-wrap items-center gap-2 text-sm text-muted-foreground">
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
          {categoryBreadcrumbs.map((breadcrumb) => (
            <React.Fragment key={breadcrumb.id}>
              <ChevronRight className="size-3" />
              <Link
                className="transition-colors hover:text-primary"
                href={getCategoryHref(breadcrumb, locale)}
              >
                {breadcrumb.title}
              </Link>
            </React.Fragment>
          ))}
          <ChevronRight className="size-3" />
          <span className="text-primary">{product.title}</span>
        </nav>
        <Button asChild variant="ghost" className="mb-4">
          <Link href={localizePath('/catalog', locale)}>
            <ChevronLeftIcon />
            {dictionary.product.allProducts}
          </Link>
        </Button>
        <div className="flex flex-col gap-12 rounded-lg border p-8 md:py-12 lg:flex-row lg:gap-8 bg-primary-foreground">
          <div className="h-full w-full basis-full lg:basis-1/2">
            <Suspense
              fallback={
                <div className="relative aspect-square h-full max-h-[550px] w-full overflow-hidden" />
              }
            >
              {Boolean(gallery?.length) && <Gallery gallery={gallery} />}
            </Suspense>
          </div>

          <div className="basis-full lg:basis-1/2">
            <ProductDescription product={product} />
          </div>
        </div>
      </div>

      {product.layout?.length ? <RenderBlocks blocks={product.layout} /> : <></>}

      {relatedProducts.length ? (
        <div className="container">
          <RelatedProducts locale={locale} products={relatedProducts as Product[]} />
        </div>
      ) : (
        <></>
      )}
    </React.Fragment>
  )
}

function RelatedProducts({ locale, products }: { locale: AppLocale; products: Product[] }) {
  if (!products.length) return null

  const dictionary = getDictionary(locale)

  return (
    <div className="py-8">
      <h2 className="mb-4 text-2xl font-bold">{dictionary.product.relatedProducts}</h2>
      <ul className="flex w-full gap-4 overflow-x-auto pt-1">
        {products.map((product) => (
          <li
            className="aspect-square w-full flex-none min-[475px]:w-1/2 sm:w-1/3 md:w-1/4 lg:w-1/5"
            key={product.id}
          >
            <Link
              className="relative h-full w-full"
              href={localizePath(`/products/${product.slug}`, locale)}
            >
              <GridTileImage
                label={{
                  amount: product[priceField]!,
                  title: product.title,
                }}
                media={product.meta?.image as Media}
              />
            </Link>
          </li>
        ))}
      </ul>
    </div>
  )
}

const queryProductBySlug = async ({ locale, slug }: { locale: AppLocale; slug: string }) => {
  const { isEnabled: draft } = await draftMode()

  const payload = await getPayload({ config: configPromise })

  const result = await payload.find({
    collection: 'products',
    depth: 3,
    draft,
    limit: 1,
    locale,
    overrideAccess: draft,
    pagination: false,
    where: {
      and: [
        {
          slug: {
            equals: slug,
          },
        },
        ...(draft ? [] : [{ _status: { equals: 'published' } }]),
      ],
    },
    populate: {
      variants: {
        title: true,
        [priceField]: true,
        inventory: true,
        options: true,
      },
    },
  })

  const product = result.docs?.[0]

  if (!product) return null

  if (product.enableVariants) {
    const variants = await payload.find({
      collection: 'variants',
      depth: 3,
      draft,
      limit: 100,
      locale,
      overrideAccess: true,
      pagination: false,
      where: {
        and: [
          {
            product: {
              equals: product.id,
            },
          },
          ...(draft ? [] : [{ _status: { equals: 'published' } }]),
        ],
      },
    })

    product.variants = {
      docs: variants.docs,
      totalDocs: variants.totalDocs,
    }

    return hydrateProductVariantTypes(product) as Product
  }

  return product
}
