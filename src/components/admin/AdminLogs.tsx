import { AdminShell } from "./AdminShell";

export function AdminLogs({ logs }: { logs: Array<{ id: string; actor_type: string; action: string; target_type: string | null; target_id: string | null; metadata: string | null; ip_address: string | null; user_agent: string | null; created_at: string }> }) {
  return <AdminShell title="Logs"><div className="admin-panel"><div className="panel-head"><h3>Platform activity</h3></div><div className="admin-table-wrap"><table className="admin-table"><thead><tr><th>Time</th><th>Actor</th><th>Action</th><th>Target</th><th>IP</th></tr></thead><tbody>{logs.map((log) => <tr key={log.id}><td>{new Date(log.created_at).toLocaleString()}</td><td>{log.actor_type}</td><td>{log.action}</td><td>{log.target_type ?? "-"}</td><td>{log.ip_address ?? "-"}</td></tr>)}</tbody></table></div></div></AdminShell>;
}
