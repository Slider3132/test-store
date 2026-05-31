import { describe, expect, it, vi } from 'vitest'

import { ensureFirstUserIsAdmin } from '@/collections/Users/hooks/ensureFirstUserIsAdmin'

describe('user registration security', () => {
  it('keeps public self-registration on the customer role even for the first user', async () => {
    const value = await ensureFirstUserIsAdmin({
      operation: 'create',
      req: {
        payload: {
          find: vi.fn(async () => ({ totalDocs: 0 })),
        },
        user: undefined,
      },
      value: ['customer'],
    } as any)

    expect(value).toEqual(['customer'])
  })

  it('does not preserve submitted privileged roles from public self-registration', async () => {
    const value = await ensureFirstUserIsAdmin({
      operation: 'create',
      req: {
        payload: {
          find: vi.fn(async () => ({ totalDocs: 0 })),
        },
        user: undefined,
      },
      value: ['admin'],
    } as any)

    expect(value).toEqual(['customer'])
  })
})
