import { sorting } from '@/lib/constants'

const allowed = new Set(sorting.map((item) => item.slug))

export const sanitizeProductSort = (value: string | string[] | undefined) => {
  const selected = Array.isArray(value) ? value[0] : value

  return selected && allowed.has(selected) ? selected : 'title'
}
