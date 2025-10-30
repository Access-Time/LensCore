# Berkontribusi ke LensCore

Terima kasih atas ketertarikan Anda untuk berkontribusi ke LensCore! Kami menyambut kontribusi dari semua orang. Panduan ini akan membantu Anda memulai berkontribusi ke proyek ini.

## Cara Berkontribusi

- Laporkan bug dan masalah
- Usulkan fitur atau peningkatan baru
- Perbaiki dokumentasi
- Tulis test
- Kirim perubahan kode
- Review pull request
- Bantu pengguna lain dalam diskusi

## Memulai

### 1. Fork Repository

Mulai dengan melakukan fork repository di GitHub:

```bash
# Fork di GitHub, lalu clone fork Anda
git clone https://github.com/USERNAME_ANDA/LensCore.git
cd LensCore
```

### 2. Setup Environment Development

```bash
# Install dependencies
make install

# Copy file environment
cp env.example .env

# Jalankan development server
make dev
```

### 3. Buat Branch

Buat branch baru untuk fitur atau bugfix Anda:

```bash
git checkout -b feature/nama-fitur-anda
# atau
git checkout -b fix/nama-bugfix-anda
```

## Alur Kerja Development

### Menjalankan Test

```bash
# Jalankan semua test
make test

# Jalankan test dalam mode watch
npm run test:watch

# Jalankan file test tertentu
npm test -- path/to/test.ts
```

### Linting & Formatting

```bash
# Jalankan linter
make lint

# Perbaiki masalah linting
make lint:fix

# Format kode
make format
```

### Type Checking

```bash
# Jalankan TypeScript type checking
make typecheck
```

## Panduan Kontribusi

### Gaya Kode

- Ikuti gaya kode dan konvensi yang ada
- Gunakan TypeScript dengan strict type checking
- Tulis kode yang jelas dan self-documenting
- Tambahkan komentar untuk logika yang kompleks
- Gunakan nama variabel dan fungsi yang bermakna

### Testing

- Tulis test untuk fitur baru
- Pastikan test yang ada tetap pass
- Targetkan code coverage yang tinggi
- Test edge case dan skenario error

### Aksesibilitas

- Ikuti panduan WCAG 2.1
- Pastikan navigasi keyboard berfungsi
- Sediakan ARIA label yang tepat
- Test dengan screen reader
- Jaga kontras warna yang cukup

### Dokumentasi

- Update dokumentasi yang relevan
- Tambahkan JSDoc comment ke fungsi
- Update README jika diperlukan
- Dokumentasikan breaking changes

## Submit Pull Request

### Sebelum Submit

1. Pastikan semua test pass dan kode sudah di-lint
2. Update dokumentasi jika diperlukan
3. Tambah atau update test untuk perubahan Anda
4. Commit perubahan dengan pesan yang jelas
5. Push ke fork Anda dan buat pull request

### Format Pesan Commit

Gunakan pesan commit yang jelas dan deskriptif:

```bash
feat: tambah rule aksesibilitas baru untuk kontras warna
fix: perbaiki masalah crawling halaman nested
docs: update dokumentasi API untuk endpoint baru
test: tambah unit test untuk service aksesibilitas
refactor: tingkatkan struktur kode di AI processor
```

### Template Pull Request

Sertakan hal berikut dalam deskripsi PR Anda:

- **Deskripsi**: Apa yang dilakukan PR ini?
- **Issue Terkait**: Link ke issue yang terkait
- **Jenis Perubahan**: Bug fix, feature, dokumentasi, dll
- **Testing**: Bagaimana ini ditest?
- **Screenshot**: Jika ada
- **Checklist**: Test pass, docs updated, dll

## Kode Etik

Kami berkomitmen untuk menyediakan lingkungan yang ramah dan inklusif. Harap bersikap hormat dan perhatian dalam interaksi Anda dengan kontributor lain. Kami mengharapkan semua kontributor mengikuti Kode Etik kami.

### Standar Kami

- Bersikap hormat dan inklusif
- Sambut pendatang baru
- Terima kritik konstruktif dengan lapang dada
- Fokus pada apa yang terbaik untuk komunitas
- Tunjukkan empati terhadap anggota komunitas lainnya

## Detail Setup Development

### Prasyarat

- Node.js >= 20.0.0
- Docker dan Docker Compose
- Git
- npm atau yarn

### Struktur Project

```
LensCore/
├── src/               # Source code
│   ├── api/          # API routes dan handlers
│   ├── cli/          # CLI commands dan services
│   ├── services/     # Core services
│   ├── types/        # TypeScript types
│   └── utils/        # Utility functions
├── tests/            # File test
├── docs/             # Dokumentasi (VitePress)
├── pages/            # Legacy HTML pages
└── dist/             # Compiled output
```

### Perintah yang Tersedia

```bash
# Development
make dev              # Start development server
make build            # Build TypeScript
make start            # Start production server

# Testing
make test             # Jalankan tests
make test:coverage    # Jalankan tests dengan coverage
make test:watch       # Jalankan tests dalam mode watch

# Quality
make lint             # Jalankan linter
make lint:fix         # Perbaiki masalah linting
make format           # Format code
make typecheck        # Type checking

# Docker
make docker-build     # Build Docker image
make docker-up        # Start Docker containers
make docker-down      # Stop Docker containers
```

## Panduan Issue

### Melaporkan Bug

Ketika melaporkan bug, sertakan:

1. **Deskripsi**: Deskripsi jelas dari bug
2. **Langkah untuk Reproduce**: Langkah bernomor untuk reproduce
3. **Perilaku yang Diharapkan**: Apa yang Anda harapkan terjadi
4. **Perilaku Aktual**: Apa yang sebenarnya terjadi
5. **Environment**: OS, versi Node, browser, dll
6. **Screenshot**: Jika ada
7. **Logs**: Log error yang relevan

### Menyarankan Fitur

Ketika menyarankan fitur, sertakan:

1. **Masalah**: Masalah apa yang diselesaikan ini?
2. **Solusi yang Diusulkan**: Pendekatan yang Anda sarankan
3. **Alternatif**: Solusi lain yang Anda pertimbangkan
4. **Konteks Tambahan**: Screenshot, contoh, dll

## Proses Review

1. **Submission**: Anda submit pull request
2. **Automated Checks**: CI menjalankan tests dan linting
3. **Code Review**: Maintainer review kode Anda
4. **Feedback**: Anda address komentar review
5. **Approval**: Maintainer approve dan merge

## Mendapatkan Bantuan

Jika Anda memiliki pertanyaan tentang kontribusi:

- Buka issue di [GitHub](https://github.com/Access-Time/LensCore/issues)
- Bergabung dengan diskusi komunitas kami
- Hubungi maintainer

## Pengakuan

Kontributor diakui di:

- Daftar kontributor GitHub
- Release notes
- Project README
- Kredit dokumentasi

## Lisensi

Dengan berkontribusi ke LensCore, Anda setuju bahwa kontribusi Anda akan dilisensikan di bawah Lisensi MIT.

---

Terima kasih telah berkontribusi ke LensCore! Upaya Anda membantu membuat testing aksesibilitas lebih baik untuk semua orang. 🎉

