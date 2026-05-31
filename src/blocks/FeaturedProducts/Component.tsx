import type { Product } from '@/payload-types'

import configPromise from '@payload-config'
import { getPayload } from 'payload'
import React from 'react'

import { CollectionArchive } from '@/components/CollectionArchive'
import { RichText } from '@/components/RichText'
import { getRequestLocale } from '@/i18n/request'

type SelectedDoc = {
  relationTo?: string
  value?: Product | string | number
}

type Props = {
  appearance?: 'premiumGrid' | 'spotlight'
  categories?: (number | string | { id: number | string })[] | null
  id?: string | number
  introContent?: any
  limit?: number | null
  populateBy?: 'collection' | 'selection' | null
  selectedDocs?: SelectedDoc[] | null
}

const getRelationshipID = (item: number | string | { id: number | string }) =>
  typeof item === 'object' ? item.id : item

export const FeaturedProductsBlock: React.FC<Props> = async ({
  appearance = 'premiumGrid',
  categories,
  id,
  introContent,
  limit = 4,
  populateBy = 'collection',
  selectedDocs,
}) => {
  const locale = await getRequestLocale()
  let products: Product[] = []

  if (populateBy === 'selection') {
    products =
      selectedDocs
        ?.map((doc) => (typeof doc.value === 'object' ? doc.value : null))
        .filter((doc): doc is Product => Boolean(doc)) || []
  } else {
    const payload = await getPayload({ config: configPromise })
    const categoryIDs = categories?.map(getRelationshipID)

    const result = await payload.find({
      collection: 'products',
      depth: 1,
      draft: false,
      limit: limit || 4,
      locale,
      overrideAccess: false,
      sort: '-updatedAt',
      where: {
        and: [
          {
            _status: {
              equals: 'published',
            },
          },
          ...(categoryIDs?.length
            ? [
                {
                  categories: {
                    in: categoryIDs,
                  },
                },
              ]
            : []),
        ],
      },
    })

    products = result.docs
  }

  if (!products.length) return null

  return (
    <section className="my-20" id={id ? `block-${id}` : undefined}>
      {introContent && (
        <div className="container mb-8 md:mb-10">
          <RichText
            className="ml-0 max-w-3xl [&_h2]:mb-3 [&_h2]:text-3xl [&_p]:text-muted-foreground md:[&_h2]:text-4xl"
            data={introContent}
            enableGutter={false}
          />
        </div>
      )}
      <CollectionArchive
        appearance={appearance === 'spotlight' ? 'premiumGrid' : 'premiumGrid'}
        locale={locale}
        posts={products}
      />
    </section>
  )
}
