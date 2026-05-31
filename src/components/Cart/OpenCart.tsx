import { Button } from '@/components/ui/button'
import { ShoppingCart } from 'lucide-react'
import React from 'react'
import { useDictionary } from '@/i18n/client'
import { cn } from '@/utilities/cn'

export function OpenCartButton({
  className,
  quantity,
  ...rest
}: {
  className?: string
  quantity?: number
}) {
  const dictionary = useDictionary()

  return (
    <Button
      size="clear"
      variant="ghost"
      className={cn(
        'relative flex size-11 items-center justify-center rounded-md p-0 text-primary/70 hover:text-primary',
        'max-md:size-10',
        className,
      )}
      aria-label={dictionary.common.cart}
      title={dictionary.common.cart}
      {...rest}
    >
      <ShoppingCart className="size-5" />
      {quantity ? (
        <span className="absolute -right-1 top-1 flex min-w-5 items-center justify-center rounded-full bg-primary px-1.5 text-[10px] font-medium leading-5 text-primary-foreground">
          {quantity}
        </span>
      ) : null}
    </Button>
  )
}
