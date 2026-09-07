-- Users table
CREATE TABLE "Users" (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name TEXT NOT NULL,
    email TEXT UNIQUE NOT NULL,
    google_id TEXT UNIQUE,
    password_hash TEXT,
    role TEXT NOT NULL DEFAULT 'CUSTOMER',
    status TEXT NOT NULL DEFAULT 'ACTIVE',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    last_login_at TIMESTAMP WITH TIME ZONE
);

-- Plans table
CREATE TABLE "Plans" (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name TEXT NOT NULL,
    lead_quantity INTEGER NOT NULL,
    price INTEGER NOT NULL,
    currency TEXT NOT NULL DEFAULT 'INR',
    active BOOLEAN NOT NULL DEFAULT true,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Orders table
CREATE TABLE "Orders" (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL,
    plan_id UUID NOT NULL,
    lead_quantity INTEGER NOT NULL,
    amount INTEGER NOT NULL,
    currency TEXT NOT NULL DEFAULT 'INR',
    payment_status TEXT NOT NULL DEFAULT 'PENDING',
    order_status TEXT NOT NULL DEFAULT 'PROCESSING',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    paid_at TIMESTAMP WITH TIME ZONE,
    provider_order_id TEXT UNIQUE,
    provider_payment_id TEXT,
    provider_signature TEXT,
    CONSTRAINT fk_orders_user FOREIGN KEY (user_id) REFERENCES "Users"(id) ON DELETE CASCADE,
    CONSTRAINT fk_orders_plan FOREIGN KEY (plan_id) REFERENCES "Plans"(id) ON DELETE RESTRICT
);

-- Leads table reserved for Phase 2 inventory
CREATE TABLE "Leads" (
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

-- LeadAssignments table
CREATE TABLE "LeadAssignments" (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID,
    lead_id UUID,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    CONSTRAINT fk_leadassignments_user FOREIGN KEY (user_id) REFERENCES "Users"(id) ON DELETE CASCADE
    CONSTRAINT fk_leadassignments_lead FOREIGN KEY (lead_id) REFERENCES "Leads"(id) ON DELETE SET NULL
);

-- Initial data for Plans
INSERT INTO "Plans" (name, lead_quantity, price, currency, active) VALUES
('STARTER', 50, 499, 'INR', true),
('GROWTH', 100, 999, 'INR', true);

ALTER TABLE "Plans" ADD CONSTRAINT plans_name_unique UNIQUE (name);
