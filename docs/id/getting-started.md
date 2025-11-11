# Memulai dengan LensCore

Selamat datang di LensCore! Panduan ini akan membantu Anda memulai dengan platform testing aksesibilitas dan web crawling kami.

## Apa itu LensCore?

LensCore adalah platform open-source yang menggabungkan:

- **Testing Aksesibilitas** dengan axe-core
- **Web Crawling Cerdas** menggunakan Puppeteer
- **Analisis Berbasis AI** dengan OpenAI (opsional)
- **Pelaporan Komprehensif** dalam format HTML dan JSON

## Prasyarat

Sebelum memulai, pastikan Anda memiliki:

- **Node.js** >= 20.0.0
- **Docker** (untuk deployment dalam container)
- **npm** atau **yarn** package manager
- **OpenAI API Key** (opsional, untuk fitur AI)

## Instalasi

### Instalasi Global

Install LensCore secara global via npm:

```bash
npm install -g @accesstime/lenscore
```

Atau menggunakan yarn:

```bash
yarn global add @accesstime/lenscore
```

### Verifikasi Instalasi

Cek apakah LensCore terinstall dengan benar:

```bash
lens-core --version
```

## Konfigurasi

### Setup Awal

Jalankan wizard setup untuk konfigurasi LensCore:

```bash
lens-core setup --port 3001
```

Ini akan:

- Membuat file konfigurasi di `~/.lenscore/config.json`
- Setup environment Docker
- Konfigurasi port API
- Opsional setup integrasi OpenAI

### Konfigurasi Manual

Anda juga bisa manual edit file konfigurasi:

```json
{
  "mode": "local",
  "docker": {
    "image": "lenscore:latest",
    "port": 3001
  },
  "remote": {
    "baseUrl": "http://localhost:3001"
  },
  "openai": {
    "apiKey": "",
    "model": "gpt-3.5-turbo",
    "enabled": false
  },
  "project": {
    "framework": "",
    "cssFramework": "",
    "language": "",
    "buildTool": ""
  }
}
```

### Environment Variables

Anda juga bisa konfigurasi LensCore menggunakan environment variables:

- `LENSCORE_PORT`: Port API server (default: 3001)
- `OPENAI_API_KEY`: API key OpenAI Anda
- `CACHE_TYPE`: Tipe cache (memory|redis|none)
- `CACHE_TTL`: Time-to-live cache dalam detik
- `CACHE_MAX_SIZE`: Ukuran maksimum cache

## Mulai Cepat

### 1. Setup Awal

Jalankan wizard setup interaktif untuk konfigurasi LensCore untuk proyek Anda:

```bash
lens-core setup
```

Ini akan memandu Anda melalui:

- Membuat `lenscore.config.json`
- Konfigurasi aturan test aksesibilitas
- Setup fitur AI (opsional)
- Memilih strategi cache
- Metadata proyek

**Contoh dengan custom port:**

```bash
lens-core setup --port 8080
```

Ini memungkinkan Anda menentukan port custom untuk API server.

### 2. Build dan Start Services

Setelah setup, build dan start services:

```bash
lens-core build
```

Perintah ini akan:

- Build Docker image
- Start services dalam container
- Initialize API server

### 3. Cek Status Service

```bash
lens-core status
```

Anda akan melihat:

```
✓ Docker daemon is running
✓ Container lenscore is running
✓ API is healthy
```

### 4. Test Satu Halaman

Jalankan test aksesibilitas pertama Anda:

```bash
lens-core test https://example.com
```

Ini akan:

- Load webpage
- Jalankan test aksesibilitas
- Generate laporan
- Output hasil ke console

### 5. Test dengan Analisis AI

Aktifkan rekomendasi berbasis AI:

```bash
lens-core test https://example.com --enable-ai
```

### 6. Generate Laporan HTML

Buat laporan HTML visual:

```bash
lens-core test https://example.com --web
```

Laporan akan disimpan ke direktori `web/output/`.

