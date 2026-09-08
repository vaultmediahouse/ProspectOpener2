import Link from "next/link";
import { headers } from "next/headers";
import { isAdminHost, isCustomerHost } from "@/lib/host";
import { AdminLeads } from "@/components/admin/AdminLeads";
import { CustomerLeads } from "@/components/customer/CustomerLeads";
import { query } from "@/lib/db";
import { getSession } from "@/lib/session";
import { getCustomerLeads } from "@/lib/customer-data";

const included = [
  "Business/company name",
  "Industry and location",
  "Website, when available",
  "Business email, when available",
  "Phone number, when available",
  "Decision-maker/contact name, when available",
  "Source and verification information",
];

export default async function LeadsPage({
  searchParams,
}: {
  searchParams?: Promise<{ offset?: string; q?: string }>;
}) {
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
    const leads = await query<{
      id: string;
      business_name: string;
      city: string | null;
      country: string | null;
      industry: string | null;
      source: string | null;
      status: string;
      import_batch_id: string | null;
    }>(
      `SELECT id, business_name, city, country, industry, source, status, import_batch_id FROM "Leads" ORDER BY created_at DESC LIMIT 200`,
    );
    const summary = await query<{ total: string; available: string; assigned: string }>(
      `SELECT COUNT(*)::text AS total, COUNT(*) FILTER (WHERE status = 'AVAILABLE')::text AS available, COUNT(*) FILTER (WHERE status = 'ASSIGNED')::text AS assigned FROM "Leads"`,
    );
    return (
      <AdminLeads
        leads={leads.rows}
        summary={{
          total: Number(summary.rows[0].total),
          available: Number(summary.rows[0].available),
          assigned: Number(summary.rows[0].assigned),
        }}
      />
    );
  }

  if (isCustomerHost(host)) {
    const session = await getSession();
    if (!session) {
      return (
        <main className="auth-page">
          <div className="auth-card">
            <div className="section-number">CUSTOMER ACCESS</div>
            <h1>Sign in to view your leads.</h1>
            <p>Access your purchased business prospects and download your inventory.</p>
            <Link href="/login?next=/leads" className="button full">
              Sign in ↗
            </Link>
          </div>
        </main>
      );
    }

    const params = (await searchParams) ?? {};
    const offset = Number(params.offset ?? 0) || 0;
    const q = params.q?.trim() ?? "";
    const result = await getCustomerLeads(session.userId, { limit: 25, offset, search: q });

    return (
      <CustomerLeads
        userName={session.name}
        userEmail={session.email}
        leads={result.leads}
        total={result.total}
        limit={result.limit}
        offset={result.offset}
        searchQuery={q}
      />
    );
  }

  return (
    <main className="subpage">
      <header className="subnav container">
        <Link href="/" className="back-link">
          ← Vault Media House
        </Link>
        <Link href="/pricing" className="text-link">
          Get leads ↗
        </Link>
      </header>
      <section className="subhero container">
        <div className="section-number">INSIDE THE RECORD</div>
        <h1>
          Useful context.
          <br />
          <em>Not clutter.</em>
        </h1>
        <p>
          Each lead is designed to give you enough signal to decide whether a thoughtful, relevant
          outreach message makes sense.
        </p>
      </section>
      <section className="container lead-info-grid">
        <div className="lead-sample lead-card">
          <div className="card-top">
            <span className="status-pill">
              <i /> VERIFIED LEAD
            </span>
            <span className="card-id">#VMH-00842</span>
          </div>
          <h2>Sharma & Sons Trading Co.</h2>
          <p>Wholesale · Pune, Maharashtra</p>
          <div className="lead-details">
            <div>
              <small>WEBSITE</small>
              <strong>sharmasons.co.in</strong>
            </div>
            <div>
              <small>CONTACT</small>
              <strong>Available</strong>
            </div>
          </div>
          <div className="intent">
            <span>VERIFICATION NOTE</span>
            <strong>Information checked against public business sources.</strong>
          </div>
        </div>
        <div>
          <div className="section-number">POTENTIAL FIELDS</div>
          <div className="included-list">
            {included.map((item, i) => (
              <div key={item}>
                <span>0{i + 1}</span>
                <b>{item}</b>
                <small>When available and relevant</small>
              </div>
            ))}
          </div>
        </div>
      </section>
      <section className="container disclosure">
        <b>A note on availability</b>
        <p>
          Lead fields may vary depending on publicly available business information. Vault does not
          promise that every record will contain every field, or that a prospect will respond.
        </p>
      </section>
    </main>
  );
}
