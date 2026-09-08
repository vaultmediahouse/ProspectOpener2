import Link from "next/link";
import { getSession } from "@/lib/session";
import { getCustomerDashboard } from "@/lib/customer-data";
import { CustomerShell } from "./CustomerShell";

export async function CustomerHome() {
  const session = await getSession();
  if (!session) {
    return (
      <main className="auth-page">
        <div className="auth-card">
          <div className="section-number">CUSTOMER ACCESS</div>
          <h1>Sign in to your account.</h1>
          <p>Access your purchased leads, inventory downloads, and order history.</p>
          <Link href="/login" className="button full">
            Sign in ↗
          </Link>
        </div>
      </main>
    );
  }

  const data = await getCustomerDashboard(session.userId);

  return (
    <CustomerShell userName={session.name} userEmail={session.email}>
      <div className="customer-dashboard">
        <header className="customer-hero">
          <div>
            <div className="section-number">CUSTOMER DASHBOARD</div>
            <h1>Welcome, {session.name.split(" ")[0]}.</h1>
            <p>Here is your lead inventory, current package, and outreach downloads.</p>
          </div>
          <div className="customer-hero-actions">
            <a
              href="/api/customer/leads/export?format=csv"
              className="button button-light"
              style={{ textDecoration: "none" }}
            >
              Download Leads (CSV) ↓
            </a>
            <Link href="/leads" className="button">
              View My Leads ↗
            </Link>
          </div>
        </header>

        {data.hasPendingAllocation && (
          <div className="warning-card" style={{ marginBottom: "24px" }}>
            <strong>Your leads are being prepared.</strong> We have verified your payment and
            are currently allocating unique prospects to your dashboard. This usually takes just
            a few moments.
          </div>
        )}

        {data.totalPurchased === 0 ? (
          <div className="customer-empty-panel">
            <div className="section-number">NO LEADS YET</div>
            <h2>You haven’t received any leads yet.</h2>
            <p>
              Purchase a verified lead package to receive structured business prospects ready for your
              outreach. No recurring subscriptions or commitments.
            </p>
            <div style={{ marginTop: "24px", display: "flex", gap: "16px" }}>
              <a href="https://website.com/pricing" className="button">
                Browse Lead Packages ↗
              </a>
              <a href="https://website.com/how-it-works" className="text-link">
                Learn how it works ↗
              </a>
            </div>
          </div>
        ) : (
          <>
            {/* Primary KPI Containers */}
            <div className="customer-kpi-grid">
              {/* Container 1: Current Plan */}
              <div className="customer-card">
                <span className="customer-card-label">CONTAINER 01 / CURRENT PLAN</span>
                {data.currentPlan ? (
                  <>
                    <h2 className="customer-plan-name">{data.currentPlan.name}</h2>
                    <div className="customer-plan-details">
                      <strong>{data.currentPlan.leadQuantity} Leads</strong>
                      <span>·</span>
                      <span>₹{data.currentPlan.amount}</span>
                    </div>
                    <small className="customer-plan-sub">
                      Latest verified purchase · Order #{data.currentPlan.orderId.slice(0, 8)}
                    </small>
                  </>
                ) : (
                  <p style={{ color: "var(--muted)", margin: "14px 0" }}>No active plan found.</p>
                )}
              </div>

              {/* Container 2: Total Leads Purchased */}
              <div className="customer-card featured">
                <span className="customer-card-label">CONTAINER 02 / TOTAL LEADS</span>
                <strong className="customer-huge-number">{data.totalPurchased}</strong>
                <div className="customer-plan-details" style={{ color: "#d9e2d7" }}>
                  <span>{data.totalAssigned} Assigned to dashboard</span>
                  {data.hasPendingAllocation && <span> · Allocation in progress</span>}
                </div>
                <small style={{ color: "#9cb19e", marginTop: "8px", display: "block" }}>
                  Cumulative leads purchased across all orders
                </small>
              </div>

              {/* Container 3: Quick Outreach Stats */}
              <div className="customer-card">
                <span className="customer-card-label">CONTAINER 03 / ACTIONS</span>
                <h3 style={{ fontSize: "16px", margin: "16px 0 8px" }}>Work Your Pipeline</h3>
                <p style={{ fontSize: "12px", color: "var(--muted)", lineHeight: 1.6 }}>
                  Export your leads into your favourite outreach tool, CRM, or spreadsheet.
                </p>
                <div style={{ marginTop: "18px", display: "flex", gap: "10px" }}>
                  <Link href="/leads" className="button button-small">
                    Explore List →
                  </Link>
                  <a
                    href="https://website.com/pricing"
                    className="button button-small button-light"
                  >
                    Buy More
                  </a>
                </div>
              </div>
            </div>

            {/* Recent Leads Preview */}
            <div className="customer-panel">
              <div className="panel-head">
                <div>
                  <h3 style={{ margin: 0, fontSize: "18px" }}>Recently Assigned Leads</h3>
                  <small style={{ color: "var(--muted)", fontSize: "12px" }}>
                    Showing {data.recentLeads.length} of {data.totalAssigned} assigned prospects
                  </small>
                </div>
                <Link href="/leads" className="text-link">
                  View all leads →
                </Link>
              </div>

              {data.recentLeads.length === 0 ? (
                <p style={{ color: "var(--muted)", padding: "20px 0" }}>
                  Leads are being assigned. Please refresh in a moment.
                </p>
              ) : (
                <div className="admin-table-wrap">
                  <table className="admin-table">
                    <thead>
                      <tr>
                        <th>Company</th>
                        <th>Industry</th>
                        <th>Location</th>
                        <th>Website</th>
                        <th>Email</th>
                        <th>Contact</th>
                      </tr>
                    </thead>
                    <tbody>
                      {data.recentLeads.map((lead) => (
                        <tr key={lead.id}>
                          <td>
                            <strong>{lead.businessName}</strong>
                          </td>
                          <td>{lead.industry || "—"}</td>
                          <td>
                            {[lead.city, lead.country].filter(Boolean).join(", ") || "—"}
                          </td>
                          <td>
                            {lead.website ? (
                              <a
                                href={
                                  lead.website.startsWith("http")
                                    ? lead.website
                                    : `https://${lead.website}`
                                }
                                target="_blank"
                                rel="noreferrer"
                                style={{ color: "var(--forest)", textDecoration: "underline" }}
                              >
                                {lead.website.replace(/^https?:\/\//, "").slice(0, 24)}
                              </a>
                            ) : (
                              "—"
                            )}
                          </td>
                          <td>{lead.email || "—"}</td>
                          <td>{lead.contactName || "—"}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>

            {/* Recent Order History Summary */}
            <div className="customer-panel">
              <div className="panel-head">
                <h3 style={{ margin: 0, fontSize: "18px" }}>Order History</h3>
                <Link href="/orders" className="text-link">
                  All orders →
                </Link>
              </div>
              <div className="admin-table-wrap">
                <table className="admin-table">
                  <thead>
                    <tr>
                      <th>Order ID</th>
                      <th>Plan</th>
                      <th>Leads</th>
                      <th>Amount</th>
                      <th>Payment</th>
                      <th>Status</th>
                      <th>Date</th>
                    </tr>
                  </thead>
                  <tbody>
                    {data.recentOrders.map((ord) => (
                      <tr key={ord.id}>
                        <td>
                          <code>{ord.id}</code>
                        </td>
                        <td>
                          <strong>{ord.planName}</strong>
                        </td>
                        <td>{ord.leadQuantity}</td>
                        <td>₹{ord.amount}</td>
                        <td>
                          <span
                            className={
                              ord.paymentStatus === "PAID"
                                ? "status-pill"
                                : "status-pill muted"
                            }
                          >
                            <i /> {ord.paymentStatus}
                          </span>
                        </td>
                        <td>{ord.allocationStatus}</td>
                        <td>{new Date(ord.createdAt).toLocaleDateString()}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </>
        )}
      </div>
    </CustomerShell>
  );
}
