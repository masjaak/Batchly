# 05 — Component Spec

Daftar komponen reusable. Semua **wajib** memakai token dari `04_DESIGN_SYSTEM.md` dan mengikuti aturan `01_UI_UX_GUIDELINES.md`. Tidak ada warna, ikon, gradasi.

Konvensi: setiap komponen menyertakan **Props**, **State**, dan **Aturan**.

---

## A. Primitif

### A1. Button
- **Props:** `variant` (`primary` | `secondary` | `ghost` | `danger`), `label` (teks wajib), `disabled`, `loading`, `onClick`, `type`.
- **State:** default, hover (latar `--bg-subtle` untuk secondary/ghost), active, disabled (opacity turun, kursor not-allowed), loading (teks diganti "Menyimpan…" / spinner garis tipis monokrom).
- **Aturan:** tinggi **40px tetap**. Hanya 1 primary per area. Tidak ada ikon. Label kata kerja.

### A2. Input (Text/Number)
- **Props:** `label`, `value`, `onChange`, `placeholder`, `type` (`text`|`number`), `suffix` (mis. "gram", "Rp"), `error`, `disabled`, `required`.
- **State:** default, fokus (border `--border-strong`), error (pesan token `small` + prefiks "Error: "), disabled.
- **Aturan:** number untuk angka → rata kanan + tabular-nums. `suffix` ditampilkan sebagai teks abu di dalam kanan field.

### A3. CurrencyInput
- Turunan Input untuk Rupiah. Menyimpan `integer` Rupiah. Menampilkan `Rp 12.500` saat blur, angka mentah saat fokus.
- **Aturan:** tidak menerima desimal.

### A4. QuantityInput
- Turunan Input untuk kuantitas (`numeric`), dengan `unitLabel` (satuan dasar). Boleh desimal.

### A5. Select / Dropdown (kustom, ikut tema)
- **Props:** `label`, `options` ({value,label}), `value`, `onChange`, `placeholder`, `searchable` (bool), `disabled`, `error`.
- **State:** closed, open (panel `--surface` + border hairline), item hover (`--bg-subtle`), item selected (`body-strong`), disabled.
- **Aturan:** komponen kustom, **bukan `<select>` native**. Panel & item mengikuti token tema aktif. Penanda buka glyph netral `▾`. Searchable dipakai untuk daftar bahan/vendor yang panjang.

### A6. Textarea
- Untuk catatan. Sama gaya dengan Input, min 3 baris.

### A7. Checkbox / Toggle
- Monokrom. Checkbox kotak hairline + glyph `✓` saat aktif. Toggle persegi-membulat kecil, fill `--fill-solid` saat on. Tanpa warna.

### A8. Badge / Tag
- Teks kecil dalam border hairline, radius-sm. Untuk status seperti "Menipis", "Tanpa harga". Tanpa warna — beda makna lewat teks.

---

## B. Layout

### B1. AppShell
- Struktur: **Sidebar** (kiri, desktop) + **Header** (atas) + **Content**.
- **Header** berisi: nama app (teks), **WorkspaceSwitcher**, **ThemeToggle**.
- Responsif: tablet → sidebar bisa collapse; mobile → menu jadi drawer teks.

### B2. Sidebar / Nav
- Daftar menu **teks**: Dashboard, Penjualan, Produk, Resep, Bahan, Vendor, Stok, Pengaturan.
- Item aktif ditandai **garis kiri 2px** + `body-strong` (bukan warna/ikon).

### B3. PageHeader
- **Props:** `title` (h1), `description` (opsional, small/muted), `action` (slot 1 tombol primary, mis. "Tambah Bahan").
- **Aturan:** hanya 1 action utama.

### B4. Card / Panel
- Surface + border hairline + radius-md + padding `space-5`. Tanpa shadow.
- Varian `subtle`: latar `--bg-subtle`.

### B5. Section
- Pengelompok dalam halaman: judul h2 + jarak `space-6` dari section lain.

