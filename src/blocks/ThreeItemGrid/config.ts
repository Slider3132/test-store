import type { Block } from 'payload'
import { blockPreview } from '../blockPreview'

export const ThreeItemGrid: Block = {
  slug: 'threeItemGrid',
  admin: blockPreview('three-item-grid', 'Превʼю сітки з трьох товарів'),
  fields: [
    {
      name: 'products',
      type: 'relationship',
      admin: {
        isSortable: true,
      },
      hasMany: true,
      label: {
        uk: 'Товари для показу',
        ru: 'Товары для показа',
      },
      maxRows: 3,
      minRows: 3,
      relationTo: 'products',
    },
  ],
  interfaceName: 'ThreeItemGridBlock',
  labels: {
    plural: {
      uk: 'Сітки з трьох товарів',
      ru: 'Сетки из трех товаров',
    },
    singular: {
      uk: 'Сітка з трьох товарів',
      ru: 'Сетка из трех товаров',
    },
  },
}
