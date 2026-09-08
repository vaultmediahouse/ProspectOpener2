import { z } from "zod";
import { requireAdmin } from "@/lib/authorization";
import { previewCsvImport } from "@/lib/admin-data";

const schema = z.object({ filename: z.string().min(1), csv: z.string().min(1) });

export async function POST(request: Request) {
  try {
    await requireAdmin();
    const { csv } = schema.parse(await request.json());
    return Response.json(await previewCsvImport(csv));
  } catch (error) {
    if (error instanceof z.ZodError) return Response.json({ error: "Invalid CSV payload." }, { status: 400 });
    if (error instanceof Error && error.message === "FORBIDDEN") return Response.json({ error: "Forbidden." }, { status: 403 });
    if (error instanceof Error && error.message === "UNAUTHENTICATED") return Response.json({ error: "Session expired." }, { status: 401 });
    return Response.json({ error: "Unable to preview CSV." }, { status: 503 });
  }
}
