import type { Metadata } from 'next'

import { RenderBlocks } from '@/blocks/RenderBlocks'
import { getRequestLocale } from '@/i18n/request'
import type { Page as PageType } from '@/payload-types'
import { generateMeta } from '@/utilities/generateMeta'
import configPromise from '@payload-config'
import { draftMode } from 'next/headers'
import { notFound } from 'next/navigation'
import { getPayload } from 'payload'
import React from 'react'

export default async function HomePage() {
  const locale = await getRequestLocale()
  const page = await queryHomePage({ locale })

  if (!page) {
    return notFound()
  }

  const { layout } = page

  return (
    <article className="pt-16 pb-24">
      <RenderBlocks blocks={layout} />
    </article>
  )
}

export async function generateMetadata(): Promise<Metadata> {
  const locale = await getRequestLocale()
  const page = await queryHomePage({ locale })

  if (!page) {
    return {}
  }

  return generateMeta({ doc: page })
}

async function queryHomePage({ locale }: { locale: 'uk' | 'ru' }): Promise<PageType | null> {
  const { isEnabled: draft } = await draftMode()
  const payload = await getPayload({ config: configPromise })

  const result = await payload.find({
    collection: 'pages',
    draft,
    limit: 1,
    locale,
    overrideAccess: draft,
    pagination: false,
    where: {
      and: [
        {
          slug: {
            equals: 'home',
          },
        },
        ...(draft ? [] : [{ _status: { equals: 'published' } }]),
      ],
    },
  })

  return result.docs?.[0] || null
}
