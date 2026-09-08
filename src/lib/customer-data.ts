import { query } from "@/lib/db";
import { compare, hash } from "bcryptjs";

export type CustomerPlanSummary = {
  name: string;
  leadQuantity: number;
  amount: number;
  currency: string;
  paidAt: string | null;
  orderId: string;
} | null;

export type CustomerDashboardData = {
  currentPlan: CustomerPlanSummary;
  totalPurchased: number;
  totalAssigned: number;
  hasPendingAllocation: boolean;
  recentLeads: Array<{
    id: string;
    businessName: string;
    industry: string | null;
    city: string | null;
    country: string | null;
    website: string | null;
    email: string | null;
    phone: string | null;
    contactName: string | null;
    assignedAt: string;
  }>;
  recentOrders: Array<{
    id: string;
    planName: string;
    leadQuantity: number;
    amount: number;
    currency: string;
    paymentStatus: string;
    allocationStatus: string;
    createdAt: string;
    paidAt: string | null;
  }>;
};

export async function getCustomerDashboard(userId: string): Promise<CustomerDashboardData> {
  const [latestPaidOrder, totalPurchasedRes, totalAssignedRes, pendingOrdersRes, recentLeadsRes, recentOrdersRes] =
    await Promise.all([
      // 1. Current Plan: latest successfully paid purchase
      query<{
        id: string;
        plan_name: string;
        lead_quantity: number;
        amount: number;
        currency: string;
        paid_at: string | null;
      }>(
        `SELECT o.id, p.name AS plan_name, o.lead_quantity, o.amount, o.currency, o.paid_at
         FROM "Orders" o
         JOIN "Plans" p ON p.id = o.plan_id
         WHERE o.user_id = $1 AND o.payment_status = 'PAID'
         ORDER BY o.paid_at DESC NULLS LAST, o.created_at DESC
         LIMIT 1`,
        [userId],
      ),
      // 2. Total Leads Purchased: sum across all successful purchases
      query<{ total: string }>(
        `SELECT COALESCE(SUM(lead_quantity), 0)::text AS total
         FROM "Orders"
         WHERE user_id = $1 AND payment_status = 'PAID'`,
        [userId],
      ),
      // 3. Total Leads Assigned
      query<{ total: string }>(
        `SELECT COUNT(*)::text AS total
         FROM "LeadAssignments"
         WHERE customer_id = $1 AND status = 'ASSIGNED'`,
        [userId],
      ),
      // 4. Pending Allocations
      query<{ count: string }>(
        `SELECT COUNT(*)::text AS count
         FROM "Orders"
         WHERE user_id = $1 AND payment_status = 'PAID' AND allocation_status = 'PENDING'`,
        [userId],
      ),
      // 5. Recent assigned leads
      query<{
        id: string;
        business_name: string;
        industry: string | null;
        city: string | null;
        country: string | null;
        website: string | null;
        business_email: string | null;
        phone: string | null;
        contact_name: string | null;
        assigned_at: string;
      }>(
        `SELECT l.id, l.business_name, l.industry, l.city, l.country, l.website,
                l.business_email, l.phone, l.contact_name, la.assigned_at
         FROM "LeadAssignments" la
         JOIN "Leads" l ON l.id = la.lead_id
         WHERE la.customer_id = $1 AND la.status = 'ASSIGNED'
         ORDER BY la.assigned_at DESC
         LIMIT 5`,
        [userId],
      ),
      // 6. Recent orders
      query<{
        id: string;
        plan_name: string;
        lead_quantity: number;
        amount: number;
        currency: string;
        payment_status: string;
        allocation_status: string;
        created_at: string;
        paid_at: string | null;
      }>(
        `SELECT o.id, p.name AS plan_name, o.lead_quantity, o.amount, o.currency,
                o.payment_status, o.allocation_status, o.created_at, o.paid_at
         FROM "Orders" o
         JOIN "Plans" p ON p.id = o.plan_id
         WHERE o.user_id = $1
         ORDER BY o.created_at DESC
         LIMIT 3`,
        [userId],
      ),
    ]);

  const planRow = latestPaidOrder.rows[0];
  const currentPlan: CustomerPlanSummary = planRow
    ? {
        name: planRow.plan_name,
        leadQuantity: planRow.lead_quantity,
        amount: planRow.amount,
        currency: planRow.currency,
        paidAt: planRow.paid_at,
        orderId: planRow.id,
      }
    : null;

  return {
    currentPlan,
    totalPurchased: Number(totalPurchasedRes.rows[0]?.total ?? 0),
    totalAssigned: Number(totalAssignedRes.rows[0]?.total ?? 0),
    hasPendingAllocation: Number(pendingOrdersRes.rows[0]?.count ?? 0) > 0,
    recentLeads: recentLeadsRes.rows.map((row) => ({
      id: row.id,
      businessName: row.business_name,
      industry: row.industry,
      city: row.city,
      country: row.country,
      website: row.website,
      email: row.business_email,
      phone: row.phone,
      contactName: row.contact_name,
      assignedAt: row.assigned_at,
    })),
    recentOrders: recentOrdersRes.rows.map((row) => ({
      id: row.id,
      planName: row.plan_name,
      leadQuantity: row.lead_quantity,
      amount: row.amount,
      currency: row.currency,
      paymentStatus: row.payment_status,
      allocationStatus: row.allocation_status,
      createdAt: row.created_at,
      paidAt: row.paid_at,
    })),
  };
}

