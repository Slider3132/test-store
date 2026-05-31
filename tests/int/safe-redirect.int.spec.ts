import { describe, expect, it } from 'vitest'

import { getSafeRedirect } from '@/utilities/safeRedirect'

describe('getSafeRedirect', () => {
  it('allows relative checkout redirects', () => {
    expect(getSafeRedirect('/checkout', '/account')).toBe('/checkout')
  })

  it('allows localized relative checkout redirects', () => {
    expect(getSafeRedirect('/ru/checkout', '/account')).toBe('/ru/checkout')
  })

  it('rejects absolute URL redirects', () => {
    expect(getSafeRedirect('https://evil.example', '/account')).toBe('/account')
  })

  it('rejects protocol-relative redirects', () => {
    expect(getSafeRedirect('//evil.example', '/account')).toBe('/account')
  })

  it('rejects admin redirects', () => {
    expect(getSafeRedirect('/admin', '/account')).toBe('/account')
  })

  it('rejects localized admin redirects', () => {
    expect(getSafeRedirect('/ru/admin', '/account')).toBe('/account')
  })

  it('rejects localized api redirects', () => {
    expect(getSafeRedirect('/ru/api/users', '/account')).toBe('/account')
  })

  it('rejects localized next redirects', () => {
    expect(getSafeRedirect('/ru/next/seed', '/account')).toBe('/account')
  })

  it('rejects blocked localized redirects with query strings', () => {
    expect(getSafeRedirect('/ru/admin?from=login', '/account')).toBe('/account')
  })
})
