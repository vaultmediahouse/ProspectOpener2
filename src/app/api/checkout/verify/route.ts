import { z } from "zod";
import { getSession } from "@/lib/session";
import { query } from "@/lib/db";
import { RazorpayProvider } from "@/lib/payment";

const schema = z.object({ orderId: z.string(), paymentId: z.string(), signature: z.string() });

export async function POST(request: Request) {
  const session = await getSession();
  if (!session) return Response.json({ error: "Session expired." }, { status: 401 });
  try {
    const input = schema.parse(await request.json());
    const order = await query<{ id: string; provider_order_id: string | null }>(`SELECT id, provider_order_id FROM "Orders" WHERE id = $1 AND user_id = $2 LIMIT 1`, [input.orderId, session.userId]);
    if (!order.rows[0] || order.rows[0].provider_order_id === null) return Response.json({ error: "Order not found." }, { status: 404 });
    const valid = new RazorpayProvider().verifySignature({ orderId: order.rows[0].provider_order_id, paymentId: input.paymentId, signature: input.signature });
    if (!valid) return Response.json({ error: "Payment verification failed." }, { status: 400 });
    await query(`UPDATE "Orders" SET payment_status = 'PAID', order_status = 'PROCESSING', paid_at = NOW(), provider_payment_id = $1, provider_signature = $2 WHERE id = $3 AND payment_status <> 'PAID'`, [input.paymentId, input.signature, input.orderId]);
    return Response.json({ ok: true, redirectUrl: process.env.CUSTOMER_APP_URL ?? "https://app.website.com" });
  } catch (error) {
    if (error instanceof z.ZodError) return Response.json({ error: "Invalid payment response." }, { status: 400 });
    return Response.json({ error: "Payment verification is unavailable." }, { status: 503 });
  }
}