export async function getCustomerLeads(
  userId: string,
  options: { limit?: number; offset?: number; search?: string } = {},
) {
  const limit = Math.min(Math.max(options.limit ?? 25, 1), 100);
  const offset = Math.max(options.offset ?? 0, 0);
  const search = options.search?.trim() ?? "";
  const like = `%${search}%`;

  const [leadsRes, countRes] = await Promise.all([
    query<{
      id: string;
      business_name: string;
      industry: string | null;
      country: string | null;
      city: string | null;
      website: string | null;
      business_email: string | null;
      phone: string | null;
      contact_name: string | null;
      verification: string | null;
      assigned_at: string;
      order_id: string | null;
    }>(
      `SELECT l.id, l.business_name, l.industry, l.country, l.city, l.website,
              l.business_email, l.phone, l.contact_name, l.verification,
              la.assigned_at, la.order_id
       FROM "LeadAssignments" la
       JOIN "Leads" l ON l.id = la.lead_id
       WHERE la.customer_id = $1 AND la.status = 'ASSIGNED'
         AND ($4 = '' OR l.business_name ILIKE $4 OR l.industry ILIKE $4 OR l.city ILIKE $4 OR l.country ILIKE $4)
       ORDER BY la.assigned_at DESC
       LIMIT $2 OFFSET $3`,
      [userId, limit, offset, search ? like : ""],
    ),
    query<{ count: string }>(
      `SELECT COUNT(*)::text AS count
       FROM "LeadAssignments" la
       JOIN "Leads" l ON l.id = la.lead_id
       WHERE la.customer_id = $1 AND la.status = 'ASSIGNED'
         AND ($2 = '' OR l.business_name ILIKE $2 OR l.industry ILIKE $2 OR l.city ILIKE $2 OR l.country ILIKE $2)`,
      [userId, search ? like : ""],
    ),
  ]);

  return {
    leads: leadsRes.rows.map((row) => ({
      id: row.id,
      businessName: row.business_name,
      industry: row.industry,
      country: row.country,
      city: row.city,
      website: row.website,
      email: row.business_email,
      phone: row.phone,
      contactName: row.contact_name,
      verification: row.verification,
      assignedAt: row.assigned_at,
      orderId: row.order_id,
    })),
    total: Number(countRes.rows[0]?.count ?? 0),
    limit,
    offset,
  };
}

