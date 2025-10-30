# Referensi API

LensCore menyediakan RESTful API yang komprehensif untuk testing aksesibilitas dan web crawling. API dibangun dengan Express.js dan mengikuti spesifikasi OpenAPI 3.0.

## Base URL

```
http://localhost:3001/api
```

## Dokumentasi API Interaktif

Untuk dokumentasi API interaktif, start LensCore API server dan kunjungi:

```
http://localhost:3001/api/docs
```

Ini menyediakan interface Swagger UI dimana Anda bisa:
- Lihat semua endpoint yang tersedia
- Coba API calls secara langsung
- Lihat request/response schemas
- Download spesifikasi OpenAPI

## Autentikasi

Saat ini, API tidak memerlukan autentikasi untuk penggunaan lokal. Untuk deployment produksi, pertimbangkan untuk mengimplementasikan middleware autentikasi.

## Endpoint API

### Health Check

#### GET `/api/health`

Cek status kesehatan API server.

**Contoh Response:**

```json
{
  "status": "healthy",
  "timestamp": "2024-01-15T10:30:00.000Z",
  "version": "0.1.21"
}
```

---

### Test Satu Halaman

#### POST `/api/test`

Test aksesibilitas satu halaman web.

**Request Body:**

```json
{
  "url": "https://example.com",
  "enableAI": false,
  "projectContext": "",
  "timeout": 30000,
  "rules": [],
  "tags": ["wcag2a", "wcag2aa"],
  "includeScreenshot": true
}
```

**Parameters:**

- `url` (required): URL untuk di-test
- `enableAI` (optional): Aktifkan analisis berbasis AI
- `projectContext` (optional): Konteks project untuk AI (contoh: "react,tailwind")
- `timeout` (optional): Timeout load halaman dalam milidetik (default: 30000)
- `rules` (optional): Rule axe spesifik untuk di-test
- `tags` (optional): Tag WCAG untuk di-test
- `includeScreenshot` (optional): Sertakan screenshot dalam response (default: true)

**Contoh Response:**

```json
{
  "url": "https://example.com",
  "timestamp": "2024-01-15T10:30:00.000Z",
  "violations": [
    {
      "id": "color-contrast",
      "impact": "serious",
      "description": "Elemen harus memiliki kontras warna yang cukup",
      "help": "https://dequeuniversity.com/rules/axe/4.8/color-contrast",
      "nodes": [
        {
          "html": "<p>Teks kontras rendah</p>",
          "target": ["body > p:nth-child(1)"],
          "failureSummary": "Perbaiki salah satu dari berikut..."
        }
      ]
    }
  ],
  "passes": [],
  "incomplete": [],
  "inapplicable": [],
  "screenshot": "data:image/png;base64,...",
  "aiRecommendations": null
}
```

---

### Test Beberapa Halaman

#### POST `/api/test-multiple`

Test aksesibilitas beberapa halaman secara bersamaan.

**Request Body:**

```json
{
  "urls": [
    "https://example.com",
    "https://example.com/about"
  ],
  "enableAI": false,
  "projectContext": "",
  "timeout": 30000,
  "rules": [],
  "tags": ["wcag2a", "wcag2aa"]
}
```

**Response:** Array hasil test untuk setiap URL.

---

### Web Crawling

#### POST `/api/crawl`

Crawl website dan temukan semua halaman.

**Request Body:**

```json
{
  "url": "https://example.com",
  "maxUrls": 50,
  "maxDepth": 3,
  "timeout": 30000,
  "concurrency": 3,
  "waitUntil": "networkidle"
}
```

**Parameters:**

- `url` (required): URL awal untuk crawl
- `maxUrls` (optional): Jumlah maksimum URL untuk di-crawl (default: 100)
- `maxDepth` (optional): Kedalaman maksimum crawl (default: 3)
- `timeout` (optional): Timeout load halaman (default: 30000)
- `concurrency` (optional): Jumlah request bersamaan (default: 3)
- `waitUntil` (optional): Kapan menganggap halaman ter-load (default: "networkidle")

**Contoh Response:**

```json
{
  "baseUrl": "https://example.com",
  "urls": [
    "https://example.com",
    "https://example.com/about",
    "https://example.com/contact"
  ],
  "totalUrls": 3,
  "timestamp": "2024-01-15T10:30:00.000Z"
}
```

