"use client";

import { useState } from "react";

export type CustomerProfile = {
  id: string;
  name: string;
  email: string;
  authProvider: string;
  hasPassword: boolean;
  createdAt: string;
  lastLoginAt: string | null;
};

export function CustomerSettings({ profile }: { profile: CustomerProfile }) {
  const [name, setName] = useState(profile.name);
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  async function saveProfile() {
    setError(""); setMessage(""); setLoading(true);
    const res = await fetch("/api/customer/settings", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ name }),
    });
    const data = await res.json() as { error?: string; success?: boolean };
    setLoading(false);
    if (!res.ok) { setError(data.error ?? "Unable to save profile."); return; }
    setMessage("Profile updated.");
  }

  async function changePassword() {
    setError(""); setMessage(""); setLoading(true);
    const res = await fetch("/api/customer/settings", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ currentPassword, newPassword }),
    });
    const data = await res.json() as { error?: string; success?: boolean };
    setLoading(false);
    if (!res.ok) { setError(data.error ?? "Unable to update password."); return; }
    setCurrentPassword(""); setNewPassword("");
    setMessage("Password updated.");
  }

  return (
    <div className="customer-settings">
      {error && <p className="form-error" role="alert">{error}</p>}
      {message && (
        <p style={{ background: "#e7eedb", padding: "10px 12px", fontSize: "12px", color: "#4c6b3f" }}>{message}</p>
      )}

      <section className="customer-panel">
        <h3 style={{ margin: "0 0 18px", fontSize: "18px" }}>Profile</h3>
        <label style={{ display: "block", fontSize: "11px", fontWeight: 700, marginBottom: "14px" }}>
          Name
          <input
            value={name}
            onChange={(event) => setName(event.target.value)}
            style={{
              display: "block",
              width: "100%",
              maxWidth: "420px",
              border: "1px solid var(--line)",
              padding: "9px 12px",
              fontSize: "13px",
              marginTop: "7px",
              background: "#fcfdfb",
            }}
          />
        </label>
        <label style={{ display: "block", fontSize: "11px", fontWeight: 700 }}>
          Email
          <input
            value={profile.email}
            disabled
            style={{
              display: "block",
              width: "100%",
              maxWidth: "420px",
              border: "1px solid var(--line)",
              padding: "9px 12px",
              fontSize: "13px",
              marginTop: "7px",
              background: "#f3f5f1",
              color: "var(--muted)",
            }}
          />
        </label>
        <div style={{ marginTop: "18px" }}>
          <button
            onClick={() => void saveProfile()}
            disabled={loading}
            className="button button-small"
            style={{ padding: "8px 15px" }}
          >
            {loading ? "Saving…" : "Save profile"}
          </button>
        </div>
      </section>

      <section className="customer-panel">
        <h3 style={{ margin: "0 0 6px", fontSize: "18px" }}>Security</h3>
        <p style={{ fontSize: "12px", color: "var(--muted)", marginBottom: "18px" }}>
          Authentication provider: <strong>{profile.authProvider === "google" ? "Google" : "Email"}</strong>
          {profile.authProvider === "google" && !profile.hasPassword ? " · You can still add a password below." : ""}
        </p>

        {profile.hasPassword ? (
          <>
            <label style={{ display: "block", fontSize: "11px", fontWeight: 700, marginBottom: "14px" }}>
              Current password
              <input
                type="password"
                value={currentPassword}
                onChange={(event) => setCurrentPassword(event.target.value)}
                style={{
                  display: "block", width: "100%", maxWidth: "420px", border: "1px solid var(--line)",
                  padding: "9px 12px", fontSize: "13px", marginTop: "7px", background: "#fcfdfb",
                }}
              />
            </label>
            <label style={{ display: "block", fontSize: "11px", fontWeight: 700, marginBottom: "14px" }}>
              New password
              <input
                type="password"
                value={newPassword}
                onChange={(event) => setNewPassword(event.target.value)}
                minLength={8}
                placeholder="At least 8 characters"
                style={{
                  display: "block", width: "100%", maxWidth: "420px", border: "1px solid var(--line)",
                  padding: "9px 12px", fontSize: "13px", marginTop: "7px", background: "#fcfdfb",
                }}
              />
            </label>
            <button
              onClick={() => void changePassword()}
              disabled={loading || !newPassword}
              className="button button-small"
              style={{ padding: "8px 15px" }}
            >
              {loading ? "Updating…" : "Update password"}
            </button>
          </>
        ) : (
          <>
            <label style={{ display: "block", fontSize: "11px", fontWeight: 700, marginBottom: "14px" }}>
              New password
              <input
                type="password"
                value={newPassword}
                onChange={(event) => setNewPassword(event.target.value)}
                minLength={8}
                placeholder="At least 8 characters"
                style={{
                  display: "block", width: "100%", maxWidth: "420px", border: "1px solid var(--line)",
                  padding: "9px 12px", fontSize: "13px", marginTop: "7px", background: "#fcfdfb",
                }}
              />
            </label>
            <button
              onClick={() => void changePassword()}
              disabled={loading || !newPassword}
              className="button button-small"
              style={{ padding: "8px 15px" }}
            >
              {loading ? "Saving…" : "Set password"}
            </button>
          </>
        )}
      </section>

      <section className="customer-panel">
        <h3 style={{ margin: "0 0 10px", fontSize: "18px" }}>Account</h3>
        <p style={{ fontSize: "12px", color: "var(--muted)", lineHeight: 1.7 }}>
          Member since <strong>{new Date(profile.createdAt).toLocaleDateString()}</strong>
          {profile.lastLoginAt
            ? <> · Last login <strong>{new Date(profile.lastLoginAt).toLocaleString()}</strong></>
            : null}
          <br />
          Two-factor authentication will be enabled when your authentication provider supports it.
        </p>
      </section>
    </div>
  );
}