import 'dotenv/config'

import configPromise from '@payload-config'
import { getPayload } from 'payload'

async function main() {
  const payload = await getPayload({ config: configPromise })

  const count = async (collection: string, where: any) => {
    const result = await payload.find({
      collection: collection as any,
      depth: 0,
      limit: 1,
      where,
    })

    return result.totalDocs
  }

  const products = await count('products', { slug: { like: 'demo-' } })
  const categories = await count('categories', { slug: { like: 'demo-' } })
  const media = await count('media', { filename: { like: 'demo-' } })
  const productTypes = await count('productTypes', { slug: { like: 'demo-' } })
  const demoProducts = await payload.find({
    collection: 'products',
    depth: 0,
    limit: 1000,
    where: {
      slug: {
        like: 'demo-',
      },
    },
  })
  const variants = await count('variants', {
    product: {
      in: demoProducts.docs.map((doc) => doc.id),
    },
  })
  const sample = await payload.find({
    collection: 'products',
    depth: 2,
    limit: 1,
    where: {
      slug: {
        equals: 'demo-basic-tee',
      },
    },
  })
  const sampleProduct = sample.docs[0]

  console.log(
    JSON.stringify(
      {
        categories,
        media,
        productTypes,
        products,
        sample: {
          availableVariantOptions: sampleProduct?.availableVariantOptions?.length ?? 0,
          compareAtPrice: sampleProduct?.compareAtPrice,
          gallery: sampleProduct?.gallery?.length ?? 0,
          productType: Boolean(sampleProduct?.productType),
          reviews: sampleProduct?.reviews?.length ?? 0,
          slug: sampleProduct?.slug,
        },
        variants,
      },
      null,
      2,
    ),
  )

  process.exit(0)
}

main().catch((error) => {
  console.error(error)
  process.exit(1)
})
