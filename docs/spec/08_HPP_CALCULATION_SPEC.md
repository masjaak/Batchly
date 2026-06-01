# 08 — HPP Calculation Spec

Spesifikasi perhitungan **HPP (Harga Pokok Produksi)** dan **saran harga jual**. Ini jantung Takar. Semua angka uang = **integer Rupiah**. Pembulatan dijelaskan di §6.

## 1. Istilah
| Istilah | Arti sederhana |
|---|---|
| **Harga per satuan dasar** | harga 1 gram / 1 ml / 1 pcs bahan |
| **Food cost** | total biaya bahan untuk 1 resep |
| **Yield** | 1 resep menghasilkan berapa unit jual |
| **Overhead** | biaya non-bahan per unit (kemasan, gas, listrik, tenaga) |
| **HPP / unit** | modal sebenarnya 1 unit produk |
| **Margin** | porsi untung terhadap harga jual |
| **Saran harga** | harga jual yang dihitung dari HPP + target margin |

## 2. Langkah 1 — Harga per satuan dasar (dari pembelian)
Saat input harga bahan dari vendor:
```
harga_per_satuan_dasar = purchase_price / qty_in_base_unit
```
- `purchase_price` = harga beli (Rp).
- `qty_in_base_unit` = jumlah yang didapat, dikonversi ke satuan dasar bahan.

**Contoh:** beli 1 dus Susu UHT isi 12 × 1.000 ml seharga Rp 144.000.
- qty_in_base_unit = 12 × 1.000 = 12.000 ml
- harga_per_ml = 144.000 / 12.000 = **Rp 12 / ml**

**Harga acuan:** kalau satu bahan punya beberapa vendor, app memilih **termurah** sebagai default acuan; pemilik boleh override (mis. vendor termurah sering kosong). Acuan inilah yang dipakai HPP.

## 3. Langkah 2 — Food cost (per resep)
```
food_cost = Σ ( recipe_item.qty × ingredient.harga_per_satuan_dasar_acuan )
```
Dijumlahkan untuk semua bahan dalam resep.

## 4. Langkah 3 — HPP per unit
Pertama bagi food cost dengan yield, lalu tambahkan overhead.

```
food_cost_per_unit = food_cost / yield_qty
```

Overhead memakai **salah satu** metode (jangan dua-duanya):

**Metode A — nominal per unit:**
```
hpp_per_unit = food_cost_per_unit + overhead_per_unit
```

**Metode B — persen dari food cost:**
```
hpp_per_unit = food_cost_per_unit × (1 + overhead_pct/100)
```

Saran default MVP: **Metode A (nominal)** karena lebih mudah dipahami pemilik (mis. "kemasan Rp 1.000/cup").

## 5. Langkah 4 — Saran harga & margin
Definisi margin yang dipakai: **margin terhadap harga jual** (bukan markup terhadap modal). Ini standar yang lebih aman untuk usaha F&B.

```
saran_harga = hpp_per_unit / (1 − target_margin_pct/100)
```

Margin aktual dari harga jual final yang dipilih pemilik:
```
margin_aktual_pct = (selling_price − hpp_per_unit) / selling_price × 100
untung_per_unit   = selling_price − hpp_per_unit
```

> **Catatan markup vs margin** (biar tidak salah): markup 100% ≠ margin 50%. App memakai **margin terhadap harga jual**. Jika pemilik berpikir dalam markup, tampilkan keduanya opsional, tapi angka acuan = margin.

## 6. Pembulatan
- Perhitungan internal pakai presisi penuh (numeric), **pembulatan hanya di tampilan & saat menyimpan harga**.
- `hpp_per_unit` ditampilkan dibulatkan ke Rupiah penuh (integer).
- `saran_harga` dibulatkan **ke atas** ke kelipatan praktis:
  - default kelipatan **Rp 500** (bisa diatur: 100 / 500 / 1.000).
  - Contoh: saran 11.842 → tampil **Rp 12.000** (kelipatan 500 ke atas).
- `margin_aktual` dihitung dari `selling_price` final (yang sudah dibulatkan), 1 desimal.

