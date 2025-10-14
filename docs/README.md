# LensCore Documentation

## Overview

LensCore adalah platform open-source untuk testing accessibility dan web crawling dengan arsitektur containerized dan API-driven.

## Features

- Web crawling dengan konfigurasi yang dapat disesuaikan
- Accessibility testing menggunakan axe-core
- Screenshot capture untuk violations dan halaman
- Storage integration (local, S3, GCS)
- RESTful APIs
- Docker support

## API Endpoints

### Health Check

- `GET /api/health` - Check service health

### Crawling

- `POST /api/crawl` - Crawl website
- `POST /api/combined` - Combined crawl and test

### Accessibility Testing

- `POST /api/test` - Test single page
- `POST /api/test-multiple` - Test multiple pages

## Configuration

### Environment Variables

#### Storage

- `STORAGE_TYPE` - Storage type (local, s3, gcs)
- `STORAGE_PATH` - Local storage path
- `AWS_ACCESS_KEY_ID` - AWS access key
- `AWS_SECRET_ACCESS_KEY` - AWS secret key
- `AWS_REGION` - AWS region
- `AWS_S3_BUCKET` - S3 bucket name
- `GCS_PROJECT_ID` - GCS project ID
- `GCS_KEY_FILE_PATH` - GCS key file path
- `GCS_BUCKET_NAME` - GCS bucket name

#### Crawling

- `CRAWL_TIMEOUT` - Crawl timeout (ms)
- `CRAWL_CONCURRENCY` - Crawl concurrency
- `CRAWL_MAX_URLS` - Maximum URLs to crawl
- `CRAWL_WAIT_UNTIL` - Wait until condition

#### Accessibility Testing

- `AXE_TIMEOUT` - Axe timeout (ms)
- `AXE_CONCURRENCY` - Axe concurrency

## Development

### Setup

1. Install dependencies: `npm install`
2. Copy environment: `cp env.example .env`
3. Start development: `npm run dev`

### Testing

- Unit tests: `npm test`
- Integration tests: `npm run test:integration`
- E2E tests: `npm run test:e2e`

### Building

- Build: `npm run build`
- Start: `npm start`

## Deployment

### Docker

```bash
docker build -t lenscore .
docker run -p 3001:3001 lenscore
```

### Docker Compose

```bash
docker-compose up -d
```

## Architecture

```
src/
├── api/           # Express API routes
├── core/          # Core business logic
├── services/      # Service implementations
├── storage/       # Storage abstractions
├── types/         # TypeScript type definitions
└── utils/         # Utility functions
```

## Contributing

1. Fork repository
2. Create feature branch
3. Make changes
4. Add tests
5. Submit pull request

## License

MIT License
