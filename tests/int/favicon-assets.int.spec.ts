import fs from 'node:fs'
import path from 'node:path'
import { describe, expect, it } from 'vitest'

describe('favicon assets', () => {
  it('serves root favicon files referenced by the app layout', () => {
    expect(fs.existsSync(path.resolve(process.cwd(), 'public/favicon.ico'))).toBe(true)
    expect(fs.existsSync(path.resolve(process.cwd(), 'public/favicon.svg'))).toBe(true)
  })
})
