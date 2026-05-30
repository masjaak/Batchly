# Batchly — User Flows

## Design Principles

- Every critical action: 3 taps or less from the main screen
- Single-screen workflows preferred over multi-step wizards
- Default values pre-filled where possible
- Confirmation only for destructive actions
- Forms are full-screen on mobile

---

## Flow 1: Onboarding

**Goal**: Get user from signup to first recipe in under 5 minutes.

```
Step 1: Sign Up
  Screen: /signup
  Fields: Email, Password, Nama Bisnis (Business Name)
  Action: Tap "Daftar" → Auth + create organization

Step 2: Welcome
  Screen: /app/onboarding
  Content: "Selamat datang di Batchly!"
  Action: "Mulai dengan bahan baku pertama" CTA

Step 3: Add First Ingredient
  Screen: /app/inventory/new (inline within onboarding)
  Fields: Nama (e.g., "Tepung Terigu"), Satuan (kg), Stok Awal (5)
  Action: Tap "Simpan" → back to onboarding

Step 4: Create First Recipe
  Screen: /app/recipes/new (inline within onboarding)
  Fields: Nama Resep (e.g., "Brownies Coklat"), Hasil Jadi (24 pcs)
  Action: "Tambah Bahan" → select ingredient, enter quantity
  Action: Tap "Simpan" → onboarding complete

Step 5: Dashboard
  Screen: /app/dashboard
  Content: "Resep pertama berhasil dibuat!"
```

**Total taps**: ~15 (first time), ~3 for returning users to start recording sales.

---

## Flow 2: Record Inventory Stock-In

**Goal**: Log a purchase of ingredients from a supplier. 3 taps.

```
Starting point: Dashboard or Inventory list

Tap 1: "Stok Masuk" button (bottom of screen or inventory page)
  → Opens full-screen form: /app/inventory/stock-in

Tap 2: Fill form
  - Pilih Bahan: dropdown (searchable, filtered by org)
  - Jumlah: numeric input (pre-highlighted)
  - Harga Satuan: numeric input (pre-filled with previous price)
  - Pemasok: dropdown (optional, from supplier list)
  - Tanggal: date picker (default: today)

Tap 3: "Simpan" button
  → Insert inventory_transaction (type='in')
  → Trigger updates ingredient.current_stock and latest_price
  → Toast: "Stok berhasil ditambahkan"
  → Return to inventory list

Edge case: New ingredient needed?
  "Tambah Bahan Baru" link in ingredient dropdown → quick-add modal
  (name + unit + initial stock → saves and continues)
```

**Total taps**: 3 (after form fill)

---

## Flow 3: Record Inventory Stock-Out

**Goal**: Log ingredient usage, waste, or adjustment. 3 taps.

```
Starting point: Inventory list or Ingredient detail

Tap 1: "Stok Keluar" button
  → Opens form: /app/inventory/stock-out

Tap 2: Fill form
  - Pilih Bahan: dropdown
  - Jumlah: numeric input (negative sign implied)
  - Alasan: radio group (Terpakai, Kadaluarsa, Rusak, Penyesuaian)
  - Catatan: optional text

Tap 3: "Simpan"
  → Insert inventory_transaction (type='out')
  → Update stock
  → Toast confirmation
```

**Total taps**: 3

---

## Flow 4: Stock Opname

**Goal**: Physical inventory count and auto-reconciliation. ~3-5 taps.

```
Starting point: Inventory page → "Stok Opname" tab/button

Step 1: View list of all ingredients with system stock
  Screen: /app/inventory/opname
  Shows: ingredient name, system quantity, physical quantity (input)

Step 2: Enter physical quantities
  - Tap each ingredient row
  - Enter physical count in numeric field
  - System computes difference in real-time (colored indicator)

Step 3: Review & Confirm
  Tap "Konfirmasi Opname"
  → Summary: ingredients with differences highlighted
  → Tap "Setujui Perubahan"

Step 4: Done
  → For each ingredient with difference:
    INSERT inventory_transaction (type='adjustment', reason='opname')
  → Toast: "Opname selesai. X bahan disesuaikan."
  → Return to inventory page

Edge case: No differences? → "Semua cocok!" message, no transactions created.
```

**Total taps**: Depends on ingredient count, ~5 minimum for confirmation flow.

---

## Flow 5: Create Recipe

**Goal**: Define a production formula with ingredient costs. ~5 taps.

