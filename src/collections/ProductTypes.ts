import type { CollectionConfig } from 'payload'

import { canManageContent, canManageSettings } from '@/access/utilities'
import { adminGroups, collectionLabels, fieldLabels } from '@/i18n/adminLabels'
import { slugField } from 'payload'

export const ProductTypes: CollectionConfig = {
  slug: 'productTypes',
  access: {
    create: ({ req: { user } }) => canManageSettings(user),
    delete: ({ req: { user } }) => canManageSettings(user),
    read: () => true,
    update: ({ req: { user } }) => canManageContent(user),
  },
  admin: {
    defaultColumns: ['title', 'slug', 'updatedAt'],
    group: adminGroups.ecommerce,
    useAsTitle: 'title',
  },
  labels: collectionLabels.productTypes,
  fields: [
    {
      name: 'title',
      type: 'text',
      label: fieldLabels.title,
      localized: true,
      required: true,
    },
    {
      name: 'description',
      type: 'textarea',
      label: {
        uk: 'Опис',
        ru: 'Описание',
      },
      localized: true,
    },
    {
      name: 'variantAxes',
      type: 'array',
      admin: {
        description: {
          uk: 'Описує, які варіантні осі має цей вид товару. Наприклад: колір впливає на фото, розмір не впливає.',
          ru: 'Описывает, какие вариантные оси есть у этого типа товара. Например: цвет влияет на фото, размер не влияет.',
        },
      },
      fields: [
        {
          name: 'variantType',
          type: 'relationship',
          label: {
            uk: 'Тип варіанта',
            ru: 'Тип варианта',
          },
          relationTo: 'variantTypes',
          required: true,
        },
        {
          name: 'affectsMedia',
          type: 'checkbox',
          defaultValue: false,
          label: {
            uk: 'Впливає на фото',
            ru: 'Влияет на фото',
          },
        },
        {
          name: 'affectsInventory',
          type: 'checkbox',
          defaultValue: true,
          label: {
            uk: 'Створює SKU / залишки',
            ru: 'Создает SKU / остатки',
          },
        },
        {
          name: 'showInFilters',
          type: 'checkbox',
          defaultValue: true,
          label: {
            uk: 'Показувати у фільтрах категорії',
            ru: 'Показывать в фильтрах категории',
          },
        },
      ],
      label: {
        uk: 'Варіантні осі',
        ru: 'Вариантные оси',
      },
    },
    {
      name: 'attributes',
      type: 'array',
      admin: {
        description: {
          uk: 'Характеристики, які не обовʼязково створюють SKU: бренд, матеріал, сезон, потужність тощо.',
          ru: 'Характеристики, которые не обязательно создают SKU: бренд, материал, сезон, мощность и т.д.',
        },
      },
      fields: [
        {
          name: 'name',
          type: 'text',
          label: {
            uk: 'Системна назва',
            ru: 'Системное название',
          },
          required: true,
        },
        {
          name: 'label',
          type: 'text',
          label: fieldLabels.title,
          localized: true,
          required: true,
        },
        {
          name: 'inputType',
          type: 'select',
          defaultValue: 'select',
          label: {
            uk: 'Тип поля',
            ru: 'Тип поля',
          },
          options: [
            {
              label: {
                uk: 'Вибір зі списку',
                ru: 'Выбор из списка',
              },
              value: 'select',
            },
            {
              label: {
                uk: 'Текст',
                ru: 'Текст',
              },
              value: 'text',
            },
            {
              label: {
                uk: 'Число',
                ru: 'Число',
              },
              value: 'number',
            },
            {
              label: {
                uk: 'Так / ні',
                ru: 'Да / нет',
              },
              value: 'boolean',
            },
          ],
          required: true,
        },
        {
          name: 'showInFilters',
          type: 'checkbox',
          defaultValue: true,
          label: {
            uk: 'Показувати у фільтрах',
            ru: 'Показывать в фильтрах',
          },
        },
        {
          name: 'options',
          type: 'array',
          admin: {
            condition: (_, siblingData) => siblingData?.inputType === 'select',
          },
          fields: [
            {
              name: 'label',
              type: 'text',
              label: fieldLabels.title,
              localized: true,
              required: true,
            },
            {
              name: 'value',
              type: 'text',
              label: {
                uk: 'Значення',
                ru: 'Значение',
              },
              required: true,
            },
          ],
          label: {
            uk: 'Варіанти значення',
            ru: 'Варианты значения',
          },
        },
      ],
      label: {
        uk: 'Характеристики',
        ru: 'Характеристики',
      },
    },
    slugField({
      position: undefined,
    }),
  ],
}
