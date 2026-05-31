import type { Block } from 'payload'
import { blockPreview } from '../blockPreview'

export const Carousel: Block = {
  slug: 'carousel',
  admin: blockPreview('carousel', 'Превʼю каруселі'),
  fields: [
    {
      name: 'populateBy',
      type: 'select',
      defaultValue: 'collection',
      label: {
        uk: 'Наповнення',
        ru: 'Наполнение',
      },
      options: [
        {
          label: {
            uk: 'Автоматично з колекції',
            ru: 'Автоматически из коллекции',
          },
          value: 'collection',
        },
        {
          label: {
            uk: 'Ручна добірка',
            ru: 'Ручная подборка',
          },
          value: 'selection',
        },
      ],
    },
    {
      name: 'relationTo',
      type: 'select',
      admin: {
        condition: (_, siblingData) => siblingData.populateBy === 'collection',
      },
      defaultValue: 'products',
      label: {
        uk: 'Колекція для показу',
        ru: 'Коллекция для показа',
      },
      options: [
        {
          label: {
            uk: 'Товари',
            ru: 'Товары',
          },
          value: 'products',
        },
      ],
    },
    {
      name: 'categories',
      type: 'relationship',
      admin: {
        components: {
          Field: '@/components/Admin/CategoryTreeSelect#CategoryTreeSelect',
        },
        condition: (_, siblingData) => siblingData.populateBy === 'collection',
      },
      hasMany: true,
      label: {
        uk: 'Категорії для показу',
        ru: 'Категории для показа',
      },
      relationTo: 'categories',
    },
    {
      name: 'limit',
      type: 'number',
      admin: {
        condition: (_, siblingData) => siblingData.populateBy === 'collection',
        step: 1,
      },
      defaultValue: 10,
      label: {
        uk: 'Ліміт',
        ru: 'Лимит',
      },
    },
    {
      name: 'selectedDocs',
      type: 'relationship',
      admin: {
        condition: (_, siblingData) => siblingData.populateBy === 'selection',
      },
      hasMany: true,
      label: {
        uk: 'Добірка',
        ru: 'Подборка',
      },
      relationTo: ['products'],
    },
    {
      name: 'populatedDocs',
      type: 'relationship',
      admin: {
        condition: (_, siblingData) => siblingData.populateBy === 'collection',
        description: {
          uk: 'Поле заповнюється автоматично після читання.',
          ru: 'Поле заполняется автоматически после чтения.',
        },
        disabled: true,
      },
      hasMany: true,
      label: {
        uk: 'Заповнені документи',
        ru: 'Заполненные документы',
      },
      relationTo: ['products'],
    },
    {
      name: 'populatedDocsTotal',
      type: 'number',
      admin: {
        condition: (_, siblingData) => siblingData.populateBy === 'collection',
        description: {
          uk: 'Поле заповнюється автоматично після читання.',
          ru: 'Поле заполняется автоматически после чтения.',
        },
        disabled: true,
        step: 1,
      },
      label: {
        uk: 'Кількість заповнених документів',
        ru: 'Количество заполненных документов',
      },
    },
  ],
  interfaceName: 'CarouselBlock',
  labels: {
    plural: {
      uk: 'Каруселі',
      ru: 'Карусели',
    },
    singular: {
      uk: 'Карусель',
      ru: 'Карусель',
    },
  },
}
