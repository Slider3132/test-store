import type { Block } from 'payload'

import {
  FixedToolbarFeature,
  HeadingFeature,
  InlineToolbarFeature,
  lexicalEditor,
} from '@payloadcms/richtext-lexical'
import { blockTranslationAssistant } from '@/fields/blockTranslationAssistant'
import { blockPreview } from '../blockPreview'

export const FormBlock: Block = {
  slug: 'formBlock',
  interfaceName: 'FormBlock',
  admin: blockPreview('form', 'Превʼю форми'),
  fields: [
    {
      name: 'form',
      type: 'relationship',
      relationTo: 'forms',
      required: true,
    },
    {
      name: 'enableIntro',
      type: 'checkbox',
      label: {
        uk: 'Показувати вступний текст',
        ru: 'Показывать вводный текст',
      },
    },
    blockTranslationAssistant({
      name: 'formTranslationAssistant',
      label: {
        uk: 'Форма',
        ru: 'Форма',
      },
      localizedFields: ['Вступний текст'],
    }),
    {
      name: 'introContent',
      type: 'richText',
      admin: {
        condition: (_, { enableIntro }) => Boolean(enableIntro),
      },
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
  ],
  graphQL: {
    singularName: 'FormBlock',
  },
  labels: {
    plural: {
      uk: 'Форми',
      ru: 'Формы',
    },
    singular: {
      uk: 'Форма',
      ru: 'Форма',
    },
  },
}
