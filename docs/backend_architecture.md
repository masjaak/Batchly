# Batchly — Backend Architecture

## Architecture Model

**Supabase-native backend.** No custom server. The frontend communicates directly with Supabase services via the JS client. RLS enforces security at the database level. Edge Functions handle a minimal set of server-side operations.

---

## Supabase Services Used

| Service | Purpose | MVP Phase |
|---------|---------|-----------|
| Auth (GoTrue) | Email/password, Google OAuth, session management | Phase 1 |
| PostgreSQL | All business data, RLS | Phase 1 |
| Storage | Organization logos, avatars | Phase 1 |
| Edge Functions | Recalculate costs, export (future) | Phase 2 |
| Realtime | Future: live stock updates | Phase 3 |

---

## Database Migrations

All schema changes applied via Supabase migration files:

```
supabase/
├── migrations/
│   ├── 20260501_00001_create_organizations.sql
│   ├── 20260501_00002_create_users.sql
│   ├── 20260501_00003_create_ingredient_categories.sql
│   ├── 20260501_00004_create_ingredients.sql
│   ├── 20260501_00005_create_suppliers.sql
│   ├── 20260501_00006_create_inventory_transactions.sql
│   ├── 20260501_00007_create_recipes.sql
│   ├── 20260501_00008_create_recipe_items.sql
│   ├── 20260501_00009_create_products.sql
│   ├── 20260501_00010_create_sales.sql
│   ├── 20260501_00011_create_audit_logs.sql
│   ├── 20260501_00012_create_indexes.sql
│   ├── 20260501_00013_create_triggers.sql
│   └── 20260501_00014_create_rls_policies.sql
```

---

## RLS Policy Implementation

### Standard Pattern (all business tables)

```sql
-- Enable RLS
ALTER TABLE ingredients ENABLE ROW LEVEL SECURITY;

-- Each table gets 4 policies (SELECT, INSERT, UPDATE, DELETE)
-- All use the same pattern:

CREATE POLICY "org_select" ON ingredients
  FOR SELECT USING (
    organization_id = (auth.jwt() ->> 'organization_id')::uuid
  );

CREATE POLICY "org_insert" ON ingredients
  FOR INSERT WITH CHECK (
    organization_id = (auth.jwt() ->> 'organization_id')::uuid
  );

CREATE POLICY "org_update" ON ingredients
  FOR UPDATE USING (
    organization_id = (auth.jwt() ->> 'organization_id')::uuid
  );

CREATE POLICY "org_delete" ON ingredients
  FOR DELETE USING (
    organization_id = (auth.jwt() ->> 'organization_id')::uuid
  );
```

### Special Cases

**recipe_items**: No organization_id column (inherits via recipe). Policy uses a JOIN:

```sql
CREATE POLICY "org_select_recipe_items" ON recipe_items
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM recipes
      WHERE recipes.id = recipe_items.recipe_id
        AND recipes.organization_id = (auth.jwt() ->> 'organization_id')::uuid
    )
  );
```

**audit_logs**: INSERT-only from triggers. SELECT by organization_id. No UPDATE/DELETE (immutable).

---

## Database Triggers

### 1. update_ingredient_on_transaction

```sql
-- Trigger function: update ingredient stock + latest price
-- Fires: AFTER INSERT on inventory_transactions

CREATE OR REPLACE FUNCTION fn_update_ingredient_on_transaction()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
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
$$;

CREATE TRIGGER trg_update_ingredient_on_transaction
  AFTER INSERT ON inventory_transactions
  FOR EACH ROW
  EXECUTE FUNCTION fn_update_ingredient_on_transaction();
```

### 2. audit_inventory_transaction

```sql
-- Trigger function: log all inventory transactions to audit_logs
-- Fires: AFTER INSERT on inventory_transactions

CREATE OR REPLACE FUNCTION fn_audit_inventory_transaction()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  INSERT INTO audit_logs (
    organization_id,
    table_name,
    record_id,
    action,
    actor_id,
    new_data
  ) VALUES (
    NEW.organization_id,
    'inventory_transactions',
    NEW.id,
    'INSERT',
    auth.uid(),
    row_to_json(NEW)::jsonb
  );

  RETURN NEW;
END;
$$;

CREATE TRIGGER trg_audit_inventory_transaction
  AFTER INSERT ON inventory_transactions
  FOR EACH ROW
  EXECUTE FUNCTION fn_audit_inventory_transaction();
```

### 3. set_organization_claim (Auth Hook)

```sql
-- This is a Supabase Auth Hook (not a standard trigger)
-- Configured in Supabase Dashboard → Auth → Hooks
-- Fires: AFTER user signs up / logs in

-- Custom claim: set organization_id in JWT
-- Implemented as an Edge Function or SQL function depending on Supabase config
```

---

## Edge Functions

### Planned for Phase 1 (minimal)

```typescript
// supabase/functions/recalculate-recipe-costs/index.ts
// POST /recalculate-recipe-costs
// Body: { recipe_ids: string[] }
// Updates recipe_items.cost_at_create from latest ingredient prices
// Returns: { updated: number, changes: { recipe_id, old_hpp, new_hpp }[] }
```

