import type { HeroBlock as HeroBlockProps } from '@/payload-types'

import { CMSLink } from '@/components/Link'
import { Media } from '@/components/Media'
import { RichText } from '@/components/RichText'
import { cn } from '@/utilities/cn'
import React, { type CSSProperties } from 'react'

const paddingClasses = {
  compact: 'py-14 md:py-18',
  large: 'py-20 md:py-28',
  screen: 'min-h-[calc(100vh-5rem)] py-20 md:py-28',
}

const overlayClasses = {
  none: '',
  soft: 'bg-black/25',
  strong: 'bg-black/55',
}

export const HeroBlock: React.FC<HeroBlockProps & { id?: string | number }> = ({
  backgroundColor,
  backgroundMedia,
  backgroundType = 'color',
  darkBackgroundColor,
  darkBackgroundMedia,
  darkThemeMedia,
  id,
  links,
  media,
  overlay = 'none',
  richText,
  textTheme = 'dark',
  variant = 'split',
  verticalPadding = 'large',
}) => {
  const hasMediaBackground = backgroundType === 'media' && backgroundMedia
  const hasSplitMedia = variant === 'split' && media
  const backgroundStyle =
    backgroundType === 'color' && backgroundColor
      ? ({
          '--hero-bg-dark': darkBackgroundColor || backgroundColor,
          '--hero-bg-light': backgroundColor,
        } as CSSProperties)
      : undefined

  return (
    <section
      className={cn(
        'relative isolate overflow-hidden',
        paddingClasses[verticalPadding || 'large'],
        backgroundType === 'color' && backgroundColor && 'bg-[var(--hero-bg-light)] dark:bg-[var(--hero-bg-dark)]',
        backgroundType !== 'color' && 'bg-background',
        textTheme === 'light' ? 'text-white' : 'text-foreground',
      )}
      data-theme={textTheme === 'light' ? 'dark' : undefined}
      id={id ? `block-${id}` : undefined}
      style={backgroundStyle}
    >
      {hasMediaBackground && typeof backgroundMedia === 'object' && (
        <div className="absolute inset-0 -z-20">
          <Media
            fill
            imgClassName={cn('object-cover', darkBackgroundMedia && 'dark:hidden')}
            priority
            resource={backgroundMedia}
            size="100vw"
          />
          {darkBackgroundMedia && typeof darkBackgroundMedia === 'object' && (
            <Media
              fill
              imgClassName="hidden object-cover dark:block"
              priority
              resource={darkBackgroundMedia}
              size="100vw"
            />
          )}
        </div>
      )}
      {hasMediaBackground && overlay !== 'none' && (
        <div className={cn('absolute inset-0 -z-10', overlayClasses[overlay || 'none'])} />
      )}

      <div
        className={cn(
          'container relative z-10',
          variant === 'split'
            ? 'grid items-center gap-10 lg:grid-cols-[minmax(0,0.92fr)_minmax(0,1.08fr)] lg:gap-16'
            : 'flex justify-center',
        )}
      >
        <div
          className={cn(
            'max-w-3xl',
            variant === 'centered' && 'mx-auto text-center',
            variant === 'background' && 'mx-auto max-w-4xl text-center',
          )}
        >
          <RichText
            className={cn(
              'ml-0 max-w-none',
              '[&_h1]:mb-5 [&_h1]:text-5xl [&_h1]:font-semibold [&_h1]:leading-[0.95] [&_h1]:tracking-normal md:[&_h1]:text-7xl',
              '[&_h2]:mb-5 [&_h2]:text-4xl [&_h2]:font-semibold [&_h2]:leading-tight md:[&_h2]:text-6xl',
              '[&_p]:max-w-2xl [&_p]:text-base [&_p]:leading-7 md:[&_p]:text-lg',
              textTheme === 'light'
                ? '[&_p]:text-white/80'
                : '[&_p]:text-muted-foreground dark:[&_p]:text-muted-foreground',
              (variant === 'centered' || variant === 'background') && '[&_p]:mx-auto',
            )}
            data={richText}
            enableGutter={false}
          />

          {Array.isArray(links) && links.length > 0 && (
            <div
              className={cn(
                'mt-8 flex flex-wrap gap-3',
                (variant === 'centered' || variant === 'background') && 'justify-center',
              )}
            >
              {links.map(({ link }, index) => (
                <CMSLink key={index} {...link} />
              ))}
            </div>
          )}
        </div>

        {hasSplitMedia && typeof media === 'object' && (
          <div className="relative mx-auto aspect-[4/3] w-full max-w-3xl overflow-hidden rounded-[1rem] bg-white/40 shadow-sm ring-1 ring-black/10 dark:bg-white/5 dark:ring-white/10">
            <Media
              fill
              imgClassName={cn('object-contain p-4 md:p-8', darkThemeMedia && 'dark:hidden')}
              priority
              resource={media}
              size="(max-width: 1024px) 100vw, 50vw"
            />
            {darkThemeMedia && typeof darkThemeMedia === 'object' && (
              <Media
                fill
                imgClassName="hidden object-contain p-4 dark:block md:p-8"
                priority
                resource={darkThemeMedia}
                size="(max-width: 1024px) 100vw, 50vw"
              />
            )}
          </div>
        )}
      </div>
    </section>
  )
}
