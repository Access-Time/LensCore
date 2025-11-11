# Aksesibilitas

LensCore mengikuti prinsip WCAG 2.1 AA untuk memastikan bahwa dokumentasi dan alat kami dapat diakses oleh semua orang, termasuk orang dengan disabilitas. Kami berkomitmen untuk menyediakan pengalaman yang inklusif untuk semua pengguna.

## Kepatuhan WCAG 2.1

Web Content Accessibility Guidelines (WCAG) 2.1 menyediakan standar bersama untuk aksesibilitas konten web. LensCore mematuhi kepatuhan Level AA, memenuhi prinsip kunci berikut:

### Dapat Dipersepsikan

Informasi dan komponen antarmuka pengguna harus dapat ditampilkan kepada pengguna dengan cara yang dapat mereka persepsikan.

- ✓ Alternatif teks untuk gambar
- ✓ Kontras warna yang cukup
- ✓ Teks yang dapat diperbesar
- ✓ Konten yang dapat beradaptasi

### Dapat Dioperasikan

Komponen antarmuka pengguna dan navigasi harus dapat dioperasikan oleh semua pengguna.

- ✓ Dapat diakses dengan keyboard
- ✓ Waktu cukup untuk membaca
- ✓ Tidak ada konten pemicu kejang
- ✓ Navigasi yang mudah

### Dapat Dimengerti

Informasi dan operasi antarmuka pengguna harus dapat dimengerti.

- ✓ Teks yang dapat dibaca
- ✓ Perilaku yang dapat diprediksi
- ✓ Bantuan input
- ✓ Pencegahan kesalahan

### Robust

Konten harus cukup kuat untuk dapat diinterpretasikan oleh berbagai agen pengguna.

- ✓ Markup HTML yang valid
- ✓ Label ARIA yang tepat
- ✓ Kompatibel dengan teknologi bantu
- ✓ Sesuai standar

## Praktik Aksesibilitas Kami

### HTML Semantik

Kami menggunakan elemen semantik HTML5 yang tepat (header, nav, main, article, section, footer) dan hierarki heading (h1-h6) untuk memberikan struktur yang bermakna bagi screen reader dan teknologi bantu.

### Navigasi Keyboard

Semua elemen interaktif dapat diakses dengan keyboard. Indikator fokus yang terlihat menunjukkan elemen mana yang memiliki fokus. Pengguna dapat bernavigasi melalui seluruh situs hanya menggunakan keyboard (Tab, Shift+Tab, Enter, Escape).

### Kontras Warna

Kami mempertahankan rasio kontras minimum 4.5:1 untuk teks normal dan 3:1 untuk teks besar, memenuhi standar WCAG AA. Tema terang dan gelap diuji untuk kontras yang cukup.

### Dukungan Screen Reader

Kami menggunakan label ARIA, role, dan properti jika diperlukan. Skip link memungkinkan pengguna melewati konten yang berulang. Alt text mendeskripsikan gambar secara bermakna.

### Dukungan Bahasa

Kami menyediakan atribut bahasa (lang) yang tepat untuk konten Bahasa Inggris dan Indonesia, memungkinkan screen reader menggunakan pengucapan dan suara yang benar.

### Desain Responsif

Dokumentasi kami sepenuhnya responsif dan berfungsi di semua ukuran perangkat. Teks dapat diperbesar hingga 200% tanpa kehilangan konten atau fungsionalitas.

## Fitur Aksesibilitas

- **Link Skip Navigasi**: Link skip ke konten utama di bagian atas setiap halaman
- **Indikator Fokus yang Terlihat**: Indikasi visual yang jelas dari fokus keyboard
- **Dukungan Mode Gelap**: Secara otomatis mendeteksi preferensi sistem dengan toggle manual
- **Teks Link Deskriptif**: Link dengan jelas mendeskripsikan tujuan mereka
- **Urutan Tab Logis**: Navigasi tab mengikuti layout visual
- **Label ARIA**: Atribut ARIA yang tepat untuk pengalaman screen reader yang lebih baik
- **Navigasi Konsisten**: Struktur navigasi yang dapat diprediksi di semua halaman
- **Dukungan Dwibahasa**: Konten tersedia dalam Bahasa Inggris dan Indonesia

## Testing Aksesibilitas dengan LensCore

