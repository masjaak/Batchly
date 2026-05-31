# 03 — Data Model

Model data inti Takar. Dirancang **multi-tenant-ready** sejak awal, tetapi fitur auth/akun **ditunda ke Fase 2**. Artinya: kolom kepemilikan sudah ada, tapi belum dipakai untuk memfilter login di MVP.

## 1. Prinsip
- **Postgres (Supabase).** Relasional, karena data ini saling terhubung erat.
- Setiap tabel bisnis punya: `id`, `owner_id`, `business_id`, `created_at`, `updated_at`.
  - `owner_id` → siapa pemilik akun (Fase 2: dari `auth.users`). Di MVP boleh diisi 1 nilai konstan.
  - `business_id` → workspace/usaha (Kopi / Pastry). **Sudah dipakai di MVP** untuk memisahkan data.
- **Uang** disimpan sebagai `integer` dalam **Rupiah penuh** (tanpa desimal) untuk hindari error pembulatan float. (Mis. Rp 12.500 → `12500`.)
- **Kuantitas** disimpan `numeric` (boleh desimal, mis. 0.5 gram).
- Hapus data pakai **soft delete** (`deleted_at`) agar laporan lama tidak rusak.

## 2. Entitas inti

```
businesses (workspace: Kopi / Pastry)
   └─ ingredients (bahan)            ── stok ada di sini
   └─ vendors (vendor)
   └─ ingredient_prices (harga bahan per vendor)   [ingredient × vendor]
   └─ products (produk jual)
        └─ recipe_items (baris resep: produk butuh bahan apa, berapa)
   └─ sales (transaksi penjualan)
        └─ sale_items (baris penjualan: produk, qty, harga, HPP snapshot)
```

## 3. Tabel

### businesses
Workspace/usaha. Satu pemilik bisa punya banyak.
| kolom | tipe | catatan |
|---|---|---|
| id | uuid PK | |
| owner_id | uuid | Fase 2: FK ke auth.users. MVP: konstan. |
| name | text | "Kopi", "Pastry" |
| type | text | enum bebas: `coffee` / `bakery` / `other` |
| created_at, updated_at | timestamptz | |

### ingredients (Bahan)
| kolom | tipe | catatan |
|---|---|---|
| id | uuid PK | |
| business_id | uuid FK | |
| owner_id | uuid | |
| name | text | "Susu UHT", "Tepung terigu" |
| base_unit | text | satuan dasar: `gram` / `ml` / `pcs` |
| category | text | opsional: "Dairy", "Dry goods" |
| stock_qty | numeric | stok saat ini (satuan dasar) |
| low_stock_threshold | numeric | ambang "menipis" |
| reference_price_id | uuid FK → ingredient_prices | harga acuan untuk HPP (nullable) |
| deleted_at | timestamptz | soft delete |

> **Catatan stok:** di MVP stok di-update manual (tidak otomatis berkurang saat jual, karena 1 produk = banyak bahan dan butuh resep akurat). Pengurangan stok otomatis bisa masuk Fase 2.

### vendors (Vendor)
| kolom | tipe | catatan |
|---|---|---|
| id | uuid PK | |
| business_id | uuid FK | |
| owner_id | uuid | |
| name | text | "Toko Bahan Jaya" |
| contact | text | opsional (no HP/WA) |
| note | text | opsional |
| deleted_at | timestamptz | |

### ingredient_prices (Harga bahan per vendor)
Menyatakan: vendor X menjual bahan Y seharga Z untuk jumlah tertentu.
| kolom | tipe | catatan |
|---|---|---|
| id | uuid PK | |
| business_id | uuid FK | |
| owner_id | uuid | |
| ingredient_id | uuid FK | |
| vendor_id | uuid FK | |
| purchase_price | integer | harga beli (Rp penuh) |
| purchase_qty | numeric | jumlah yang didapat |
| purchase_unit | text | satuan beli (mis. `dus`, `sak`, `liter`) |
| qty_in_base_unit | numeric | jumlah didapat dikonversi ke satuan dasar bahan |
| price_per_base_unit | numeric | **dihitung**: purchase_price ÷ qty_in_base_unit |
| updated_at | timestamptz | kapan harga terakhir dicek |
| deleted_at | timestamptz | |

> `price_per_base_unit` adalah angka kunci untuk HPP. Bisa dihitung di app/DB. Pisahkan `purchase_unit` (cara beli) dari `base_unit` (cara pakai) — konversi dilakukan saat input.

