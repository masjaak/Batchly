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
