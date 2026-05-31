'use client'

import type { SortFilterItem } from '@/lib/constants'

import { createUrl } from '@/utilities/createUrl'
import { usePathname, useRouter, useSearchParams } from 'next/navigation'
import React from 'react'
import { useDictionary } from '@/i18n/client'
import { priceField } from '@/lib/currency'

type Props = {
  list: SortFilterItem[]
}

export const ShopSortSelect: React.FC<Props> = ({ list }) => {
  const dictionary = useDictionary()
  const pathname = usePathname()
  const router = useRouter()
  const searchParams = useSearchParams()

  function onChange(event: React.ChangeEvent<HTMLSelectElement>) {
    const params = new URLSearchParams(searchParams.toString())
    const value = event.target.value

    params.delete('page')

    if (value) {
      params.set('sort', value)
    } else {
      params.delete('sort')
    }

    router.push(createUrl(pathname, params), { scroll: false })
  }

  return (
    <React.Fragment>
      <label className="sr-only" htmlFor="shop-sort">
        {dictionary.shop.sortBy}
      </label>
      <div>
        <select
          className="h-11 min-w-48 rounded-lg border bg-background px-4 text-sm text-foreground outline-none transition focus:border-primary"
          defaultValue={searchParams.get('sort') || ''}
          id="shop-sort"
          onChange={onChange}
        >
          {list.map((item) => (
            <option key={item.slug || 'default'} value={item.slug || ''}>
              {getSortTitle(item, dictionary)}
            </option>
          ))}
        </select>
      </div>
    </React.Fragment>
  )
}

function getSortTitle(item: SortFilterItem, dictionary: ReturnType<typeof useDictionary>) {
  if (item.slug === '-createdAt') return dictionary.shop.latestArrivals
  if (item.slug === priceField) return dictionary.shop.priceLowToHigh
  if (item.slug === `-${priceField}`) return dictionary.shop.priceHighToLow
  return dictionary.shop.alphabetic
}
