-- Batchly — Operational Expenses (idempotent)
-- Run after the main migration. Safe to run multiple times.
-- ============================================================

CREATE TABLE IF NOT EXISTS expenses (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  organization_id uuid NOT NULL REFERENCES organizations(id),
  category text NOT NULL,
  description text,
  amount numeric NOT NULL CHECK (amount >= 0),
  expense_date date NOT NULL DEFAULT current_date,
  created_at timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_expenses_org_date ON expenses(organization_id, expense_date DESC);
CREATE INDEX IF NOT EXISTS idx_expenses_org_category ON expenses(organization_id, category);

-- Reuse the org-isolation policy helper from the main migration.
-- If apply_org_policies was dropped, recreate inline policies instead.
DO $$
BEGIN
  IF EXISTS (SELECT 1 FROM pg_proc WHERE proname = 'apply_org_policies') THEN
    PERFORM apply_org_policies('expenses');
  ELSE
    EXECUTE 'ALTER TABLE expenses ENABLE ROW LEVEL SECURITY';
    EXECUTE 'DROP POLICY IF EXISTS "org_isolation_select" ON expenses';
    EXECUTE 'DROP POLICY IF EXISTS "org_isolation_insert" ON expenses';
    EXECUTE 'DROP POLICY IF EXISTS "org_isolation_update" ON expenses';
    EXECUTE 'DROP POLICY IF EXISTS "org_isolation_delete" ON expenses';
    EXECUTE 'CREATE POLICY "org_isolation_select" ON expenses FOR SELECT USING (organization_id = get_current_organization_id())';
    EXECUTE 'CREATE POLICY "org_isolation_insert" ON expenses FOR INSERT WITH CHECK (organization_id = get_current_organization_id())';
    EXECUTE 'CREATE POLICY "org_isolation_update" ON expenses FOR UPDATE USING (organization_id = get_current_organization_id())';
    EXECUTE 'CREATE POLICY "org_isolation_delete" ON expenses FOR DELETE USING (organization_id = get_current_organization_id())';
  END IF;
END $$;
