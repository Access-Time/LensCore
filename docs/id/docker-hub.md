# Menggunakan LensCore dari Docker Hub

LensCore tersedia sebagai Docker image yang sudah di-build di Docker Hub, memungkinkan Anda menjalankan LensCore tanpa perlu clone repository atau build dari source.

## Mulai Cepat

### Pull dan Jalankan Versi Terbaru

```bash
docker run -d \
  --name lenscore \
  -p 3001:3001 \
  -e PORT=3001 \
  -e NODE_ENV=production \
  accesstimeco/lenscore:latest
```

### Menggunakan File Environment

Buat file `.env` dengan konfigurasi Anda:

```bash
docker run -d \
  --name lenscore \
  -p 3001:3001 \
  --env-file .env \
  accesstimeco/lenscore:latest
```

### Dengan Persistent Storage

Mount volume untuk logs dan storage:

```bash
docker run -d \
  --name lenscore \
  -p 3001:3001 \
  -v $(pwd)/storage:/app/storage \
  -v $(pwd)/logs:/app/logs \
  --env-file .env \
  accesstimeco/lenscore:latest
```

### Menggunakan Versi Spesifik

Gunakan tag versi spesifik daripada `latest`:

```bash
docker run -d \
  --name lenscore \
  -p 3001:3001 \
  accesstimeco/lenscore:0.1.68
```

## Verifikasi Instalasi

Cek apakah LensCore berjalan:

```bash
curl http://localhost:3001/api/health
```

Response yang diharapkan:

```json
{
  "status": "healthy",
  "timestamp": "2024-01-01T00:00:00.000Z",
  "services": {
    "crawling": "up",
    "accessibility": "up",
    "storage": "up"
  }
}
```

## Menghentikan Container

```bash
docker stop lenscore
docker rm lenscore
```

## Update LensCore

### Update ke Versi Terbaru

```bash
docker stop lenscore
docker rm lenscore
docker pull accesstimeco/lenscore:latest
docker run -d \
  --name lenscore \
  -p 3001:3001 \
  --env-file .env \
  accesstimeco/lenscore:latest
```

### Update ke Versi Spesifik

```bash
docker stop lenscore
docker rm lenscore
docker pull accesstimeco/lenscore:0.1.76
docker run -d \
  --name lenscore \
  -p 3001:3001 \
  --env-file .env \
  accesstimeco/lenscore:0.1.76
```

## Menggunakan Docker Compose

Buat file `docker-compose.yml`:

```yaml
version: '3.9'

services:
  lenscore:
    image: accesstimeco/lenscore:latest
    container_name: lenscore-app
    ports:
      - '3001:3001'
    env_file:
      - .env
    volumes:
      - ./logs:/app/logs
      - ./storage:/app/storage
    restart: unless-stopped
```

Start services:

```bash
docker-compose up -d
```

Stop services:

```bash
docker-compose down
```

## Setup Production dengan Redis

Untuk deployment production dengan Redis caching:

```yaml
version: '3.9'

services:
  lenscore:
    image: accesstimeco/lenscore:latest
    container_name: lenscore-app
    ports:
      - '3001:3001'
    env_file:
      - .env
    environment:
      - CACHE_TYPE=redis
      - REDIS_HOST=redis
      - REDIS_PORT=6379
    volumes:
      - ./logs:/app/logs
      - ./storage:/app/storage
    depends_on:
      - redis
    restart: unless-stopped

  redis:
    image: redis:7-alpine
    ports:
      - '6379:6379'
    volumes:
      - redis_data:/data
    command: redis-server --appendonly yes
    restart: unless-stopped

volumes:
  redis_data:
```

## Environment Variables

Konfigurasi LensCore menggunakan environment variables:

### Pengaturan Inti

```properties
NODE_ENV=production
PORT=3001
LOG_LEVEL=info
```

### Konfigurasi Storage

**Local Storage:**

```properties
STORAGE_TYPE=local
STORAGE_PATH=./storage
```

**AWS S3:**

```properties
STORAGE_TYPE=s3
AWS_ACCESS_KEY_ID=your_aws_access_key
AWS_SECRET_ACCESS_KEY=your_aws_secret_key
AWS_REGION=us-east-1
AWS_S3_BUCKET=your-s3-bucket-name
```

**Google Cloud Storage:**

```properties
STORAGE_TYPE=gcs
GCS_PROJECT_ID=your-gcs-project-id
GCS_KEY_FILE_PATH=./path/to/service-account-key.json
GCS_BUCKET_NAME=your-gcs-bucket-name
```

### Konfigurasi Cache

```properties
CACHE_TYPE=redis
CACHE_TTL=3600
REDIS_HOST=redis
REDIS_PORT=6379
REDIS_PASSWORD=
REDIS_DB=0
```

### Konfigurasi AI

```properties
OPENAI_API_KEY=your-openai-api-key
OPENAI_MODEL=gpt-3.5-turbo
OPENAI_MAX_TOKENS=1000
OPENAI_TEMPERATURE=0.7
```

## Tag yang Tersedia

- `latest` - Release stabil terbaru
- `0.1.x` - Tag versi spesifik
- Versi otomatis dipublish saat push ke branch main

## Troubleshooting

### Container Tidak Bisa Start

Cek log container:

```bash
docker logs lenscore
```

### Port Sudah Digunakan

Ubah port mapping:

```bash
docker run -d \
  --name lenscore \
  -p 3002:3001 \
  accesstimeco/lenscore:latest
```

### Masalah Permission

Pastikan volume memiliki permission yang benar:

```bash
chmod -R 755 ./storage
chmod -R 755 ./logs
```

## Langkah Selanjutnya

- [Panduan Memulai](/id/getting-started) - Pelajari cara menggunakan LensCore
- [Dokumentasi API](/id/api) - Jelajahi REST API
- [Dokumentasi CLI](/id/cli) - Referensi command-line interface
