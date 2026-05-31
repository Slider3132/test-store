import type { UIField } from 'payload'

type Args = {
  localizedFields: string[]
  name: string
  label: {
    ru: string
    uk: string
  }
}

export const blockTranslationAssistant = ({ label, localizedFields, name }: Args): UIField => ({
  name,
  type: 'ui',
  admin: {
    components: {
      Field: {
        clientProps: {
          localizedFields,
        },
        path: '@/components/Admin/BlockTranslationAssistant#BlockTranslationAssistant',
      },
    },
    custom: {
      localizedFields,
    },
  },
  label,
})
