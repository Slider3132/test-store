'use client'

import { FormError } from '@/components/forms/FormError'
import { FormItem } from '@/components/forms/FormItem'
import { Message } from '@/components/Message'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { User } from '@/payload-types'
import { useAuth } from '@/providers/Auth'
import { useRouter } from 'next/navigation'
import React, { Fragment, useCallback, useEffect, useRef, useState } from 'react'
import { useForm } from 'react-hook-form'
import { toast } from 'sonner'
import { useDictionary, useLocale } from '@/i18n/client'
import { localizePath } from '@/i18n/config'

type FormData = {
  email: string
  name: User['name']
  password: string
  passwordConfirm: string
}

export const AccountForm: React.FC = () => {
  const dictionary = useDictionary()
  const locale = useLocale()
  const { setUser, user } = useAuth()
  const [changePassword, setChangePassword] = useState(false)

  const {
    formState: { errors, isLoading, isSubmitting, isDirty },
    handleSubmit,
    register,
    reset,
    watch,
  } = useForm<FormData>()

  const password = useRef({})
  password.current = watch('password', '')

  const router = useRouter()

  const onSubmit = useCallback(
    async (data: FormData) => {
      if (user) {
        const response = await fetch(`/api/users/${user.id}`, {
          // Make sure to include cookies with fetch
          body: JSON.stringify(data),
          credentials: 'include',
          headers: {
            'Content-Type': 'application/json',
          },
          method: 'PATCH',
        })

        if (response.ok) {
          const json = await response.json()
          setUser(json.doc)
          toast.success(locale === 'ru' ? 'Аккаунт обновлен.' : 'Акаунт оновлено.')
          setChangePassword(false)
          reset({
            name: json.doc.name,
            email: json.doc.email,
            password: '',
            passwordConfirm: '',
          })
        } else {
          toast.error(locale === 'ru' ? 'Не удалось обновить аккаунт.' : 'Не вдалося оновити акаунт.')
        }
      }
    },
    [user, setUser, reset],
  )

  useEffect(() => {
    if (user === null) {
      router.push(
            `${localizePath('/login', locale)}?error=${encodeURIComponent(
          locale === 'ru'
            ? 'Войдите, чтобы просмотреть эту страницу.'
            : 'Увійдіть, щоб переглянути цю сторінку.',
        )}&redirect=${encodeURIComponent(localizePath('/account', locale))}`,
      )
    }

    // Once user is loaded, reset form to have default values
    if (user) {
      reset({
        name: user.name,
        email: user.email,
        password: '',
        passwordConfirm: '',
      })
    }
  }, [user, router, reset, changePassword])

  return (
    <form className="max-w-xl" onSubmit={handleSubmit(onSubmit)}>
      {!changePassword ? (
        <Fragment>
          <div className="prose dark:prose-invert mb-8">
            <p className="">
              {dictionary.account.changeDetails}
              <Button
                className="px-0 text-inherit underline hover:cursor-pointer"
                onClick={() => setChangePassword(!changePassword)}
                type="button"
                variant="link"
              >
                {dictionary.account.clickHere}
              </Button>
              {locale === 'ru' ? ', чтобы изменить пароль.' : ', щоб змінити пароль.'}
            </p>
          </div>

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
              <Label htmlFor="name" className="mb-2">
                {dictionary.account.name}
              </Label>
              <Input
                id="name"
                {...register('name', { required: dictionary.account.name })}
                type="text"
              />
              {errors.name && <FormError message={errors.name.message} />}
            </FormItem>
          </div>
        </Fragment>
      ) : (
        <Fragment>
          <div className="prose dark:prose-invert mb-8">
            <p>
              {dictionary.account.changePasswordBelow}
              <Button
                className="px-0 text-inherit underline hover:cursor-pointer"
                onClick={() => setChangePassword(!changePassword)}
                type="button"
                variant="link"
              >
                {locale === 'ru' ? 'отмените' : 'скасуйте'}
              </Button>
              .
            </p>
          </div>

          <div className="flex flex-col gap-8 mb-8">
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
        </Fragment>
      )}
      <Button disabled={isLoading || isSubmitting || !isDirty} type="submit" variant="default">
        {isLoading || isSubmitting
          ? dictionary.auth.processing
          : changePassword
            ? dictionary.account.changePassword
            : dictionary.account.updateAccount}
      </Button>
    </form>
  )
}
