import type { Footer } from '@/payload-types'

import type { AppLocale } from '@/i18n/config'
import { localizePath } from '@/i18n/config'
import React from 'react'
import Link from 'next/link'

interface Props {
  locale: AppLocale
  menu: Footer['navItems']
}

export function FooterMenu({ locale, menu }: Props) {
  const links =
    menu
      ?.filter((item) => item.showInFooter !== false)
      .map((item) => ({
        href: item.link.url || '/',
        id: item.id,
        label: item.link.label,
      })) || []

  if (!links.length) return null

  return (
    <nav>
      <ul className="flex flex-wrap gap-x-6 gap-y-2">
        {links.map((item) => {
          return (
            <li key={item.id}>
              <Link className="hover:text-primary" href={localizePath(item.href, locale)}>
                {item.label}
              </Link>
            </li>
          )
        })}
      </ul>
    </nav>
  )
}
