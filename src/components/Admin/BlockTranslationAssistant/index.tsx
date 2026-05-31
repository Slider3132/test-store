'use client'

import { useLocale } from '@payloadcms/ui'
import { useRouter } from 'next/navigation'
import { useEffect, useMemo, useState } from 'react'

import {
  adminLocales,
  buildLocaleHref,
  getLocaleButtonState,
  isAdminLocaleCode,
} from './utils'

import './index.scss'

type TranslationAssistantProps = {
  field?: unknown
  localizedFields?: unknown
}

const copy = {
  uk: {
    label: 'Локаль',
  },
  ru: {
    label: 'Локаль',
  },
}

export const BlockTranslationAssistant = (_props: TranslationAssistantProps) => {
  const locale = useLocale()
  const router = useRouter()
  const [currentHref, setCurrentHref] = useState('')
  const activeLocale = isAdminLocaleCode(locale?.code) ? locale.code : 'uk'
  const dictionary = copy[activeLocale]

  useEffect(() => {
    setCurrentHref(window.location.href)
  }, [])

  const localeLinks = useMemo(
    () =>
      adminLocales.map((item) => ({
        ...item,
        href: currentHref ? buildLocaleHref(currentHref, item.code) : '#',
        state: getLocaleButtonState(activeLocale, item.code),
      })),
    [activeLocale, currentHref],
  )
  const switchLocale = (href: string) => {
    if (href === '#') return

    router.push(href, { scroll: false })
    router.refresh()
  }

  return (
    <div className="block-translation-assistant">
      <span className="block-translation-assistant__label">{dictionary.label}</span>
      <div
        aria-label={dictionary.label}
        className="block-translation-assistant__tabs"
        role="tablist"
      >
        {localeLinks.map((item) => (
          <button
            aria-current={item.state.ariaCurrent}
            aria-selected={item.state.isActive}
            className="block-translation-assistant__tab"
            data-active={item.state.isActive}
            key={item.code}
            onClick={() => switchLocale(item.href)}
            role="tab"
            type="button"
          >
            {item.label}
          </button>
        ))}
      </div>
    </div>
  )
}
