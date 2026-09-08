import { z } from "zod";
import { requireAdmin } from "@/lib/authorization";
import { confirmCsvImport } from "@/lib/admin-data";

const schema = z.object({ filename: z.string().min(1), rows: z.array(z.object({ business_name: z.string().optional(), country: z.string().nullable().optional(), city: z.string().nullable().optional(), industry: z.string().nullable().optional(), website: z.string().nullable().optional(), business_email: z.string().nullable().optional(), phone: z.string().nullable().optional(), contact_name: z.string().nullable().optional(), source: z.string().nullable().optional(), verification: z.string().nullable().optional(), dedupe_key: z.string() })) });

export async function POST(request: Request) {
  try {
    const admin = await requireAdmin();
    const body = schema.parse(await request.json());
    const result = await confirmCsvImport({ filename: body.filename, rows: body.rows, actorId: admin.userId });
    return Response.json(result);
  } catch (error) {
    if (error instanceof z.ZodError) return Response.json({ error: "Invalid import confirmation payload." }, { status: 400 });
    if (error instanceof Error && error.message === "FORBIDDEN") return Response.json({ error: "Forbidden." }, { status: 403 });
    if (error instanceof Error && error.message === "UNAUTHENTICATED") return Response.json({ error: "Session expired." }, { status: 401 });
    return Response.json({ error: "Unable to confirm import." }, { status: 503 });
  }
}
