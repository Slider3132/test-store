import type { Config } from 'src/payload-types'

import configPromise from '@payload-config'
import { getPayload } from 'payload'
import { unstable_cache } from 'next/cache'
import type { AppLocale } from '@/i18n/config'

type Global = keyof Config['globals']

export async function getGlobal<T extends Global>(slug: T, depth = 0, locale: AppLocale = 'uk') {
  const payload = await getPayload({ config: configPromise })

  const global = await payload.findGlobal({
    slug,
    depth,
    locale,
  })

  return global
}

/**
 * Returns a unstable_cache function mapped with the cache tag for the slug
 */
export const getCachedGlobal = <T extends Global>(slug: T, depth = 0, locale: AppLocale = 'uk') =>
  unstable_cache(async () => getGlobal<T>(slug, depth, locale), [slug, locale], {
    tags: [`global_${slug}_${locale}`],
  })
