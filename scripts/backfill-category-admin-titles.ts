import 'dotenv/config'

import configPromise from '@payload-config'
import { getPayload, type Payload } from 'payload'

const locales = ['uk', 'ru'] as const

const relationID = (value: unknown) => {
  if (!value) return undefined
  if (typeof value === 'object' && 'id' in value)
    return String((value as { id: number | string }).id)

  return String(value)
}

const fetchCategories = async (payload: Payload, locale: (typeof locales)[number]) => {
  const result = await payload.find({
    collection: 'categories',
    depth: 0,
    limit: 1000,
    locale,
    pagination: false,
    select: {
      parent: true,
      slug: true,
      title: true,
    },
    sort: 'createdAt',
    where: {
      slug: {
        like: 'demo-',
      },
    },
  })

  return result.docs
}

const resolveTitlePath = (
  category: any,
  categoryByID: Map<string, any>,
  cache: Map<string, string>,
): string => {
  const id = String(category.id)
  const cached = cache.get(id)

  if (cached) return cached

  const title = category.title || category.slug || id
  const parentID = relationID(category.parent)
  const parent = parentID ? categoryByID.get(parentID) : undefined
  const path: string = parent
    ? `${resolveTitlePath(parent, categoryByID, cache)} / ${title}`
    : title

  cache.set(id, path)

  return path
}

async function main() {
  const payload = await getPayload({ config: configPromise })

  for (const locale of locales) {
    const categories = await fetchCategories(payload, locale)
    const categoryByID = new Map(categories.map((category) => [String(category.id), category]))
    const cache = new Map<string, string>()

    payload.logger.info(`Backfilling category admin titles for ${locale}: ${categories.length}`)

    for (const category of categories) {
      await payload.update({
        collection: 'categories',
        id: category.id,
        data: {
          adminTitle: resolveTitlePath(category, categoryByID, cache),
          slug: category.slug,
        } as any,
        locale,
      })
    }
  }

  payload.logger.info('Category admin title backfill complete')
  process.exit(0)
}

main().catch((error) => {
  console.error(error)
  process.exit(1)
})
