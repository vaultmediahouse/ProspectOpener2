import Link from "next/link";
import { AdminShell } from "./AdminShell";

export function AdminCustomers({ customers }: { customers: Array<{ id: string; name: string; email: string; created_at: string; last_login_at: string | null; status: string; total_orders: string; total_leads: string; total_spent: string; current_plan: string | null; paid_orders: string }> }) {
  return <AdminShell title="Customers"><div className="admin-panel"><div className="panel-head"><h3>Customer records</h3><Link href="/">Back to dashboard →</Link></div><div className="admin-table-wrap"><table className="admin-table"><thead><tr><th>Name</th><th>Email</th><th>Current plan</th><th>Orders</th><th>Leads</th><th>Spent</th><th>Status</th></tr></thead><tbody>{customers.map((customer) => <tr key={customer.id}><td><Link href={`/customers/${customer.id}`}>{customer.name}</Link></td><td>{customer.email}</td><td>{customer.current_plan ?? "-"}</td><td>{customer.total_orders}</td><td>{customer.total_leads}</td><td>₹{customer.total_spent}</td><td>{customer.status}</td></tr>)}</tbody></table></div></div></AdminShell>;
}
