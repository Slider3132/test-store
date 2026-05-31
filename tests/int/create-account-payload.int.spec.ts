import { describe, expect, it } from 'vitest'

import { buildCreateAccountPayload } from '@/components/forms/CreateAccountForm/payload'

describe('create account payload', () => {
  it('does not send password confirmation to Payload user create endpoint', () => {
    expect(
      buildCreateAccountPayload({
        email: 'customer@example.com',
        password: 'secret-password',
        passwordConfirm: 'secret-password',
      }),
    ).toEqual({
      email: 'customer@example.com',
      password: 'secret-password',
    })
  })
})