LensCore sendiri adalah alat untuk testing aksesibilitas. Berikut cara menggunakannya:

### Test Aksesibilitas Dasar

```bash
lens-core test https://situs-anda.com
```

### Test dengan Rekomendasi AI

```bash
lens-core test https://situs-anda.com --enable-ai
```

### Test Level WCAG Spesifik

```bash
lens-core test https://situs-anda.com --tags "wcag2a,wcag2aa"
```

### Generate Laporan HTML

```bash
lens-core test https://situs-anda.com --web
```

## Masalah Aksesibilitas Umum

LensCore test untuk masalah aksesibilitas umum termasuk:

1. **Kontras Warna**: Kontras tidak cukup antara teks dan background
2. **Alt Text Hilang**: Gambar tanpa teks alternatif deskriptif
3. **Label Form**: Input form tanpa label terkait
4. **Struktur Heading**: Level heading yang dilewati atau heading hilang
5. **Teks Link**: Link dengan teks non-deskriptif seperti "klik di sini"
6. **Akses Keyboard**: Elemen interaktif tidak dapat diakses keyboard
7. **Penggunaan ARIA**: Atribut ARIA yang salah atau hilang
8. **Deklarasi Bahasa**: Atribut lang yang hilang atau salah

## Praktik Terbaik

### Untuk Developer

- Gunakan elemen HTML semantik
- Sediakan alternatif teks untuk konten non-teks
- Pastikan kontras warna yang cukup
- Buat semua fungsionalitas dapat diakses keyboard
- Gunakan atribut ARIA dengan benar
- Test dengan screen reader
- Validasi markup HTML

### Untuk Content Creator

- Tulis konten yang jelas dan ringkas
- Gunakan teks link yang deskriptif
- Sediakan caption untuk video
- Struktur konten dengan heading yang tepat
- Gunakan list untuk informasi sekuensial
- Hindari hanya mengandalkan warna untuk menyampaikan informasi

### Untuk Designer

- Desain dengan rasio kontras tinggi
- Pastikan indikator fokus terlihat
- Buat area klik cukup besar
- Sediakan hierarki visual
- Desain untuk berbagai ukuran layar
- Pertimbangkan dark mode

## Umpan Balik Aksesibilitas

Kami terus berupaya meningkatkan aksesibilitas LensCore. Jika Anda mengalami hambatan aksesibilitas atau memiliki saran untuk perbaikan, silakan beritahu kami.

### Laporkan Masalah Aksesibilitas

Anda dapat melaporkan masalah aksesibilitas melalui:

- **GitHub Issues**: [Laporkan issue](https://github.com/Access-Time/LensCore/issues)
- **Email**: accessibility@accesstime.com
- **Diskusi Komunitas**

Harap sertakan:

- Deskripsi masalah
- URL halaman di mana Anda mengalami masalah
- Browser dan teknologi bantu yang digunakan
- Langkah-langkah untuk mereproduksi (jika ada)

## Sumber Daya

### Pelajari Lebih Lanjut

- [Panduan WCAG 2.1](https://www.w3.org/WAI/WCAG21/quickref/)
- [WebAIM](https://webaim.org/) - Sumber daya aksesibilitas web
- [A11y Project](https://www.a11yproject.com/) - Sumber daya aksesibilitas berbasis komunitas
- [MDN Accessibility](https://developer.mozilla.org/en-US/docs/Web/Accessibility)

### Alat

- **LensCore**: Testing aksesibilitas otomatis
- **axe DevTools**: Extension browser untuk testing
- **WAVE**: Tool evaluasi aksesibilitas web
- **Screen Readers**: NVDA (Windows), JAWS (Windows), VoiceOver (macOS/iOS)

## Pernyataan Aksesibilitas

LensCore berkomitmen untuk memastikan aksesibilitas digital bagi orang dengan disabilitas. Kami terus meningkatkan pengalaman pengguna untuk semua orang dan menerapkan standar aksesibilitas yang relevan.

### Status Kepatuhan

Dokumentasi LensCore sesuai dengan WCAG 2.1 level AA.

### Umpan Balik

Kami menyambut umpan balik Anda tentang aksesibilitas LensCore. Silakan beritahu kami jika Anda mengalami hambatan aksesibilitas.

---

Terima kasih telah membantu kami membuat LensCore lebih mudah diakses untuk semua orang! ♿
