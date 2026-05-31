import { afterEach, describe, expect, it, vi } from 'vitest'

const getPayloadMock = vi.fn()
const seedMock = vi.fn()

vi.mock('payload', () => ({
  createLocalReq: vi.fn(),
  getPayload: getPayloadMock,
}))

vi.mock('@/endpoints/seed', () => ({
  seed: seedMock,
}))

vi.mock('@payload-config', () => ({
  default: {},
}))

vi.mock('next/headers', () => ({
  headers: vi.fn(),
}))

vi.mock('@/access/utilities', () => ({
  checkRole: vi.fn(),
}))

const importSeedRoute = async () => {
  vi.resetModules()
  return import('@/app/(app)/next/seed/route')
}

describe('seed route production guard', () => {
  afterEach(() => {
    vi.unstubAllEnvs()
    vi.clearAllMocks()
    vi.resetModules()
  })

  it('returns 404 before seeding in production unless explicitly enabled', async () => {
    vi.stubEnv('NODE_ENV', 'production')
    vi.stubEnv('ENABLE_SEED_ENDPOINT', 'false')

    const { POST } = await importSeedRoute()

    const response = await POST()

    expect(response.status).toBe(404)
    await expect(response.text()).resolves.toBe('Not found.')
    expect(getPayloadMock).not.toHaveBeenCalled()
    expect(seedMock).not.toHaveBeenCalled()
  })
})
