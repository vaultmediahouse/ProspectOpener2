import { headers } from "next/headers";
import { notFound } from "next/navigation";
import { isAdminHost } from "@/lib/host";
import { getCustomers } from "@/lib/admin-data";
import { getSession } from "@/lib/session";
import { AdminCustomers } from "@/components/admin/AdminCustomers";

export default async function CustomersPage() {
  if (!isAdminHost((await headers()).get("host"))) notFound();
  const session = await getSession();
  if (!session || session.role !== "ADMIN") return <main className="auth-page"><div className="auth-card"><div className="section-number">ADMIN ACCESS</div><h1>Sign in as admin.</h1><p>Use an approved admin email to access the internal dashboard.</p><a href="/login" className="button full">Go to login ↗</a></div></main>;
  const customers = await getCustomers();
  return <AdminCustomers customers={customers} />;
}
