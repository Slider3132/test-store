import type { Block } from 'payload'

import {
  FixedToolbarFeature,
  HeadingFeature,
  InlineToolbarFeature,
  lexicalEditor,
} from '@payloadcms/richtext-lexical'
import { blockTranslationAssistant } from '@/fields/blockTranslationAssistant'
import { blockPreview } from '../blockPreview'

export const Testimonials: Block = {
  slug: 'testimonials',
  interfaceName: 'TestimonialsBlock',
  admin: blockPreview('testimonials', 'Превʼю відгуків'),
  labels: {
    plural: {
      uk: 'Відгуки',
      ru: 'Отзывы',
    },
    singular: {
      uk: 'Відгуки',
      ru: 'Отзывы',
    },
  },
  fields: [
    {
      name: 'appearance',
      type: 'select',
      defaultValue: 'premiumCards',
      label: {
        uk: 'Вигляд',
        ru: 'Вид',
      },
      options: [
        {
          label: {
            uk: 'Преміальні картки',
            ru: 'Премиальные карточки',
          },
          value: 'premiumCards',
        },
      ],
    },
    blockTranslationAssistant({
      name: 'testimonialsTranslationAssistant',
      label: {
        uk: 'Відгуки',
        ru: 'Отзывы',
      },
      localizedFields: ['Заголовок', 'Текст відгуку', "Ім'я", 'Підпис'],
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
        uk: 'Заголовок',
        ru: 'Заголовок',
      },
      localized: true,
    },
    {
      name: 'items',
      type: 'array',
      label: {
        uk: 'Відгуки',
        ru: 'Отзывы',
      },
      labels: {
        plural: {
          uk: 'Відгуки',
          ru: 'Отзывы',
        },
        singular: {
          uk: 'Відгук',
          ru: 'Отзыв',
        },
      },
      minRows: 1,
      fields: [
        {
          name: 'rating',
          type: 'number',
          admin: {
            step: 1,
          },
          defaultValue: 5,
          label: {
            uk: 'Рейтинг',
            ru: 'Рейтинг',
          },
          max: 5,
          min: 1,
          required: true,
        },
        {
          name: 'quote',
          type: 'textarea',
          label: {
            uk: 'Текст відгуку',
            ru: 'Текст отзыва',
          },
          localized: true,
          required: true,
        },
        {
          name: 'authorName',
          type: 'text',
          label: {
            uk: "Ім'я",
            ru: 'Имя',
          },
          localized: true,
          required: true,
        },
        {
          name: 'authorRole',
          type: 'text',
          label: {
            uk: 'Підпис',
            ru: 'Подпись',
          },
          localized: true,
        },
        {
          name: 'avatar',
          type: 'upload',
          label: {
            uk: 'Аватар',
            ru: 'Аватар',
          },
          relationTo: 'media',
        },
      ],
    },
  ],
}
