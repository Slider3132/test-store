'use client'

import { FormError } from '@/components/forms/FormError'
import { FormItem } from '@/components/forms/FormItem'
import { Message } from '@/components/Message'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { useAuth } from '@/providers/Auth'
import Link from 'next/link'
import { useRouter, useSearchParams } from 'next/navigation'
import React, { useCallback, useRef, useState } from 'react'
import { useForm } from 'react-hook-form'
import { useDictionary, useLocale } from '@/i18n/client'
import { localizePath } from '@/i18n/config'
import { getSafeRedirect } from '@/utilities/safeRedirect'
import { buildCreateAccountPayload, type CreateAccountFormData } from './payload'

export const CreateAccountForm: React.FC = () => {
  const dictionary = useDictionary()
  const locale = useLocale()
  const searchParams = useSearchParams()
  const allParams = searchParams.toString() ? `?${searchParams.toString()}` : ''
  const { login } = useAuth()
  const router = useRouter()
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<null | string>(null)

  const {
    formState: { errors },
    handleSubmit,
    register,
    watch,
  } = useForm<CreateAccountFormData>()

  const password = useRef({})
  password.current = watch('password', '')

  const onSubmit = useCallback(
    async (data: CreateAccountFormData) => {
      const response = await fetch('/api/users', {
        body: JSON.stringify(buildCreateAccountPayload(data)),
        headers: {
          'Content-Type': 'application/json',
        },
        method: 'POST',
      })

      if (!response.ok) {
        const message =
          response.statusText ||
          (locale === 'ru' ? 'Ошибка при создании аккаунта.' : 'Помилка під час створення акаунта.')
        setError(message)
        return
      }

      const redirect = getSafeRedirect(
        searchParams.get('redirect'),
        localizePath('/account', locale),
      )

      const timer = setTimeout(() => {
        setLoading(true)
      }, 1000)

      try {
        await login(data)
        clearTimeout(timer)
        router.push(redirect)
      } catch (_) {
        clearTimeout(timer)
        setError(
          locale === 'ru'
            ? 'Ошибка в указанных учетных данных. Попробуйте еще раз.'
            : 'Помилка в указаних облікових даних. Спробуйте ще раз.',
        )
      }
    },
    [login, router, searchParams],
  )

  return (
    <form className="max-w-lg py-4" onSubmit={handleSubmit(onSubmit)}>
      <div className="prose dark:prose-invert mb-6">
        <p>{dictionary.auth.createAccountIntro}</p>
      </div>

      <Message error={error} />

      <div className="flex flex-col gap-8 mb-8">
        <FormItem>
          <Label htmlFor="email" className="mb-2">
            {dictionary.account.emailAddress}
          </Label>
          <Input
            id="email"
            {...register('email', { required: dictionary.auth.emailRequired })}
            type="email"
          />
          {errors.email && <FormError message={errors.email.message} />}
        </FormItem>

        <FormItem>
          <Label htmlFor="password" className="mb-2">
            {dictionary.account.newPassword}
          </Label>
          <Input
            id="password"
            {...register('password', { required: dictionary.auth.passwordRequired })}
            type="password"
          />
          {errors.password && <FormError message={errors.password.message} />}
        </FormItem>

        <FormItem>
          <Label htmlFor="passwordConfirm" className="mb-2">
            {dictionary.account.confirmPassword}
          </Label>
          <Input
            id="passwordConfirm"
            {...register('passwordConfirm', {
              required: dictionary.auth.passwordConfirmRequired,
              validate: (value) => value === password.current || dictionary.auth.passwordMismatch,
            })}
            type="password"
          />
          {errors.passwordConfirm && <FormError message={errors.passwordConfirm.message} />}
        </FormItem>
      </div>
      <Button disabled={loading} type="submit" variant="default">
        {loading ? dictionary.auth.processing : dictionary.auth.createAccount}
      </Button>

      <div className="prose dark:prose-invert mt-8">
        <p>
          {dictionary.auth.alreadyHaveAccount}
          <Link href={`${localizePath('/login', locale)}${allParams}`}>
            {dictionary.auth.login}
          </Link>
        </p>
      </div>
    </form>
  )
}
