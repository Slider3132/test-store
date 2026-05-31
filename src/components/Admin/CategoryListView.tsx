import { DefaultListView } from '@payloadcms/ui'
import type { ListViewClientProps, ListViewServerPropsOnly } from 'payload'

import type { Category } from '@/payload-types'

import { CategoryTreeTable } from './CategoryTreeTable'

type Props = ListViewClientProps & ListViewServerPropsOnly

export const CategoryListView = async (props: Props) => {
  const {
    collectionConfig: _collectionConfig,
    data: _data,
    i18n: _i18n,
    limit: _limit,
    listPreferences: _listPreferences,
    listSearchableFields: _listSearchableFields,
    locale,
    params: _params,
    payload,
    permissions: _permissions,
    searchParams: _searchParams,
    user: _user,
    ...clientProps
  } = props
  const activeLocale = locale?.code === 'ru' ? 'ru' : 'uk'

  const result = await payload.find({
    collection: 'categories',
    depth: 1,
    limit: 1000,
    locale: activeLocale,
    sort: 'title',
  })

  return (
    <DefaultListView
      {...clientProps}
      Table={
        <CategoryTreeTable
          adminRoute={payload.config.routes.admin}
          categories={result.docs as Category[]}
        />
      }
    />
  )
}
