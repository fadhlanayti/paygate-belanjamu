// ─── Webhook HMAC-SHA256 Verification ────────────────────────
// Framework-agnostic. Works in Node.js (crypto) and Browser (WebCrypto + fallback).
//
// Merchant usage (Express):
//   app.post("/webhooks/paygate", express.raw({ type: "application/json" }), async (req, res) => {
//     const raw = req.body.toString("utf8");
//     const valid = await verifyWebhook(raw, req.header("X-Signature"), secret);
//     if (!valid) return res.status(401).send("invalid signature");
//     // ... mark order as paid
//     res.json({ status: "ok" });
//   });
//
// Merchant usage (PHP):
//   $valid = hash_equals(hash_hmac("sha256", $rawBody, $secret), $_SERVER["HTTP_X_SIGNATURE"]);

/**
 * Verify an incoming webhook signature using HMAC-SHA256.
 * @param rawBody - The exact raw request body string (before JSON.parse).
 * @param signature - The value of the `X-Signature` header.
 * @param secret - Your webhook secret (from tenant dashboard).
 * @returns true if the signature matches, false otherwise.
 */
export async function verifyWebhook(
  rawBody: string,
  signature: string | null | undefined,
  secret: string,
): Promise<boolean> {
  if (!signature || !secret || !rawBody) return false;

  const expected = await hmacSha256Hex(rawBody, secret);
  return timingSafeEqual(expected.toLowerCase(), String(signature).toLowerCase());
}

// ─── Internal: HMAC-SHA256 (Node + Browser compatible) ──────

async function hmacSha256Hex(message: string, secret: string): Promise<string> {
  // Node.js — detect by checking for node-specific API
  if (typeof process !== "undefined" && typeof process.versions?.node === "string") {
    const { createHmac } = await import("node:crypto");
    return createHmac("sha256", secret).update(message).digest("hex");
  }

  // Browser: WebCrypto (async)
  if (typeof crypto !== "undefined" && typeof crypto.subtle !== "undefined") {
    const enc = new TextEncoder();
    const key = await crypto.subtle.importKey(
      "raw",
      enc.encode(secret),
      { name: "HMAC", hash: "SHA-256" },
      false,
      ["sign"],
    );
    const sig = await crypto.subtle.sign("HMAC", key, enc.encode(message));
    return Array.from(new Uint8Array(sig))
      .map((b) => b.toString(16).padStart(2, "0"))
      .join("");
  }

  throw new Error("No crypto implementation available (need Node.js >=18 or WebCrypto).");
}

/**
 * Constant-time string comparison (prevents timing attacks).
 * DO NOT use `===` for signature comparison — it leaks early-exit timing.
 */
export function timingSafeEqual(a: string, b: string): boolean {
  if (a.length !== b.length) return false;

  let diff = 0;
  for (let i = 0; i < a.length; i++) {
    diff |= a.charCodeAt(i) ^ b.charCodeAt(i);
  }
  return diff === 0;
}
