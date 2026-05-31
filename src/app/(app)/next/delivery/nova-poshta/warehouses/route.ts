import { NextResponse, type NextRequest } from 'next/server'

import { searchNovaPoshtaWarehouses } from '@/delivery/novaPoshta'
import {
  getDeliverySettings,
  isDeliveryMethodEnabled,
  isDeliveryMethodRuntimeConfigured,
} from '@/delivery/settings'
import type { DeliveryAPIResponse, DeliveryWarehouse } from '@/delivery/types'

const disabledMessage = 'Nova Poshta delivery is disabled.'

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url)
  const cityID = searchParams.get('cityID') || ''
  const q = searchParams.get('q') || ''

  if (!isDeliveryMethodRuntimeConfigured('nova_poshta')) {
    return NextResponse.json<DeliveryAPIResponse<DeliveryWarehouse[]>>({
      data: [],
      message: disabledMessage,
      status: 'disabled',
    })
  }

  try {
    const settings = await getDeliverySettings()

    if (!isDeliveryMethodEnabled(settings, 'nova_poshta')) {
      return NextResponse.json<DeliveryAPIResponse<DeliveryWarehouse[]>>({
        data: [],
        message: disabledMessage,
        status: 'disabled',
      })
    }

    const data = await searchNovaPoshtaWarehouses({ cityID, query: q })

    return NextResponse.json<DeliveryAPIResponse<DeliveryWarehouse[]>>({
      data,
      status: data.length > 0 ? 'ok' : 'empty',
    })
  } catch {
    return NextResponse.json<DeliveryAPIResponse<DeliveryWarehouse[]>>({
      data: [],
      message: 'Unable to load Nova Poshta warehouses.',
      status: 'error',
    })
  }
}
