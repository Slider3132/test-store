import { AuthProvider } from '@/providers/Auth'
import { EcommerceProvider } from '@payloadcms/plugin-ecommerce/client/react'
import React from 'react'

import { HeaderThemeProvider } from './HeaderTheme'
import { ThemeProvider } from './Theme'
import { SonnerProvider } from '@/providers/Sonner'
import { currenciesConfig, priceField } from '@/lib/currency'
import { getClientPaymentMethods } from '@/payments/clientConfig'

export const Providers: React.FC<{
  children: React.ReactNode
}> = ({ children }) => {
  return (
    <ThemeProvider>
      <AuthProvider>
        <HeaderThemeProvider>
          <SonnerProvider />
          <EcommerceProvider
            currenciesConfig={currenciesConfig}
            enableVariants={true}
            api={{
              cartsFetchQuery: {
                depth: 2,
                populate: {
                  products: {
                    currency: true,
                    slug: true,
                    title: true,
                    gallery: true,
                    inventory: true,
                    [priceField]: true,
                  },
                  variants: {
                    currency: true,
                    title: true,
                    inventory: true,
                    [priceField]: true,
                    options: true,
                  },
                },
              },
            }}
            paymentMethods={getClientPaymentMethods()}
          >
            {children}
          </EcommerceProvider>
        </HeaderThemeProvider>
      </AuthProvider>
    </ThemeProvider>
  )
}
