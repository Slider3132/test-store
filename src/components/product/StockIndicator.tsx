'use client'
import { Product, Variant } from '@/payload-types'
import { useSearchParams } from 'next/navigation'
import { useMemo } from 'react'
import { useDictionary } from '@/i18n/client'
import { getSelectedOrDefaultVariant } from '@/components/product/variantSelection'

type Props = {
  product: Product
}

export const StockIndicator: React.FC<Props> = ({ product }) => {
  const searchParams = useSearchParams()
  const dictionary = useDictionary()

  const selectedVariant = useMemo<Variant | undefined>(() => {
    return getSelectedOrDefaultVariant(product, searchParams)
  }, [product, searchParams])

  const stockQuantity = useMemo(() => {
    if (product.enableVariants) {
      if (selectedVariant) {
        return selectedVariant.inventory || 0
      }
    }
    return product.inventory || 0
  }, [product.enableVariants, selectedVariant, product.inventory])

  if (product.enableVariants && !selectedVariant) {
    return null
  }

  return (
    <div className="uppercase font-mono text-sm font-medium text-gray-500">
      {stockQuantity < 10 && stockQuantity > 0 && (
        <p>{dictionary.product.onlyLeft.replace('{{count}}', String(stockQuantity))}</p>
      )}
      {(stockQuantity === 0 || !stockQuantity) && <p>{dictionary.product.outOfStock}</p>}
    </div>
  )
}
