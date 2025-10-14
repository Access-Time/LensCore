# Configuration Guide

## Environment Variables

### Storage Configuration

#### Local Storage (Default)

```env
STORAGE_TYPE=local
STORAGE_PATH=./storage
```

#### AWS S3

```env
STORAGE_TYPE=s3
AWS_ACCESS_KEY_ID=your_access_key
AWS_SECRET_ACCESS_KEY=your_secret_key
AWS_REGION=us-east-1
AWS_S3_BUCKET=your_bucket_name
```

#### Google Cloud Storage

```env
STORAGE_TYPE=gcs
GCS_PROJECT_ID=your_project_id
GCS_KEY_FILE_PATH=path/to/service-account.json
GCS_BUCKET_NAME=your_bucket_name
```

### Crawling Configuration

```env
CRAWL_TIMEOUT=10000
CRAWL_CONCURRENCY=5
CRAWL_MAX_URLS=25
CRAWL_WAIT_UNTIL=domcontentloaded
```

### Accessibility Testing Configuration

```env
AXE_TIMEOUT=10000
AXE_CONCURRENCY=5
```

### API Configuration

```env
API_RATE_LIMIT=100
API_TIMEOUT=30000
```

### Logging Configuration

```env
LOG_LEVEL=info
LOG_FILE=./logs/lenscore.log
```

### Health Check Configuration

```env
HEALTH_CHECK_INTERVAL=30000
```

## Docker Configuration

### Docker Compose

```yaml
version: '3.8'

services:
  lenscore:
    build: .
    ports:
      - '3001:3001'
    environment:
      - NODE_ENV=production
      - PORT=3001
      - STORAGE_TYPE=local
      - STORAGE_PATH=/app/storage
    volumes:
      - ./storage:/app/storage
      - ./logs:/app/logs
    restart: unless-stopped
```

### Dockerfile

```dockerfile
FROM node:18-alpine

WORKDIR /app

RUN apk add --no-cache \
    chromium \
    nss \
    freetype \
    freetype-dev \
    harfbuzz \
    ca-certificates \
    ttf-freefont

ENV PUPPETEER_SKIP_CHROMIUM_DOWNLOAD=true \
    PUPPETEER_EXECUTABLE_PATH=/usr/bin/chromium-browser

COPY package*.json ./
RUN npm ci --only=production

COPY . .
RUN npm run build

RUN mkdir -p logs storage

EXPOSE 3001

CMD ["npm", "start"]
```

## Production Deployment

### Environment Setup

1. Set `NODE_ENV=production`
2. Configure storage backend
3. Set appropriate log levels
4. Configure rate limiting
5. Set up monitoring

### Security Considerations

- Use HTTPS in production
- Implement authentication if needed
- Configure CORS properly
- Set up rate limiting
- Monitor logs and metrics

### Performance Tuning

- Adjust concurrency settings
- Configure timeouts appropriately
- Monitor memory usage
- Set up health checks
- Configure logging levels
