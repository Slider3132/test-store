import type { GlobalConfig } from 'payload'
import { revalidateTag } from 'next/cache'

import { adminOnly } from '@/access/adminOnly'
import { link } from '@/fields/link'
import { globalLabels } from '@/i18n/adminLabels'

export const Footer: GlobalConfig = {
  slug: 'footer',
  label: globalLabels.footer,
  access: {
    read: () => true,
    update: adminOnly,
  },
  hooks: {
    afterChange: [
      ({ req: { context, payload } }) => {
        if (!context.disableRevalidate) {
          try {
            revalidateTag('global_footer_uk', 'max')
            revalidateTag('global_footer_ru', 'max')
          } catch (error) {
            payload.logger.debug({ err: error }, 'Footer cache revalidation skipped')
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
          name: 'showInFooter',
          type: 'checkbox',
          defaultValue: true,
          label: {
            uk: 'Показувати у футері',
            ru: 'Показывать в футере',
          },
        },
        link({
          appearances: false,
        }),
      ],
      maxRows: 6,
    },
  ],
}
