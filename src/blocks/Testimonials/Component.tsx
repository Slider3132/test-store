import type { Media as MediaType } from '@/payload-types'

import { Star } from 'lucide-react'
import React from 'react'

import { Media } from '@/components/Media'
import { RichText } from '@/components/RichText'
import { cn } from '@/utilities/cn'

type TestimonialItem = {
  authorName: string
  authorRole?: string | null
  avatar?: MediaType | number | string | null
  id?: string | null
  quote: string
  rating?: number | null
}

type Props = {
  appearance?: 'premiumCards'
  id?: string | number
  introContent?: any
  items?: TestimonialItem[] | null
}

export const TestimonialsBlock: React.FC<Props> = ({
  id,
  introContent,
  items,
}) => {
  if (!items?.length) return null

  return (
    <section className="my-20 bg-muted/60 py-14 md:py-20" id={id ? `block-${id}` : undefined}>
      <div className="container">
        {introContent ? (
          <RichText
            className="mb-10 ml-0 max-w-2xl [&_h2]:text-4xl [&_h2]:leading-tight md:[&_h2]:text-5xl"
            data={introContent}
            enableGutter={false}
          />
        ) : null}

        <div className="grid grid-cols-1 gap-5 md:grid-cols-3">
          {items.map((item, index) => {
            const avatar = item.avatar && typeof item.avatar === 'object' ? item.avatar : null
            const rating = Math.max(1, Math.min(5, item.rating || 5))

            return (
              <article
                className="flex min-h-64 flex-col justify-between rounded-lg bg-background p-6 shadow-sm ring-1 ring-border/60 md:p-7"
                key={item.id || `${item.authorName}-${index}`}
              >
                <div>
                  <div
                    aria-label={`${rating} / 5`}
                    className="mb-6 flex items-center gap-0.5 text-amber-500"
                  >
                    {Array.from({ length: 5 }).map((_, starIndex) => (
                      <Star
                        className={cn('size-4', starIndex < rating && 'fill-current')}
                        key={starIndex}
                      />
                    ))}
                  </div>

                  <blockquote className="text-base leading-7 text-muted-foreground">
                    “{item.quote}”
                  </blockquote>
                </div>

                <footer className="mt-8 flex items-center gap-3">
                  {avatar ? (
                    <Media
                      className="relative size-11 overflow-hidden rounded-full bg-muted"
                      fill
                      imgClassName="object-cover"
                      resource={avatar}
                      size="44px"
                    />
                  ) : (
                    <div className="flex size-11 items-center justify-center rounded-full bg-muted text-sm font-semibold">
                      {item.authorName.slice(0, 1)}
                    </div>
                  )}
                  <div>
                    <div className="font-semibold leading-5">{item.authorName}</div>
                    {item.authorRole ? (
                      <div className="text-sm text-muted-foreground">{item.authorRole}</div>
                    ) : null}
                  </div>
                </footer>
              </article>
            )
          })}
        </div>
      </div>
    </section>
  )
}
