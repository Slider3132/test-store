import { postgresAdapter } from '@payloadcms/db-postgres'
import {
  BoldFeature,
  EXPERIMENTAL_TableFeature,
  IndentFeature,
  ItalicFeature,
  LinkFeature,
  OrderedListFeature,
  UnderlineFeature,
  UnorderedListFeature,
  lexicalEditor,
} from '@payloadcms/richtext-lexical'
import path from 'path'
import { buildConfig } from 'payload'
import { fileURLToPath } from 'url'
import { ru } from '@payloadcms/translations/languages/ru'
import { uk } from '@payloadcms/translations/languages/uk'

import { Categories } from '@/collections/Categories'
import { AuditLogs } from '@/collections/AuditLogs'
import { Media } from '@/collections/Media'
import { Pages } from '@/collections/Pages'
import { ProductTypes } from '@/collections/ProductTypes'
import { Users } from '@/collections/Users'
import { AdminSettings } from '@/globals/AdminSettings'
import { Footer } from '@/globals/Footer'
import { Header } from '@/globals/Header'
import { payloadAdminTranslations } from '@/i18n/payloadAdminTranslations'
import { getEmailAdapter } from '@/lib/email'
import { env, isProduction } from '@/lib/env'
import { plugins } from './plugins'

const filename = fileURLToPath(import.meta.url)
const dirname = path.dirname(filename)

export default buildConfig({
  admin: {
    components: {
      actions: ['@/components/Admin/AdminThemeToggle#AdminThemeToggle'],
      providers: ['@/components/Admin/AdminLocaleSync#AdminLocaleSync'],
      // The `BeforeLogin` component renders a message that you see while logging into your admin panel.
      // Feel free to delete this at any time. Simply remove the line below and the import `BeforeLogin` statement on line 15.
      beforeLogin: ['@/components/BeforeLogin#BeforeLogin'],
      // The `BeforeDashboard` component renders the 'welcome' block that you see after logging into your admin panel.
      // Feel free to delete this at any time. Simply remove the line below and the import `BeforeDashboard` statement on line 15.
      beforeDashboard: ['@/components/BeforeDashboard#BeforeDashboard'],
    },
    theme: 'all',
    user: Users.slug,
  },
  collections: [Users, Pages, Categories, ProductTypes, Media, AuditLogs],
  db: postgresAdapter({
    pool: {
      connectionString: env.databaseURL,
      max: 5,
      ssl: env.databaseSSLEnabled
        ? { rejectUnauthorized: env.databaseSSLRejectUnauthorized }
        : false,
    },
    push: false,
  }),
  editor: lexicalEditor({
    features: () => {
      return [
        UnderlineFeature(),
        BoldFeature(),
        ItalicFeature(),
        OrderedListFeature(),
        UnorderedListFeature(),
        LinkFeature({
          enabledCollections: ['pages'],
          fields: ({ defaultFields }) => {
            const defaultFieldsWithoutUrl = defaultFields.filter((field) => {
              if ('name' in field && field.name === 'url') return false
              return true
            })

            return [
              ...defaultFieldsWithoutUrl,
              {
                name: 'url',
                type: 'text',
                admin: {
                  condition: ({ linkType }) => linkType !== 'internal',
                },
                label: ({ t }) => t('fields:enterURL'),
                required: true,
              },
            ]
          },
        }),
        IndentFeature(),
        EXPERIMENTAL_TableFeature(),
      ]
    },
  }),
  email: getEmailAdapter(),
  endpoints: [],
  globals: [Header, Footer, AdminSettings],
  i18n: {
    fallbackLanguage: 'uk',
    supportedLanguages: {
      uk,
      ru,
    },
    translations: payloadAdminTranslations,
  },
  localization: {
    defaultLocale: 'uk',
    fallback: true,
    locales: [
      {
        code: 'uk',
        label: 'Українська',
      },
      {
        code: 'ru',
        label: 'Русский',
      },
    ],
  },
  plugins,
  secret: env.payloadSecret,
  typescript: {
    outputFile: path.resolve(dirname, 'payload-types.ts'),
  },
  // Sharp is now an optional dependency -
  // if you want to resize images, crop, set focal point, etc.
  // make sure to install it and pass it to the config.
  // sharp,
})
