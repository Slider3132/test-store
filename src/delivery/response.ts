import type { DeliveryAPIResponse } from '@/delivery/types'

export const deliveryResponse = <T>(
  data: T[],
  disabled: boolean,
  error?: unknown,
): DeliveryAPIResponse<T[]> => {
  if (disabled) {
    return {
      data: [],
      status: 'disabled',
    }
  }

  if (error) {
    return {
      data: [],
      message: error instanceof Error ? error.message : 'Delivery provider request failed.',
      status: 'error',
    }
  }

  return {
    data,
    status: data.length ? 'ok' : 'empty',
  }
}
