import LoginForm from "./LoginForm";
import { Suspense } from "react";
export default function LoginPage(){ return <Suspense fallback={<main className="auth-page"><div className="auth-card">Loading sign in…</div></main>}><LoginForm /></Suspense>; }
