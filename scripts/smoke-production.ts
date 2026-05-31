import 'dotenv/config'

type SmokeResult = {
  name: string
  status: number
  ok: boolean
}

const baseURL =
  process.env.SMOKE_BASE_URL ||
  process.env.NEXT_PUBLIC_SERVER_URL ||
  process.env.PAYLOAD_PUBLIC_SERVER_URL ||
  'http://localhost:3000'

const normalizedBaseURL = baseURL.replace(/\/+$/, '')

const checks = [
  {
    name: 'health',
    path: '/next/health',
    validate: async (response: Response) => {
      if (!response.ok) return false

      const body = (await response.json()) as { ok?: boolean }
      return body.ok === true
    },
  },
  {
    name: 'home',
    path: '/',
    validate: async (response: Response) => response.ok,
  },
  {
    name: 'admin',
    path: '/admin',
    validate: async (response: Response) => response.status === 200 || response.status === 307,
  },
  {
    name: 'payload-api-products',
    path: '/api/products?limit=1&depth=0',
    validate: async (response: Response) => response.ok,
  },
  {
    name: 'seed-route-disabled',
    path: '/next/seed',
    init: { method: 'POST' },
    validate: async (response: Response) => {
      if (process.env.ENABLE_SEED_ENDPOINT === 'true') {
        return response.status !== 404
      }

      return response.status === 404 || response.status === 401 || response.status === 403
    },
  },
] satisfies Array<{
  name: string
  path: string
  init?: RequestInit
  validate: (response: Response) => Promise<boolean>
}>

const runCheck = async (check: (typeof checks)[number]): Promise<SmokeResult> => {
  const response = await fetch(`${normalizedBaseURL}${check.path}`, {
    redirect: 'manual',
    ...check.init,
  })

  return {
    name: check.name,
    ok: await check.validate(response),
    status: response.status,
  }
}

const main = async () => {
  const results = await Promise.all(checks.map(runCheck))
  const failed = results.filter((result) => !result.ok)

  console.log(JSON.stringify({ baseURL: normalizedBaseURL, results }, null, 2))

  if (failed.length) {
    process.exit(1)
  }
}

main().catch((error) => {
  console.error(error)
  process.exit(1)
})
