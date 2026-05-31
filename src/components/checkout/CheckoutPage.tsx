'use client'

import { Media } from '@/components/Media'
import { Message } from '@/components/Message'
import { Price } from '@/components/Price'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { useAuth } from '@/providers/Auth'
import { useTheme } from '@/providers/Theme'
import { Elements } from '@stripe/react-stripe-js'
import { loadStripe } from '@stripe/stripe-js'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import React, { Suspense, useCallback, useEffect, useState } from 'react'

import { cssVariables } from '@/cssVariables'
import { CheckoutForm } from '@/components/forms/CheckoutForm'
import { useAddresses, useCart, usePayments } from '@payloadcms/plugin-ecommerce/client/react'
import { CheckoutAddresses } from '@/components/checkout/CheckoutAddresses'
import { CreateAddressModal } from '@/components/addresses/CreateAddressModal'
import type { Address, Product, VariantOption } from '@/payload-types'
import { Checkbox } from '@/components/ui/checkbox'
import { AddressItem } from '@/components/addresses/AddressItem'
import { FormItem } from '@/components/forms/FormItem'
import { toast } from 'sonner'
import { LoadingSpinner } from '@/components/LoadingSpinner'
import { useDictionary, useLocale } from '@/i18n/client'
import { localizePath } from '@/i18n/config'
import { localizeVariantLabel } from '@/i18n/productLabels'
import { priceField } from '@/lib/currency'
import { activeClientPaymentProvider } from '@/payments/clientConfig'
import {
  DeliverySelector,
  isDeliverySelectionValid,
  type DeliverySelection,
} from '@/components/checkout/DeliverySelector'

const apiKey = process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY || ''
const stripe = apiKey ? loadStripe(apiKey) : null

type CheckoutPaymentData = {
  clientSecret?: string
  paymentUrl?: string
  redirectUrl?: string
  [key: string]: unknown
}

const getRedirectUrl = (data: CheckoutPaymentData) => {
  if (typeof data.redirectUrl === 'string') return data.redirectUrl
  if (typeof data.paymentUrl === 'string') return data.paymentUrl
  return null
}

