import crypto from "node:crypto";
import { parse } from "csv-parse/sync";

export type ImportRow = {
  company_name?: string;
  country?: string;
  city?: string;
  industry?: string;
  website?: string;
  email?: string;
  phone?: string;
  decision_maker?: string;
  business_score?: string;
  conversion_rating?: string;
  source?: string;
  notes?: string;
  [key: string]: string | undefined;
};

const canonicalHeaders: Record<string, keyof ImportRow> = {
  company_name: "company_name",
  business_name: "company_name",
  company: "company_name",
  organization: "company_name",
  country: "country",
  city: "city",
  industry: "industry",
  website: "website",
  email: "email",
  business_email: "email",
  phone: "phone",
  decision_maker: "decision_maker",
  contact_name: "decision_maker",
  business_score: "business_score",
  conversion_rating: "conversion_rating",
  source: "source",
  notes: "notes",
};

export function parseCsv(text: string) {
  const records = parse(text, { columns: true, skip_empty_lines: true, trim: true }) as Record<string, string>[];
  const rows = records.map((record) => {
    const normalized: ImportRow = {};
    for (const [key, value] of Object.entries(record)) {
      const canonical = canonicalHeaders[key.trim().toLowerCase().replace(/\s+/g, "_")];
      if (canonical) normalized[canonical] = value?.trim();
      else normalized[key.trim().toLowerCase()] = value?.trim();
    }
    return normalized;
  });
  return rows;
}

function clean(value?: string | null) {
  return value?.trim().toLowerCase().replace(/^https?:\/\//, "").replace(/\/$/, "") ?? "";
}

export function dedupeKey(row: ImportRow) {
  const website = clean(row.website);
  const email = clean(row.email);
  const phone = clean(row.phone).replace(/\D+/g, "");
  const company = clean(row.company_name);
  const source = [website, email, phone, company].filter(Boolean).join("|") || crypto.randomUUID();
  return crypto.createHash("sha256").update(source).digest("hex");
}

export function normalizeLead(row: ImportRow) {
  return {
    business_name: row.company_name?.trim() ?? "",
    country: row.country?.trim() || null,
    city: row.city?.trim() || null,
    industry: row.industry?.trim() || null,
    website: row.website?.trim() || null,
    business_email: row.email?.trim().toLowerCase() || null,
    phone: row.phone?.trim() || null,
    contact_name: row.decision_maker?.trim() || null,
    source: row.source?.trim() || null,
    verification: row.notes?.trim() || row.business_score?.trim() || row.conversion_rating?.trim() || null,
    dedupe_key: dedupeKey(row),
  };
}
