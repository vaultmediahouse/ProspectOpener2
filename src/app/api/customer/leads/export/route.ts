import { getSession } from "@/lib/session";
import { getAllCustomerLeadsForExport } from "@/lib/customer-data";
import { logActivity } from "@/lib/activity";
import * as XLSX from "xlsx";

const BASE_URL = process.env.NEXT_PUBLIC_APP_URL ?? "https://website.com";

function escapeCsv(value: string): string {
  if (/[",\n\r]/.test(value)) {
    return `"${value.replace(/"/g, '""')}"`;
  }
  return value;
}

function buildCsv(leads: Array<Record<string, string>>): string {
  if (!leads.length) return "";
  const headers = Object.keys(leads[0]);
  const lines = [headers.join(",")];
  for (const row of leads) {
    lines.push(headers.map((header) => escapeCsv(row[header] ?? "")).join(","));
  }
  return lines.join("\n");
}

export async function GET(request: Request) {
  const session = await getSession();
  if (!session) {
    return Response.json({ error: "Please sign in to download your leads." }, { status: 401 });
  }

  const format = new URL(request.url).searchParams.get("format") ?? "csv";
  if (format !== "csv" && format !== "xlsx") {
    return Response.json({ error: "Unsupported export format." }, { status: 400 });
  }

    const leads = await getAllCustomerLeadsForExport(session.userId);
    if (!leads.length) {
      return Response.redirect(`${BASE_URL}/leads?export=empty`);
    }

    const filename = `vault-leads-${new Date().toISOString().slice(0, 10)}`;

    if (format === "csv") {
      const csv = buildCsv(leads);
      await logActivity({
        actorType: "CUSTOMER",
        actorId: session.userId,
        action: "export_csv",
        targetType: "Leads",
        targetId: session.userId,
        metadata: { quantity: leads.length, format: "csv" },
ipAddress: request.headers.get("x-real-ip") ?? request.headers.get("x-forwarded-for")?.split(",")[0],
        userAgent: request.headers.get("user-agent"),
      });
      return new Response(csv, {
        status: 200,
        headers: {
          "Content-Type": "text/csv; charset=utf-8",
          "Content-Disposition": `attachment; filename="${filename}.csv"`,
          "Cache-Control": "no-store",
        },
      });
    }

    // XLSX export
    const worksheet = XLSX.utils.json_to_sheet(leads);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, "Leads");
    const buffer = XLSX.write(workbook, { type: "buffer", bookType: "xlsx" }) as Buffer;

    await logActivity({
      actorType: "CUSTOMER",
      actorId: session.userId,
      action: "export_excel",
      targetType: "Leads",
      targetId: session.userId,
      metadata: { quantity: leads.length, format: "xlsx" },
      ipAddress: request.headers.get("x-real-ip") ?? request.headers.get("x-forwarded-for")?.split(",")[0],
      userAgent: request.headers.get("user-agent"),
    });

    return new Response(buffer, {
      status: 200,
      headers: {
        "Content-Type": "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
        "Content-Disposition": `attachment; filename="${filename}.xlsx"`,
        "Cache-Control": "no-store",
      },
    });
}