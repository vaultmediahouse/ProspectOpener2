import crypto from "node:crypto";

export type PaymentOrder = { id: string; amount: number; currency: string; receipt: string };

export interface PaymentProvider {
  createOrder(input: { amount: number; currency: string; receipt: string }): Promise<PaymentOrder>;
  verifySignature(input: { orderId: string; paymentId: string; signature: string }): boolean;
}

export class RazorpayProvider implements PaymentProvider {
  async createOrder(input: { amount: number; currency: string; receipt: string }) {
    const key = process.env.RAZORPAY_KEY_ID;
    const secret = process.env.RAZORPAY_KEY_SECRET;
    if (!key || !secret) throw new Error("Payment provider is not configured");
    const response = await fetch("https://api.razorpay.com/v1/orders", { method: "POST", headers: { Authorization: `Basic ${Buffer.from(`${key}:${secret}`).toString("base64")}`, "Content-Type": "application/json" }, body: JSON.stringify({ amount: input.amount * 100, currency: input.currency, receipt: input.receipt, payment_capture: 1 }) });
    if (!response.ok) throw new Error("Payment order creation failed");
    const data = await response.json() as { id: string; amount: number; currency: string };
    return { id: data.id, amount: data.amount, currency: data.currency, receipt: input.receipt };
  }

  verifySignature(input: { orderId: string; paymentId: string; signature: string }) {
    const secret = process.env.RAZORPAY_KEY_SECRET;
    if (!secret) return false;
    const expected = crypto.createHmac("sha256", secret).update(`${input.orderId}|${input.paymentId}`).digest("hex");
    const expectedBuffer = Buffer.from(expected);
    const signatureBuffer = Buffer.from(input.signature);
    return expectedBuffer.length === signatureBuffer.length && crypto.timingSafeEqual(expectedBuffer, signatureBuffer);
  }
}
