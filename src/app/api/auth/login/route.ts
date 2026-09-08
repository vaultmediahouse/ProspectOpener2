import { compare } from "bcryptjs";
import { z } from "zod";
import { query } from "@/lib/db";
import { isAdminEmail } from "@/lib/admin";
import { setSession } from "@/lib/session";
import { rateLimit } from "@/lib/rate-limit";
import { logActivity } from "@/lib/activity";

const bodySchema = z.object({ email: z.string().email(), password: z.string().min(1) });

export async function POST(request: Request) {
  if (!rateLimit(`login:${request.headers.get("x-forwarded-for") ?? "unknown"}`, 10)) return Response.json({ error: "Too many attempts. Try again shortly." }, { status: 429 });
  try {
    const body = bodySchema.parse(await request.json());
    const result = await query<{ id: string; name: string; email: string; role: "CUSTOMER" | "ADMIN"; status: string; password_hash: string | null }>(`SELECT id, name, email, role, status, password_hash FROM "Users" WHERE email = $1 LIMIT 1`, [body.email.toLowerCase()]);
    const user = result.rows[0];
    if (!user || user.status !== "ACTIVE" || !user.password_hash || !(await compare(body.password, user.password_hash))) return Response.json({ error: "Invalid email or password." }, { status: 401 });
    const role = user.role === "ADMIN" || isAdminEmail(user.email) ? "ADMIN" : "CUSTOMER";
    await query(`UPDATE "Users" SET last_login_at = NOW(), role = $2 WHERE id = $1`, [user.id, role]);
    await setSession({ userId: user.id, name: user.name, email: user.email, role });
    await logActivity({ actorType: role, actorId: user.id, action: "login", targetType: "Users", targetId: user.id, metadata: { email: user.email } });
    return Response.json({ user: { name: user.name, email: user.email } });
  } catch (error) {
    if (error instanceof z.ZodError) return Response.json({ error: "Enter a valid email and password." }, { status: 400 });
    return Response.json({ error: "Login is unavailable until the database is configured." }, { status: 503 });
  }
}
