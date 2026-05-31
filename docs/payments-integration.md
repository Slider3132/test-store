# Payments Integration

This starter no longer assumes Stripe as the only production payment provider.

## Provider Selection

Use these variables:

```bash
PAYMENT_PROVIDER=external_redirect
NEXT_PUBLIC_PAYMENT_PROVIDER=external_redirect
NEXT_PUBLIC_PAYMENT_PROVIDER_LABEL="Оплата карткою"
```

Supported values:

| Value | Use Case |
| --- | --- |
| `external_redirect` | Hosted checkout providers such as LiqPay, WayForPay, Monobank acquiring, Fondy, or a custom Ukrainian PSP adapter. |
| `stripe` | Legacy Stripe integration. |
| `disabled` | Checkout disabled. |

## Generic Redirect Provider

The built-in `external_redirect` adapter is a safe base contract:

```bash
PAYMENT_EXTERNAL_PROVIDER_LABEL="Оплата карткою"
PAYMENT_EXTERNAL_CHECKOUT_URL=https://pay.example.com/checkout
PAYMENT_EXTERNAL_WEBHOOK_SECRET=replace-with-provider-webhook-secret
```

On checkout initiation, the adapter creates a pending transaction and redirects the customer to `PAYMENT_EXTERNAL_CHECKOUT_URL` with these query params:

| Param | Meaning |
| --- | --- |
| `transactionID` | Local Payload transaction ID. |
| `providerReference` | Local unique payment reference. |
| `amount` | Amount in base units. For UAH, `10000` means 100.00 UAH. |
| `currency` | Currency code, currently `UAH`. |
| `customerEmail` | Customer email from checkout. |
| `returnUrl` | Storefront return URL. |

The provider webhook endpoint is:

```text
POST /api/payments/external_redirect/webhooks
```

The request body must be JSON and signed with HMAC-SHA256 using `PAYMENT_EXTERNAL_WEBHOOK_SECRET`.
Send the hex signature in either header:

```text
x-payment-signature: <hex-hmac-sha256>
x-external-payment-signature: <hex-hmac-sha256>
```

Expected JSON body:

```json
{
  "transactionID": 123,
  "providerReference": "local-reference",
  "status": "succeeded",
  "amount": 10000,
  "currency": "UAH"
}
```

Only signed `succeeded` events create an order. Order creation is idempotent: if the transaction already has an order, the existing order is returned.

## Adding A Real Ukrainian Provider

Create a provider-specific adapter beside `src/payments/externalRedirectAdapter.ts` and keep the same lifecycle:

1. `initiatePayment`: create a pending transaction, call the provider create-payment API, store provider IDs in the transaction group, return `redirectUrl`.
2. `webhooks`: verify the provider signature using the provider's official algorithm, compare amount/currency/reference, then call `finalizePaidTransaction`.
3. `confirmOrder`: avoid client-authoritative order creation. Use it only for providers that require a server-side status lookup and still verify the provider status.

Provider-specific files should not change checkout UI. They should only add a new server adapter and a matching client adapter entry.
