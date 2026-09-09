// ─── PayGate SDK Types ────────────────────────────────────────

/** Configuration for the PayGate SDK client. */
export interface PayGateConfig {
  /** Your tenant API key (e.g. `pg_live_xxxx` or `pg_test_xxxx`). */
  apiKey: string;
  /** Base URL of the PayGate API. Default: `https://pg-be.belanjamu.company/api` */
  baseUrl?: string;
  /** Request timeout in ms. Default: 15000 */
  timeout?: number;
}

// ─── Create Payment ──────────────────────────────────────────

export interface CreatePaymentParams {
  /** Unique order ID from your system (e.g. `ORD-001`). */
  orderId: string;
  /** Payment amount in IDR (e.g. 50000). */
  amount: number;
  /** Payment method. Default: `QRIS` */
  method?: "QRIS" | "EWALLET" | "VA" | string;
  /** Custom metadata. Returned in webhooks as-is. */
  metadata?: Record<string, unknown>;
  /** Note/description for the payment. */
  note?: string;
  /** Invoice expiration in minutes. Default: 15 */
  expireMinutes?: number;
}

export interface CreatePaymentResponse {
  /** Internal reference ID (e.g. `PAY-20260909-ABCD`). Use this for status queries. */
  reference: string;
  /** Your order ID echoed back. */
  order_id: string;
  /** Raw QRIS string (for rendering your own QR). */
  qr_string: string | null;
  /** Pre-rendered QR image URL (SVG/PNG data URI or hosted URL). */
  qr_image_url: string | null;
  /** Payment URL (redirect customer here if available). */
  payment_url: string | null;
  /** Total amount to be paid (may include unique code). */
  total_amount: number;
  /** Unique code added for verification (0 if none). */
  unique_code: number;
  /** Payment method used. */
  method: string;
  /** Provider that handled this payment. */
  provider: string;
  /** Invoice expiration timestamp (ISO 8601). */
  expires_at: string;
  /** Transaction status. */
  status: "PENDING" | "PAID" | "EXPIRED" | "FAILED";
}

// ─── Get Payment ─────────────────────────────────────────────

export interface GetPaymentResponse {
  reference: string;
  order_id: string;
  amount: number;
  unique_amount: number;
  method: string;
  provider: string;
  status: "PENDING" | "PAID" | "EXPIRED" | "FAILED";
  qr_string: string | null;
  qr_image_url: string | null;
  provider_ref: string | null;
  metadata: Record<string, unknown> | null;
  expires_at: string;
  created_at: string;
  updated_at: string;
}

// ─── List Payments ───────────────────────────────────────────

export interface ListPaymentsParams {
  /** Page number (1-based). Default: 1 */
  page?: number;
  /** Results per page. Default: 20, Max: 100 */
  limit?: number;
  /** Filter by status. */
  status?: "PENDING" | "PAID" | "EXPIRED" | "FAILED";
}

export interface ListPaymentsResponse {
  transactions: GetPaymentResponse[];
  total: number;
  page: number;
  limit: number;
}

// ─── Cancel Payment ──────────────────────────────────────────

export interface CancelPaymentResponse {
  reference: string;
  status: "CANCELLED" | "FAILED";
  message: string;
}

// ─── Webhook ─────────────────────────────────────────────────

export interface WebhookPayload {
  reference: string;
  order_id: string;
  status: "PAID" | "EXPIRED" | "FAILED";
  amount: number;
  paid_amount?: number;
  payment_method: string;
  provider: string;
  payer?: string;
  [key: string]: unknown;
}

// ─── SDK Error ───────────────────────────────────────────────

export interface PayGateErrorData {
  status: number;
  error: string;
  data?: unknown;
}
