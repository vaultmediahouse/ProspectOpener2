import { Suspense } from "react";
import CheckoutForm from "./CheckoutForm";
export default function CheckoutPage(){ return <Suspense fallback={<main className="auth-page"><div className="checkout-card">Loading checkout…</div></main>}><CheckoutForm /></Suspense>; }
