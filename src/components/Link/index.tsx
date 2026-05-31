import type { Page, Product } from '@/payload-types'

import { Button, type ButtonProps } from '@/components/ui/button'
import { localizePath, type AppLocale } from '@/i18n/config'
import { cn } from '@/utilities/cn'
import Link from 'next/link'
import React from 'react'

type CMSLinkType = {
  appearance?: 'inline' | ButtonProps['variant']
  children?: React.ReactNode
  className?: string
  label?: string | null
  locale?: AppLocale
  newTab?: boolean | null
  onClick?: React.MouseEventHandler<HTMLAnchorElement>
  reference?: {
    relationTo: 'pages' | 'posts'
    value: Page | Product | string | number
  } | null
  size?: ButtonProps['size'] | null
  type?: 'custom' | 'reference' | null
  url?: string | null
}

export const CMSLink: React.FC<CMSLinkType> = (props) => {
  const {
    type,
    appearance = 'inline',
    children,
    className,
    label,
    locale = 'uk',
    newTab,
    onClick,
    reference,
    size: sizeFromProps,
    url,
  } = props

  const href =
    type === 'reference' && typeof reference?.value === 'object' && reference.value.slug
      ? `${reference?.relationTo !== 'pages' ? `/${reference?.relationTo}` : ''}/${
          reference.value.slug
        }`
      : url

  if (!href) return null

  const localizedHref = localizePath(href, locale)

  const size = appearance === 'link' ? 'clear' : sizeFromProps
  const newTabProps = newTab ? { rel: 'noopener noreferrer', target: '_blank' } : {}

  /* Ensure we don't break any styles set by richText */
  if (appearance === 'inline') {
    return (
      <Link className={cn(className)} href={localizedHref} onClick={onClick} {...newTabProps}>
        {label && label}
        {children && children}
      </Link>
    )
  }

  return (
    <Button asChild className={className} size={size} variant={appearance}>
      <Link className={cn(className)} href={localizedHref} onClick={onClick} {...newTabProps}>
        {label && label}
        {children && children}
      </Link>
    </Button>
  )
}
