# 04 — Design System

Token konkret yang menerjemahkan `01_UI_UX_GUIDELINES.md` jadi angka. Semua nilai di sini adalah **sumber kebenaran**. Jangan pakai angka acak di luar skala ini.

## 1. Warna (monokrom, sebagai token tema)
Tidak ada warna brand. Hanya hitam/putih/abu, didefinisikan sebagai **token semantik** supaya bisa ditukar antar tema.

### Tema Terang
| Token | Nilai | Pakai untuk |
|---|---|---|
| `--bg` | `#FFFFFF` | latar utama |
| `--bg-subtle` | `#F4F4F4` | latar blok/kartu halus, header tabel |
| `--surface` | `#FFFFFF` | permukaan kartu |
| `--border` | `#E2E2E2` | hairline pembatas |
| `--border-strong` | `#111111` | border tombol/elemen tegas |
| `--text` | `#111111` | teks utama |
| `--text-muted` | `#6B6B6B` | teks sekunder/keterangan |
| `--text-inverse` | `#FFFFFF` | teks di atas fill gelap |
| `--fill-solid` | `#111111` | tombol utama (fill) |

### Tema Gelap
| Token | Nilai | Pakai untuk |
|---|---|---|
| `--bg` | `#0E0E0E` | latar utama |
| `--bg-subtle` | `#1A1A1A` | latar blok/kartu halus, header tabel |
| `--surface` | `#141414` | permukaan kartu |
| `--border` | `#2A2A2A` | hairline pembatas |
| `--border-strong` | `#F2F2F2` | border tombol/elemen tegas |
| `--text` | `#F2F2F2` | teks utama |
| `--text-muted` | `#9A9A9A` | teks sekunder/keterangan |
| `--text-inverse` | `#0E0E0E` | teks di atas fill terang |
| `--fill-solid` | `#F2F2F2` | tombol utama (fill) |

> Aturan: komponen **selalu** memakai token, tidak pernah hex langsung. Ganti tema = ganti peta token. **Semua elemen termasuk dropdown wajib pakai token ini.**

## 2. Tipografi — Poppins
Satu font: **Poppins** (web font). Fallback: `"Poppins", system-ui, sans-serif`.

Berat yang dipakai: **400 (Regular)**, **500 (Medium)**, **600 (SemiBold)**. Tidak pakai Light/Thin (buruk untuk angka kecil) dan tidak pakai Bold 700+ (terlalu berat untuk gaya tenang).

### Skala teks
| Token | Ukuran / line-height | Berat | Pakai |
|---|---|---|---|
| `display` | 32 / 40 | 600 | angka besar di dashboard (omzet) |
| `h1` | 24 / 32 | 600 | judul halaman |
| `h2` | 20 / 28 | 600 | judul section |
| `h3` | 16 / 24 | 600 | judul kartu |
| `body` | 14 / 22 | 400 | teks isi default |
| `body-strong` | 14 / 22 | 500 | penekanan dalam isi |
| `small` | 12 / 18 | 400 | keterangan |
| `label` | 11 / 16 | 600, UPPERCASE, letter-spacing 0.06em | label kolom tabel, eyebrow |

### Angka
- Semua angka di tabel/ringkasan: `font-variant-numeric: tabular-nums;`
- Kolom angka **rata kanan**.
- Rupiah: `Rp 12.500` (titik ribuan).

## 3. Spacing (skala 4px)
Pakai hanya nilai ini: **4, 8, 12, 16, 24, 32, 48, 64**.
| Token | px |
|---|---|
| `space-1` | 4 |
| `space-2` | 8 |
| `space-3` | 12 |
| `space-4` | 16 |
| `space-5` | 24 |
| `space-6` | 32 |
| `space-7` | 48 |
| `space-8` | 64 |

- Padding dalam kartu: `space-5` (24).
- Gap antar field form: `space-4` (16).
- Jarak antar section: `space-6` (32).

## 4. Radius
Kecil & seragam. Tidak ada bubble.
| Token | px | pakai |
|---|---|---|
| `radius-sm` | 4 | input, tombol, badge |
| `radius-md` | 8 | kartu, modal |
| `radius-none` | 0 | tabel, garis pembatas |

## 5. Border
- Hairline default: `1px solid var(--border)`.
- Tegas (tombol utama/elemen fokus): `1px solid var(--border-strong)`.
- Penanda perhatian (mis. stok menipis): garis kiri `2px solid var(--border-strong)`.
- **Tidak ada** drop shadow untuk mengangkat kartu. Pemisahan pakai border + `--bg-subtle`.

