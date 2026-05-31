'use client'

import React, { Suspense } from 'react'

import { FilterItemDropdown } from './FilterItemDropdown'
import { FilterItem } from './FilterItem'
import { useDictionary } from '@/i18n/client'

import type { SortFilterItem } from '@/lib/constants'

export type ListItem = PathFilterItem | SortFilterItem
export type PathFilterItem = { path: string; title: string }

function FilterItemList({ list }: { list: ListItem[] }) {
  return (
    <React.Fragment>
      {list.map((item: ListItem, i) => (
        <FilterItem item={item} key={i} />
      ))}
    </React.Fragment>
  )
}

export function FilterList({ list, title }: { list: ListItem[]; title?: string }) {
  const dictionary = useDictionary()
  const localizedTitle = title === 'Sort by' || title === 'Сортувати за' ? dictionary.shop.sortBy : title

  return (
    <React.Fragment>
      <nav>
        {localizedTitle ? (
          <h3 className="text-xs mb-2 text-neutral-500 dark:text-neutral-400">
            {localizedTitle}
          </h3>
        ) : null}
        <ul className="hidden md:block">
          <Suspense fallback={null}>
            <FilterItemList list={list} />
          </Suspense>
        </ul>
        <ul className="md:hidden">
          <Suspense fallback={null}>
            <FilterItemDropdown list={list} />
          </Suspense>
        </ul>
      </nav>
    </React.Fragment>
  )
}
