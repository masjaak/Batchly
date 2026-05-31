# 01 — UI/UX Guidelines

Dokumen ini adalah **aturan keras**. Kalau ada desain yang melanggar salah satu poin di sini, desain itu salah — bukan aturannya.

## 1. Filosofi: monokrom editorial
Tampilan "cantik" pada app ini **tidak** datang dari warna, ilustrasi, atau ikon. Sumber keindahannya:
- **Tipografi** — hierarki dari ukuran & ketebalan huruf (Poppins).
- **Ruang kosong (whitespace)** — jarak yang lega dan konsisten.
- **Perataan grid** — semuanya lurus pada grid yang sama.
- **Garis tipis (hairline)** — pembatas halus, bukan kotak tebal/bayangan berat.

Acuan rasa: majalah/editorial, laporan keuangan kelas atas, dokumen Swiss-style. Bersih karena **disengaja**, bukan karena kosong.

## 2. Yang DILARANG (hard no)
- ❌ **Warna.** Tidak ada warna brand, biru tombol, hijau sukses, merah bahaya sebagai blok warna. Lihat aturan status di §6.
- ❌ **Gradasi / gradient.** Tidak ada di mana pun.
- ❌ **Ikon dekoratif & icon font** (Material Icons, FontAwesome, dsb). Tidak ada ikon hamburger, ikon gear, ikon keranjang, dll. Lihat pengganti di §5.
- ❌ **Logo AI / ilustrasi AI / maskot.** Tidak ada.
- ❌ **Emoji** sebagai elemen UI.
- ❌ **Bayangan (drop shadow)** berlebihan untuk "mengangkat" kartu. Maksimal hairline border.
- ❌ **Sudut sangat bulat** ala bubble. Radius kecil & seragam (lihat Design System).
- ❌ **Banyak font** atau font dekoratif. Hanya Poppins.
- ❌ **Animasi ramai** (bounce, confetti, slide berlebihan).

## 3. Yang DIWAJIBKAN (hard yes)
- ✅ **Satu font: Poppins.** Semua teks.
- ✅ **Palet hanya hitam/putih/abu** (didefinisikan sebagai token tema, lihat `04_DESIGN_SYSTEM.md`).
- ✅ **Angka pakai `tabular-nums`** di semua tabel & ringkasan (digit rata lebar supaya kolom angka lurus).
- ✅ **Ukuran tombol seragam.** Semua tombol tingginya sama. Beda peran dibedakan lewat isi/penempatan & ketebalan border, bukan ukuran/warna.
- ✅ **Grid & spacing konsisten** dari skala token.
- ✅ **Tema terang & gelap**, dan **semua komponen (termasuk dropdown) mengikuti tema aktif.**

## 4. Hierarki tanpa warna
Karena tidak ada warna, hierarki dibangun dengan urutan alat berikut (pakai dari atas dulu):
1. **Ukuran huruf** — judul besar, isi sedang, keterangan kecil.
2. **Ketebalan huruf** — SemiBold untuk penekanan, Regular untuk isi.
3. **Posisi & spacing** — elemen penting diberi ruang lebih.
4. **Garis & latar abu sangat tipis** — untuk memisahkan blok.
5. **Huruf kapital + letter-spacing** — untuk label kecil (mis. judul kolom).

Penekanan TIDAK pernah pakai warna. "Tombol utama" dibedakan dengan **fill solid (hitam di tema terang / putih di tema gelap)**, tombol sekunder dengan **border + transparan**.

## 5. Pengganti ikon
Karena ikon dilarang, gunakan:
- **Teks/label jelas** — tombol bertuliskan "Tambah Bahan", bukan ikon "+".
- **Karakter tipografi netral** bila benar-benar perlu penanda arah: `›` (chevron), `×` (tutup), `—` / `–`. Ini glyph font, bukan icon set. Pakai hemat.
- **Garis pemisah** untuk grouping, bukan ikon kategori.

Navigasi memakai **teks** ("Dashboard", "Bahan", "Vendor", "Resep", "Penjualan", "Pengaturan").

## 6. Status & makna (tanpa warna)
Sukses/error/peringatan **tidak** diwakili warna. Gunakan:
- **Kata** — "Tersimpan", "Gagal menyimpan", "Stok menipis".
- **Posisi konsisten** — pesan status selalu muncul di tempat yang sama.
- **Berat huruf / border** — error boleh pakai border lebih tebal + teks SemiBold + prefiks "Error: ".
- **Underline atau garis kiri (hairline)** untuk menandai baris yang butuh perhatian.

Contoh stok menipis: baris tabel diberi **garis kiri tebal 2px** + label teks "Menipis", bukan diwarnai merah.

## 7. Densitas & keterbacaan
- Target perangkat utama: **desktop & tablet (lebar)**. Layout dirancang untuk lebar, tapi tetap **tidak rusak di HP** (lihat breakpoint di Design System).
- Tabel angka boleh padat, tapi tinggi baris cukup untuk disentuh di tablet (min 44px target sentuh).
- Hindari teks di bawah ukuran "kecil" token. Tidak ada teks abu di atas abu yang sulit dibaca — jaga kontras.

## 8. Bahasa & penulisan
- **Bahasa Indonesia**, istilah sederhana: "Modal" (HPP), "Harga Jual", "Untung", "Stok", "Vendor".
- Angka uang format Rupiah: `Rp 12.500` (titik ribuan, tanpa desimal kecuali perlu).
- Tanggal: `31 Mei 2026` atau `31/05/26` pada tabel padat — pilih satu, konsisten.
- Tombol pakai kata kerja: "Simpan", "Tambah", "Hapus", "Hitung".

## 9. Checklist review desain
Sebelum sebuah layar dianggap selesai, cek:
- [ ] Tidak ada warna, gradasi, ikon, logo, emoji.
- [ ] Hanya Poppins.
- [ ] Semua tombol tinggi & gaya konsisten dengan token.
- [ ] Angka pakai tabular-nums dan rata kanan di kolom angka.
- [ ] Tampak benar di tema terang DAN gelap.
- [ ] Dropdown/menu mengikuti tema aktif.
- [ ] Ada state untuk: kosong, loading, error (lihat `07_UI_BEHAVIOR_RULES.md`).
- [ ] Spacing mengikuti skala token (tidak ada angka acak).
