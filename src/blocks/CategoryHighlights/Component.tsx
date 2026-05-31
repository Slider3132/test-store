import type { Category, Media as MediaType } from '@/payload-types'

import configPromise from '@payload-config'
import Link from 'next/link'
import { ArrowUpRight } from 'lucide-react'
import { getPayload } from 'payload'
import React from 'react'

import { Media } from '@/components/Media'
import { RichText } from '@/components/RichText'
import { getRequestLocale } from '@/i18n/request'
import { getCategoryHref } from '@/utilities/categoryLinks'
import { cn } from '@/utilities/cn'

type CategoryWithMedia = Category & {
  description?: string | null
  image?: MediaType | number | string | null
}

type Props = {
  appearance?: 'premiumTiles' | 'compactGrid'
  categories?: (CategoryWithMedia | number | string)[] | null
  id?: string | number
  introContent?: any
  limit?: number | null
  populateBy?: 'collection' | 'selection' | null
}

const getCategoryID = (category: CategoryWithMedia | number | string) =>
  typeof category === 'object' ? category.id : category

export const CategoryHighlightsBlock: React.FC<Props> = async ({
  appearance = 'premiumTiles',
  categories,
  id,
  introContent,
  limit = 6,
  populateBy = 'selection',
}) => {
  const locale = await getRequestLocale()
  const payload = await getPayload({ config: configPromise })

  const selectedCategoryIDs = categories?.map(getCategoryID)
  const result = await payload.find({
    collection: 'categories',
    depth: 1,
    limit: populateBy === 'collection' ? limit || 6 : selectedCategoryIDs?.length || 6,
    locale,
    sort: 'title',
    ...(populateBy === 'selection' && selectedCategoryIDs?.length
      ? {
          where: {
            id: {
              in: selectedCategoryIDs,
            },
          },
        }
      : {}),
  })

  const resolvedCategories = result.docs as CategoryWithMedia[]

  if (!resolvedCategories.length) return null

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

      <div className="container">
        <div
          className={cn(
            'grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3',
            appearance === 'compactGrid' && 'lg:grid-cols-4',
          )}
        >
          {resolvedCategories.map((category) => {
            const image = typeof category.image === 'object' ? category.image : null

            return (
              <Link
                className="group relative min-h-52 overflow-hidden rounded-lg border bg-card p-5 transition-colors hover:border-primary/30"
                href={getCategoryHref(category, locale)}
                key={category.id}
              >
                {image ? (
                  <Media
                    className="absolute inset-0 opacity-16 transition-opacity group-hover:opacity-24"
                    fill
                    imgClassName="object-cover"
                    resource={image}
                    size="33vw"
                  />
                ) : null}

                <div className="relative z-10 flex h-full min-h-40 flex-col justify-between">
                  <ArrowUpRight className="ml-auto h-5 w-5 text-muted-foreground transition-transform group-hover:-translate-y-0.5 group-hover:translate-x-0.5" />
                  <div>
                    <h3 className="text-2xl font-semibold tracking-normal">{category.title}</h3>
                    {category.description ? (
                      <p className="mt-3 max-w-sm text-sm leading-6 text-muted-foreground">
                        {category.description}
                      </p>
                    ) : null}
                  </div>
                </div>
              </Link>
            )
          })}
        </div>
      </div>
    </section>
  )
}