## 7. Contoh lengkap — KOPI: Es Kopi Susu (1 cup)
**Resep (yield = 1 cup):**
| Bahan | Qty | Harga/satuan dasar | Biaya |
|---|---:|---:|---:|
| Espresso (biji kopi) | 18 gram | Rp 250/gram | 4.500 |
| Susu UHT | 150 ml | Rp 12/ml | 1.800 |
| Gula aren cair | 30 ml | Rp 20/ml | 600 |
| Es batu | 100 gram | Rp 2/gram | 200 |
| **Food cost** | | | **7.100** |

- yield_qty = 1 → food_cost_per_unit = 7.100
- overhead_per_unit (cup + tutup + sedotan) = 1.200
- **HPP/unit = 7.100 + 1.200 = Rp 8.300**

Target margin 60%:
- saran_harga = 8.300 / (1 − 0,60) = 8.300 / 0,40 = 20.750 → bulatkan ke atas kelipatan 500 = **Rp 21.000**
- Jika harga jual final dipilih **Rp 20.000**:
  - untung/unit = 20.000 − 8.300 = **Rp 11.700**
  - margin aktual = 11.700 / 20.000 × 100 = **58.5%**

## 8. Contoh lengkap — PASTRY: Butter Cookies (1 resep = 24 pcs)
**Resep (yield = 24 pcs):**
| Bahan | Qty | Harga/satuan dasar | Biaya |
|---|---:|---:|---:|
| Tepung terigu | 500 gram | Rp 12/gram | 6.000 |
| Butter | 250 gram | Rp 90/gram | 22.500 |
| Gula halus | 150 gram | Rp 16/gram | 2.400 |
| Telur | 1 pcs (≈55 gram) | Rp 55/gram | 3.025 |
| Vanila | 5 ml | Rp 200/ml | 1.000 |
| **Food cost (1 resep)** | | | **34.925** |

- yield_qty = 24 → food_cost_per_unit = 34.925 / 24 = **1.455** (dibulatkan tampilan)
- overhead_per_unit (kemasan + gas oven) = 500
- **HPP/unit = 1.455 + 500 = Rp 1.955**

Target margin 55%:
- saran_harga = 1.955 / 0,45 = 4.344 → bulatkan ke atas 500 = **Rp 4.500**
- Jika dijual per **toples isi 12 pcs**:
  - HPP per toples = 1.955 × 12 = **Rp 23.460**
  - saran harga toples = 23.460 / 0,45 = 52.133 → **Rp 52.500**

> Catatan pastry: produk sering dijual per kemasan (toples/box). Modelkan sebagai **produk terpisah** (mis. "Butter Cookies Toples 12") dengan yield & resep tersendiri, atau gunakan yield = jumlah kemasan. Pilih satu konvensi konsisten (rekomendasi MVP: buat produk per kemasan jual).

## 9. Aturan data tidak lengkap (selaras dengan UI)
HPP **tidak dihitung** dan tidak menampilkan angka jika:
- Resep kosong → pesan "Tambahkan bahan ke resep."
- Ada bahan resep tanpa **harga acuan** → pesan "Data harga belum lengkap" + daftar bahan kurang.
- yield_qty ≤ 0 → minta perbaiki yield.

**Tidak boleh** menampilkan Rp 0 / tebakan seolah valid. (Prinsip "jujur soal angka".)

## 10. Ringkasan rumus (acuan implementasi)
```
harga_per_satuan_dasar = purchase_price / qty_in_base_unit
food_cost              = Σ(qty × harga_per_satuan_dasar_acuan)
food_cost_per_unit     = food_cost / yield_qty
hpp_per_unit           = food_cost_per_unit + overhead_per_unit        // Metode A
                       = food_cost_per_unit × (1 + overhead_pct/100)   // Metode B
saran_harga            = ceilTo( hpp_per_unit / (1 − target_margin/100), kelipatan )
margin_aktual_pct      = (selling_price − hpp_per_unit) / selling_price × 100
untung_per_unit        = selling_price − hpp_per_unit
profit_periode         = Σ sale_items ((unit_price − hpp_snapshot) × qty)
```

## 11. Hubungan dengan penjualan (snapshot)
Saat penjualan dicatat, `hpp_per_unit` produk **dibekukan** ke `sale_items.hpp_snapshot`. Profit historis selalu memakai snapshot, bukan HPP terkini, sehingga laporan lama tidak berubah ketika harga bahan naik. (Lihat `03_DATA_MODEL.md` §5 & §sale_items.)
