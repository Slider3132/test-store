'use client'

import { Banner } from '@payloadcms/ui'
import { useTranslation } from '@payloadcms/ui'
import React from 'react'

import { SeedButton } from './SeedButton'
import './index.scss'

const baseClass = 'before-dashboard'

export const BeforeDashboard: React.FC = () => {
  const {
    i18n: { language },
  } = useTranslation()
  const isRu = language === 'ru'

  return (
    <div className={baseClass}>
      <Banner className={`${baseClass}__banner`} type="success">
        <h4>{isRu ? 'Добро пожаловать в админпанель!' : 'Вітаємо в адмінпанелі!'}</h4>
      </Banner>
      {isRu ? 'Что делать дальше:' : 'Що робити далі:'}
      <ul className={`${baseClass}__instructions`}>
        <li>
          <SeedButton />
          {isRu
            ? ' несколькими товарами и страницами, затем '
            : ' кількома товарами і сторінками, потім '}
          {/* eslint-disable-next-line @next/next/no-html-link-for-pages */}
          <a href="/">{isRu ? 'откройте сайт' : 'відкрийте сайт'}</a>
          {isRu ? ', чтобы увидеть результат.' : ', щоб побачити результат.'}
        </li>
        <li>
          {isRu ? 'Перейдите в ' : 'Перейдіть у '}
          <a
            href="https://dashboard.stripe.com/test/apikeys"
            rel="noopener noreferrer"
            target="_blank"
          >
            Stripe
          </a>
          {isRu
            ? ', получите API keys, добавьте их в env и перезапустите сервер. Подробнее в '
            : ', отримайте API keys, додайте їх в env і перезапустіть сервер. Деталі в '}
          <a
            href="https://github.com/payloadcms/payload/blob/3.x/templates/ecommerce/README.md#stripe"
            rel="noopener noreferrer"
            target="_blank"
          >
            README
          </a>
          .
        </li>
        <li>
          {isRu ? 'Настройте ' : 'Налаштуйте '}
          <a
            href="https://payloadcms.com/docs/configuration/collections"
            rel="noopener noreferrer"
            target="_blank"
          >
            {isRu ? 'коллекции' : 'колекції'}
          </a>
          {isRu ? ' и добавьте нужные ' : ' і додайте потрібні '}
          <a
            href="https://payloadcms.com/docs/fields/overview"
            rel="noopener noreferrer"
            target="_blank"
          >
            {isRu ? 'поля' : 'поля'}
          </a>
          {isRu ? '. Если вы впервые работаете с Payload, откройте ' : '. Якщо ви вперше працюєте з Payload, відкрийте '}
          <a
            href="https://payloadcms.com/docs/getting-started/what-is-payload"
            rel="noopener noreferrer"
            target="_blank"
          >
            {isRu ? 'документацию для старта' : 'документацію для старту'}
          </a>
          .
        </li>
      </ul>
      {isRu ? 'Подсказка: этот блок является ' : 'Підказка: цей блок є '}
      <a
        href="https://payloadcms.com/docs/admin/components#base-component-overrides"
        rel="noopener noreferrer"
        target="_blank"
      >
        {isRu ? 'кастомным компонентом' : 'кастомним компонентом'}
      </a>
      {isRu
        ? ', его можно убрать в payload.config.'
        : ', його можна прибрати в payload.config.'}
    </div>
  )
}
