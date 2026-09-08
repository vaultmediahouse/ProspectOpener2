import { z } from "zod";
import { requireAdmin } from "@/lib/authorization";
import { allocateOrder } from "@/lib/admin-data";

const schema = z.object({ orderId: z.string().min(1) });

export async function POST(request: Request) {
  try {
    const admin = await requireAdmin();
    const { orderId } = schema.parse(await request.json());
    return Response.json(await allocateOrder(orderId, admin.userId));
  } catch (error) {
    if (error instanceof z.ZodError) return Response.json({ error: "Invalid order id." }, { status: 400 });
    if (error instanceof Error && error.message === "FORBIDDEN") return Response.json({ error: "Forbidden." }, { status: 403 });
    if (error instanceof Error && error.message === "UNAUTHENTICATED") return Response.json({ error: "Session expired." }, { status: 401 });
    return Response.json({ error: "Unable to allocate leads." }, { status: 503 });
  }
}
