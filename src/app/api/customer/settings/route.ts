import { z } from "zod";
import { getSession } from "@/lib/session";
import { updateCustomerProfile } from "@/lib/customer-data";
import { logActivity } from "@/lib/activity";

const schema = z
  .object({
    name: z.string().trim().min(2).max(100).optional(),
    currentPassword: z.string().optional(),
    newPassword: z.string().min(8).max(100).optional(),
  })
  .refine((data) => !data.newPassword || data.currentPassword || true, { message: "Password flow is incomplete." });

export async function PATCH(request: Request) {
  const session = await getSession();
  if (!session) return Response.json({ error: "Please sign in." }, { status: 401 });

  try {
    const input = schema.parse(await request.json());
    await updateCustomerProfile(session.userId, input);

    await logActivity({
      actorType: "CUSTOMER",
      actorId: session.userId,
      action: input.newPassword ? "password_changed" : "profile_updated",
      targetType: "Users",
      targetId: session.userId,
      ipAddress: request.headers.get("x-real-ip") ?? request.headers.get("x-forwarded-for")?.split(",")[0],
      userAgent: request.headers.get("user-agent"),
    });

    return Response.json({ success: true });
  } catch (error) {
    if (error instanceof z.ZodError) return Response.json({ error: "Please provide a valid name or password." }, { status: 400 });
    if (error instanceof Error) {
      const message = error.message;
      if (message === "Current password is required to set a new password" || message === "Incorrect current password") {
        return Response.json({ error: message }, { status: 400 });
      }
      if (message === "Password must be at least 8 characters long") {
        return Response.json({ error: message }, { status: 400 });
      }
    }
    return Response.json({ error: "Unable to update settings." }, { status: 500 });
  }
}