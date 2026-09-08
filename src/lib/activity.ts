import { query } from "@/lib/db";

export async function logActivity(input: {
  actorType: string;
  actorId?: string | null;
  action: string;
  targetType?: string | null;
  targetId?: string | null;
  metadata?: unknown;
  ipAddress?: string | null;
  userAgent?: string | null;
}) {
  await query(
    `INSERT INTO "ActivityLogs" (actor_type, actor_id, action, target_type, target_id, metadata, ip_address, user_agent)
     VALUES ($1, $2, $3, $4, $5, $6, $7, $8)`,
    [
      input.actorType,
      input.actorId ?? null,
      input.action,
      input.targetType ?? null,
      input.targetId ?? null,
      input.metadata ? JSON.stringify(input.metadata) : null,
      input.ipAddress ?? null,
      input.userAgent ?? null,
    ],
  );
}
