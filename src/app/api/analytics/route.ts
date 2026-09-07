import { z } from "zod";
import { rateLimit } from "@/lib/rate-limit";

const eventSchema = z.object({ event: z.enum(["page_view", "pricing_view", "cta_click", "registration_started", "registration_completed", "checkout_started", "payment_initiated", "payment_completed", "purchase_completed", "login", "lead_dashboard_visit"]), path: z.string().max(200).optional() });

export async function POST(request: Request) {
  if (!rateLimit(`analytics:${request.headers.get("x-forwarded-for") ?? "unknown"}`, 60)) return Response.json({ ok: false }, { status: 429 });
  try { eventSchema.parse(await request.json()); return Response.json({ ok: true }, { status: 202 }); } catch { return Response.json({ error: "Invalid event." }, { status: 400 }); }
}
