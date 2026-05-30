# Batchly - Software Requirements Specification (SRS)

## 1. Introduction

### 1.1 Purpose
Defines software requirements for Batchly MVP (Phase 1): inventory, suppliers, recipes, products, HPP, sales, and dashboard.

### 1.2 Scope
Mobile-first web app. React + TypeScript + Vite. Supabase (PostgreSQL, Auth, RLS, Storage). TanStack Query. shadcn/ui + Tailwind CSS.

### 1.3 Definitions
| Term | Definition |
|------|-----------|
| Organization | A business tenant. All data scoped to organization_id. |
| Ingredient | Raw material tracked in inventory (g, kg, ml, L, pcs) |
| Supplier | Vendor providing ingredients |
| Stock-in | Purchasing inventory from a supplier |
| Stock-out | Using/removing inventory (production, expired, damaged, adjustment) |
| Stock Opname | Physical inventory count to reconcile with system |
| Recipe | Formula: list of ingredients + quantities producing a known yield |
| Product | Sellable item produced from a recipe |
| HPP | Harga Pokok Penjualan (COGS) |
| Inventory Transaction | Single movement record (in, out, adjustment, opname) |

---

## 2. Functional Requirements

### 2.1 Auth & Organization Module

**FR-AUTH-01**: Email/password registration
**FR-AUTH-02**: Email/password login
**FR-AUTH-03**: Google OAuth login
**FR-AUTH-04**: Password reset
**FR-AUTH-05**: On first login, create organization (name, slug)
**FR-AUTH-06**: Session timeout at 30 min
**FR-AUTH-07**: Profile edit (name, avatar)
**FR-AUTH-08**: RLS scoped to organization_id

### 2.2 Inventory Module

**FR-INV-01**: CRUD ingredient categories
- Fields: id, organization_id, name
- Seed defaults: Bahan Baku, Bumbu, Kemasan, Lainnya

**FR-INV-02**: CRUD ingredients
- Fields: id, organization_id, category_id, name, unit (g, kg, ml, L, pcs, sdt, sdm, cup), current_stock, latest_price, min_stock_level, created_at, updated_at
- current_stock maintained by DB trigger on inventory_transactions
- latest_price set to most recent stock-in unit_price via trigger

**FR-INV-03**: Record stock-in
- Fields: id, organization_id, ingredient_id, supplier_id (optional), quantity (+), unit_price, notes, transaction_date
- Insert inventory_transaction with type='in'
- Trigger updates ingredient.current_stock and ingredient.latest_price

**FR-INV-04**: Record stock-out
- Fields: id, organization_id, ingredient_id, quantity (-), reason (used, expired, damaged, adjustment), notes, transaction_date
- Insert inventory_transaction with type='out'
- Trigger updates ingredient.current_stock

**FR-INV-05**: Stock opname
- User enters physical quantity per ingredient
- System calculates difference
- On confirm, creates adjustment inventory_transaction
- View: list of ingredients with system vs physical qty

**FR-INV-06**: Stock movement history
- Table: inventory_transactions
- Paginated list, filterable by ingredient, type, date range
- Columns: date, ingredient, type, quantity, balance_after, notes, supplier

**FR-INV-07**: Low stock list
- SELECT ingredients WHERE current_stock <= min_stock_level
- Shown on dashboard and in an alert banner

### 2.3 Supplier Module

**FR-SUP-01**: CRUD suppliers
- Fields: id, organization_id, name, contact_person, phone, email, address, notes, created_at, updated_at
- Required: name
- Optional: all other fields

**FR-SUP-02**: Select supplier when recording stock-in
- Stock-in form includes supplier dropdown
- Supplier not required (can buy without recording supplier)

**FR-SUP-03**: Supplier detail page
- Show supplier info
- Tab/feed of all inventory_transactions linked to this supplier
- Summary: total spent, last purchase date, total transactions

**FR-SUP-04**: Delete supplier
- Soft delete (set deleted_at) if supplier has transactions
- Hard delete if no transactions

### 2.4 Recipe Module

**FR-RCP-01**: CRUD recipes
- Fields: id, organization_id, name, yield_amount, yield_unit (pcs, box, jar, kg, liter), overhead_pct, packaging_cost, selling_price, notes, created_at, updated_at

**FR-RCP-02**: Add/remove recipe ingredients (recipe_items)
- Fields: id, recipe_id, ingredient_id, quantity, unit, cost_at_create
- cost_at_create = ingredient.purchase_price at time of adding
- ingredient.purchase_price = latest stock-in unit_price

