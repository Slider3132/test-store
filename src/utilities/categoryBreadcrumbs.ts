import type { Category } from '@/payload-types'

const getParent = (category: Category): Category | null =>
  category.parent && typeof category.parent === 'object' ? category.parent : null

export const getCategoryBreadcrumbs = (category: Category) => {
  const breadcrumbs: Category[] = []
  let current: Category | null = category

  while (current) {
    breadcrumbs.unshift(current)
    current = getParent(current)
  }

  return breadcrumbs
}

export const getPrimaryProductCategory = (categories: ProductCategory[]) => {
  const populatedCategories = categories.filter(
    (category): category is Category => typeof category === 'object',
  )

  return (
    populatedCategories.find((category) => Boolean(getParent(category))) ||
    populatedCategories[0] ||
    null
  )
}

type ProductCategory = NonNullable<import('@/payload-types').Product['categories']>[number]
