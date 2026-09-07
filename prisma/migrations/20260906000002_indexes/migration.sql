CREATE INDEX IF NOT EXISTS orders_user_id_idx ON "Orders" (user_id);
CREATE INDEX IF NOT EXISTS orders_payment_status_idx ON "Orders" (payment_status);
CREATE INDEX IF NOT EXISTS lead_assignments_user_id_idx ON "LeadAssignments" (user_id);
