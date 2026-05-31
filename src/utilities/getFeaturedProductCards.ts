import { priceField } from '@/lib/currency'
import type { AppLocale } from '@/i18n/config'
import type { Payload } from 'payload'

export type FeaturedProductCard = {
  id: number | string
  image?: any
  price?: number | null
  slug?: string | null
  title?: string | null
}

export const getFeaturedProductCardsByID = async ({
  ids,
  locale,
  payload,
}: {
  ids: Array<number | string>
  locale: AppLocale
  payload: Payload
}) => {
  const uniqueIDs = Array.from(new Set(ids)).filter(Boolean)

  if (!uniqueIDs.length) return new Map<number | string, FeaturedProductCard>()

  const products = await payload.find({
    collection: 'products',
    depth: 2,
    limit: uniqueIDs.length,
    locale,
    select: {
      gallery: true,
      slug: true,
      title: true,
      [priceField]: true,
    },
    where: {
      id: {
        in: uniqueIDs,
      },
    },
  })

  return new Map(
    products.docs.map((product) => [
      product.id,
      {
        id: product.id,
        image:
          product.gallery?.[0]?.image && typeof product.gallery[0].image === 'object'
            ? product.gallery[0].image
            : null,
        price: typeof product[priceField] === 'number' ? product[priceField] : null,
        slug: product.slug,
        title: product.title,
      },
    ]),
  )
}
