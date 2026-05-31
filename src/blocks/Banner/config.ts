import type { Block } from 'payload'

import {
  FixedToolbarFeature,
  InlineToolbarFeature,
  lexicalEditor,
} from '@payloadcms/richtext-lexical'
import { blockTranslationAssistant } from '@/fields/blockTranslationAssistant'
import { blockPreview } from '../blockPreview'

export const Banner: Block = {
  slug: 'banner',
  admin: blockPreview('banner', 'Превʼю банера'),
  fields: [
    {
      name: 'style',
      type: 'select',
      defaultValue: 'info',
      label: {
        uk: 'Стиль',
        ru: 'Стиль',
      },
      options: [
        { label: { uk: 'Інформація', ru: 'Информация' }, value: 'info' },
        { label: { uk: 'Попередження', ru: 'Предупреждение' }, value: 'warning' },
        { label: { uk: 'Помилка', ru: 'Ошибка' }, value: 'error' },
        { label: { uk: 'Успіх', ru: 'Успех' }, value: 'success' },
      ],
      required: true,
    },
    blockTranslationAssistant({
      name: 'bannerTranslationAssistant',
      label: {
        uk: 'Банер',
        ru: 'Баннер',
      },
      localizedFields: ['Контент'],
    }),
    {
      name: 'content',
      type: 'richText',
      editor: lexicalEditor({
        features: ({ rootFeatures }) => {
          return [...rootFeatures, FixedToolbarFeature(), InlineToolbarFeature()]
        },
      }),
      label: false,
      localized: true,
      required: true,
    },
  ],
  interfaceName: 'BannerBlock',
  labels: {
    plural: {
      uk: 'Банери',
      ru: 'Баннеры',
    },
    singular: {
      uk: 'Банер',
      ru: 'Баннер',
    },
  },
}
