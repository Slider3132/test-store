import type { Metadata } from 'next'

import { RenderBlocks } from '@/blocks/RenderBlocks'
import { generateMeta } from '@/utilities/generateMeta'
import configPromise from '@payload-config'
import { getPayload } from 'payload'
import { draftMode } from 'next/headers'
import { homeStaticData } from '@/endpoints/seed/home-static'
import React from 'react'

import type { Page } from '@/payload-types'
import { notFound } from 'next/navigation'
import { getRequestLocale } from '@/i18n/request'
import type { AppLocale } from '@/i18n/config'

export async function generateStaticParams() {
  const payload = await getPayload({ config: configPromise })
  const pages = await payload.find({
    collection: 'pages',
    draft: false,
    limit: 1000,
    overrideAccess: false,
    pagination: false,
    select: {
      slug: true,
    },
  })

  const params = pages.docs
    ?.filter((doc) => {
      return doc.slug !== 'home'
    })
    .map(({ slug }) => {
      return { slug }
    })

  return params
}

type Args = {
  params: Promise<{
    slug?: string
  }>
}

export default async function Page({ params }: Args) {
  const locale = await getRequestLocale()
  const { slug = 'home' } = await params
  const url = '/' + slug

  let page = await queryPageBySlug({
    locale,
    slug,
  })

  // Remove this code once your website is seeded
  if (!page && slug === 'home') {
    page = homeStaticData(locale) as Page
  }

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

export async function generateMetadata({ params }: Args): Promise<Metadata> {
  const locale = await getRequestLocale()
  const { slug = 'home' } = await params

  const page = await queryPageBySlug({
    locale,
    slug,
  })

  return generateMeta({ doc: page })
}

const queryPageBySlug = async ({ locale, slug }: { locale: AppLocale; slug: string }) => {
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
            equals: slug,
          },
        },
        ...(draft ? [] : [{ _status: { equals: 'published' } }]),
      ],
    },
  })

  return result.docs?.[0] || null
}
