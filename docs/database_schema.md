# Batchly — Database Schema

## Design Principles

- UUID primary keys on all tables (never auto-increment)
- `created_at` and `updated_at` timestamps on every table
- `organization_id` for multi-tenant isolation on all business tables
- Row Level Security (RLS) on all tables
- Never store calculated values if they can be derived (exceptions noted)
- Index on `organization_id` + `created_at` for query performance
- Foreign keys are indexed
- Soft deletes via `deleted_at` where noted

---

## Entity Relationship Summary

```
organizations ──┬── users
                ├── ingredient_categories ── ingredients ── inventory_transactions
                ├── suppliers ────────────────── inventory_transactions
                ├── recipes ── recipe_items ── ingredients
                ├── products ── recipes
                ├── sales ── products
                └── audit_logs
```

---

## Table: organizations

The tenant root. Every business is one organization.

| Column | Type | Constraints | Notes |
|--------|------|------------|-------|
| id | uuid | PK, default gen_random_uuid() | |
| name | text | NOT NULL | Business name |
| slug | text | UNIQUE, NOT NULL | URL-friendly identifier |
| logo_url | text | | Supabase Storage URL |
| created_at | timestamptz | NOT NULL, default now() | |
| updated_at | timestamptz | NOT NULL, default now() | |

**Indexes**: slug (unique)

---

## Table: users

Members of an organization. Linked to Supabase auth.users via id.

| Column | Type | Constraints | Notes |
|--------|------|------------|-------|
| id | uuid | PK, references auth.users(id) | Matches Supabase Auth user ID |
| organization_id | uuid | NOT NULL, FK → organizations(id) | |
| role | text | NOT NULL, default 'owner' | owner, admin, staff (future) |
| created_at | timestamptz | NOT NULL, default now() | |
| updated_at | timestamptz | NOT NULL, default now() | |

**Indexes**: organization_id, (organization_id, role)

---

## Table: ingredient_categories

Groups for organizing ingredients.

| Column | Type | Constraints | Notes |
|--------|------|------------|-------|
| id | uuid | PK, default gen_random_uuid() | |
| organization_id | uuid | NOT NULL, FK → organizations(id) | |
| name | text | NOT NULL | e.g., Bahan Baku, Bumbu, Kemasan |
| sort_order | integer | NOT NULL, default 0 | Display ordering |
| created_at | timestamptz | NOT NULL, default now() | |
| updated_at | timestamptz | NOT NULL, default now() | |

**Seed data**: Bahan Baku, Bumbu & Rempah, Kemasan, Lainnya

---

## Table: ingredients

Raw materials tracked in inventory.

| Column | Type | Constraints | Notes |
|--------|------|------------|-------|
| id | uuid | PK, default gen_random_uuid() | |
| organization_id | uuid | NOT NULL, FK → organizations(id) | |
| category_id | uuid | FK → ingredient_categories(id) | Nullable |
| name | text | NOT NULL | |
| unit | text | NOT NULL | g, kg, ml, L, pcs, sdt, sdm, cup |
| current_stock | numeric | NOT NULL, default 0 | Maintained by trigger (practical exception) |
| latest_price | numeric | default 0 | Latest stock-in unit_price, set by trigger |
| min_stock_level | numeric | default 0 | Alert threshold |
| deleted_at | timestamptz | | Soft delete |
| created_at | timestamptz | NOT NULL, default now() | |
| updated_at | timestamptz | NOT NULL, default now() | |

**Indexes**: (organization_id, name), (organization_id, category_id), (organization_id, current_stock)

**Note**: `current_stock` and `latest_price` are maintained by database triggers on `inventory_transactions`. In a strict sense they are derivable, but storing them avoids expensive aggregate queries on every inventory page load. This is a deliberate pragmatic decision.

---

## Table: suppliers

Ingredient vendors.

| Column | Type | Constraints | Notes |
|--------|------|------------|-------|
| id | uuid | PK, default gen_random_uuid() | |
| organization_id | uuid | NOT NULL, FK → organizations(id) | |
| name | text | NOT NULL | |
| contact_person | text | | |
| phone | text | | |
| email | text | | |
| address | text | | |
| notes | text | | |
| deleted_at | timestamptz | | Soft delete if has transactions |
| created_at | timestamptz | NOT NULL, default now() | |
| updated_at | timestamptz | NOT NULL, default now() | |

