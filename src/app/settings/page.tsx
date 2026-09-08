import { headers } from "next/headers";
import { notFound } from "next/navigation";
import { isAdminHost, isCustomerHost } from "@/lib/host";
import { AdminSettings } from "@/components/admin/AdminSettings";
import { CustomerShell } from "@/components/customer/CustomerShell";
import { CustomerSettings, type CustomerProfile } from "@/components/customer/CustomerSettings";
import { getSession } from "@/lib/session";
import { getCustomerProfile } from "@/lib/customer-data";

export default async function SettingsPage() {
  const host = (await headers()).get("host");

  if (isAdminHost(host)) {
    const session = await getSession();
    if (!session || session.role !== "ADMIN") {
      return (
        <main className="auth-page">
          <div className="auth-card">
            <div className="section-number">ADMIN ACCESS</div>
            <h1>Sign in as admin.</h1>
            <a href="/login" className="button full">
              Go to login ↗
            </a>
          </div>
        </main>
      );
    }
    return <AdminSettings />;
  }

  if (isCustomerHost(host)) {
    const session = await getSession();
    if (!session) {
      return (
        <main className="auth-page">
          <div className="auth-card">
            <div className="section-number">CUSTOMER ACCESS</div>
            <h1>Sign in to access settings.</h1>
            <a href="/login?next=/settings" className="button full">
              Sign in ↗
            </a>
          </div>
        </main>
      );
    }

    const profile = await getCustomerProfile(session.userId);
    if (!profile) notFound();

    return (
      <CustomerShell userName={session.name} userEmail={session.email}>
        <div className="customer-dashboard">
          <header className="customer-hero">
            <div>
              <div className="section-number">ACCOUNT SETTINGS</div>
              <h1>Profile & Security</h1>
              <p>Manage your account details, password, and security preferences.</p>
            </div>
          </header>
          <CustomerSettings profile={profile as CustomerProfile} />
        </div>
      </CustomerShell>
    );
  }

  notFound();
}