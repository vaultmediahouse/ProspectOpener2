import { redirect } from "next/navigation";
import crypto from "node:crypto";
import { cookies } from "next/headers";

export async function GET() {
  const clientId = process.env.GOOGLE_CLIENT_ID;
  const baseUrl = process.env.NEXT_PUBLIC_APP_URL ?? "http://localhost:3000";
  if (!clientId) return Response.json({ error: "Google authentication is not configured." }, { status: 503 });
  const state = crypto.randomBytes(32).toString("hex");
  (await cookies()).set("vault_oauth_state", state, { httpOnly: true, secure: process.env.NODE_ENV === "production", sameSite: "lax", path: "/", maxAge: 600 });
  const params = new URLSearchParams({ client_id: clientId, redirect_uri: `${baseUrl}/api/auth/google/callback`, response_type: "code", scope: "openid email profile", access_type: "offline", prompt: "select_account", state });
  redirect(`https://accounts.google.com/o/oauth2/v2/auth?${params}`);
}
