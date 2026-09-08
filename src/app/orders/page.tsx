import Link from "next/link";
import { headers } from "next/headers";
import { notFound } from "next/navigation";
import { isAdminHost, isCustomerHost } from "@/lib/host";
import { getSession } from "@/lib/session";
import { getOrders } from "@/lib/admin-data";
import { getCustomerOrders } from "@/lib/customer-data";
import { AdminOrders } from "@/components/admin/AdminOrders";
import { CustomerShell } from "@/components/customer/CustomerShell";

export default async function OrdersPage() {
  const host = (await headers()).get("host");

  if (isAdminHost(host)) {
    const session = await getSession();
    if (!session || session.role !== "ADMIN") {
      return (
        <main className="auth-page">
          <div className="auth-card">
            <div className="section-number">ADMIN ACCESS</div>
            <h1>Sign in as admin.</h1>
            <a href="/login" className="button full">
              Go to login ↗
            </a>
          </div>
        </main>
      );
    }
    const orders = await getOrders();
    return <AdminOrders orders={orders} />;
  }

  if (isCustomerHost(host)) {
    const session = await getSession();
    if (!session) {
      return (
        <main className="auth-page">
          <div className="auth-card">
            <div className="section-number">CUSTOMER ACCESS</div>
            <h1>Sign in to view your orders.</h1>
            <p>Access your purchase history, package details, and allocation status.</p>
            <Link href="/login?next=/orders" className="button full">
              Sign in ↗
            </Link>
          </div>
        </main>
      );
    }

    const orders = await getCustomerOrders(session.userId);

    return (
      <CustomerShell userName={session.name} userEmail={session.email}>
        <div className="customer-dashboard">
          <header className="customer-hero">
            <div>
              <div className="section-number">PURCHASE HISTORY</div>
              <h1>Your Orders</h1>
              <p>
                {orders.length === 0
                  ? "You have no purchases yet."
                  : `${orders.length} order${orders.length === 1 ? "" : "s"} on record.`}
              </p>
            </div>
            <div className="customer-hero-actions">
              <a href={`${process.env.NEXT_PUBLIC_APP_URL}/pricing`} className="button">
                Buy More Leads ↗
              </a>
            </div>
          </header>

          {orders.length === 0 ? (
            <div className="customer-empty-panel">
              <div className="section-number">NO PURCHASES YET</div>
              <h2>You haven’t purchased any lead packages.</h2>
              <p>
                Choose a one-time package to receive verified business leads assigned to your
                account. There are no subscriptions or recurring plans.
              </p>
              <div style={{ marginTop: "24px", display: "flex", gap: "16px" }}>
                <a href="https://website.com/pricing" className="button">
                  Browse Lead Packages ↗
                </a>
                <Link href="/" className="text-link">
                  Back to Dashboard
                </Link>
              </div>
            </div>
          ) : (
            <div className="customer-panel">
              <div className="admin-table-wrap">
                <table className="admin-table">
                  <thead>
                    <tr>
                      <th>Order ID</th>
                      <th>Plan</th>
                      <th>Leads</th>
                      <th>Amount</th>
                      <th>Payment</th>
                      <th>Allocation</th>
                      <th>Purchase Date</th>
                    </tr>
                  </thead>
                  <tbody>
                    {orders.map((ord) => (
                      <tr key={ord.id}>
                        <td>
                          <code style={{ fontSize: "11px" }}>{ord.id.slice(0, 16)}</code>
                        </td>
                        <td>
                          <strong style={{ color: "var(--forest)" }}>{ord.planName}</strong>
                        </td>
                        <td>{ord.leadQuantity}</td>
                        <td>₹{ord.amount}</td>
                        <td>
                          <span className={`status-pill ${ord.paymentStatus !== "PAID" ? "muted" : ""}`}>
                            <i /> {ord.paymentStatus}
                          </span>
                        </td>
                        <td>
                          {ord.allocationStatus === "ALLOCATED" ? (
                            <span className="status-pill">
                              <i /> {ord.allocationStatus}
                            </span>
                          ) : ord.paymentStatus === "PAID" ? (
                            <span style={{ color: "#a36b63", fontSize: "11px" }}>
                              Being prepared…
                            </span>
                          ) : (
                            <span style={{ color: "var(--muted)", fontSize: "11px" }}>
                              {ord.allocationStatus}
                            </span>
                          )}
                        </td>
                        <td>
                          {ord.createdAt
                            ? new Date(ord.createdAt).toLocaleDateString(undefined, { day: "2-digit", month: "short", year: "numeric" })
                            : "—"}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </div>
      </CustomerShell>
    );
  }

  notFound();
}