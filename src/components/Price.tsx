'use client'
import { useCurrency } from '@payloadcms/plugin-ecommerce/client/react'
import { UAH } from '@/lib/currency'
import { usePathname } from 'next/navigation'
import React, { useMemo } from 'react'

type BaseProps = {
  className?: string
  currencyCodeClassName?: string
  as?: 'span' | 'p'
}

type PriceFixed = {
  amount: number
  currencyCode?: string
  highestAmount?: never
  lowestAmount?: never
}

type PriceRange = {
  amount?: never
  currencyCode?: string
  highestAmount: number
  lowestAmount: number
}

type Props = BaseProps & (PriceFixed | PriceRange)

export const Price = ({
  amount,
  className,
  highestAmount,
  lowestAmount,
  currencyCode: currencyCodeFromProps,
  as = 'p',
}: Props & React.ComponentProps<'p'>) => {
  const { formatCurrency, supportedCurrencies } = useCurrency()
  const pathname = usePathname()

  const Element = as
  const locale = pathname?.startsWith('/ru') ? 'ru' : 'uk'

  const currencyToUse = useMemo(() => {
    const currencyCode = currencyCodeFromProps ?? UAH.code

    return supportedCurrencies.find((currency) => currency.code === currencyCode) || UAH
  }, [currencyCodeFromProps, supportedCurrencies])

  if (typeof amount === 'number') {
    return (
      <Element className={className} suppressHydrationWarning>
        {formatCurrency(amount, { currency: currencyToUse, locale })}
      </Element>
    )
  }

  if (highestAmount && highestAmount !== lowestAmount) {
    return (
      <Element className={className} suppressHydrationWarning>
        {`${formatCurrency(lowestAmount, { currency: currencyToUse, locale })} - ${formatCurrency(highestAmount, { currency: currencyToUse, locale })}`}
      </Element>
    )
  }

  if (lowestAmount) {
    return (
      <Element className={className} suppressHydrationWarning>
        {`${formatCurrency(lowestAmount, { currency: currencyToUse, locale })}`}
      </Element>
    )
  }

  return null
}
