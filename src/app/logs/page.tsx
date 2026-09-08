import { headers } from "next/headers";
import { notFound } from "next/navigation";
import { isAdminHost } from "@/lib/host";
import { getLogs } from "@/lib/admin-data";
import { getSession } from "@/lib/session";
import { AdminLogs } from "@/components/admin/AdminLogs";

export default async function LogsPage() {
  if (!isAdminHost((await headers()).get("host"))) notFound();
  const session = await getSession();
  if (!session || session.role !== "ADMIN") return <main className="auth-page"><div className="auth-card"><div className="section-number">ADMIN ACCESS</div><h1>Sign in as admin.</h1><a href="/login" className="button full">Go to login ↗</a></div></main>;
  const logs = await getLogs();
  return <AdminLogs logs={logs} />;
}
