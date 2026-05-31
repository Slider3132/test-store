import type { CollectionConfig } from 'payload'

import { adminOnly } from '@/access/adminOnly'
import { adminGroups, collectionLabels, fieldLabels } from '@/i18n/adminLabels'

export const AuditLogs: CollectionConfig = {
  slug: 'auditLogs',
  access: {
    create: () => false,
    delete: () => false,
    read: adminOnly,
    update: () => false,
  },
  admin: {
    defaultColumns: ['createdAt', 'actorEmail', 'action', 'collectionSlug', 'documentID'],
    group: adminGroups.users,
    useAsTitle: 'action',
  },
  fields: [
    {
      name: 'action',
      type: 'text',
      label: fieldLabels.action,
      required: true,
    },
    {
      name: 'collectionSlug',
      type: 'text',
      label: fieldLabels.collectionSlug,
      required: true,
    },
    {
      name: 'documentID',
      type: 'text',
      label: fieldLabels.documentID,
      required: true,
    },
    {
      name: 'actorEmail',
      type: 'email',
      label: fieldLabels.actorEmail,
    },
    {
      name: 'actorID',
      type: 'text',
      label: fieldLabels.actorID,
    },
    {
      name: 'operation',
      type: 'text',
      label: fieldLabels.operation,
    },
    {
      name: 'message',
      type: 'textarea',
      label: fieldLabels.message,
    },
    {
      name: 'before',
      type: 'json',
    },
    {
      name: 'after',
      type: 'json',
    },
    {
      name: 'requestID',
      type: 'text',
      label: fieldLabels.requestID,
    },
    {
      name: 'snapshot',
      type: 'json',
    },
  ],
  labels: collectionLabels.auditLogs,
}