```
Starting point: Recipes tab → "+" button

Step 1: Recipe info
  Screen: /app/recipes/new (full-screen form)
  - Nama Resep: text input
  - Hasil Jadi: numeric + unit dropdown (pcs, box, jar, kg, liter)
  - Tap "Lanjut"

Step 2: Add ingredients
  Screen: recipe ingredient list (initially empty)
  Tap "Tambah Bahan"
    → Modal: select ingredient + enter quantity
    → cost_at_create auto-filled from latest price
    → Total cost updates in real-time
  Repeat for each ingredient

Step 3: Cost & Pricing (optional section, expandable)
  - Biaya Overhead (%): numeric
  - Biaya Kemasan (Rp): numeric
  - Harga Jual: numeric

Step 4: Review
  Screen shows:
  - Ingredient list with costs
  - Biaya Produksi: Rp X
  - Overhead: Rp X
  - Total HPP: Rp X
  - HPP per unit: Rp X
  - Margin: X%

Step 5: "Simpan Resep"
  → INSERT recipe + recipe_items
  → Toast: "Resep berhasil disimpan"
  → Navigate to recipe detail

Edge case: New ingredient needed mid-recipe?
  "Tambah Bahan Baru" link → quick-add modal → continues
```

**Total taps**: ~8-10 for full recipe with 3-4 ingredients. Acceptable for complex setup.

---

## Flow 6: Create Product

**Goal**: Link a recipe to a sellable product. 2 taps.

```
Starting point: Products tab → "+" button

Step 1: Fill form
  Screen: /app/products/new
  - Nama Produk: text (pre-filled from recipe name)
  - Resep: dropdown (select from recipes)
  - SKU: auto-generated, editable
  - Harga Jual: numeric (pre-filled from recipe.selling_price)

Step 2: "Simpan"
  → INSERT product
  → Display: HPP per unit + margin based on linked recipe
  → Toast: "Produk berhasil ditambahkan"
```

**Total taps**: 2

---

## Flow 7: Record Daily Sale

**Goal**: Log what was sold today. 3 taps.

```
Starting point: Sales tab or Dashboard

Tap 1: "Catat Penjualan" button
  → Opens form: /app/sales/new

Tap 2: Fill form
  - Produk: dropdown (from products list)
  - Jumlah Terjual: numeric (pre-highlighted)
  - Harga Jual: pre-filled from product.default_price (editable)
  - Tanggal: default today

Tap 3: "Simpan"
  → INSERT sale
  → Toast: "Penjualan tercatat"
  → Display: revenue, HPP, profit for this sale

Quick-entry variant (future): "Jual Cepat" button on dashboard
  → Tap product → enter qty → confirm
  → 2 taps total
```

**Total taps**: 3

---

## Flow 8: Add Supplier

**Goal**: Save a supplier's information. 2 taps.

```
Starting point: Suppliers tab

Tap 1: "+" button / "Tambah Pemasok"
  → Opens form: /app/suppliers/new

Tap 2: Fill required fields
  - Nama Pemasok*: text (required)
  - Kontak Person: text
  - No. Telepon: phone input
  - Email: email input
  - Alamat: text area
  - Catatan: text area

Tap 3: "Simpan"
  → INSERT supplier
  → Toast: "Pemasok berhasil ditambahkan"
  → Navigate to supplier detail

Quick-add during stock-in:
  Supplier dropdown includes "Tambah Pemasok Baru" option
  → Opens supplier form as modal
  → Save returns to stock-in form with supplier selected
```

**Total taps**: 2-3

---

## Flow 9: View Supplier Purchase History

**Goal**: See all past purchases from a supplier. 2 taps.

```
Starting point: Suppliers list

Tap 1: Tap supplier name/row
  → Navigate to /app/suppliers/:id

Screen layout:
  - Supplier info card: name, contact, phone
  - Summary: Total pengeluaran, Transaksi terakhir, Jumlah transaksi
  - Purchase list: all inventory_transactions linked to this supplier
    - Date, ingredient, quantity, unit_price, total
    - Paginated, 20 per page

Tap 2 (optional): Tap a purchase row
  → Navigate to ingredient detail for that transaction

No edit history — purchases are immutable (audit trail)
```

**Total taps**: 2

---

## Flow 10: Daily Dashboard Review

**Goal**: Check business health in under 10 seconds.

```
Starting point: App opens → Dashboard (default)

Screen layout (top to bottom):
  ┌─────────────────────┐
  │ Header: "Hari ini"  │
  │ Selasa, 20 Mei 2026 │
  ├─────────────────────┤
  │                     │
  │ [3 Summary Cards]   │
  │ ┌────────┐┌───────┐ │
  │ │ Resep  ││ Bahan │ │
  │ │   12   ││  34   │ │
  │ └────────┘└───────┘ │
  │ ┌─────────────────┐ │
  │ │ Laba Bulan Ini  │ │
  │ │   Rp 2.450.000  │ │
  │ └─────────────────┘ │
  ├─────────────────────┤
  │ ⚠️ Stok Menipis    │
  │ Tepung Terigu → 2kg │
  │ Gula Pasir   → 1kg │
  │ (Lihat semua →)    │
  ├─────────────────────┤
  │ Aktvitas Terbaru    │
  │ 08:00 Stok masuk:   │
  │   Tepung (+5kg)     │
  │ 07:30 Penjualan:    │
  │   Brownies (12 pcs) │
  └─────────────────────┘

Actions available from dashboard:
  - "Catat Penjualan" (FAB or bottom button)
  - "Stok Masuk" (quick action)
  - Tap low stock item → stock-in form
```

