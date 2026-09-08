"use client";

import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { useState } from "react";

export default function LoginForm({ defaultNext = "/checkout" }: { defaultNext?: string }) {
  const router = useRouter();
  const next = useSearchParams().get("next") ?? defaultNext;
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  async function submit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault(); setError(""); setLoading(true);
    const response = await fetch("/api/auth/login", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ email, password }) });
    const data = await response.json() as { error?: string };
    setLoading(false);
    if (!response.ok) { setError(data.error ?? "Unable to sign in."); return; }
    router.push(next.startsWith("/") && !next.startsWith("//") ? next : "/checkout");
  }

  return <main className="auth-page"><div className="auth-card"><Link href="/" className="back-link">← Vault Media House</Link><div className="section-number">CUSTOMER ACCESS</div><h1>Welcome back.</h1><p>Sign in to manage your packages and access your lead inventory.</p><a href={`/api/auth/google?next=${encodeURIComponent(next)}`} className="google-button">Continue with Google <span>G</span></a><div className="or"><span>or</span></div><form onSubmit={submit}><label>Email address<input required type="email" value={email} onChange={(event) => setEmail(event.target.value)} placeholder="you@studio.com" /></label><label>Password<input required minLength={8} type="password" value={password} onChange={(event) => setPassword(event.target.value)} placeholder="At least 8 characters" /></label>{error && <p className="form-error" role="alert">{error}</p>}<button disabled={loading} className="button full">{loading ? "Signing in…" : "Continue ↗"}</button></form><small>New to Vault? <Link href={`/register?next=${encodeURIComponent(next)}`}>Create an account</Link></small></div></main>;
}
