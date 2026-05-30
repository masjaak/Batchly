# Batchly — Development Tasks

## Build Order & Dependencies

The MVP is broken into 4 sprints (2 weeks each) = 8 weeks total.

```
Sprint 1: Foundation (Auth + Org + DB)     → Week 1-2
Sprint 2: Inventory + Supplier               → Week 3-4
Sprint 3: Recipe + Product + HPP             → Week 5-6
Sprint 4: Sales + Dashboard + Polish         → Week 7-8
```

Key dependencies:
- Auth/Org must be first (everything depends on it)
- Inventory must precede Recipes (recipes need ingredients)
- Recipes must precede Products (products need recipes)
- Products must precede Sales (sales need products)

---

## Sprint 1: Foundation (Week 1-2)

### Task 1.1: Project Scaffolding (2 days)
**Files**: package.json, vite.config, tsconfig, tailwind.config, shadcn/ui init
- Initialize Vite + React + TypeScript project
- Install all dependencies
- Configure Tailwind with design tokens (colors, spacing, typography)
- Initialize shadcn/ui components
- Set up folder structure per frontend_architecture.md
- Configure path aliases (@/ → src/)

**Acceptance**: `npm run dev` starts the app. shadcn/ui button renders. Tailwind classes apply. No errors.

### Task 1.2: Supabase Project Setup (1 day)
**Files**: supabase/config.toml, — (managed via Supabase dashboard)
- Create Supabase project
- Enable Email/Password + Google Auth providers
- Configure Auth settings (session duration, email templates in Indonesian)
- Set up Storage buckets (org-logos, user-avatars)
- Get project URL and anon key → .env file

**Acceptance**: Can sign up and log in via Supabase dashboard.

### Task 1.3: Database Migrations — All Tables (3 days)
**Files**: supabase/migrations/20260501_*.sql
- Create all 11 tables per database_schema.md
- Create indexes
- Create triggers (update_ingredient_stock, audit_inventory_transaction)
- Create RLS policies for all tables
- Seed default ingredient categories

**Acceptance**: All migrations run without errors. RLS policies visible in Supabase dashboard.

