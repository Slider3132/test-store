import { slugField } from 'payload'
import type { CollectionConfig } from 'payload'

import { adminOnly } from '@/access/adminOnly'
import { manageContent } from '@/access/utilities'
import { adminGroups, collectionLabels, fieldLabels } from '@/i18n/adminLabels'

const getRelationID = (value: unknown) => {
  if (!value) return undefined
  if (typeof value === 'object' && 'id' in value) return (value as { id: number | string }).id

  return value as number | string
}

const resolveCategoryTitlePath = async ({ data, originalDoc, req }: any) => {
  const title = data?.title || originalDoc?.title
  const parentID = getRelationID(data?.parent ?? originalDoc?.parent)

  if (!title || !parentID) return title

  const parent = await req.payload.findByID({
    collection: 'categories',
    depth: 0,
    id: parentID,
    locale: req.locale,
  })
  const parentTitle = parent?.adminTitle || parent?.title

  return parentTitle ? `${parentTitle} / ${title}` : title
}

export const Categories: CollectionConfig = {
  slug: 'categories',
  access: {
    create: manageContent,
    delete: adminOnly,
    read: () => true,
    update: manageContent,
  },
  admin: {
    components: {
      views: {
        list: {
          Component: '@/components/Admin/CategoryListView#CategoryListView',
        },
      },
    },
    useAsTitle: 'title',
    group: adminGroups.content,
  },
  hooks: {
    beforeChange: [
      async ({ data, originalDoc, req }) => ({
        ...data,
        adminTitle: await resolveCategoryTitlePath({ data, originalDoc, req }),
      }),
    ],
  },
  labels: collectionLabels.categories,
  fields: [
    {
      name: 'title',
      type: 'text',
      label: fieldLabels.title,
      localized: true,
      required: true,
    },
    {
      name: 'adminTitle',
      type: 'text',
      admin: {
        hidden: true,
      },
      localized: true,
      label: {
        uk: 'Назва в адмінці',
        ru: 'Название в админке',
      },
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
      name: 'parent',
      type: 'relationship',
      label: {
        uk: 'Батьківська категорія',
        ru: 'Родительская категория',
      },
      admin: {
        components: {
          Field: '@/components/Admin/CategoryTreeSelect#CategoryTreeSelect',
        },
      },
      relationTo: 'categories',
    },
    {
      name: 'productType',
      type: 'relationship',
      label: fieldLabels.productType,
      relationTo: 'productTypes',
      admin: {
        description: {
          uk: 'Схема товарів для цієї категорії. Дочірні категорії можуть мати власну схему або успадковувати батьківську логічно в коді.',
          ru: 'Схема товаров для этой категории. Дочерние категории могут иметь свою схему или логически наследовать родительскую в коде.',
        },
      },
    },
    {
      name: 'showInMegaMenu',
      type: 'checkbox',
      defaultValue: true,
      label: {
        uk: 'Показувати в мега-меню',
        ru: 'Показывать в мега-меню',
      },
    },
    {
      name: 'featuredProducts',
      type: 'relationship',
      hasMany: true,
      label: {
        uk: 'Рекомендовані товари для мега-меню',
        ru: 'Рекомендованные товары для мегаменю',
      },
      maxDepth: 1,
      relationTo: 'products',
    },
    {
      name: 'image',
      type: 'upload',
      label: {
        uk: 'Зображення',
        ru: 'Изображение',
      },
      relationTo: 'media',
    },
    slugField({
      position: undefined,
    }),
  ],
}
