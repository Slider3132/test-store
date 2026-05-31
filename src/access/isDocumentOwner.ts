import type { Access } from 'payload'

import { checkRole } from '@/access/utilities'

/**
 * Atomic access checker that verifies if the user owns the document being accessed.
 * Returns a Where query to filter documents by the customer field.
 *
 * Owners and admins have full access, authenticated users get filtered by customer field,
 * and unauthenticated users are denied access.
 *
 * @returns true for owners and admins, Where query for customers, false for guests
 */
export const isDocumentOwner: Access = ({ req }) => {
  // Owner and admin have full access
  if (req.user && checkRole(['owner', 'admin'], req.user)) {
    return true
  }

  // Authenticated user - return Where query to filter by customer
  if (req.user?.id) {
    return {
      customer: {
        equals: req.user.id,
      },
    }
  }

  // Guest - no access
  return false
}
