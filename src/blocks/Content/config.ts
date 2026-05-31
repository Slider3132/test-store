import type { Block, Field } from 'payload'

import {
  FixedToolbarFeature,
  HeadingFeature,
  InlineToolbarFeature,
  lexicalEditor,
} from '@payloadcms/richtext-lexical'

import { link } from '@/fields/link'
import { blockTranslationAssistant } from '@/fields/blockTranslationAssistant'
import { blockPreview } from '../blockPreview'

const columnFields: Field[] = [
  {
    name: 'size',
    type: 'select',
    defaultValue: 'oneThird',
    label: {
      uk: 'Розмір колонки',
      ru: 'Размер колонки',
    },
    options: [
      {
        label: {
          uk: 'Одна третина',
          ru: 'Одна треть',
        },
        value: 'oneThird',
      },
      {
        label: {
          uk: 'Половина',
          ru: 'Половина',
        },
        value: 'half',
      },
      {
        label: {
          uk: 'Дві третини',
          ru: 'Две трети',
        },
        value: 'twoThirds',
      },
      {
        label: {
          uk: 'На всю ширину',
          ru: 'На всю ширину',
        },
        value: 'full',
      },
    ],
  },
  {
    name: 'richText',
    type: 'richText',
    editor: lexicalEditor({
      features: ({ rootFeatures }) => {
        return [
          ...rootFeatures,
          HeadingFeature({ enabledHeadingSizes: ['h2', 'h3', 'h4'] }),
          FixedToolbarFeature(),
          InlineToolbarFeature(),
        ]
      },
    }),
    label: false,
    localized: true,
  },
  {
    name: 'enableLink',
    type: 'checkbox',
    label: {
      uk: 'Додати посилання',
      ru: 'Добавить ссылку',
    },
  },
  link({
    overrides: {
      admin: {
        condition: (_: unknown, { enableLink }: { enableLink?: boolean }) => Boolean(enableLink),
      },
    },
  }),
]

export const Content: Block = {
  slug: 'content',
  interfaceName: 'ContentBlock',
  admin: blockPreview('content', 'Превʼю контентного блоку'),
  fields: [
    {
      name: 'appearance',
      type: 'select',
      defaultValue: 'plain',
      label: {
        uk: 'Вигляд блоку',
        ru: 'Вид блока',
      },
      options: [
        {
          label: {
            uk: 'Звичайний текст',
            ru: 'Обычный текст',
          },
          value: 'plain',
        },
        {
          label: {
            uk: 'Картки',
            ru: 'Карточки',
          },
          value: 'cards',
        },
        {
          label: {
            uk: 'Кроки',
            ru: 'Шаги',
          },
          value: 'steps',
        },
        {
          label: {
            uk: 'Акцентні кроки',
            ru: 'Акцентные шаги',
          },
          value: 'spotlightSteps',
        },
        {
          label: {
            uk: 'Відгуки',
            ru: 'Отзывы',
          },
          value: 'quotes',
        },
      ],
    },
    blockTranslationAssistant({
      name: 'contentTranslationAssistant',
      label: {
        uk: 'Контентний блок',
        ru: 'Контентный блок',
      },
      localizedFields: ['Текст колонок', 'Тексти посилань'],
    }),
    {
      name: 'columns',
      type: 'array',
      admin: {
        initCollapsed: true,
      },
      fields: columnFields,
      label: {
        uk: 'Колонки',
        ru: 'Колонки',
      },
    },
  ],
}
