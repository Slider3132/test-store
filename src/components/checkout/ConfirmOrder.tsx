'use client'

import { LoadingSpinner } from '@/components/LoadingSpinner'
import { useCart, usePayments } from '@payloadcms/plugin-ecommerce/client/react'
import { useRouter, useSearchParams } from 'next/navigation'
import { useEffect, useRef } from 'react'
import { useDictionary, useLocale } from '@/i18n/client'
import { localizePath } from '@/i18n/config'

export const ConfirmOrder: React.FC = () => {
  const { confirmOrder } = usePayments()
  const { cart } = useCart()
  const dictionary = useDictionary()
  const locale = useLocale()

  const searchParams = useSearchParams()
  const router = useRouter()
  // Ensure we only confirm the order once, even if the component re-renders
  const isConfirming = useRef(false)

  useEffect(() => {
    if (!cart || !cart.items || cart.items?.length === 0) {
      return
    }

    const paymentIntentID = searchParams.get('payment_intent')
    const paymentID = searchParams.get('paymentId')
    const transactionID = searchParams.get('transactionID')
    const provider = searchParams.get('provider') || (paymentIntentID ? 'stripe' : null)
    const email = searchParams.get('email')

    if (provider && (paymentIntentID || paymentID || transactionID)) {
      if (!isConfirming.current) {
        isConfirming.current = true

        confirmOrder(provider, {
          additionalData: {
            ...(email ? { customerEmail: email } : {}),
            ...(paymentIntentID ? { paymentIntentID } : {}),
            ...(paymentID ? { paymentID } : {}),
            ...(transactionID ? { transactionID } : {}),
          },
        }).then((result) => {
          if (result && typeof result === 'object' && 'orderID' in result && result.orderID) {
            const accessToken = 'accessToken' in result ? (result.accessToken as string) : ''
            const queryParams = new URLSearchParams()

            if (email) {
              queryParams.set('email', email)
            }
            if (accessToken) {
              queryParams.set('accessToken', accessToken)
            }

            const queryString = queryParams.toString()
            router.push(
              `${localizePath(`/orders/${result.orderID}`, locale)}${queryString ? `?${queryString}` : ''}`,
            )
          }
        })
      }
    } else {
      // If no payment intent ID is found, redirect to the home
      router.push('/')
    }
  }, [cart, confirmOrder, locale, router, searchParams])

  return (
    <div className="text-center w-full flex flex-col items-center justify-start gap-4">
      <h1 className="text-2xl">{dictionary.checkout.processingPayment}</h1>

      <LoadingSpinner className="w-12 h-6" />
    </div>
  )
}
