import RegisterForm from "./RegisterForm";
import { Suspense } from "react";
import { headers } from "next/headers";
import { isAdminHost } from "@/lib/host";
export default async function RegisterPage(){ const host = (await headers()).get("host"); const defaultNext = isAdminHost(host) ? "/" : "/checkout"; return <Suspense fallback={<main className="auth-page"><div className="auth-card">Loading registration…</div></main>}><RegisterForm defaultNext={defaultNext} /></Suspense>; }
