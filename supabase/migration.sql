-- ============================================================
-- Batchly — Full Database Migration
-- Paste this entire file into Supabase SQL Editor and run
-- ============================================================

-- Cleanup any existing objects (safe to re-run)
DROP TABLE IF EXISTS audit_logs CASCADE;
DROP TABLE IF EXISTS sales CASCADE;
DROP TABLE IF EXISTS product_variants CASCADE;
DROP TABLE IF EXISTS production_batches CASCADE;
DROP TABLE IF EXISTS inventory_transactions CASCADE;
DROP TABLE IF EXISTS recipe_items CASCADE;
DROP TABLE IF EXISTS products CASCADE;
DROP TABLE IF EXISTS recipes CASCADE;
DROP TABLE IF EXISTS ingredients CASCADE;
DROP TABLE IF EXISTS suppliers CASCADE;
DROP TABLE IF EXISTS ingredient_categories CASCADE;
DROP TABLE IF EXISTS users CASCADE;
DROP TABLE IF EXISTS organizations CASCADE;
DROP FUNCTION IF EXISTS get_current_organization_id CASCADE;
DROP FUNCTION IF EXISTS fn_update_ingredient_on_transaction CASCADE;
DROP FUNCTION IF EXISTS fn_audit_inventory_transaction CASCADE;
DROP FUNCTION IF EXISTS apply_org_policies CASCADE;

-- 0. Extensions
CREATE EXTENSION IF NOT EXISTS pgcrypto;

-- ============================================================
-- TABLES
-- ============================================================

