import 'dotenv/config'

import configPromise from '@payload-config'
import { getPayload, type Payload } from 'payload'

const demoPrefix = 'demo-'
const args = new Set(process.argv.slice(2))
const dryRun = args.has('--dry-run')

const countDocs = async (
  payload: Payload,
  collection: 'categories' | 'media' | 'productTypes' | 'products',
) => {
  const field = collection === 'media' ? 'filename' : 'slug'
  const result = await payload.find({
    collection,
    depth: 0,
    limit: 1,
    where: {
      [field]: {
        like: demoPrefix,
      },
    },
  })

  return result.totalDocs
}

const getDemoCategoryIDs = async (payload: Payload) => {
  const result = await payload.find({
    collection: 'categories',
    depth: 0,
    limit: 1000,
    select: {
      slug: true,
    },
    where: {
      slug: {
        like: demoPrefix,
      },
    },
  })

  return new Set(result.docs.map((category) => String(category.id)))
}

const getDemoProductIDs = async (payload: Payload) => {
  const result = await payload.find({
    collection: 'products',
    depth: 0,
    limit: 1000,
    select: {
      slug: true,
    },
    where: {
      slug: {
        like: demoPrefix,
      },
    },
  })

  return result.docs.map((product) => product.id)
}

const cleanupHeaderDemoCategoryRefs = async (payload: Payload, demoCategoryIDs: Set<string>) => {
  for (const locale of ['uk', 'ru'] as const) {
    const header = await payload.findGlobal({
      slug: 'header',
      locale,
    })
    const navItems = (header.navItems || [])
      .map((navItem: any) => {
        const megaMenuCategories = (navItem.megaMenuCategories || []).filter((category: any) => {
          const id = typeof category === 'object' ? category.id : category

          return !demoCategoryIDs.has(String(id))
        })

        return {
          ...navItem,
          megaMenuCategories,
        }
      })
      .filter((navItem: any) => {
        const isCatalogNavItem = navItem.link?.type === 'custom' && navItem.link?.url === '/catalog'

        return !isCatalogNavItem || navItem.megaMenuCategories.length > 0
      })

    await payload.updateGlobal({
      slug: 'header',
      data: { navItems } as any,
      locale,
    })
  }
}

const deleteDemoDocs = async (
  payload: Payload,
  collection: 'categories' | 'media' | 'productTypes' | 'products',
) => {
  const field = collection === 'media' ? 'filename' : 'slug'

  await payload.delete({
    collection,
    depth: 0,
    where: {
      [field]: {
        like: demoPrefix,
      },
    },
  })
}

async function main() {
  const payload = await getPayload({ config: configPromise })
  const counts = {
    categories: await countDocs(payload, 'categories'),
    media: await countDocs(payload, 'media'),
    productTypes: await countDocs(payload, 'productTypes'),
    products: await countDocs(payload, 'products'),
  }
  const demoCategoryIDs = await getDemoCategoryIDs(payload)
  const demoProductIDs = await getDemoProductIDs(payload)

  payload.logger.info(
    `Demo catalog cleanup target: ${counts.products} products, ${counts.categories} categories, ${counts.productTypes} product types, ${counts.media} media files`,
  )

  if (dryRun) {
    payload.logger.info('Dry run only. Nothing was deleted.')
    process.exit(0)
  }

  await cleanupHeaderDemoCategoryRefs(payload, demoCategoryIDs)
  if (demoProductIDs.length) {
    await payload.delete({
      collection: 'variants',
      depth: 0,
      where: {
        product: {
          in: demoProductIDs,
        },
      },
    })
  }
  await deleteDemoDocs(payload, 'products')
  await deleteDemoDocs(payload, 'categories')
  await deleteDemoDocs(payload, 'productTypes')
  await deleteDemoDocs(payload, 'media')

  payload.logger.info('Demo catalog cleanup complete')
  process.exit(0)
}

main().catch((error) => {
  console.error(error)
  process.exit(1)
})
