import Link from "next/link";
import { CustomerShell } from "./CustomerShell";

export type CustomerLeadItem = {
  id: string;
  businessName: string;
  industry: string | null;
  country: string | null;
  city: string | null;
  website: string | null;
  email: string | null;
  phone: string | null;
  contactName: string | null;
  verification: string | null;
  assignedAt: string;
};

export function CustomerLeads({
  userName,
  userEmail,
  leads,
  total,
  limit,
  offset,
  searchQuery,
}: {
  userName: string;
  userEmail: string;
  leads: CustomerLeadItem[];
  total: number;
  limit: number;
  offset: number;
  searchQuery: string;
}) {
  const currentPage = Math.floor(offset / limit) + 1;
  const totalPages = Math.max(1, Math.ceil(total / limit));
  const prevOffset = Math.max(0, offset - limit);
  const nextOffset = offset + limit;
  const hasPrev = offset > 0;
  const hasNext = nextOffset < total;

  return (
    <CustomerShell userName={userName} userEmail={userEmail}>
      <div className="customer-dashboard">
        <header className="customer-hero">
          <div>
            <div className="section-number">INVENTORY ACCESS</div>
            <h1>My Assigned Leads</h1>
            <p>
              {total === 0
                ? "No leads assigned yet."
                : `Showing ${leads.length} of ${total} verified prospects assigned to your account.`}
            </p>
          </div>
          {total > 0 && (
            <div className="customer-hero-actions">
              <a
                href="/api/customer/leads/export?format=csv"
                className="button button-light"
                download
              >
                Download CSV ↓
              </a>
              <a
                href="/api/customer/leads/export?format=xlsx"
                className="button"
                style={{ background: "#2d4a3f" }}
                download
              >
                Excel / XLSX ↓
              </a>
            </div>
          )}
        </header>

        {total === 0 && !searchQuery ? (
          <div className="customer-empty-panel">
            <div className="section-number">NO LEADS ASSIGNED</div>
            <h2>You haven’t received any leads yet.</h2>
            <p>
              Once you purchase a lead package and payment is confirmed, Vault Media House assigns
              unique leads directly to your inventory.
            </p>
            <div style={{ marginTop: "24px", display: "flex", gap: "16px" }}>
              <a href="https://website.com/pricing" className="button">
                Browse Lead Packages ↗
              </a>
              <Link href="/" className="text-link">
                Back to Dashboard ↗
              </Link>
            </div>
          </div>
        ) : (
          <div className="customer-panel">
            <div className="panel-head" style={{ flexWrap: "wrap", gap: "16px" }}>
              <form method="GET" action="/leads" style={{ display: "flex", gap: "8px", flex: 1, maxWidth: "420px" }}>
                <input
                  type="text"
                  name="q"
                  defaultValue={searchQuery}
                  placeholder="Search by company, city, or industry..."
                  style={{
                    flex: 1,
                    padding: "8px 12px",
                    border: "1px solid var(--line)",
                    fontSize: "12px",
                    background: "#fcfdfb",
                  }}
                />
                <button type="submit" className="button button-small" style={{ padding: "8px 14px" }}>
                  Search
                </button>
                {searchQuery && (
                  <Link
                    href="/leads"
                    className="button button-small button-light"
                    style={{ padding: "8px 12px" }}
                  >
                    Clear
                  </Link>
                )}
              </form>

              <div style={{ fontSize: "12px", color: "var(--muted)", display: "flex", alignItems: "center" }}>
                Page {currentPage} of {totalPages} ({total} total)
              </div>
            </div>

            {leads.length === 0 ? (
              <div style={{ padding: "40px 0", textAlign: "center", color: "var(--muted)" }}>
                <p style={{ margin: 0, fontSize: "14px" }}>No prospects matched your search query &quot;{searchQuery}&quot;.</p>
                <Link href="/leads" className="text-link" style={{ display: "inline-block", marginTop: "12px" }}>
                  Reset search filter
                </Link>
              </div>
            ) : (
              <div className="admin-table-wrap">
                <table className="admin-table">
                  <thead>
                    <tr>
                      <th>Business</th>
                      <th>Industry</th>
                      <th>Location</th>
                      <th>Website</th>
                      <th>Email</th>
                      <th>Phone</th>
                      <th>Decision Maker</th>
                      <th>Verification Note</th>
                    </tr>
                  </thead>
                  <tbody>
                    {leads.map((lead) => (
                      <tr key={lead.id}>
                        <td>
                          <strong style={{ color: "var(--forest)" }}>{lead.businessName}</strong>
                          <small style={{ display: "block", color: "var(--muted)", fontSize: "10px" }}>
                            Assigned {new Date(lead.assignedAt).toLocaleDateString()}
                          </small>
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
                        <td>
                          {lead.email ? (
                            <a href={`mailto:${lead.email}`} style={{ color: "inherit" }}>
                              {lead.email}
                            </a>
                          ) : (
                            "—"
                          )}
                        </td>
                        <td>
                          {lead.phone ? (
                            <a href={`tel:${lead.phone}`} style={{ color: "inherit" }}>
                              {lead.phone}
                            </a>
                          ) : (
                            "—"
                          )}
                        </td>
                        <td>{lead.contactName || "—"}</td>
                        <td style={{ maxWidth: "220px", fontSize: "11px", color: "var(--muted)" }}>
                          {lead.verification || "Validated by Vault"}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}

            {totalPages > 1 && (
              <div
                style={{
                  display: "flex",
                  justifyContent: "space-between",
                  alignItems: "center",
                  marginTop: "20px",
                  paddingTop: "16px",
                  borderTop: "1px solid var(--line)",
                }}
              >
                <div>
                  {hasPrev ? (
                    <Link
                      href={`/leads?offset=${prevOffset}&q=${encodeURIComponent(searchQuery)}`}
                      className="button button-small button-light"
                    >
                      ← Previous
                    </Link>
                  ) : (
                    <span
                      className="button button-small button-light"
                      style={{ opacity: 0.4, cursor: "not-allowed" }}
                    >
                      ← Previous
                    </span>
                  )}
                </div>
                <span style={{ fontSize: "12px", color: "var(--muted)" }}>
                  Page {currentPage} of {totalPages}
                </span>
                <div>
                  {hasNext ? (
                    <Link
                      href={`/leads?offset=${nextOffset}&q=${encodeURIComponent(searchQuery)}`}
                      className="button button-small button-light"
                    >
                      Next →
                    </Link>
                  ) : (
                    <span
                      className="button button-small button-light"
                      style={{ opacity: 0.4, cursor: "not-allowed" }}
                    >
                      Next →
                    </span>
                  )}
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    </CustomerShell>
  );
}
