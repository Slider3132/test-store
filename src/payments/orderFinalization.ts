import type { PayloadRequest } from 'payload'
import crypto from 'crypto'

import type { Transaction } from '@/payload-types'
import { releaseOrderStock, reserveOrderStock } from '@/payments/stockReservations'

type TransactionItem = NonNullable<Transaction['items']>[number]

const getRelationshipID = (value: unknown) => {
  if (!value) return undefined
  if (typeof value === 'object' && 'id' in value) return value.id
  return value
}

const getLockKey = (transactionID: number | string) => {
  const id = Number(transactionID)

  if (Number.isSafeInteger(id) && id >= 0 && id <= 2147483647) {
    return id
  }

  return crypto
    .createHash('sha256')
    .update(String(transactionID))
    .digest()
    .readInt32BE(0)
}

const withTransactionFinalizationLock = async <T>({
  req,
  transactionID,
  work,
}: {
  req: PayloadRequest
  transactionID: number | string
  work: () => Promise<T>
}) => {
  const pool = (req.payload.db as any).pool

  if (!pool?.connect) {
    throw new Error('Postgres pool is required for safe payment finalization locking.')
  }

  const client = await pool.connect()
  const lockNamespace = 20260525
  const lockKey = getLockKey(transactionID)

  try {
    await client.query('SELECT pg_advisory_lock($1, $2)', [lockNamespace, lockKey])
    return await work()
  } finally {
    await client.query('SELECT pg_advisory_unlock($1, $2)', [lockNamespace, lockKey])
    client.release()
  }
}

const finalizePaidTransactionWithoutLock = async ({
  req,
  transactionID,
}: {
  req: PayloadRequest
  transactionID: number | string
}) => {
  const transaction = (await req.payload.findByID({
    collection: 'transactions' as any,
    depth: 0,
    id: transactionID as any,
    overrideAccess: true,
    select: {
      amount: true,
      cart: true,
      currency: true,
      customer: true,
      customerEmail: true,
      externalRedirect: true,
      items: true,
      order: true,
      status: true,
    },
  })) as Transaction & {
    externalRedirect?: {
      deliveryDetails?: Record<string, unknown>
      shippingAddress?: Record<string, unknown>
    }
  }

  if (transaction.order) {
    return {
      orderID: getRelationshipID(transaction.order),
      transactionID: transaction.id,
    }
  }

  const items = transaction.items || []

  if (!items.length) {
    throw new Error('Cannot finalize a transaction without items.')
  }

  await reserveOrderStock({ order: { items, stockReservationStatus: 'none' }, req })

  let order

  try {
    order = await req.payload.create({
      collection: 'orders',
      data: {
        amount: transaction.amount,
        currency: transaction.currency,
        ...(transaction.customer
          ? { customer: getRelationshipID(transaction.customer) }
          : { customerEmail: transaction.customerEmail }),
        items,
        deliveryDetails: transaction.externalRedirect?.deliveryDetails,
        deliveryMethod: transaction.externalRedirect?.deliveryDetails?.provider,
        paymentStatus: 'paid',
        shippingAddress: transaction.externalRedirect?.shippingAddress,
        status: 'processing',
        stockReservationStatus: 'reserved',
        transactions: [transaction.id],
      } as any,
      overrideAccess: true,
      req,
    })
  } catch (error) {
    await releaseOrderStock({ order: { items, stockReservationStatus: 'reserved' }, req })
    throw error
  }

  if (transaction.cart) {
    await req.payload.update({
      collection: 'carts' as any,
      data: {
        purchasedAt: new Date().toISOString(),
        status: 'purchased',
      },
      id: getRelationshipID(transaction.cart) as any,
      overrideAccess: true,
      req,
    })
  }

  await req.payload.update({
    collection: 'transactions' as any,
    data: {
      order: order.id,
      status: 'succeeded',
    },
    id: transaction.id,
    overrideAccess: true,
    req,
  })

  return {
    orderID: order.id,
    transactionID: transaction.id,
    ...(order.accessToken ? { accessToken: order.accessToken } : {}),
  }
}

export const finalizePaidTransaction = async ({
  req,
  transactionID,
}: {
  req: PayloadRequest
  transactionID: number | string
}) =>
  withTransactionFinalizationLock({
    req,
    transactionID,
    work: () => finalizePaidTransactionWithoutLock({ req, transactionID }),
  })
