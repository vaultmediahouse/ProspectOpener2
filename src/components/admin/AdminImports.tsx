import Link from "next/link";
import { AdminShell } from "./AdminShell";

export function AdminImports({ batches }: { batches: Array<{ id: string; filename: string; total_rows: number; valid_rows: number; duplicate_rows: number; invalid_rows: number; status: string; created_at: string }> }) {
  return <AdminShell title="Imports"><div className="admin-panel"><div className="panel-head"><h3>Import batch history</h3><Link href="/imports">Upload CSV →</Link></div><div className="admin-table-wrap"><table className="admin-table"><thead><tr><th>Batch</th><th>Filename</th><th>Total</th><th>Valid</th><th>Duplicates</th><th>Invalid</th><th>Status</th></tr></thead><tbody>{batches.map((batch) => <tr key={batch.id}><td>{batch.id}</td><td>{batch.filename}</td><td>{batch.total_rows}</td><td>{batch.valid_rows}</td><td>{batch.duplicate_rows}</td><td>{batch.invalid_rows}</td><td>{batch.status}</td></tr>)}</tbody></table></div></div></AdminShell>;
}
