ALTER TABLE "Orders"
  ADD COLUMN IF NOT EXISTS allocation_status TEXT NOT NULL DEFAULT 'PENDING',
  ADD COLUMN IF NOT EXISTS allocated_at TIMESTAMP WITH TIME ZONE;

ALTER TABLE "LeadAssignments"
  ADD COLUMN IF NOT EXISTS customer_id UUID,
  ADD COLUMN IF NOT EXISTS order_id UUID,
  ADD COLUMN IF NOT EXISTS status TEXT NOT NULL DEFAULT 'ASSIGNED',
  ADD COLUMN IF NOT EXISTS assigned_at TIMESTAMP WITH TIME ZONE DEFAULT NOW();

ALTER TABLE "LeadAssignments"
  ADD CONSTRAINT fk_leadassignments_customer FOREIGN KEY (customer_id) REFERENCES "Users"(id) ON DELETE SET NULL;

ALTER TABLE "LeadAssignments"
  ADD CONSTRAINT fk_leadassignments_order FOREIGN KEY (order_id) REFERENCES "Orders"(id) ON DELETE CASCADE;

CREATE UNIQUE INDEX IF NOT EXISTS lead_assignments_lead_id_unique_idx ON "LeadAssignments" (lead_id);

ALTER TABLE "Leads"
  ADD COLUMN IF NOT EXISTS status TEXT NOT NULL DEFAULT 'AVAILABLE',
  ADD COLUMN IF NOT EXISTS import_batch_id UUID,
  ADD COLUMN IF NOT EXISTS dedupe_key TEXT;

CREATE UNIQUE INDEX IF NOT EXISTS leads_dedupe_key_unique_idx ON "Leads" (dedupe_key);

CREATE TABLE IF NOT EXISTS "Imports" (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  filename TEXT NOT NULL,
  total_rows INTEGER NOT NULL DEFAULT 0,
  valid_rows INTEGER NOT NULL DEFAULT 0,
  duplicate_rows INTEGER NOT NULL DEFAULT 0,
  invalid_rows INTEGER NOT NULL DEFAULT 0,
  status TEXT NOT NULL DEFAULT 'PENDING',
  created_by UUID,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  confirmed_at TIMESTAMP WITH TIME ZONE
);

ALTER TABLE "Leads"
  ADD CONSTRAINT fk_leads_import_batch FOREIGN KEY (import_batch_id) REFERENCES "Imports"(id) ON DELETE SET NULL;

CREATE TABLE IF NOT EXISTS "ImportErrors" (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  import_id UUID NOT NULL,
  row_number INTEGER NOT NULL,
  reason TEXT NOT NULL,
  row_data TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  CONSTRAINT fk_importerrors_import FOREIGN KEY (import_id) REFERENCES "Imports"(id) ON DELETE CASCADE
);

CREATE TABLE IF NOT EXISTS "Payments" (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  order_id UUID NOT NULL,
  provider TEXT NOT NULL,
  provider_order_id TEXT,
  provider_payment_id TEXT,
  status TEXT NOT NULL,
  amount INTEGER NOT NULL,
  currency TEXT NOT NULL,
  raw_payload TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  CONSTRAINT fk_payments_order FOREIGN KEY (order_id) REFERENCES "Orders"(id) ON DELETE CASCADE
);

CREATE UNIQUE INDEX IF NOT EXISTS payments_provider_payment_unique_idx ON "Payments" (provider_payment_id);

CREATE TABLE IF NOT EXISTS "ActivityLogs" (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  actor_type TEXT NOT NULL,
  actor_id UUID,
  action TEXT NOT NULL,
  target_type TEXT,
  target_id UUID,
  metadata TEXT,
  ip_address TEXT,
  user_agent TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

UPDATE "LeadAssignments" SET customer_id = user_id WHERE customer_id IS NULL;
