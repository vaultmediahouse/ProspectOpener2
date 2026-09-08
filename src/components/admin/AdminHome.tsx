import Link from "next/link";
import { getDashboardSummary } from "@/lib/admin-data";
import { getSession } from "@/lib/session";
import { AdminShell } from "./AdminShell";

export async function AdminHome() {
  const session = await getSession();
  if (!session || session.role !== "ADMIN") {
    return (
      <main className="auth-page">
        <div className="auth-card">
          <div className="section-number">ADMIN ACCESS</div>
          <h1>Sign in as admin.</h1>
          <p>Use an approved admin email to access the internal dashboard.</p>
          <Link href="/login" className="button full">Go to login ↗</Link>
        </div>
      </main>
    );
  }
  const data = await getDashboardSummary();
  return (
    <AdminShell title="Dashboard">
      <header className="admin-hero">
        <div>
          <div className="section-number">OPERATIONAL VIEW</div>
          <h2>Lead inventory and customer purchases.</h2>
          <p>All figures are calculated from the live database.</p>
        </div>
        {data.leads.low ? <div className="warning-card">Lead inventory running low.</div> : null}
      </header>

      <section className="admin-grid">
        <article className="kpi-card"><span>Customers</span><strong>{data.customers.total}</strong><small>{data.customers.paying} paying · {data.customers.nonPaying} non-paying</small></article>
        <article className="kpi-card"><span>Active / Inactive</span><strong>{data.customers.active} / {data.customers.inactive}</strong><small>Based on latest activity window</small></article>
        <article className="kpi-card"><span>Orders</span><strong>{data.orders.total}</strong><small>{data.orders.paid} paid · {data.orders.pending} pending · {data.orders.failed} failed</small></article>
        <article className="kpi-card"><span>Leads</span><strong>{data.leads.total}</strong><small>{data.leads.available} available · {data.leads.assigned} assigned</small></article>
        <article className="kpi-card"><span>Revenue</span><strong>₹{data.revenue.total}</strong><small>Starter ₹{data.revenue.starter} · Growth ₹{data.revenue.growth}</small></article>
        <article className="kpi-card"><span>Allocation</span><strong>{data.leads.total ? Math.round((data.leads.assigned / data.leads.total) * 100) : 0}%</strong><small>Inventory assigned</small></article>
      </section>

      <section className="admin-panel">
        <div className="panel-head"><h3>Plan breakdown</h3><Link href="/orders">View orders →</Link></div>
        <div className="plan-breakdown">
          {data.plans.map((plan) => (
            <div key={plan.name} className="plan-row">
              <div><b>{plan.name}</b><small>₹{plan.price} · {plan.lead_quantity} leads</small></div>
              <div><strong>{plan.customers}</strong><span>customers</span></div>
              <div><strong>{plan.orders}</strong><span>orders</span></div>
            </div>
          ))}
        </div>
      </section>

      <section className="admin-panel">
        <div className="panel-head"><h3>Recent orders</h3><Link href="/orders">Open order list →</Link></div>
        <div className="admin-table-wrap">
          <table className="admin-table"><thead><tr><th>Order</th><th>Customer</th><th>Plan</th><th>Amount</th><th>Payment</th><th>Allocation</th></tr></thead><tbody>{data.recentOrders.map((row) => <tr key={row.order_id}><td>{row.order_id}</td><td>{row.user_name}</td><td>{row.plan_name}</td><td>₹{row.amount}</td><td>{row.payment_status}</td><td>{row.allocation_status}</td></tr>)}</tbody></table>
        </div>
      </section>
    </AdminShell>
  );
}
