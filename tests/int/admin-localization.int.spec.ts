import { readFileSync } from 'node:fs'
import { join } from 'node:path'

import { describe, expect, it } from 'vitest'

const projectRoot = process.cwd()

const readSource = (file: string) => readFileSync(join(projectRoot, file), 'utf8')

describe('admin localization', () => {
  it('registers custom Payload admin translation overrides for Ukrainian and Russian', () => {
    const configSource = readSource('src/payload.config.ts')
    const translationsSource = readSource('src/i18n/payloadAdminTranslations.ts')

    expect(configSource).toContain('payloadAdminTranslations')
    expect(configSource).toContain('translations: payloadAdminTranslations')
    expect(translationsSource).toContain('Панель керування')
    expect(translationsSource).toContain('Панель управления')
    expect(translationsSource).toContain('Попередній перегляд')
    expect(translationsSource).toContain('Предпросмотр')
  })

  it('keeps our custom admin block and field labels localized', () => {
    const files = [
      'src/blocks/ArchiveBlock/config.ts',
      'src/blocks/Banner/config.ts',
      'src/blocks/CallToAction/config.ts',
      'src/blocks/Carousel/config.ts',
      'src/blocks/Content/config.ts',
      'src/blocks/Form/config.ts',
      'src/blocks/ThreeItemGrid/config.ts',
      'src/fields/link.ts',
      'src/fields/priceFields.ts',
      'src/plugins/index.ts',
    ]

    for (const file of files) {
      const source = readSource(file)

      expect(source).not.toContain("label: 'Intro Content'")
      expect(source).not.toContain("label: 'Collection'")
      expect(source).not.toContain("label: 'Individual Selection'")
      expect(source).not.toContain("label: 'Products to show'")
      expect(source).not.toContain("description: 'Choose how the link should be rendered.'")
      expect(source).not.toContain("en: 'Price'")
      expect(source).not.toContain("en: 'Currency'")
      expect(source).not.toContain("en: 'Swatch'")
    }
  })
})
