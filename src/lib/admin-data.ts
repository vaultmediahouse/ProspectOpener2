import { query, withTransaction } from "@/lib/db";
import { logActivity } from "@/lib/activity";
import { normalizeLead, parseCsv } from "@/lib/csv-import";

const activeDays = Number(process.env.ACTIVE_CUSTOMER_DAYS ?? 30);
export const lowLeadThreshold = Number(process.env.LOW_LEAD_THRESHOLD ?? 500);

export async function getDashboardSummary() {
  const [customers, orders, leads, revenue, planRows, recentOrders] = await Promise.all([
    query<{ total: string; active: string; inactive: string; paying: string; non_paying: string }>(`
      WITH paying_users AS (
        SELECT DISTINCT user_id FROM "Orders" WHERE payment_status = 'PAID'
      )
      SELECT
        COUNT(*) FILTER (WHERE role = 'CUSTOMER')::text AS total,
        COUNT(*) FILTER (WHERE role = 'CUSTOMER' AND last_login_at >= NOW() - ($1 || ' days')::interval)::text AS active,
        COUNT(*) FILTER (WHERE role = 'CUSTOMER' AND (last_login_at IS NULL OR last_login_at < NOW() - ($1 || ' days')::interval))::text AS inactive,
        COUNT(*) FILTER (WHERE role = 'CUSTOMER' AND id IN (SELECT user_id FROM paying_users))::text AS paying,
        COUNT(*) FILTER (WHERE role = 'CUSTOMER' AND id NOT IN (SELECT user_id FROM paying_users))::text AS non_paying
      FROM "Users"`, [activeDays]),
    query<{ total: string; paid: string; pending: string; failed: string; starter: string; growth: string; allocated: string }>(`
      SELECT
        COUNT(*)::text AS total,
        COUNT(*) FILTER (WHERE payment_status = 'PAID')::text AS paid,
        COUNT(*) FILTER (WHERE payment_status = 'PENDING')::text AS pending,
        COUNT(*) FILTER (WHERE payment_status = 'FAILED')::text AS failed,
        COUNT(*) FILTER (WHERE plan_id IN (SELECT id FROM "Plans" WHERE name = 'STARTER'))::text AS starter,
        COUNT(*) FILTER (WHERE plan_id IN (SELECT id FROM "Plans" WHERE name = 'GROWTH'))::text AS growth,
        COUNT(*) FILTER (WHERE allocation_status = 'ALLOCATED')::text AS allocated
      FROM "Orders"`),
    query<{ total: string; available: string; assigned: string }>(`
      SELECT
        COUNT(*)::text AS total,
        COUNT(*) FILTER (WHERE status = 'AVAILABLE')::text AS available,
        COUNT(*) FILTER (WHERE status = 'ASSIGNED')::text AS assigned
      FROM "Leads"`),
    query<{ total: string; starter: string; growth: string }>(`
      SELECT
        COALESCE(SUM(amount), 0)::text AS total,
        COALESCE(SUM(amount) FILTER (WHERE plan_id IN (SELECT id FROM "Plans" WHERE name = 'STARTER')), 0)::text AS starter,
        COALESCE(SUM(amount) FILTER (WHERE plan_id IN (SELECT id FROM "Plans" WHERE name = 'GROWTH')), 0)::text AS growth
      FROM "Orders" WHERE payment_status = 'PAID'`),
    query<{ name: string; lead_quantity: number; price: number; customers: string; orders: string }>(`
      SELECT
        p.name,
        p.lead_quantity,
        p.price,
        COUNT(DISTINCT o.user_id)::text AS customers,
        COUNT(o.id)::text AS orders
      FROM "Plans" p
      LEFT JOIN "Orders" o ON o.plan_id = p.id AND o.payment_status = 'PAID'
      GROUP BY p.id
      ORDER BY p.price`),
    query<{ id: string; order_id: string; amount: number; payment_status: string; allocation_status: string; created_at: string; user_name: string; plan_name: string }>(`
      SELECT o.id, o.id AS order_id, o.amount, o.payment_status, o.allocation_status, o.created_at, u.name AS user_name, p.name AS plan_name
      FROM "Orders" o
      JOIN "Users" u ON u.id = o.user_id
      JOIN "Plans" p ON p.id = o.plan_id
      ORDER BY o.created_at DESC
      LIMIT 5`),
  ]);

  return {
    customers: {
      total: Number(customers.rows[0]?.total ?? 0),
      active: Number(customers.rows[0]?.active ?? 0),
      inactive: Number(customers.rows[0]?.inactive ?? 0),
      paying: Number(customers.rows[0]?.paying ?? 0),
      nonPaying: Number(customers.rows[0]?.non_paying ?? 0),
    },
    orders: {
      total: Number(orders.rows[0]?.total ?? 0),
      paid: Number(orders.rows[0]?.paid ?? 0),
      pending: Number(orders.rows[0]?.pending ?? 0),
      failed: Number(orders.rows[0]?.failed ?? 0),
      starter: Number(orders.rows[0]?.starter ?? 0),
      growth: Number(orders.rows[0]?.growth ?? 0),
      allocated: Number(orders.rows[0]?.allocated ?? 0),
    },
    leads: {
      total: Number(leads.rows[0]?.total ?? 0),
      available: Number(leads.rows[0]?.available ?? 0),
      assigned: Number(leads.rows[0]?.assigned ?? 0),
      low: Number(leads.rows[0]?.available ?? 0) <= lowLeadThreshold,
    },
    revenue: {
      total: Number(revenue.rows[0]?.total ?? 0),
      starter: Number(revenue.rows[0]?.starter ?? 0),
      growth: Number(revenue.rows[0]?.growth ?? 0),
    },
    plans: planRows.rows.map((row) => ({ ...row, customers: Number(row.customers), orders: Number(row.orders) })),
    recentOrders: recentOrders.rows,
  };
}

