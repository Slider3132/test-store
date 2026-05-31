import type { Field } from 'payload'

import { priceEnabledField, priceField, UAH } from '@/lib/currency'

export const editorPriceFields: Field[] = [
  {
    name: 'price',
    type: 'number',
    admin: {
      description: {
        uk: 'Ціна для редактора у вибраній валюті. Для UAH вводиться в гривнях.',
        ru: 'Цена для редактора в выбранной валюте. Для UAH вводится в гривнах.',
      },
      step: 0.01,
    },
    label: {
      ru: 'Цена',
      uk: 'Ціна',
    },
    min: 0,
  },
  {
    name: 'currency',
    type: 'select',
    admin: {
      description: {
        uk: 'Валюта товару. Зараз checkout налаштований на гривню.',
        ru: 'Валюта товара. Сейчас checkout настроен на гривну.',
      },
    },
    defaultValue: UAH.code,
    label: {
      ru: 'Валюта',
      uk: 'Валюта',
    },
    options: [
      {
        label: 'UAH',
        value: UAH.code,
      },
    ],
  },
  {
    name: 'compareAtPrice',
    type: 'number',
    admin: {
      description: {
        uk: 'Стара ціна для відображення знижки. Вводиться в гривнях.',
        ru: 'Старая цена для отображения скидки. Вводится в гривнах.',
      },
      step: 0.01,
    },
    label: {
      ru: 'Старая цена',
      uk: 'Стара ціна',
    },
    min: 0,
  },
  {
    name: priceEnabledField,
    type: 'checkbox',
    admin: {
      hidden: true,
    },
    defaultValue: true,
  },
  {
    name: priceField,
    type: 'number',
    admin: {
      hidden: true,
    },
  },
]

export const isPluginPriceGroup = (field: Field) => {
  if (field.type !== 'group' || !('fields' in field)) return false

  return JSON.stringify(field.fields).includes(priceField)
}
