import { cn } from '@/utilities/cn'
import React from 'react'
import { RichText } from '@/components/RichText'
import type { DefaultDocumentIDType } from 'payload'
import type { ContentBlock as ContentBlockProps } from '@/payload-types'

import { CMSLink } from '../../components/Link'

export const ContentBlock: React.FC<
  ContentBlockProps & {
    id?: DefaultDocumentIDType
    className?: string
  }
> = (props) => {
  const { appearance = 'plain', columns } = props
  const isSpotlightSteps = appearance === 'spotlightSteps'

  const colsSpanClasses = {
    full: '12',
    half: '6',
    oneThird: '4',
    twoThirds: '8',
  }

  const isEnhanced = appearance !== 'plain'

  return (
    <section className="container my-16 md:my-20">
      <div
        className={cn('grid grid-cols-4 lg:grid-cols-12', {
          'gap-y-8 gap-x-16': !isEnhanced,
          'gap-4 lg:gap-6': isEnhanced && !isSpotlightSteps,
          'gap-5': isSpotlightSteps,
        })}
      >
        {columns &&
          columns.length > 0 &&
          columns.map((col, index) => {
            const { enableLink, link, richText, size } = col

            return (
              <div
                className={cn(`col-span-4 lg:col-span-${colsSpanClasses[size!]}`, {
                  'md:col-span-2': size !== 'full',
                  'rounded-lg border bg-card p-5 md:p-6': appearance === 'cards',
                  'rounded-lg border bg-background p-5 shadow-sm dark:border-neutral-800 md:p-6':
                    appearance === 'steps',
                  'min-h-56 rounded-lg p-6 text-white md:p-8':
                    appearance === 'spotlightSteps',
                  'bg-[linear-gradient(90deg,rgba(37,99,235,0.92),rgba(79,70,229,0.32)),url("/api/media/file/image-hero1-1.webp")] bg-cover bg-center lg:col-span-6':
                    appearance === 'spotlightSteps' && index === 0,
                  'bg-slate-950 dark:bg-slate-900 lg:col-span-3':
                    appearance === 'spotlightSteps' && index === 1,
                  'bg-indigo-950 dark:bg-indigo-950 lg:col-span-3':
                    appearance === 'spotlightSteps' && index === 2,
                  'rounded-lg border-l-2 border-r-0 border-y-0 border-primary/20 bg-muted/30 p-5 md:p-6':
                    appearance === 'quotes',
                })}
                key={index}
              >
                {appearance === 'steps' || appearance === 'spotlightSteps' ? (
                  <div
                    className={cn(
                      'mb-5 flex size-8 items-center justify-center rounded-full text-xs font-semibold',
                      appearance === 'steps' && 'bg-primary text-primary-foreground',
                      appearance === 'spotlightSteps' && 'text-white',
                      appearance === 'spotlightSteps' && index === 0 && 'bg-white/15',
                      appearance === 'spotlightSteps' && index !== 0 && 'bg-white/10',
                    )}
                  >
                    {String(index + 1).padStart(2, '0')}
                  </div>
                ) : null}

                {richText && (
                  <RichText
                    className={cn({
                      '[&_h2]:mb-4 [&_h3]:mb-3 [&_h3]:text-xl [&_p]:text-muted-foreground':
                        appearance === 'cards' || appearance === 'steps',
                      '[&_h3]:mb-3 [&_h3]:text-2xl [&_h3]:font-semibold [&_p]:max-w-md [&_p]:text-white/80':
                        appearance === 'spotlightSteps',
                      '[&_h2]:mb-5 [&_h3]:mb-3 [&_h3]:text-lg [&_p]:text-muted-foreground':
                        appearance === 'quotes',
                    })}
                    data={richText}
                    enableGutter={false}
                  />
                )}

                {enableLink && <CMSLink {...link} />}
              </div>
            )
          })}
      </div>
    </section>
  )
}