export async function getCustomers(limit = 100, offset = 0, search = "") {
  const like = `%${search}%`;
  const rows = await query<{
    id: string;
    name: string;
    email: string;
    created_at: string;
    last_login_at: string | null;
    status: string;
    total_orders: string;
    total_leads: string;
    total_spent: string;
    current_plan: string | null;
    paid_orders: string;
  }>(`
    WITH paid_orders AS (
      SELECT o.*, p.name AS plan_name
      FROM "Orders" o
      JOIN "Plans" p ON p.id = o.plan_id
      WHERE o.payment_status = 'PAID'
    ),
    latest_plan AS (
      SELECT DISTINCT ON (user_id) user_id, plan_name
      FROM paid_orders
      ORDER BY user_id, paid_at DESC NULLS LAST, created_at DESC
    )
    SELECT
      u.id,
      u.name,
      u.email,
      u.created_at,
      u.last_login_at,
      u.status,
      COALESCE(COUNT(o.id), 0)::text AS total_orders,
      COALESCE(SUM(o.lead_quantity), 0)::text AS total_leads,
      COALESCE(SUM(o.amount) FILTER (WHERE o.payment_status = 'PAID'), 0)::text AS total_spent,
      lp.plan_name AS current_plan,
      COALESCE(COUNT(o.id) FILTER (WHERE o.payment_status = 'PAID'), 0)::text AS paid_orders
    FROM "Users" u
    LEFT JOIN "Orders" o ON o.user_id = u.id
    LEFT JOIN latest_plan lp ON lp.user_id = u.id
    WHERE u.role = 'CUSTOMER' AND (u.name ILIKE $3 OR u.email ILIKE $3)
    GROUP BY u.id, lp.plan_name
    ORDER BY u.created_at DESC
    LIMIT $1 OFFSET $2`, [limit, offset, like]);
  return rows.rows;
}

