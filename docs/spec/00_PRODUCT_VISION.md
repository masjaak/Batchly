# 00 — Product Vision

> Nama kerja: **Takar**. Placeholder, boleh diganti. (Takar = menakar bahan/porsi — nyambung ke resep & HPP.)

## 1. Masalah yang dipecahkan
Pelaku usaha kopi & pastry skala kecil biasanya:
- Tidak tahu **HPP (Harga Pokok Produksi)** tiap produk secara akurat, jadi menetapkan harga jual dengan menebak.
- Mencatat harga bahan dari beberapa vendor secara terpisah (chat, nota, ingatan) — sulit membandingkan.
- Mencatat penjualan di buku/Excel terpisah dari data biaya, jadi **tidak tahu profit sebenarnya**.

Takar menyatukan tiga hal itu: **biaya bahan → resep → HPP → harga jual → penjualan → profit** dalam satu alur.

## 2. Tujuan produk
Satu kalimat: **"Tahu modal tiap produk, tahu harus jual berapa, dan tahu sudah untung berapa."**

Tujuan terukur untuk versi pribadi (MVP):
1. Bisa hitung HPP satu produk dalam < 2 menit setelah bahan & resep terisi.
2. Bisa lihat omzet, unit terjual, dan profit hari ini dalam 1 layar (Sales Board).
3. Bisa bandingkan harga 1 bahan dari beberapa vendor dalam 1 tabel.

## 3. Pengguna
| Pengguna | Usaha | Kebutuhan utama |
|---|---|---|
| Pemilik (kamu) | Kopi | HPP minuman, stok biji/susu/sirup, vendor, catat penjualan harian |
| Istri | Pastry / Bakery | HPP per loyang/per pcs, stok tepung/butter/dll, vendor, catat penjualan |

Karakteristik penting: **bukan akuntan**. UI harus bisa dipakai tanpa training. Istilah dibuat sederhana (modal, harga jual, untung) bukan istilah akuntansi berat.

## 4. Konsep multi-usaha
Satu orang bisa punya **beberapa usaha** dalam satu akun. Di MVP, satu pengguna mengelola dua usaha (Kopi & Pastry) lewat pemisah **Workspace**. Setiap usaha punya data sendiri yang terisolasi: bahan, vendor, resep, produk, penjualan tidak tercampur.

Ini disiapkan dari awal di model data (lihat `03_DATA_MODEL.md`) supaya saat scale-up jadi SaaS tidak perlu bongkar struktur.

## 5. Scope

### FASE 1 — MVP (sekarang, pemakaian pribadi)
- Master data: **Bahan**, **Vendor**, **Harga bahan per vendor**, **Resep/BOM**, **Produk**.
- **Kalkulator HPP**: food cost dari resep + overhead sederhana → saran harga jual berdasarkan target margin.
- **Stok bahan**: jumlah saat ini, satuan, ambang stok menipis (peringatan sederhana, manual update).
- **Pencatatan penjualan**: input transaksi harian (produk, qty, harga).
- **Sales Board**: ringkasan omzet, unit terjual, profit (omzet − HPP) per periode.
- **Pemilih Workspace** (Kopi / Pastry).
- **Tema**: terang & gelap, monokrom.
- Penyimpanan: **Supabase (Postgres)**, single-user dulu.

### FASE 2 — Scale-up (nanti, bukan sekarang)
- Autentikasi & akun (login per orang).
- Row Level Security penuh & multi-tenant aktif (banyak pemilik).
- Undang anggota/karyawan ke sebuah usaha + peran (owner/staff).
- Laporan lanjutan (tren, margin per kategori, produk terlaris).
- Manajemen pembelian/PO ke vendor, riwayat perubahan harga.
- Versi Android (bungkus PWA / Capacitor).
- Billing / langganan.

### DI LUAR SCOPE (sengaja tidak dibuat)
- **Penyesuaian harga otomatis berdasarkan lokasi.** App hanya memberi angka dasar jujur (HPP + margin). Penyesuaian terhadap daya beli/harga sekitar adalah keputusan bisnis manual pemilik.
- POS/kasir lengkap dengan struk printer (MVP cukup catat penjualan).
- Integrasi marketplace / ojek online.
- Akuntansi penuh (jurnal, pajak, neraca).

## 6. Prinsip produk
1. **Jujur soal angka.** Lebih baik tampilkan "data belum cukup" daripada menebak. HPP yang salah lebih berbahaya daripada tidak ada HPP.
2. **Sederhana mengalahkan lengkap.** Fitur ditambah hanya kalau dipakai tiap hari.
3. **Cepat dipakai.** Input harian (penjualan) harus bisa selesai dalam hitungan detik.
4. **Tenang secara visual.** Monokrom, tanpa hiasan. Lihat `01_UI_UX_GUIDELINES.md`.
5. **Future-proof, bukan over-built.** Struktur data siap multi-tenant, tapi fitur akun ditunda sampai benar-benar perlu.

## 7. Definisi sukses MVP
MVP dianggap berhasil kalau **kamu dan istri benar-benar memakainya tiap hari untuk usaha masing-masing** selama minimal 2 minggu tanpa balik ke Excel.