**Indexes**: (organization_id, name)

---

## Table: inventory_transactions

Every movement of ingredients. Single source of truth for stock.

| Column | Type | Constraints | Notes |
|--------|------|------------|-------|
| id | uuid | PK, default gen_random_uuid() | |
| organization_id | uuid | NOT NULL, FK → organizations(id) | |
| ingredient_id | uuid | NOT NULL, FK → ingredients(id) | |
| supplier_id | uuid | FK → suppliers(id) | Nullable |
| type | text | NOT NULL | 'in', 'out', 'adjustment' |
| quantity | numeric | NOT NULL | Positive for 'in', negative for 'out'/'adjustment' |
| unit_price | numeric | | Price per unit (for 'in' type) |
| reason | text | | required for 'out': used, expired, damaged, adjustment |
| notes | text | | |
| transaction_date | date | NOT NULL, default current_date | |
| created_at | timestamptz | NOT NULL, default now() | |

**Indexes**: (organization_id, ingredient_id, transaction_date), (organization_id, supplier_id), (organization_id, created_at)

**Triggers**:
1. `update_ingredient_stock` — AFTER INSERT: updates ingredients.current_stock += quantity; if type='in', sets ingredients.latest_price = unit_price
2. `audit_inventory_transaction` — AFTER INSERT: writes audit_log entry

---

## Table: recipes

Production formulas.

| Column | Type | Constraints | Notes |
|--------|------|------------|-------|
| id | uuid | PK, default gen_random_uuid() | |
| organization_id | uuid | NOT NULL, FK → organizations(id) | |
| name | text | NOT NULL | |
| yield_amount | numeric | NOT NULL, default 1 | |
| yield_unit | text | NOT NULL | pcs, box, jar, kg, liter |
| overhead_pct | numeric | default 0 | Percentage of production_cost |
| packaging_cost | numeric | default 0 | Fixed packaging cost per batch |
| selling_price | numeric | | Recommended retail price |
| notes | text | | |
| created_at | timestamptz | NOT NULL, default now() | |
| updated_at | timestamptz | NOT NULL, default now() | |

**Computed (not stored)**: production_cost, overhead_cost, total_hpp, per_unit_hpp, margin_pct — all calculated in application layer.

**Indexes**: (organization_id, name)

---

## Table: recipe_items

Ingredients that make up a recipe.

| Column | Type | Constraints | Notes |
|--------|------|------------|-------|
| id | uuid | PK, default gen_random_uuid() | |
| recipe_id | uuid | NOT NULL, FK → recipes(id) ON DELETE CASCADE | |
| ingredient_id | uuid | NOT NULL, FK → ingredients(id) | |
| quantity | numeric | NOT NULL | Amount used in this recipe |
| unit | text | NOT NULL | Snapshot of ingredient unit at recipe creation |
| cost_at_create | numeric | NOT NULL | Snapshot of ingredient price at recipe creation |
| created_at | timestamptz | NOT NULL, default now() | |
| updated_at | timestamptz | NOT NULL, default now() | |

**Indexes**: (recipe_id, ingredient_id), (recipe_id)

---

## Table: products

Sellable items linked to recipes.

| Column | Type | Constraints | Notes |
|--------|------|------------|-------|
| id | uuid | PK, default gen_random_uuid() | |
| organization_id | uuid | NOT NULL, FK → organizations(id) | |
| recipe_id | uuid | NOT NULL, FK → recipes(id) | |
| name | text | NOT NULL | |
| sku | text | | Auto-generated if empty: PRD-{random} |
| unit | text | NOT NULL | pcs, box, jar, kg, liter |
| default_price | numeric | | Default selling price |
| created_at | timestamptz | NOT NULL, default now() | |
| updated_at | timestamptz | NOT NULL, default now() | |

**Indexes**: (organization_id, name), (organization_id, recipe_id)

---

## Table: sales

Sales records. MVP uses single-product-per-row (no sale_items).

