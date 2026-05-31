import fs from 'node:fs'
import path from 'node:path'
import { describe, expect, it } from 'vitest'

const pluginSource = fs.readFileSync(
  path.resolve(process.cwd(), 'src/plugins/index.ts'),
  'utf8',
)

describe('admin order tracking field', () => {
  it('exposes a single manager-facing TTN field label', () => {
    expect(pluginSource.split("label: 'ТТН / tracking'")).toHaveLength(2)
  })
})
