'use client'

import { FormError } from '@/components/forms/FormError'
import { FormItem } from '@/components/forms/FormItem'
import { Message } from '@/components/Message'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import React, { Fragment, useCallback, useState } from 'react'
import { useForm } from 'react-hook-form'
import { useDictionary, useLocale } from '@/i18n/client'

type FormData = {
  email: string
}

export const ForgotPasswordForm: React.FC = () => {
  const dictionary = useDictionary()
  const locale = useLocale()
  const [error, setError] = useState('')
  const [success, setSuccess] = useState(false)

  const {
    formState: { errors },
    handleSubmit,
    register,
  } = useForm<FormData>()

  const onSubmit = useCallback(async (data: FormData) => {
    const response = await fetch('/api/users/forgot-password', {
      body: JSON.stringify(data),
      headers: {
        'Content-Type': 'application/json',
      },
      method: 'POST',
    })

    if (response.ok) {
      setSuccess(true)
      setError('')
    } else {
      setError(
        locale === 'ru'
          ? 'Не удалось отправить письмо для сброса пароля. Попробуйте еще раз.'
          : 'Не вдалося надіслати лист для скидання пароля. Спробуйте ще раз.',
      )
    }
  }, [])

  return (
    <Fragment>
      {!success && (
        <React.Fragment>
          <h1 className="text-xl mb-4">{dictionary.auth.forgotPassword}</h1>
          <div className="prose dark:prose-invert mb-8">
            <p>{dictionary.auth.forgotPasswordText}</p>
          </div>
          <form className="max-w-lg" onSubmit={handleSubmit(onSubmit)}>
            <Message className="mb-8" error={error} />

            <FormItem className="mb-8">
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

            <Button type="submit" variant="default">
              {dictionary.auth.submitForgotPassword}
            </Button>
          </form>
        </React.Fragment>
      )}
      {success && (
        <React.Fragment>
          <h1 className="text-xl mb-4">{dictionary.auth.requestSubmitted}</h1>
          <div className="prose dark:prose-invert">
            <p>{dictionary.auth.resetEmailSent}</p>
          </div>
        </React.Fragment>
      )}
    </Fragment>
  )
}
