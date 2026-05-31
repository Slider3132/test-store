import type { Product, ArchiveBlock as ArchiveBlockProps } from '@/payload-types'

import configPromise from '@payload-config'
import { DefaultDocumentIDType, getPayload } from 'payload'
import React from 'react'
import { RichText } from '@/components/RichText'

import { CollectionArchive } from '@/components/CollectionArchive'
import { getRequestLocale } from '@/i18n/request'

export const ArchiveBlock: React.FC<
  ArchiveBlockProps & {
    id?: DefaultDocumentIDType
    className?: string
  }
> = async (props) => {
  const locale = await getRequestLocale()
  const {
    appearance = 'grid',
    id,
    categories,
    introContent,
    limit: limitFromProps,
    populateBy,
    selectedDocs,
  } = props

  const limit = limitFromProps || 3

  let posts: Product[] = []

  if (populateBy === 'collection') {
    const payload = await getPayload({ config: configPromise })

    const flattenedCategories = categories?.map((category) => {
      if (typeof category === 'object') return category.id
      else return category
    })

    const fetchedProducts = await payload.find({
      collection: 'products',
      depth: 1,
      limit,
      locale,
      ...(flattenedCategories && flattenedCategories.length > 0
        ? {
            where: {
              categories: {
                in: flattenedCategories,
              },
            },
          }
        : {}),
    })

    posts = fetchedProducts.docs
  } else {
    if (selectedDocs?.length) {
      const filteredSelectedPosts = selectedDocs
        .map((post) => {
          if (typeof post.value === 'object') return post.value
          return null
        })
        .filter((post): post is Product => Boolean(post))

      posts = filteredSelectedPosts
    }
  }

  return (
    <section className="my-16" id={`block-${id}`}>
      {introContent && (
        <div className="container mb-8 md:mb-10">
          <RichText
            className="ml-0 max-w-3xl [&_h2]:mb-3 [&_h2]:text-3xl [&_p]:text-muted-foreground md:[&_h2]:text-4xl"
            data={introContent}
            enableGutter={false}
          />
        </div>
      )}
      <CollectionArchive appearance={appearance || 'grid'} locale={locale} posts={posts} />
    </section>
  )
}
