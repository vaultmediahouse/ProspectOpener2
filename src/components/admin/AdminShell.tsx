import Link from "next/link";
import type { ReactNode } from "react";

export function AdminShell({ title, children }: { title: string; children: ReactNode }) {
  return (
    <main className="admin-shell">
      <aside className="admin-sidebar">
        <div>
          <div className="section-number">VAULT MEDIA HOUSE</div>
          <h1>{title}</h1>
        </div>
        <nav className="admin-nav">
          <Link href="/">Dashboard</Link>
          <Link href="/leads">Leads</Link>
          <Link href="/customers">Customers</Link>
          <Link href="/orders">Orders</Link>
          <Link href="/imports">Imports</Link>
          <Link href="/logs">Logs</Link>
          <Link href="/settings">Settings</Link>
        </nav>
      </aside>
      <section className="admin-content">{children}</section>
    </main>
  );
}
