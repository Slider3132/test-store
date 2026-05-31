import { readFileSync } from 'node:fs'
import { join } from 'node:path'

import { describe, expect, it } from 'vitest'

const projectRoot = process.cwd()
const readSource = (file: string) => readFileSync(join(projectRoot, file), 'utf8')

describe('admin and catalog audit regressions', () => {
  it('keeps audit logs and variant admin labels plain and localized', () => {
    const auditLogs = readSource('src/collections/AuditLogs.ts')
    const plugins = readSource('src/plugins/index.ts')

    expect(auditLogs).toContain('labels: collectionLabels.auditLogs')
    expect(auditLogs).not.toContain('singular: {')
    expect(plugins).toContain('labels: collectionLabels.variants')
    expect(plugins).toContain("defaultColumns: ['id', 'product', 'inventory', '_status']")
  })

  it('does not leave admin helper copy hard-coded in the wrong language', () => {
    const beforeLogin = readSource('src/components/BeforeLogin/index.tsx')
    const beforeDashboard = readSource('src/components/BeforeDashboard/index.tsx')
    const translations = readSource('src/i18n/payloadAdminTranslations.ts')

    expect(beforeLogin).not.toContain('<span>Тестовий інстанс ecommerce-starter</span>')
    expect(beforeDashboard).not.toContain('Getting Started')
    expect(beforeDashboard).not.toContain('custom component')
    expect(translations).not.toContain("livePreview: 'Live preview'")
  })

  it('keeps demo catalog seed localized across product attributes and header nav', () => {
    const seed = readSource('scripts/seed-demo-catalog.ts')

    expect(seed).toContain("title: { ru: 'Премиальные кроссовки Mono', uk: 'Преміальні кросівки Mono' }")
    expect(seed).not.toContain("attributeValues: attributeValues(product, 'ru')")
    expect(seed).toContain('Характеристики и варианты этого товара созданы')
    expect(seed).toContain("label: 'Каталог'")
    expect(seed).toContain("label: 'Каталог товаров'")
  })

  it('keeps base seed product and media copy localized', () => {
    const seed = readSource('src/endpoints/seed/index.ts')
    const hat = readSource('src/endpoints/seed/product-hat.ts')
    const tshirt = readSource('src/endpoints/seed/product-tshirt.ts')
    const media = [
      'src/endpoints/seed/image-hat.ts',
      'src/endpoints/seed/image-tshirt-black.ts',
      'src/endpoints/seed/image-tshirt-white.ts',
      'src/endpoints/seed/image-hero-1.ts',
    ]
      .map(readSource)
      .join('\n')

    expect(seed).not.toContain("label: 'Size'")
    expect(seed).not.toContain("label: 'Color'")
    expect(hat).not.toContain('Top off your look')
    expect(tshirt).not.toContain('This is 100% cotton')
    expect(tshirt).not.toContain('Product Type: t-shirt')
    expect(media).not.toContain('Photo by ')
    expect(media).not.toContain('Black tshirt')
  })
})
