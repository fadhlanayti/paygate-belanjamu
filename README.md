# paygate-belanjamu

Official JavaScript / TypeScript SDK for **Belanjamu PayGate** — QRIS, E-Wallet, and Virtual Account payments over a single API.

Works in **Node.js** and the **browser** (for polling + webhook verification).

## Installation

```bash
npm install paygate-belanjamu
```

## Quick Start

```ts
import { PayGate, verifyWebhook } from "paygate-belanjamu";

const pg = new PayGate({
  apiKey: "pg_live_xxxx",            // required
  baseUrl: "https://pg-be.belanjamu.company/api", // optional (default shown)
});

// Create a QRIS payment
const payment = await pg.createPayment({
  orderId: "ORD-001",
  amount: 50000,
  method: "QRIS",                // QRIS | EWALLET | VA
  note: "Order #001 — Kaos",
  expireMinutes: 30,
  metadata: { customer: "Budi" },
});

console.log(payment.qr_image_url); // SVG/PNG data URI or hosted URL
console.log(payment.reference);    // PAY-20260909-XXXX — use for status polling
```

## API

### `new PayGate(config)`

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| `apiKey` | `string` | Yes | Tenant API key (`pg_live_...` / `pg_test_...`) |
| `baseUrl` | `string` | No | API base URL. Default: `https://pg-be.belanjamu.company/api` |
| `timeout` | `number` | No | Request timeout (ms). Default: 15000 |

### Methods

All methods throw `PayGateError` on non-2xx. Catch with `.status` and `.data`.

#### `pg.createPayment(params)`

```ts
const payment = await pg.createPayment({
  orderId: "ORD-002",
  amount: 100000,
  method: "QRIS",
  metadata: { anything: "you want" },
});
```

#### `pg.getPayment(reference)`

```ts
const payment = await pg.getPayment("PAY-20260909-ABCD");
// payment.status === "PENDING" | "PAID" | "EXPIRED" | "FAILED"
```

#### `pg.listPayments({ page?, limit?, status? })`

```ts
const { transactions, total } = await pg.listPayments({ page: 1, limit: 20, status: "PAID" });
```

#### `pg.cancelPayment(reference)`

```ts
await pg.cancelPayment("PAY-20260909-ABCD");
```

### Webhook Verification

> **Security note**: always read the raw body *before* `JSON.parse`, and never use `===` for signature comparison — it leaks timing.

#### Node.js (Express)

```ts
import express from "express";
import { verifyWebhook } from "paygate-belanjamu";

const webhookSecret = "whsec_xxxx"; // from tenant dashboard

app.post(
  "/webhooks/paygate",
  express.raw({ type: "application/json" }),
  async (req, res) => {
    const rawBody = req.body.toString("utf8");
    const signature = req.header("X-Signature");
    const valid = await verifyWebhook(rawBody, signature, webhookSecret);

    if (!valid) return res.status(401).send("invalid signature");

    const event = JSON.parse(rawBody);
    // event.reference, event.order_id, event.status === "PAID" → mark order as paid
    res.json({ status: "ok" });
  }
);
```

#### PHP

```php
$secret = "whsec_xxxx";
$rawBody = file_get_contents("php://input");
$signature = $_SERVER["HTTP_X_SIGNATURE"] ?? "";

$valid = hash_equals(
  hash_hmac("sha256", $rawBody, $secret),
  $signature
);

if (!$valid) { http_response_code(401); exit("invalid signature"); }

$event = json_decode($rawBody, true);
// $event["status"] === "PAID" → mark order as paid
echo json_encode(["status" => "ok"]);
```

#### Browser

```ts
import { verifyWebhook } from "paygate-belanjamu";
// verifyWebhook uses WebCrypto in the browser automatically
const valid = await verifyWebhook(rawBody, signature, secret);
```

## TypeScript

All responses are fully typed. See `src/types.ts` for the full reference.

```ts
import type { CreatePaymentResponse, PayGateErrorData } from "paygate-belanjamu";
```

## License

MIT