**Total taps to check health**: 0 (dashboard is home page)

---

## Flow 11: Record Production Batch

**Goal**: Log a production run with automatic ingredient deduction. 3 taps.

```
Starting point: Production tab (new) or Recipe detail

Tap 1: "Catat Produksi" button
  → Opens form: /app/production/new

Tap 2: Fill form
  - Resep: dropdown (select from recipes)
  - Jumlah Direncanakan: numeric (pre-filled from recipe.yield_amount)
  - Jumlah Aktual: numeric (editable — actual yield produced)
  - Tanggal Produksi: date picker (default: today)
  - Catatan: optional text

  Preview section (read-only):
  - "Stok akan otomatis dikurangi:"
  - Ingredient deductions list with quantities (recipe_item.qty × actual_qty / yield_amount)
  - Warning if any ingredient is below required amount (non-blocking)

Tap 3: "Simpan & Kurangi Stok"
  → INSERT production_batch
  → INSERT inventory_transactions (type='out', reason='produksi') for each ingredient
  → Toast: "Produksi tercatat. Stok bahan berkurang."
  → Navigate to batch detail

Edge case: No ingredients in recipe?
  → Allow batch but show "Tidak ada bahan yang dikurangi (resep kosong)"
```

**Total taps**: 3

---

## Flow 12: View Batch Cost Variance

**Goal**: See if actual costs matched planned. 2 taps.

```
Starting point: Production list → tap a batch row

Screen layout:
  - Header: Batch #BCH-20260530-001
  - Recipe details: name, planned_qty, actual_qty, date
  - Cost variance card:
    ┌──────────────────────────┐
    │ Planned Cost: Rp 120.000 │
    │ Actual Cost:  Rp 132.000 │ ← (higher because actual_qty > planned)
    │ Variance:     +Rp 12.000 │
    │ Variance %:   +10%       │
    └──────────────────────────┘
  - Ingredient deduction table:
    | Bahan          | Rencana | Aktual  | Biaya Rencana | Biaya Aktual |
    | Tepung Terigu  | 2 kg    | 2.4 kg  | Rp 20.000     | Rp 24.000    |
    | Gula Pasir     | 1 kg    | 1.2 kg  | Rp 15.000     | Rp 18.000    |
    | ...            | ...     | ...     | ...           | ...          |
  - Close: "Tutup" button

Interpretation:
  - Variance > 0: "Biaya lebih besar dari rencana" (unfavorable)
  - Variance < 0: "Biaya lebih kecil dari rencana" (favorable — overproduced)
  - Variance = 0: "Sesuai rencana"
```

**Total taps**: 2

---

## Flow 13: Export Inventory CSV

**Goal**: Download inventory data as spreadsheet. 2 taps.

```
Starting point: Inventory page

Tap 1: "Ekspor CSV" button (top right)
  → Immediately downloads file in browser

File contents:
  - Columns: Nama Bahan, Kategori, Satuan, Stok Saat Ini, Harga Satuan, Total Nilai
  - UTF-8 BOM for Excel compatibility
  - IDR format for prices

Tap 2 (optional): Open file in Excel/Google Sheets
```

**Total taps**: 1

---

## Flow 14: Create Product Variant

**Goal**: Add different packaging size for an existing product. 3 taps.

```
Starting point: Product detail page

Tap 1: "Tambah Varian" button
  → Opens form: /app/products/:id/variants/new

Tap 2: Fill form
  - Nama Varian*: text (e.g., "Kemasan 500g")
  - SKU: auto-generated, editable
  - Biaya Kemasan Tambahan: numeric (Rp per unit)
  - Harga Jual*: numeric

  Preview: "HPP Varian: Rp 25.000 (base HPP Rp 22.000 + kemasan Rp 3.000)"
  Preview: "Margin: 35%"

Tap 3: "Simpan Varian"
  → INSERT product_variant
  → Toast: "Varian berhasil ditambahkan"
  → Return to product detail showing variant

Edge case: Variant with same name → warn
```

**Total taps**: 3

---

## Summary: Tap Counts

| Flow | Taps | Frequency |
|------|------|-----------|
| Record sale | 3 | Daily (1-5x) |
| Stock-in | 3 | Weekly (2-5x) |
| Stock-out | 3 | Weekly (2-5x) |
| Stock opname | ~5 | Monthly |
| Create recipe | ~8 | Once per new product |
| Create product | 2 | Once per new product |
| Add supplier | 2-3 | Once per new supplier |
| View dashboard | 0 | Daily (5-10x) |
| View purchase history | 2 | Weekly |
| Record production batch | 3 | Daily (1-3x) |
| View batch variance | 2 | Per batch review |
| Export CSV | 1 | Weekly |
| Create product variant | 3 | Once per new variant |
