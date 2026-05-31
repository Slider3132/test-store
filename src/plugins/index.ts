import { formBuilderPlugin } from '@payloadcms/plugin-form-builder'
import { seoPlugin } from '@payloadcms/plugin-seo'
import { s3Storage } from '@payloadcms/storage-s3'
import type { Field, StaticLabel } from 'payload'
import { Plugin } from 'payload'
import { GenerateTitle, GenerateURL } from '@payloadcms/plugin-seo/types'
import { FixedToolbarFeature, HeadingFeature, lexicalEditor } from '@payloadcms/richtext-lexical'
import { ecommercePlugin } from '@payloadcms/plugin-ecommerce'

import { Page, Product } from '@/payload-types'
import { getServerSideURL } from '@/utilities/getURL'
import { ProductsCollection } from '@/collections/Products'
import { adminOrPublishedStatus } from '@/access/adminOrPublishedStatus'
import { adminOnlyFieldAccess } from '@/access/adminOnlyFieldAccess'
import { customerOnlyFieldAccess } from '@/access/customerOnlyFieldAccess'
import { isAdmin } from '@/access/isAdmin'
import { isDocumentOwner } from '@/access/isDocumentOwner'
import { adminGroups, collectionLabels, fieldLabels } from '@/i18n/adminLabels'
import { currenciesConfig } from '@/lib/currency'
import { assertProductionStorageConfigured, hasS3StorageEnv } from '@/lib/env'
import { editorPriceFields, isPluginPriceGroup } from '@/fields/priceFields'
import { syncPriceAfterRead, syncPriceBeforeChange } from '@/hooks/syncPriceFields'
import { getServerPaymentMethods } from '@/payments/config'
import {
  reconcileOrderStockReservation,
  releaseOrderStock,
  reserveOrderStock,
} from '@/payments/stockReservations'
import { canManageCommerce, manageCommerce, manageContent } from '@/access/utilities'
import { syncOrderTrackingFields } from '@/delivery/details'

const generateTitle: GenerateTitle<Product | Page> = ({ doc }) => {
  return doc?.title ? `${doc.title} | Payload Ecommerce Template` : 'Payload Ecommerce Template'
}

const generateURL: GenerateURL<Product | Page> = ({ doc }) => {
  const url = getServerSideURL()

  return doc?.slug ? `${url}/${doc.slug}` : url
}

assertProductionStorageConfigured()

const pluginFieldLabels: Record<string, StaticLabel> = {
  accessToken: fieldLabels.accessToken,
  amount: fieldLabels.amount,
  billingAddress: fieldLabels.billingAddress,
  customer: fieldLabels.customer,
  customerEmail: fieldLabels.customerEmail,
  firstName: fieldLabels.firstName,
  inventory: 'Залишок',
  items: 'Товари',
  label: fieldLabels.title,
  lastName: 'Прізвище',
  options: fieldLabels.variantOptions,
  paymentMethod: 'Спосіб оплати',
  product: fieldLabels.product,
  quantity: fieldLabels.quantity,
  shippingAddress: fieldLabels.shippingAddress,
  status: fieldLabels.status,
  title: fieldLabels.title,
  transactions: collectionLabels.transactions.plural,
  value: 'Значення',
  variantOptions: fieldLabels.variantOptions,
  variantType: fieldLabels.variantType,
}

const localizePluginField = (field: Field): Field => {
  const nextField = { ...field } as any

  if ('name' in nextField && typeof nextField.name === 'string') {
    const label = pluginFieldLabels[nextField.name]

    if (label) {
      nextField.label = label
    }
  }

  if (Array.isArray(nextField.fields)) {
    nextField.fields = nextField.fields.map(localizePluginField)
  }

  if (Array.isArray(nextField.tabs)) {
    nextField.tabs = nextField.tabs.map((tab: any) => ({
      ...tab,
      fields: Array.isArray(tab.fields) ? tab.fields.map(localizePluginField) : tab.fields,
    }))
  }

  return nextField
}

const localizeVariantContentField = (field: Field): Field => {
  const nextField = localizePluginField(field) as any

  if ('name' in nextField && (nextField.name === 'label' || nextField.name === 'title')) {
    nextField.localized = true
  }

  return nextField
}

const localizeVariantOptionField = (field: Field): Field => {
  const nextField = localizePluginField(field) as any

  if ('name' in nextField && nextField.name === 'label') {
    nextField.localized = true
  }

  return nextField
}

