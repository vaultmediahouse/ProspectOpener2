import { headers } from "next/headers";
import { notFound } from "next/navigation";
import { isAdminHost } from "@/lib/host";
import { query } from "@/lib/db";
import { getSession } from "@/lib/session";
import Link from "next/link";

export default async function CustomerDetailPage({ params }: { params: Promise<{ id: string }> }) {
  if (!isAdminHost((await headers()).get("host"))) notFound();
  const session = await getSession();
  if (!session || session.role !== "ADMIN") return <main className="auth-page"><div className="auth-card"><div className="section-number">ADMIN ACCESS</div><h1>Sign in as admin.</h1><a href="/login" className="button full">Go to login ↗</a></div></main>;
  const { id } = await params;
  const customer = await query<{ id: string; name: string; email: string; created_at: string; last_login_at: string | null; status: string }>(`SELECT id, name, email, created_at, last_login_at, status FROM "Users" WHERE id = $1 AND role = 'CUSTOMER'`, [id]);
  if (!customer.rows[0]) notFound();
  const orders = await query<{ id: string; amount: number; payment_status: string; allocation_status: string; created_at: string }>(`SELECT id, amount, payment_status, allocation_status, created_at FROM "Orders" WHERE user_id = $1 ORDER BY created_at DESC`, [id]);
  return <main className="subpage"><header className="subnav container"><Link href="/customers" className="back-link">← Customers</Link></header><section className="subhero container"><div className="section-number">CUSTOMER DETAIL</div><h1>{customer.rows[0].name}</h1><p>{customer.rows[0].email}</p></section><section className="container admin-panel"><h3>Order history</h3><table className="admin-table"><thead><tr><th>Order</th><th>Amount</th><th>Payment</th><th>Allocation</th></tr></thead><tbody>{orders.rows.map((order) => <tr key={order.id}><td>{order.id}</td><td>₹{order.amount}</td><td>{order.payment_status}</td><td>{order.allocation_status}</td></tr>)}</tbody></table></section></main>;
}
