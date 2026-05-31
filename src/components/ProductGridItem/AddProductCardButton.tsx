'use client'

import { ShoppingCart } from 'lucide-react'
import { useCart } from '@payloadcms/plugin-ecommerce/client/react'
import Link from 'next/link'
import React, { useCallback } from 'react'
import { toast } from 'sonner'
import { useDictionary } from '@/i18n/client'

type Props = {
  disabled?: boolean
  href?: string
  productID?: number
}

const className =
  'grid size-10 shrink-0 place-items-center rounded-full border border-primary/25 text-primary transition hover:border-primary hover:bg-primary hover:text-primary-foreground disabled:cursor-not-allowed disabled:opacity-40'

export const AddProductCardButton: React.FC<Props> = ({ disabled, href, productID }) => {
  const { addItem, isLoading } = useCart()
  const dictionary = useDictionary()

  const addToCart = useCallback(
    async (event: React.MouseEvent<HTMLButtonElement>) => {
      event.preventDefault()
      event.stopPropagation()

      if (!productID) return

      await addItem({
        product: productID,
      })
      toast.success(dictionary.common.addToCart)
    },
    [addItem, dictionary.common.addToCart, productID],
  )

  if (href && !disabled) {
    return (
      <Link aria-label={dictionary.common.addToCart} className={className} href={href}>
        <ShoppingCart className="size-5" />
      </Link>
    )
  }

  return (
    <button
      aria-label={dictionary.common.addToCart}
      className={className}
      disabled={disabled || isLoading || !productID}
      onClick={addToCart}
      type="button"
    >
      <ShoppingCart className="size-5" />
    </button>
  )
}
