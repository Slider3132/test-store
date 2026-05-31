import 'dotenv/config'

import configPromise from '@payload-config'
import { getPayload } from 'payload'
import { homePageData } from '@/endpoints/seed/home'

const locales = ['uk', 'ru'] as const

const replaceShopLinks = (value: unknown): unknown => {
  if (Array.isArray(value)) return value.map(replaceShopLinks)

  if (value && typeof value === 'object') {
    return Object.fromEntries(
      Object.entries(value).map(([key, entry]) => [
        key,
        key === 'url' && entry === '/shop' ? '/catalog' : replaceShopLinks(entry),
      ]),
    )
  }

  return value
}

const mergeExistingIds = <T>(source: T, existing: unknown): T => {
  if (Array.isArray(source)) {
    const existingItems = Array.isArray(existing) ? existing : []

    return source.map((item, index) => mergeExistingIds(item, existingItems[index])) as T
  }

  if (!source || typeof source !== 'object' || !existing || typeof existing !== 'object') {
    return source
  }

  const sourceRecord = source as Record<string, unknown>
  const existingRecord = existing as Record<string, unknown>
  const next: Record<string, unknown> = { ...sourceRecord }

  if (existingRecord.id && !next.id) {
    next.id = existingRecord.id
  }

  for (const key of Object.keys(next)) {
    if (key in existingRecord) {
      next[key] = mergeExistingIds(next[key], existingRecord[key])
    }
  }

  return next as T
}

const main = async () => {
  const payload = await getPayload({ config: configPromise })

  const existingHome = await payload.find({
    collection: 'pages',
    depth: 0,
    limit: 1,
    fallbackLocale: false,
    locale: 'uk',
    overrideAccess: true,
    where: {
      slug: {
        equals: 'home',
      },
    },
  })

  const rootCategories = await payload.find({
    collection: 'categories',
    depth: 1,
    limit: 3,
    locale: 'uk',
    overrideAccess: true,
    sort: 'title',
    where: {
      parent: {
        exists: false,
      },
    },
  })
  const categories =
    rootCategories.docs.length >= 3
      ? rootCategories
      : await payload.find({
          collection: 'categories',
          depth: 1,
          limit: 3,
          locale: 'uk',
          overrideAccess: true,
          sort: 'title',
        })
  const media = await payload.find({
    collection: 'media',
    depth: 0,
    limit: 2,
    overrideAccess: true,
  })
  const [metaImage, darkThemeImage = metaImage] = media.docs

  if (categories.docs.length && metaImage) {
    const baseArgs = {
      categories: categories.docs,
      darkThemeImage,
      metaImage,
    }
    const ukData = homePageData(baseArgs, 'uk')
    const home =
      existingHome.totalDocs > 0
        ? await payload.update({
            collection: 'pages',
            data: ukData,
            id: existingHome.docs[0].id,
            locale: 'uk',
            overrideAccess: true,
          })
        : await payload.create({
            collection: 'pages',
            data: ukData,
            locale: 'uk',
            overrideAccess: true,
          })

    const canonicalHome = await payload.findByID({
      collection: 'pages',
      depth: 1,
      id: home.id,
      locale: 'uk',
      overrideAccess: true,
    })

    for (const locale of locales.filter((locale) => locale !== 'uk')) {
      const localizedData = homePageData(baseArgs, locale)

      await payload.update({
        collection: 'pages',
        data: mergeExistingIds(localizedData, canonicalHome),
        id: home.id,
        locale,
        overrideAccess: true,
      })
    }
  }

  const pages = await payload.find({
    collection: 'pages',
    depth: 1,
    limit: 100,
    locale: 'uk',
    overrideAccess: true,
  })

  for (const page of pages.docs) {
    const next = replaceShopLinks(page) as typeof page

    if (JSON.stringify(next.layout) !== JSON.stringify(page.layout)) {
      await payload.update({
        collection: 'pages',
        data: {
          layout: mergeExistingIds(next.layout, page.layout),
        },
        id: page.id,
        locale: 'uk',
        overrideAccess: true,
      })

      const canonicalPage = await payload.findByID({
        collection: 'pages',
        depth: 1,
        id: page.id,
        locale: 'uk',
        overrideAccess: true,
      })

      for (const locale of locales.filter((locale) => locale !== 'uk')) {
        const localizedPage = await payload.findByID({
          collection: 'pages',
          depth: 1,
          fallbackLocale: false,
          id: page.id,
          locale,
          overrideAccess: true,
        })

        await payload.update({
          collection: 'pages',
          data: {
            layout: mergeExistingIds(
              replaceShopLinks(localizedPage.layout),
              canonicalPage.layout,
            ) as typeof localizedPage.layout,
          },
          id: page.id,
          locale,
          overrideAccess: true,
        })
      }
    }
  }

  payload.logger.info('Updated CMS page links from /shop to /catalog')
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error)
    process.exit(1)
  })
