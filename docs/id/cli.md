# Penggunaan CLI

LensCore CLI adalah antarmuka baris perintah yang powerful untuk testing aksesibilitas dan web crawling. Menyediakan alat komprehensif untuk menganalisis website terhadap kepatuhan aksesibilitas, crawl halaman web, dan menghasilkan laporan detail.

## Instalasi

LensCore CLI dipublikasikan sebagai paket npm `@accesstime/lenscore` dan membutuhkan **Node.js 20+**.

```bash
# Instal global (direkomendasikan)
npm install -g @accesstime/lenscore

# Atau jalankan tanpa instal global
npx @accesstime/lenscore --help
```

Setelah instal global, CLI tersedia di mana saja sebagai perintah `lens-core`.

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
- `-u, --url <url>`: Set base URL kustom (contoh: `http://localhost:3003`)
- `--ai`: Aktifkan fitur AI saat setup
- `-k, --openai-key <key>`: Set OpenAI API key

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
- `--custom-tests <tests>`: Custom tests untuk dijalankan (dipisahkan koma, contoh: "responsive")
- `--no-screenshot`: Skip capture screenshot
- `--skip-cache`: Lewati cache dan paksa test baru

**Contoh:**

```bash
lens-core test https://example.com
lens-core test https://example.com --enable-ai
lens-core test https://example.com --timeout 30000
lens-core test https://example.com --rules "color-contrast,keyboard"
lens-core test https://example.com --project-context "react,tailwind"
lens-core test https://example.com --web
lens-core test https://example.com --no-screenshot
lens-core test https://example.com --custom-tests=responsive --enable-ai
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
- `--skip-cache`: Lewati cache dan paksa crawl baru

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
lens-core scan https://example.com --custom-tests=responsive --enable-ai --max-urls 10
```

**Ringkasan opsi:**

- Semua opsi `crawl`: `--max-urls`, `--max-depth`, `--timeout`, `--concurrency`, `--wait-until`, `--skip-cache`
- Semua opsi `test`: `--enable-ai`, `--openai-key`, `--project-context`, `--web`, `--timeout`, `--rules`, `--tags`, `--custom-tests`, `--no-screenshot`

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

## Manajemen Cache

### `cache:clear`

Menghapus semua data cache yang digunakan oleh LensCore (baik in-memory maupun cache eksternal tergantung konfigurasi Anda).

```bash
lens-core cache:clear
```

### `cache:stats`

Menampilkan statistik cache seperti hit rate dan ukuran cache.

