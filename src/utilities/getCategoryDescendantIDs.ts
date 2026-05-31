import type { Payload } from 'payload'

const toID = (value: unknown): number | string | null => {
  if (typeof value === 'number' || typeof value === 'string') return value
  if (value && typeof value === 'object' && 'id' in value) {
    const id = (value as { id?: unknown }).id

    if (typeof id === 'number' || typeof id === 'string') return id
  }

  return null
}

export const getCategoryDescendantIDs = async ({
  categoryID,
  payload,
}: {
  categoryID: number | string
  payload: Payload
}) => {
  const categories = await payload.find({
    collection: 'categories',
    depth: 0,
    limit: 500,
    overrideAccess: false,
    select: {
      parent: true,
    },
  })
  const parentToChildren = categories.docs.reduce<Record<string, Array<number | string>>>(
    (groups, category) => {
      const parentID = toID(category.parent)

      if (!parentID) return groups

      return {
        ...groups,
        [String(parentID)]: [...(groups[String(parentID)] || []), category.id],
      }
    },
    {},
  )
  const result: Array<number | string> = []
  const queue = [...(parentToChildren[String(categoryID)] || [])]

  while (queue.length) {
    const id = queue.shift()

    if (!id || result.some((existingID) => String(existingID) === String(id))) continue

    result.push(id)
    queue.push(...(parentToChildren[String(id)] || []))
  }

  return result
}

export const getCategoryAndDescendantIDs = async ({
  categoryID,
  payload,
}: {
  categoryID: number | string
  payload: Payload
}) => [categoryID, ...(await getCategoryDescendantIDs({ categoryID, payload }))]

export const getProductCategoryWhere = (categoryIDs: Array<number | string>) => ({
  or: categoryIDs.map((categoryID) => ({
    categories: {
      contains: categoryID,
    },
  })),
})
