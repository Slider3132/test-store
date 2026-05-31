import { describe, expect, it } from 'vitest'
import type React from 'react'
import { vi } from 'vitest'

vi.mock('@payload-config', () => ({
  default: {},
}))

vi.mock('payload', () => ({
  getPayload: vi.fn(),
}))

vi.mock('next/headers', () => ({
  draftMode: vi.fn(),
}))

vi.mock('next/link', () => ({
  default: ({ children }: { children: React.ReactNode }) => children,
}))

vi.mock('next/navigation', () => ({
  notFound: vi.fn(),
}))

vi.mock('@/blocks/RenderBlocks', () => ({
  RenderBlocks: () => null,
}))

vi.mock('@/components/Grid/tile', () => ({
  GridTileImage: () => null,
}))

vi.mock('@/components/product/Gallery', () => ({
  Gallery: () => null,
}))

vi.mock('@/components/product/ProductDescription', () => ({
  ProductDescription: () => null,
}))

vi.mock('@/components/ui/button', () => ({
  Button: ({ children }: { children: React.ReactNode }) => children,
}))

import { toProductJsonLdPrice } from '@/app/(app)/products/[slug]/page'

describe('product JSON-LD', () => {
  it('converts base currency amounts to decimal prices', () => {
    expect(toProductJsonLdPrice(123456)).toBe(1234.56)
  })
})
