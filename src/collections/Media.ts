import type { CollectionConfig } from 'payload'

import {
  FixedToolbarFeature,
  InlineToolbarFeature,
  lexicalEditor,
} from '@payloadcms/richtext-lexical'
import path from 'path'
import { fileURLToPath } from 'url'

import { adminOnly } from '@/access/adminOnly'
import { manageContent } from '@/access/utilities'
import { adminGroups, collectionLabels } from '@/i18n/adminLabels'

const filename = fileURLToPath(import.meta.url)
const dirname = path.dirname(filename)

export const Media: CollectionConfig = {
  admin: {
    group: adminGroups.content,
  },
  labels: collectionLabels.media,
  slug: 'media',
  access: {
    create: manageContent,
    delete: adminOnly,
    read: () => true,
    update: manageContent,
  },
  fields: [
    {
      name: 'alt',
      type: 'text',
      label: 'Альтернативний текст',
      required: true,
    },
    {
      name: 'caption',
      type: 'richText',
      label: 'Підпис',
      editor: lexicalEditor({
        features: ({ rootFeatures }) => {
          return [...rootFeatures, FixedToolbarFeature(), InlineToolbarFeature()]
        },
      }),
    },
  ],
  upload: {
    staticDir: path.resolve(dirname, '../../public/media'),
  },
}
