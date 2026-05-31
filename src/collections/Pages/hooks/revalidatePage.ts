import type { CollectionAfterChangeHook, CollectionAfterDeleteHook } from 'payload'

import { revalidatePath, revalidateTag } from 'next/cache'

import type { Page } from '../../../payload-types'

export const revalidatePage: CollectionAfterChangeHook<Page> = ({
  doc,
  previousDoc,
  req: { payload, context },
}) => {
  if (!context.disableRevalidate) {
    if (doc._status === 'published') {
      const path = doc.slug === 'home' ? '/' : `/${doc.slug}`

      payload.logger.info(`Revalidating page at path: ${path}`)

      try {
        revalidatePath(path)
      } catch (error) {
        payload.logger.debug({ err: error }, `Page revalidation skipped for path: ${path}`)
      }
      //revalidateTag('pages-sitemap', 'max')
    }

    // If the page was previously published, we need to revalidate the old path
    if (previousDoc?._status === 'published' && doc._status !== 'published') {
      const oldPath = previousDoc.slug === 'home' ? '/' : `/${previousDoc.slug}`

      payload.logger.info(`Revalidating old page at path: ${oldPath}`)

      try {
        revalidatePath(oldPath)
      } catch (error) {
        payload.logger.debug({ err: error }, `Old page revalidation skipped for path: ${oldPath}`)
      }
      //revalidateTag('pages-sitemap', 'max')
    }
  }
  return doc
}

export const revalidateDelete: CollectionAfterDeleteHook<Page> = ({ doc, req: { context } }) => {
  if (!context.disableRevalidate) {
    const path = doc?.slug === 'home' ? '/' : `/${doc?.slug}`
    try {
      revalidatePath(path)
    } catch {
      // revalidatePath is only available inside a Next request/static generation context.
    }
    //revalidateTag('pages-sitemap', 'max')
  }

  return doc
}
