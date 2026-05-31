import type { Block } from 'payload'

import {
  FixedToolbarFeature,
  HeadingFeature,
  InlineToolbarFeature,
  lexicalEditor,
} from '@payloadcms/richtext-lexical'

import { linkGroup } from '@/fields/linkGroup'
import { blockTranslationAssistant } from '@/fields/blockTranslationAssistant'
import { blockPreview } from '../blockPreview'

export const Hero: Block = {
  slug: 'hero',
  interfaceName: 'HeroBlock',
  admin: blockPreview('hero', 'Превʼю hero-блоку'),
  fields: [
    {
      type: 'row',
      fields: [
        {
          name: 'variant',
          type: 'select',
          admin: {
            width: '33.333%',
          },
          defaultValue: 'split',
          label: {
            uk: 'Композиція',
            ru: 'Композиция',
          },
          options: [
            {
              label: {
                uk: 'Текст + медіа',
                ru: 'Текст + медиа',
              },
              value: 'split',
            },
            {
              label: {
                uk: 'По центру',
                ru: 'По центру',
              },
              value: 'centered',
            },
            {
              label: {
                uk: 'На фоновому зображенні',
                ru: 'На фоновом изображении',
              },
              value: 'background',
            },
          ],
          required: true,
        },
        {
          name: 'textTheme',
          type: 'select',
          admin: {
            width: '33.333%',
          },
          defaultValue: 'dark',
          label: {
            uk: 'Колір тексту',
            ru: 'Цвет текста',
          },
          options: [
            {
              label: {
                uk: 'Темний текст',
                ru: 'Темный текст',
              },
              value: 'dark',
            },
            {
              label: {
                uk: 'Світлий текст',
                ru: 'Светлый текст',
              },
              value: 'light',
            },
          ],
          required: true,
        },
        {
          name: 'verticalPadding',
          type: 'select',
          admin: {
            width: '33.333%',
          },
          defaultValue: 'large',
          label: {
            uk: 'Висота секції',
            ru: 'Высота секции',
          },
          options: [
            {
              label: {
                uk: 'Компактна',
                ru: 'Компактная',
              },
              value: 'compact',
            },
            {
              label: {
                uk: 'Велика',
                ru: 'Большая',
              },
              value: 'large',
            },
            {
              label: {
                uk: 'Екранна',
                ru: 'Экранная',
              },
              value: 'screen',
            },
          ],
          required: true,
        },
      ],
    },
    blockTranslationAssistant({
      name: 'heroTranslationAssistant',
      label: {
        uk: 'Hero-блок',
        ru: 'Hero-блок',
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
            HeadingFeature({ enabledHeadingSizes: ['h1', 'h2', 'h3'] }),
            FixedToolbarFeature(),
            InlineToolbarFeature(),
          ]
        },
      }),
      label: {
        uk: 'Текст',
        ru: 'Текст',
      },
      localized: true,
      required: true,
    },
    linkGroup({
      appearances: ['default', 'outline'],
      overrides: {
        maxRows: 2,
      },
    }),
    {
      type: 'collapsible',
      admin: {
        initCollapsed: false,
      },
      fields: [
        {
          name: 'backgroundType',
          type: 'radio',
          admin: {
            layout: 'horizontal',
          },
          defaultValue: 'color',
          label: {
            uk: 'Тип фону',
            ru: 'Тип фона',
          },
          options: [
            {
              label: {
                uk: 'Колір',
                ru: 'Цвет',
              },
              value: 'color',
            },
            {
              label: {
                uk: 'Фото',
                ru: 'Фото',
              },
              value: 'media',
            },
            {
              label: {
                uk: 'Без фону',
                ru: 'Без фона',
              },
              value: 'none',
            },
          ],
        },
        {
          name: 'backgroundColor',
          type: 'text',
          admin: {
            condition: (_, siblingData) => siblingData?.backgroundType === 'color',
            description: {
              uk: 'CSS-колір, наприклад #f6f3ef або rgb(246 243 239).',
              ru: 'CSS-цвет, например #f6f3ef или rgb(246 243 239).',
            },
          },
          defaultValue: '#f6f3ef',
          label: {
            uk: 'Колір фону світлої теми',
            ru: 'Цвет фона светлой темы',
          },
        },
        {
          name: 'darkBackgroundColor',
          type: 'text',
          admin: {
            condition: (_, siblingData) => siblingData?.backgroundType === 'color',
            description: {
              uk: 'CSS-колір для темної теми. Якщо порожньо, використовується колір світлої теми.',
              ru: 'CSS-цвет для темной темы. Если пусто, используется цвет светлой темы.',
            },
          },
          label: {
            uk: 'Колір фону темної теми',
            ru: 'Цвет фона темной темы',
          },
        },
        {
          name: 'backgroundMedia',
          type: 'upload',
          admin: {
            condition: (_, siblingData) => siblingData?.backgroundType === 'media',
          },
          label: {
            uk: 'Фонове фото світлої теми',
            ru: 'Фоновое фото светлой темы',
          },
          relationTo: 'media',
        },
        {
          name: 'darkBackgroundMedia',
          type: 'upload',
          admin: {
            condition: (_, siblingData) => siblingData?.backgroundType === 'media',
            description: {
              uk: 'Опційно: інше фонове фото для темної теми.',
              ru: 'Опционально: другое фоновое фото для темной темы.',
            },
          },
          label: {
            uk: 'Фонове фото для темної теми',
            ru: 'Фоновое фото для темной темы',
          },
          relationTo: 'media',
        },
        {
          name: 'overlay',
          type: 'select',
          admin: {
            condition: (_, siblingData) => siblingData?.backgroundType === 'media',
          },
          defaultValue: 'none',
          label: {
            uk: 'Затемнення фону',
            ru: 'Затемнение фона',
          },
          options: [
            {
              label: {
                uk: 'Без затемнення',
                ru: 'Без затемнения',
              },
              value: 'none',
            },
            {
              label: {
                uk: 'Легке',
                ru: 'Легкое',
              },
              value: 'soft',
            },
            {
              label: {
                uk: 'Сильне',
                ru: 'Сильное',
              },
              value: 'strong',
            },
          ],
        },
      ],
      label: {
        uk: 'Фон секції',
        ru: 'Фон секции',
      },
    },
    {
      type: 'collapsible',
      admin: {
        condition: (_, siblingData) => siblingData?.variant === 'split',
        initCollapsed: false,
      },
      fields: [
        {
          name: 'media',
          type: 'upload',
          label: {
            uk: 'Зображення справа',
            ru: 'Изображение справа',
          },
          relationTo: 'media',
        },
        {
          name: 'darkThemeMedia',
          type: 'upload',
          admin: {
            description: {
              uk: 'Опційно: інше зображення для темної теми.',
              ru: 'Опционально: другое изображение для темной темы.',
            },
          },
          label: {
            uk: 'Зображення справа для темної теми',
            ru: 'Изображение справа для темной темы',
          },
          relationTo: 'media',
        },
      ],
      label: {
        uk: 'Медіа секції',
        ru: 'Медиа секции',
      },
    },
  ],
  labels: {
    plural: {
      uk: 'Hero-блоки',
      ru: 'Hero-блоки',
    },
    singular: {
      uk: 'Hero-блок',
      ru: 'Hero-блок',
    },
  },
}
