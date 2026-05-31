import { describe, expect, it } from 'vitest'

import {
  canManageCommerce,
  canManageContent,
  canManageSettings,
  checkRole,
  manageCommerce,
  manageContent,
  manageSettings,
} from '@/access/utilities'
import { adminOrCustomerOwner } from '@/access/adminOrCustomerOwner'
import { adminOrSelf } from '@/access/adminOrSelf'
import { isDocumentOwner } from '@/access/isDocumentOwner'
import type { User } from '@/payload-types'
import type { Access } from 'payload'

const userWithRoles = (roles: NonNullable<User['roles']>): User =>
  ({
    id: 1,
    roles,
  }) as User

const otherUser: User = {
  id: 2,
  roles: ['customer'],
} as User

const runAccess = (access: Access, user: User | null = null) =>
  access({
    req: {
      user,
    },
  } as Parameters<Access>[0])

describe('admin role matrix', () => {
  it('keeps settings restricted to owner and admin', () => {
    expect(canManageSettings(userWithRoles(['owner']))).toBe(true)
    expect(canManageSettings(userWithRoles(['admin']))).toBe(true)
    expect(canManageSettings(userWithRoles(['manager']))).toBe(false)
    expect(canManageSettings(userWithRoles(['contentEditor']))).toBe(false)
    expect(canManageSettings(userWithRoles(['customer']))).toBe(false)
  })

  it('allows manager commerce operations without opening settings', () => {
    expect(canManageCommerce(userWithRoles(['manager']))).toBe(true)
    expect(canManageCommerce(userWithRoles(['contentEditor']))).toBe(false)
    expect(canManageCommerce(userWithRoles(['customer']))).toBe(false)
  })

  it('allows content editor content operations without opening commerce', () => {
    expect(canManageContent(userWithRoles(['contentEditor']))).toBe(true)
    expect(canManageContent(userWithRoles(['manager']))).toBe(false)
    expect(canManageContent(userWithRoles(['customer']))).toBe(false)
  })

  it('checks any role from an allowed set', () => {
    expect(checkRole(['manager', 'contentEditor'], userWithRoles(['contentEditor']))).toBe(true)
    expect(checkRole(['manager', 'contentEditor'], userWithRoles(['customer']))).toBe(false)
  })
})

describe('access-level role API', () => {
  const owner = userWithRoles(['owner'])
  const admin = userWithRoles(['admin'])
  const manager = userWithRoles(['manager'])
  const contentEditor = userWithRoles(['contentEditor'])
  const customer = userWithRoles(['customer'])

  it('grants commerce access to owner, admin, and manager only', () => {
    expect(runAccess(manageCommerce, owner)).toBe(true)
    expect(runAccess(manageCommerce, admin)).toBe(true)
    expect(runAccess(manageCommerce, manager)).toBe(true)
    expect(runAccess(manageCommerce, contentEditor)).toBe(false)
    expect(runAccess(manageCommerce, customer)).toBe(false)
  })

  it('grants content access to owner, admin, and content editor only', () => {
    expect(runAccess(manageContent, owner)).toBe(true)
    expect(runAccess(manageContent, admin)).toBe(true)
    expect(runAccess(manageContent, contentEditor)).toBe(true)
    expect(runAccess(manageContent, manager)).toBe(false)
    expect(runAccess(manageContent, customer)).toBe(false)
  })

  it('keeps settings access limited to owner and admin', () => {
    expect(runAccess(manageSettings, owner)).toBe(true)
    expect(runAccess(manageSettings, admin)).toBe(true)
    expect(runAccess(manageSettings, manager)).toBe(false)
    expect(runAccess(manageSettings, contentEditor)).toBe(false)
    expect(runAccess(manageSettings, customer)).toBe(false)
  })

  it('treats owner and admin as full-access principals for self-boundary helpers', () => {
    expect(runAccess(adminOrSelf, owner)).toBe(true)
    expect(runAccess(adminOrSelf, admin)).toBe(true)
    expect(runAccess(adminOrCustomerOwner, owner)).toBe(true)
    expect(runAccess(adminOrCustomerOwner, admin)).toBe(true)
    expect(runAccess(isDocumentOwner, owner)).toBe(true)
    expect(runAccess(isDocumentOwner, admin)).toBe(true)
  })

  it('does not expand customer or staff self-boundaries into full access', () => {
    const ownUserFilter = { id: { equals: customer.id } }
    const otherUserFilter = { id: { equals: otherUser.id } }
    const customerFilter = { customer: { equals: customer.id } }
    const otherCustomerFilter = { customer: { equals: otherUser.id } }

    expect(runAccess(adminOrSelf, customer)).toEqual(ownUserFilter)
    expect(runAccess(adminOrSelf, otherUser)).toEqual(otherUserFilter)
    expect(runAccess(adminOrSelf, manager)).toEqual({ id: { equals: manager.id } })
    expect(runAccess(adminOrSelf, contentEditor)).toEqual({ id: { equals: contentEditor.id } })

    expect(runAccess(adminOrCustomerOwner, customer)).toEqual(customerFilter)
    expect(runAccess(adminOrCustomerOwner, otherUser)).toEqual(otherCustomerFilter)
    expect(runAccess(isDocumentOwner, customer)).toEqual(customerFilter)
    expect(runAccess(isDocumentOwner, otherUser)).toEqual(otherCustomerFilter)
  })
})