```bash
lens-core cache:stats
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

## Alur CI & Rilis

Bagian ini ditujukan untuk kontributor dan maintainer yang mengerjakan LensCore CLI.

### Continuous Integration (GitHub Actions)

Setiap push ke `main` dan setiap pull request akan menjalankan workflow GitHub Actions berikut:

- **Build Check** (`.github/workflows/build.yml`): menjalankan `npm run typecheck` dan `npm run build`
- **Test Check** (`.github/workflows/test.yml`): menjalankan `npm run test` dan `npm run test:coverage`
- **Lint Check** (`.github/workflows/lint.yml`): menjalankan `npm run lint` dan `npm run format:check`

Selain itu, workflow **Security Check** (`.github/workflows/security.yml`) berjalan terjadwal untuk:

- Menjalankan `npm audit` dengan threshold severitas _moderate_
- Menghasilkan laporan dependency yang ketinggalan versi

### Deploy Dokumentasi

Dokumentasi dibuild dan dideploy ke GitHub Pages oleh `.github/workflows/deploy-docs.yml`:

- Terpicu saat push ke `main` yang menyentuh `docs/**`, `package.json`, `package-lock.json`, atau workflow itu sendiri
- Menjalankan `npm ci` dan `npm run docs:build`
- Mempublikasikan dokumentasi ke GitHub Pages

### Merilis Versi CLI Baru ke npm

Rilis paket npm `@accesstime/lenscore` saat ini dilakukan secara manual (belum otomatis dari CI). Alur rilis yang umum:

1. **Pastikan branch main hijau**
   - Semua workflow GitHub Actions (build, test, lint, security) harus lulus.
2. **Update versi**
   - Gunakan `npm version patch|minor|major` (disarankan) atau edit `package.json` secara manual.
   - Perintah `npm version` akan mengupdate field versi dan membuat Git tag.
3. **Build project**
   - Jalankan `npm run build` untuk menghasilkan output `dist/`, termasuk `dist/cli.js` yang digunakan oleh `bin/index.js`.
4. **Publish ke npm**
   - Login terlebih dahulu dengan `npm login` (sekali per environment).
   - Untuk paket publik yang sudah pernah dirilis: `npm publish`
   - Untuk rilis pertama paket scoped ini: `npm publish --access public`
5. **Verifikasi versi baru**
   - Instal global di environment bersih: `npm install -g @accesstime/lenscore`
   - Jalankan `lens-core --version` untuk memastikan versi yang terpasang sama dengan yang dirilis.

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

### Custom Tests

LensCore mendukung custom tests tambahan untuk analisis yang lebih mendalam. Saat ini tersedia:

#### Responsive Test

Test responsivitas layout website menggunakan AI untuk mendeteksi masalah desain responsif di berbagai ukuran viewport.

**Persyaratan:**

- Memerlukan `--enable-ai` atau `--openai-key` untuk mengaktifkan analisis AI
- Menggunakan model OpenAI yang mendukung Vision API (otomatis menggunakan `gpt-4o` jika diperlukan)

**Cara Menggunakan:**

```bash
# Test responsivitas satu halaman
lens-core test https://example.com --custom-tests=responsive --enable-ai

# Test responsivitas dengan scan
lens-core scan https://example.com --custom-tests=responsive --enable-ai --max-urls 10

# Dengan web report
lens-core test https://example.com --custom-tests=responsive --enable-ai --web
```

**Apa yang Dilakukan:**

- Mengambil screenshot di berbagai viewport (mobile, tablet, desktop)
- Menganalisis screenshot menggunakan AI untuk mendeteksi masalah responsif
- Menghasilkan laporan dengan screenshot dan rekomendasi perbaikan

**Hasil Test:**

- Screenshot untuk setiap viewport
- Daftar masalah responsif yang terdeteksi
- Rekomendasi perbaikan untuk setiap masalah
- Status pass/fail untuk setiap viewport

### Custom Rules

LensCore mendukung custom rules untuk menambahkan aturan aksesibilitas tambahan. Custom rules dapat berupa Axe-core rules atau Playwright tests.

#### Approved Rules

LensCore menyediakan set approved rules yang sudah dikurasi dan tersedia secara default:

- `button-has-accessible-name` - Memastikan button punya accessible name
- `link-has-accessible-name` - Memastikan link punya accessible name
- `heading-order` - Memastikan heading punya hierarchy yang logis
- `page-has-heading-one` - Memastikan halaman punya heading level 1
- `image-alt-text` - Memastikan image punya alt text yang sesuai

Approved rules otomatis dijalankan saat test. Untuk menonaktifkan:

```bash
lens-core test https://example.com --no-approved-rules
```

#### Custom Rules dari Project

Buat custom rules di project dengan membuat file di salah satu lokasi berikut:

- `.lenscore/rules/`
- `lenscore-rules/`
- `.lenscore-rules/`

**Contoh Axe Rule:**

Buat file `.lenscore/rules/my-rule.json`:

```json
{
  "id": "my-custom-rule",
  "enabled": true,
  "metadata": {
    "description": "Custom rule description",
    "help": "Help text for the rule"
  },
  "rule": {
    "id": "color-contrast",
    "enabled": true,
    "tags": ["wcag2aa"]
  },
  "severity": "serious"
}
```

**Contoh Playwright Test:**

Buat file `.lenscore/rules/my-test.js`:

```javascript
export default {
  id: 'my-test',
  name: 'My Custom Test',
  enabled: true,
  severity: 'moderate',
  run: async (context) => {
    const { page } = context;
    const elements = await page.$$eval('button', (buttons) => buttons.length);
    return {
      id: 'my-test',
      name: 'My Custom Test',
      passed: elements > 0,
      severity: 'moderate',
      description:
        elements > 0 ? `Found ${elements} buttons` : 'No buttons found',
    };
  },
};
```

#### Opsi Custom Rules

```bash
# Gunakan custom rules dari path tertentu
lens-core test https://example.com --custom-rules-paths ./my-rules,./team-rules

# Gunakan custom rules dari config file
lens-core test https://example.com --custom-rules-config ./rules-config.json

# Nonaktifkan default rules
lens-core test https://example.com --disable-default-rules color-contrast,keyboard

# Aktifkan specific default rules
lens-core test https://example.com --enable-default-rules color-contrast
```

### Test Rule Aksesibilitas Spesifik

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
