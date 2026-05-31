import { describe, expect, it } from 'vitest'

import { sorting } from '@/lib/constants'
import { sanitizeProductSort } from '@/utilities/sanitizeProductSort'

describe('sanitizeProductSort', () => {
  it('allows known product sort values', () => {
    for (const item of sorting) {
      if (item.slug) {
        expect(sanitizeProductSort(item.slug)).toBe(item.slug)
      }
    }
  })

  it('falls back to title for unknown sort values', () => {
    expect(sanitizeProductSort('updatedAt')).toBe('title')
    expect(sanitizeProductSort('title;drop table products')).toBe('title')
  })

  it('uses the first value from array search params', () => {
    expect(sanitizeProductSort(['-createdAt', 'updatedAt'])).toBe('-createdAt')
    expect(sanitizeProductSort(['updatedAt', '-createdAt'])).toBe('title')
  })

  it('falls back to title when no sort value is provided', () => {
    expect(sanitizeProductSort(undefined)).toBe('title')
  })
})
