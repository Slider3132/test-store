import type { Block } from 'payload'

import {
  FixedToolbarFeature,
  HeadingFeature,
  InlineToolbarFeature,
  lexicalEditor,
} from '@payloadcms/richtext-lexical'
import { blockTranslationAssistant } from '@/fields/blockTranslationAssistant'
import { blockPreview } from '../blockPreview'

export const FeaturedProducts: Block = {
  slug: 'featuredProducts',
  interfaceName: 'FeaturedProductsBlock',
  admin: blockPreview('featured-products', 'Превʼю добірки товарів'),
  labels: {
    plural: {
      uk: 'Добірки товарів',
      ru: 'Подборки товаров',
    },
    singular: {
      uk: 'Добірка товарів',
      ru: 'Подборка товаров',
    },
  },
  fields: [
    {
      name: 'appearance',
      type: 'select',
      defaultValue: 'premiumGrid',
      label: {
        uk: 'Вигляд',
        ru: 'Вид',
      },
      options: [
        {
          label: {
            uk: 'Преміальна сітка',
            ru: 'Премиальная сетка',
          },
          value: 'premiumGrid',
        },
        {
          label: {
            uk: 'Акцентний блок',
            ru: 'Акцентный блок',
          },
          value: 'spotlight',
        },
      ],
    },
    blockTranslationAssistant({
      name: 'featuredProductsTranslationAssistant',
      label: {
        uk: 'Добірка товарів',
        ru: 'Подборка товаров',
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
      defaultValue: 'collection',
      label: {
        uk: 'Наповнення',
        ru: 'Наполнение',
      },
      options: [
        {
          label: {
            uk: 'Автоматично з каталогу',
            ru: 'Автоматически из каталога',
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
        uk: 'Категорії',
        ru: 'Категории',
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
      defaultValue: 4,
      label: {
        uk: 'Кількість товарів',
        ru: 'Количество товаров',
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
        uk: 'Товари',
        ru: 'Товары',
      },
      relationTo: ['products'],
    },
  ],
}
