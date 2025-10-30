# Penggunaan CLI

LensCore CLI adalah antarmuka baris perintah yang powerful untuk testing aksesibilitas dan web crawling. Menyediakan alat komprehensif untuk menganalisis website terhadap kepatuhan aksesibilitas, crawl halaman web, dan menghasilkan laporan detail.

## Instalasi

```bash
npm install -g @accesstime/lenscore
```

## Panduan Mulai Cepat

### 1. Setup LensCore

```bash
lens-core setup --port 3009
```

### 2. Build dan Jalankan Services

```bash
lens-core build
```

### 3. Cek Status Service

```bash
lens-core status
```

### 4. Test Satu Halaman

```bash
lens-core test https://example.com
```

### 5. Crawl Website

```bash
lens-core crawl https://example.com
```

### 6. Scan Website Lengkap

```bash
lens-core scan https://example.com
```

::: tip Catatan
Setelah setup, Anda bisa menjalankan `lens-core build` (yang build dan start services) atau `lens-core up` (yang hanya start services). Gunakan `lens-core status` untuk mengecek apakah services berjalan dengan baik.
:::

## Ringkasan Perintah

### Setup & Konfigurasi

#### `setup [options]`

Setup konfigurasi LensCore dan environment Docker.

```bash
# Setup interaktif
lens-core setup
```

**Opsi:**

- `--port <port>`: Set port API (default: 3001)
- `--ai`: Aktifkan fitur AI saat setup
- `--openai-key <key>`: Set OpenAI API key

---

#### `config [options]`

Kelola pengaturan konfigurasi LensCore.

**Opsi:**

- `-s, --set <key=value>`: Set nilai konfigurasi (contoh: docker.port=3003)
- `-g, --get <key>`: Get nilai konfigurasi (contoh: docker.port)
- `-l, --list`: Tampilkan semua pengaturan konfigurasi

**Contoh:**

```bash
# Tampilkan semua konfigurasi
lens-core config --list

# Get nilai konfigurasi tertentu
lens-core config --get docker.port

# Set nilai konfigurasi
lens-core config --set "docker.port=3009"

# Set OpenAI API key
lens-core config --set "openai.apiKey=your-key-here"
```

## Testing Aksesibilitas

### `test [options] <url>`

Test aksesibilitas satu halaman.

**Opsi:**

- `--enable-ai`: Aktifkan analisis berbasis AI
- `-k, --openai-key <key>`: OpenAI API key
- `-c, --project-context <context>`: Konteks proyek (contoh: "react,tailwind")
- `-w, --web`: Generate laporan HTML
- `-t, --timeout <ms>`: Timeout load halaman (default: 30000)
- `-r, --rules <rules>`: Rule spesifik untuk di-test (dipisahkan koma)
- `-g, --tags <tags>`: Tag WCAG untuk di-test (contoh: "wcag2a,wcag2aa")
- `--no-screenshot`: Skip capture screenshot

**Contoh:**

```bash
lens-core test https://example.com
lens-core test https://example.com --enable-ai
lens-core test https://example.com --timeout 30000
lens-core test https://example.com --rules "color-contrast,keyboard"
lens-core test https://example.com --project-context "react,tailwind"
lens-core test https://example.com --web
lens-core test https://example.com --no-screenshot
```

---

### `test-multiple [options] <urls...>`

Test aksesibilitas beberapa halaman secara bersamaan.

**Contoh:**

```bash
lens-core test-multiple https://example.com https://google.com
lens-core test-multiple https://example.com https://google.com --enable-ai
lens-core test-multiple https://example.com https://google.com --web
```

## Web Crawling

### `crawl [options] <url>`

Crawl website dan temukan halaman.

**Opsi:**

- `-w, --web`: Generate laporan HTML
- `-u, --max-urls <number>`: Maksimum URL untuk di-crawl
- `-d, --max-depth <number>`: Kedalaman maksimum crawl
- `-t, --timeout <ms>`: Timeout load halaman
- `-j, --concurrency <number>`: Request bersamaan
- `-l, --wait-until <event>`: Tunggu hingga event (load|domcontentloaded|networkidle)

**Contoh:**

```bash
lens-core crawl https://example.com
lens-core crawl https://example.com --max-urls 50 --max-depth 3
lens-core crawl https://example.com --concurrency 5
lens-core crawl https://example.com --web
```

---

### `scan [options] <url>`

Crawl website dan test aksesibilitas (operasi gabungan).

**Contoh:**

```bash
lens-core scan https://example.com
lens-core scan https://example.com --enable-ai
lens-core scan https://example.com --max-urls 50 --max-depth 3
lens-core scan https://example.com --project-context "react,tailwind"
lens-core scan https://example.com --web
```

