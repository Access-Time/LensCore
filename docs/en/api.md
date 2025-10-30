# API Reference

LensCore provides a comprehensive RESTful API for accessibility testing and web crawling. The API is built with Express.js and follows OpenAPI 3.0 specification.

## Base URL

```
http://localhost:3001/api
```

## Interactive API Documentation

For interactive API documentation, start the LensCore API server and visit:

```
http://localhost:3001/api/docs
```

This provides a Swagger UI interface where you can:
- View all available endpoints
- Try out API calls directly
- See request/response schemas
- Download the OpenAPI specification

## Authentication

Currently, the API does not require authentication for local usage. For production deployments, consider implementing authentication middleware.

## API Endpoints

### Health Check

#### GET `/api/health`

Check the health status of the API server.

**Response Example:**

```json
{
  "status": "healthy",
  "timestamp": "2024-01-15T10:30:00.000Z",
  "version": "0.1.21"
}
```

---

### Single Page Test

#### POST `/api/test`

Test accessibility of a single web page.

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

- `url` (required): The URL to test
- `enableAI` (optional): Enable AI-powered analysis
- `projectContext` (optional): Project context for AI (e.g., "react,tailwind")
- `timeout` (optional): Page load timeout in milliseconds (default: 30000)
- `rules` (optional): Specific axe rules to test
- `tags` (optional): WCAG tags to test
- `includeScreenshot` (optional): Include screenshot in response (default: true)

**Response Example:**

```json
{
  "url": "https://example.com",
  "timestamp": "2024-01-15T10:30:00.000Z",
  "violations": [
    {
      "id": "color-contrast",
      "impact": "serious",
      "description": "Elements must have sufficient color contrast",
      "help": "https://dequeuniversity.com/rules/axe/4.8/color-contrast",
      "nodes": [
        {
          "html": "<p>Low contrast text</p>",
          "target": ["body > p:nth-child(1)"],
          "failureSummary": "Fix any of the following..."
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

### Multiple Page Test

#### POST `/api/test-multiple`

Test accessibility of multiple pages simultaneously.

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

**Response:** Array of test results for each URL.

---

### Web Crawling

#### POST `/api/crawl`

Crawl a website and discover all pages.

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

- `url` (required): Starting URL to crawl
- `maxUrls` (optional): Maximum number of URLs to crawl (default: 100)
- `maxDepth` (optional): Maximum crawl depth (default: 3)
- `timeout` (optional): Page load timeout (default: 30000)
- `concurrency` (optional): Number of concurrent requests (default: 3)
- `waitUntil` (optional): When to consider page loaded (default: "networkidle")

**Response Example:**

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

### Combined Crawl and Test

#### POST `/api/combined`

Crawl a website and test all discovered pages for accessibility.

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

**Response:** Crawl results with accessibility test results for each page.

---

### Cache Management

#### GET `/api/cache/stats`

Get cache statistics.

**Response Example:**

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

Clear the entire cache.

**Response:**

```json
{
  "message": "Cache cleared successfully"
}
```

---

#### POST `/api/cache/warm`

Warm up the cache with frequently accessed pages.

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

The API uses standard HTTP status codes:

- `200` - Success
- `400` - Bad Request (invalid parameters)
- `404` - Not Found
- `500` - Internal Server Error

**Error Response Format:**

```json
{
  "error": "Error message",
  "details": "Detailed error information",
  "timestamp": "2024-01-15T10:30:00.000Z"
}
```

## Rate Limiting

Currently, there is no rate limiting implemented. For production usage, consider implementing rate limiting middleware.

## CORS

CORS is enabled by default for all origins. Configure CORS settings in production as needed.

## Examples

### Using cURL

```bash
# Health check
curl http://localhost:3001/api/health

# Test a page
curl -X POST http://localhost:3001/api/test \
  -H "Content-Type: application/json" \
  -d '{
    "url": "https://example.com",
    "enableAI": false
  }'

# Crawl a website
curl -X POST http://localhost:3001/api/crawl \
  -H "Content-Type: application/json" \
  -d '{
    "url": "https://example.com",
    "maxUrls": 20
  }'
```

### Using JavaScript (fetch)

```javascript
// Test a page
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
console.log(`Found ${results.violations.length} violations`);
```

### Using Python (requests)

```python
import requests

# Test a page
response = requests.post('http://localhost:3001/api/test', json={
    'url': 'https://example.com',
    'enableAI': False,
    'tags': ['wcag2a', 'wcag2aa']
})

results = response.json()
print(f"Found {len(results['violations'])} violations")
```

## OpenAPI Specification

Download the complete OpenAPI specification:

- **JSON**: `http://localhost:3001/api/docs/openapi.json`
- **YAML**: Available in source code at `src/api/openapi.ts`

## SDK and Client Libraries

Currently, LensCore does not provide official SDK libraries. However, you can easily integrate with any HTTP client library in your preferred programming language.

Consider using tools like:
- **OpenAPI Generator**: Generate client SDKs from the OpenAPI spec
- **Swagger Codegen**: Another option for SDK generation

## Support

For API-related issues or questions:

- [GitHub Issues](https://github.com/Access-Time/LensCore/issues)
- [API Documentation](http://localhost:3001/api/docs)
- [CLI Documentation](/en/cli)

---

For more information, see:
- [Getting Started Guide](/en/getting-started)
- [CLI Documentation](/en/cli)
- [Contributing Guide](/en/contributing)