**FR-RCP-03**: Recipe cost calculation (computed, not stored)
- production_cost = SUM(recipe_items.qty * recipe_items.cost_at_create)
- overhead_cost = production_cost * (overhead_pct / 100)
- packaging_total = packaging_cost (fixed)
- total_hpp = production_cost + overhead_cost + packaging_total
- per_unit_hpp = total_hpp / yield_amount
- margin_pct = ((selling_price - total_hpp) / selling_price) * 100

**FR-RCP-04**: Recalculate costs
- Button: "Update costs from latest prices"
- Updates all recipe_items.cost_at_create from latest ingredient price
- Shows diff before applying

**FR-RCP-05**: Duplicate recipe
- Copies recipe + all recipe_items
- New recipe name: "Copy of {original name}"
- Status: draft

### 2.5 Product Module

**FR-PRD-01**: CRUD products
- Fields: id, organization_id, recipe_id, name, sku, unit, default_price, created_at, updated_at
- Required: name, recipe_id
- sku auto-generated if empty

**FR-PRD-02**: Product list with HPP info
- Show: name, recipe.name, default_price, per_unit_hpp, margin

### 2.6 Sales Module

**FR-SAL-01**: Record sale
- Fields: id, organization_id, product_id, quantity, unit_price, sale_date, notes, created_at
- No stored calculated values (revenue = qty * unit_price computed in UI)
- No sale_items table for MVP (single product per sale entry)
- User can record multiple sale entries per day

**FR-SAL-02**: Sales list
- Paginated, filterable by date range, product
- Columns: date, product, qty, unit_price, revenue (computed), unit_hpp (computed), gross_profit (computed), margin (computed)

**FR-SAL-03**: Profit analysis
- Per product: total qty, revenue, total HPP, gross profit, margin %
- Sortable by margin

### 2.7 Dashboard Module

**FR-DSH-01**: Summary cards (3 max)
- Total recipes with active products
- Ingredients tracked (with low stock count)
- MTD: Revenue / HPP / Gross Profit

**FR-DSH-02**: Low stock list
- Table: ingredient name, current stock, min level, action link

**FR-DSH-03**: Recent activity
- Last 10 inventory_transactions or sales
- Mixed feed

### 2.8 Production Batch Module

**FR-PRB-01**: Record production batch
- Fields: id, organization_id, recipe_id, variant_id (nullable), batch_number, planned_qty, actual_qty, production_date, notes, created_at, updated_at
- batch_number auto-generated: BCH-{YYYYMMDD}-{XXX} (sequential per day in org)

**FR-PRB-02**: Batch number auto-generation
- Format: BCH-{YYYYMMDD}-{001..999}
- Counter resets daily
- Generated server-side via a function or client-side with DB uniqueness check

**FR-PRB-03**: Automated stock deduction on batch creation
- When batch is recorded with actual_qty > 0:
  - For each recipe_item in linked recipe:
    - INSERT inventory_transaction (type='out', reason='produksi')
    - quantity = -(recipe_item.quantity * batch.actual_qty / recipe.yield_amount) — scaled to batch size
    - links to batch via notes or batch_id FK
  - Trigger updates ingredient.current_stock as usual

**FR-PRB-04**: Link batch to inventory transactions
- inventory_transactions.batch_id (uuid, nullable, FK → production_batches(id))
- Allows tracing: "this stock-out was caused by this batch"

**FR-PRB-05**: Production batch list
- Paginated, filterable by recipe and date range
- Columns: batch number, recipe name, planned qty, actual qty, production date, cost variance
- Sortable by production_date DESC

**FR-PRB-06**: Batch cost variance
- planned_cost = planned_qty * per_unit_hpp (from recipe snapshot)
- actual_cost = actual_qty * per_unit_hpp (same snapshot)
- planned_ingredient_cost = SUM(recipe_item.qty * cost_at_create / yield_amount) * planned_qty
- actual_ingredient_cost = SUM(recipe_item.qty * cost_at_create / yield_amount) * actual_qty
- variance = actual_cost - planned_cost
- variance_pct = (variance / planned_cost) * 100

### 2.9 Export Module

**FR-EXP-01**: Export inventory to CSV
- Columns: name, category, unit, current_stock, latest_price, total_value (= current_stock * latest_price)
- Triggered from inventory page → "Ekspor CSV" button
- Downloaded immediately (client-side generation)

**FR-EXP-02**: Export sales to CSV
- Columns: date, product, quantity, unit_price, revenue, hpp_per_unit, total_hpp, gross_profit, margin
- Date range filterable before export
- Triggered from sales page → "Ekspor CSV" button

### 2.10 Product Variant Module

