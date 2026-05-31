import fs from 'node:fs'
import path from 'node:path'
import { describe, expect, it } from 'vitest'

const payloadConfigSource = fs.readFileSync(
  path.resolve(process.cwd(), 'src/payload.config.ts'),
  'utf8',
)

describe('payload database config', () => {
  it('does not push development schema on every server start', () => {
    expect(payloadConfigSource).toContain('push: false')
  })
})
