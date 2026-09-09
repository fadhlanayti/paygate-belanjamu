import { describe, it, expect } from "vitest";
import { verifyWebhook, timingSafeEqual } from "./webhook.js";
import crypto from "node:crypto";

describe("verifyWebhook", () => {
  const secret = "whsec_test123";
  const body = JSON.stringify({ order_id: "ORD-001", amount: 50000 });

  it("accepts valid signature", async () => {
    const sig = crypto.createHmac("sha256", secret).update(body).digest("hex");
    expect(await verifyWebhook(body, sig, secret)).toBe(true);
  });

  it("rejects tampered body", async () => {
    const sig = crypto.createHmac("sha256", secret).update(body).digest("hex");
    const tampered = JSON.stringify({ order_id: "ORD-001", amount: 500 });
    expect(await verifyWebhook(tampered, sig, secret)).toBe(false);
  });

  it("rejects wrong signature", async () => {
    expect(await verifyWebhook(body, "deadbeef", secret)).toBe(false);
  });

  it("rejects empty inputs", async () => {
    expect(await verifyWebhook("", null, secret)).toBe(false);
    expect(await verifyWebhook(body, "abc", "")).toBe(false);
  });
});

describe("timingSafeEqual", () => {
  it("equal strings match", () => {
    expect(timingSafeEqual("abc123", "abc123")).toBe(true);
  });

  it("different strings fail", () => {
    expect(timingSafeEqual("abc123", "abc124")).toBe(false);
  });

  it("different lengths fail", () => {
    expect(timingSafeEqual("abc", "abcd")).toBe(false);
  });
});
