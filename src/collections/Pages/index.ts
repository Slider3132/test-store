import type { CollectionConfig } from 'payload'

import { Banner } from '@/blocks/Banner/config'
import { Carousel } from '@/blocks/Carousel/config'
import { ThreeItemGrid } from '@/blocks/ThreeItemGrid/config'
import { generatePreviewPath } from '@/utilities/generatePreviewPath'
import { adminOnly } from '@/access/adminOnly'
import { manageContent } from '@/access/utilities'
import { Archive } from '@/blocks/ArchiveBlock/config'
import { CallToAction } from '@/blocks/CallToAction/config'
import { CategoryHighlights } from '@/blocks/CategoryHighlights/config'
import { Content } from '@/blocks/Content/config'
import { FeaturedProducts } from '@/blocks/FeaturedProducts/config'
import { FormBlock } from '@/blocks/Form/config'
import { Hero } from '@/blocks/Hero/config'
import { MediaBlock } from '@/blocks/MediaBlock/config'
import { Testimonials } from '@/blocks/Testimonials/config'
import { slugField } from 'payload'
import { adminOrPublishedStatus } from '@/access/adminOrPublishedStatus'
import {
  MetaDescriptionField,
  MetaImageField,
  MetaTitleField,
  OverviewField,
  PreviewField,
} from '@payloadcms/plugin-seo/fields'
import { revalidatePage, revalidateDelete } from './hooks/revalidatePage'
import { adminGroups, collectionLabels, fieldLabels } from '@/i18n/adminLabels'

export const Pages: CollectionConfig = {
  slug: 'pages',
  access: {
    create: manageContent,
    delete: adminOnly,
    read: adminOrPublishedStatus,
    update: manageContent,
  },
  admin: {
    group: adminGroups.content,
    defaultColumns: ['title', 'slug', 'updatedAt'],
    components: {
      edit: {
        beforeDocumentControls: [
          '@/components/Admin/LivePreviewLoadPreference#LivePreviewLoadPreference',
        ],
      },
    },
    livePreview: {
      url: ({ data, req }) =>
        generatePreviewPath({
          slug: data?.slug,
          collection: 'pages',
          req,
        }),
    },
    preview: (data, { req }) =>
      generatePreviewPath({
        slug: data?.slug as string,
        collection: 'pages',
        req,
      }),
    useAsTitle: 'title',
  },
  labels: collectionLabels.pages,
  fields: [
    {
      name: 'title',
      type: 'text',
      label: fieldLabels.title,
      localized: true,
      required: true,
    },
    {
      name: 'publishedOn',
      type: 'date',
      label: {
        uk: 'Дата публікації',
        ru: 'Дата публикации',
      },
      admin: {
        date: {
          pickerAppearance: 'dayAndTime',
        },
        position: 'sidebar',
      },
      hooks: {
        beforeChange: [
          ({ siblingData, value }) => {
            if (siblingData._status === 'published' && !value) {
              return new Date()
            }
            return value
          },
        ],
      },
    },
    {
      type: 'tabs',
      tabs: [
        {
          fields: [
            {
              name: 'layout',
              type: 'blocks',
              label: {
                uk: 'Блоки сторінки',
                ru: 'Блоки страницы',
              },
              blocks: [
                Hero,
                CallToAction,
                CategoryHighlights,
                FeaturedProducts,
                Testimonials,
                Content,
                MediaBlock,
                Archive,
                Carousel,
                ThreeItemGrid,
                Banner,
                FormBlock,
              ],
              required: true,
            },
          ],
          label: fieldLabels.content,
        },
        {
          name: 'meta',
          label: 'SEO',
          fields: [
            OverviewField({
              titlePath: 'meta.title',
              descriptionPath: 'meta.description',
              imagePath: 'meta.image',
            }),
            MetaTitleField({
              hasGenerateFn: true,
            }),
            MetaImageField({
              relationTo: 'media',
            }),

            MetaDescriptionField({}),
            PreviewField({
              // if the `generateUrl` function is configured
              hasGenerateFn: true,

              // field paths to match the target field for data
              titlePath: 'meta.title',
              descriptionPath: 'meta.description',
            }),
          ],
        },
      ],
    },
    slugField(),
  ],
  hooks: {
    afterChange: [revalidatePage],
    afterDelete: [revalidateDelete],
  },
  versions: {
    drafts: {
      autosave: true,
    },
    maxPerDoc: 50,
  },
}