export const plugins: Plugin[] = [
  ...(hasS3StorageEnv
    ? [
        s3Storage({
          bucket: process.env.S3_BUCKET!,
          collections: {
            media: {
              prefix: 'media',
            },
          },
          config: {
            credentials: {
              accessKeyId: process.env.S3_ACCESS_KEY_ID!,
              secretAccessKey: process.env.S3_SECRET_ACCESS_KEY!,
            },
            endpoint: process.env.S3_ENDPOINT,
            forcePathStyle: true,
            region: process.env.S3_REGION || 'auto',
          },
          useCompositePrefixes: true,
        }),
      ]
    : []),
  seoPlugin({
    generateTitle,
    generateURL,
  }),
  formBuilderPlugin({
    fields: {
      payment: false,
    },
    formOverrides: {
      access: {
        delete: isAdmin,
        read: manageContent,
        update: manageContent,
        create: manageContent,
      },
      admin: {
        group: adminGroups.content,
      },
      labels: collectionLabels.forms,
      fields: ({ defaultFields }) => {
        return defaultFields.map((field) => {
          if ('name' in field && field.name === 'confirmationMessage') {
            return {
              ...localizePluginField(field),
              editor: lexicalEditor({
                features: ({ rootFeatures }) => {
                  return [
                    ...rootFeatures,
                    FixedToolbarFeature(),
                    HeadingFeature({ enabledHeadingSizes: ['h1', 'h2', 'h3', 'h4'] }),
                  ]
                },
              }),
            }
          }
          return localizePluginField(field)
        })
      },
    },
    formSubmissionOverrides: {
      access: {
        delete: isAdmin,
        read: manageContent,
        update: manageContent,
      },
      admin: {
        group: adminGroups.content,
      },
      labels: collectionLabels.formSubmissions,
      fields: ({ defaultFields }) => defaultFields.map(localizePluginField),
    },
  }),
  ecommercePlugin({
    access: {
      adminOnlyFieldAccess,
      adminOrPublishedStatus,
      customerOnlyFieldAccess,
      isAdmin,
      isDocumentOwner,
    },
    currencies: currenciesConfig,
    customers: {
      slug: 'users',
    },
    addresses: {
      addressesCollectionOverride: ({ defaultCollection }) => ({
        ...defaultCollection,
        admin: {
          ...defaultCollection.admin,
          group: adminGroups.ecommerce,
          hidden: false,
        },
        fields: defaultCollection.fields.map(localizePluginField),
        labels: collectionLabels.addresses,
      }),
    },
    carts: {
      cartsCollectionOverride: ({ defaultCollection }) => ({
        ...defaultCollection,
        admin: {
          ...defaultCollection.admin,
          group: adminGroups.ecommerce,
        },
        fields: defaultCollection.fields.map(localizePluginField),
        labels: collectionLabels.carts,
      }),
    },
    orders: {
      ordersCollectionOverride: ({ defaultCollection }) => ({
        ...defaultCollection,
        access: {
          ...defaultCollection.access,
          admin: ({ req: { user } }) => canManageCommerce(user),
          create: manageCommerce,
          read: manageCommerce,
          update: manageCommerce,
          delete: isAdmin,
        },
        admin: {
          ...defaultCollection.admin,
          defaultColumns: [
            'id',
            'createdAt',
            'customerEmail',
            'paymentStatus',
            'fulfillmentStatus',
            'deliveryMethod',
            'deliveryDetails.trackingNumber',
            'amount',
          ],
          group: adminGroups.ecommerce,
        },
        hooks: {
          ...defaultCollection.hooks,
          beforeChange: [
            ...(defaultCollection.hooks?.beforeChange || []),
            async ({ data, operation, originalDoc, req }) => {
              data = syncOrderTrackingFields(data || {})

              if (data?.deliveryDetails?.provider && !data.deliveryMethod) {
                data.deliveryMethod = data.deliveryDetails.provider
              }

              const nextStatus = data?.status || originalDoc?.status
              const nextReservationStatus =
                data?.stockReservationStatus || originalDoc?.stockReservationStatus || 'none'
              const hasTransactionLink = Boolean(
                (Array.isArray(data?.transactions) && data.transactions.length) ||
                  (Array.isArray(originalDoc?.transactions) && originalDoc.transactions.length),
              )
              const shouldRelease =
                nextReservationStatus === 'reserved' &&
                (nextStatus === 'cancelled' || nextStatus === 'refunded')
              const shouldReconcileReservedItems =
                operation === 'update' &&
                nextReservationStatus === 'reserved' &&
                Array.isArray(data?.items)
              const shouldReserve =
                !hasTransactionLink &&
                nextReservationStatus !== 'reserved' &&
                nextStatus !== 'cancelled' &&
                nextStatus !== 'refunded'

              if (shouldRelease) {
                await releaseOrderStock({
                  order: {
                    ...originalDoc,
                    ...data,
                    stockReservationStatus: nextReservationStatus,
                  },
                  req,
                })

                return {
                  ...data,
                  stockReservationStatus: 'released',
                }
              }

              if (shouldReconcileReservedItems) {
                await reconcileOrderStockReservation({
                  nextOrder: {
                    ...originalDoc,
                    ...data,
                    stockReservationStatus: nextReservationStatus,
                  },
                  originalOrder: {
                    ...originalDoc,
                    stockReservationStatus: nextReservationStatus,
                  },
                  req,
                })

                return data
              }

              if (operation === 'create' || shouldReserve) {
                await reserveOrderStock({
                  order: {
                    ...originalDoc,
                    ...data,
                    stockReservationStatus: nextReservationStatus,
                  },
                  req,
                })

                return {
                  ...data,
                  stockReservationStatus: 'reserved',
                }
              }

              return data
            },
          ],
          afterChange: [
            ...(defaultCollection.hooks?.afterChange || []),
            async ({ doc, operation, previousDoc, req }) => {
              const before = previousDoc
                ? {
                    deliveryDetails: previousDoc.deliveryDetails,
                    deliveryMethod: previousDoc.deliveryMethod,
                    fulfillmentStatus: previousDoc.fulfillmentStatus,
                    paymentStatus: previousDoc.paymentStatus,
                    status: previousDoc.status,
                    stockReservationStatus: previousDoc.stockReservationStatus,
                  }
                : null
              const after = {
                deliveryDetails: doc.deliveryDetails,
                deliveryMethod: doc.deliveryMethod,
                fulfillmentStatus: doc.fulfillmentStatus,
                paymentStatus: doc.paymentStatus,
                status: doc.status,
                stockReservationStatus: doc.stockReservationStatus,
              }

              await req.payload.create({
                collection: 'auditLogs' as any,
                data: {
                  action: `orders.${operation}`,
                  actorEmail: req.user?.email,
                  actorID: req.user?.id ? String(req.user.id) : undefined,
                  after,
                  before,
                  collectionSlug: 'orders',
                  documentID: String(doc.id),
                  message: `Order ${doc.id} ${operation}`,
                  operation,
                  requestID: req.headers?.get?.('x-request-id') || undefined,
                  snapshot: after,
                },
                overrideAccess: true,
                req,
              })
            },
          ],
        },
        labels: collectionLabels.orders,
        fields: [
          ...defaultCollection.fields.map((field) => {
            field = localizePluginField(field)

            if ('name' in field && field.name === 'status') {
              return {
                ...field,
                defaultValue: 'new',
                options: [
                  { label: { uk: 'Нове', ru: 'Новое' }, value: 'new' },
                  { label: { uk: 'Оплачено', ru: 'Оплачено' }, value: 'paid' },
                  { label: { uk: 'В обробці', ru: 'В обработке' }, value: 'processing' },
                  { label: { uk: 'Відправлено', ru: 'Отправлено' }, value: 'shipped' },
                  { label: { uk: 'Виконано', ru: 'Выполнено' }, value: 'completed' },
                  { label: { uk: 'Скасовано', ru: 'Отменено' }, value: 'cancelled' },
                  { label: { uk: 'Повернення', ru: 'Возврат' }, value: 'refunded' },
                ],
              } as any
            }

            return field
          }),
          {
            name: 'paymentStatus',
            type: 'select',
            defaultValue: 'unpaid',
            admin: {
              position: 'sidebar',
            },
            label: 'Статус оплати',
            options: [
              { label: { uk: 'Не оплачено', ru: 'Не оплачено' }, value: 'unpaid' },
              { label: { uk: 'Оплачено', ru: 'Оплачено' }, value: 'paid' },
              { label: { uk: 'Повернення', ru: 'Возврат' }, value: 'refunded' },
              { label: { uk: 'Скасовано', ru: 'Отменено' }, value: 'cancelled' },
            ],
          },
          {
            name: 'fulfillmentStatus',
            type: 'select',
            defaultValue: 'new',
            admin: {
              position: 'sidebar',
            },
            label: 'Статус виконання',
            options: [
              { label: { uk: 'Нове', ru: 'Новое' }, value: 'new' },
              { label: { uk: 'В обробці', ru: 'В обработке' }, value: 'processing' },
              { label: { uk: 'Відправлено', ru: 'Отправлено' }, value: 'shipped' },
              { label: { uk: 'Виконано', ru: 'Выполнено' }, value: 'completed' },
              { label: { uk: 'Скасовано', ru: 'Отменено' }, value: 'cancelled' },
            ],
          },
          {
            name: 'deliveryMethod',
            type: 'select',
            defaultValue: 'pickup',
            admin: {
              position: 'sidebar',
            },
            label: 'Доставка',
            options: [
              { label: { uk: 'Самовивіз', ru: 'Самовывоз' }, value: 'pickup' },
              { label: { uk: 'Нова Пошта', ru: 'Новая Почта' }, value: 'nova_poshta' },
              { label: { uk: 'Укрпошта', ru: 'Укрпочта' }, value: 'ukrposhta' },
              { label: { uk: 'Інше', ru: 'Другое' }, value: 'other' },
            ],
          },
          {
            name: 'deliveryDetails',
            type: 'group',
            admin: {
              description: {
                uk: 'Дані доставки з checkout або ручного замовлення. Менеджер може оновити ТТН та примітки.',
                ru: 'Данные доставки из checkout или ручного заказа. Менеджер может обновить ТТН и примечания.',
              },
            },
            label: {
              uk: 'Деталі доставки',
              ru: 'Детали доставки',
            },
            fields: [
              {
                name: 'provider',
                type: 'select',
                label: {
                  uk: 'Служба доставки',
                  ru: 'Служба доставки',
                },
                options: [
                  { label: { uk: 'Самовивіз', ru: 'Самовывоз' }, value: 'pickup' },
                  { label: { uk: 'Нова Пошта', ru: 'Новая Почта' }, value: 'nova_poshta' },
                  { label: { uk: 'Укрпошта', ru: 'Укрпочта' }, value: 'ukrposhta' },
                ],
              },
              {
                name: 'cityID',
                type: 'text',
                label: {
                  uk: 'ID міста',
                  ru: 'ID города',
                },
              },
              {
                name: 'cityLabel',
                type: 'text',
                label: {
                  uk: 'Місто',
                  ru: 'Город',
                },
              },
              {
                name: 'warehouseID',
                type: 'text',
                label: {
                  uk: 'ID відділення',
                  ru: 'ID отделения',
                },
              },
              {
                name: 'warehouseLabel',
                type: 'text',
                label: {
                  uk: 'Відділення',
                  ru: 'Отделение',
                },
              },
              {
                name: 'recipientName',
                type: 'text',
                label: {
                  uk: 'Отримувач',
                  ru: 'Получатель',
                },
              },
              {
                name: 'recipientPhone',
                type: 'text',
                label: {
                  uk: 'Телефон отримувача',
                  ru: 'Телефон получателя',
                },
              },
              {
                name: 'price',
                type: 'number',
                label: {
                  uk: 'Вартість доставки',
                  ru: 'Стоимость доставки',
                },
              },
              {
                name: 'freeShipping',
                type: 'checkbox',
                defaultValue: false,
                label: {
                  uk: 'Безкоштовна доставка',
                  ru: 'Бесплатная доставка',
                },
              },
              {
                name: 'trackingNumber',
                type: 'text',
                admin: {
                  hidden: true,
                },
                label: {
                  uk: 'Службовий tracking number',
                  ru: 'Служебный tracking number',
                },
              },
              {
                name: 'notes',
                type: 'textarea',
                label: {
                  uk: 'Примітки до доставки',
                  ru: 'Примечания к доставке',
                },
              },
            ],
          },
          {
            name: 'trackingNumber',
            type: 'text',
            admin: {
              description: {
                uk: 'Номер ТТН, який менеджер додає після підтвердження замовлення. Автоматично дублюється в деталях доставки.',
                ru: 'Номер ТТН, который менеджер добавляет после подтверждения заказа. Автоматически дублируется в деталях доставки.',
              },
              position: 'sidebar',
            },
            label: 'ТТН / tracking',
          },
          {
            name: 'stockReservationStatus',
            type: 'select',
            defaultValue: 'none',
            admin: {
              position: 'sidebar',
              readOnly: true,
            },
            label: 'Резерв складу',
            options: [
              { label: { uk: 'Немає', ru: 'Нет' }, value: 'none' },
              { label: { uk: 'Зарезервовано', ru: 'Зарезервировано' }, value: 'reserved' },
              { label: { uk: 'Повернуто', ru: 'Возвращено' }, value: 'released' },
            ],
          },
          {
            name: 'accessToken',
            type: 'text',
            unique: true,
            index: true,
            admin: {
              position: 'sidebar',
              readOnly: true,
            },
            hooks: {
              beforeValidate: [
                ({ value, operation }) => {
                  if (operation === 'create' || !value) {
                    return crypto.randomUUID()
                  }
                  return value
                },
              ],
            },
            label: fieldLabels.accessToken,
          },
        ],
      }),
    },
    payments: {
      paymentMethods: getServerPaymentMethods(),
    },
    products: {
      productsCollectionOverride: ProductsCollection,
      variants: {
        variantOptionsCollectionOverride: ({ defaultCollection }) => ({
          ...defaultCollection,
          access: {
            ...defaultCollection.access,
            create: manageContent,
            delete: isAdmin,
            read: manageContent,
            update: manageContent,
          },
          admin: {
            ...defaultCollection.admin,
            defaultColumns: ['value', 'swatch', 'updatedAt'],
            group: adminGroups.ecommerce,
          },
          fields: [
            ...defaultCollection.fields.map(localizeVariantOptionField),
            {
              name: 'swatch',
              type: 'text',
              admin: {
                description: {
                  uk: 'HEX-колір для палітри, якщо ця опція є кольором. Наприклад #111827.',
                  ru: 'HEX-цвет для палитры, если эта опция является цветом. Например #111827.',
                },
              },
              label: 'Зразок кольору',
            },
          ],
          labels: collectionLabels.variantOptions,
        }),
        variantTypesCollectionOverride: ({ defaultCollection }) => ({
          ...defaultCollection,
          access: {
            ...defaultCollection.access,
            create: manageContent,
            delete: isAdmin,
            read: manageContent,
            update: manageContent,
          },
          admin: {
            ...defaultCollection.admin,
            group: adminGroups.ecommerce,
          },
          fields: defaultCollection.fields.map(localizeVariantContentField),
          labels: collectionLabels.variantTypes,
        }),
        variantsCollectionOverride: ({ defaultCollection }) => ({
          ...defaultCollection,
          access: {
            ...defaultCollection.access,
            create: manageContent,
            delete: isAdmin,
            read: manageContent,
            update: manageContent,
          },
          admin: {
            ...defaultCollection.admin,
            defaultColumns: ['id', 'product', 'inventory', '_status'],
            group: adminGroups.ecommerce,
          },
          fields: [
            ...editorPriceFields,
            ...defaultCollection.fields
              .filter((field) => !isPluginPriceGroup(field))
              .map(localizeVariantContentField),
            {
              name: 'image',
              type: 'upload',
              admin: {
                description: {
                  uk: 'Фото саме цього SKU/варіанта. Наприклад: чорна футболка S може використовувати фото чорної футболки.',
                  ru: 'Фото именно этого SKU/варианта. Например: черная футболка S может использовать фото черной футболки.',
                },
              },
              label: {
                uk: 'Фото варіанта',
                ru: 'Фото варианта',
              },
              relationTo: 'media',
            },
          ],
          hooks: {
            ...defaultCollection.hooks,
            afterRead: [...(defaultCollection.hooks?.afterRead || []), syncPriceAfterRead],
            beforeChange: [...(defaultCollection.hooks?.beforeChange || []), syncPriceBeforeChange],
          },
          labels: collectionLabels.variants,
        }),
      },
    },
    transactions: {
      transactionsCollectionOverride: ({ defaultCollection }) => ({
        ...defaultCollection,
        admin: {
          ...defaultCollection.admin,
          group: adminGroups.ecommerce,
        },
        fields: defaultCollection.fields.map(localizePluginField),
        labels: collectionLabels.transactions,
      }),
    },
  }),
]
