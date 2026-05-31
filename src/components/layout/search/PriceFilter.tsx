'use client'

import { createUrl } from '@/utilities/createUrl'
import { cn } from '@/utilities/cn'
import type { ProductType, VariantOption, VariantType } from '@/payload-types'
import { usePathname, useRouter, useSearchParams } from 'next/navigation'
import React from 'react'
import { useDictionary } from '@/i18n/client'

type Props = {
  className?: string
  onAfterChange?: () => void
  productType?: ProductType | null
}

const getVariantType = (value: number | VariantType): VariantType | null =>
  typeof value === 'object' ? value : null

const getVariantOption = (value: number | VariantOption): VariantOption | null =>
  typeof value === 'object' ? value : null

const isVariantOption = (value: VariantOption | null): value is VariantOption => Boolean(value)

export const PriceFilter: React.FC<Props> = ({ className, onAfterChange, productType }) => {
  const dictionary = useDictionary()
  const pathname = usePathname()
  const router = useRouter()
  const searchParams = useSearchParams()
  const filterableVariantAxes =
    productType?.variantAxes?.filter((axis) => axis.showInFilters !== false) || []
  const filterableAttributes =
    productType?.attributes?.filter(
      (attribute) =>
        attribute.showInFilters !== false &&
        attribute.inputType === 'select' &&
        attribute.options?.length,
    ) || []

  function onSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault()

    const form = event.currentTarget
    const formData = new FormData(form)
    const params = new URLSearchParams(searchParams.toString())
    const minPrice = (form.minPrice as HTMLInputElement).value
    const maxPrice = (form.maxPrice as HTMLInputElement).value
    const availability = (form.availability as RadioNodeList).value
    const selectedVariantOptions = formData.getAll('variantOption').map(String).filter(Boolean)

    params.delete('page')
    params.delete('variantOption')
    for (const key of Array.from(params.keys())) {
      if (key.startsWith('attr.')) params.delete(key)
    }

    if (minPrice) {
      params.set('minPrice', minPrice)
    } else {
      params.delete('minPrice')
    }

    if (maxPrice) {
      params.set('maxPrice', maxPrice)
    } else {
      params.delete('maxPrice')
    }

    if (availability) {
      params.set('availability', availability)
    } else {
      params.delete('availability')
    }

    for (const optionID of selectedVariantOptions) {
      params.append('variantOption', optionID)
    }

    for (const attribute of filterableAttributes) {
      for (const value of formData.getAll(`attr.${attribute.name}`).map(String).filter(Boolean)) {
        params.append(`attr.${attribute.name}`, value)
      }
    }

    router.push(createUrl(pathname, params), { scroll: false })
    onAfterChange?.()
  }

  function resetFilters() {
    const params = new URLSearchParams(searchParams.toString())

    params.delete('minPrice')
    params.delete('maxPrice')
    params.delete('availability')
    params.delete('variantOption')
    params.delete('page')
    for (const key of Array.from(params.keys())) {
      if (key.startsWith('attr.')) params.delete(key)
    }
    router.push(createUrl(pathname, params), { scroll: false })
    onAfterChange?.()
  }

  const activeAvailability = searchParams.get('availability') || ''
  const activeVariantOptions = new Set(searchParams.getAll('variantOption'))
  const isActiveAttributeOption = (name: string, value: string) =>
    searchParams.getAll(`attr.${name}`).includes(value)

  return (
    <form
      className={cn('w-full self-start rounded-xl border bg-white p-7 shadow-sm dark:bg-card', className)}
      onSubmit={onSubmit}
    >
      <div className="flex items-center justify-between gap-4">
        <h3 className="text-base font-semibold">{dictionary.shop.filters}</h3>
        <button
          className="shrink-0 text-sm font-semibold text-primary transition hover:opacity-70"
          onClick={resetFilters}
          type="button"
        >
          {dictionary.shop.clear}
        </button>
      </div>

      <div className="my-6 h-px bg-border" />

      <fieldset>
        <legend className="mb-4 text-sm font-semibold">{dictionary.shop.availability}</legend>
        <div className="grid gap-4">
          {[
            { label: dictionary.shop.inStock, value: 'in' },
            { label: dictionary.shop.outOfStock, value: 'out' },
          ].map((item) => (
            <label
              className="flex cursor-pointer items-center gap-3 text-sm text-muted-foreground transition hover:text-foreground"
              key={item.value}
            >
              <input
                className="peer sr-only"
                defaultChecked={activeAvailability === item.value}
                name="availability"
                type="radio"
                value={item.value}
              />
              <span className="grid size-4 shrink-0 place-items-center rounded border border-border bg-background transition after:size-1.5 after:rounded-full after:bg-primary-foreground after:opacity-0 after:transition peer-checked:border-primary peer-checked:bg-primary peer-checked:after:opacity-100" />
              {item.label}
            </label>
          ))}
        </div>
      </fieldset>

      {filterableVariantAxes.map((axis) => {
        const variantType = getVariantType(axis.variantType)
        const options =
          variantType?.options?.docs?.map(getVariantOption).filter(isVariantOption) || []

        if (!variantType || !options.length) return null

        return (
          <React.Fragment key={axis.id || variantType.id}>
            <div className="my-6 h-px bg-border" />
            <fieldset>
              <legend className="mb-4 text-sm font-semibold">{variantType.label}</legend>
              <div className="grid gap-3">
                {options.map((option) => (
                  <label
                    className="flex cursor-pointer items-center justify-between gap-3 text-sm text-muted-foreground transition hover:text-foreground"
                    key={option.id}
                  >
                    <span className="flex min-w-0 items-center gap-3">
                      <input
                        className="peer sr-only"
                        defaultChecked={activeVariantOptions.has(String(option.id))}
                        name="variantOption"
                        type="checkbox"
                        value={option.id}
                      />
                      <span className="grid size-4 shrink-0 place-items-center rounded border border-border bg-background transition after:size-2 after:rounded-sm after:bg-primary-foreground after:opacity-0 after:transition peer-checked:border-primary peer-checked:bg-primary peer-checked:after:opacity-100" />
                      <span className="truncate">{option.label}</span>
                    </span>
                    {option.swatch ? (
                      <span
                        aria-hidden
                        className="size-4 shrink-0 rounded-full border border-border"
                        style={{ backgroundColor: option.swatch }}
                      />
                    ) : null}
                  </label>
                ))}
              </div>
            </fieldset>
          </React.Fragment>
        )
      })}

      {filterableAttributes.map((attribute) => (
        <React.Fragment key={attribute.id || attribute.name}>
          <div className="my-6 h-px bg-border" />
          <fieldset>
            <legend className="mb-4 text-sm font-semibold">{attribute.label}</legend>
            <div className="grid gap-3">
              {attribute.options?.map((option) => (
                <label
                  className="flex cursor-pointer items-center gap-3 text-sm text-muted-foreground transition hover:text-foreground"
                  key={option.id || option.value}
                >
                  <input
                    className="peer sr-only"
                    defaultChecked={isActiveAttributeOption(attribute.name, option.value)}
                    name={`attr.${attribute.name}`}
                    type="checkbox"
                    value={option.value}
                  />
                  <span className="grid size-4 shrink-0 place-items-center rounded border border-border bg-background transition after:size-2 after:rounded-sm after:bg-primary-foreground after:opacity-0 after:transition peer-checked:border-primary peer-checked:bg-primary peer-checked:after:opacity-100" />
                  {option.label}
                </label>
              ))}
            </div>
          </fieldset>
        </React.Fragment>
      ))}

      <div className="my-6 h-px bg-border" />

      <fieldset>
        <legend className="mb-2 text-sm font-semibold">{dictionary.shop.priceRange}</legend>
        <p className="mb-4 text-xs leading-5 text-muted-foreground">
          {dictionary.shop.priceFilterHint}
        </p>
        <div className="grid min-w-0 grid-cols-[minmax(0,1fr)_auto_minmax(0,1fr)] items-end gap-2">
          <label className="grid min-w-0 gap-1 text-xs text-muted-foreground">
            {dictionary.shop.minPrice}
            <input
              className="h-10 w-full min-w-0 rounded-md border bg-background px-3 text-sm text-foreground outline-none transition focus:border-primary"
              defaultValue={searchParams.get('minPrice') || ''}
              min="0"
              name="minPrice"
              placeholder="0"
              type="number"
            />
          </label>
          <span className="pb-2 text-muted-foreground">-</span>
          <label className="grid min-w-0 gap-1 text-xs text-muted-foreground">
            {dictionary.shop.maxPrice}
            <input
              className="h-10 w-full min-w-0 rounded-md border bg-background px-3 text-sm text-foreground outline-none transition focus:border-primary"
              defaultValue={searchParams.get('maxPrice') || ''}
              min="0"
              name="maxPrice"
              placeholder="5000"
              type="number"
            />
          </label>
        </div>
      </fieldset>

      <div className="mt-6">
        <button
          className="h-10 w-full rounded-md bg-primary px-4 text-sm font-semibold text-primary-foreground transition hover:opacity-90"
          type="submit"
        >
          {dictionary.shop.applyFilters}
        </button>
      </div>
    </form>
  )
}
