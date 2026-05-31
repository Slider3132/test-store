'use client'

import React, { Fragment, useCallback, useState, MouseEvent } from 'react'
import { toast, useTranslation } from '@payloadcms/ui'

import './index.scss'

const showSeedButton =
  process.env.NODE_ENV !== 'production' || process.env.NEXT_PUBLIC_ENABLE_SEED_BUTTON === 'true'

const SuccessMessage: React.FC<{ isRu: boolean }> = ({ isRu }) => (
  <div>
    {isRu ? 'База заполнена. Теперь можно ' : 'Базу заповнено. Тепер можна '}
    <a target="_blank" href="/">
      {isRu ? 'открыть сайт' : 'відкрити сайт'}
    </a>
  </div>
)

export const SeedButton: React.FC = () => {
  const {
    i18n: { language },
  } = useTranslation()
  const isRu = language === 'ru'
  const [loading, setLoading] = useState(false)
  const [seeded, setSeeded] = useState(false)
  const [error, setError] = useState<unknown>(null)

  const handleClick = useCallback(
    async (e: MouseEvent<HTMLButtonElement>) => {
      e.preventDefault()

      if (seeded) {
        toast.info(isRu ? 'База уже заполнена.' : 'Базу вже заповнено.')
        return
      }
      if (loading) {
        toast.info(isRu ? 'Заполнение уже выполняется.' : 'Заповнення вже виконується.')
        return
      }
      if (error) {
        toast.error(isRu ? 'Произошла ошибка, обновите страницу и попробуйте еще раз.' : 'Сталася помилка, оновіть сторінку і спробуйте ще раз.')
        return
      }

      setLoading(true)

      try {
        toast.promise(
          new Promise((resolve, reject) => {
            try {
              fetch('/next/seed', { method: 'POST', credentials: 'include' })
                .then((res) => {
                  if (res.ok) {
                    resolve(true)
                    setSeeded(true)
                  } else {
                    reject(isRu ? 'Ошибка при заполнении базы.' : 'Помилка під час заповнення бази.')
                  }
                })
                .catch((error) => {
                  reject(error)
                })
            } catch (error) {
              reject(error)
            }
          }),
          {
            loading: isRu ? 'Заполняем базу данными...' : 'Заповнюємо базу даними...',
            success: <SuccessMessage isRu={isRu} />,
            error: isRu ? 'Ошибка при заполнении базы.' : 'Помилка під час заповнення бази.',
          },
        )
      } catch (err) {
        setError(err)
      }
    },
    [loading, seeded, error, isRu],
  )

  if (!showSeedButton) {
    return null
  }

  let message = ''
  if (loading) message = isRu ? ' (заполнение...)' : ' (заповнення...)'
  if (seeded) message = isRu ? ' (готово!)' : ' (готово!)'
  if (error) message = isRu ? ` (ошибка: ${error})` : ` (помилка: ${error})`

  return (
    <Fragment>
      <button className="seedButton" onClick={handleClick}>
        {isRu ? 'Заполнить базу' : 'Заповнити базу'}
      </button>
      {message}
    </Fragment>
  )
}
