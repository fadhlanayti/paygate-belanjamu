// ─── PayGate SDK Client ─────────────────────────────────────
import type {
  PayGateConfig,
  CreatePaymentParams,
  CreatePaymentResponse,
  GetPaymentResponse,
  ListPaymentsParams,
  ListPaymentsResponse,
  CancelPaymentResponse,
} from "./types.js";

const DEFAULT_BASE_URL = "https://pg-be.belanjamu.company/api";
const DEFAULT_TIMEOUT = 15000;

class PayGateError extends Error {
  readonly status: number;
  readonly data?: unknown;

  constructor(message: string, status: number, data?: unknown) {
    super(message);
    this.name = "PayGateError";
    this.status = status;
    this.data = data;
  }
}

export class PayGate {
  private readonly apiKey: string;
  private readonly baseUrl: string;
  private readonly timeout: number;

  constructor(config: PayGateConfig) {
    if (!config.apiKey) throw new Error("PayGate: apiKey is required");
    this.apiKey = config.apiKey;
    this.baseUrl = (config.baseUrl ?? DEFAULT_BASE_URL).replace(/\/$/, "");
    this.timeout = config.timeout ?? DEFAULT_TIMEOUT;
  }

  // ─── Core helpers ─────────────────────────────────────────

  private headers(): Record<string, string> {
    return {
      "X-API-Key": this.apiKey,
      "Content-Type": "application/json",
    };
  }

  private async request<T>(
    method: string,
    path: string,
    body?: unknown,
    extraHeaders?: Record<string, string>,
  ): Promise<T> {
    const url = `${this.baseUrl}${path}`;
    const res = await fetch(url, {
      method,
      headers: { ...this.headers(), ...(extraHeaders ?? {}) },
      body: body !== undefined ? JSON.stringify(body) : undefined,
      signal: AbortSignal.timeout(this.timeout),
    });

    const json = (await res.json().catch(() => ({}))) as { error?: string; data?: T } & T;

    if (!res.ok) {
      const msg = (json as { error?: string }).error ?? `PayGate request failed (${res.status})`;
      throw new PayGateError(msg, res.status, json);
    }

    // API bisa return { data: {...} } atau langsung {...}
    return ((json as { data?: T }).data ?? json) as T;
  }

  // ─── Create Payment ───────────────────────────────────────
  //
  // POST /api/v1/payments
  // Body: { order_id, amount, method, expire_minutes, metadata, note }

  async createPayment(params: CreatePaymentParams): Promise<CreatePaymentResponse> {
    if (!params.orderId) throw new Error("PayGate.createPayment: orderId is required");
    if (!params.amount || params.amount <= 0) throw new Error("PayGate.createPayment: amount must be > 0");

    return this.request<CreatePaymentResponse>("POST", "/v1/payments", {
      order_id: params.orderId,
      amount: params.amount,
      method: params.method ?? "QRIS",
      expire_minutes: params.expireMinutes ?? 15,
      metadata: params.metadata ?? {},
      note: params.note,
    });
  }

  // ─── Get Payment ──────────────────────────────────────────
  //
  // GET /api/v1/payments/:reference

  async getPayment(reference: string): Promise<GetPaymentResponse> {
    if (!reference) throw new Error("PayGate.getPayment: reference is required");
    return this.request<GetPaymentResponse>("GET", `/v1/payments/${reference}`);
  }

  // ─── List Payments ────────────────────────────────────────
  //
  // GET /api/v1/payments?page=&limit=&status=

  async listPayments(params?: ListPaymentsParams): Promise<ListPaymentsResponse> {
    const q = new URLSearchParams({
      page: String(params?.page ?? 1),
      limit: String(params?.limit ?? 20),
    });
    if (params?.status) q.set("status", params.status);
    return this.request<ListPaymentsResponse>("GET", `/v1/payments?${q.toString()}`);
  }

  // ─── Cancel Payment ───────────────────────────────────────
  //
  // POST /api/v1/payments/:reference/cancel

  async cancelPayment(reference: string): Promise<CancelPaymentResponse> {
    if (!reference) throw new Error("PayGate.cancelPayment: reference is required");
    return this.request<CancelPaymentResponse>("POST", `/v1/payments/${reference}/cancel`);
  }
}

export { PayGateError };
