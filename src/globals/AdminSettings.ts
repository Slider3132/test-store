import type { GlobalConfig } from 'payload'

import { adminOnly } from '@/access/adminOnly'

export const AdminSettings: GlobalConfig = {
  slug: 'admin-settings',
  access: {
    read: adminOnly,
    update: adminOnly,
  },
  admin: {
    group: {
      ru: 'Глобальные',
      uk: 'Глобальні',
    },
  },
  fields: [
    {
      name: 'openLivePreviewOnLoad',
      type: 'checkbox',
      defaultValue: false,
      label: {
        ru: 'Открывать Live Preview при загрузке документа',
        uk: 'Відкривати Live Preview під час завантаження документа',
      },
    },
    {
      name: 'delivery',
      type: 'group',
      label: {
        ru: 'Доставка',
        uk: 'Доставка',
      },
      fields: [
        {
          name: 'novaPoshtaEnabled',
          type: 'checkbox',
          defaultValue: true,
          label: {
            ru: 'Новая Почта включена',
            uk: 'Нова Пошта увімкнена',
          },
        },
        {
          name: 'ukrposhtaEnabled',
          type: 'checkbox',
          defaultValue: true,
          label: {
            ru: 'Укрпочта включена',
            uk: 'Укрпошта увімкнена',
          },
        },
        {
          name: 'pickupEnabled',
          type: 'checkbox',
          defaultValue: true,
          label: {
            ru: 'Самовывоз включен',
            uk: 'Самовивіз увімкнений',
          },
        },
        {
          name: 'pickupInstructions',
          type: 'textarea',
          admin: {
            description: {
              ru: 'Текст для клиента в checkout, если выбран самовывоз.',
              uk: 'Текст для клієнта в checkout, якщо обрано самовивіз.',
            },
          },
          label: {
            ru: 'Инструкции для самовывоза',
            uk: 'Інструкції для самовивозу',
          },
        },
        {
          name: 'freeShippingFrom',
          type: 'number',
          admin: {
            description: {
              ru: 'Сумма заказа в гривнах. Оставьте пустым, чтобы отключить.',
              uk: 'Сума замовлення у гривнях. Залиште порожнім, щоб вимкнути.',
            },
          },
          label: {
            ru: 'Бесплатная доставка от',
            uk: 'Безкоштовна доставка від',
          },
        },
        {
          name: 'fixedShippingPrice',
          type: 'number',
          admin: {
            description: {
              ru: 'Фиксированная стоимость доставки в гривнах.',
              uk: 'Фіксована вартість доставки у гривнях.',
            },
          },
          label: {
            ru: 'Фиксированная стоимость доставки',
            uk: 'Фіксована вартість доставки',
          },
        },
      ],
    },
  ],
  label: {
    ru: 'Настройки админки',
    uk: 'Налаштування адмінки',
  },
}