### Task 1.4: Auth UI + Flow (3 days)
**Files**: src/pages/auth/LoginPage.tsx, src/pages/auth/SignupPage.tsx, src/hooks/useAuth.ts, src/lib/supabase.ts
- Initialize Supabase client in src/lib/supabase.ts
- Create useAuth hook with Zustand store
- Login page with email/password
- Signup page with organization creation (creates both auth user + organization record)
- Google OAuth button
- Password reset flow
- Auth guard on /app/* routes
- Onboarding: after signup, redirect to create first ingredient

**Acceptance**: Can sign up, create org, log in, see protected routes. Cannot access /app without auth.

### Task 1.5: App Layout Shell (2 days)
**Files**: src/components/layout/AppLayout.tsx, TopBar.tsx, BottomNav.tsx, Sidebar.tsx
- Public layout (centered card for auth pages)
- Protected layout with:
  - TopBar: back button + page title + optional action
  - BottomNav (mobile): 4 tabs — Stok, Resep, Jual, Lainnya
  - Sidebar (desktop 1024px+): persistent left sidebar
  - Responsive: mobile-first, bottom nav at < 640px

**Acceptance**: Layout renders on all screen sizes. Navigation switches between tabs. Active tab highlighted.

---

## Sprint 2: Inventory + Suppliers (Week 3-4)

### Task 2.1: Ingredient Categories CRUD (1 day)
**Files**: src/hooks/useIngredientCategories.ts, — (inline in inventory page)
- List categories
- Add/edit/delete categories (via modal)
- Seed defaults on org creation

### Task 2.2: Ingredient CRUD + List (3 days)
**Files**: src/pages/inventory/InventoryPage.tsx, src/components/inventory/IngredientRow.tsx, src/hooks/useIngredients.ts
- List all ingredients, grouped by category
- Add ingredient (name, unit, category, initial stock, min stock)
- Edit ingredient (inline or via modal)
- Delete ingredient (blocked if used in any recipe)

**Acceptance**: Can create 5 ingredients. List shows grouped by category. Search filters by name. Low stock items marked.

### Task 2.3: Stock-In Transaction (2 days)
**Files**: src/pages/inventory/StockInPage.tsx, src/components/inventory/StockInForm.tsx, src/hooks/useStockIn.ts (inlined)
- Full-screen form
- Ingredient dropdown with search + "Tambah Bahan Baru" quick-add
- Quantity, unit_price (pre-filled from latest_price)
- Supplier dropdown with search + "Tambah Pemasok Baru" quick-add
- Date (default today)
- Submit → INSERT + trigger updates stock

**Edge cases**:
- Quantity must be > 0
- Unit price can be 0 (gift/free ingredient)
- Duplicate submission prevention (disable button after click)
- Network error: show toast, retry button
- Ingredient deleted (soft) → exclude from dropdown

### Task 2.4: Stock-Out Transaction (1.5 days)
**Files**: src/pages/inventory/StockOutPage.tsx, src/components/inventory/StockOutForm.tsx
- Full-screen form
- Ingredient dropdown
- Quantity (entered as positive, stored as negative)
- Reason (radio: Terpakai, Kadaluarsa, Rusak, Penyesuaian)
- Optional notes
- Submit → INSERT + trigger

**Edge cases**:
- Cannot stock-out more than current stock without explicit "Penyesuaian" reason
- Negative quantity validation

### Task 2.5: Ingredient Detail + Movement History (2 days)
**Files**: src/pages/inventory/IngredientDetailPage.tsx, src/components/inventory/TransactionRow.tsx
- Ingredient info: name, unit, current stock, latest price, min stock
- Full transaction history paginated (20 per page)
- Each row: date, type (colored indicator), qty, unit price, supplier name, notes
- "Stok Masuk" and "Stok Keluar" action buttons

### Task 2.6: Suppliers CRUD (2 days)
**Files**: src/pages/suppliers/SuppliersPage.tsx, src/pages/suppliers/SupplierFormPage.tsx, src/pages/suppliers/SupplierDetailPage.tsx, src/components/suppliers/SupplierCard.tsx, src/hooks/useSuppliers.ts

**Supplier Management Breakdown** (Feature Request):

| Task | Description | Effort |
|------|-------------|--------|
| SUP-01 | Create supplier list page with search | 0.5 day |
| SUP-02 | Create supplier form (name*, contact person, phone, email, address, notes) | 0.5 day |
| SUP-03 | Create supplier detail page with contact info | 0.5 day |
| SUP-04 | Add purchase history section to supplier detail | 1 day |
| SUP-05 | Link stock-in form to supplier (dropdown + quick-add) | 0.5 day |
| SUP-06 | Soft delete (set deleted_at) if supplier has any transactions | 0.5 day |
| SUP-07 | Hard delete if supplier has no transactions (show warning) | 0.25 day |
| SUP-08 | Edit supplier (reuse form, pre-filled) | 0.25 day |
| SUP-09 | Supplier RLS policies | 0.25 day |
| SUP-10 | Edge cases: duplicate name, empty name validation, phone format | 0.25 day |

**Total**: 4 days

**Edge Cases**:
- **Delete with transactions**: Show warning "Pemasok ini memiliki X transaksi. Data tidak akan dihapus tetapi disembunyikan." Soft delete = set deleted_at.
- **Delete without transactions**: Show confirmation "Hapus pemasok ini?" On confirm, hard DELETE.
- **Empty required fields**: Name is required. Button disabled until valid.
- **Duplicate supplier names**: Allow duplicates (different contact persons possible at same business).
- **Supplier used in stock-in**: If supplier_id is set on any inventory_transactions, soft delete only.
- **Supplier with no transactions**: Can be hard deleted. Show "Pemasok baru — belum ada transaksi."
- **Quick-add from stock-in flow**: Modal opens supplier form. On save, dropdown auto-selects new supplier.
- **Long text in notes**: Textarea with 500 char limit.
- **Phone/email uniqueness**: Not enforced. Multiple contacts can share same phone.

### Task 2.7: Stock Opname (2 days)
**Files**: src/pages/inventory/StockOpnamePage.tsx, src/components/inventory/OpnameRow.tsx
- List all ingredients with system stock
- User enters physical quantity
- Real-time difference calculation with color indicators
- Summary: X ingredients checked, Y need adjustment
- Confirmation modal listing all differences
- On confirm → INSERT adjustment transactions for each difference

**Edge cases**:
- Large ingredient list: search/filter
- All match: "Semua cocok!" message, no transactions
- Zero stock ingredients: still shown (user can confirm 0)

---

## Sprint 3: Recipes + Products + HPP (Week 5-6)

### Task 3.1: Recipe CRUD (2 days)
**Files**: src/pages/recipes/RecipesPage.tsx, src/pages/recipes/RecipeFormPage.tsx, src/components/recipes/RecipeCard.tsx, src/hooks/useRecipes.ts
- Recipe list with name, yield, HPP, selling price, margin
- Recipe form (step 1: name, yield amount, yield unit)
- Recipe duplication
- Deleting recipe blocked if linked to product

### Task 3.2: Recipe Ingredients (2 days)
**Files**: src/components/recipes/RecipeIngredientList.tsx
- Add/remove ingredients dynamically
- Ingredient dropdown with search
- Cost auto-filled from latest ingredient price
- Edit quantity inline
- Real-time total cost update

**Edge cases**:
- Ingredient deleted after being added to recipe → keep in recipe item but mark as "Bahan tidak tersedia"
- Zero-cost ingredients (gift/own production)
- Duplicate ingredient in same recipe → ask if they meant to add twice

### Task 3.3: Cost Breakdown Display (1.5 days)
**Files**: src/components/recipes/CostBreakdown.tsx
- Display production cost = SUM(recipe_item.qty × cost_at_create)
- Overhead section: percentage input + calculated amount
- Packaging cost: fixed amount input
- Total HPP, per-unit HPP
- Selling price + margin %
- All values computed client-side, not stored

**Edge cases**:
- Yield = 0 → per_unit_hpp = 0 (cannot divide)
- Selling price = 0 → margin = 0%
- Selling price < total_hpp → negative margin (red text)

### Task 3.4: Recalculate Recipe Costs (1 day)
**Files**: — (button on recipe detail page)
- "Perbarui Harga Bahan" button
- Fetches latest ingredient prices
- Shows comparison: old cost vs new cost
- On confirm: batch updates recipe_items.cost_at_create
- (Phase 2: Edge Function for large batches)

**Edge cases**:
- Ingredient no longer exists → keep old cost, show warning
- Ingredient has no purchase price → keep old cost, show warning

### Task 3.5: Products CRUD (2 days)
**Files**: src/pages/products/ProductsPage.tsx, src/pages/products/ProductFormPage.tsx, src/hooks/useProducts.ts
- Product list: name, SKU, linked recipe, HPP, price, margin
- Product form: name, recipe (dropdown), SKU (auto), default price
- Delete product blocked if linked to sales
- HPP displayed from recipe cost

### Task 3.6: Recipe → Product Workflow (0.5 days)
**Files**: — (button on recipe detail page)
- "Buat Produk" button on recipe detail
- Pre-fills product form from recipe data
- Smooth transition

---

## Sprint 4: Sales + Dashboard + Polish (Week 7-8)

### Task 4.1: Sales CRUD (2.5 days)
**Files**: src/pages/sales/SalesPage.tsx, src/pages/sales/SaleFormPage.tsx, src/components/sales/SaleEntry.tsx, src/hooks/useSales.ts
- Sales list: grouped by date, filterable by date range and product
- Each entry: time, product, qty, revenue, HPP, profit, margin
- Sale form: product dropdown, quantity, unit price (pre-filled), date
- Profit calculation displayed after save

**Edge cases**:
- Sale date in future → allow (pre-order tracking)
- Sale date far in past → allow (catch-up recording)
- Negative price → blocked
- Zero quantity → blocked
- Cannot edit sale after 24 hours (future: audit rule)

### Task 4.2: Dashboard (2 days)
**Files**: src/pages/dashboard/DashboardPage.tsx, src/components/dashboard/SummaryCards.tsx, src/components/dashboard/LowStockList.tsx, src/components/dashboard/ActivityFeed.tsx, src/hooks/useDashboard.ts
- 3 summary cards: total recipes, ingredient count with low stock badge, MTD profit
- Low stock list: name, current qty, min level, "Tambah Stok" link
- Recent activity feed: last 10 events (sales + stock movements), mixed chronological
- Pull-to-refresh

**Edge cases**:
- No data yet → EmptyState: "Mulai dengan menambahkan bahan pertama"
- No low stock → hide section or show "Semua stok aman"
- No sales this month → show Rp 0 with neutral styling

### Task 4.3: Settings Page (1 day)
**Files**: src/pages/settings/SettingsPage.tsx
- Profile section (name edit)
- Organization section (name edit)
- Subscription info display (static for MVP)
- Language selector (Indonesian only for MVP)
- Logout button

### Task 4.4: Error Handling & Edge Cases Pass (2 days)
- Handle all empty states (no data yet)
- Handle all error states (network failure, server error)
- Handle loading states (skeletons)
- Add Supabase error handling for all queries
- Test all forms with invalid data
- Test RLS: user A cannot see user B's data

### Task 4.5: Mobile Responsive Polish (2 days)
- Test all screens at 375px width
- Test all screens at 390px (iPhone 14/15)
- Test bottom nav safe area padding (notch iPhones)
- Test touch targets (minimum 44px)
- Ensure forms work with mobile keyboard open
- PWA manifest + service worker for static caching

### Task 4.6: Performance Optimization (1 day)
- Add TanStack Query stale times
- Add pagination where missing
- Optimize Supabase queries (select specific columns)
- Lazy load page components
- Add bundle analysis

### Task 4.7: Final QA & Bug Fixes (2 days)
- Full regression test
- Fix any remaining bugs
- Test auth flow end-to-end
- Test stock opname with real data
- Test HPP calculations match manual calculation

---

## Sprint 5: Production Batches (Week 9-10)

### Task 5.1: Database Migration (1 day)
**Files**: docs/database_schema.md (Phase 2 migrations)
- Run production_batches table creation
- Run product_variants table creation
- Add batch_id column to inventory_transactions
- Apply RLS policies
- Seed helper: generate_batch_number() function or client-side logic

### Task 5.2: Production Batch Hooks (2 days)
**Files**: src/hooks/useProductionBatches.ts, src/test/useProductionBatches.test.ts
- `useProductionBatches()` — list all batches with recipe info (TanStack Query)
- `useProductionBatch(id)` — single batch with recipe + items
- `useCreateProductionBatch()` — insert batch + auto-create stock-out transactions
- `useDeleteProductionBatch()` — soft constraint: only within 24h

**Auto-deduction logic** (core complexity):
```ts
async function createProductionBatch(data: {
  organization_id, recipe_id, planned_qty, actual_qty, production_date, notes
}) {
  // 1. Get recipe with items
  const recipe = await getRecipeWithItems(data.recipe_id)

  // 2. Generate batch number
  const batchNumber = await generateBatchNumber(data.organization_id, data.production_date)

  // 3. Insert production_batch
  const batch = await supabase.from('production_batches').insert({
    ...data, batch_number: batchNumber,
  }).select().single()

  // 4. For each recipe_item, create stock-out transaction
  const scaleFactor = data.actual_qty / recipe.yield_amount
  const transactions = recipe.recipe_items.map(item => ({
    organization_id: data.organization_id,
    ingredient_id: item.ingredient_id,
    type: 'out',
    quantity: -(item.quantity * scaleFactor),
    reason: 'produksi',
    notes: `Batch: ${batchNumber} - ${recipe.name}`,
    batch_id: batch.id,
    transaction_date: data.production_date,
  }))
  await supabase.from('inventory_transactions').insert(transactions)

  return batch
}
```

**Correctness tests for auto-deduction**:
- Scale factor: actual_qty / yield_amount (e.g., yield=24 pcs, batch=48 → scale=2×)
- Each ingredient deducted: item.quantity × scaleFactor
- Total 0 → no deduction (edge case)
- Batch 0 → blocked

### Task 5.3: Batch Cost Variance Calculation (1 day)
**Files**: src/lib/calculations.ts (extend), src/test/calculations.test.ts (add tests)
- `calculateBatchCostVariance(batch, recipe)` → { plannedCost, actualCost, variance, variancePct, ingredientDetails[] }
- Each ingredient detail: { name, plannedQty, actualQty, plannedCost, actualCost, costAtCreate }

**Edge cases**:
- planned_qty = 0 → division by zero guard
- actual_qty differs from planned → proportional variance
- Recipe has no items → zero cost, zero variance
- Negative variance (over-produced) → show as favorable

### Task 5.4: Production Batch List & Detail Pages (2 days)
**Files**: src/pages/production/ProductionPage.tsx, src/pages/production/BatchDetailPage.tsx
- List: batch_number, recipe name, planned vs actual qty, production date, cost variance
- Detail: full batch info, ingredient deduction breakdown, cost variance table
- New batch form: select recipe → auto-fills planned_qty from recipe.yield_amount, enter actual_qty
- Show warning: "Stok akan otomatis dikurangi" with ingredient list preview

**Edge cases**:
- Recipe has no ingredients → allow batch (zero deduction)
- Insufficient stock → warn but allow (over-deduction creates negative stock, user must fix)
- Batch already exists for today → check batch number uniqueness

### Task 5.5: Production Batch Tests (2 days)
**Files**: src/test/useProductionBatches.test.ts, src/test/calculations.test.ts (extend)
- Hook tests: list, create (with deduction), delete within 24h, delete after 24h
- Calculation tests: cost variance with various planned vs actual ratios
- Integration: creating a batch and verifying stock deduction

### Task 5.6: Supplier Price History (1 day)
**Files**: src/pages/suppliers/SupplierDetailPage.tsx (enhance)
- Add "Riwayat Harga" section to supplier detail
- For each ingredient purchased from this supplier, show time-series price data
- Table: date, ingredient, quantity, unit_price, total
- Summary: total spent, last purchase, ingredient count

---

## Sprint 6: Export + Product Variants + Polish (Week 11-12)

### Task 6.1: CSV Export (2 days)
**Files**: src/lib/export.ts, src/test/export.test.ts
- `exportInventoryCSV(ingredients, categories)` → Blob, trigger download
- `exportSalesCSV(sales, products, hppData)` → Blob, trigger download
- "Ekspor CSV" buttons on inventory and sales pages
- Client-side generation (no server). Uses Blob + URL.createObjectURL

**Edge cases**:
- Empty data → export headers only (valid CSV)
- Large datasets → chunked or streaming (not needed for MVP, max ~5000 rows)
- Special characters in names (Indonesian: é, ñ) → UTF-8 BOM for Excel compatibility
- Number formatting → IDR locale format

### Task 6.2: Product Variants (2 days)
**Files**: src/hooks/useProductVariants.ts, src/test/useProductVariants.test.ts, src/pages/products/ProductsPage.tsx (enhance), src/pages/products/ProductDetailPage.tsx (new)
- `useProductVariants(productId)` — list variants for a product
- `useCreateProductVariant()` — create variant
- `useDeleteProductVariant()` — delete variant
- Product detail page with variant list
- Variant HPP = per_unit_hpp + variant.packaging_cost
- Sales page: variant selectable alongside product

**Edge cases**:
- Product with no variants → show base product only (backward compatible)
- Delete variant with batch history → soft delete (deleted_at)
- variant name + product_id unique constraint

### Task 6.3: Custom Units Support (0.5 day)
**Files**: src/pages/inventory/IngredientForm.tsx (enhance)
- Unit dropdown: curated list + "Lainnya..." option
- When "Lainnya" selected, free-text input appears
- Custom unit saved as-is (no validation on custom units)
- Display "(kustom)" suffix in lists

### Task 6.4: Offline Stock Opname (3 days)
**Files**: src/sw.ts, src/lib/offline.ts, src/hooks/useOfflineOpname.ts, src/pages/inventory/StockOpnamePage.tsx (enhance)
- Service Worker: cache ingredient list on page load (Cache-first strategy for opname page)
- IndexedDB: store physical counts when offline
- When online: sync button → create inventory_transactions
- Conflict detection: if current_stock != cached_stock → warn user

### Task 6.5: Phase 2 Final QA (1.5 days)
- Full regression test
- Verify auto-deduction matches manual calculation
- Test CSV exports in browser
- Test offline opname flow (airplane mode → enter counts → sync)
- Verify all 4 sprints still pass (regression on useRecipes, useSales, etc.)

---

## Total Effort Summary

| Sprint | Tasks | Days | Story Points |
|--------|-------|------|-------------|
| Sprint 1: Foundation | 5 tasks | 11 days | 22 |
| Sprint 2: Inventory + Supplier | 6 tasks | 12.5 days | 25 |
| Sprint 3: Recipe + Product + HPP | 5 tasks | 8.5 days | 17 |
| Sprint 4: Sales + Dashboard + Polish | 6 tasks | 10.5 days | 21 |
| Sprint 5: Production Batches | 6 tasks | 9 days | 18 |
| Sprint 6: Export + Variants + Polish | 5 tasks | 9 days | 18 |
| **Total (Phase 1 + 2)** | **33 tasks** | **60.5 days** | **121 SP** |

*(Based on 1 developer. With 2 developers: ~5 weeks.)*

---

## Supplier Management: Complete Feature Output

### 1. PRD Update ✅
Supplier management added to Phase 1 goals (Goal 3). User stories US-SUP-01 through US-SUP-04 added. See `docs/PRD.md`.

### 2. Database Changes ✅
- New table: `suppliers` with columns: id, organization_id, name, contact_person, phone, email, address, notes, deleted_at, created_at, updated_at
- Modified: `inventory_transactions` includes supplier_id FK
- RLS policies added for suppliers table
- Indexes: (organization_id, name)

### 3. API Design ✅
All CRUD via Supabase client. Key queries:
- `supabase.from('suppliers').select('*').eq('organization_id', orgId)`
- `supabase.from('inventory_transactions').select('*, ingredient:ingredients(*)').eq('supplier_id', id)`
- Supplier quick-add during stock-in flow

### 4. UI Flow ✅
- Suppliers list → tap → detail page with purchase history
- Stock-in form: supplier dropdown with "Tambah Pemasok Baru" option
- See `docs/user_flows.md` (Flows 8 & 9)

### 5. Edge Cases ✅
See Task 2.6 above. Key cases:
- Delete with transactions → soft delete
- Delete without transactions → hard delete
- Quick-add from stock-in flow
- Duplicate names allowed
- Missing fields (only name required)

### 6. Task Breakdown ✅
See Task 2.6 above. ~10 sub-tasks, ~4 days total.
