import { redirect } from "next/navigation";
import { cookies } from "next/headers";
import { query } from "@/lib/db";
import { setSession } from "@/lib/session";

type GoogleToken = { access_token: string };
type GoogleProfile = { sub: string; name: string; email: string };

export async function GET(request: Request) {
  const code = new URL(request.url).searchParams.get("code");
  const state = new URL(request.url).searchParams.get("state");
  const storedState = (await cookies()).get("vault_oauth_state")?.value;
  const baseUrl = process.env.NEXT_PUBLIC_APP_URL ?? "http://localhost:3000";
  if (!code || !state || !storedState || state !== storedState || !process.env.GOOGLE_CLIENT_ID || !process.env.GOOGLE_CLIENT_SECRET) redirect("/login?error=google_not_configured");
  const tokenResponse = await fetch("https://oauth2.googleapis.com/token", { method: "POST", headers: { "Content-Type": "application/x-www-form-urlencoded" }, body: new URLSearchParams({ code: code!, client_id: process.env.GOOGLE_CLIENT_ID!, client_secret: process.env.GOOGLE_CLIENT_SECRET!, redirect_uri: `${baseUrl}/api/auth/google/callback`, grant_type: "authorization_code" }) });
  if (!tokenResponse.ok) redirect("/login?error=google_failed");
  const token = await tokenResponse.json() as GoogleToken;
  const profileResponse = await fetch("https://openidconnect.googleapis.com/v1/userinfo", { headers: { Authorization: `Bearer ${token.access_token}` } });
  if (!profileResponse.ok) redirect("/login?error=google_failed");
  const profile = await profileResponse.json() as GoogleProfile;
  const result = await query<{ id: string; name: string; email: string; role: "CUSTOMER" | "ADMIN" }>(`INSERT INTO "Users" (name, email, google_id, last_login_at) VALUES ($1, $2, $3, NOW()) ON CONFLICT (email) DO UPDATE SET name = EXCLUDED.name, google_id = EXCLUDED.google_id, last_login_at = NOW() RETURNING id, name, email, role`, [profile.name, profile.email.toLowerCase(), profile.sub]);
  const user = result.rows[0];
  await setSession({ userId: user.id, name: user.name, email: user.email, role: user.role });
  redirect("/checkout");
}
