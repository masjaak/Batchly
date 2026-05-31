# 07 — UI Behavior Rules

Aturan interaksi & state. Tujuannya konsistensi: setiap layar berperilaku sama untuk situasi yang sama.

## 1. State wajib tiap tampilan data
Setiap daftar/tabel/panel data **harus** menangani 4 keadaan:

| State | Tampilan |
|---|---|
| **Loading** | Skeleton baris abu (`--bg-subtle`), bukan spinner besar. Pertahankan tinggi agar layout tidak loncat. |
| **Empty** | EmptyState: judul + pesan singkat + 1 tombol primary ke aksi berikutnya. Tanpa ilustrasi. |
| **Error** | Pesan teks "Gagal memuat data." + tombol "Coba lagi". Prefiks "Error: " untuk detail teknis (opsional, kecil). |
| **Normal** | Data tampil. |

## 2. Empty state per halaman (teks acuan)
- **Dashboard:** "Belum ada data. Mulai dari menambah bahan." → "Tambah Bahan".
- **Penjualan:** "Belum ada penjualan dicatat." → "Catat Penjualan".
- **Produk:** "Belum ada produk." → "Tambah Produk".
- **Bahan:** "Belum ada bahan." → "Tambah Bahan".
- **Vendor:** "Belum ada vendor." → "Tambah Vendor".
- **Stok:** mengikuti Bahan (kalau bahan kosong).
- **Resep (dalam produk):** "Resep masih kosong. Tambahkan bahan yang dipakai." → "Tambah Bahan".

## 3. Loading
- Aksi simpan: tombol masuk state `loading`, teksnya berubah ("Menyimpan…"), tombol disabled selama proses.
- Jangan blokir seluruh layar untuk aksi kecil; cukup area terkait.
- Untuk navigasi antar halaman, skeleton di area konten.

## 4. Validasi form
- Validasi **saat submit** + inline saat blur untuk field yang jelas salah.
- Pesan error di bawah field, token `small`, prefiks "Error: ". Contoh: "Error: Harga harus lebih dari 0."
- Tombol Simpan tidak men-submit kalau ada error; fokus pindah ke field error pertama.
- Field wajib ditandai dengan teks "(wajib)" pada label, bukan tanda bintang berwarna.

### Aturan validasi spesifik
- Nama (bahan/vendor/produk): wajib, tidak boleh duplikat dalam 1 workspace.
- Harga & qty: angka > 0. Uang: integer Rupiah.
- Satuan dasar bahan: wajib dipilih sebelum bisa dipakai di resep.
- Harga jual: wajib sebelum produk bisa dijual (dicatat di Penjualan).

## 5. Aturan HPP & data tidak lengkap (penting)
- Jika sebuah bahan di resep **belum punya harga acuan**, HppCalculatorPanel **tidak** menghitung angka final. Tampilkan:
  - Pesan: "Data harga belum lengkap."
  - Daftar bahan yang kurang harga (dengan link ke Detail Bahan).
- **Jangan pernah** menampilkan HPP tebakan / Rp 0 seolah valid. Lebih baik kosong + alasan. (Prinsip "jujur soal angka".)
- Jika resep kosong → "Tambahkan bahan ke resep untuk menghitung HPP."

## 6. Konfirmasi & aksi merusak
- **Hapus** selalu lewat modal konfirmasi: "Hapus [nama]? Tindakan ini tidak bisa dibatalkan." + tombol Secondary (Batal) & Danger (Hapus).
- Hapus = soft delete (`deleted_at`). Data penjualan lama tetap utuh (HPP snapshot menjaga laporan).
- Tidak ada aksi destruktif satu-klik tanpa konfirmasi.

## 7. Penyimpanan & umpan balik
- Setelah simpan sukses: tampilkan pesan singkat non-blok "Tersimpan" di lokasi konsisten (mis. pojok bawah, hilang 2–3 dtk), lalu tutup modal / refresh daftar.
- Setelah gagal: pesan "Gagal menyimpan." tetap tampil sampai pengguna bertindak; data form tidak hilang.
- Optimistic update boleh untuk update stok kecil; rollback bila gagal.

## 8. Workspace switching
- Mengganti workspace (Kopi↔Pastry) **memuat ulang data halaman aktif** untuk `business_id` baru.
- Jika sedang ada form belum tersimpan, konfirmasi: "Ada perubahan belum disimpan. Pindah workspace?"
- Workspace aktif disimpan (localStorage) agar konsisten saat reload.

## 9. Tema
- ThemeToggle mengubah tema seketika tanpa reload.
- Preferensi tema disimpan (localStorage). Default: ikut preferensi sistem (terang/gelap) saat pertama.
- **Semua** komponen termasuk dropdown, modal, tabel, skeleton mengikuti tema aktif. QA wajib cek dua tema.

## 10. Angka, mata uang, tanggal
- Uang: `Rp` + titik ribuan, tanpa desimal. Input menyimpan integer.
- Saat fokus di CurrencyInput → tampil angka mentah; saat blur → format.
- Kuantitas: boleh desimal, tampilkan satuan dasar di sebelahnya.
- Tanggal default penjualan = hari ini; format tampilan konsisten (`31 Mei 2026` atau `31/05/26` di tabel padat — pilih satu di implementasi).
- Persen (margin): tampil 1 desimal bila perlu (mis. "62.5%").

## 11. Tabel — perilaku
- Urutkan default: terbaru di atas (penjualan), alfabet (master data).
- Sorting kolom: klik header (penanda arah glyph `▲`/`▼` netral).
- Pencarian/filter: input teks di atas tabel untuk daftar panjang (bahan/vendor/produk).
- Kolom angka rata kanan; baris bisa diklik untuk detail bila ada halaman detail.
- Mobile: tabel jadi kartu key–value, aksi tetap tersedia.

## 12. Keyboard & aksesibilitas dasar
- Form bisa di-submit dengan Enter (kecuali di Textarea).
- Esc menutup modal/dropdown.
- Focus ring jelas (border `--border-strong`), jangan dihilangkan.
- Kontras teks dijaga (lihat token); jangan teks muted di atas muted.
- Target sentuh min 40–44px.

## 13. Pencegahan kesalahan umum
- Tidak bisa menghapus bahan yang masih dipakai resep aktif → tampilkan "Bahan dipakai di N resep" + daftar; minta lepas dulu atau konfirmasi.
- Tidak bisa menghapus vendor yang jadi harga acuan tanpa peringatan.
- Mengubah satuan dasar bahan yang sudah dipakai resep → peringatkan dampaknya ke HPP.

## 14. Konsistensi (ringkas)
- Satu pola untuk semua: aksi utama kanan-atas (PageHeader), aksi baris di kanan tabel, simpan/batal di footer modal.
- Istilah konsisten: "Modal/HPP", "Harga Jual", "Untung/Profit", "Stok", "Vendor", "Acuan".
- Posisi pesan status selalu sama di seluruh app.
