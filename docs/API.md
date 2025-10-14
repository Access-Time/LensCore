# API Documentation

## Endpoints

### Health Check

- `GET /api/health` - Check service health

### Crawling

- `POST /api/crawl` - Crawl website
- `POST /api/combined` - Combined crawl and test

### Accessibility Testing

- `POST /api/test` - Test single page
- `POST /api/test-multiple` - Test multiple pages

## Request/Response Examples

### Crawl Website

```bash
curl -X POST http://localhost:3001/api/crawl \
  -H "Content-Type: application/json" \
  -d '{
    "url": "https://example.com",
    "maxUrls": 10,
    "timeout": 10000,
    "concurrency": 3
  }'
```

### Test Accessibility

```bash
curl -X POST http://localhost:3001/api/test \
  -H "Content-Type: application/json" \
  -d '{
    "url": "https://example.com",
    "includeScreenshot": true,
    "timeout": 10000
  }'
```

### Combined Crawl and Test

```bash
curl -X POST http://localhost:3001/api/combined \
  -H "Content-Type: application/json" \
  -d '{
    "url": "https://example.com",
    "crawlOptions": {
      "maxUrls": 5,
      "concurrency": 2
    },
    "testOptions": {
      "includeScreenshot": true,
      "timeout": 15000
    }
  }'
```

## Error Handling

### Validation Errors

```json
{
  "code": "VALIDATION_ERROR",
  "message": "Invalid request data",
  "details": [
    {
      "path": ["url"],
      "message": "Invalid url"
    }
  ]
}
```

### Internal Errors

```json
{
  "code": "INTERNAL_ERROR",
  "message": "Internal server error"
}
```

## Rate Limiting

- Default: 100 requests per minute
- Configurable via `API_RATE_LIMIT` environment variable

## Timeouts

- Default: 30 seconds
- Configurable via `API_TIMEOUT` environment variable

## Authentication

Currently no authentication required. All endpoints are public.

## CORS

CORS is enabled for all origins in development mode.
