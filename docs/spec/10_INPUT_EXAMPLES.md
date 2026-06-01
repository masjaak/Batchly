# 10 — Input Examples (Data Contoh)

Data contoh realistis untuk **dua workspace**: Kopi & Pastry. Dipakai untuk seed awal, testing, dan demo. Harga = perkiraan pasar Indonesia 2026, sesuaikan dengan kondisi nyata. Uang = Rupiah penuh.

> Harga di sini ilustratif. Yang penting struktur & relasinya benar.

---

# WORKSPACE A — KOPI

## A.1 Vendor
| Vendor | Kontak | Catatan |
|---|---|---|
| Roastery Lokal | wa 0812-xxx | biji kopi, kirim mingguan |
| Grosir Susu Jaya | wa 0813-xxx | susu & dairy |
| Toko Bahan Minuman | wa 0821-xxx | sirup, gula aren, cup |

## A.2 Bahan (satuan dasar)
| Bahan | Satuan dasar | Stok awal | Ambang menipis |
|---|---|---:|---:|
| Biji kopi (house blend) | gram | 5.000 | 1.000 |
| Susu UHT full cream | ml | 24.000 | 6.000 |
| Gula aren cair | ml | 3.000 | 1.000 |
| Es batu | gram | 20.000 | 5.000 |
| Cup 16oz + tutup | pcs | 200 | 50 |
| Sedotan | pcs | 300 | 100 |

## A.3 Harga bahan per vendor → harga/satuan dasar
| Bahan | Vendor | Beli | Jumlah (satuan dasar) | Harga/satuan dasar | Acuan |
|---|---|---:|---|---:|:--:|
| Biji kopi | Roastery Lokal | Rp 250.000 | 1.000 gram | Rp 250 / gram | ✓ |
| Susu UHT | Grosir Susu Jaya | Rp 144.000 | 12.000 ml (1 dus) | Rp 12 / ml | ✓ |
| Gula aren cair | Toko Bahan Minuman | Rp 40.000 | 2.000 ml | Rp 20 / ml | ✓ |
| Es batu | Grosir Susu Jaya | Rp 20.000 | 10.000 gram | Rp 2 / gram | ✓ |
| Cup 16oz + tutup | Toko Bahan Minuman | Rp 90.000 | 100 pcs | Rp 900 / pcs | ✓ |
| Sedotan | Toko Bahan Minuman | Rp 15.000 | 150 pcs | Rp 100 / pcs | ✓ |

Contoh perbandingan vendor (1 bahan, 2 vendor):
| Bahan | Vendor | Harga/satuan dasar | Status |
|---|---|---:|---|
| Susu UHT | Grosir Susu Jaya | Rp 12,0 / ml | Termurah ✓ acuan |
| Susu UHT | Toko Bahan Minuman | Rp 13,5 / ml | — |

## A.4 Produk + Resep + HPP

### Produk 1 — Es Kopi Susu (yield 1 cup)
| Bahan | Qty | Biaya |
|---|---:|---:|
| Biji kopi | 18 gram | 4.500 |
| Susu UHT | 150 ml | 1.800 |
| Gula aren cair | 30 ml | 600 |
| Es batu | 100 gram | 200 |
| **Food cost** | | **7.100** |

- Overhead/unit (cup+tutup 900 + sedotan 100 + gas/listrik 200) = **1.200**
- **HPP/unit = 8.300**
- Target margin 60% → saran harga = 8.300 / 0,40 = 20.750 → **Rp 21.000**
- Harga jual final: **Rp 20.000** → margin aktual **58.5%**, untung/unit **Rp 11.700**

### Produk 2 — Americano (yield 1 cup)
| Bahan | Qty | Biaya |
|---|---:|---:|
| Biji kopi | 18 gram | 4.500 |
| Es batu | 120 gram | 240 |
| **Food cost** | | **4.740** |

- Overhead/unit = 1.200 → **HPP/unit = 5.940**
- Target margin 65% → saran = 5.940 / 0,35 = 16.971 → **Rp 17.000**
- Harga jual final: **Rp 18.000** → margin aktual **67.0%**

## A.5 Contoh Penjualan (1 hari)
| Tanggal | Produk | Qty | Harga | HPP snapshot | Profit baris |
|---|---|---:|---:|---:|---:|
| 31/05/26 | Es Kopi Susu | 12 | 20.000 | 8.300 | 140.400 |
| 31/05/26 | Americano | 5 | 18.000 | 5.940 | 60.300 |

**Sales Board hari itu:** Omzet = 240.000 + 90.000 = **Rp 330.000** · Unit = **17** · Profit = **Rp 200.700**

---

# WORKSPACE B — PASTRY / BAKERY

## B.1 Vendor
| Vendor | Kontak | Catatan |
|---|---|---|
| Toko Bahan Kue Makmur | wa 0852-xxx | tepung, gula, dll |
| Distributor Butter | wa 0856-xxx | butter & dairy |
| Toko Kemasan | wa 0857-xxx | box, toples, label |

