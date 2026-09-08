import Link from "next/link";
import { AdminShell } from "./AdminShell";

export function AdminOrders({ orders }: { orders: Array<{ id: string; user_name: string; user_email: string; plan_name: string; lead_quantity: number; amount: number; payment_status: string; allocation_status: string; created_at: string; paid_at: string | null; allocated_at: string | null; assigned_leads: string }> }) {
  return <AdminShell title="Orders"><div className="admin-panel"><div className="panel-head"><h3>Order monitoring</h3><Link href="/">Back to dashboard →</Link></div><div className="admin-table-wrap"><table className="admin-table"><thead><tr><th>Order</th><th>Customer</th><th>Plan</th><th>Leads</th><th>Amount</th><th>Payment</th><th>Allocation</th></tr></thead><tbody>{orders.map((order) => <tr key={order.id}><td><Link href={`/orders/${order.id}`}>{order.id}</Link></td><td>{order.user_name}</td><td>{order.plan_name}</td><td>{order.lead_quantity}</td><td>₹{order.amount}</td><td>{order.payment_status}</td><td>{order.allocation_status}</td></tr>)}</tbody></table></div></div></AdminShell>;
}
