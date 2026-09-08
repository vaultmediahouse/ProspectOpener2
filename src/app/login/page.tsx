import LoginForm from "./LoginForm";
import { Suspense } from "react";
import { headers } from "next/headers";
import { isAdminHost } from "@/lib/host";
export default async function LoginPage(){ const host = (await headers()).get("host"); const defaultNext = isAdminHost(host) ? "/" : "/checkout"; return <Suspense fallback={<main className="auth-page"><div className="auth-card">Loading sign in…</div></main>}><LoginForm defaultNext={defaultNext} /></Suspense>; }
