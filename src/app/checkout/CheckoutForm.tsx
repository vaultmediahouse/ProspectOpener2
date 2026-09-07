"use client";

import Link from "next/link";
import Script from "next/script";
import { useRouter, useSearchParams } from "next/navigation";
import { useState } from "react";

declare global { interface Window { Razorpay?: new (options: Record<string, unknown>) => { open: () => void }; } }
const plans = { starter: { label: "Starter · 50 leads", amount: "₹499", code: "STARTER" }, growth: { label: "Growth · 100 leads", amount: "₹999", code: "GROWTH" } } as const;

export default function CheckoutForm() {
  const params = useSearchParams(); const router = useRouter(); const key = params.get("plan") === "starter" ? "starter" : "growth"; const plan = plans[key]; const [error, setError] = useState(""); const [loading, setLoading] = useState(false);
  async function begin() {
    setError(""); setLoading(true);
    const response = await fetch("/api/checkout/create", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ plan: plan.code }) });
    const data = await response.json() as { error?: string; orderId?: string; providerOrderId?: string; amount?: number; keyId?: string };
    setLoading(false);
    if (!response.ok) { if (response.status === 401) { router.push(`/login?next=${encodeURIComponent(`/checkout?plan=${key}`)}`); return; } setError(data.error ?? "Unable to start checkout."); return; }
    if (!data.keyId || !data.providerOrderId || !data.orderId || !window.Razorpay) { setError("Payment provider is not configured yet. Please try again after Razorpay is enabled."); return; }
    void fetch("/api/analytics", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ event: "payment_initiated", path: "/checkout" }) });
    const razorpay = new window.Razorpay({ key: data.keyId, amount: data.amount! * 100, currency: "INR", name: "Vault Media House", description: plan.label, order_id: data.providerOrderId, prefill: {}, theme: { color: "#20352d" }, handler: async (payment: { razorpay_payment_id: string; razorpay_order_id: string; razorpay_signature: string }) => { const verified = await fetch("/api/checkout/verify", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ orderId: data.orderId, paymentId: payment.razorpay_payment_id, signature: payment.razorpay_signature }) }); if (verified.ok) { void fetch("/api/analytics", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ event: "payment_completed", path: "/checkout" }) }); window.location.href = process.env.NEXT_PUBLIC_CUSTOMER_APP_URL ?? "https://app.website.com"; } else setError("Payment verification failed. Your order has not been marked paid."); } });
    razorpay.open();
  }
  return <main className="auth-page"><Script src="https://checkout.razorpay.com/v1/checkout.js" strategy="afterInteractive" /><div className="checkout-card"><Link href="/pricing" className="back-link">← Back to packages</Link><div className="section-number">SECURE CHECKOUT</div><h1>One clear step<br /><em>to your next list.</em></h1><div className="checkout-summary"><div><small>SELECTED PACKAGE</small><strong>{plan.label}</strong></div><strong>{plan.amount}</strong></div><p className="checkout-note">Payment status is verified server-side before an order is marked paid. Your order history is preserved separately for every purchase.</p>{error && <p className="form-error" role="alert">{error}</p>}<button onClick={begin} disabled={loading} className="button full">{loading ? "Preparing checkout…" : "Continue to payment ↗"}</button><small className="checkout-foot">One-time payment · No automatic renewal · No monthly commitment</small></div></main>;
}