### Planned for Phase 2+

- `export-report`: Generate CSV/PDF for sales/profitability
- `subscription-webhook`: Handle Stripe/Midtrans webhook events

---

## Supabase Configuration

### Auth Settings
- **Providers**: Email (passwordless option off), Google
- **Session**: 30 min access, 7 day refresh
- **Email templates**: Custom Indonesian templates
- **Rate limiting**: Default Supabase limits

### Storage Buckets
- `org-logos`: Public bucket for organization logos
- `user-avatars`: Public bucket for user profile pictures

### API Settings
- **Max rows**: 1000 per request (default)
- **Port**: 5432 (PostgreSQL), 54321 (API)
- **SSL**: Enforced

---

## API Design (Client-Side)

All APIs called through Supabase JS client. No REST endpoints defined — Supabase auto-generates REST API from schema.

### Pattern: CRUD via Supabase Client

```typescript
// Create
const { data, error } = await supabase
  .from('ingredients')
  .insert({ organization_id, name: 'Tepung', unit: 'kg' })
  .select()
  .single();

// Read (list)
const { data, error } = await supabase
  .from('ingredients')
  .select('*, category:ingredient_categories(name)')
  .eq('organization_id', orgId)
  .order('name')
  .range(0, 19);

// Read (detail + related)
const { data, error } = await supabase
  .from('inventory_transactions')
  .select('*, supplier:suppliers(name)')
  .eq('ingredient_id', ingredientId)
  .order('transaction_date', { ascending: false })
  .limit(20);

// Update
const { data, error } = await supabase
  .from('suppliers')
  .update({ name: 'New Name' })
  .eq('id', supplierId)
  .select()
  .single();

// Delete (soft)
const { data, error } = await supabase
  .from('suppliers')
  .update({ deleted_at: new Date().toISOString() })
  .eq('id', supplierId);
```

### Complex Query: Dashboard Aggregation

```typescript
// Multiple queries run in parallel
export async function getDashboardData(orgId: string) {
  const [recipeCount, ingredientCount, lowStockCount, salesMonth] =
    await Promise.all([
      supabase.from('recipes')
        .select('id', { count: 'exact', head: true })
        .eq('organization_id', orgId),

      supabase.from('ingredients')
        .select('id', { count: 'exact', head: true })
        .eq('organization_id', orgId),

      supabase.from('ingredients')
        .select('id', { count: 'exact', head: true })
        .eq('organization_id', orgId)
        .lte('current_stock', supabase.rpc('get_column_ref', { tbl: 'ingredients', col: 'min_stock_level' })),

      supabase.from('sales')
        .select('*, product:products(name, recipe:recipes(id))')
        .eq('organization_id', orgId)
        .gte('sale_date', startOfMonth)
        .lte('sale_date', endOfMonth),
    ]);

  return {
    recipeCount: recipeCount.count ?? 0,
    ingredientCount: ingredientCount.count ?? 0,
    lowStockCount: lowStockCount.count ?? 0,
    salesThisMonth: salesMonth.data ?? [],
  };
}
```

*Note: Low stock count uses a Supabase RPC (PostgreSQL function) for the column reference, or alternatively, the count is computed client-side from the ingredients list.*

---

## Supplier Purchase History Query

```typescript
// Fetch supplier detail + purchase summary
export async function getSupplierDetail(supplierId: string, orgId: string) {
  const [supplier, transactions] = await Promise.all([
    supabase.from('suppliers')
      .select('*')
      .eq('id', supplierId)
      .eq('organization_id', orgId)
      .single(),

    supabase.from('inventory_transactions')
      .select('*, ingredient:ingredients(name, unit)')
      .eq('supplier_id', supplierId)
      .eq('organization_id', orgId)
      .eq('type', 'in')
      .order('transaction_date', { ascending: false })
      .limit(20),
  ]);

  const totalSpent = transactions.data?.reduce(
    (sum, t) => sum + (t.unit_price * t.quantity), 0
  ) ?? 0;

  return {
    supplier: supplier.data,
    transactions: transactions.data ?? [],
    summary: {
      totalSpent,
      transactionCount: transactions.data?.length ?? 0,
      lastPurchase: transactions.data?.[0]?.transaction_date ?? null,
    },
  };
}
```

---

## Deployment

### Hosting
- **Frontend**: Vercel (free tier for MVP)
- **Backend**: Supabase (free tier: 2 projects, 500MB DB, 5GB bandwidth)
- **Domain**: batchly.app (or batchly.id)

### CI/CD
- GitHub repository
- Vercel auto-deploy from main branch
- Supabase migrations applied manually or via CLI during deploy
- Preview deployments for PRs

### Environment Variables
```
VITE_SUPABASE_URL=
VITE_SUPABASE_ANON_KEY=
VITE_APP_URL=
VITE_SENTRY_DSN=              # Optional, Phase 2
```
