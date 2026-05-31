import { describe, expect, it } from 'vitest'

import { collectionLabels } from '@/i18n/adminLabels'

describe('admin labels', () => {
  it('uses plain collection label strings so Payload admin actions do not render object placeholders', () => {
    Object.values(collectionLabels).forEach((labels) => {
      expect(typeof labels.singular).toBe('string')
      expect(typeof labels.plural).toBe('string')
      expect(String(labels.singular)).not.toBe('[object Object]')
      expect(String(labels.plural)).not.toBe('[object Object]')
    })
  })
})