**FR-PRD-03**: CRUD product variants
- Fields: id, organization_id, product_id, name, sku, packaging_cost, default_price, created_at, updated_at
- variant_hpp = (product.per_unit_hpp + variant.packaging_cost)
- variant_margin = ((variant.default_price - variant_hpp) / variant.default_price) * 100

**FR-PRD-04**: Product detail with variants
- Product detail page shows all variants with individual HPP and margin
- Variants can be selected when recording sales

### 2.11 Enhanced Inventory

**FR-INV-08**: Custom units
- Unit dropdown includes curated list + free-text "Lainnya..."
- Custom unit stored as-is on ingredient
- Display "(kustom)" suffix in dropdowns and list views

### 2.12 Offline Stock Opname

**FR-OPN-02**: Offline stock opname
- Service Worker caches ingredient list for offline access
- Physical counts entered offline, stored in IndexedDB
- When back online: sync adjustments → create inventory_transactions
- Conflict detection: if stock changed while offline, warn user

### 2.13 Cost Optimization Module

**FR-OPT-01**: Ingredient price comparison
- For any ingredient, show all other ingredients in the same category
- Display: name, current stock, latest price, price per unit
- Sort by price ascending to show cheapest options

**FR-OPT-02**: Recipe cost optimization
- On recipe detail page, highlight ingredients where a cheaper substitute exists
- Show: current ingredient cost, cheapest alternative cost, potential savings
- One-tap "Ganti" button to update recipe_item with cheaper ingredient

**FR-OPT-03**: Optimization report
- Show total potential savings if all cheaper substitutes were applied
- List of suggested replacements with savings per item

### 2.14 Reorder Module

**FR-REO-01**: Auto-reorder suggestions
- For each ingredient where current_stock <= min_stock_level:
  - Show last supplier, last price, last purchase date
  - "Tambah Stok" one-tap action → pre-fill stock-in form
- Sorted by urgency (stock level / min level ratio)

**FR-REO-02**: Reorder from dashboard
- Dedicated "Pesan Stok" section on dashboard
- Each item: ingredient name, supplier, last price, action button
- Ignored ingredients can be dismissed (snooze 7 days)

### 2.15 Sales Trends Module

**FR-TRD-01**: Week-over-week comparison
- Compare current week sales vs previous week
- Display: revenue change %, top product change
- Shown on dashboard

**FR-TRD-02**: Top/bottom products
- Top 5 selling products (by revenue)
- Bottom 5 products (by revenue, with sales in period)
- Shown on dashboard or sales page

**FR-TRD-03**: Trend indicators
- Per product: ↑ stable ↓ indicators based on 4-week trend
- Revenue trend: daily chart (last 14 days) — text-based, no chart library

### 2.16 Voice Input Module

**FR-VOI-01**: Voice-input stock opname
- On stock opname page, microphone button per ingredient
- Uses Web Speech API (SpeechRecognition) — Chrome/Edge only
- Voice input enters physical count number
- Falls back to keyboard entry on unsupported browsers
- Instructional tooltip: "Coba: 'dua belas' atau 'nol koma lima'"

---

## 3. Business Rules

**BR-01**: All data belongs to an organization
**BR-02**: One user per org in Free tier (future: multi-user)
**BR-03**: current_stock is maintained via DB trigger on inventory_transactions
**BR-04**: ingredient purchase price is the latest stock-in unit_price
**BR-05**: Recipe costs are snapshots. Recalculation is manual.
**BR-06**: Stock cannot go negative without explicit adjustment
**BR-07**: Deleting an ingredient is blocked if used in any recipe_item
**BR-08**: Deleting a supplier is blocked (soft) if has transactions
**BR-09**: Deleting a recipe is blocked if linked to a product

---

## 4. Error Handling

**EH-01**: API errors return structured JSON: `{ error: string, code: string }`
**EH-02**: TanStack Query retry (3 attempts, exponential backoff)
**EH-03**: Inline form validation
**EH-04**: Last-write-wins for concurrent edits

---

## 5. Performance

**PR-01**: Page load < 2s on 4G
**PR-02**: RLS queries < 200ms
**PR-03**: Recipe cost calc < 1s (200 items)
**PR-04**: Pagination: 20 items per page
**PR-05**: Index on organization_id, created_at, foreign keys

---

## 6. Security

**SR-01**: RLS on ALL tables
**SR-02**: UUID primary keys
**SR-03**: HTTPS only
**SR-04**: Input sanitization
**SR-05**: Rate limiting on auth
**SR-06**: Session timeout 30 min

---

## 7. Data Retention

**DR-01**: Free tier: 3 months sales history
**DR-02**: Pro tier: unlimited
**DR-03**: Deleted org: 30-day soft delete, then purge