| Column | Type | Constraints | Notes |
|--------|------|------------|-------|
| id | uuid | PK, default gen_random_uuid() | |
| organization_id | uuid | NOT NULL, FK → organizations(id) | |
| product_id | uuid | NOT NULL, FK → products(id) | |
| quantity | integer | NOT NULL | Units sold |
| unit_price | numeric | NOT NULL | Price per unit at time of sale |
| sale_date | date | NOT NULL, default current_date | |
| notes | text | | |
| created_at | timestamptz | NOT NULL, default now() | |

**Computed (not stored)**: revenue = quantity × unit_price, total_hpp = quantity × per_unit_hpp, gross_profit = revenue - total_hpp, margin = (gross_profit / revenue) × 100

**Indexes**: (organization_id, sale_date DESC), (organization_id, product_id)

---

## Table: audit_logs

Immutable audit trail for inventory movements.

| Column | Type | Constraints | Notes |
|--------|------|------------|-------|
| id | uuid | PK, default gen_random_uuid() | |
| organization_id | uuid | NOT NULL, FK → organizations(id) | |
| table_name | text | NOT NULL | 'inventory_transactions' |
| record_id | uuid | NOT NULL | ID of affected record |
| action | text | NOT NULL | 'INSERT', 'UPDATE', 'DELETE' |
| actor_id | uuid | | User who performed action |
| old_data | jsonb | | Previous values (for UPDATE/DELETE) |
| new_data | jsonb | | New values (for INSERT/UPDATE) |
| created_at | timestamptz | NOT NULL, default now() | |

**Indexes**: (organization_id, table_name, created_at), (organization_id, record_id)

---

## RLS Policies

Every business table implements the same policy pattern:

```sql
-- Enable RLS
ALTER TABLE ingredients ENABLE ROW LEVEL SECURITY;

-- SELECT: users can only see their org's data
CREATE POLICY "org_isolation_select" ON ingredients
  FOR SELECT USING (
    organization_id = (auth.jwt() ->> 'organization_id')::uuid
  );

-- INSERT: org_id must match user's org
CREATE POLICY "org_isolation_insert" ON ingredients
  FOR INSERT WITH CHECK (
    organization_id = (auth.jwt() ->> 'organization_id')::uuid
  );

-- UPDATE: same check
CREATE POLICY "org_isolation_update" ON ingredients
  FOR UPDATE USING (
    organization_id = (auth.jwt() ->> 'organization_id')::uuid
  );

-- DELETE: same check
CREATE POLICY "org_isolation_delete" ON ingredients
  FOR DELETE USING (
    organization_id = (auth.jwt() ->> 'organization_id')::uuid
  );
```

This pattern applies identically to: ingredients, suppliers, inventory_transactions, recipes, recipe_items, products, sales, audit_logs.

Exception: `ingredient_categories` policies must cascade-check through ingredients if needed, or simply apply org-level isolation.

---

## Triggers

### Trigger: update_ingredient_on_transaction
```sql
CREATE OR REPLACE FUNCTION fn_update_ingredient_on_transaction()
RETURNS TRIGGER AS $$
BEGIN
  -- Update current stock
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
```

### Trigger: audit_inventory_movement
```sql
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
```

### Trigger: set_organization_id_on_user
```sql
-- When user signs up and creates org, link them
-- This runs via application logic (not a DB trigger for auth.users)
```

---

## Indexes Summary

| Table | Index |
|-------|-------|
| organizations | slug (unique) |
| users | organization_id |
| ingredient_categories | organization_id |
| ingredients | (organization_id, name), (organization_id, category_id), (organization_id, current_stock) |
| inventory_transactions | (organization_id, ingredient_id, transaction_date), (organization_id, supplier_id), (organization_id, created_at) |
| suppliers | (organization_id, name) |
| recipes | (organization_id, name) |
| recipe_items | (recipe_id, ingredient_id), (recipe_id) |
| products | (organization_id, name), (organization_id, recipe_id) |
| sales | (organization_id, sale_date DESC), (organization_id, product_id) |
| audit_logs | (organization_id, table_name, created_at), (organization_id, record_id) |

---

## Out of MVP Scope (Future)

- purchase_orders / purchase_order_items → Phase 2
- production_batches → Phase 2
- sale_items → Phase 2 (multi-item sales)
- locations / warehouses → Phase 4
- subscription_plans / subscriptions → Monetization (Supabase or Stripe)
