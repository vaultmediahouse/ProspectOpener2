import { randomUUID } from "node:crypto";
import { z } from "zod";
import { getSession } from "@/lib/session";
import { query } from "@/lib/db";
import { PLANS, planFromInput } from "@/lib/plans";
import { RazorpayProvider } from "@/lib/payment";

const schema = z.object({ plan: z.string() });

export async function POST(request: Request) {
  const session = await getSession();
  if (!session) return Response.json({ error: "Please sign in before checkout." }, { status: 401 });
  try {
    const parsed = schema.parse(await request.json());
    const code = planFromInput(parsed.plan);
    if (!code) return Response.json({ error: "Invalid package." }, { status: 400 });
    const plan = PLANS[code];
    const dbPlan = await query<{ id: string }>(`SELECT id FROM "Plans" WHERE name = $1 AND active = true LIMIT 1`, [plan.name]);
    if (!dbPlan.rows[0]) return Response.json({ error: "Package is not available." }, { status: 409 });
    const orderId = `ORD-${new Date().getFullYear()}-${randomUUID().slice(0, 8).toUpperCase()}`;
    const order = await query<{ id: string }>(`INSERT INTO "Orders" (id, user_id, plan_id, lead_quantity, amount, currency, payment_status, order_status) VALUES ($1, $2, $3, $4, $5, 'INR', 'PENDING', 'PAYMENT_PENDING') RETURNING id`, [orderId, session.userId, dbPlan.rows[0].id, plan.leadQuantity, plan.amount]);
    const providerOrder = await new RazorpayProvider().createOrder({ amount: plan.amount, currency: "INR", receipt: order.rows[0].id });
    await query(`UPDATE "Orders" SET provider_order_id = $1 WHERE id = $2`, [providerOrder.id, orderId]);
    return Response.json({ orderId, providerOrderId: providerOrder.id, amount: plan.amount, currency: "INR", keyId: process.env.RAZORPAY_KEY_ID });
  } catch (error) {
    if (error instanceof z.ZodError) return Response.json({ error: "Select a valid package." }, { status: 400 });
    return Response.json({ error: "Checkout is not available until the database and payment provider are configured." }, { status: 503 });
  }
}
