# Using LensCore from Docker Hub

LensCore is available as a pre-built Docker image on Docker Hub, allowing you to run LensCore without cloning the repository or building from source.

## Quick Start

### Pull and Run Latest Version

```bash
docker run -d \
  --name lenscore \
  -p 3001:3001 \
  -e PORT=3001 \
  -e NODE_ENV=production \
  accesstimeco/lenscore:latest
```

### Using Environment File

Create a `.env` file with your configuration:

```bash
docker run -d \
  --name lenscore \
  -p 3001:3001 \
  --env-file .env \
  accesstimeco/lenscore:latest
```

### With Persistent Storage

Mount volumes for logs and storage:

```bash
docker run -d \
  --name lenscore \
  -p 3001:3001 \
  -v $(pwd)/storage:/app/storage \
  -v $(pwd)/logs:/app/logs \
  --env-file .env \
  accesstimeco/lenscore:latest
```

### Using Specific Version

Use a specific version tag instead of `latest`:

```bash
docker run -d \
  --name lenscore \
  -p 3001:3001 \
  accesstimeco/lenscore:0.1.68
```

## Verify Installation

Check that LensCore is running:

```bash
curl http://localhost:3001/api/health
```

Expected response:

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

## Stop Container

```bash
docker stop lenscore
docker rm lenscore
```

## Updating LensCore

### Update to Latest Version

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

### Update to Specific Version

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

## Using Docker Compose

Create a `docker-compose.yml` file:

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

## Production Setup with Redis

For production deployments with Redis caching:

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

Configure LensCore using environment variables:

### Core Settings

```properties
NODE_ENV=production
PORT=3001
LOG_LEVEL=info
```

### Storage Configuration

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

### Cache Configuration

```properties
CACHE_TYPE=redis
CACHE_TTL=3600
REDIS_HOST=redis
REDIS_PORT=6379
REDIS_PASSWORD=
REDIS_DB=0
```

### AI Configuration

```properties
OPENAI_API_KEY=your-openai-api-key
OPENAI_MODEL=gpt-3.5-turbo
OPENAI_MAX_TOKENS=1000
OPENAI_TEMPERATURE=0.7
```

## Available Tags

- `latest` - Latest stable release
- `0.1.x` - Specific version tags
- Versions are automatically published on push to main branch

## Troubleshooting

### Container Won't Start

Check container logs:

```bash
docker logs lenscore
```

### Port Already in Use

Change the port mapping:

```bash
docker run -d \
  --name lenscore \
  -p 3002:3001 \
  accesstimeco/lenscore:latest
```

### Permission Issues

Ensure volumes have correct permissions:

```bash
chmod -R 755 ./storage
chmod -R 755 ./logs
```

## Next Steps

- [Getting Started Guide](/en/getting-started) - Learn how to use LensCore
- [API Documentation](/en/api) - Explore the REST API
- [CLI Documentation](/en/cli) - Command-line interface reference