## 6. Tombol — UKURAN SERAGAM (aturan keras)
Semua tombol **tinggi sama**. Perbedaan peran lewat gaya, bukan ukuran.

| Properti | Nilai |
|---|---|
| Tinggi | **40px** (semua tombol, semua tempat) |
| Padding horizontal | 16px (`space-4`) |
| Radius | `radius-sm` (4) |
| Font | `body-strong` (14 / 500) |
| Min-width | 88px |

### Varian (beda gaya, sama ukuran)
| Varian | Latar | Teks | Border | Pakai |
|---|---|---|---|---|
| **Primary** | `--fill-solid` | `--text-inverse` | none | aksi utama (Simpan, Hitung) |
| **Secondary** | transparan | `--text` | `1px --border-strong` | aksi sekunder (Batal) |
| **Ghost** | transparan | `--text-muted` | none | aksi tersier (link aksi) |
| **Danger** | transparan | `--text` | `1px --border-strong`, teks SemiBold + prefiks teks | Hapus (konfirmasi) — tetap monokrom |

> Catatan: hanya **satu** tombol Primary per layar/area. Sisanya Secondary/Ghost. Tidak ada tombol yang lebih besar dari yang lain.

### Ukuran ikonik
Tidak ada tombol ikon. Kalau perlu tombol "tutup", gunakan tombol berisi glyph `×` dengan area sentuh 40×40, tetap tanpa warna.

## 7. Input & form
| Properti | Nilai |
|---|---|
| Tinggi input | 40px (samakan dengan tombol) |
| Padding | 8px 12px |
| Border | `1px --border`; fokus → `1px --border-strong` |
| Radius | `radius-sm` |
| Label | token `label` di atas input, jarak 4px |
| Pesan error | token `small`, di bawah input, prefiks "Error: " |

## 8. Dropdown / Select / Menu (wajib ikut tema)
Dropdown **tidak boleh** pakai gaya bawaan browser yang lepas dari tema. Spesifikasi:
- Trigger: sama persis dengan input (tinggi 40, border `--border`, radius-sm), teks `body`, penanda buka memakai glyph `›` diputar (atau `▾` netral) di kanan — **bukan ikon**.
- Panel: latar `--surface`, border `1px --border`, radius `radius-md`, tanpa shadow berat (boleh hairline).
- Item: tinggi 36–40px, padding 8px 12px, teks `body`.
- Item hover/aktif: latar `--bg-subtle` (bukan warna).
- Item terpilih: teks `body-strong` + glyph cek netral `✓` (opsional) atau garis kiri 2px.
- Panel **mengikuti token tema aktif** (terang/gelap). Saat tema diganti, dropdown ikut berubah.
- Untuk konsistensi penuh, gunakan komponen select kustom (mis. headless + styling token), **bukan** `<select>` native yang sulit ditema.

## 9. Tabel
- Header: latar `--bg-subtle`, teks token `label`.
- Baris: border bawah `1px --border`.
- Kolom angka rata kanan + tabular-nums.
- Tinggi baris min 44px (target sentuh tablet).
- Tanpa garis vertikal antar kolom (cukup spacing) untuk tampilan editorial.

## 10. Breakpoint (desktop/tablet-first, tidak rusak di HP)
| Nama | Lebar | Layout |
|---|---|---|
| `desktop` | ≥ 1200px | sidebar kiri + konten; tabel penuh |
| `tablet` | 768–1199px | sidebar bisa collapse jadi baris menu teks; tabel tetap |
| `mobile` | < 768px | menu jadi daftar teks vertikal/drawer teks; tabel jadi kartu bertumpuk (key–value) |

Target utama desain & QA: **desktop & tablet**. Mobile cukup "tetap terbaca & bisa dipakai".

## 11. Grid
- Konten maksimum lebar `1200px`, di tengah.
- Form 1 kolom (≤ 480px lebar field group) untuk fokus; data tabel boleh full width.
- Gunakan kelipatan `space` untuk semua gutter.

## 12. Motion (minimal)
- Transisi hanya untuk: buka/tutup dropdown & modal, hover state.
- Durasi 120–160ms, easing standar (ease-out). Tidak ada bounce/confetti/parallax.

## 13. Aset font
- Muat Poppins (400/500/600) via self-host atau Google Fonts.
- Aktifkan `font-display: swap`.
- Set global: `font-feature-settings` untuk tabular-nums pada elemen angka (utility class `.tnum`).
