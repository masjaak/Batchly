# Batchly — Design System

Panduan ini menjelaskan bagaimana tampilan Batchly diatur, supaya kamu (atau AI agent)
bisa mengubah desain dengan cepat dan konsisten **tanpa menyentuh tiap halaman satu per satu**.

Filosofi: **"Playful tapi Terpercaya"** — hangat, ramah, sedikit ceria, tapi tetap
jelas dan enak dibaca untuk data keuangan.

---

## 1. Di mana mengubah apa

| Mau ubah... | Edit file ini |
|---|---|
| Warna, radius, bayangan, animasi | `tailwind.config.ts` |
| Gaya input/tekstarea global, animasi masuk halaman, hover-lift | `src/index.css` |
| Tampilan tombol | `src/components/ui/Button.tsx` |
| Kartu / kartu statistik / badge | `src/components/ui/Card.tsx`, `src/components/ui/StatCard.tsx` |
| Dropdown (bukan native OS) | `src/components/ui/Select.tsx` |
| Input + label + empty state + judul halaman | `src/components/ui/Input.tsx`, `src/components/ui/EmptyState.tsx` |
| Navigasi atas + ikon search/notif/info | `src/components/layout/TopNav.tsx` |
| Kerangka halaman (lebar, app-shell) | `src/components/layout/AppLayout.tsx` |

> Aturan emas: **selalu pakai token & primitive**, jangan tulis warna/ukuran mentah
> (`#fff`, `h-12`, `rounded-lg`) langsung di halaman. Kalau lewat token, semua halaman
> ikut berubah otomatis.

---

## 2. Token Warna (di `tailwind.config.ts`)

| Token | Nilai | Dipakai untuk |
|---|---|---|
| `background` | `#F6F1EA` | latar krem hangat di belakang app-shell |
| `shell` / `surface` | `#FFFFFF` | panel putih utama & kartu |
| `surface-muted` | `#F7F3EC` | latar lembut (chip, baris info) |
| `ink` / `primary` | `#24201B` | teks utama, tombol gelap |
| `secondary` | `#8A8276` | teks abu (subjudul, label) |
| `accent` | `#F2782C` | **aksen utama** (oranye) — link, fokus, brand |
| `accent-soft` | `#FDEBDC` | latar lembut aksen |
| `highlight` | `#FFD24A` | kuning cerah — tombol pop / chart laba |
| `berry` | `#E85D75` | aksen sekunder (pink) |
| `grape` | `#7C6BD6` | aksen tersier (ungu) |
| `mint` | `#2FB59A` | aksen (teal) |
| `success` `warning` `danger` | hijau / oranye / merah | status |

**Cara ganti tema cepat:** ubah `accent` + `highlight` saja → seluruh app ikut berganti nuansa.
Mau lebih kalem/korporat: kecilkan pemakaian `berry/grape/mint` (lihat StatCard tone).
Mau lebih ramai: pakai tone warna di lebih banyak kartu.

---

## 3. Bentuk & Gerak

- **Radius:** `rounded-xl` (18px) untuk input/tombol, `rounded-2xl` (24px) untuk kartu,
  `rounded-3xl` (32px) untuk app-shell.
- **Shadow:** `shadow-card` (diam), `shadow-card-hover` (saat hover), `shadow-shell` (kerangka).
- **Animasi:**
  - `.lift` → kartu/tombol naik halus + shadow saat hover.
  - `.stagger` → anak-anak elemen muncul fade-up berurutan (dipakai di `AppLayout` tiap pindah halaman).
  - Hormati `prefers-reduced-motion` (animasi mati otomatis).

---

## 4. Primitive Komponen (selalu pakai ini)

```tsx
import { Card, CardHeader } from '@/components/ui/Card'
import { Button } from '@/components/ui/Button'
import { StatCard, Badge } from '@/components/ui/StatCard'
import { Select } from '@/components/ui/Select'
import { Input, Textarea, FormField } from '@/components/ui/Input'
import { EmptyState, PageHeader } from '@/components/ui/EmptyState'
```

- **Button** varian: `primary` (ink), `lime` (highlight kuning), `outline`, `ghost`, `danger`; ukuran `sm` | `md`.
- **Card**: tambahkan prop `hover` agar bisa hover-lift (`<Card hover>`).
- **StatCard** `tone`: `plain` | `dark` | `highlight` | `berry` | `grape` | `mint`.
- **Select**: dropdown custom (BUKAN native OS). Selalu pakai ini untuk pilihan.
- **PageHeader**: judul + subjudul + tombol aksi (di kanan). Pakai untuk header tiap halaman list.
- **EmptyState**: ikon + judul + deskripsi + CTA, untuk halaman kosong.

### Contoh header halaman + aksi ringkas (BUKAN tombol full-width)
```tsx
<PageHeader
  title="Resep"
  subtitle="Kelola resep dan hitung HPP."
  action={<Link to="/app/recipes/new"><Button size="sm"><Plus className="h-4 w-4" /> Resep Baru</Button></Link>}
/>
```

---

## 5. Aturan Layout

- Halaman **form / detail / settings** otomatis dibatasi lebar (`max-w-2xl`, ter-center)
  lewat daftar `NARROW` di `AppLayout.tsx`. Ini mencegah tombol/form melebar tidak wajar.
  Kalau menambah halaman form baru, tambahkan potongan path-nya ke array `NARROW`.
- Halaman **dashboard / list** memakai lebar penuh dalam app-shell.
- Grid dashboard: 12 kolom (`lg:grid-cols-12`), kartu pakai `lg:col-span-*`.

---

## 6. Konvensi Data (penting agar tombol "Simpan" berfungsi)

Semua tabel di Supabase pakai **Row Level Security per-organization**. Karena itu:

- **Setiap insert WAJIB menyertakan `organization_id`.**
- Pola yang benar: ambil `const { organization } = useAuth()` lalu sertakan
  `organization_id: organization.id` di payload, ATAU pakai hook yang sudah menyuntik org
  sendiri (mis. `useCreateProductVariant`, `useCreateProductionBatch`).
- Kalau lupa → insert ditolak (error RLS / NOT NULL) dan data "tidak tersimpan".

---

## 7. Checklist saat menambah halaman / fitur baru

1. Pakai `PageHeader` untuk judul + aksi (hindari tombol full-width).
2. Pakai primitive (`Card`, `Button`, `Select`, `Input`, `EmptyState`) — jangan kelas mentah.
3. Empty state pakai `<EmptyState>` dengan ikon + CTA.
4. Form baru → daftarkan path ke `NARROW` di `AppLayout`.
5. Insert ke Supabase → sertakan `organization_id`.
6. Tulis test (mengikuti `agent_rule.txt`: TDD + regression test tiap bug).