export const CheckoutPage: React.FC = () => {
  const { user } = useAuth()
  const router = useRouter()
  const dictionary = useDictionary()
  const locale = useLocale()
  const { cart } = useCart()
  const [error, setError] = useState<null | string>(null)
  const { theme } = useTheme()
  /**
   * State to manage the email input for guest checkout.
   */
  const [email, setEmail] = useState('')
  const [emailEditable, setEmailEditable] = useState(true)
  const [paymentData, setPaymentData] = useState<null | Record<string, unknown>>(null)
  const { initiatePayment, paymentMethods } = usePayments()
  const [selectedPaymentMethod, setSelectedPaymentMethod] = useState(activeClientPaymentProvider)
  const { addresses } = useAddresses()
  const [shippingAddress, setShippingAddress] = useState<Partial<Address>>()
  const [billingAddress, setBillingAddress] = useState<Partial<Address>>()
  const [billingAddressSameAsShipping, setBillingAddressSameAsShipping] = useState(true)
  const [isProcessingPayment, setProcessingPayment] = useState(false)
  const [deliverySelection, setDeliverySelection] = useState<DeliverySelection | null>(null)

  const cartIsEmpty = !cart || !cart.items || !cart.items.length

  const canGoToPayment = Boolean(
    selectedPaymentMethod &&
      (email || user) &&
      billingAddress &&
      (billingAddressSameAsShipping || shippingAddress) &&
      isDeliverySelectionValid(deliverySelection),
  )

  // On initial load wait for addresses to be loaded and check to see if we can prefill a default one
  useEffect(() => {
    if (!shippingAddress) {
      if (addresses && addresses.length > 0) {
        const defaultAddress = addresses[0]
        if (defaultAddress) {
          setBillingAddress(defaultAddress)
        }
      }
    }
  }, [addresses])

  useEffect(() => {
    return () => {
      setShippingAddress(undefined)
      setBillingAddress(undefined)
      setBillingAddressSameAsShipping(true)
      setEmail('')
      setEmailEditable(true)
    }
  }, [])

  const initiatePaymentIntent = useCallback(
    async (paymentID: string) => {
      try {
        const paymentData = (await initiatePayment(paymentID, {
          additionalData: {
            ...(email ? { customerEmail: email } : {}),
            billingAddress,
            deliverySelection,
            shippingAddress: billingAddressSameAsShipping ? billingAddress : shippingAddress,
          },
        })) as Record<string, unknown>

        if (paymentData) {
          const redirectUrl = getRedirectUrl(paymentData as CheckoutPaymentData)

          if (redirectUrl) {
            window.location.assign(redirectUrl)
            return
          }

          setPaymentData(paymentData)
        }
      } catch (error) {
        const errorData = error instanceof Error ? JSON.parse(error.message) : {}
        let errorMessage = 'Помилка під час ініціалізації оплати.'

        if (errorData?.cause?.code === 'OutOfStock') {
          errorMessage =
            locale === 'ru'
              ? 'Одного или нескольких товаров в корзине нет в наличии.'
              : 'Одного або кількох товарів у кошику немає в наявності.'
        }

        setError(errorMessage)
        toast.error(errorMessage)
      }
    },
    [
      billingAddress,
      billingAddressSameAsShipping,
      deliverySelection,
      email,
      initiatePayment,
      locale,
      shippingAddress,
    ],
  )

  useEffect(() => {
    if (paymentMethods.length && !paymentMethods.some((method) => method.name === selectedPaymentMethod)) {
      setSelectedPaymentMethod(paymentMethods[0]?.name || activeClientPaymentProvider)
    }
  }, [paymentMethods, selectedPaymentMethod])

  if (cartIsEmpty && isProcessingPayment) {
    return (
      <div className="py-12 w-full items-center justify-center">
        <div className="prose dark:prose-invert text-center max-w-none self-center mb-8">
          <p>{dictionary.checkout.processingPayment}</p>
        </div>
        <LoadingSpinner />
      </div>
    )
  }

  if (cartIsEmpty) {
    return (
      <div className="prose dark:prose-invert py-12 w-full items-center">
        <p>{dictionary.cart.empty}</p>
        <Link href={localizePath('/catalog', locale)}>{dictionary.common.continueShopping}</Link>
      </div>
    )
  }

  return (
    <div className="flex flex-col items-stretch justify-stretch my-8 md:flex-row grow gap-10 md:gap-6 lg:gap-8">
      <div className="basis-full lg:basis-2/3 flex flex-col gap-8 justify-stretch">
        <h2 className="font-medium text-3xl">{dictionary.checkout.contact}</h2>
        {!user && (
          <div className=" bg-accent dark:bg-black rounded-lg p-4 w-full flex items-center">
            <div className="prose dark:prose-invert">
              <Button asChild className="no-underline text-inherit" variant="outline">
                <Link href={localizePath('/login', locale)}>{dictionary.checkout.logIn}</Link>
              </Button>
              <p className="mt-0">
                <span className="mx-2">{dictionary.checkout.or}</span>
                <Link href={localizePath('/create-account', locale)}>
                  {dictionary.checkout.createAccount}
                </Link>
              </p>
            </div>
          </div>
        )}
        {user ? (
          <div className="bg-accent dark:bg-card rounded-lg p-4 ">
            <div>
              <p>{user.email}</p>{' '}
              <p>
                {dictionary.checkout.notYou}{' '}
                <Link className="underline" href={localizePath('/logout', locale)}>
                  {dictionary.checkout.logOut}
                </Link>
              </p>
            </div>
          </div>
        ) : (
          <div className="bg-accent dark:bg-black rounded-lg p-4 ">
            <div>
              <p className="mb-4">{dictionary.checkout.emailGuest}</p>

              <FormItem className="mb-6">
                <Label htmlFor="email">{dictionary.account.emailAddress}</Label>
                <Input
                  disabled={!emailEditable}
                  id="email"
                  name="email"
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  type="email"
                />
              </FormItem>

              <Button
                disabled={!email || !emailEditable}
                onClick={(e) => {
                  e.preventDefault()
                  setEmailEditable(false)
                }}
                variant="default"
              >
                {dictionary.checkout.continueAsGuest}
              </Button>
            </div>
          </div>
        )}

        <h2 className="font-medium text-3xl">{dictionary.checkout.address}</h2>

        {billingAddress ? (
          <div>
            <AddressItem
              actions={
                <Button
                  variant={'outline'}
                  disabled={Boolean(paymentData)}
                  onClick={(e) => {
                    e.preventDefault()
                    setBillingAddress(undefined)
                  }}
                >
                  {dictionary.common.remove}
                </Button>
              }
              address={billingAddress}
            />
          </div>
        ) : user ? (
          <CheckoutAddresses heading={dictionary.address.billing} setAddress={setBillingAddress} />
        ) : (
          <CreateAddressModal
            disabled={!email || Boolean(emailEditable)}
            callback={(address) => {
              setBillingAddress(address)
            }}
            skipSubmission={true}
          />
        )}

        <div className="flex gap-4 items-center">
          <Checkbox
            id="shippingTheSameAsBilling"
            checked={billingAddressSameAsShipping}
            disabled={Boolean(paymentData || (!user && (!email || Boolean(emailEditable))))}
            onCheckedChange={(state) => {
              setBillingAddressSameAsShipping(state as boolean)
            }}
          />
          <Label htmlFor="shippingTheSameAsBilling">
            {dictionary.checkout.shippingSameAsBilling}
          </Label>
        </div>

        {!billingAddressSameAsShipping && (
          <>
            {shippingAddress ? (
              <div>
                <AddressItem
                  actions={
                    <Button
                      variant={'outline'}
                      disabled={Boolean(paymentData)}
                      onClick={(e) => {
                        e.preventDefault()
                        setShippingAddress(undefined)
                      }}
                    >
                      {dictionary.common.remove}
                    </Button>
                  }
                  address={shippingAddress}
                />
              </div>
            ) : user ? (
              <CheckoutAddresses
                heading={dictionary.address.shipping}
                description={dictionary.address.selectOrAdd}
                setAddress={setShippingAddress}
              />
            ) : (
              <CreateAddressModal
                callback={(address) => {
                  setShippingAddress(address)
                }}
                disabled={!email || Boolean(emailEditable)}
                skipSubmission={true}
              />
            )}
          </>
        )}

        <DeliverySelector
          cartSubtotal={cart?.subtotal}
          disabled={Boolean(paymentData)}
          onChange={setDeliverySelection}
          value={deliverySelection}
        />

        {!paymentData && (
          <Button
            className="self-start"
            disabled={!canGoToPayment}
            onClick={(e) => {
              e.preventDefault()
              void initiatePaymentIntent(selectedPaymentMethod)
            }}
          >
            {dictionary.checkout.goToPayment}
          </Button>
        )}

        {!paymentData?.['clientSecret'] && error && (
          <div className="my-8">
            <Message error={error} />

            <Button
              onClick={(e) => {
                e.preventDefault()
                router.refresh()
              }}
              variant="default"
            >
              {dictionary.checkout.tryAgain}
            </Button>
          </div>
        )}

        <Suspense fallback={<React.Fragment />}>
          {/* @ts-ignore */}
          {paymentData && paymentData?.['clientSecret'] && stripe && selectedPaymentMethod === 'stripe' && (
            <div className="pb-16">
              <h2 className="font-medium text-3xl">{dictionary.checkout.payment}</h2>
              {error && <p>{`${dictionary.common.error}: ${error}`}</p>}
              <Elements
                options={{
                  appearance: {
                    theme: 'stripe',
                    variables: {
                      borderRadius: '6px',
                      colorPrimary: '#858585',
                      gridColumnSpacing: '20px',
                      gridRowSpacing: '20px',
                      colorBackground: theme === 'dark' ? '#0a0a0a' : cssVariables.colors.base0,
                      colorDanger: cssVariables.colors.error500,
                      colorDangerText: cssVariables.colors.error500,
                      colorIcon:
                        theme === 'dark' ? cssVariables.colors.base0 : cssVariables.colors.base1000,
                      colorText: theme === 'dark' ? '#858585' : cssVariables.colors.base1000,
                      colorTextPlaceholder: '#858585',
                      fontFamily: 'Geist, sans-serif',
                      fontSizeBase: '16px',
                      fontWeightBold: '600',
                      fontWeightNormal: '500',
                      spacingUnit: '4px',
                    },
                  },
                  clientSecret: paymentData['clientSecret'] as string,
                }}
                stripe={stripe}
              >
                <div className="flex flex-col gap-8">
                  <CheckoutForm
                    paymentMethodID="stripe"
                    customerEmail={email}
                    billingAddress={billingAddress}
                    setProcessingPayment={setProcessingPayment}
                  />
                  <Button
                    variant="ghost"
                    className="self-start"
                    onClick={() => setPaymentData(null)}
                  >
                    {dictionary.checkout.cancelPayment}
                  </Button>
                </div>
              </Elements>
            </div>
          )}
        </Suspense>
      </div>

      {!cartIsEmpty && (
        <div className="basis-full lg:basis-1/3 lg:pl-8 p-8 border-none bg-primary/5 flex flex-col gap-8 rounded-lg">
          <h2 className="text-3xl font-medium">{dictionary.cart.yourCart}</h2>
          {cart?.items?.map((item, index) => {
            if (typeof item.product === 'object' && item.product) {
              const {
                product,
                product: { id, meta, title, gallery },
                quantity,
                variant,
              } = item

              if (!quantity) return null

              let image = gallery?.[0]?.image || meta?.image
              let price = product?.[priceField]

              const isVariant = Boolean(variant) && typeof variant === 'object'

              if (isVariant) {
                price = variant?.[priceField]

                const imageVariant = product.gallery?.find(
                  (item: NonNullable<Product['gallery']>[number]) => {
                    if (!item.variantOption) return false
                    const variantOptionID =
                      typeof item.variantOption === 'object'
                        ? item.variantOption.id
                        : item.variantOption

                    const hasMatch = variant?.options?.some((option: string | VariantOption) => {
                      if (typeof option === 'object')
                        return String(option.id) === String(variantOptionID)
                      else return String(option) === String(variantOptionID)
                    })

                    return hasMatch
                  },
                )

                if (imageVariant && typeof imageVariant.image !== 'string') {
                  image = imageVariant.image
                }
              }

              return (
                <div className="flex items-start gap-4" key={index}>
                  <div className="flex items-stretch justify-stretch h-20 w-20 p-2 rounded-lg border">
                    <div className="relative w-full h-full">
                      {image && typeof image !== 'string' && (
                        <Media className="" fill imgClassName="rounded-lg" resource={image} />
                      )}
                    </div>
                  </div>
                  <div className="flex grow justify-between items-center">
                    <div className="flex flex-col gap-1">
                      <p className="font-medium text-lg">{title}</p>
                      {variant && typeof variant === 'object' && (
                        <p className="text-sm font-mono text-primary/50 tracking-widest">
                          {variant.options
                            ?.map((option: string | VariantOption) => {
                              if (typeof option === 'object')
                                return localizeVariantLabel(option.label, dictionary.product)
                              return null
                            })
                            .join(', ')}
                        </p>
                      )}
                      <div>
                        {'x'}
                        {quantity}
                      </div>
                    </div>

                    {typeof price === 'number' && <Price amount={price} />}
                  </div>
                </div>
              )
            }
            return null
          })}
          <hr />
          <div className="flex justify-between items-center gap-2">
            <span className="uppercase">{dictionary.common.total}</span>{' '}
            <Price className="text-3xl font-medium" amount={cart.subtotal || 0} />
          </div>
        </div>
      )}
    </div>
  )
}
