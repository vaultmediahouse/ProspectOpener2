INSERT INTO "Plans" (name, lead_quantity, price, currency, active)
SELECT 'STARTER', 50, 499, 'INR', true
ON CONFLICT (name) DO UPDATE SET lead_quantity = EXCLUDED.lead_quantity, price = EXCLUDED.price, active = EXCLUDED.active;

INSERT INTO "Plans" (name, lead_quantity, price, currency, active)
SELECT 'GROWTH', 100, 999, 'INR', true
ON CONFLICT (name) DO UPDATE SET lead_quantity = EXCLUDED.lead_quantity, price = EXCLUDED.price, active = EXCLUDED.active;
