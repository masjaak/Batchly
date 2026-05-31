# Batchly vs Craftybase — Perbandingan & Roadmap

Dokumen acuan untuk memutuskan fitur mana yang layak ditiru/diprioritaskan.
Pembanding: **Craftybase** (craftybase.com) — app recipe-costing untuk small-batch maker,
paling mirip DNA Batchly.

## Positioning

| | Batchly | Craftybase |
|---|---|---|
| Target | UMKM F&B Indonesia (home bakery, warung) | Maker global (kue, sabun, kosmetik) |
| Bahasa / mata uang | Indonesia / Rupiah | Inggris / multi |
| Kompleksitas | Sederhana, mobile-first | Lengkap, desktop/akuntansi |
| Harga | Terjangkau (rencana) | Premium ($) |

## Fitur

| Fitur | Batchly | Craftybase | Catatan |
|---|---|---|---|
| Bahan + stok | ✅ | ✅ | |
| Resep + HPP otomatis | ✅ | ✅ | inti keduanya |
| Saran harga jual | ✅ (Margin Guard) | sebagian | **keunggulan Batchly** |
| Deteksi "diam-diam rugi" (cost drift) | ✅ Margin Guard | ❌ tak setajam | **USP utama Batchly** |
| Batch produksi + variance | ✅ | ✅ | |
| Biaya operasional + laba bersih | ✅ | ✅ | |
| HPP berbasis lot/FIFO | ❌ (pakai harga terakhir) | ✅ | gap akurasi |
| Sub-resep (resep bertingkat) | ❌ | ✅ | gap |
| Integrasi marketplace (Shopify/Etsy/Tokopedia) | ❌ | ✅ | gap besar |
| Laporan pajak / nilai inventaris akhir | ❌ | ✅ | gap |
| Multi-user / peran | ❌ (siap via RLS) | ✅ | |
| Statistik real-time | ✅ (diperbaiki) | ✅ | |
| Bahasa Indonesia + UMKM-first | ✅ | ❌ | **keunggulan Batchly** |

## Roadmap prioritas (berdasarkan gap)

**Sekarang–dekat (pertajam keunggulan):**
1. Pertajam **Margin Guard**: alert WhatsApp/email saat produk jadi rugi (gated subscription).
2. **Simulasi what-if**: "kalau tepung naik 10%, produk mana rugi?"
3. Laporan **Laba-Rugi bulanan** ekspor PDF (untuk pemilik).

**Menengah (tutup gap penting):**
4. **HPP berbasis lot/FIFO** — akurasi COGS saat harga fluktuatif.
5. **Sub-resep** (mis. buttercream → kue).
6. Multi-user (sudah ada fondasi RLS per-organization).

**Jangka panjang (skala):**
7. Integrasi marketplace Indonesia (Tokopedia/Shopee) → stok & penjualan otomatis.
8. Laporan pajak / nilai inventaris akhir periode.

## Cara pakai dokumen ini
- Coba Craftybase free trial dengan 1 resep yang sama seperti di Batchly.
- Catat: berapa langkah untuk dapat HPP + saran harga? Mana yang lebih cepat?
- Fitur Craftybase yang bikin "wah" → masukkan ke roadmap, **jangan tiru semua** (overkill untuk UMKM).

## Pelajaran UX (temuan langsung)

Setelah mencoba Craftybase: **UI-nya terlalu rumit & terkesan jadul** — bingung mau mulai
dari mana. Ini bukan kelemahan kita; ini **peluang terbesar Batchly**:

- **Kesederhanaan = fitur, bukan kekurangan.** Pemilik UMKM bukan akuntan. Kalau Batchly bisa
  bikin orang langsung paham "produk mana yang untung/rugi" dalam < 1 menit, kita menang
  di pasar yang Craftybase tinggalkan (terlalu enterprise).
- **Onboarding berpemandu.** Justru karena Craftybase bikin bingung "mulai dari mana", Batchly
  harus punya alur awal yang jelas: Tambah bahan → Buat resep → Lihat margin. (Roadmap #0)
- **Modern & ringan > lengkap tapi berat.** Pertahankan look playful + cepat. Jangan korbankan
  kejelasan demi banyak fitur.

### Prinsip desain Batchly (jangan dilanggar)
1. Satu layar = satu keputusan jelas (jangan padat seperti dashboard akuntansi).
2. Angka penting (laba bersih, margin, produk rugi) selalu paling menonjol.
3. Setiap halaman kosong = ajakan aksi, bukan jalan buntu.
4. Bahasa manusia, bukan istilah akuntansi.

## Roadmap #0 — Onboarding (prioritas baru, hasil temuan UX)
- Checklist "3 langkah mulai" di dashboard saat data masih kosong:
  (1) Tambah bahan, (2) Buat resep, (3) Catat penjualan pertama.
- Progress bar kecil yang hilang setelah selesai.
- Ini menjawab langsung masalah "bingung mulai dari mana" yang kita rasakan di Craftybase.