export async function getOrders(limit = 100, offset = 0, search = "") {
  const like = `%${search}%`;
  const rows = await query<{
    id: string;
    user_name: string;
    user_email: string;
    plan_name: string;
    lead_quantity: number;
    amount: number;
    payment_status: string;
    allocation_status: string;
    created_at: string;
    paid_at: string | null;
    allocated_at: string | null;
    assigned_leads: string;
  }>(`
    SELECT
      o.id,
      u.name AS user_name,
      u.email AS user_email,
      p.name AS plan_name,
      o.lead_quantity,
      o.amount,
      o.payment_status,
      o.allocation_status,
      o.created_at,
      o.paid_at,
      o.allocated_at,
      COALESCE(COUNT(la.id), 0)::text AS assigned_leads
    FROM "Orders" o
    JOIN "Users" u ON u.id = o.user_id
    JOIN "Plans" p ON p.id = o.plan_id
    LEFT JOIN "LeadAssignments" la ON la.order_id = o.id
      WHERE (o.id::text ILIKE $3 OR u.name ILIKE $3 OR u.email ILIKE $3)
    GROUP BY o.id, u.name, u.email, p.name
    ORDER BY o.created_at DESC
    LIMIT $1 OFFSET $2`, [limit, offset, like]);
  return rows.rows;
}

export async function getLogs(limit = 200) {
  const rows = await query<{
    id: string;
    actor_type: string;
    actor_id: string | null;
    action: string;
    target_type: string | null;
    target_id: string | null;
    metadata: string | null;
    ip_address: string | null;
    user_agent: string | null;
    created_at: string;
  }>(`SELECT * FROM "ActivityLogs" ORDER BY created_at DESC LIMIT $1`, [limit]);
  return rows.rows;
}

export async function previewCsvImport(csvText: string) {
  const rows = parseCsv(csvText);
  const existing = await query<{ dedupe_key: string | null }>(`SELECT dedupe_key FROM "Leads" WHERE dedupe_key IS NOT NULL`);
  const existingKeys = new Set(existing.rows.map((row) => row.dedupe_key!).filter(Boolean));

  let valid = 0;
  let invalid = 0;
  let duplicates = 0;
  const seen = new Set<string>();
  const all = rows.map((row) => {
    const normalized = normalizeLead(row);
    const hasName = Boolean(normalized.business_name);
    const isDuplicate = Boolean(existingKeys.has(normalized.dedupe_key) || seen.has(normalized.dedupe_key));
    if (!hasName) invalid += 1;
    else if (isDuplicate) duplicates += 1;
    else valid += 1;
    seen.add(normalized.dedupe_key);
    return { row, normalized, duplicate: isDuplicate, valid: hasName && !isDuplicate };
  });

  return { totalRows: rows.length, validRows: valid, invalidRows: invalid, duplicateRows: duplicates, preview: all.slice(0, 25).map((item, index) => ({ rowNumber: index + 1, row: item.row, normalized: item.normalized, valid: item.valid, duplicate: item.duplicate, invalid: !item.valid && !item.duplicate })), rows: all };
}