## B.2 Bahan (satuan dasar)
| Bahan | Satuan dasar | Stok awal | Ambang menipis |
|---|---|---:|---:|
| Tepung terigu protein sedang | gram | 25.000 | 5.000 |
| Butter | gram | 5.000 | 1.000 |
| Gula halus | gram | 8.000 | 2.000 |
| Telur | pcs | 60 | 12 |
| Vanila | ml | 250 | 50 |
| Cokelat couverture | gram | 3.000 | 500 |
| Toples 250ml + label | pcs | 100 | 20 |

## B.3 Harga bahan per vendor → harga/satuan dasar
| Bahan | Vendor | Beli | Jumlah (satuan dasar) | Harga/satuan dasar | Acuan |
|---|---|---:|---|---:|:--:|
| Tepung terigu | Toko Bahan Kue Makmur | Rp 150.000 | 12.500 gram (½ sak) | Rp 12 / gram | ✓ |
| Butter | Distributor Butter | Rp 90.000 | 1.000 gram | Rp 90 / gram | ✓ |
| Gula halus | Toko Bahan Kue Makmur | Rp 16.000 | 1.000 gram | Rp 16 / gram | ✓ |
| Telur | Toko Bahan Kue Makmur | Rp 55.000 | 1.000 gram (≈18 btr) | Rp 55 / gram | ✓ |
| Vanila | Toko Bahan Kue Makmur | Rp 50.000 | 250 ml | Rp 200 / ml | ✓ |
| Cokelat couverture | Distributor Butter | Rp 120.000 | 1.000 gram | Rp 120 / gram | ✓ |
| Toples + label | Toko Kemasan | Rp 350.000 | 100 pcs | Rp 3.500 / pcs | ✓ |

> Catatan telur: disimpan satuan dasar `gram` (≈55 g/butir) supaya konsisten dengan resep yang menimbang. Bisa juga `pcs` jika resep pakai butiran — pilih satu konvensi.

## B.4 Produk + Resep + HPP

### Produk 1 — Butter Cookies (yield 24 pcs)
| Bahan | Qty | Biaya |
|---|---:|---:|
| Tepung terigu | 500 gram | 6.000 |
| Butter | 250 gram | 22.500 |
| Gula halus | 150 gram | 2.400 |
| Telur | 55 gram | 3.025 |
| Vanila | 5 ml | 1.000 |
| **Food cost (1 resep)** | | **34.925** |

- food_cost_per_unit = 34.925 / 24 = **1.455**
- Overhead/unit (gas oven + listrik) = **300** → **HPP/pcs = 1.755**

### Produk 2 — Butter Cookies Toples (yield 1 toples isi 12 pcs)
- Modal isi = HPP/pcs × 12 = 1.755 × 12 = 21.060
- Kemasan toples+label = 3.500 → **HPP/toples = 24.560**
- Target margin 50% → saran = 24.560 / 0,50 = 49.120 → **Rp 49.500**
- Harga jual final: **Rp 55.000** → margin aktual **55.3%**, untung/toples **Rp 30.440**

### Produk 3 — Chocolate Chunk Cookies (yield 20 pcs)
| Bahan | Qty | Biaya |
|---|---:|---:|
| Tepung terigu | 450 gram | 5.400 |
| Butter | 200 gram | 18.000 |
| Gula halus | 180 gram | 2.880 |
| Telur | 55 gram | 3.025 |
| Cokelat couverture | 200 gram | 24.000 |
| **Food cost (1 resep)** | | **53.305** |

- food_cost_per_unit = 53.305 / 20 = **2.665**
- Overhead/unit = 350 → **HPP/pcs = 3.015**
- Target margin 55% → saran = 3.015 / 0,45 = 6.700 → **Rp 7.000**
- Harga jual final: **Rp 7.000** → margin aktual **56.9%**

## B.5 Contoh Penjualan (1 hari)
| Tanggal | Produk | Qty | Harga | HPP snapshot | Profit baris |
|---|---|---:|---:|---:|---:|
| 31/05/26 | Butter Cookies Toples | 8 | 55.000 | 24.560 | 243.520 |
| 31/05/26 | Chocolate Chunk Cookies | 30 | 7.000 | 3.015 | 119.550 |

**Sales Board hari itu:** Omzet = 440.000 + 210.000 = **Rp 650.000** · Unit = **38** · Profit = **Rp 363.070**

---

## Catatan penggunaan contoh ini
1. Bisa dijadikan **seed data** awal (script insert) untuk demo.
2. Menguji semua jalur: bahan multi-satuan (gram/ml/pcs), 1 bahan banyak vendor, produk per-pcs & per-kemasan, snapshot HPP, sales board.
3. Saat membangun, **validasikan rumus** dengan angka di sini — hasil HPP & profit harus sama persis.
4. Kasus uji "data tidak lengkap": hapus harga acuan satu bahan (mis. Butter) → produk yang memakainya harus menampilkan "Data harga belum lengkap", bukan angka.
