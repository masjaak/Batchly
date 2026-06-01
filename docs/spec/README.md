# Takar — Dokumentasi

> **Takar** (codename, bebas diganti) — alat bantu usaha kopi & pastry: **catat penjualan + hitung HPP + kelola stok bahan + daftar vendor & harga**, dalam satu app. Web app desktop/tablet-first, tampilan **monokrom** (tanpa warna/ikon/gradasi), font **Poppins**, data di **Supabase**.

Untuk dipakai pribadi dulu (kamu: kopi; istri: pastry/bakery), dirancang siap **scale-up** jadi multi-akun/SaaS tanpa bongkar ulang.

---

## Cara baca dokumen ini
Baca **berurutan** 00 → 12 untuk paham menyeluruh. Kalau langsung mau membangun, fokus ke 03, 04, 08, lalu ikuti 11.

| # | Dokumen | Isi | Untuk siapa |
|---|---|---|---|
| 00 | [Product Vision](00_PRODUCT_VISION.md) | masalah, tujuan, user, scope fase 1 vs nanti, prinsip | semua |
| 01 | [UI/UX Guidelines](01_UI_UX_GUIDELINES.md) | aturan keras monokrom: tanpa warna/ikon/gradasi, estetika editorial | desain & frontend |
| 02 | [App Flow](02_APP_FLOW.md) | alur dari input bahan → HPP → penjualan → sales board | semua |
| 03 | [Data Model](03_DATA_MODEL.md) | entitas, relasi, kolom, multi-tenant-ready, snapshot HPP | backend/data |
| 04 | [Design System](04_DESIGN_SYSTEM.md) | token warna terang/gelap, Poppins, spacing, tombol seragam, dropdown | desain & frontend |
| 05 | [Component Spec](05_COMPONENT_SPEC.md) | daftar & spec komponen reusable | frontend |
| 06 | [Page Spec](06_PAGE_SPEC.md) | daftar halaman, isi, peta rute | frontend |
| 07 | [UI Behavior Rules](07_UI_BEHAVIOR_RULES.md) | state kosong/loading/error, validasi, konfirmasi, tema | frontend |
| 08 | [HPP Calculation Spec](08_HPP_CALCULATION_SPEC.md) | rumus HPP, overhead, margin, saran harga, contoh angka | semua (inti) |
| 09 | [Master Data CRUD Spec](09_MASTER_DATA_CRUD_SPEC.md) | operasi CRUD tiap entitas + izin | backend/frontend |
| 10 | [Input Examples](10_INPUT_EXAMPLES.md) | data contoh nyata Kopi & Pastry (seed/test) | semua |
| 11 | [Roadmap MVP](11_ROADMAP_MVP.md) | urutan bangun M0–M7 + Definition of Done | semua |
| 12 | [Tech Stack & Supabase](12_TECH_STACK_SUPABASE.md) | keputusan teknis, struktur proyek, multi-tenant, keamanan | dev |

---

## Keputusan kunci (ringkas)
- **Platform:** web app, **desktop/tablet-first**, tetap terbaca di HP.
- **Data:** **Supabase (Postgres)**. Relasional + auth/RLS siap untuk scale-up.
- **Multi-usaha:** 1 app, banyak **Workspace** (Kopi, Pastry). Data terisolasi per workspace.
- **Multi-tenant:** disiapkan di skema (`owner_id`+`business_id`), tapi **auth/login DITUNDA** ke Fase 2.
- **HPP:** food cost + overhead sederhana → **saran harga** dari target margin. Harga final tetap keputusan pemilik.
- **Lokasi BUKAN fitur** — app kasih angka jujur, penyesuaian lokasi dilakukan manual.
- **Tampilan:** monokrom (hitam/putih/abu), **tanpa** warna/ikon/logo/gradasi. Font **Poppins**. Angka **tabular-nums**. **Tombol seragam** (tinggi 40px). Tema **terang & gelap**; semua kontrol termasuk **dropdown ikut tema**.
- **Profit akurat:** tiap penjualan menyimpan **snapshot HPP** agar laporan lama tidak berubah saat harga bahan naik.

## Prinsip yang tidak bisa ditawar
1. **Jujur soal angka** — kalau data harga belum lengkap, tampilkan alasannya, **jangan menebak HPP**.
2. **Sederhana > lengkap** — fitur ditambah hanya kalau dipakai harian.
3. **Tenang secara visual** — keindahan dari tipografi, ruang, dan grid; bukan warna/ikon.
4. **Future-proof, bukan over-built** — struktur siap SaaS, tapi tidak membangun fitur akun sebelum perlu.

## Status
Tahap: **dokumentasi & perencanaan**. Belum ada kode. Mulai eksekusi dari **[11_ROADMAP_MVP.md](11_ROADMAP_MVP.md)** Milestone 0.

## Fase berikutnya (tidak dikerjakan sekarang)
Auth & login, RLS aktif, undang anggota + peran, laporan lanjutan, pengurangan stok otomatis, versi Android, billing.
