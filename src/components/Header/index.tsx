import { getGlobal } from '@/utilities/getGlobals'

import './index.css'
import { HeaderClient } from './index.client'
import { getRequestLocale } from '@/i18n/request'
import configPromise from '@payload-config'
import { getPayload } from 'payload'
import { getFeaturedProductCardsByID } from '@/utilities/getFeaturedProductCards'

export async function Header() {
  const locale = await getRequestLocale()
  const header = await getGlobal('header', 1, locale)
  const selectedMegaMenuCategoryIDs =
    header.navItems
      ?.filter((item) => item.showInHeader !== false && item.enableMegaMenu)
      .flatMap((item) => item.megaMenuCategories || [])
      .map((category) => (typeof category === 'object' ? category.id : category))
      .filter((id): id is number => typeof id === 'number') || []
  const payload = await getPayload({ config: configPromise })
  const categories = await payload.find({
    collection: 'categories',
    depth: 2,
    limit: 100,
    locale,
    sort: 'title',
    where: {
      showInMegaMenu: {
        not_equals: false,
      },
    },
  })
  const featuredProductIDs = categories.docs.flatMap((category) =>
    (category.featuredProducts || [])
      .map((product) => (typeof product === 'object' ? product.id : product))
      .filter((id): id is number => typeof id === 'number'),
  )
  const featuredProductsByID = await getFeaturedProductCardsByID({
    ids: featuredProductIDs,
    locale,
    payload,
  })

  const megaMenu = {
    categories: categories.docs.map((category) => ({
      description: category.description || null,
      featuredProducts:
        category.featuredProducts
          ?.map((product) => {
            const productID = typeof product === 'object' ? product.id : product

            return featuredProductsByID.get(productID)
          })
          .filter((product) => product !== undefined) || [],
      id: category.id,
      image: category.image && typeof category.image === 'object' ? category.image : null,
      parent:
        category.parent && typeof category.parent === 'object'
          ? category.parent.id
          : category.parent || null,
      slug: category.slug,
      title: category.title,
    })),
    selectedCategoryIDs: selectedMegaMenuCategoryIDs.length ? selectedMegaMenuCategoryIDs : [],
  }

  return <HeaderClient header={header} locale={locale} megaMenu={megaMenu} />
}