## Contoh Penggunaan Dasar

### Test Beberapa Halaman

```bash
lens-core test-multiple \
  https://example.com \
  https://example.com/about \
  https://example.com/contact
```

### Crawl Website

Temukan dan list semua halaman di website:

```bash
lens-core crawl https://example.com --max-urls 50
```

### Scan Website Lengkap

Crawl dan test seluruh website:

```bash
lens-core scan https://example.com \
  --max-urls 50 \
  --max-depth 3 \
  --enable-ai \
  --web
```

## Menggunakan API

LensCore menyediakan RESTful API yang bisa digunakan dari HTTP client mana pun.

### Start API Server

```bash
lens-core up
```

### Test Halaman via API

```bash
curl -X POST http://localhost:3001/api/test \
  -H "Content-Type: application/json" \
  -d '{
    "url": "https://example.com",
    "enableAI": false
  }'
```

### Cek Kesehatan API

```bash
curl http://localhost:3001/api/health
```

## Struktur Project

Ketika menjalankan LensCore, ini akan membuat struktur berikut:

```
~/.lenscore/
├── config.json          # File konfigurasi
├── logs/                # Log aplikasi
│   ├── combined.log
│   └── error.log
└── cache/               # Direktori cache

./
├── storage/             # Penyimpanan screenshot
│   └── screenshots/
└── web/                 # Laporan HTML
    └── output/
```

## Opsi Konfigurasi

### Konfigurasi Docker

```bash
# Set port kustom
lens-core config --set "docker.port=3002"

# Cek konfigurasi saat ini
lens-core config --list
```

### Konfigurasi OpenAI

```bash
# Set API key
lens-core config --set "openai.apiKey=sk-..."

# Aktifkan fitur AI
lens-core config --set "openai.enabled=true"

# Set model
lens-core config --set "openai.model=gpt-4"
```

### Konteks Project

Set konteks project untuk rekomendasi AI yang lebih baik:

```bash
lens-core config --set "project.framework=react"
lens-core config --set "project.cssFramework=tailwind"
```

## Troubleshooting

### Docker Tidak Berjalan

Jika melihat "Docker daemon is not running":

```bash
# Start Docker Desktop (macOS/Windows)
# Atau start Docker service (Linux)
sudo systemctl start docker
```

### Port Sudah Digunakan

Jika port 3001 sudah digunakan:

```bash
lens-core setup --port 3002
```

### Masalah Permission

Jika mengalami error permission:

```bash
# Linux/macOS
sudo chown -R $USER ~/.lenscore

# Cek permissions
ls -la ~/.lenscore/
```

### Masalah Cache

Clear cache jika mengalami masalah:

```bash
# Via API
curl -X DELETE http://localhost:3001/api/cache/clear

# Atau restart services
lens-core down
lens-core up
```

## Langkah Selanjutnya

Sekarang Anda sudah setup LensCore, Anda bisa:

- [Jelajahi Perintah CLI](/id/cli) - Pelajari semua perintah dan opsi yang tersedia
- [Baca Dokumentasi API](/id/api) - Integrasikan LensCore ke aplikasi Anda
- [Pelajari Tentang Aksesibilitas](/id/accessibility) - Pahami panduan WCAG
- [Kontribusi ke LensCore](/id/contributing) - Bantu tingkatkan project

## Mendapatkan Bantuan

Jika butuh bantuan:

- Cek [GitHub Issues](https://github.com/Access-Time/LensCore/issues) kami
- Baca [dokumentasi CLI](/id/cli)
- Review [referensi API](/id/api)
- Bergabung dengan diskusi komunitas kami

## Update

Jaga LensCore tetap up to date:

```bash
# Cek update
npm outdated -g @accesstime/lenscore

# Update ke versi terbaru
npm update -g @accesstime/lenscore
```

---

Siap untuk mendalami lebih lanjut? Lihat [Dokumentasi CLI](/id/cli) untuk referensi perintah yang komprehensif!