-- 1. organizations
CREATE TABLE organizations (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  slug text NOT NULL UNIQUE,
  logo_url text,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

-- 2. users (links Supabase auth.users to an organization)
CREATE TABLE users (
  id uuid PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  organization_id uuid NOT NULL REFERENCES organizations(id),
  role text NOT NULL DEFAULT 'owner' CHECK (role IN ('owner', 'admin', 'staff')),
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

-- 3. ingredient_categories
CREATE TABLE ingredient_categories (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  organization_id uuid NOT NULL REFERENCES organizations(id),
  name text NOT NULL,
  sort_order integer NOT NULL DEFAULT 0,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

-- 4. ingredients
CREATE TABLE ingredients (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  organization_id uuid NOT NULL REFERENCES organizations(id),
  category_id uuid REFERENCES ingredient_categories(id),
  name text NOT NULL,
  unit text NOT NULL,
  current_stock numeric NOT NULL DEFAULT 0,
  latest_price numeric DEFAULT 0,
  min_stock_level numeric DEFAULT 0,
  deleted_at timestamptz,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

-- 5. suppliers
CREATE TABLE suppliers (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  organization_id uuid NOT NULL REFERENCES organizations(id),
  name text NOT NULL,
  contact_person text,
  phone text,
  email text,
  address text,
  notes text,
  deleted_at timestamptz,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

-- 6. inventory_transactions (FK to production_batches added after that table exists)
CREATE TABLE inventory_transactions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  organization_id uuid NOT NULL REFERENCES organizations(id),
  ingredient_id uuid NOT NULL REFERENCES ingredients(id),
  supplier_id uuid REFERENCES suppliers(id),
  type text NOT NULL CHECK (type IN ('in', 'out', 'adjustment')),
  quantity numeric NOT NULL,
  unit_price numeric,
  reason text,
  notes text,
  transaction_date date NOT NULL DEFAULT current_date,
  batch_id uuid,
  created_at timestamptz NOT NULL DEFAULT now()
);

-- 7. recipes
CREATE TABLE recipes (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  organization_id uuid NOT NULL REFERENCES organizations(id),
  name text NOT NULL,
  yield_amount numeric NOT NULL DEFAULT 1,
  yield_unit text NOT NULL,
  overhead_pct numeric DEFAULT 0,
  packaging_cost numeric DEFAULT 0,
  selling_price numeric,
  notes text,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

-- 8. recipe_items
CREATE TABLE recipe_items (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  organization_id uuid NOT NULL REFERENCES organizations(id),
  recipe_id uuid NOT NULL REFERENCES recipes(id) ON DELETE CASCADE,
  ingredient_id uuid NOT NULL REFERENCES ingredients(id),
  quantity numeric NOT NULL,
  unit text NOT NULL,
  cost_at_create numeric NOT NULL,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

-- 9. products
CREATE TABLE products (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  organization_id uuid NOT NULL REFERENCES organizations(id),
  recipe_id uuid NOT NULL REFERENCES recipes(id),
  name text NOT NULL,
  sku text,
  unit text NOT NULL,
  default_price numeric,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

-- 10. sales
CREATE TABLE sales (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  organization_id uuid NOT NULL REFERENCES organizations(id),
  product_id uuid NOT NULL REFERENCES products(id),
  quantity integer NOT NULL,
  unit_price numeric NOT NULL,
  sale_date date NOT NULL DEFAULT current_date,
  notes text,
  created_at timestamptz NOT NULL DEFAULT now()
);

-- 11. audit_logs
CREATE TABLE audit_logs (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  organization_id uuid NOT NULL REFERENCES organizations(id),
  table_name text NOT NULL,
  record_id uuid NOT NULL,
  action text NOT NULL CHECK (action IN ('INSERT', 'UPDATE', 'DELETE')),
  actor_id uuid,
  old_data jsonb,
  new_data jsonb,
  created_at timestamptz NOT NULL DEFAULT now()
);

-- 12. product_variants (Phase 2)
CREATE TABLE product_variants (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  organization_id uuid NOT NULL REFERENCES organizations(id),
  product_id uuid NOT NULL REFERENCES products(id) ON DELETE CASCADE,
  name text NOT NULL,
  sku text,
  packaging_cost numeric NOT NULL DEFAULT 0,
  default_price numeric NOT NULL,
  sort_order integer NOT NULL DEFAULT 0,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

-- 13. production_batches (Phase 2) — references product_variants
CREATE TABLE production_batches (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  organization_id uuid NOT NULL REFERENCES organizations(id),
  recipe_id uuid NOT NULL REFERENCES recipes(id),
  variant_id uuid REFERENCES product_variants(id),
  batch_number text NOT NULL,
  planned_qty numeric NOT NULL,
  actual_qty numeric NOT NULL,
  production_date date NOT NULL DEFAULT current_date,
  notes text,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

-- FK on inventory_transactions.batch_id
ALTER TABLE inventory_transactions
  ADD CONSTRAINT fk_transactions_batch
  FOREIGN KEY (batch_id) REFERENCES production_batches(id);

-- ============================================================
-- INDEXES
-- ============================================================

CREATE INDEX idx_users_org ON users(organization_id);

CREATE INDEX idx_categories_org ON ingredient_categories(organization_id);

CREATE INDEX idx_ingredients_org_name ON ingredients(organization_id, name);
CREATE INDEX idx_ingredients_org_category ON ingredients(organization_id, category_id);
CREATE INDEX idx_ingredients_org_stock ON ingredients(organization_id, current_stock);

CREATE INDEX idx_suppliers_org_name ON suppliers(organization_id, name);

CREATE INDEX idx_transactions_org_ingredient_date ON inventory_transactions(organization_id, ingredient_id, transaction_date);
CREATE INDEX idx_transactions_org_supplier ON inventory_transactions(organization_id, supplier_id);
CREATE INDEX idx_transactions_org_created ON inventory_transactions(organization_id, created_at);
CREATE INDEX idx_transactions_org_batch ON inventory_transactions(organization_id, batch_id);

CREATE INDEX idx_recipes_org_name ON recipes(organization_id, name);

CREATE INDEX idx_recipe_items_recipe ON recipe_items(recipe_id);
CREATE INDEX idx_recipe_items_recipe_ingredient ON recipe_items(recipe_id, ingredient_id);

CREATE INDEX idx_products_org_name ON products(organization_id, name);
CREATE INDEX idx_products_org_recipe ON products(organization_id, recipe_id);

CREATE INDEX idx_sales_org_date ON sales(organization_id, sale_date DESC);
CREATE INDEX idx_sales_org_product ON sales(organization_id, product_id);

CREATE INDEX idx_audit_org_table ON audit_logs(organization_id, table_name, created_at);
CREATE INDEX idx_audit_org_record ON audit_logs(organization_id, record_id);

CREATE INDEX idx_batches_org_date ON production_batches(organization_id, production_date DESC);
CREATE INDEX idx_batches_org_recipe ON production_batches(organization_id, recipe_id);
CREATE UNIQUE INDEX idx_batches_org_number ON production_batches(organization_id, batch_number);

CREATE INDEX idx_variants_org_product ON product_variants(organization_id, product_id);
CREATE INDEX idx_variants_product_order ON product_variants(product_id, sort_order);

-- ============================================================
-- RLS HELPER FUNCTION
-- ============================================================

CREATE OR REPLACE FUNCTION get_current_organization_id()
RETURNS uuid LANGUAGE sql STABLE SECURITY DEFINER AS $$
  SELECT organization_id FROM users WHERE id = auth.uid()
$$;

-- ============================================================
-- TRIGGERS
-- ============================================================

-- Trigger: update ingredient stock on transaction
CREATE OR REPLACE FUNCTION fn_update_ingredient_on_transaction()
RETURNS TRIGGER AS $$
BEGIN
  UPDATE ingredients
  SET
    current_stock = current_stock + NEW.quantity,
    latest_price = CASE
      WHEN NEW.type = 'in' AND NEW.unit_price > 0 THEN NEW.unit_price
      ELSE latest_price
    END,
    updated_at = now()
  WHERE id = NEW.ingredient_id
    AND organization_id = NEW.organization_id;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE TRIGGER trg_update_ingredient_on_transaction
  AFTER INSERT ON inventory_transactions
  FOR EACH ROW
  EXECUTE FUNCTION fn_update_ingredient_on_transaction();

-- Trigger: audit inventory transaction
CREATE OR REPLACE FUNCTION fn_audit_inventory_transaction()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO audit_logs (organization_id, table_name, record_id, action, actor_id, new_data)
  VALUES (
    NEW.organization_id,
    'inventory_transactions',
    NEW.id,
    'INSERT',
    auth.uid(),
    row_to_json(NEW)::jsonb
  );
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE TRIGGER trg_audit_inventory_transaction
  AFTER INSERT ON inventory_transactions
  FOR EACH ROW
  EXECUTE FUNCTION fn_audit_inventory_transaction();

-- ============================================================
-- RLS POLICIES
-- ============================================================

-- Helper: apply standard org isolation policies to a table
-- Usage: SELECT apply_org_policies('ingredients');

CREATE OR REPLACE FUNCTION apply_org_policies(table_name text)
RETURNS void AS $$
BEGIN
  EXECUTE format('ALTER TABLE %I ENABLE ROW LEVEL SECURITY', table_name);

  EXECUTE format(
    'CREATE POLICY "org_isolation_select" ON %I FOR SELECT USING (organization_id = get_current_organization_id())',
    table_name
  );
  EXECUTE format(
    'CREATE POLICY "org_isolation_insert" ON %I FOR INSERT WITH CHECK (organization_id = get_current_organization_id())',
    table_name
  );
  EXECUTE format(
    'CREATE POLICY "org_isolation_update" ON %I FOR UPDATE USING (organization_id = get_current_organization_id())',
    table_name
  );
  EXECUTE format(
    'CREATE POLICY "org_isolation_delete" ON %I FOR DELETE USING (organization_id = get_current_organization_id())',
    table_name
  );
END;
$$ LANGUAGE plpgsql;

SELECT apply_org_policies('ingredients');
SELECT apply_org_policies('suppliers');
SELECT apply_org_policies('inventory_transactions');
SELECT apply_org_policies('recipes');
SELECT apply_org_policies('recipe_items');
SELECT apply_org_policies('products');
SELECT apply_org_policies('sales');
SELECT apply_org_policies('audit_logs');
SELECT apply_org_policies('production_batches');
SELECT apply_org_policies('product_variants');

-- ingredient_categories: only accessible for users in the same org
SELECT apply_org_policies('ingredient_categories');

-- users: special policies (row IS the user)
ALTER TABLE users ENABLE ROW LEVEL SECURITY;

CREATE POLICY "users_select_own" ON users
  FOR SELECT USING (id = auth.uid());

CREATE POLICY "users_insert_own" ON users
  FOR INSERT WITH CHECK (id = auth.uid());

-- organizations: users can read/create their own org
ALTER TABLE organizations ENABLE ROW LEVEL SECURITY;

CREATE POLICY "orgs_select_own" ON organizations
  FOR SELECT USING (id = get_current_organization_id());

CREATE POLICY "orgs_insert" ON organizations
  FOR INSERT WITH CHECK (true);

-- ============================================================
-- SEED DATA
-- ============================================================

-- Note: ingredient_categories and default org are created by the app.
-- No seed data needed for now.

DROP FUNCTION apply_org_policies;
