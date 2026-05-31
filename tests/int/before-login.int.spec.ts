import React from 'react'
import { render, screen } from '@testing-library/react'
import { describe, expect, it } from 'vitest'
import { vi } from 'vitest'

vi.mock('@payloadcms/ui', () => ({
  useTranslation: () => ({
    i18n: {
      language: 'uk',
    },
  }),
}))

import { BeforeLogin } from '@/components/BeforeLogin'

describe('BeforeLogin', () => {
  it('shows the local ecommerce starter marker', () => {
    render(React.createElement(BeforeLogin))

    expect(screen.getByText('Вітаємо в адмінпанелі!')).toBeTruthy()
    expect(screen.getByText('Тестовий інстанс ecommerce-starter')).toBeTruthy()
  })
})
