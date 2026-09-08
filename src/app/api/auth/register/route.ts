import { hash } from "bcryptjs";
import { z } from "zod";
import { query } from "@/lib/db";
import { isAdminEmail } from "@/lib/admin";
import { setSession } from "@/lib/session";
import { rateLimit } from "@/lib/rate-limit";
import { logActivity } from "@/lib/activity";

const bodySchema = z.object({ name: z.string().trim().min(2).max(100), email: z.string().email().max(200), password: z.string().min(8).max(100) });

export async function POST(request: Request) {
  if (!rateLimit(`register:${request.headers.get("x-forwarded-for") ?? "unknown"}`, 5)) return Response.json({ error: "Too many attempts. Try again shortly." }, { status: 429 });
  try {
    const body = bodySchema.parse(await request.json());
    const email = body.email.toLowerCase();
    const passwordHash = await hash(body.password, 12);
    const role = isAdminEmail(email) ? "ADMIN" : "CUSTOMER";
    const result = await query<{ id: string; name: string; email: string; role: "CUSTOMER" | "ADMIN" }>(`INSERT INTO "Users" (name, email, password_hash, role) VALUES ($1, $2, $3, $4) RETURNING id, name, email, role`, [body.name, email, passwordHash, role]);
    const user = result.rows[0];
    await setSession({ userId: user.id, name: user.name, email: user.email, role: user.role });
    await logActivity({ actorType: user.role, actorId: user.id, action: "account_created", targetType: "Users", targetId: user.id, metadata: { email: user.email } });
    return Response.json({ user: { name: user.name, email: user.email } }, { status: 201 });
  } catch (error) {
    if (error instanceof z.ZodError) return Response.json({ error: "Please provide a valid name, email, and password of at least 8 characters." }, { status: 400 });
    if (error instanceof Error && error.message.includes("duplicate key")) return Response.json({ error: "An account with that email already exists." }, { status: 409 });
    return Response.json({ error: "Registration is unavailable until the database is configured." }, { status: 503 });
  }
}
