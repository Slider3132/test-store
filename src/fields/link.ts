import type { Field, StaticLabel } from 'payload'

import { deepMerge } from '@/utilities/deepMerge'

export type LinkAppearances = 'default' | 'outline'

export const appearanceOptions: Record<LinkAppearances, { label: StaticLabel; value: string }> = {
  default: {
    label: {
      uk: 'За замовчуванням',
      ru: 'По умолчанию',
    },
    value: 'default',
  },
  outline: {
    label: {
      uk: 'Контур',
      ru: 'Контур',
    },
    value: 'outline',
  },
}

type LinkType = (options?: {
  appearances?: LinkAppearances[] | false
  disableLabel?: boolean
  overrides?: Record<string, unknown>
}) => Field

export const link: LinkType = ({ appearances, disableLabel = false, overrides = {} } = {}) => {
  const linkResult: Field = {
    name: 'link',
    type: 'group',
    admin: {
      hideGutter: true,
    },
    fields: [
      {
        type: 'row',
        fields: [
          {
            name: 'type',
            type: 'radio',
            admin: {
              layout: 'horizontal',
              width: '50%',
            },
            defaultValue: 'reference',
            label: {
              uk: 'Тип посилання',
              ru: 'Тип ссылки',
            },
            options: [
              {
                label: {
                  uk: 'Внутрішнє посилання',
                  ru: 'Внутренняя ссылка',
                },
                value: 'reference',
              },
              {
                label: {
                  uk: 'Власний URL',
                  ru: 'Свой URL',
                },
                value: 'custom',
              },
            ],
          },
          {
            name: 'newTab',
            type: 'checkbox',
            admin: {
              style: {
                alignSelf: 'flex-end',
              },
              width: '50%',
            },
            label: {
              uk: 'Відкривати в новій вкладці',
              ru: 'Открывать в новой вкладке',
            },
          },
        ],
      },
    ],
  }

  const linkTypes: Field[] = [
    {
      name: 'reference',
      type: 'relationship',
      admin: {
        condition: (_, siblingData) => siblingData?.type === 'reference',
      },
      label: {
        uk: 'Документ для посилання',
        ru: 'Документ для ссылки',
      },
      maxDepth: 1,
      relationTo: ['pages'],
      required: true,
    },
    {
      name: 'url',
      type: 'text',
      admin: {
        condition: (_, siblingData) => siblingData?.type === 'custom',
      },
      label: {
        uk: 'Власний URL',
        ru: 'Свой URL',
      },
      required: true,
    },
  ]

  if (!disableLabel) {
    linkTypes.map((linkType) => ({
      ...linkType,
      admin: {
        ...linkType.admin,
        width: '50%',
      },
    }))

    linkResult.fields.push({
      type: 'row',
      fields: [
        ...linkTypes,
        {
          name: 'label',
          type: 'text',
          admin: {
            width: '50%',
          },
          label: {
            uk: 'Текст посилання',
            ru: 'Текст ссылки',
          },
          localized: true,
          required: true,
        },
      ],
    })
  } else {
    linkResult.fields = [...linkResult.fields, ...linkTypes]
  }

  if (appearances !== false) {
    let appearanceOptionsToUse = [appearanceOptions.default, appearanceOptions.outline]

    if (appearances) {
      appearanceOptionsToUse = appearances.map((appearance) => appearanceOptions[appearance])
    }

    linkResult.fields.push({
      name: 'appearance',
      type: 'select',
      admin: {
        description: {
          uk: 'Виберіть стиль відображення посилання.',
          ru: 'Выберите стиль отображения ссылки.',
        },
      },
      defaultValue: 'default',
      label: {
        uk: 'Вигляд',
        ru: 'Вид',
      },
      options: appearanceOptionsToUse,
    })
  }

  return deepMerge(linkResult, overrides)
}
