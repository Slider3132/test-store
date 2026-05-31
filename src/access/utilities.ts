import type { User } from '@/payload-types'
import type { Access } from 'payload'

export type AppRole = NonNullable<User['roles']>[number]

export const checkRole = (allRoles: AppRole[] = [], user?: User | null): boolean => {
  if (user && allRoles) {
    return allRoles.some((role) => {
      return user?.roles?.some((individualRole) => {
        return individualRole === role
      })
    })
  }

  return false
}

export const canManageCommerce = (user?: User | null) =>
  checkRole(['owner', 'admin', 'manager'], user)

export const canManageContent = (user?: User | null) =>
  checkRole(['owner', 'admin', 'contentEditor'], user)

export const canManageSettings = (user?: User | null) => checkRole(['owner', 'admin'], user)

export const manageCommerce: Access = ({ req: { user } }) => canManageCommerce(user)

export const manageContent: Access = ({ req: { user } }) => canManageContent(user)

export const manageSettings: Access = ({ req: { user } }) => canManageSettings(user)
