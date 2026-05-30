# Batchly — Wireframes

All screens are described for mobile-first (375px width). Desktop adapts with wider layouts and sidebar navigation.

**Visual style**: Clean, white backgrounds, generous whitespace, no decorative elements, text-primary (#111827), text-secondary (#6B7280), border (#E5E7EB), background (#F7F7F5).

---

## Screen 1: Login / Sign Up

```
┌──────────────────────────────┐
│                              │
│           Batchly            │
│     ───────────────────      │
│                              │
│     Masuk ke akun Anda       │
│                              │
│  ┌────────────────────────┐  │
│  │ Email                  │  │
│  └────────────────────────┘  │
│                              │
│  ┌────────────────────────┐  │
│  │ Password               │  │
│  └────────────────────────┘  │
│                              │
│  ┌────────────────────────┐  │
│  │      Masuk             │  │
│  └────────────────────────┘  │
│                              │
│  ──── atau masuk dengan ──── │
│                              │
│  ┌────────────────────────┐  │
│  │  Google                │  │
│  └────────────────────────┘  │
│                              │
│  Belum punya akun? Daftar   │
│                              │
└──────────────────────────────┘
```

**Elements**: Centered card on desktop, full-width on mobile. Single column. Two buttons (primary email, secondary Google). Link to signup.

---

## Screen 2: Dashboard (Home)

```
┌──────────────────────────────┐
│  Batchly                 👤  │  ← Top bar
│  Selasa, 20 Mei 2026        │
├──────────────────────────────┤
│                              │
│  ┌──────┐ ┌──────┐ ┌──────┐ │
│  │ Resep│ │ Bahan│ │ Laba │ │
│  │  12  │ │ 34   │ │2.4jt │ │
│  │      │ │⚠️ 2  │ │      │ │
│  └──────┘ └──────┘ └──────┘ │  ← 3 summary cards
│                              │
│  ── Stok Menipis ──────────  │
│                              │
│  Tepung Terigu      2 kg    │
│  ─────────────────────────  │
│  Gula Pasir         1 kg    │
│  ─────────────────────────  │
│  Lihat semua →              │
│                              │
│  ── Aktivitas Terbaru ────  │
│                              │
│  08:00  Stok Masuk          │
│         Tepung (+5 kg)      │
│  07:30  Penjualan           │
│         Brownies (12 pcs)   │
│  07:00  Stok Opname         │
│         3 bahan disesuaikan │
│                              │
├──────────────────────────────┤
│  📦  📋  💰  ⚙️             │  ← Bottom nav
│ Stok Resep Jual Pengaturan  │
└──────────────────────────────┘
```

**Elements**: 
- Top bar: app name left, profile/avatar right
- 3 summary cards in a horizontal row (scrollable on very small screens)
- Low stock section: list of items with inline "tambah stok" tap target
- Activity feed: latest 10 events, mixed types
- Bottom nav: 4 tabs (Inventory, Recipes, Sales, Settings)

---

## Screen 3: Inventory List

```
┌──────────────────────────────┐
│  ← Stok                 +   │  ← Back/Title/Action
├──────────────────────────────┤
│                              │
│  ┌────────────────────────┐  │
│  │ Cari bahan...          │  │  ← Search bar
│  └────────────────────────┘  │
│                              │
│  ── Bahan Baku ────────────  │
│                              │
│  Tepung Terigu       5 kg   │
│  Harga: Rp 12.000/kg        │
│  ─────────────────────────  │
│  Gula Pasir          2 kg ⚠️│
│  Harga: Rp 15.000/kg        │
│  ─────────────────────────  │
│  Telur              12 pcs  │
│  Harga: Rp 2.500/pcs        │
│                              │
│  ── Bumbu & Rempah ────────  │
│                              │
│  Vanili              3 sdt  │
│  Coklat Bubuk      500 g    │
│                              │
├──────────────────────────────┤
│     [Stok Masuk] [Stok Opname]│  ← Two secondary buttons
└──────────────────────────────┘
```

**Elements**:
- Grouped by category with section headers
- Each row: ingredient name, current stock, price per unit
- Low stock indicator: orange dot/text ⚠️
- Search filters by name
- Two action buttons at bottom: "Stok Masuk", "Stok Opname"

---

## Screen 4: Ingredient Detail + Movements

```
┌──────────────────────────────┐
│  ← Stok                     │
├──────────────────────────────┤
│  Tepung Terigu              │  ← Ingredient name (large)
│  ─────────────────────────  │
│                              │
│  Stok Saat Ini    5 kg      │
│  Harga Terakhir   Rp 12.000 │
│  Stok Minimal     2 kg      │
│                              │
│  ── Riwayat Pergerakan ───  │
│                              │
│  20 Mei    +5 kg  Rp 60.000 │
│           Stok Masuk        │
│           Pemasok: Toko Maju│
│  ─────────────────────────  │
│  18 Mei    -2 kg            │
│           Terpakai          │
│           Produksi 24 pcs   │
│  ─────────────────────────  │
│  15 Mei   +10 kg Rp 120.000│
│           Stok Masuk        │
│                              │
│  ┌────────────────────────┐  │
│  │   Stok Masuk  │ Stok   │  │
│  │               │ Keluar │  │
│  └────────────────────────┘  │
└──────────────────────────────┘
```

**Elements**:
- Ingredient info section (stock, latest price, min stock)
- Full transaction history, paginated
- Two action buttons: "Stok Masuk" and "Stok Keluar"
- Each transaction shows: date, quantity (colored: green for in, red for out), price, notes, supplier

---

## Screen 5: Stock-In Form

```
┌──────────────────────────────┐
│  ← Stok Masuk          Simpan│
├──────────────────────────────┤
│                              │
│  Bahan                      │
│  ┌────────────────────────┐  │
│  │ Pilih bahan...    ▼    │  │  ← Searchable dropdown
│  └────────────────────────┘  │
│                              │
│  Jumlah                     │
│  ┌────────────────────────┐  │
│  │ 0                       │  │  ← Numeric input
│  └────────────────────────┘  │
│                              │
│  Harga Satuan               │
│  ┌────────────────────────┐  │
│  │ Rp 0                    │  │
│  └────────────────────────┘  │
│                              │
│  Pemasok (opsional)          │
│  ┌────────────────────────┐  │
│  │ Pilih pemasok...   ▼   │  │
│  │ [Tambah pemasok baru]  │  │
│  └────────────────────────┘  │
│                              │
│  Tanggal                    │
│  ┌────────────────────────┐  │
│  │ 20 Mei 2026        ▼   │  │
│  └────────────────────────┘  │
│                              │
│  Total: Rp 0 (dihitung otomatis)│
└──────────────────────────────┘
```

**Elements**:
- Full-screen form (pushes to new page on mobile)
- Top bar: back arrow, title, "Simpan" button
- Form fields: ingredient (dropdown), quantity (numeric), unit price (numeric, pre-filled from latest), supplier (dropdown, optional), date
- Total displayed below form (computed: qty × price)
- "Tambah pemasok baru" option in supplier dropdown

---

## Screen 6: Stock Opname

```
┌──────────────────────────────┐
│  ← Stok Opname    Konfirmasi │
├──────────────────────────────┤
│                              │
│  Catat jumlah fisik bahan    │
│  Anda. Sistem akan           │
│  menghitung selisih.         │
│                              │
│  ┌────────────────────────┐  │
│  │ Cari bahan...          │  │
│  └────────────────────────┘  │
│                              │
│  Tepung Terigu              │
│  Sistem: 5 kg               │
│  Fisik:  [ 4.5  ] kg        │  ← Editable input
│  Selisih: -0.5 kg           │  ← Calculated, red
│  ─────────────────────────  │
│                              │
│  Gula Pasir                 │
│  Sistem: 2 kg               │
│  Fisik:  [ 2    ] kg        │
│  Selisih: 0                 │  ← Green "cocok"
│  ─────────────────────────  │
│                              │
│  Telur                      │
│  Sistem: 12 pcs             │
│  Fisik:  [ 10   ] pcs       │
│  Selisih: -2 pcs            │  ← Red
│                              │
│  Ringkasan:                  │
│  3 bahan diperiksa          │
│  2 bahan perlu penyesuaian  │
│                              │
│  ┌────────────────────────┐  │
│  │   Konfirmasi Opname    │  │
│  └────────────────────────┘  │
└──────────────────────────────┘
```

**Elements**:
- Instruction text at top
- Searchable list of all ingredients
- Each row: ingredient name, system qty, physical qty input, calculated difference
- Difference colored: green if 0, orange/red if not
- Summary bar at bottom: checked count, adjustments needed
- "Konfirmasi Opname" button → confirmation modal → execute adjustments

---

## Screen 7: Recipes List

```
┌──────────────────────────────┐
│  ← Resep                 +  │
├──────────────────────────────┤
│                              │
│  ┌────────────────────────┐  │
│  │ Cari resep...          │  │
│  └────────────────────────┘  │
│                              │
│  Brownies Coklat            │
│  Hasil: 24 pcs              │
│  HPP: Rp 42.000             │
│  Harga Jual: Rp 85.000      │
│  Margin: 50%                │
│  ─────────────────────────  │
│                              │
│  Cold Brew Vanilla          │
│  Hasil: 5 liter             │
│  HPP: Rp 65.000             │
│  Harga Jual: Rp 120.000     │
│  Margin: 45%                │
│  ─────────────────────────  │
│                              │
│  Tiramisu Classic           │
│  Hasil: 10 box              │
│  HPP: Rp 95.000             │
│  Harga Jual: Rp 150.000     │
│  Margin: 36%                │
│                              │
└──────────────────────────────┘
```

**Elements**:
- List of recipe cards
- Each card: name, yield, HPP total, selling price, margin %
- Tap row → recipe detail
- "+" button → new recipe form

---

## Screen 8: Recipe Detail

```
┌──────────────────────────────┐
│  ← Resep            ⋮       │
├──────────────────────────────┤
│                              │
│  Brownies Coklat            │
│  ─────────────────────────  │
│                              │
│  Hasil Jadi      24 pcs     │
│  Harga Jual      Rp 85.000  │
│                              │
│  ── Bahan ─────────────────  │
│                              │
│  Tepung Terigu   2 kg       │
│                Rp 24.000    │
│  ─────────────────────────  │
│  Gula Pasir      1 kg       │
│                Rp 15.000    │
│  ─────────────────────────  │
│  Telur           6 pcs      │
│                Rp 15.000    │
│  ─────────────────────────  │
│  Coklat Bubuk    250 g      │
│                Rp 20.000    │
│                              │
│  ── Biaya ─────────────────  │
│                              │
│  Biaya Bahan      Rp 74.000 │
│  Overhead (10%)   Rp 7.400  │
│  Kemasan          Rp 5.000  │
│  ─────────────────────────  │
│  Total HPP        Rp 86.400 │
│  HPP per pcs      Rp 3.600  │
│  Margin           50.6%     │
│                              │
│  ┌────────────────────────┐  │
│  │  Perbarui Harga Bahan  │  │
│  └────────────────────────┘  │
│  ┌────────────────────────┐  │
│  │  Duplikat Resep        │  │
│  └────────────────────────┘  │
│  ┌────────────────────────┐  │
│  │  Buat Produk           │  │
│  └────────────────────────┘  │
└──────────────────────────────┘
```

**Elements**:
- Header: recipe name, yield, selling price
- Ingredients section: list with quantity and cost
- Cost breakdown: bahan, overhead, kemasan, total HPP, per-unit HPP, margin
- Three action buttons: "Perbarui Harga Bahan" (recalculate), "Duplikat Resep", "Buat Produk"
- Menu (⋮): edit, delete

---

## Screen 9: Products List

```
┌──────────────────────────────┐
│  ← Produk                +  │
├──────────────────────────────┤
│                              │
│  Brownies Coklat            │
│  SKU: BRW-001               │
│  HPP: Rp 3.600/pcs          │
│  Harga: Rp 85.000           │
│  Margin: 50.6%              │
│  ─────────────────────────  │
│                              │
│  Cold Brew Vanilla          │
│  SKU: CBV-001               │
│  HPP: Rp 13.000/liter       │
│  Harga: Rp 120.000          │
│  Margin: 45.8%              │
│  ─────────────────────────  │
│                              │
│  Tiramisu Classic           │
│  SKU: TRM-001               │
│  HPP: Rp 9.500/box          │
│  Harga: Rp 150.000          │
│  Margin: 36.3%              │
│                              │
└──────────────────────────────┘
```

**Elements**: Product cards with key metrics. Margin is colored: green (>40%), yellow (20-40%), red (<20%).

---

## Screen 10: Sales List

```
┌──────────────────────────────┐
│  ← Penjualan                │
├──────────────────────────────┤
│                              │
│  ┌────────────────────────┐  │
│  │ 20 Mei 2026       ▼    │  │  ← Date filter
│  └────────────────────────┘  │
│                              │
│  ── Ringkasan Hari Ini ────  │
│  Total: Rp 340.000           │
│  HPP:   Rp 158.400           │
│  Laba:  Rp 181.600 (53%)    │
│                              │
│  08:30  Brownies    12 pcs  │
│         Rp 85.000           │
│         Laba: Rp 43.200     │
│  ─────────────────────────  │
│                              │
│  10:00  Cold Brew    2 L    │
│         Rp 120.000          │
│         Laba: Rp 48.000     │
│  ─────────────────────────  │
│                              │
│  14:00  Tiramisu     1 box  │
│         Rp 150.000          │
│         Laba: Rp 45.500     │
│                              │
├──────────────────────────────┤
│     [+ Catat Penjualan]     │
└──────────────────────────────┘
```

**Elements**:
- Date filter at top (default: today)
- Summary bar: total revenue, total HPP, total profit, margin %
- Sale entries: time, product name, quantity, revenue, profit per entry
- FAB-like button at bottom: "Catat Penjualan"

---

## Screen 11: Suppliers List

```
┌──────────────────────────────┐
│  ← Pemasok               +  │
├──────────────────────────────┤
│                              │
│  ┌────────────────────────┐  │
│  │ Cari pemasok...        │  │
│  └────────────────────────┘  │
│                              │
│  Toko Maju                   │
│  Hub: Bu Rina               │
│  0812-3456-7890              │
│  Transaksi: 12               │
│  ─────────────────────────  │
│                              │
│  Bahan Kita                  │
│  Hub: Pak Agus              │
│  0878-9012-3456              │
│  Transaksi: 8                │
│  ─────────────────────────  │
│                              │
│  Pasar Induk                 │
│  Transaksi: 3                │
│                              │
└──────────────────────────────┘
```

**Elements**: Supplier cards with contact info and transaction count. Tap → supplier detail.

---

## Screen 12: Supplier Detail

```
┌──────────────────────────────┐
│  ← Pemasok           Edit   │
├──────────────────────────────┤
│                              │
│  Toko Maju                  │
│  ─────────────────────────  │
│                              │
│  Kontak Person: Bu Rina     │
│  No. Telepon: 0812-3456-7890│
│  Email: toko.maju@email.com │
│  Alamat: Jl. Merdeka No. 10 │
│  Catatan: Bayar tunai       │
│                              │
│  ── Ringkasan Pembelian ──  │
│  Total: Rp 3.450.000        │
│  Transaksi: 12               │
│  Terakhir: 15 Mei 2026      │
│                              │
│  ── Riwayat Pembelian ────  │
│                              │
│  15 Mei  Tepung   5 kg      │
│          Rp 60.000          │
│  ─────────────────────────  │
│  10 Mei  Gula     3 kg      │
│          Rp 45.000          │
│  ─────────────────────────  │
│  5 Mei   Telur    12 pcs    │
│          Rp 30.000          │
│                              │
└──────────────────────────────┘
```

**Elements**:
- Contact info card
- Purchase summary (total spent, transaction count, last purchase)
- Purchase history (all inventory_transactions for this supplier)

---

## Screen 13: Settings

```
┌──────────────────────────────┐
│  ← Pengaturan               │
├──────────────────────────────┤
│                              │
│  Profil                     │
│  ┌────────────────────────┐  │
│  │ 👤 Nama Pengguna       │  │
│  │  Nama Bisnis           │  │
│  └────────────────────────┘  │
│                              │
│  ── Bisnis ────────────────  │
│                              │
│  Nama Bisnis                 │
│  Kitchen Rina               │
│  ─────────────────────────  │
│                              │
│  Paket: Gratis              │
│  10 dari 10 resep terpakai  │
│  ─────────────────────────  │
│                              │
│  ── Lainnya ───────────────  │
│                              │
│  Bahasa: Indonesia           │
│  ─────────────────────────  │
│  Tentang Batchly             │
│  ─────────────────────────  │
│  Keluar                     │
│                              │
└──────────────────────────────┘
```

**Elements**: Simple settings list. Profile section, organization info, subscription info, language selector, logout.

---

## Navigation Structure

### Mobile (Bottom Tab Bar)
| Icon | Label | Route |
|------|-------|-------|
| 📋 | Stok | /app/inventory |
| 📝 | Resep | /app/recipes |
| 💰 | Jual | /app/sales |
| ⚙️ | Lainnya | /app/settings |

*Note: Icons shown here for documentation. Actual implementation uses text labels with optional icons per the "text-first" principle. The bottom nav is text-primary for active tab, text-secondary for inactive.*

### Desktop (Left Sidebar)
```
Batchly
────────
⌂ Dashboard
📋 Stok
└ Bahan
└ Pemasok
└ Stok Opname
📝 Resep
└ Resep
└ Produk
💰 Penjualan
└ Catat Jual
└ Riwayat
⚙️ Pengaturan
```

### Quick Actions (Mobile)
Floating action button on dashboard: "Catat Penjualan" (text button, not icon-only)
Additional actions exposed inline in relevant pages (not hidden in menus).