### products (Produk)
| kolom | tipe | catatan |
|---|---|---|
| id | uuid PK | |
| business_id | uuid FK | |
| owner_id | uuid | |
| name | text | "Es Kopi Susu", "Butter Cookies" |
| category | text | opsional |
| yield_qty | numeric | 1 resep menghasilkan berapa unit (default 1) |
| yield_unit | text | `pcs` / `cup` / `loyang` |
| selling_price | integer | harga jual final (Rp), diisi pemilik |
| target_margin_pct | numeric | target margin % untuk saran harga |
| overhead_per_unit | integer | overhead nominal per unit (Rp), opsional |
| overhead_pct | numeric | overhead sebagai % dari food cost, opsional |
| deleted_at | timestamptz | |

> Pakai salah satu cara overhead (nominal **atau** persen), jangan dobel. Lihat `08_HPP_CALCULATION_SPEC.md`.

### recipe_items (Baris resep / BOM)
| kolom | tipe | catatan |
|---|---|---|
| id | uuid PK | |
| business_id | uuid FK | |
| product_id | uuid FK | |
| ingredient_id | uuid FK | |
| qty | numeric | jumlah pakai dalam **satuan dasar bahan** |
| deleted_at | timestamptz | |

> Resep adalah kumpulan recipe_items milik satu product. HPP dihitung dari sini × harga acuan tiap bahan.

### sales (Transaksi penjualan)
| kolom | tipe | catatan |
|---|---|---|
| id | uuid PK | |
| business_id | uuid FK | |
| owner_id | uuid | |
| sold_at | date | tanggal jual (default hari ini) |
| note | text | opsional |
| deleted_at | timestamptz | |

### sale_items (Baris penjualan)
| kolom | tipe | catatan |
|---|---|---|
| id | uuid PK | |
| sale_id | uuid FK | |
| business_id | uuid FK | |
| product_id | uuid FK | |
| qty | numeric | jumlah terjual |
| unit_price | integer | harga jual saat transaksi (Rp) |
| hpp_snapshot | integer | **HPP per unit saat transaksi** (Rp) |

> **Kenapa snapshot HPP?** Harga bahan berubah-ubah. Kalau profit dihitung dari HPP terkini, laporan bulan lalu ikut berubah saat harga bahan naik — itu salah. Maka saat penjualan dicatat, HPP per unit "dibekukan" ke `hpp_snapshot`. Profit historis jadi akurat & stabil.

## 4. Relasi (ringkas)
- `businesses` 1—N `ingredients`, `vendors`, `products`, `sales`
- `ingredients` 1—N `ingredient_prices`; `vendors` 1—N `ingredient_prices`
- `products` 1—N `recipe_items`; `ingredients` 1—N `recipe_items`
- `products` punya 1 `selling_price`; `sales` 1—N `sale_items`; `products` 1—N `sale_items`

## 5. Nilai turunan (dihitung, tidak disimpan permanen)
- **food_cost(product)** = Σ ( recipe_item.qty × ingredient.reference_price.price_per_base_unit )
- **hpp_per_unit(product)** = (food_cost ÷ yield_qty) + overhead_per_unit *(atau)* (food_cost ÷ yield_qty) × (1 + overhead_pct)
- **suggested_price(product)** = hpp_per_unit ÷ (1 − target_margin_pct/100)
- **margin_actual(product)** = (selling_price − hpp_per_unit) ÷ selling_price × 100
- **profit(periode)** = Σ sale_items ( (unit_price − hpp_snapshot) × qty )

Rumus lengkap & contoh angka di `08_HPP_CALCULATION_SPEC.md`.

## 6. Catatan multi-tenant (Fase 2)
- Saat auth aktif: `owner_id` diisi dari user login; aktifkan **Row Level Security** sehingga tiap baris hanya terlihat oleh pemiliknya.
- `business_id` tetap memisahkan usaha milik satu pemilik.
- Tidak ada perubahan skema besar — hanya mengaktifkan RLS + mengisi `owner_id` secara nyata.

## 7. Yang sengaja TIDAK ada
- Tabel lokasi/koordinat (lokasi bukan fitur).
- Tabel pembelian/PO (Fase 2).
- Tabel user/role (Fase 2, akan pakai `auth.users` Supabase + tabel `memberships`).
