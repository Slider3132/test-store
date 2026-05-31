import type { Footer } from '@/payload-types'

import { FooterMenu } from '@/components/Footer/menu'
import { getGlobal } from '@/utilities/getGlobals'
import Link from 'next/link'
import React from 'react'
import { LogoIcon } from '@/components/icons/logo'
import { getRequestLocale } from '@/i18n/request'
import { localizePath } from '@/i18n/config'
import { getDictionary } from '@/i18n/dictionary'

const { COMPANY_NAME, SITE_NAME } = process.env

export async function Footer() {
  const locale = await getRequestLocale()
  const dictionary = getDictionary(locale)
  const footer: Footer = await getGlobal('footer', 1, locale)
  const menu = footer.navItems || []
  const currentYear = new Date().getFullYear()
  const copyrightDate = 2023 + (currentYear > 2023 ? `-${currentYear}` : '')

  const configuredName = COMPANY_NAME || SITE_NAME || ''
  const copyrightName = /payload/i.test(configuredName)
    ? dictionary.common.storeName
    : configuredName || dictionary.common.storeName

  return (
    <footer className="border-t text-sm text-neutral-500 dark:border-neutral-800 dark:text-neutral-400">
      <div className="container">
        <div className="flex w-full flex-col gap-6 py-8 md:flex-row md:items-center md:justify-between">
          <div className="flex flex-col gap-3">
            <Link
              className="flex items-center gap-2 text-black dark:text-white"
              href={localizePath('/', locale)}
            >
              <LogoIcon className="w-5" />
              <span className="font-medium">{copyrightName}</span>
            </Link>
            <p>
              &copy; {copyrightDate} {copyrightName}
              {copyrightName.length && !copyrightName.endsWith('.') ? '.' : ''}{' '}
              {dictionary.common.allRightsReserved}
            </p>
          </div>
          <FooterMenu locale={locale} menu={menu} />
        </div>
      </div>
    </footer>
  )
}
