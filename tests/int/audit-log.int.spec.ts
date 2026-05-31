import { describe, expect, it } from 'vitest'

import { AuditLogs } from '@/collections/AuditLogs'
import type { User } from '@/payload-types'
import type { Access } from 'payload'

const userWithRoles = (roles: NonNullable<User['roles']>): User =>
  ({
    id: 1,
    roles,
  }) as User

const runAccess = (access: Access, user: User | null = null) =>
  access({
    req: {
      user,
    },
  } as Parameters<Access>[0])

const getFieldNames = () => AuditLogs.fields.map((field) => ('name' in field ? field.name : null))

describe('audit log collection', () => {
  it('is append-only through public collection access', () => {
    expect(AuditLogs.access?.create?.({} as Parameters<NonNullable<typeof AuditLogs.access.create>>[0])).toBe(
      false,
    )
    expect(AuditLogs.access?.update?.({} as Parameters<NonNullable<typeof AuditLogs.access.update>>[0])).toBe(
      false,
    )
    expect(AuditLogs.access?.delete?.({} as Parameters<NonNullable<typeof AuditLogs.access.delete>>[0])).toBe(
      false,
    )
  })

  it('keeps audit read access limited to owner and admin', () => {
    expect(runAccess(AuditLogs.access?.read as Access, userWithRoles(['owner']))).toBe(true)
    expect(runAccess(AuditLogs.access?.read as Access, userWithRoles(['admin']))).toBe(true)
    expect(runAccess(AuditLogs.access?.read as Access, userWithRoles(['manager']))).toBe(false)
    expect(runAccess(AuditLogs.access?.read as Access, userWithRoles(['contentEditor']))).toBe(false)
    expect(runAccess(AuditLogs.access?.read as Access, userWithRoles(['customer']))).toBe(false)
    expect(runAccess(AuditLogs.access?.read as Access, null)).toBe(false)
  })

  it('exposes production audit envelope fields for the orchestrator', () => {
    expect(getFieldNames()).toEqual(
      expect.arrayContaining([
        'actorID',
        'actorEmail',
        'operation',
        'collectionSlug',
        'documentID',
        'before',
        'after',
        'requestID',
        'message',
      ]),
    )
  })
})
