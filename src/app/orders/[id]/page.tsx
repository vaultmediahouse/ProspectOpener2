import { headers } from "next/headers";
import { notFound } from "next/navigation";
import { isAdminHost } from "@/lib/host";
import { query } from "@/lib/db";
import { getSession } from "@/lib/session";
import Link from "next/link";

export default async function OrderDetailPage({ params }: { params: Promise<{ id: string }> }) {
  if (!isAdminHost((await headers()).get("host"))) notFound();
  const session = await getSession();
  if (!session || session.role !== "ADMIN") return <main className="auth-page"><div className="auth-card"><div className="section-number">ADMIN ACCESS</div><h1>Sign in as admin.</h1><a href="/login" className="button full">Go to login ↗</a></div></main>;
  const { id } = await params;
  const order = await query<{ id: string; amount: number; payment_status: string; order_status: string; lead_quantity: number; allocated_at: string | null; created_at: string; user_name: string; plan_name: string }>(`SELECT o.id, o.amount, o.payment_status, o.order_status, o.lead_quantity, o.allocated_at, o.created_at, u.name AS user_name, p.name AS plan_name FROM "Orders" o JOIN "Users" u ON u.id = o.user_id JOIN "Plans" p ON p.id = o.plan_id WHERE o.id = $1`, [id]);
  if (!order.rows[0]) notFound();
  const assignments = await query<{ lead_id: string; status: string; assigned_at: string }>(`SELECT lead_id, status, assigned_at FROM "LeadAssignments" WHERE order_id = $1 ORDER BY assigned_at ASC`, [id]);
  return <main className="subpage"><header className="subnav container"><Link href="/orders" className="back-link">← Orders</Link></header><section className="subhero container"><div className="section-number">ORDER DETAIL</div><h1>{order.rows[0].id}</h1><p>{order.rows[0].user_name} · {order.rows[0].plan_name}</p></section><section className="container admin-panel"><h3>Assigned leads</h3><table className="admin-table"><thead><tr><th>Lead ID</th><th>Status</th><th>Assigned</th></tr></thead><tbody>{assignments.rows.map((assignment) => <tr key={assignment.lead_id}><td>{assignment.lead_id}</td><td>{assignment.status}</td><td>{new Date(assignment.assigned_at).toLocaleString()}</td></tr>)}</tbody></table></section></main>;
}
