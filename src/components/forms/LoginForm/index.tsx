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
import React, { useCallback, useRef } from 'react'
import { useForm } from 'react-hook-form'
import { useDictionary, useLocale } from '@/i18n/client'
import { localizePath } from '@/i18n/config'
import { getSafeRedirect } from '@/utilities/safeRedirect'

type FormData = {
  email: string
  password: string
}

export const LoginForm: React.FC = () => {
  const dictionary = useDictionary()
  const locale = useLocale()
  const searchParams = useSearchParams()
  const allParams = searchParams.toString() ? `?${searchParams.toString()}` : ''
  const redirect = useRef(
    getSafeRedirect(searchParams.get('redirect'), localizePath('/account', locale)),
  )
  const { login } = useAuth()
  const router = useRouter()
  const [error, setError] = React.useState<null | string>(null)

  const {
    formState: { errors, isLoading },
    handleSubmit,
    register,
  } = useForm<FormData>()

  const onSubmit = useCallback(
    async (data: FormData) => {
      try {
        await login(data)
        router.push(redirect.current)
      } catch (_) {
        setError(
          locale === 'ru'
            ? 'Ошибка в указанных учетных данных. Попробуйте еще раз.'
            : 'Помилка в указаних облікових даних. Спробуйте ще раз.',
        )
      }
    },
    [login, router],
  )

  return (
    <form className="" onSubmit={handleSubmit(onSubmit)}>
      <Message className="classes.message" error={error} />
      <div className="flex flex-col gap-8">
        <FormItem>
          <Label htmlFor="email">{dictionary.auth.email}</Label>
          <Input
            id="email"
            type="email"
            {...register('email', { required: dictionary.auth.emailRequired })}
          />
          {errors.email && <FormError message={errors.email.message} />}
        </FormItem>

        <FormItem>
          <Label htmlFor="password">{dictionary.auth.password}</Label>
          <Input
            id="password"
            type="password"
            {...register('password', { required: dictionary.auth.passwordRequired })}
          />
          {errors.password && <FormError message={errors.password.message} />}
        </FormItem>

        <div className="text-primary/70 mb-6 prose prose-a:hover:text-primary dark:prose-invert">
          <p>
            {dictionary.auth.forgotPasswordQuestion}
            <Link href={`${localizePath('/forgot-password', locale)}${allParams}`}>
              {dictionary.auth.clickReset}
            </Link>
          </p>
        </div>
      </div>

      <div className="flex gap-4 justify-between">
        <Button asChild variant="outline" size="lg">
          <Link
            href={`${localizePath('/create-account', locale)}${allParams}`}
            className="grow max-w-[50%]"
          >
            {dictionary.auth.createAccount}
          </Link>
        </Button>
        <Button className="grow" disabled={isLoading} size="lg" type="submit" variant="default">
          {isLoading ? dictionary.auth.processing : dictionary.common.continue}
        </Button>
      </div>
    </form>
  )
}
