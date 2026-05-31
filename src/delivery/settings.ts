import { env } from '@/lib/env'

import type { DeliveryMethod, DeliveryMethodSettings, DeliverySettings } from '@/delivery/types'

type AdminDeliverySettings = {
  fixedShippingPrice?: number | null
  freeShippingFrom?: number | null
  novaPoshtaEnabled?: boolean | null
  pickupEnabled?: boolean | null
  pickupInstructions?: string | null
  ukrposhtaEnabled?: boolean | null
}

type AdminSettings = {
  delivery?: AdminDeliverySettings | null
}

type PayloadLike = {
  findGlobal: (args: {
    depth?: number
    overrideAccess?: boolean
    slug: 'admin-settings'
  }) => Promise<AdminSettings | null | undefined>
}

type ResolveDeliverySettingsOptions = {
  payload?: PayloadLike | null
}

const defaultAdminDeliverySettings: Required<AdminDeliverySettings> = {
  fixedShippingPrice: null,
  freeShippingFrom: null,
  novaPoshtaEnabled: true,
  pickupEnabled: true,
  pickupInstructions: null,
  ukrposhtaEnabled: true,
}

const methodRequirements: Record<DeliveryMethod, Omit<DeliveryMethodSettings, 'enabled'>> = {
  nova_poshta: {
    requiresCity: true,
    requiresWarehouse: true,
  },
  pickup: {
    requiresCity: false,
    requiresWarehouse: false,
  },
  ukrposhta: {
    requiresCity: true,
    requiresWarehouse: true,
  },
}

export const defaultDeliverySettings: DeliverySettings = {
  fixedShippingPrice: null,
  freeShippingFrom: null,
  methods: {
    nova_poshta: {
      enabled: false,
      ...methodRequirements.nova_poshta,
    },
    pickup: {
      enabled: true,
      ...methodRequirements.pickup,
    },
    ukrposhta: {
      enabled: false,
      ...methodRequirements.ukrposhta,
    },
  },
}

const normalizeNullableNumber = (value: number | null | undefined) =>
  typeof value === 'number' && Number.isFinite(value) ? value : null

const readAdminDeliverySettings = async (
  payload?: PayloadLike | null,
): Promise<AdminDeliverySettings> => {
  if (!payload) return {}

  try {
    const settings = await payload.findGlobal({
      depth: 0,
      overrideAccess: true,
      slug: 'admin-settings',
    })

    return settings?.delivery || {}
  } catch {
    return {}
  }
}

export const isDeliveryMethodRuntimeConfigured = (method: DeliveryMethod) => {
  if (method === 'pickup') return true
  if (method === 'nova_poshta') return Boolean(env.novaPoshtaEnabled && env.novaPoshtaAPIKey)

  return Boolean(env.ukrposhtaEnabled && env.ukrposhtaBearerToken)
}

export const resolveDeliverySettings = async ({
  payload,
}: ResolveDeliverySettingsOptions = {}): Promise<DeliverySettings> => {
  const adminSettings = {
    ...defaultAdminDeliverySettings,
    ...(await readAdminDeliverySettings(payload)),
  }

  return {
    fixedShippingPrice: normalizeNullableNumber(adminSettings.fixedShippingPrice),
    freeShippingFrom: normalizeNullableNumber(adminSettings.freeShippingFrom),
    methods: {
      nova_poshta: {
        enabled: Boolean(
          adminSettings.novaPoshtaEnabled && isDeliveryMethodRuntimeConfigured('nova_poshta'),
        ),
        ...methodRequirements.nova_poshta,
      },
      pickup: {
        enabled: Boolean(adminSettings.pickupEnabled),
        ...methodRequirements.pickup,
      },
      ukrposhta: {
        enabled: Boolean(
          adminSettings.ukrposhtaEnabled && isDeliveryMethodRuntimeConfigured('ukrposhta'),
        ),
        ...methodRequirements.ukrposhta,
      },
    },
    ...(adminSettings.pickupInstructions
      ? {
          pickupInstructions: adminSettings.pickupInstructions,
        }
      : {}),
  }
}

export const getDeliverySettings = async (): Promise<DeliverySettings> => {
  if (!env.databaseURL) return resolveDeliverySettings()

  try {
    const [{ getPayload }, { default: config }] = await Promise.all([
      import('payload'),
      import('@payload-config'),
    ])
    const payload = await getPayload({ config })

    return resolveDeliverySettings({ payload })
  } catch {
    return resolveDeliverySettings()
  }
}

export const isDeliveryMethodEnabled = (settings: DeliverySettings, method: DeliveryMethod) =>
  settings.methods[method]?.enabled === true
