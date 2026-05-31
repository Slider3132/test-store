import type { FieldAccess } from 'payload'

import { checkRole } from '@/access/utilities'

export const adminOnlyFieldAccess: FieldAccess = ({ req: { user } }) => {
  if (user) return checkRole(['owner', 'admin'], user)

  return false
}
