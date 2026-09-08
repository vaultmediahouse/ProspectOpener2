import { headers } from "next/headers";
import { notFound } from "next/navigation";
import { isAdminHost } from "@/lib/host";
import { query } from "@/lib/db";
import { getSession } from "@/lib/session";
import { AdminImports } from "@/components/admin/AdminImports";
import ImportClient from "./upload-client";

export default async function ImportsPage() {
  if (!isAdminHost((await headers()).get("host"))) notFound();
  const session = await getSession();
  if (!session || session.role !== "ADMIN") return <main className="auth-page"><div className="auth-card"><div className="section-number">ADMIN ACCESS</div><h1>Sign in as admin.</h1><a href="/login" className="button full">Go to login ↗</a></div></main>;
  const batches = await query<{ id: string; filename: string; total_rows: number; valid_rows: number; duplicate_rows: number; invalid_rows: number; status: string; created_at: string }>(`SELECT id, filename, total_rows, valid_rows, duplicate_rows, invalid_rows, status, created_at FROM "Imports" ORDER BY created_at DESC LIMIT 50`);
  return <><ImportClient /><AdminImports batches={batches.rows} /></>;
}
