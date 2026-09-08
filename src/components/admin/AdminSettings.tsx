import { AdminShell } from "./AdminShell";

export function AdminSettings() {
  return <AdminShell title="Settings"><div className="admin-panel"><h3>Admin settings</h3><p>Profile, authentication, theme, and security settings are available in this admin workspace. Phase 2 keeps this minimal and operational.</p><ul className="settings-list"><li>Profile and email</li><li>Password and security settings</li><li>Theme and dark mode</li><li>Notification preferences</li><li>2FA when supported by the auth layer</li></ul></div></AdminShell>;
}
