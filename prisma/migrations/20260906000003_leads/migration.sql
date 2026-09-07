CREATE TABLE IF NOT EXISTS "Leads" (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    business_name TEXT NOT NULL,
    industry TEXT,
    country TEXT,
    city TEXT,
    website TEXT,
    business_email TEXT,
    phone TEXT,
    contact_name TEXT,
    source TEXT,
    verification TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

DO $$ BEGIN
  ALTER TABLE "LeadAssignments"
    ALTER COLUMN lead_id TYPE UUID
    USING CASE
      WHEN lead_id::text ~* '^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$'
        THEN lead_id::text::uuid
      ELSE NULL
    END;
EXCEPTION WHEN undefined_column THEN NULL;
END $$;

DO $$ BEGIN
  ALTER TABLE "LeadAssignments" ADD CONSTRAINT fk_leadassignments_lead FOREIGN KEY (lead_id) REFERENCES "Leads"(id) ON DELETE SET NULL;
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;
