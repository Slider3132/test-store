import { localizePath, type AppLocale, isAppLocale } from '@/i18n/config'
import { priceField } from '@/lib/currency'
import configPromise from '@payload-config'
import { getPayload } from 'payload'
import { NextResponse, type NextRequest } from 'next/server'

const resultLimit = 5

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url)
  const q = (searchParams.get('q') || '').trim()
  const requestedLocale = searchParams.get('locale') || undefined
  const locale: AppLocale = isAppLocale(requestedLocale) ? requestedLocale : 'uk'

  if (q.length < 2) {
    return NextResponse.json({ categories: [], products: [] })
  }

  const payload = await getPayload({ config: configPromise })
  const [products, categories] = await Promise.all([
    payload.find({
      collection: 'products',
      depth: 1,
      draft: false,
      limit: resultLimit,
      locale,
      overrideAccess: false,
      select: {
        gallery: true,
        price: true,
        slug: true,
        title: true,
        [priceField]: true,
      },
      sort: 'title',
      where: {
        and: [
          {
            _status: {
              equals: 'published',
            },
          },
          {
            or: [
              {
                title: {
                  like: q,
                },
              },
              {
                slug: {
                  like: q,
                },
              },
            ],
          },
        ],
      },
    }),
    payload.find({
      collection: 'categories',
      depth: 1,
      limit: resultLimit,
      locale,
      overrideAccess: false,
      select: {
        image: true,
        slug: true,
        title: true,
      },
      sort: 'title',
      where: {
        or: [
          {
            title: {
              like: q,
            },
          },
          {
            slug: {
              like: q,
            },
          },
        ],
      },
    }),
  ])

  return NextResponse.json({
    categories: categories.docs.map((category) => ({
      href: localizePath(`/catalog/${category.slug || category.id}`, locale),
      id: category.id,
      image: category.image && typeof category.image === 'object' ? category.image : null,
      title: category.title,
    })),
    products: products.docs.map((product) => ({
      href: localizePath(`/products/${product.slug}`, locale),
      id: product.id,
      image:
        product.gallery?.[0]?.image && typeof product.gallery[0].image === 'object'
          ? product.gallery[0].image
          : null,
      price: product[priceField] || product.price || null,
      title: product.title,
    })),
  })
}
