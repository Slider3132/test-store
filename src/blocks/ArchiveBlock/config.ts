import type { Block } from 'payload'

import {
  FixedToolbarFeature,
  HeadingFeature,
  InlineToolbarFeature,
  lexicalEditor,
} from '@payloadcms/richtext-lexical'
import { blockTranslationAssistant } from '@/fields/blockTranslationAssistant'
import { blockPreview } from '../blockPreview'

export const Archive: Block = {
  slug: 'archive',
  interfaceName: 'ArchiveBlock',
  admin: blockPreview('archive', 'Превʼю сітки товарів'),
  fields: [
    {
      name: 'appearance',
      type: 'select',
      defaultValue: 'grid',
      label: {
        uk: 'Вигляд товарів',
        ru: 'Вид товаров',
      },
      options: [
        {
          label: {
            uk: 'Класична сітка',
            ru: 'Классическая сетка',
          },
          value: 'grid',
        },
        {
          label: {
            uk: 'Преміальні картки товарів',
            ru: 'Премиальные карточки товаров',
          },
          value: 'premiumGrid',
        },
      ],
    },
    blockTranslationAssistant({
      name: 'archiveTranslationAssistant',
      label: {
        uk: 'Архів товарів',
        ru: 'Архив товаров',
      },
      localizedFields: ['Вступний текст'],
    }),
    {
      name: 'introContent',
      type: 'richText',
      editor: lexicalEditor({
        features: ({ rootFeatures }) => {
          return [
            ...rootFeatures,
            HeadingFeature({ enabledHeadingSizes: ['h1', 'h2', 'h3', 'h4'] }),
            FixedToolbarFeature(),
            InlineToolbarFeature(),
          ]
        },
      }),
      label: {
        uk: 'Вступний текст',
        ru: 'Вводный текст',
      },
      localized: true,
    },
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
  ],
  labels: {
    plural: {
      uk: 'Архіви товарів',
      ru: 'Архивы товаров',
    },
    singular: {
      uk: 'Архів товарів',
      ru: 'Архив товаров',
    },
  },
}
