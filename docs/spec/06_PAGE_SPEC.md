# 06 — Page Spec

Daftar halaman MVP dan isi tiap halaman. Komponen merujuk ke `05_COMPONENT_SPEC.md`. Semua halaman berada dalam **AppShell** (sidebar + header dengan WorkspaceSwitcher & ThemeToggle).

Rute memakai prefiks workspace aktif secara implisit (data difilter `business_id`).

---

## 1. Dashboard — `/`
**Tujuan:** ringkasan cepat kondisi usaha hari ini.
- PageHeader: "Dashboard".
- 3 StatCard: **Omzet hari ini**, **Unit terjual hari ini**, **Profit hari ini**.
- Section "Perlu perhatian": daftar bahan **Menipis** (dari StockList ringkas), produk **tanpa harga jual**, bahan **tanpa harga acuan**.
- Section "Ringkas 7 hari": StatCard omzet & profit 7 hari + daftar produk terlaris.
- Empty state (belum ada data): ajakan "Mulai dari menambah bahan" → tombol ke `/bahan`.

## 2. Penjualan — `/penjualan`
**Tujuan:** catat penjualan & lihat Sales Board.
- PageHeader: "Penjualan", action "Catat Penjualan" (buka SaleEntryForm di modal/panel).
- **SalesBoard**: pemilih periode + 3 StatCard (Omzet, Unit, Profit) + tabel produk terlaris.
- **DataTable transaksi**: tanggal, produk, qty, harga, profit (= (harga − hpp_snapshot) × qty). Aksi baris: lihat/hapus.
- Empty state: "Belum ada penjualan" → tombol "Catat Penjualan".

## 3. Produk — `/produk`
**Tujuan:** kelola produk + harga jual + masuk ke HPP.
- PageHeader: "Produk", action "Tambah Produk".
- DataTable: nama, kategori, **HPP/unit**, **harga jual**, **margin aktual**, status (badge "Tanpa harga" / "HPP belum lengkap"). 
- Klik baris → **Detail Produk** (`/produk/:id`).

### 2b. Detail Produk — `/produk/:id`
- PageHeader: nama produk.
- Tab/section: **Resep** (RecipeEditor) + **HPP** (HppCalculatorPanel) dalam satu layar (resep di kiri, HPP di kanan pada desktop).
- Field produk: kategori, yield (qty + unit), overhead, target margin, harga jual final.
- Menampilkan margin aktual live saat harga jual diubah.

## 4. Resep — `/resep`
**Tujuan:** akses resep lintas produk (alternatif masuk dari Produk).
- PageHeader: "Resep".
- DataTable produk + jumlah bahan dalam resep + food cost/unit + status kelengkapan.
- Klik → Detail Produk (section resep).
- *Catatan:* Resep selalu milik satu produk; halaman ini hanya pintu masuk cepat.

## 5. Bahan — `/bahan`
**Tujuan:** master bahan + harga per vendor + stok.
- PageHeader: "Bahan", action "Tambah Bahan".
- DataTable: nama, satuan dasar, kategori, **harga acuan/satuan**, **stok**, badge "Menipis"/"Tanpa harga".
- Klik baris → **Detail Bahan** (`/bahan/:id`).

### 5b. Detail Bahan — `/bahan/:id`
- Field bahan: nama, satuan dasar, kategori, stok, ambang menipis.
- **IngredientPriceTable**: daftar harga dari berbagai vendor + pilih **harga acuan** (radio) + penanda "Termurah".
- Action: "Tambah Harga Vendor" (modal: pilih vendor, harga beli, jumlah + satuan beli → app hitung harga/satuan dasar).

## 6. Vendor — `/vendor`
**Tujuan:** master vendor.
- PageHeader: "Vendor", action "Tambah Vendor".
- DataTable: nama, kontak, jumlah bahan yang dipasok, catatan.
- Klik baris → Detail Vendor (`/vendor/:id`): info vendor + daftar bahan & harga yang dipasok vendor ini.

## 7. Stok — `/stok`
**Tujuan:** pantau & update stok bahan.
- PageHeader: "Stok".
- **StockList** (DataTable): bahan, stok saat ini, satuan, ambang, status. Baris menipis ditandai garis kiri + badge.
- Aksi: "Update Stok" (modal kecil: set jumlah baru).
- Filter cepat (Select): Semua / Menipis.

## 8. Pengaturan — `/pengaturan`
**Tujuan:** kelola workspace & preferensi.
- Section **Workspace**: daftar usaha (Kopi/Pastry), tambah/rename usaha, set tipe.
- Section **Tampilan**: ThemeToggle (terang/gelap) + catatan font (Poppins, tetap).
- Section **Data**: ekspor data (CSV) — opsional MVP.
- Section **Tentang**: versi app, catatan Fase 2 (akun/login akan datang).

---

## Aturan umum halaman
1. Setiap halaman daftar punya **3 state**: kosong (EmptyState), loading (skeleton), error (pesan + retry). Lihat `07_UI_BEHAVIOR_RULES.md`.
2. Hanya **1 tombol primary** per halaman (di PageHeader action).
3. Form tambah/edit memakai **modal** untuk entitas sederhana (Bahan, Vendor, Harga, Update Stok) dan **halaman detail** untuk entitas kompleks (Produk + Resep + HPP).
4. Semua angka uang format Rupiah; semua kolom angka tabular-nums & rata kanan.
5. Workspace aktif memfilter SEMUA data halaman.
6. Navigasi & semua kontrol mengikuti tema aktif.

## Peta navigasi
```
AppShell
├── / .................. Dashboard
├── /penjualan ......... Penjualan + Sales Board
├── /produk ............ Produk (list)
│   └── /produk/:id ..... Detail Produk (Resep + HPP)
├── /resep ............. Resep (pintu masuk cepat)
├── /bahan ............. Bahan (list)
│   └── /bahan/:id ...... Detail Bahan (harga per vendor + stok)
├── /vendor ............ Vendor (list)
│   └── /vendor/:id ..... Detail Vendor
├── /stok .............. Stok
└── /pengaturan ........ Pengaturan (workspace, tema)
```
