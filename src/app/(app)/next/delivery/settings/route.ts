import { NextResponse } from 'next/server'

import { getDeliverySettings } from '@/delivery/settings'
import type { DeliveryAPIResponse, DeliverySettings } from '@/delivery/types'

export async function GET() {
  try {
    const settings = await getDeliverySettings()

    return NextResponse.json<DeliveryAPIResponse<DeliverySettings>>({
      data: settings,
      status: 'ok',
    })
  } catch {
    return NextResponse.json<DeliveryAPIResponse<DeliverySettings | null>>({
      data: null,
      message: 'Unable to load delivery settings.',
      status: 'error',
    })
  }
}
