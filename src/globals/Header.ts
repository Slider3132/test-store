import type { GlobalConfig } from 'payload'
import { revalidateTag } from 'next/cache'

import { adminOnly } from '@/access/adminOnly'
import { link } from '@/fields/link'
import { globalLabels } from '@/i18n/adminLabels'

export const Header: GlobalConfig = {
  slug: 'header',
  label: globalLabels.header,
  access: {
    read: () => true,
    update: adminOnly,
  },
  hooks: {
    afterChange: [
      ({ req: { context, payload } }) => {
        if (!context.disableRevalidate) {
          try {
            revalidateTag('global_header_uk', 'max')
            revalidateTag('global_header_ru', 'max')
          } catch (error) {
            payload.logger.debug({ err: error }, 'Header cache revalidation skipped')
          }
        }
      },
    ],
  },
  fields: [
    {
      name: 'navItems',
      type: 'array',
      label: {
        uk: 'Пункти навігації',
        ru: 'Пункты навигации',
      },
      localized: true,
      fields: [
        {
          name: 'showInHeader',
          type: 'checkbox',
          defaultValue: true,
          label: {
            uk: 'Показувати в хедері',
            ru: 'Показывать в хедере',
          },
        },
        {
          name: 'enableMegaMenu',
          type: 'checkbox',
          defaultValue: false,
          label: {
            uk: 'Відкривати мега-меню',
            ru: 'Открывать мегаменю',
          },
        },
        {
          name: 'megaMenuCategories',
          type: 'relationship',
          admin: {
            components: {
              Field: '@/components/Admin/CategoryTreeSelect#CategoryTreeSelect',
            },
            condition: (_, siblingData) => Boolean(siblingData?.enableMegaMenu),
            custom: {
              rootOnly: true,
            },
          },
          hasMany: true,
          label: {
            uk: 'Категорії мега-меню',
            ru: 'Категории мегаменю',
          },
          relationTo: 'categories',
        },
        link({
          appearances: false,
        }),
      ],
      maxRows: 6,
    },
  ],
}
