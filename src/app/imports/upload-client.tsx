"use client";

import { useState } from "react";

type PreviewResult = { totalRows: number; validRows: number; invalidRows: number; duplicateRows: number; preview: Array<{ rowNumber: number; row: unknown; valid: boolean; duplicate: boolean; invalid: boolean }>; rows: Array<{ row: Record<string, string>; normalized: Record<string, unknown>; duplicate: boolean; valid: boolean }> };

export default function ImportClient() {
  const [result, setResult] = useState<PreviewResult | null>(null);
  const [filename, setFilename] = useState("");
  const [fileError, setFileError] = useState("");
  const [working, setWorking] = useState(false);

  async function preview(file: File | null) {
    if (!file) return;
    setWorking(true); setFileError("");
    const text = await file.text();
    const response = await fetch("/api/admin/imports/preview", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ filename: file.name, csv: text }) });
    const data = await response.json() as PreviewResult & { error?: string };
    setWorking(false);
    if (!response.ok) { setFileError(data.error ?? "Unable to preview CSV."); return; }
    setFilename(file.name); setResult(data);
  }

  async function confirm() {
    if (!result) return;
    setWorking(true); setFileError("");
    const response = await fetch("/api/admin/imports/confirm", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ filename, rows: result.rows.map((item) => item.normalized) }) });
    const data = await response.json() as { error?: string };
    setWorking(false);
    if (!response.ok) { setFileError(data.error ?? "Unable to import CSV."); return; }
    window.location.reload();
  }

  return <div className="admin-panel"><h3>Import leads</h3><input type="file" accept=".csv,text/csv" onChange={(event) => void preview(event.target.files?.[0] ?? null)} /><p>Upload a CSV with company_name, website, email, phone, city, country, industry, source, and notes.</p>{fileError ? <p className="form-error">{fileError}</p> : null}{result ? <div className="import-preview"><p>Total rows: {result.totalRows} · Valid: {result.validRows} · Invalid: {result.invalidRows} · Duplicates: {result.duplicateRows}</p><button className="button" disabled={working} onClick={() => void confirm()}>{working ? "Importing…" : "Confirm import"}</button></div> : null}</div>;
}
