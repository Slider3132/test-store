import type { Block } from 'payload'
import { blockPreview } from '../blockPreview'

export const MediaBlock: Block = {
  slug: 'mediaBlock',
  interfaceName: 'MediaBlock',
  admin: blockPreview('media', 'Превʼю медіа'),
  fields: [
    {
      name: 'media',
      type: 'upload',
      label: {
        uk: 'Медіа',
        ru: 'Медиа',
      },
      relationTo: 'media',
      required: true,
    },
  ],
  labels: {
    plural: {
      uk: 'Медіа-блоки',
      ru: 'Медиа-блоки',
    },
    singular: {
      uk: 'Медіа-блок',
      ru: 'Медиа-блок',
    },
  },
}
