DELETE FROM "Plans" a USING "Plans" b WHERE a.name = b.name AND a.id < b.id;
DO $$ BEGIN
  ALTER TABLE "Plans" ADD CONSTRAINT plans_name_unique UNIQUE (name);
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;