### B6. Modal / Dialog
- Untuk form tambah/edit & konfirmasi hapus.
- Panel `--surface`, border, radius-md, lebar maks 480px. Overlay: lapisan gelap transparan (bukan warna).
- Footer modal: tombol Secondary (Batal) + Primary (Simpan) — ukuran seragam.

### B7. WorkspaceSwitcher
- Dropdown (A5) berisi daftar usaha (Kopi/Pastry). Mengganti `business_id` aktif. Menampilkan nama usaha aktif.

### B8. ThemeToggle
- Toggle terang/gelap (A7). Menyimpan preferensi (localStorage). Mengubah peta token tema seketika; semua komponen termasuk dropdown ikut.

---

## C. Data

### C1. DataTable
- **Props:** `columns` ({key,label,align,format}), `rows`, `emptyState`, `loading`, `onRowClick`, `rowActions`.
- **Aturan:** header `--bg-subtle` + token `label`; kolom angka rata kanan + tabular-nums; baris border bawah hairline; min tinggi baris 44px. Mobile → render sebagai daftar kartu key–value.
- **State:** loading (skeleton baris abu), empty (slot EmptyState), normal.

### C2. EmptyState
- **Props:** `title`, `message`, `actionLabel`, `onAction`.
- Teks di tengah + 1 tombol primary ke langkah berikutnya. Tanpa ilustrasi.

### C3. StatCard (untuk Dashboard / Sales Board)
- **Props:** `label` (token label), `value` (token display, tabular-nums), `sub` (small/muted, mis. perbandingan periode).
- **Aturan:** angka besar monokrom, tanpa ikon tren/panah berwarna. Tren ditandai teks "+12%" / "−4%".

### C4. KeyValueList
- Pasangan label–nilai vertikal untuk detail (mis. rincian HPP). Label kiri muted, nilai kanan tabular-nums.

### C5. FormRow / FormGrid
- Pembungkus field: label di atas, gap `space-4`. FormGrid untuk 2 kolom di desktop, 1 kolom di mobile.

---

## D. Komponen domain (spesifik Takar)

### D1. IngredientPriceTable
- Tabel harga 1 bahan dari banyak vendor. Kolom: Vendor, Harga beli, Jumlah, Satuan, **Harga/satuan dasar** (dihitung), penanda **Acuan** (radio untuk pilih harga acuan).
- Baris dengan harga termurah ditandai teks "Termurah".

### D2. RecipeEditor
- Daftar baris resep (bahan + qty satuan dasar) + tombol "Tambah Bahan". Menampilkan **yield** dan **food cost berjalan** di bawah.
- Validasi: bahan tanpa harga acuan ditandai badge "Tanpa harga".

### D3. HppCalculatorPanel
- Menampilkan: food cost/unit, overhead/unit, **HPP/unit**, input target margin, **saran harga**, input harga jual final, **margin aktual**.
- Jika data harga belum lengkap → tampilkan pesan "Data harga belum lengkap" + daftar bahan yang kurang (lihat `08`). **Tidak** menampilkan angka tebakan.

### D4. SaleEntryForm
- Input cepat penjualan: Select produk (searchable) + QuantityInput + CurrencyInput (harga, prefilled dari `selling_price`, editable untuk diskon) + tanggal (default hari ini). Tombol "Tambah ke daftar" lalu "Simpan".
- Menampilkan subtotal berjalan.

### D5. SalesBoard
- Pemilih periode (Select: Hari ini / 7 hari / Bulan ini / Custom) + 3 StatCard (Omzet, Unit, Profit) + tabel produk terlaris + DataTable transaksi.

### D6. StockList
- DataTable bahan dengan stok & ambang. Baris di bawah ambang → garis kiri 2px + badge "Menipis". Aksi: update stok (modal kecil).

---

## E. Aturan lintas komponen
1. Semua tombol memakai komponen Button (tidak ada `<button>` styling sendiri).
2. Semua dropdown memakai Select kustom (A5) — tidak ada `<select>` native.
3. Semua uang lewat CurrencyInput / format Rupiah util.
4. Semua angka tabel pakai util tabular-nums.
5. Setiap halaman daftar wajib punya EmptyState, loading, dan error state.
6. Tidak ada komponen yang menyuntik warna/ikon.