---

### Gabungan Crawl dan Test

#### POST `/api/combined`

Crawl website dan test semua halaman yang ditemukan untuk aksesibilitas.

**Request Body:**

```json
{
  "url": "https://example.com",
  "crawlOptions": {
    "maxUrls": 50,
    "maxDepth": 3
  },
  "testOptions": {
    "enableAI": false,
    "tags": ["wcag2a", "wcag2aa"]
  }
}
```

**Response:** Hasil crawl dengan hasil test aksesibilitas untuk setiap halaman.

---

### Manajemen Cache

#### GET `/api/cache/stats`

Dapatkan statistik cache.

**Contoh Response:**

```json
{
  "type": "memory",
  "keys": 15,
  "size": "2.5 MB",
  "hits": 142,
  "misses": 23,
  "hitRate": "86%"
}
```

---

#### DELETE `/api/cache/clear`

Clear seluruh cache.

**Response:**

```json
{
  "message": "Cache berhasil di-clear"
}
```

---

#### POST `/api/cache/warm`

Warm up cache dengan halaman yang sering diakses.

**Request Body:**

```json
{
  "urls": [
    "https://example.com",
    "https://example.com/about"
  ]
}
```

## Error Handling

API menggunakan HTTP status codes standar:

- `200` - Sukses
- `400` - Bad Request (parameter tidak valid)
- `404` - Not Found
- `500` - Internal Server Error

**Format Error Response:**

```json
{
  "error": "Pesan error",
  "details": "Informasi error detail",
  "timestamp": "2024-01-15T10:30:00.000Z"
}
```

## Rate Limiting

Saat ini, tidak ada rate limiting yang diimplementasikan. Untuk penggunaan produksi, pertimbangkan untuk mengimplementasikan middleware rate limiting.

## CORS

CORS diaktifkan secara default untuk semua origins. Konfigurasi pengaturan CORS di produksi sesuai kebutuhan.

## Contoh

### Menggunakan cURL

```bash
# Health check
curl http://localhost:3001/api/health

# Test halaman
curl -X POST http://localhost:3001/api/test \
  -H "Content-Type: application/json" \
  -d '{
    "url": "https://example.com",
    "enableAI": false
  }'

# Crawl website
curl -X POST http://localhost:3001/api/crawl \
  -H "Content-Type: application/json" \
  -d '{
    "url": "https://example.com",
    "maxUrls": 20
  }'
```

### Menggunakan JavaScript (fetch)

```javascript
// Test halaman
const response = await fetch('http://localhost:3001/api/test', {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
  },
  body: JSON.stringify({
    url: 'https://example.com',
    enableAI: false,
    tags: ['wcag2a', 'wcag2aa']
  })
});

const results = await response.json();
console.log(`Ditemukan ${results.violations.length} pelanggaran`);
```

### Menggunakan Python (requests)

```python
import requests

# Test halaman
response = requests.post('http://localhost:3001/api/test', json={
    'url': 'https://example.com',
    'enableAI': False,
    'tags': ['wcag2a', 'wcag2aa']
})

results = response.json()
print(f"Ditemukan {len(results['violations'])} pelanggaran")
```

## Spesifikasi OpenAPI

Download spesifikasi OpenAPI lengkap:

- **JSON**: `http://localhost:3001/api/docs/openapi.json`
- **YAML**: Tersedia di source code di `src/api/openapi.ts`

## SDK dan Client Libraries

Saat ini, LensCore tidak menyediakan SDK libraries resmi. Namun, Anda bisa dengan mudah mengintegrasikan dengan HTTP client library apa pun di bahasa pemrograman pilihan Anda.

Pertimbangkan menggunakan tools seperti:
- **OpenAPI Generator**: Generate client SDKs dari OpenAPI spec
- **Swagger Codegen**: Opsi lain untuk generation SDK

## Dukungan

Untuk masalah atau pertanyaan terkait API:

- [GitHub Issues](https://github.com/Access-Time/LensCore/issues)
- [Dokumentasi API](http://localhost:3001/api/docs)
- [Dokumentasi CLI](/id/cli)

---

Untuk informasi lebih lanjut, lihat:
- [Panduan Memulai](/id/getting-started)
- [Dokumentasi CLI](/id/cli)
- [Panduan Kontribusi](/id/contributing)

