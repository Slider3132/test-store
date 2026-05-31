import type { FieldHook } from 'payload'

import type { User } from '@/payload-types'
import { checkRole } from '@/access/utilities'

const getRequestPath = (req: Parameters<FieldHook<User>>[0]['req']): string => {
  const request = req as typeof req & {
    originalUrl?: unknown
    path?: unknown
    route?: { path?: unknown }
  }
  const rawUrl =
    typeof request.url === 'string'
      ? request.url
      : typeof request.originalUrl === 'string'
        ? request.originalUrl
        : typeof request.path === 'string'
          ? request.path
          : typeof request.route?.path === 'string'
            ? request.route.path
            : ''

  try {
    return new URL(rawUrl, 'http://payload.local').pathname
  } catch {
    return rawUrl
  }
}

// Public self-registration must never bootstrap admin privileges.
// Payload's first-register endpoint is the trusted bootstrap flow for an empty database.
export const ensureFirstUserIsAdmin: FieldHook<User> = async ({ operation, req, value }) => {
  if (operation === 'create' && !req.user) {
    const isFirstRegisterRequest = getRequestPath(req).endsWith('/first-register')

    if (isFirstRegisterRequest) {
      const existingUsers = await req.payload.find({
        collection: 'users',
        depth: 0,
        limit: 0,
      })

      if (existingUsers.totalDocs === 0) {
        return ['owner']
      }
    }

    return ['customer']
  }

  if (operation === 'create' && !checkRole(['owner', 'admin'], req.user)) {
    return ['customer']
  }

  return value
}
