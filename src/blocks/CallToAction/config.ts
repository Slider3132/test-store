import type { Block } from 'payload'

import {
  FixedToolbarFeature,
  HeadingFeature,
  InlineToolbarFeature,
  lexicalEditor,
} from '@payloadcms/richtext-lexical'

import { linkGroup } from '../../fields/linkGroup'
import { blockTranslationAssistant } from '@/fields/blockTranslationAssistant'
import { blockPreview } from '../blockPreview'

export const CallToAction: Block = {
  slug: 'cta',
  interfaceName: 'CallToActionBlock',
  admin: blockPreview('cta', 'Превʼю CTA'),
  fields: [
    {
      name: 'appearance',
      type: 'select',
      defaultValue: 'premiumBand',
      label: {
        uk: 'Вигляд CTA',
        ru: 'Вид CTA',
      },
      options: [
        {
          label: {
            uk: 'Класична картка',
            ru: 'Классическая карточка',
          },
          value: 'legacy',
        },
        {
          label: {
            uk: 'Преміальна смуга',
            ru: 'Премиальная полоса',
          },
          value: 'premiumBand',
        },
      ],
    },
    blockTranslationAssistant({
      name: 'ctaTranslationAssistant',
      label: {
        uk: 'Заклик до дії',
        ru: 'Призыв к действию',
      },
      localizedFields: ['Текст', 'Тексти кнопок'],
    }),
    {
      name: 'richText',
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
      label: false,
      localized: true,
    },
    linkGroup({
      appearances: ['default', 'outline'],
      overrides: {
        maxRows: 2,
      },
    }),
  ],
  labels: {
    plural: {
      uk: 'Заклики до дії',
      ru: 'Призывы к действию',
    },
    singular: {
      uk: 'Заклик до дії',
      ru: 'Призыв к действию',
    },
  },
}
