'use client'

import { AddressItem } from '@/components/addresses/AddressItem'
import { CreateAddressModal } from '@/components/addresses/CreateAddressModal'
import { Button } from '@/components/ui/button'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog'
import { Address } from '@/payload-types'
import { useAddresses } from '@payloadcms/plugin-ecommerce/client/react'
import { useState } from 'react'
import { useDictionary } from '@/i18n/client'

type Props = {
  selectedAddress?: Address
  setAddress: React.Dispatch<React.SetStateAction<Partial<Address> | undefined>>
  heading?: string
  description?: string
  setSubmit?: React.Dispatch<React.SetStateAction<() => void | Promise<void>>>
}

export const CheckoutAddresses: React.FC<Props> = ({
  setAddress,
  heading,
  description,
}) => {
  const { addresses } = useAddresses()
  const dictionary = useDictionary()
  const headingText = heading || dictionary.account.addresses
  const descriptionText = description || dictionary.address.selectOrAdd

  if (!addresses || addresses.length === 0) {
    return (
      <div>
        <p>{dictionary.address.noAddressesAdd}</p>

        <CreateAddressModal
          callback={(address) => {
            setAddress(address)
          }}
        />
      </div>
    )
  }

  return (
    <div className="flex flex-col gap-8">
      <div>
        <h3 className="text-xl font-medium mb-2">{headingText}</h3>
        <p className="text-muted-foreground">{descriptionText}</p>
      </div>
      <AddressesModal setAddress={setAddress} />
    </div>
  )
}

const AddressesModal: React.FC<Props> = ({ setAddress }) => {
  const dictionary = useDictionary()
  const [open, setOpen] = useState(false)
  const handleOpenChange = (state: boolean) => {
    setOpen(state)
  }

  const closeModal = () => {
    setOpen(false)
  }
  const { addresses } = useAddresses()

  if (!addresses || addresses.length === 0) {
    return <p>{dictionary.address.noAddressesAdd}</p>
  }

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogTrigger asChild>
        <Button variant={'outline'}>{dictionary.address.selectAddress}</Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>{dictionary.address.selectAddress}</DialogTitle>
        </DialogHeader>

        <div className="flex flex-col gap-12">
          <ul className="flex flex-col gap-8">
            {addresses.map((address) => (
              <li key={address.id} className="border-b pb-8 last:border-none">
                <AddressItem
                  address={address}
                  beforeActions={
                    <Button
                      onClick={(e) => {
                        e.preventDefault()
                        setAddress(address)
                        closeModal()
                      }}
                    >
                      {dictionary.address.select}
                    </Button>
                  }
                />
              </li>
            ))}
          </ul>

          <CreateAddressModal
            callback={(address) => {
              setAddress(address)
            }}
          />
        </div>
      </DialogContent>
    </Dialog>
  )
}
