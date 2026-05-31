'use client'

import { ChevronDownIcon } from 'lucide-react'
import { usePathname, useSearchParams } from 'next/navigation'
import React, { useEffect, useRef, useState } from 'react'
import { useDictionary } from '@/i18n/client'
import { priceField } from '@/lib/currency'

import type { ListItem } from '.'

import { FilterItem } from './FilterItem'

export function FilterItemDropdown({ list }: { list: ListItem[] }) {
  const dictionary = useDictionary()
  const pathname = usePathname()
  const searchParams = useSearchParams()
  const [active, setActive] = useState('')
  const [openSelect, setOpenSelect] = useState(false)
  const ref = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (ref.current && !ref.current.contains(event.target as Node)) {
        setOpenSelect(false)
      }
    }

    window.addEventListener('click', handleClickOutside)
    return () => window.removeEventListener('click', handleClickOutside)
  }, [])

  useEffect(() => {
    list.forEach((listItem: ListItem) => {
      if (
        ('path' in listItem && pathname === listItem.path) ||
        ('slug' in listItem && searchParams.get('sort') === listItem.slug)
      ) {
        setActive('slug' in listItem ? getSortTitle(listItem, dictionary) : listItem.title)
      }
    })
  }, [dictionary, pathname, list, searchParams])

  return (
    <div className="relative" ref={ref}>
      <div
        className="flex w-full items-center justify-between rounded border border-black/30 px-4 py-2 text-sm dark:border-white/30"
        onClick={() => {
          setOpenSelect(!openSelect)
        }}
      >
        <div>{active}</div>
        <ChevronDownIcon className="h-4" />
      </div>
      {openSelect && (
        <div
          className="absolute z-40 w-full rounded-b-md bg-white p-4 shadow-md dark:bg-black"
          onClick={() => {
            setOpenSelect(false)
          }}
        >
          {list.map((item: ListItem, i) => (
            <FilterItem item={item} key={i} />
          ))}
        </div>
      )}
    </div>
  )
}

function getSortTitle(item: Extract<ListItem, { slug: null | string }>, dictionary: ReturnType<typeof useDictionary>) {
  if (item.slug === '-createdAt') return dictionary.shop.latestArrivals
  if (item.slug === priceField) return dictionary.shop.priceLowToHigh
  if (item.slug === `-${priceField}`) return dictionary.shop.priceHighToLow
  return dictionary.shop.alphabetic
}
