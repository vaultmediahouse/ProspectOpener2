import { headers } from "next/headers";
import { notFound } from "next/navigation";
import { isAdminHost } from "@/lib/host";
import { query } from "@/lib/db";
import { getSession } from "@/lib/session";
import Link from "next/link";

export default async function LeadDetailPage({ params }: { params: Promise<{ id: string }> }) {
  if (!isAdminHost((await headers()).get("host"))) notFound();
  const session = await getSession();
  if (!session || session.role !== "ADMIN") return <main className="auth-page"><div className="auth-card"><div className="section-number">ADMIN ACCESS</div><h1>Sign in as admin.</h1><a href="/login" className="button full">Go to login ↗</a></div></main>;
  const { id } = await params;
  const lead = await query<{ id: string; business_name: string; city: string | null; country: string | null; industry: string | null; website: string | null; business_email: string | null; phone: string | null; contact_name: string | null; source: string | null; verification: string | null; status: string; dedupe_key: string | null }>(`SELECT * FROM "Leads" WHERE id = $1`, [id]);
  if (!lead.rows[0]) notFound();
  return <main className="subpage"><header className="subnav container"><Link href="/leads" className="back-link">← Lead inventory</Link></header><section className="subhero container"><div className="section-number">LEAD DETAIL</div><h1>{lead.rows[0].business_name}</h1><p>{lead.rows[0].city ?? "-"} · {lead.rows[0].country ?? "-"}</p></section><section className="container admin-panel"><dl className="detail-grid"><div><dt>Status</dt><dd>{lead.rows[0].status}</dd></div><div><dt>Industry</dt><dd>{lead.rows[0].industry ?? "-"}</dd></div><div><dt>Website</dt><dd>{lead.rows[0].website ?? "-"}</dd></div><div><dt>Email</dt><dd>{lead.rows[0].business_email ?? "-"}</dd></div><div><dt>Phone</dt><dd>{lead.rows[0].phone ?? "-"}</dd></div><div><dt>Contact</dt><dd>{lead.rows[0].contact_name ?? "-"}</dd></div></dl></section></main>;
}
