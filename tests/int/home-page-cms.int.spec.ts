import { readFileSync } from 'node:fs'
import { join } from 'node:path'

import { describe, expect, it } from 'vitest'

const projectRoot = process.cwd()
const homePageSource = readFileSync(join(projectRoot, 'src/app/(app)/page.tsx'), 'utf8')

describe('home page CMS rendering', () => {
  it('renders the home page from Payload CMS blocks instead of hardcoded storefront copy', () => {
    expect(homePageSource).not.toContain('const homeCopy')
    expect(homePageSource).toContain('RenderBlocks')
    expect(homePageSource).toContain("equals: 'home'")
  })
})
