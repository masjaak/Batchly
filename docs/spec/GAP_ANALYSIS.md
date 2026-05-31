# Gap Analysis — Batchly × Spec Takar

Dokumen ini memetakan kondisi **Batchly saat ini** terhadap **spec Takar** (`docs/spec/00–12`), lalu memutuskan: **UPGRADE**, **KEEP**, atau **DROP**. Tujuan restructure: ambil yang berguna dari spec, perbaiki yang kurang, jangan sentuh yang sudah baik.

Prinsip: *re-skin & perbaikan terpusat dulu (risiko rendah, dampak besar ke rasa). Perubahan skema DB (multi-usaha) dipisah sebagai fase tersendiri agar tidak merusak logika yang sudah jalan.*

---

## 1. Sudah baik di Batchly → KEEP (jangan diutak-atik)
| Area | Kondisi | Alasan dipertahankan |
|---|---|---|
| `src/lib/calculations.ts` | HPP, margin, batch variance, Margin Guard, `suggestPrice` (sudah bulatkan Rp500), `formatCurrency` | Sudah cocok dengan spec `08_HPP`. Ada test. **Jangan tulis ulang.** |
| Margin Guard (USP) | Deteksi cost-drift / "diam-diam rugi" | Keunggulan utama vs Craftybase. Spec Takar tidak punya ini. |
| Production batches + variance | Lengkap | Di luar scope MVP Takar, tapi nilai tambah nyata. Pertahankan. |
| Auth + RLS per-organization | Jalan | Fondasi keamanan; Takar malah menunda auth. Batchly lebih maju. |
| Token-driven theming | `tailwind.config.ts` + primitives `components/ui` | Justru ini yang bikin re-skin bisa terpusat. |
| Test suite (vitest) | Ada untuk hooks & calculations | Jaring pengaman saat refactor. |
| PWA / offline | Terpasang | Bonus, tidak mengganggu. |

## 2. Kurang / tidak sesuai spec → UPGRADE
| Area | Sekarang | Target (spec) | Fase |
|---|---|---|---|
| Palet warna | Warna-warni: accent oranye, highlight kuning, berry/grape/mint, status hijau/merah | Monokrom hitam/putih/abu (`01_UI_UX`, `04_DESIGN_SYSTEM`) | **A** |
| Font | Inter | **Poppins** | **A** |
| Radius | 18–32px (bubble) | 4–8px (kecil, editorial) | **A** |
| Shadow | card/hover/shell berat | Hairline border, tanpa shadow berat | **A** |
| Tema gelap | `darkMode:'class'` ada tapi token tidak ber-CSS-var | Tema terang+gelap via CSS variables, dropdown ikut tema | **A** |
| Ikon (lucide-react) | Dipakai di Button, Nav, EmptyState, StatCard, halaman | Tanpa ikon; teks/glyph netral (`01_UI_UX §5`) | **A** |
| Button | varian warna (`lime`) + size sm/md (tidak seragam) | Ukuran seragam tinggi 40px; beda peran lewat gaya bukan warna/ukuran | **A** |
| StatCard tone warna | berry/grape/mint/highlight | Monokrom; tren via teks +/−, bukan warna | **A** |
| Angka tabel | belum tabular-nums konsisten | `tabular-nums`, rata kanan (`04`, `07`) | **A** |
| Multi-usaha (Kopi/Pastry) | 1 user → ambil org pertama (`limit(1).single()`), tanpa switcher | 1 akun banyak workspace, data terisolasi `business_id` (`00`, `03`) | **B (terpisah)** |

## 3. Tidak diperlukan sekarang → DROP / TUNDA
| Item | Keputusan | Alasan |
|---|---|---|
| Warna brand & tone (berry/grape/mint/highlight/accent) | DROP nilai warnanya (token tetap, nilai → abu) | Monokrom. Token dipertahankan agar tidak perlu edit tiap halaman. |
| `lucide-react` (lib ikon) | DROP dari UI; copot dependency bila sudah tak terpakai | Aturan tanpa ikon. |
| `tailwindcss-animate`, animasi stagger/lift/pop-in berat | KURANGI (sisakan transisi halus 120–160ms) | Aturan "tenang", motion minimal. |
| Penyesuaian harga berbasis lokasi | TIDAK dibuat | Bukan fitur (spec `00`): app kasih angka jujur, lokasi diolah manual. |
| Lot/FIFO costing, sub-resep, integrasi marketplace | TUNDA | Sudah ada di `comparison.md` sebagai roadmap jangka menengah/panjang. |
| Auth ditunda (ide Takar) | TIDAK diadopsi | Batchly sudah punya auth; menunda = mundur. |

## 4. Unused code / kandidat bersih-bersih (diverifikasi di Fase refactor)
Akan dikonfirmasi dengan pencarian referensi sebelum dihapus:
- Komponen folder kosong: `src/components/{production,inventory,supplier,recipe,auth,sales,settings}` (banyak terlihat kosong; halaman ada di `src/pages`).
- Ikon yang di-import tapi setelah re-skin tidak dipakai.
- `tailwindcss-animate` bila semua animasi dilepas.
- Util/komponen yang tak direferensikan (cek via grep sebelum hapus).

## 5. Urutan eksekusi (fase)
- **Fase A — Re-skin monokrom (risiko rendah, terpusat):** tokens → CSS variables (light/dark), Poppins, radius kecil, buang shadow, Button seragam, StatCard/Badge monokrom, Select/Input/EmptyState ikut token, copot ikon dari UI, tabular-nums.
- **Fase Refactor/Cleanup:** hapus unused code/file/dependency, rapikan, pastikan lint+test+build hijau.
- **Fase B — Multi-usaha (terpisah, perlu diskusi):** migrasi `organizations`→ konsep workspace switch (Kopi/Pastry), atau buat usaha kedua dalam 1 akun. **Menyentuh DB + RLS + query**, jadi tidak digabung ke re-skin.

## 6. Catatan keputusan
- **Tidak menggabungkan migrasi skema ke dalam refactor visual.** Mengubah model `organization` adalah perubahan berisiko (RLS, data nyata). Dilakukan terpisah, dengan verifikasi, setelah re-skin stabil.
- **Nama token dipertahankan** (`background/surface/ink/accent/...`) — hanya nilainya yang berubah jadi monokrom. Ini kunci agar halaman tidak perlu disentuh satu per satu.
