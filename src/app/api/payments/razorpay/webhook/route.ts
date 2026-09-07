import crypto from "node:crypto";
import { query } from "@/lib/db";

export async function POST(request: Request) {
  const body = await request.text();
  const signature = request.headers.get("x-razorpay-signature");
  const secret = process.env.RAZORPAY_WEBHOOK_SECRET;
  if (!signature || !secret) return Response.json({ error: "Webhook not configured." }, { status: 503 });
  const expected = crypto.createHmac("sha256", secret).update(body).digest("hex");
  if (!crypto.timingSafeEqual(Buffer.from(expected), Buffer.from(signature))) return Response.json({ error: "Invalid signature." }, { status: 401 });
  const event = JSON.parse(body) as { event?: string; payload?: { order?: { entity?: { id?: string } }; payment?: { entity?: { id?: string } } } };
  if (event.event === "payment.captured" && event.payload?.order?.entity?.id) await query(`UPDATE "Orders" SET payment_status = 'PAID', order_status = 'PROCESSING', paid_at = COALESCE(paid_at, NOW()), provider_payment_id = COALESCE(provider_payment_id, $1) WHERE provider_order_id = $2`, [event.payload.payment?.entity?.id ?? null, event.payload.order.entity.id]);
  if (event.event === "payment.failed" && event.payload?.order?.entity?.id) await query(`UPDATE "Orders" SET payment_status = 'FAILED', order_status = 'PAYMENT_FAILED' WHERE provider_order_id = $1 AND payment_status <> 'PAID'`, [event.payload.order.entity.id]);
  return Response.json({ received: true });
}
