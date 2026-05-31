export type CreateAccountFormData = {
  email: string
  password: string
  passwordConfirm: string
}

export const buildCreateAccountPayload = (data: CreateAccountFormData) => ({
  email: data.email,
  password: data.password,
})
