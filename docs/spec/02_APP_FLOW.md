# 02 — App Flow

Alur pemakaian dari nol sampai melihat profit. Ditulis sebagai urutan langkah supaya jadi acuan saat membangun halaman.

## 1. Alur besar (the golden path)
```
Pilih Workspace (Kopi / Pastry)
        │
        ▼
[1] Input BAHAN  ──►  [2] Input VENDOR  ──►  [3] Harga bahan per vendor
        │
        ▼
[4] Buat RESEP (produk butuh bahan apa & berapa)
        │
        ▼
[5] HITUNG HPP  ──►  set target margin ──► dapat SARAN HARGA JUAL
        │
        ▼
[6] Tetapkan harga jual produk (final, manual)
        │
        ▼
[7] Catat PENJUALAN harian (produk, qty, harga)
        │
        ▼
[8] SALES BOARD: omzet, unit, profit (= omzet − HPP)
```

Stok bahan berjalan paralel: tiap bahan punya jumlah stok yang di-update manual; saat di bawah ambang muncul label "Menipis".

## 2. Penjelasan tiap langkah

### [0] Pilih Workspace
- Saat buka app, pengguna memilih usaha aktif: **Kopi** atau **Pastry**.
- Semua data yang tampil setelahnya hanya milik workspace itu.
- Workspace aktif bisa diganti kapan saja dari header.

### [1] Input Bahan
- Field: nama bahan, **satuan dasar** (gram, ml, pcs), kategori (opsional), stok awal, ambang menipis.
- Satuan dasar penting: semua perhitungan resep memakai satuan dasar ini.
- Contoh: "Susu UHT" satuan dasar `ml`; "Tepung terigu" satuan dasar `gram`.

### [2] Input Vendor
- Field: nama vendor, kontak (opsional), catatan (opsional).
- Vendor adalah tempat beli bahan. Satu bahan bisa dijual banyak vendor.

### [3] Harga Bahan per Vendor
- Hubungkan **bahan × vendor → harga**.
- Field: bahan, vendor, **harga beli**, **jumlah yang didapat** + **satuan beli** (mis. beli 1 dus = 1000 ml, atau 1 sak = 25.000 gram).
- App menghitung **harga per satuan dasar** otomatis: `harga ÷ (jumlah dalam satuan dasar)`.
- Bisa ada beberapa baris untuk satu bahan (vendor berbeda) → bisa dibandingkan, dan dipilih satu sebagai **harga acuan** untuk HPP (default: termurah, bisa override).

### [4] Buat Resep / BOM
- Resep menempel pada satu **Produk**.
- Field per baris bahan: bahan, **jumlah pakai** (dalam satuan dasar), 
- Tambahan: **yield** (resep ini menghasilkan berapa porsi/pcs). Contoh: 1 resep cookies menghasilkan 24 pcs.
- HPP per unit = total biaya bahan resep ÷ yield.

### [5] Hitung HPP
- App menjumlahkan: tiap bahan resep × harga acuan per satuan dasar = **food cost**.
- Tambah **overhead sederhana** (opsional): kemasan, gas/listrik, tenaga — sebagai nominal per unit atau persentase. (Detail di `08_HPP_CALCULATION_SPEC.md`.)
- HPP per unit = food cost per unit + overhead per unit.
- Masukkan **target margin %** → app kasih **saran harga jual**.

### [6] Tetapkan Harga Jual
- Pengguna melihat saran, lalu **mengisi harga jual final** (boleh beda dari saran — keputusan bisnis).
- App menampilkan margin aktual dari harga final tsb.

### [7] Catat Penjualan
- Input cepat: pilih produk, qty, (harga otomatis terisi dari harga jual, bisa di-edit untuk diskon), tanggal (default hari ini).
- Bisa beberapa item dalam satu sesi pencatatan.
- Setiap penjualan menyimpan **snapshot HPP** saat itu (supaya laporan profit tidak berubah kalau harga bahan naik nanti — lihat `03_DATA_MODEL.md` §catatan snapshot).

### [8] Sales Board
- Pilih periode (Hari ini / 7 hari / Bulan ini / rentang custom).
- Tampilkan: **Omzet**, **Unit terjual**, **Profit** (= Σ(harga jual − HPP snapshot) × qty), **Produk terlaris**.
- Semua angka tabular-nums, monokrom.

## 3. Alur pertama kali (empty state)
Pengguna baru tidak punya data. Urutan onboarding yang dipandu:
1. Buat workspace pertama (atau dua: Kopi & Pastry).
2. Dashboard menampilkan ajakan: "Mulai dari menambah bahan."
3. Tiap halaman kosong memberi 1 tombol jelas ke langkah berikutnya (lihat empty state di `07_UI_BEHAVIOR_RULES.md`).

## 4. Ketergantungan antar langkah (penting untuk validasi)
- Tidak bisa hitung HPP kalau resep kosong atau bahan belum punya harga acuan.
- Saat harga acuan belum ada, HPP menampilkan "Data harga belum lengkap" + sebut bahan mana yang kurang. **Jangan tampilkan angka tebakan.**
- Tidak bisa catat penjualan produk yang belum punya harga jual.

## 5. Navigasi utama (menu, semua berupa teks)
`Dashboard · Penjualan · Produk · Resep · Bahan · Vendor · Stok · Pengaturan`

Header berisi: nama app, **pemilih workspace**, dan **pengalih tema**.
