import { NextResponse, type NextRequest } from 'next/server'

import { searchUkrposhtaWarehouses } from '@/delivery/ukrposhta'
import {
  getDeliverySettings,
  isDeliveryMethodEnabled,
  isDeliveryMethodRuntimeConfigured,
} from '@/delivery/settings'
import type { DeliveryAPIResponse, DeliveryWarehouse } from '@/delivery/types'

const disabledMessage = 'Ukrposhta delivery is disabled.'

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url)
  const cityID = searchParams.get('cityID') || ''
  const q = searchParams.get('q') || ''

  if (!isDeliveryMethodRuntimeConfigured('ukrposhta')) {
    return NextResponse.json<DeliveryAPIResponse<DeliveryWarehouse[]>>({
      data: [],
      message: disabledMessage,
      status: 'disabled',
    })
  }

  try {
    const settings = await getDeliverySettings()

    if (!isDeliveryMethodEnabled(settings, 'ukrposhta')) {
      return NextResponse.json<DeliveryAPIResponse<DeliveryWarehouse[]>>({
        data: [],
        message: disabledMessage,
        status: 'disabled',
      })
    }

    const data = await searchUkrposhtaWarehouses({ cityID, query: q })

    return NextResponse.json<DeliveryAPIResponse<DeliveryWarehouse[]>>({
      data,
      status: data.length > 0 ? 'ok' : 'empty',
    })
  } catch {
    return NextResponse.json<DeliveryAPIResponse<DeliveryWarehouse[]>>({
      data: [],
      message: 'Unable to load Ukrposhta warehouses.',
      status: 'error',
    })
  }
}
