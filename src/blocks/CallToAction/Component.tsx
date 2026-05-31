import React from 'react'

import type { CallToActionBlock as CTABlockProps } from '@/payload-types'
import { RichText } from '@/components/RichText'
import { CMSLink } from '@/components/Link'
import { cn } from '@/utilities/cn'

export const CallToActionBlock: React.FC<
  CTABlockProps & {
    id?: string | number
    className?: string
  }
> = ({ appearance = 'premiumBand', links, richText }) => {
  const isLegacy = appearance === 'legacy'

  return (
    <div className="container">
      <div
        className={cn(
          'border-border border flex flex-col gap-8 md:flex-row md:justify-between md:items-center',
          isLegacy
            ? 'bg-card rounded p-4'
            : 'relative overflow-hidden rounded-lg bg-card p-6 md:p-8 lg:p-10',
        )}
      >
        <div className="max-w-3xl flex items-center">
          {richText && (
            <RichText
              className={cn('mb-0', {
                '[&_h2]:mb-3 [&_h2]:text-3xl [&_p]:text-muted-foreground md:[&_h2]:text-4xl':
                  !isLegacy,
              })}
              data={richText}
              enableGutter={false}
            />
          )}
        </div>
        <div className={cn('flex flex-col', isLegacy ? 'gap-8' : 'gap-3 sm:flex-row')}>
          {(links || []).map(({ link }, i) => {
            return <CMSLink key={i} size="lg" {...link} />
          })}
        </div>
      </div>
    </div>
  )
}
