import { describe, expect, it } from 'vitest'
import { readFileSync } from 'node:fs'
import { join } from 'node:path'

import {
  buildLocaleHref,
  getLocaleButtonState,
} from '@/components/Admin/BlockTranslationAssistant/utils'

const projectRoot = process.cwd()
const readSource = (path: string) => readFileSync(join(projectRoot, path), 'utf8')

describe('block translation assistant utilities', () => {
  it('builds locale switch links without changing the current admin document URL', () => {
    expect(
      buildLocaleHref('http://localhost:3000/admin/collections/pages/6?depth=0&locale=uk', 'ru'),
    ).toBe('/admin/collections/pages/6?depth=0&locale=ru')
  })

  it('adds locale to admin URLs that do not already include it', () => {
    expect(buildLocaleHref('http://localhost:3000/admin/collections/pages/6', 'uk')).toBe(
      '/admin/collections/pages/6?locale=uk',
    )
  })

  it('marks only the active locale button as current', () => {
    expect(getLocaleButtonState('uk', 'uk')).toEqual({
      ariaCurrent: 'true',
      isActive: true,
    })
    expect(getLocaleButtonState('uk', 'ru')).toEqual({
      ariaCurrent: undefined,
      isActive: false,
    })
  })

  it('switches admin assistant locales through client navigation instead of anchor reloads', () => {
    const source = readSource('src/components/Admin/BlockTranslationAssistant/index.tsx')

    expect(source).toContain('router.push(href, { scroll: false })')
    expect(source).toContain('router.refresh()')
    expect(source).toContain('type="button"')
    expect(source).not.toContain('<a')
  })

  it('renders the assistant as compact locale tabs without explanatory copy', () => {
    const source = readSource('src/components/Admin/BlockTranslationAssistant/index.tsx')
    const styles = readSource('src/components/Admin/BlockTranslationAssistant/index.scss')

    expect(source).toContain('role="tablist"')
    expect(source).toContain('role="tab"')
    expect(source).not.toContain('dictionary.description')
    expect(source).not.toContain('dictionary.title')
    expect(source).not.toContain('dictionary.fields')
    expect(styles).not.toContain('__description')
    expect(styles).not.toContain('__fields')
  })

  it('is registered on the key localized Page Builder blocks', () => {
    const blockConfigs = [
      'src/blocks/Hero/config.ts',
      'src/blocks/CallToAction/config.ts',
      'src/blocks/Content/config.ts',
      'src/blocks/FeaturedProducts/config.ts',
      'src/blocks/CategoryHighlights/config.ts',
      'src/blocks/Testimonials/config.ts',
      'src/blocks/ArchiveBlock/config.ts',
      'src/blocks/Banner/config.ts',
      'src/blocks/Form/config.ts',
    ]

    for (const path of blockConfigs) {
      const source = readSource(path)

      expect(source).toContain('blockTranslationAssistant')
      expect(source).toContain('localizedFields')
    }
  })
})