export async function getAllCustomerLeadsForExport(userId: string) {
  const result = await query<{
    business_name: string;
    industry: string | null;
    country: string | null;
    city: string | null;
    website: string | null;
    business_email: string | null;
    phone: string | null;
    contact_name: string | null;
    verification: string | null;
    assigned_at: string;
  }>(
    `SELECT l.business_name, l.industry, l.country, l.city, l.website,
            l.business_email, l.phone, l.contact_name, l.verification,
            la.assigned_at
     FROM "LeadAssignments" la
     JOIN "Leads" l ON l.id = la.lead_id
     WHERE la.customer_id = $1 AND la.status = 'ASSIGNED'
     ORDER BY la.assigned_at DESC`,
    [userId],
  );

  return result.rows.map((row) => ({
    businessName: row.business_name,
    industry: row.industry ?? "",
    country: row.country ?? "",
    city: row.city ?? "",
    website: row.website ?? "",
    email: row.business_email ?? "",
    phone: row.phone ?? "",
    contactName: row.contact_name ?? "",
    verificationNotes: row.verification ?? "",
    assignedDate: new Date(row.assigned_at).toISOString().split("T")[0],
  }));
}

export async function getCustomerOrders(userId: string) {
  const result = await query<{
    id: string;
    plan_name: string;
    lead_quantity: number;
    amount: number;
    currency: string;
    payment_status: string;
    allocation_status: string;
    created_at: string;
    paid_at: string | null;
    allocated_at: string | null;
  }>(
    `SELECT o.id, p.name AS plan_name, o.lead_quantity, o.amount, o.currency,
            o.payment_status, o.allocation_status, o.created_at, o.paid_at, o.allocated_at
     FROM "Orders" o
     JOIN "Plans" p ON p.id = o.plan_id
     WHERE o.user_id = $1
     ORDER BY o.created_at DESC`,
    [userId],
  );

  return result.rows.map((row) => ({
    id: row.id,
    planName: row.plan_name,
    leadQuantity: row.lead_quantity,
    amount: row.amount,
    currency: row.currency,
    paymentStatus: row.payment_status,
    allocationStatus: row.allocation_status,
    createdAt: row.created_at,
    paidAt: row.paid_at,
    allocatedAt: row.allocated_at,
  }));
}

export async function getCustomerProfile(userId: string) {
  const result = await query<{
    id: string;
    name: string;
    email: string;
    role: string;
    google_id: string | null;
    password_hash: string | null;
    created_at: string;
    last_login_at: string | null;
  }>(
    `SELECT id, name, email, role, google_id, password_hash, created_at, last_login_at
     FROM "Users"
     WHERE id = $1 LIMIT 1`,
    [userId],
  );

  const row = result.rows[0];
  if (!row) return null;

  return {
    id: row.id,
    name: row.name,
    email: row.email,
    role: row.role,
    authProvider: row.google_id ? "google" : "email",
    hasPassword: Boolean(row.password_hash),
    createdAt: row.created_at,
    lastLoginAt: row.last_login_at,
  };
}

export async function updateCustomerProfile(
  userId: string,
  input: { name?: string; currentPassword?: string; newPassword?: string },
) {
  const user = await query<{ password_hash: string | null }>(
    `SELECT password_hash FROM "Users" WHERE id = $1 LIMIT 1`,
    [userId],
  );
  if (!user.rows[0]) throw new Error("User not found");

  if (input.name && input.name.trim().length >= 2) {
    await query(`UPDATE "Users" SET name = $1, updated_at = NOW() WHERE id = $2`, [
      input.name.trim(),
      userId,
    ]);
  }

  if (input.newPassword) {
    if (input.newPassword.length < 8) {
      throw new Error("Password must be at least 8 characters long");
    }

    const currentHash = user.rows[0].password_hash;
    if (currentHash) {
      if (!input.currentPassword) {
        throw new Error("Current password is required to set a new password");
      }
      const match = await compare(input.currentPassword, currentHash);
      if (!match) {
        throw new Error("Incorrect current password");
      }
    }

    const newHash = await hash(input.newPassword, 12);
    await query(`UPDATE "Users" SET password_hash = $1, updated_at = NOW() WHERE id = $2`, [
      newHash,
      userId,
    ]);
  }

  return { success: true };
}
