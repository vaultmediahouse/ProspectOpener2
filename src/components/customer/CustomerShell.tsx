"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import type { ReactNode } from "react";

export function CustomerShell({
  userName,
  userEmail,
  children,
}: {
  userName: string;
  userEmail: string;
  children: ReactNode;
}) {
  const pathname = usePathname();
  const router = useRouter();

  async function handleLogout() {
    await fetch("/api/auth/logout", { method: "POST" });
    router.push("/login");
  }

  const navItems = [
    { label: "Dashboard", href: "/" },
    { label: "My Leads", href: "/leads" },
    { label: "Orders", href: "/orders" },
    { label: "Settings", href: "/settings" },
  ];

  return (
    <div className="customer-app">
      <header className="customer-header">
        <div className="container customer-header-inner">
          <Link href="/" className="logo">
            <span className="logo-mark">
              <i />
              <i />
              <i />
            </span>
            <span>
              VAULT
              <br />
              <b>CUSTOMER APP</b>
            </span>
          </Link>

          <nav className="customer-nav">
            {navItems.map((item) => {
              const active = pathname === item.href;
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className={`customer-nav-link ${active ? "active" : ""}`}
                >
                  {item.label}
                </Link>
              );
            })}
          </nav>

          <div className="customer-user-menu">
            <a
              href="https://website.com/pricing"
              className="button button-small"
              style={{ padding: "8px 14px", fontSize: "11px" }}
            >
              Buy More Leads ↗
            </a>
            <div className="customer-user-pill">
              <span className="customer-avatar">
                {userName.charAt(0).toUpperCase()}
              </span>
              <div className="customer-user-info">
                <strong>{userName}</strong>
                <small>{userEmail}</small>
              </div>
            </div>
            <button
              onClick={handleLogout}
              className="text-link"
              style={{ fontSize: "11px", background: "none", border: "none", cursor: "pointer" }}
            >
              Log out
            </button>
          </div>
        </div>
      </header>

      <main className="container customer-main">{children}</main>

      <footer className="customer-footer container">
        <span>© 2026 Vault Media House · Verified Lead Marketplace</span>
        <div className="footer-links">
          <a href="https://website.com/how-it-works">How it works</a>
          <a href="https://website.com/terms">Terms</a>
          <a href="https://website.com/privacy">Privacy</a>
        </div>
      </footer>
    </div>
  );
}
