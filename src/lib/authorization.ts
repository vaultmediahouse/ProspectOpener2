import { getSession } from "@/lib/session";

export async function requireCustomer() {
  const session = await getSession();
  if (!session) throw new Error("UNAUTHENTICATED");
  if (session.role !== "CUSTOMER" && session.role !== "ADMIN") throw new Error("FORBIDDEN");
  return session;
}

export async function requireAdmin() {
  const session = await getSession();
  if (!session) throw new Error("UNAUTHENTICATED");
  if (session.role !== "ADMIN") throw new Error("FORBIDDEN");
  return session;
}
