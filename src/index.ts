/**
 * paygate-belanjamu — Official SDK for Belanjamu PayGate
 *
 * Quick start:
 * ```ts
 * import { PayGate, verifyWebhook } from "paygate-belanjamu";
 *
 * const pg = new PayGate({ apiKey: "pg_live_xxxx" });
 *
 * // Create a QRIS payment
 * const payment = await pg.createPayment({ orderId: "ORD-001", amount: 50000 });
 * console.log(payment.qr_image_url);
 *
 * // Poll payment status
 * const status = await pg.getPayment(payment.reference);
 *
 * // Verify incoming webhook (in your Express handler)
 * const valid = await verifyWebhook(rawBody, req.header("X-Signature"), webhookSecret);
 * ```
 */

export { PayGate, PayGateError } from "./client.js";
export { verifyWebhook, timingSafeEqual } from "./webhook.js";

export type {
  PayGateConfig,
  CreatePaymentParams,
  CreatePaymentResponse,
  GetPaymentResponse,
  ListPaymentsParams,
  ListPaymentsResponse,
  CancelPaymentResponse,
  WebhookPayload,
  PayGateErrorData,
} from "./types.js";
