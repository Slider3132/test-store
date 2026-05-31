import type { Block } from 'payload'

import {
  FixedToolbarFeature,
  HeadingFeature,
  InlineToolbarFeature,
  lexicalEditor,
} from '@payloadcms/richtext-lexical'
import { blockTranslationAssistant } from '@/fields/blockTranslationAssistant'
import { blockPreview } from '../blockPreview'

export const CategoryHighlights: Block = {
  slug: 'categoryHighlights',
  interfaceName: 'CategoryHighlightsBlock',
  admin: blockPreview('category-highlights', 'Превʼю плиток категорій'),
  labels: {
    plural: {
      uk: 'Плитки категорій',
      ru: 'Плитки категорий',
    },
    singular: {
      uk: 'Плитка категорій',
      ru: 'Плитка категорий',
    },
  },
  fields: [
    {
      name: 'appearance',
      type: 'select',
      defaultValue: 'premiumTiles',
      label: {
        uk: 'Вигляд',
        ru: 'Вид',
      },
      options: [
        {
          label: {
            uk: 'Преміальні плитки',
            ru: 'Премиальные плитки',
          },
          value: 'premiumTiles',
        },
        {
          label: {
            uk: 'Компактна сітка',
            ru: 'Компактная сетка',
          },
          value: 'compactGrid',
        },
      ],
    },
    blockTranslationAssistant({
      name: 'categoryHighlightsTranslationAssistant',
      label: {
        uk: 'Плитка категорій',
        ru: 'Плитка категорий',
      },
      localizedFields: ['Заголовок і опис'],
    }),
    {
      name: 'introContent',
      type: 'richText',
      editor: lexicalEditor({
        features: ({ rootFeatures }) => [
          ...rootFeatures,
          HeadingFeature({ enabledHeadingSizes: ['h2', 'h3'] }),
          FixedToolbarFeature(),
          InlineToolbarFeature(),
        ],
      }),
      label: {
        uk: 'Заголовок і опис',
        ru: 'Заголовок и описание',
      },
      localized: true,
    },
    {
      name: 'populateBy',
      type: 'select',
      defaultValue: 'selection',
      label: {
        uk: 'Наповнення',
        ru: 'Наполнение',
      },
      options: [
        {
          label: {
            uk: 'Усі категорії',
            ru: 'Все категории',
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
      name: 'limit',
      type: 'number',
      admin: {
        condition: (_, siblingData) => siblingData.populateBy === 'collection',
        step: 1,
      },
      defaultValue: 6,
      label: {
        uk: 'Кількість категорій',
        ru: 'Количество категорий',
      },
    },
    {
      name: 'categories',
      type: 'relationship',
      admin: {
        components: {
          Field: '@/components/Admin/CategoryTreeSelect#CategoryTreeSelect',
        },
        condition: (_, siblingData) => siblingData.populateBy === 'selection',
      },
      hasMany: true,
      label: {
        uk: 'Категорії',
        ru: 'Категории',
      },
      relationTo: 'categories',
    },
  ],
}
