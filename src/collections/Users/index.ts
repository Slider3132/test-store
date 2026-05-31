import type { CollectionConfig } from 'payload'

import { adminOnly } from '@/access/adminOnly'
import { adminOnlyFieldAccess } from '@/access/adminOnlyFieldAccess'
import { publicAccess } from '@/access/publicAccess'
import { adminOrSelf } from '@/access/adminOrSelf'
import { canManageCommerce, canManageContent, canManageSettings } from '@/access/utilities'

import { ensureFirstUserIsAdmin } from './hooks/ensureFirstUserIsAdmin'
import { adminGroups, collectionLabels, fieldLabels } from '@/i18n/adminLabels'

export const Users: CollectionConfig = {
  slug: 'users',
  access: {
    admin: ({ req: { user } }) =>
      canManageSettings(user) || canManageCommerce(user) || canManageContent(user),
    create: publicAccess,
    delete: adminOnly,
    read: adminOrSelf,
    unlock: adminOnly,
    update: adminOrSelf,
  },
  admin: {
    group: adminGroups.users,
    defaultColumns: ['name', 'email', 'roles'],
    useAsTitle: 'name',
  },
  labels: collectionLabels.users,
  auth: {
    tokenExpiration: 1209600,
  },
  fields: [
    {
      name: 'name',
      type: 'text',
      label: fieldLabels.accountName,
    },
    {
      name: 'roles',
      type: 'select',
      label: fieldLabels.accountRoles,
      access: {
        create: adminOnlyFieldAccess,
        read: adminOnlyFieldAccess,
        update: adminOnlyFieldAccess,
      },
      defaultValue: ['customer'],
      hasMany: true,
      hooks: {
        beforeChange: [ensureFirstUserIsAdmin],
      },
      options: [
        {
          label: {
            uk: 'власник',
            ru: 'владелец',
          },
          value: 'owner',
        },
        {
          label: {
            uk: 'адміністратор',
            ru: 'администратор',
          },
          value: 'admin',
        },
        {
          label: {
            uk: 'менеджер',
            ru: 'менеджер',
          },
          value: 'manager',
        },
        {
          label: {
            uk: 'редактор контенту',
            ru: 'редактор контента',
          },
          value: 'contentEditor',
        },
        {
          label: {
            uk: 'клієнт',
            ru: 'клиент',
          },
          value: 'customer',
        },
      ],
    },
    {
      name: 'orders',
      type: 'join',
      collection: 'orders',
      label: {
        uk: 'Замовлення',
        ru: 'Заказы',
      },
      on: 'customer',
      admin: {
        allowCreate: false,
        defaultColumns: ['id', 'createdAt', 'total', 'currency', 'items'],
      },
    },
    {
      name: 'cart',
      type: 'join',
      collection: 'carts',
      label: {
        uk: 'Кошик',
        ru: 'Корзина',
      },
      on: 'customer',
      admin: {
        allowCreate: false,
        defaultColumns: ['id', 'createdAt', 'total', 'currency', 'items'],
      },
    },
    {
      name: 'addresses',
      type: 'join',
      collection: 'addresses',
      label: {
        uk: 'Адреси',
        ru: 'Адреса',
      },
      on: 'customer',
      admin: {
        allowCreate: false,
        defaultColumns: ['id'],
      },
    },
  ],
}
