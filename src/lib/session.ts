import { SignJWT, jwtVerify } from "jose";
import { cookies } from "next/headers";

const cookieName = "vault_session";
const secret = new TextEncoder().encode(process.env.SESSION_SECRET ?? "local-development-secret-change-me");

export type Session = { userId: string; email: string; role: "CUSTOMER" | "ADMIN"; name: string };

export async function setSession(session: Session) {
  const token = await new SignJWT(session).setProtectedHeader({ alg: "HS256" }).setIssuedAt().setExpirationTime("7d").sign(secret);
  (await cookies()).set(cookieName, token, { httpOnly: true, secure: process.env.NODE_ENV === "production", sameSite: "lax", path: "/", maxAge: 60 * 60 * 24 * 7 });
}

export async function getSession(): Promise<Session | null> {
  const token = (await cookies()).get(cookieName)?.value;
  if (!token) return null;
  try {
    const { payload } = await jwtVerify(token, secret);
    if (typeof payload.userId !== "string" || typeof payload.email !== "string" || typeof payload.name !== "string") return null;
    return { userId: payload.userId, email: payload.email, name: payload.name, role: payload.role === "ADMIN" ? "ADMIN" : "CUSTOMER" };
  } catch { return null; }
}

export async function clearSession() { (await cookies()).delete(cookieName); }
