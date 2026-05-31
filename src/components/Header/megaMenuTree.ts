export type MegaMenuTreeCategory = {
  id: number | string
  parent?: number | string | null
}

const idOf = (value: number | string | null | undefined) => (value == null ? null : String(value))

const uniqueByID = <T extends MegaMenuTreeCategory>(items: T[]) => {
  const seen = new Set<string>()

  return items.filter((item) => {
    const id = idOf(item.id)
    if (!id || seen.has(id)) return false

    seen.add(id)
    return true
  })
}

export const isRootCategory = (category: MegaMenuTreeCategory) => !category.parent

export const getRootCategoryFor = <T extends MegaMenuTreeCategory>(
  category: T,
  categories: T[],
) => {
  const byID = new Map(categories.map((item) => [idOf(item.id), item]))
  let current: T | undefined = category

  while (current?.parent) {
    const parent = byID.get(idOf(current.parent))
    if (!parent) break
    current = parent
  }

  return current || category
}

export const hasAncestor = <T extends MegaMenuTreeCategory>(
  category: T,
  ancestorID: number | string,
  categories: T[],
) => {
  const byID = new Map(categories.map((item) => [idOf(item.id), item]))
  const targetID = idOf(ancestorID)
  let current: T | undefined = category

  while (current?.parent) {
    const parentID = idOf(current.parent)
    if (parentID === targetID) return true
    current = byID.get(parentID)
  }

  return false
}

export const getSelectedRootCategories = <T extends MegaMenuTreeCategory>(
  categories: T[],
  selectedCategoryIDs: Array<number | string>,
) => {
  const rootCategories = categories.filter(isRootCategory)
  const selectedIDSet = new Set(selectedCategoryIDs.map(String))

  if (!selectedIDSet.size) {
    return rootCategories.length ? rootCategories : categories
  }

  const selectedCategories = categories.filter((category) => selectedIDSet.has(String(category.id)))
  const selectedRoots = uniqueByID(
    selectedCategories.map((category) => getRootCategoryFor(category, categories)),
  )

  return selectedRoots.length ? selectedRoots : rootCategories.length ? rootCategories : categories
}

export const getVisibleChildCategories = <T extends MegaMenuTreeCategory>(
  activeCategory: T | undefined,
  categories: T[],
  selectedCategoryIDs: Array<number | string>,
) => {
  if (!activeCategory) return []

  const children = categories.filter(
    (category) => idOf(category.parent) === idOf(activeCategory.id),
  )
  const selectedIDSet = new Set(selectedCategoryIDs.map(String))

  if (!selectedIDSet.size || selectedIDSet.has(String(activeCategory.id))) {
    return children
  }

  const selectedChildren = children.filter((child) => {
    if (selectedIDSet.has(String(child.id))) return true

    return categories.some(
      (category) =>
        selectedIDSet.has(String(category.id)) && hasAncestor(category, child.id, categories),
    )
  })

  return selectedChildren.length ? selectedChildren : children
}
