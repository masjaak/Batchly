# 11 — Roadmap MVP

Urutan membangun Fase 1. Disusun supaya tiap tahap **bisa dipakai** sebelum lanjut. Prinsip: bangun dari data → hitung → catat → lihat. Jangan loncat ke laporan sebelum data dasar jalan.

## Prinsip urutan
1. Bangun **pondasi data dulu** (bahan, vendor, harga) karena HPP bergantung padanya.
2. HPP sebelum penjualan (penjualan butuh harga & snapshot HPP).
3. Sales Board paling akhir (butuh data penjualan untuk berarti).
4. Tiap milestone harus benar-benar berfungsi, bukan setengah jadi.

---

## Milestone 0 — Fondasi proyek
**Tujuan:** kerangka app siap, tema & komponen dasar jalan.
- Setup project (lihat `12_TECH_STACK_SUPABASE.md`): framework, koneksi Supabase, env.
- Skema database (tabel dari `03_DATA_MODEL.md`).
- Token tema (terang/gelap) + Poppins + utility tabular-nums.
- Primitif: Button, Input, CurrencyInput, QuantityInput, Select kustom, Modal.
- AppShell + Sidebar (teks) + Header (WorkspaceSwitcher + ThemeToggle).
- **Selesai bila:** app jalan, bisa ganti tema, navigasi antar halaman kosong, ganti workspace.

## Milestone 1 — Master data: Bahan & Vendor
**Tujuan:** bisa input bahan & vendor.
- CRUD Bahan (list + modal create/edit + detail).
- CRUD Vendor (list + modal + detail).
- Empty/loading/error states.
- **Selesai bila:** bisa tambah/edit/hapus bahan & vendor di workspace Kopi dan Pastry secara terpisah.

## Milestone 2 — Harga bahan per vendor + Stok
**Tujuan:** tiap bahan punya harga/satuan dasar & stok.
- IngredientPriceTable di Detail Bahan + tambah harga vendor (konversi satuan → harga/satuan dasar).
- Pilih harga acuan (radio) + penanda "Termurah".
- Halaman Stok + update stok manual + status "Menipis".
- **Selesai bila:** bisa bandingkan harga vendor, set acuan, dan lihat stok menipis. Pakai data `10_INPUT_EXAMPLES.md` untuk verifikasi harga/satuan dasar.

## Milestone 3 — Produk + Resep
**Tujuan:** definisikan produk & resepnya.
- CRUD Produk (list + detail).
- RecipeEditor (tambah/hapus baris bahan + qty + yield).
- Food cost berjalan + badge "Tanpa harga" untuk bahan tanpa acuan.
- **Selesai bila:** bisa menyusun resep Es Kopi Susu & Butter Cookies persis seperti contoh, food cost cocok.

## Milestone 4 — Kalkulator HPP
**Tujuan:** angka HPP & saran harga benar.
- HppCalculatorPanel: food cost/unit, overhead, HPP/unit, target margin, saran harga (pembulatan ke atas kelipatan 500), harga jual final, margin aktual.
- Aturan "data tidak lengkap" (jangan tampilkan tebakan).
- **Selesai bila:** HPP & margin cocok dengan `08`/`10` (Es Kopi Susu HPP 8.300, dst). Kasus uji bahan tanpa harga menampilkan pesan, bukan angka.

## Milestone 5 — Pencatatan Penjualan
**Tujuan:** catat transaksi harian + snapshot HPP.
- SaleEntryForm (produk searchable, qty, harga prefilled, tanggal default hari ini, multi item).
- Simpan `hpp_snapshot` per item.
- DataTable transaksi + edit/hapus (soft delete).
- **Selesai bila:** bisa catat penjualan contoh; profit baris = (harga − hpp_snapshot) × qty benar.

## Milestone 6 — Sales Board & Dashboard
**Tujuan:** lihat omzet, unit, profit.
- SalesBoard: pemilih periode + StatCard Omzet/Unit/Profit + produk terlaris.
- Dashboard: ringkasan hari ini + "perlu perhatian" (stok menipis, produk tanpa harga, bahan tanpa acuan).
- **Selesai bila:** angka board cocok dengan contoh (Kopi: profit Rp 200.700 untuk hari contoh).

## Milestone 7 — Pengaturan & polish
**Tujuan:** rapikan & siap pakai harian.
- Pengaturan: kelola workspace (tambah/rename), tema.
- QA dua tema (terang/gelap) di semua halaman & dropdown.
- QA responsif desktop/tablet (mobile tetap terbaca).
- Review checklist `01` §9 di tiap layar.
- **Selesai bila:** lolos definisi sukses MVP — kamu & istri bisa pakai harian tanpa balik ke Excel.

---

## Definition of Done (tiap milestone)
- [ ] Berfungsi end-to-end untuk kedua workspace.
- [ ] Punya empty/loading/error state.
- [ ] Benar di tema terang & gelap (termasuk dropdown).
- [ ] Tidak ada warna/ikon/gradasi (checklist `01` §9).
- [ ] Tombol seragam; angka tabular-nums.
- [ ] Angka cocok dengan `10_INPUT_EXAMPLES.md` bila relevan.

## Yang DITUNDA (jangan dikerjakan di MVP)
- Login/Auth & RLS aktif → Fase 2.
- Undang anggota & peran → Fase 2.
- Pengurangan stok otomatis dari penjualan → Fase 2.
- Laporan lanjutan / grafik tren → Fase 2.
- Versi Android (Capacitor/PWA bungkus) → Fase 2.
- Billing → Fase 2.

## Urutan singkat (ringkas)
```
M0 Fondasi+Tema → M1 Bahan/Vendor → M2 Harga+Stok → M3 Produk+Resep
→ M4 HPP → M5 Penjualan → M6 Sales Board+Dashboard → M7 Pengaturan+Polish
```
