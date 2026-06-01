# 09 — Master Data CRUD Spec

Spesifikasi operasi Create / Read / Update / Delete untuk tiap entitas. Mengacu ke `03_DATA_MODEL.md` (skema), `06_PAGE_SPEC.md` (halaman), `07_UI_BEHAVIOR_RULES.md` (perilaku).

Aturan umum:
- Semua operasi terikat **`business_id`** (workspace aktif).
- Delete = **soft delete** (`deleted_at`), kecuali disebut lain.
- Validasi sesuai `07` §4.
- Nama unik per workspace (case-insensitive).

---

## 1. Bahan (ingredients)

### Create
- Form (modal): nama*, satuan dasar* (`gram`/`ml`/`pcs`), kategori, stok awal, ambang menipis.
- Validasi: nama wajib & unik; satuan dasar wajib; stok & ambang ≥ 0.
- Setelah simpan: bahan muncul di list; belum punya harga (badge "Tanpa harga").

### Read
- List `/bahan`: nama, satuan dasar, kategori, harga acuan/satuan, stok, status.
- Detail `/bahan/:id`: info bahan + IngredientPriceTable + stok.

### Update
- Edit field bahan. **Peringatan** bila mengubah `base_unit` sementara bahan sudah dipakai resep (dampak ke HPP) — lihat `07` §13.

### Delete
- Tolak/ peringatkan bila bahan dipakai di resep aktif: "Bahan dipakai di N resep" + daftar. Pengguna lepas dulu dari resep atau konfirmasi paksa (soft delete; resep yang memakainya jadi "Tanpa harga/komponen hilang" dan ditandai).

---

## 2. Vendor (vendors)

### Create
- Form (modal): nama*, kontak, catatan.
- Validasi: nama wajib & unik.

### Read
- List `/vendor`: nama, kontak, jumlah bahan dipasok, catatan.
- Detail `/vendor/:id`: info + daftar bahan & harga dari vendor ini.

### Update
- Edit nama/kontak/catatan.

### Delete
- Peringatkan bila vendor menjadi **harga acuan** suatu bahan: harga acuan akan kosong → HPP bahan itu jadi tidak lengkap. Konfirmasi.

---

## 3. Harga Bahan per Vendor (ingredient_prices)

### Create
- Dari Detail Bahan → "Tambah Harga Vendor" (modal): vendor*, harga beli* (Rp), jumlah didapat* + satuan beli*, (app hitung `qty_in_base_unit` & `price_per_base_unit`).
- Konversi satuan beli → satuan dasar: pengguna memasukkan faktor bila satuan beli ≠ satuan dasar (mis. 1 dus = 12.000 ml). Simpan `qty_in_base_unit`.
- Validasi: harga > 0; jumlah > 0.

### Read
- IngredientPriceTable di Detail Bahan: semua harga + harga/satuan dasar + penanda "Termurah" + radio "Acuan".

### Update
- Edit harga/jumlah/satuan. `price_per_base_unit` dihitung ulang. `updated_at` diperbarui (untuk tahu harga kapan terakhir dicek).

### Delete
- Soft delete satu baris harga. Jika baris itu adalah acuan → minta pilih acuan lain atau kosongkan (HPP jadi tidak lengkap, ditandai).

### Pilih Harga Acuan
- Radio di tabel set `ingredients.reference_price_id`. Default otomatis = termurah saat harga pertama dibuat; bisa diganti manual.

---

## 4. Produk (products)

### Create
- Form: nama*, kategori, yield (qty* + unit*), overhead (nominal *atau* persen), target margin %, harga jual (boleh diisi nanti).
- Setelah simpan: masuk Detail Produk untuk menyusun resep.

### Read
- List `/produk`: nama, kategori, HPP/unit, harga jual, margin aktual, status (badge "Tanpa harga"/"HPP belum lengkap").
- Detail `/produk/:id`: field produk + RecipeEditor + HppCalculatorPanel.

### Update
- Edit field; mengubah yield/overhead/target margin → HPP & saran harga dihitung ulang live.
- Set harga jual final → margin aktual tampil live.

### Delete
- Soft delete. **Penjualan lama tetap utuh** karena memakai `hpp_snapshot` & menyimpan `product_id` (produk terhapus ditandai "(dihapus)" di laporan, angka tidak berubah).

---

## 5. Resep (recipe_items)

### Create (tambah baris)
- Dari RecipeEditor: pilih bahan (Select searchable) + qty (satuan dasar bahan).
- Validasi: qty > 0; bahan belum ada di resep yang sama (kalau sudah ada → gabung/ubah qty).
- Bahan tanpa harga acuan tetap boleh ditambahkan, tapi ditandai "Tanpa harga" dan memblok hitung HPP final.

### Read
- Daftar baris resep dalam Detail Produk + food cost berjalan + yield.

### Update
- Ubah qty baris; tambah/hapus bahan. HPP dihitung ulang live.

### Delete (hapus baris)
- Hapus bahan dari resep (hard delete baris boleh, karena bukan data historis — resep adalah definisi terkini). Konfirmasi ringan.

---

## 6. Stok (pada ingredients)

### Update Stok
- Dari `/stok` atau Detail Bahan → "Update Stok" (modal kecil): set jumlah baru (satuan dasar).
- MVP: update **manual** (tidak otomatis berkurang saat penjualan).
- Ambang menipis: bila `stock_qty < low_stock_threshold` → status "Menipis" (garis kiri + badge).

### Read
- `/stok`: list bahan + stok + ambang + status; filter Semua/Menipis.

---

## 7. Penjualan (sales + sale_items) — ringkas
> Detail alur input ada di `06_PAGE_SPEC.md` (Penjualan) & `08` (snapshot). Dimasukkan di sini karena juga operasi data.

### Create
- SaleEntryForm: tanggal (default hari ini) + baris item (produk*, qty*, harga* prefilled dari `selling_price`, editable).
- Saat simpan tiap `sale_item`: set `hpp_snapshot = hpp_per_unit(produk saat ini)`.
- Validasi: produk harus punya harga jual & HPP lengkap (kalau HPP belum lengkap, tetap boleh jual tapi peringatkan profit tak terhitung untuk item itu).

### Read
- Sales Board + DataTable transaksi.

### Update / Delete
- Edit/hapus transaksi (soft delete). Profit periode ikut menyesuaikan. Tidak mengubah snapshot item lain.

---

## 8. Workspace (businesses)

### Create / Update
- Dari Pengaturan: tambah usaha (nama*, tipe), rename.

### Delete
- Soft delete workspace = menyembunyikan semua datanya. Konfirmasi kuat (sebut akan menyembunyikan N produk, N penjualan). MVP boleh batasi: tidak bisa hapus workspace terakhir.

---

## 9. Ringkasan izin operasi (MVP, single-user)
| Entitas | Create | Read | Update | Delete |
|---|:--:|:--:|:--:|:--:|
| Bahan | ✓ | ✓ | ✓ | soft (cek pemakaian) |
| Vendor | ✓ | ✓ | ✓ | soft (cek acuan) |
| Harga vendor | ✓ | ✓ | ✓ | soft (cek acuan) |
| Produk | ✓ | ✓ | ✓ | soft (penjualan aman) |
| Resep (baris) | ✓ | ✓ | ✓ | hard (definisi terkini) |
| Stok | — | ✓ | ✓ | — |
| Penjualan | ✓ | ✓ | ✓ | soft |
| Workspace | ✓ | ✓ | ✓ | soft (≥1 tersisa) |

Fase 2: tambah kontrol berbasis `owner_id` + RLS + peran anggota.
