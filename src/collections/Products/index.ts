import { CallToAction } from '@/blocks/CallToAction/config'
import { Content } from '@/blocks/Content/config'
import { MediaBlock } from '@/blocks/MediaBlock/config'
import { slugField } from 'payload'
import { generatePreviewPath } from '@/utilities/generatePreviewPath'
import { CollectionOverride } from '@payloadcms/plugin-ecommerce/types'
import {
  MetaDescriptionField,
  MetaImageField,
  MetaTitleField,
  OverviewField,
  PreviewField,
} from '@payloadcms/plugin-seo/fields'
import {
  FixedToolbarFeature,
  HeadingFeature,
  HorizontalRuleFeature,
  InlineToolbarFeature,
  lexicalEditor,
} from '@payloadcms/richtext-lexical'
import { DefaultDocumentIDType, Where } from 'payload'
import { adminGroups, collectionLabels, fieldLabels } from '@/i18n/adminLabels'
import { editorPriceFields, isPluginPriceGroup } from '@/fields/priceFields'
import { syncPriceAfterRead, syncPriceBeforeChange } from '@/hooks/syncPriceFields'
import { priceField } from '@/lib/currency'
import { adminOnly } from '@/access/adminOnly'
import { adminOrPublishedStatus } from '@/access/adminOrPublishedStatus'
import { manageContent } from '@/access/utilities'

const getRelationshipID = (value: unknown): DefaultDocumentIDType | undefined => {
  if (!value) return undefined
  if (typeof value === 'object' && 'id' in value) return value.id as DefaultDocumentIDType
  return value as DefaultDocumentIDType
}

const findProductTypeFromCategories = async ({
  categoryIDs,
  req,
}: {
  categoryIDs: DefaultDocumentIDType[]
  req: any
}): Promise<DefaultDocumentIDType | undefined> => {
  const visited = new Set<DefaultDocumentIDType>()

  for (const categoryID of categoryIDs) {
    let currentCategoryID: DefaultDocumentIDType | undefined = categoryID

    while (currentCategoryID && !visited.has(currentCategoryID)) {
      visited.add(currentCategoryID)

      const category = await req.payload.findByID({
        collection: 'categories',
        depth: 1,
        id: currentCategoryID,
        locale: req.locale,
        overrideAccess: true,
      })

      const productTypeID = getRelationshipID(category?.productType)

      if (productTypeID) {
        return productTypeID
      }

      currentCategoryID = getRelationshipID(category?.parent)
    }
  }
}

const syncProductTypeConfig = async ({ data, originalDoc, req }: any) => {
  if (!data) return data

  const nextData = { ...data }
  const categoryIDs = (nextData.categories || originalDoc?.categories || [])
    .map(getRelationshipID)
    .filter(Boolean)

  let productTypeID = getRelationshipID(nextData.productType || originalDoc?.productType)

  if (!productTypeID && categoryIDs.length) {
    productTypeID = await findProductTypeFromCategories({
      categoryIDs,
      req,
    })

    if (productTypeID) {
      nextData.productType = productTypeID
    }
  }

  if (!productTypeID) return nextData

  const productType = await req.payload.findByID({
    collection: 'productTypes' as any,
    depth: 2,
    id: productTypeID,
    locale: req.locale,
    overrideAccess: true,
  })

  const variantAxes = Array.isArray(productType?.variantAxes) ? productType.variantAxes : []
  const variantTypeIDs = variantAxes
    .map((axis: any) => getRelationshipID(axis?.variantType))
    .filter(Boolean)
  const mediaVariantTypeID = getRelationshipID(
    variantAxes.find((axis: any) => axis?.affectsMedia)?.variantType,
  )

  if (variantTypeIDs.length) {
    nextData.enableVariants = true
    nextData.variantTypes = variantTypeIDs
  }

  nextData.mediaVariantType = mediaVariantTypeID || null

  return nextData
}

