'use client'

import { PriceFilter } from '@/components/layout/search/PriceFilter'
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
} from '@/components/ui/sheet'
import { useDictionary } from '@/i18n/client'
import type { ProductType } from '@/payload-types'
import { SlidersHorizontal } from 'lucide-react'
import React from 'react'

type Props = {
  productType?: ProductType | null
}

export const MobileProductFilters: React.FC<Props> = ({ productType }) => {
  const dictionary = useDictionary()
  const [open, setOpen] = React.useState(false)

  return (
    <Sheet onOpenChange={setOpen} open={open}>
      <button
        aria-label={dictionary.shop.filters}
        className="grid size-11 shrink-0 place-items-center rounded-lg border bg-background text-primary transition hover:bg-muted md:hidden"
        onClick={() => setOpen(true)}
        type="button"
      >
        <SlidersHorizontal className="size-5" />
      </button>

      <SheetContent
        className="inset-0 h-dvh w-screen max-w-none gap-0 overflow-y-auto border-0 p-0 sm:max-w-none"
        side="right"
      >
        <SheetHeader className="border-b px-5 py-4 text-left">
          <SheetTitle>{dictionary.shop.filters}</SheetTitle>
          <SheetDescription>{dictionary.shop.priceFilterHint}</SheetDescription>
        </SheetHeader>
        <div className="p-4">
          <PriceFilter
            className="rounded-none border-0 bg-transparent p-0 shadow-none dark:bg-transparent"
            onAfterChange={() => setOpen(false)}
            productType={productType}
          />
        </div>
      </SheetContent>
    </Sheet>
  )
}
