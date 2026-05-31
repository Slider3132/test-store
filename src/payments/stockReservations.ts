import crypto from 'crypto'
import type { PayloadRequest } from 'payload'

type OrderItem = {
  product?: { id?: number | string } | number | string | null
  quantity?: number | null
  variant?: { id?: number | string } | number | string | null
}

type ReservationOrder = {
  id?: number | string
  items?: OrderItem[] | null
  stockReservationStatus?: 'none' | 'reserved' | 'released' | null
}

const getRelationshipID = (value: unknown) => {
  if (!value) return undefined
  if (typeof value === 'object' && 'id' in value) return value.id
  return value
}

const getOrderLockKey = (orderID: number | string | undefined, items: OrderItem[]) => {
  const source = orderID ? `order:${orderID}` : JSON.stringify(items)
  return crypto.createHash('sha256').update(source).digest().readInt32BE(0)
}

const getStockKey = (item: OrderItem) => {
  const variantID = getRelationshipID(item.variant)
  const productID = getRelationshipID(item.product)

  if (variantID) return `variant:${variantID}`
  if (productID) return `product:${productID}`

  return undefined
}

const getItemFromStockKey = (key: string, quantity: number): OrderItem => {
  const [type, id] = key.split(':')

  if (type === 'variant') {
    return {
      quantity,
      variant: id,
    }
  }

  return {
    quantity,
    product: id,
  }
}

const aggregateItems = (items: OrderItem[]) => {
  return items.reduce<Record<string, number>>((acc, item) => {
    const key = getStockKey(item)
    if (!key) return acc

    acc[key] = (acc[key] || 0) + (item.quantity || 1)
    return acc
  }, {})
}

const getPool = (req: PayloadRequest) => {
  const pool = (req.payload.db as any).pool

  if (!pool?.connect) {
    throw new Error('Postgres pool is required for atomic stock reservations.')
  }

  return pool
}

const reserveItem = async ({
  client,
  item,
}: {
  client: { query: (sql: string, values?: unknown[]) => Promise<{ rows: Record<string, unknown>[] }> }
  item: OrderItem
}) => {
  const quantity = item.quantity || 1
  const variantID = getRelationshipID(item.variant)
  const productID = getRelationshipID(item.product)

  if (variantID) {
    const result = await client.query(
      'UPDATE variants SET inventory = inventory - $2 WHERE id = $1 AND inventory IS NOT NULL AND inventory >= $2 RETURNING id',
      [variantID, quantity],
    )

    if (!result.rows.length) {
      throw new Error('One or more variants are out of stock.')
    }

    return
  }

  if (productID) {
    const result = await client.query(
      'UPDATE products SET inventory = inventory - $2 WHERE id = $1 AND inventory IS NOT NULL AND inventory >= $2 RETURNING id',
      [productID, quantity],
    )

    if (!result.rows.length) {
      throw new Error('One or more products are out of stock.')
    }
  }
}

const releaseItem = async ({
  client,
  item,
}: {
  client: { query: (sql: string, values?: unknown[]) => Promise<{ rows: Record<string, unknown>[] }> }
  item: OrderItem
}) => {
  const quantity = item.quantity || 1
  const variantID = getRelationshipID(item.variant)
  const productID = getRelationshipID(item.product)

  if (variantID) {
    await client.query('UPDATE variants SET inventory = inventory + $2 WHERE id = $1', [
      variantID,
      quantity,
    ])
    return
  }

  if (productID) {
    await client.query('UPDATE products SET inventory = inventory + $2 WHERE id = $1', [
      productID,
      quantity,
    ])
  }
}

export const reserveOrderStock = async ({
  order,
  req,
}: {
  order: ReservationOrder
  req: PayloadRequest
}) => {
  const items = order.items || []

  if (!items.length || order.stockReservationStatus === 'reserved') return

  const client = await getPool(req).connect()
  const lockNamespace = 20260526
  const lockKey = getOrderLockKey(order.id, items)

  try {
    await client.query('BEGIN')
    await client.query('SELECT pg_advisory_xact_lock($1, $2)', [lockNamespace, lockKey])

    for (const item of items) {
      await reserveItem({ client, item })
    }

    await client.query('COMMIT')
  } catch (error) {
    await client.query('ROLLBACK')
    throw error
  } finally {
    client.release()
  }
}

export const releaseOrderStock = async ({
  order,
  req,
}: {
  order: ReservationOrder
  req: PayloadRequest
}) => {
  const items = order.items || []

  if (!items.length || order.stockReservationStatus !== 'reserved') return

  const client = await getPool(req).connect()
  const lockNamespace = 20260526
  const lockKey = getOrderLockKey(order.id, items)

  try {
    await client.query('BEGIN')
    await client.query('SELECT pg_advisory_xact_lock($1, $2)', [lockNamespace, lockKey])

    for (const item of items) {
      await releaseItem({ client, item })
    }

    await client.query('COMMIT')
  } catch (error) {
    await client.query('ROLLBACK')
    throw error
  } finally {
    client.release()
  }
}

export const reconcileOrderStockReservation = async ({
  nextOrder,
  originalOrder,
  req,
}: {
  nextOrder: ReservationOrder
  originalOrder: ReservationOrder
  req: PayloadRequest
}) => {
  const originalItems = originalOrder.items || []
  const nextItems = nextOrder.items || []

  if (!nextItems.length || originalOrder.stockReservationStatus !== 'reserved') return

  const originalTotals = aggregateItems(originalItems)
  const nextTotals = aggregateItems(nextItems)
  const stockKeys = Array.from(new Set([...Object.keys(originalTotals), ...Object.keys(nextTotals)]))

  const deltas = stockKeys
    .map((key) => ({
      key,
      quantity: (nextTotals[key] || 0) - (originalTotals[key] || 0),
    }))
    .filter((delta) => delta.quantity !== 0)

  if (!deltas.length) return

  const client = await getPool(req).connect()
  const lockNamespace = 20260526
  const lockKey = getOrderLockKey(nextOrder.id || originalOrder.id, nextItems)

  try {
    await client.query('BEGIN')
    await client.query('SELECT pg_advisory_xact_lock($1, $2)', [lockNamespace, lockKey])

    for (const delta of deltas) {
      const quantity = Math.abs(delta.quantity)
      const item = getItemFromStockKey(delta.key, quantity)

      if (delta.quantity > 0) {
        await reserveItem({ client, item })
      } else {
        await releaseItem({ client, item })
      }
    }

    await client.query('COMMIT')
  } catch (error) {
    await client.query('ROLLBACK')
    throw error
  } finally {
    client.release()
  }
}
