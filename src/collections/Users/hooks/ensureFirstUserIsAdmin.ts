import type { FieldHook } from 'payload'

import type { User } from '@/payload-types'
import { checkRole } from '@/access/utilities'

// Public self-registration must never bootstrap admin privileges.
// Owner/admin users can still set roles explicitly from trusted admin flows.
export const ensureFirstUserIsAdmin: FieldHook<User> = async ({ operation, req, value }) => {
  if (operation === 'create' && !checkRole(['owner', 'admin'], req.user)) {
    return ['customer']
  }

  return value
}
