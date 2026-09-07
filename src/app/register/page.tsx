import RegisterForm from "./RegisterForm";
import { Suspense } from "react";
export default function RegisterPage(){ return <Suspense fallback={<main className="auth-page"><div className="auth-card">Loading registration…</div></main>}><RegisterForm /></Suspense>; }
