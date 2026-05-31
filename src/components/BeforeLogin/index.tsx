'use client'

import React from 'react'
import { useTranslation } from '@payloadcms/ui'

export const BeforeLogin: React.FC = () => {
  const {
    i18n: { language },
  } = useTranslation()
  const isRu = language === 'ru'

  return (
    <div>
      <p>
        <b>{isRu ? 'Добро пожаловать в админпанель!' : 'Вітаємо в адмінпанелі!'}</b>
        <br />
        <span>{isRu ? 'Тестовый инстанс ecommerce-starter' : 'Тестовий інстанс ecommerce-starter'}</span>
        <br />
        {isRu
          ? ' Здесь администраторы входят для управления магазином. Клиентам нужно '
          : ' Тут адміністратори входять для керування магазином. Клієнтам потрібно '}
        <a href={`${process.env.PAYLOAD_PUBLIC_SERVER_URL}/login`}>
          {isRu ? 'войти на сайт' : 'увійти на сайт'}
        </a>
        {isRu
          ? ', чтобы открыть свой аккаунт, историю заказов и другое.'
          : ', щоб відкрити свій акаунт, історію замовлень та інше.'}
      </p>
    </div>
  )
}