## Manajemen Docker

### `build`

Build Docker image dan start containers.

```bash
lens-core build
```

---

### `up`

Start Docker containers (tanpa building).

```bash
lens-core up
```

---

### `down`

Stop dan remove Docker containers.

```bash
lens-core down
```

---

### `status`

Cek status Docker container dan API.

```bash
lens-core status
```

---

### `health`

Cek API health endpoint.

```bash
lens-core health
```

## Format Output

### Output JSON (Default)

```bash
lens-core test https://example.com
```

Mengembalikan JSON dengan:

- Hasil test
- Pelanggaran
- Passes
- Test incomplete
- Screenshots (base64)

### Output Web (Laporan HTML)

```bash
lens-core test https://example.com --web
```

Generate laporan HTML disimpan ke direktori `web/output/` dengan:

- Representasi visual
- Deskripsi pelanggaran detail
- Preview screenshot
- Code snippets
- Rekomendasi

## File Konfigurasi

Konfigurasi LensCore disimpan di `~/.lenscore/config.json`:

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

## Environment Variables

- `LENSCORE_PORT`: Port API server
- `OPENAI_API_KEY`: OpenAI API key
- `CACHE_TYPE`: Tipe cache (memory|redis|none)
- `CACHE_TTL`: Time-to-live cache (detik)
- `CACHE_MAX_SIZE`: Ukuran maksimum cache

## Contoh Penggunaan Real-World

### Analisis Website Lengkap

```bash
lens-core setup --ai --openai-key your-api-key
lens-core build
lens-core health
lens-core scan https://example.com --max-urls 50 --enable-ai --web
```

### Batch Testing

```bash
lens-core test-multiple \
  https://example.com \
  https://example.com/about \
  https://example.com/contact \
  --enable-ai \
  --project-context "react,tailwind" \
  --web
```

### Crawling Kustom

```bash
lens-core crawl https://example.com \
  --max-urls 50 \
  --max-depth 3 \
  --concurrency 5 \
  --wait-until networkidle \
  --web
```

### Integrasi CI/CD

```bash
lens-core setup --port 3001 --ai --openai-key $OPENAI_API_KEY
lens-core build
lens-core health
lens-core test https://example.com > results.json
```

## Troubleshooting

### Masalah Umum

```bash
# Docker tidak berjalan
docker info
lens-core up

# Konflik port
lens-core setup --port 3002

# Masalah permission
ls -la ~/.lenscore/
lens-core config --reset
```

### Mendapatkan Bantuan

- Gunakan `lens-core --help` untuk list perintah
- Gunakan `lens-core help <command>` untuk bantuan perintah spesifik
- Cek `lens-core status` untuk kesehatan service
- Review logs di `~/.lenscore/logs/`

## Penggunaan Lanjutan

### Rule Kustom

Test rule aksesibilitas spesifik:

```bash
lens-core test https://example.com --rules "color-contrast,keyboard"
lens-core test https://example.com --tags "wcag2a,wcag2aa"
```

### Tuning Performa

Optimalkan performa crawling:

```bash
lens-core scan https://example.com \
  --concurrency 5 \
  --timeout 30000 \
  --max-urls 50 \
  --max-depth 3
```

### Contoh Integrasi

#### Integrasi Node.js

```javascript
const { exec } = require('child_process');

exec('lens-core test https://example.com', (error, stdout, stderr) => {
  if (error) {
    console.error(`Error: ${error.message}`);
    return;
  }
  const results = JSON.parse(stdout);
  console.log(`Ditemukan ${results.violations.length} pelanggaran`);
});
```

#### Integrasi Shell Script

```bash
#!/bin/bash
# test-suite.sh

lens-core health || exit 1

lens-core test https://example.com > results.json
if [ $(jq '.violations | length' results.json) -gt 0 ]; then
  echo "Pelanggaran aksesibilitas ditemukan!"
  exit 1
fi
```

## Dukungan

- **Repository GitHub**: [https://github.com/Access-Time/LensCore](https://github.com/Access-Time/LensCore)
- **Issue Tracker**: [https://github.com/Access-Time/LensCore/issues](https://github.com/Access-Time/LensCore/issues)
- **Dokumentasi**: [https://accesstime.github.io/LensCore](https://accesstime.github.io/LensCore)

---

Untuk informasi lebih lanjut tentang fitur spesifik, lihat:

- [Referensi API](/id/api) - Dokumentasi RESTful API
- [Panduan Aksesibilitas](/id/accessibility) - Informasi kepatuhan WCAG
- [Panduan Kontribusi](/id/contributing) - Cara berkontribusi ke LensCore