export const ProductsCollection: CollectionOverride = ({ defaultCollection }) => ({
  ...defaultCollection,
  access: {
    ...defaultCollection.access,
    create: manageContent,
    delete: adminOnly,
    read: adminOrPublishedStatus,
    update: manageContent,
  },
  admin: {
    ...defaultCollection?.admin,
    components: {
      ...defaultCollection?.admin?.components,
      edit: {
        ...defaultCollection?.admin?.components?.edit,
        beforeDocumentControls: [
          '@/components/Admin/LivePreviewLoadPreference#LivePreviewLoadPreference',
        ],
      },
    },
    defaultColumns: ['title', 'enableVariants', '_status', 'variants.variants'],
    group: adminGroups.ecommerce,
    livePreview: {
      url: ({ data, req }) =>
        generatePreviewPath({
          slug: data?.slug,
          collection: 'products',
          req,
        }),
    },
    preview: (data, { req }) =>
      generatePreviewPath({
        slug: data?.slug as string,
        collection: 'products',
        req,
      }),
    useAsTitle: 'title',
  },
  defaultPopulate: {
    ...defaultCollection?.defaultPopulate,
    title: true,
    slug: true,
    variantOptions: true,
    availableVariantOptions: true,
    mediaVariantType: true,
    productType: true,
    variants: true,
    enableVariants: true,
    gallery: true,
    price: true,
    currency: true,
    compareAtPrice: true,
    [priceField]: true,
    inventory: true,
    meta: true,
  },
  hooks: {
    ...defaultCollection?.hooks,
    afterRead: [...(defaultCollection?.hooks?.afterRead || []), syncPriceAfterRead],
    beforeValidate: [...(defaultCollection?.hooks?.beforeValidate || []), syncProductTypeConfig],
    beforeChange: [...(defaultCollection?.hooks?.beforeChange || []), syncPriceBeforeChange],
  },
  labels: collectionLabels.products,
  fields: [
    { name: 'title', type: 'text', label: fieldLabels.title, localized: true, required: true },
    {
      type: 'tabs',
      tabs: [
        {
          fields: [
            {
              name: 'description',
              type: 'richText',
              editor: lexicalEditor({
                features: ({ rootFeatures }) => {
                  return [
                    ...rootFeatures,
                    HeadingFeature({ enabledHeadingSizes: ['h1', 'h2', 'h3', 'h4'] }),
                    FixedToolbarFeature(),
                    InlineToolbarFeature(),
                    HorizontalRuleFeature(),
                  ]
                },
              }),
              label: false,
              localized: true,
              required: false,
            },
            {
              name: 'gallery',
              type: 'array',
              label: fieldLabels.gallery,
              minRows: 1,
              fields: [
                {
                  name: 'image',
                  type: 'upload',
                  label: {
                    uk: 'Зображення',
                    ru: 'Изображение',
                  },
                  relationTo: 'media',
                  required: true,
                },
                {
                  name: 'variantOption',
                  type: 'relationship',
                  label: {
                    uk: 'Опція, що змінює фото',
                    ru: 'Опция, которая меняет фото',
                  },
                  relationTo: 'variantOptions',
                  admin: {
                    description: {
                      uk: 'Наприклад: чорний або білий колір. Розмір тут не обираємо, якщо він не впливає на фото.',
                      ru: 'Например: черный или белый цвет. Размер здесь не выбираем, если он не влияет на фото.',
                    },
                    condition: (data) => {
                      return data?.enableVariants === true && Boolean(data?.mediaVariantType)
                    },
                  },
                  filterOptions: ({ data }) => {
                    const mediaVariantTypeID = getRelationshipID(data?.mediaVariantType)

                    if (data?.enableVariants && mediaVariantTypeID) {
                      const query: Where = {
                        variantType: {
                          equals: mediaVariantTypeID,
                        },
                      }

                      return query
                    }

                    return {
                      variantType: {
                        in: [],
                      },
                    }
                  },
                },
              ],
            },

            {
              name: 'layout',
              type: 'blocks',
              blocks: [CallToAction, Content, MediaBlock],
              label: {
                uk: 'Контент товару',
                ru: 'Контент товара',
              },
              localized: true,
            },
          ],
          label: fieldLabels.content,
        },
        {
          fields: [
            ...editorPriceFields,
            ...defaultCollection.fields.filter((field) => !isPluginPriceGroup(field)),
            {
              name: 'availableVariantOptions',
              type: 'relationship',
              admin: {
                description: {
                  uk: 'Наклікайте, які опції реально доступні для цього товару: наприклад чорний, білий, S, M, L. Конкретні SKU залишаються у вкладці варіантів.',
                  ru: 'Выберите, какие опции реально доступны для этого товара: например черный, белый, S, M, L. Конкретные SKU остаются во вкладке вариантов.',
                },
                condition: (data) => {
                  return data?.enableVariants === true && data?.variantTypes?.length > 0
                },
              },
              filterOptions: ({ data }) => {
                const variantTypeIDs = (data?.variantTypes || [])
                  .map(getRelationshipID)
                  .filter(Boolean)

                if (!variantTypeIDs.length) {
                  return {
                    variantType: {
                      in: [],
                    },
                  }
                }

                return {
                  variantType: {
                    in: variantTypeIDs,
                  },
                }
              },
              hasMany: true,
              label: {
                uk: 'Доступні опції товару',
                ru: 'Доступные опции товара',
              },
              relationTo: 'variantOptions',
            },
            {
              name: 'attributeValues',
              type: 'array',
              admin: {
                description: {
                  uk: 'Характеристики товару за схемою виду товару. Наприклад: матеріал, сезон, бренд, потужність.',
                  ru: 'Характеристики товара по схеме типа товара. Например: материал, сезон, бренд, мощность.',
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
                },
                {
                  name: 'value',
                  type: 'text',
                  label: {
                    uk: 'Значення',
                    ru: 'Значение',
                  },
                },
              ],
              label: {
                uk: 'Характеристики',
                ru: 'Характеристики',
              },
            },
            {
              name: 'reviewSummary',
              type: 'group',
              fields: [
                {
                  name: 'rating',
                  type: 'number',
                  admin: {
                    step: 0.1,
                  },
                  label: {
                    uk: 'Середній рейтинг',
                    ru: 'Средний рейтинг',
                  },
                  max: 5,
                  min: 0,
                },
                {
                  name: 'reviewCount',
                  type: 'number',
                  label: {
                    uk: 'Кількість відгуків',
                    ru: 'Количество отзывов',
                  },
                  min: 0,
                },
              ],
              label: {
                uk: 'Рейтинг',
                ru: 'Рейтинг',
              },
            },
            {
              name: 'reviews',
              type: 'array',
              admin: {
                description: {
                  uk: 'Демо-відгуки для сторінки товару. Реальні відгуки пізніше краще винести в окрему колекцію з модерацією.',
                  ru: 'Демо-отзывы для страницы товара. Реальные отзывы позже лучше вынести в отдельную коллекцию с модерацией.',
                },
              },
              fields: [
                {
                  name: 'author',
                  type: 'text',
                  label: {
                    uk: 'Автор',
                    ru: 'Автор',
                  },
                  required: true,
                },
                {
                  name: 'rating',
                  type: 'number',
                  defaultValue: 5,
                  label: {
                    uk: 'Оцінка',
                    ru: 'Оценка',
                  },
                  max: 5,
                  min: 1,
                  required: true,
                },
                {
                  name: 'text',
                  type: 'textarea',
                  label: {
                    uk: 'Текст',
                    ru: 'Текст',
                  },
                  localized: true,
                  required: true,
                },
              ],
              label: {
                uk: 'Відгуки',
                ru: 'Отзывы',
              },
            },
            {
              name: 'relatedProducts',
              type: 'relationship',
              filterOptions: ({ id }) => {
                if (id) {
                  return {
                    id: {
                      not_in: [id],
                    },
                  }
                }

                // ID comes back as undefined during seeding so we need to handle that case
                return {
                  id: {
                    exists: true,
                  },
                }
              },
              hasMany: true,
              label: {
                uk: 'Схожі товари',
                ru: 'Похожие товары',
              },
              relationTo: 'products',
            },
          ],
          label: fieldLabels.productDetails,
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
    {
      name: 'categories',
      type: 'relationship',
      label: fieldLabels.categories,
      admin: {
        components: {
          Field: '@/components/Admin/CategoryTreeSelect#CategoryTreeSelect',
        },
        position: 'sidebar',
        sortOptions: 'title',
      },
      hasMany: true,
      relationTo: 'categories',
    },
    {
      name: 'productType',
      type: 'relationship',
      label: fieldLabels.productType,
      relationTo: 'productTypes',
      admin: {
        description: {
          uk: 'Якщо не вибрано вручну, підтягнеться з першої категорії під час збереження.',
          ru: 'Если не выбрано вручную, подтянется из первой категории при сохранении.',
        },
        position: 'sidebar',
      },
    },
    {
      name: 'mediaVariantType',
      type: 'relationship',
      label: {
        uk: 'Вісь фото',
        ru: 'Ось фото',
      },
      relationTo: 'variantTypes',
      admin: {
        description: {
          uk: 'Автоматично береться з виду товару. Саме її опції можна привʼязувати до фото.',
          ru: 'Автоматически берется из типа товара. Именно ее опции можно привязывать к фото.',
        },
        position: 'sidebar',
        readOnly: true,
      },
    },
    slugField(),
  ],
})
