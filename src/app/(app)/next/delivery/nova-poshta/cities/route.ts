import { NextResponse, type NextRequest } from 'next/server'

import { searchNovaPoshtaCities } from '@/delivery/novaPoshta'
import {
  getDeliverySettings,
  isDeliveryMethodEnabled,
  isDeliveryMethodRuntimeConfigured,
} from '@/delivery/settings'
import type { DeliveryAPIResponse, DeliveryCity } from '@/delivery/types'

const disabledMessage = 'Nova Poshta delivery is disabled.'

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url)
  const q = searchParams.get('q') || ''

  if (!isDeliveryMethodRuntimeConfigured('nova_poshta')) {
    return NextResponse.json<DeliveryAPIResponse<DeliveryCity[]>>({
      data: [],
      message: disabledMessage,
      status: 'disabled',
    })
  }

  try {
    const settings = await getDeliverySettings()

    if (!isDeliveryMethodEnabled(settings, 'nova_poshta')) {
      return NextResponse.json<DeliveryAPIResponse<DeliveryCity[]>>({
        data: [],
        message: disabledMessage,
        status: 'disabled',
      })
    }

    const data = await searchNovaPoshtaCities(q)

    return NextResponse.json<DeliveryAPIResponse<DeliveryCity[]>>({
      data,
      status: data.length > 0 ? 'ok' : 'empty',
    })
  } catch {
    return NextResponse.json<DeliveryAPIResponse<DeliveryCity[]>>({
      data: [],
      message: 'Unable to load Nova Poshta cities.',
      status: 'error',
    })
  }
}
