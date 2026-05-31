import React from 'react'
import { fireEvent, render, screen } from '@testing-library/react'
import { describe, expect, it, vi } from 'vitest'

import type { Address } from '@/payload-types'

const mockUseAddresses = vi.fn()

vi.mock('@payloadcms/plugin-ecommerce/client/react', () => ({
  useAddresses: () => mockUseAddresses(),
}))

vi.mock('@/i18n/client', () => ({
  useDictionary: () => ({
    account: {
      addresses: 'Addresses',
    },
    address: {
      add: 'Add address',
      connectedToAccount: 'Connected to account',
      noAddressesAdd: 'No addresses. Add one.',
      select: 'Select',
      selectAddress: 'Select address',
      selectOrAdd: 'Select or add an address',
    },
  }),
}))

vi.mock('@/components/addresses/CreateAddressModal', () => ({
  CreateAddressModal: ({ callback }: { callback?: (address: Partial<Address>) => void }) => (
    <button
      onClick={() =>
        callback?.({
          id: 1,
          city: 'Kyiv',
        })
      }
      type="button"
    >
      create address
    </button>
  ),
}))

vi.mock('@/components/addresses/AddressItem', () => ({
  AddressItem: () => <div>Address item</div>,
}))

import { CheckoutAddresses } from '@/components/checkout/CheckoutAddresses'

describe('CheckoutAddresses', () => {
  it('selects a newly created address when the user has no saved addresses', () => {
    const setAddress = vi.fn()

    mockUseAddresses.mockReturnValue({ addresses: [] })

    render(<CheckoutAddresses setAddress={setAddress} />)

    fireEvent.click(screen.getByRole('button', { name: 'create address' }))

    expect(setAddress).toHaveBeenCalledWith(
      expect.objectContaining({
        city: 'Kyiv',
        id: 1,
      }),
    )
  })
})
