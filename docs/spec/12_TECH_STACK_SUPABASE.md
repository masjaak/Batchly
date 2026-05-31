# 12 — Tech Stack & Supabase

Keputusan teknis MVP. Tujuan: cukup untuk dipakai harian sekarang, **mulus di-scale-up** nanti tanpa bongkar ulang.

## 1. Ringkasan keputusan
| Area | Pilihan MVP | Alasan singkat |
|---|---|---|
| Jenis app | Web app (desktop/tablet-first, responsif) | cepat dibangun, bisa dibungkus Android nanti |
| Frontend | React + TypeScript + Vite | ekosistem matang, TS untuk angka uang aman |
| Styling | CSS variables (token tema) + utility ringan | kontrol penuh monokrom, mudah tema terang/gelap |
| Database & API | **Supabase (Postgres)** | relasional, cocok untuk HPP & laporan; auth & RLS siap pakai nanti |
| Auth (MVP) | **DITUNDA** (single-user) | belum perlu; struktur sudah disiapkan |
| Hosting | Vercel/Netlify (frontend) + Supabase (data) | gratis untuk skala pribadi |
| State/data fetching | TanStack Query (React Query) | caching, loading/error state rapi |

> Catatan: framework boleh disesuaikan saat eksekusi (mis. Next.js bila ingin SSR). Inti yang mengikat: **Supabase + Postgres + TypeScript + token tema monokrom**.

## 2. Kenapa Supabase (bukan Convex)
- Data Takar **sangat relasional** (bahan↔harga↔vendor↔resep↔produk↔penjualan) dan inti app adalah **agregasi/laporan** → wilayah SQL/Postgres.
- **Auth + Row Level Security** bawaan = jalan mulus jadi multi-tenant SaaS nanti tanpa ganti database.
- Portable: pada dasarnya Postgres standar.
- Convex unggul untuk real-time kolaboratif, tapi kebutuhan itu tidak ada di sini; query laporan jadi lebih manual.

## 3. Struktur proyek (acuan)
```
takar/
├── docs/                      ← dokumentasi ini
├── src/
│   ├── lib/
│   │   ├── supabase.ts        ← client Supabase
│   │   ├── money.ts           ← util Rupiah (integer ⇄ format)
│   │   └── hpp.ts             ← rumus HPP (dari doc 08), murni & teruji
│   ├── theme/
│   │   ├── tokens.css         ← token terang/gelap (dari doc 04)
│   │   └── ThemeProvider.tsx
│   ├── components/            ← primitif & komponen (doc 05)
│   ├── features/
│   │   ├── ingredients/  vendors/  prices/  products/
│   │   ├── recipes/  hpp/  sales/  stock/  dashboard/
│   ├── workspace/             ← WorkspaceSwitcher + context business_id
│   └── pages/                 ← rute (doc 06)
├── supabase/
│   ├── migrations/            ← SQL skema (doc 03)
│   └── seed.sql               ← data contoh (doc 10)
└── .env.local                 ← kunci Supabase (JANGAN commit)
```

## 4. Skema database (dari doc 03)
- Buat tabel: `businesses, ingredients, vendors, ingredient_prices, products, recipe_items, sales, sale_items`.
- Tipe kunci:
  - uang → `integer` (Rupiah penuh).
  - kuantitas → `numeric`.
  - id → `uuid` default `gen_random_uuid()`.
  - waktu → `timestamptz default now()`; tanggal jual → `date`.
- Kolom wajib tiap tabel bisnis: `owner_id uuid`, `business_id uuid`, `created_at`, `updated_at`, `deleted_at` (nullable).
- Index: `business_id` di semua tabel; `(business_id, deleted_at)`; FK ter-index (`ingredient_id`, `vendor_id`, `product_id`, `sale_id`).
- Kolom hitung: `ingredient_prices.price_per_base_unit` & `qty_in_base_unit` disimpan saat input (bisa generated column / dihitung di app).

## 5. Aturan multi-tenant (disiapkan, belum diaktifkan)
- MVP: `owner_id` diisi satu nilai konstan (mis. UUID lokal). Filter data **hanya** pakai `business_id`.
- Fase 2 (saat auth aktif):
  1. Pakai `auth.users` Supabase.
  2. Isi `owner_id = auth.uid()` di setiap insert.
  3. Aktifkan **RLS** tiap tabel:
     ```sql
     alter table ingredients enable row level security;
     create policy own_rows on ingredients
       for all using (owner_id = auth.uid())
       with check (owner_id = auth.uid());
     ```
  4. Tambah tabel `memberships(user_id, business_id, role)` untuk berbagi usaha ke anggota.
- **Tidak ada perubahan skema besar** — hanya nyalakan RLS + isi `owner_id` nyata.

## 6. Lapisan kalkulasi HPP
- `src/lib/hpp.ts` = fungsi **murni** (pure), input data resep+harga, output HPP/saran/margin. Tidak menyentuh DB/UI.
- Wajib ada unit test memakai angka dari `10_INPUT_EXAMPLES.md` (Es Kopi Susu HPP 8.300, dst). Ini pengaman utama "jujur soal angka".
- Pembulatan uang & "ceil ke kelipatan 500" diuji eksplisit.

## 7. Keamanan & rahasia
- Kunci Supabase di `.env.local`, **jangan commit**. Tambah `.env*` ke `.gitignore`.
- MVP tanpa auth = **jangan ekspos** instance ke publik tanpa proteksi. Pilihan aman:
  - Jalankan lokal / akses terbatas, atau
  - Pasang minimal gerbang (basic auth di hosting) sampai Fase 2 auth aktif.
- Jangan taruh data nyata sensitif sebelum RLS aktif bila app online.
- `service_role` key hanya untuk skrip/seed lokal, tidak pernah di frontend.

> Catatan keamanan penting: karena MVP belum ada autentikasi, endpoint data tidak boleh dianggap privat bila app dipublikasikan. Aktifkan auth+RLS (Fase 2) sebelum dipakai banyak orang / online publik.

## 8. Konfigurasi tema & font
- Token tema sebagai CSS variables di `:root` (terang) dan `[data-theme="dark"]` (gelap). Lihat doc 04.
- Poppins via Google Fonts atau self-host (400/500/600), `font-display: swap`.
- Util `.tnum { font-variant-numeric: tabular-nums; }` untuk semua angka.
- Preferensi tema & workspace aktif disimpan di `localStorage`.

## 9. Data fetching & state
- TanStack Query untuk semua baca data (otomatis loading/error → memetakan ke state di doc 07).
- Mutasi (create/update/delete) → invalidate query terkait + optimistic update untuk aksi kecil (update stok).
- Context `business_id` aktif membungkus semua query (filter by workspace).

## 10. Build Android (Fase 2, dicatat saja)
- Bungkus PWA atau pakai Capacitor untuk APK. Tidak dikerjakan di MVP.
- Karena desktop/tablet-first & responsif, transisi ke mobile-native nanti minim.

## 11. Checklist setup awal (M0)
- [ ] Buat project Supabase + dapatkan URL & anon key.
- [ ] `.env.local` + `.gitignore` aman.
- [ ] Jalankan migrations (skema doc 03).
- [ ] (Opsional) jalankan `seed.sql` dari data doc 10.
- [ ] Setup React+TS+Vite + TanStack Query + client Supabase.
- [ ] Pasang token tema + Poppins + ThemeProvider.
- [ ] Buat primitif UI + AppShell.
- [ ] `hpp.ts` + unit test lulus dengan angka contoh.