export async function confirmCsvImport(input: { filename: string; rows: Array<{ business_name?: string; country?: string | null; city?: string | null; industry?: string | null; website?: string | null; business_email?: string | null; phone?: string | null; contact_name?: string | null; source?: string | null; verification?: string | null; dedupe_key: string }>; actorId?: string | null }) {
  return withTransaction(async (client) => {
    const importResult = await client.query<{ id: string }>(
      `INSERT INTO "Imports" (filename, total_rows, valid_rows, duplicate_rows, invalid_rows, status, created_by, confirmed_at)
       VALUES ($1, $2, $3, $4, $5, 'COMPLETED', $6, NOW()) RETURNING id`,
      [input.filename, input.rows.length, 0, 0, 0, input.actorId ?? null],
    );
    const importId = importResult.rows[0].id;
    let inserted = 0;
    let duplicates = 0;
    let invalid = 0;
    for (const [index, row] of input.rows.entries()) {
      if (!row.business_name) {
        invalid += 1;
        await client.query(`INSERT INTO "ImportErrors" (import_id, row_number, reason, row_data) VALUES ($1, $2, $3, $4)`, [importId, index + 1, "Missing company name", JSON.stringify(row)]);
        continue;
      }
      const result = await client.query(
        `INSERT INTO "Leads" (business_name, country, city, industry, website, business_email, phone, contact_name, source, verification, status, import_batch_id, dedupe_key)
         VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,'AVAILABLE',$11,$12)
         ON CONFLICT (dedupe_key) DO NOTHING
         RETURNING id`,
        [row.business_name, row.country, row.city, row.industry, row.website, row.business_email, row.phone, row.contact_name, row.source, row.verification, importId, row.dedupe_key],
      );
      if (result.rowCount) inserted += 1;
      else {
        duplicates += 1;
        await client.query(`INSERT INTO "ImportErrors" (import_id, row_number, reason, row_data) VALUES ($1, $2, $3, $4)`, [importId, index + 1, "Duplicate lead", JSON.stringify(row)]);
      }
    }
    await client.query(`UPDATE "Imports" SET valid_rows = $2, duplicate_rows = $3, invalid_rows = $4 WHERE id = $1`, [importId, inserted, duplicates, invalid]);
    await logActivity({ actorType: "ADMIN", actorId: input.actorId, action: "leads_imported", targetType: "Imports", targetId: importId, metadata: { filename: input.filename, inserted, duplicates, invalid } });
    return { importId, inserted, duplicates, invalid };
  });
}

export async function allocateOrder(orderId: string, actorId?: string | null) {
  return withTransaction(async (client) => {
    const orderRes = await client.query<{ id: string; user_id: string; lead_quantity: number; amount: number; payment_status: string; allocation_status: string }>(
      `SELECT id, user_id, lead_quantity, amount, payment_status, allocation_status FROM "Orders" WHERE id = $1 FOR UPDATE`,
      [orderId],
    );
    const order = orderRes.rows[0];
    if (!order || order.payment_status !== "PAID") return { status: "NOT_READY" as const };
    if (order.allocation_status === "ALLOCATED") return { status: "ALREADY_ALLOCATED" as const };

    const leadsRes = await client.query<{ id: string }>(
      `SELECT id FROM "Leads" WHERE status = 'AVAILABLE' ORDER BY random() LIMIT $1 FOR UPDATE SKIP LOCKED`,
      [order.lead_quantity],
    );

    if ((leadsRes.rowCount ?? 0) < order.lead_quantity) {
      await client.query(`UPDATE "Orders" SET allocation_status = 'PENDING', order_status = 'AWAITING_ALLOCATION' WHERE id = $1`, [order.id]);
      await logActivity({ actorType: actorId ? "ADMIN" : "SYSTEM", actorId, action: "allocation_pending", targetType: "Orders", targetId: order.id, metadata: { required: order.lead_quantity, found: leadsRes.rowCount ?? 0 } });
      return { status: "INSUFFICIENT" as const, found: leadsRes.rowCount };
    }

    const leadIds = leadsRes.rows.map((row) => row.id);
    await client.query(`UPDATE "Leads" SET status = 'ASSIGNED' WHERE id = ANY($1::uuid[])`, [leadIds]);
    for (const leadId of leadIds) {
      await client.query(
        `INSERT INTO "LeadAssignments" (user_id, customer_id, order_id, lead_id, status, assigned_at)
         VALUES ($1, $2, $3, $4, 'ASSIGNED', NOW())`,
        [order.user_id, order.user_id, order.id, leadId],
      );
    }
    await client.query(`UPDATE "Orders" SET allocation_status = 'ALLOCATED', order_status = 'ALLOCATED', allocated_at = NOW() WHERE id = $1`, [order.id]);
    await logActivity({ actorType: actorId ? "ADMIN" : "SYSTEM", actorId, action: "order_allocated", targetType: "Orders", targetId: order.id, metadata: { leads: leadIds.length } });
    return { status: "ALLOCATED" as const, assigned: leadIds.length };
  });
}
