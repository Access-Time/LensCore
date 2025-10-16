# LensCore

<img src="https://github.com/user-attachments/assets/a249eb4b-2ce5-4972-90ae-b3d2164e2b5a" alt="AccessLine Logo" width="170" align="right" />

<p>
<a href="https://opensource.org/licenses/MIT"><img alt="License: MIT" src="https://img.shields.io/badge/License-MIT-yellow.svg"></a>
<a href="https://www.docker.com/"><img alt="Docker" src="https://img.shields.io/badge/Docker-Ready-blue.svg"></a>
<a href="https://www.typescriptlang.org/"><img alt="TypeScript" src="https://img.shields.io/badge/TypeScript-Ready-blue.svg"></a>
<a href="https://nodejs.org/"><img alt="Node.js" src="https://img.shields.io/badge/Node.js-20+-green.svg"></a>
<br/>
<a href="https://pptr.dev/"><img alt="Puppeteer" src="https://img.shields.io/badge/Puppeteer-Web%20Automation-orange.svg"></a>
<a href="https://github.com/dequelabs/axe-core"><img alt="axe-core" src="https://img.shields.io/badge/axe--core-Accessibility-red.svg"></a>
<a href="https://expressjs.com/"><img alt="Express" src="https://img.shields.io/badge/Express-API%20Framework-lightgrey.svg"></a>
</p>

**LensCore** is an open-source accessibility testing and web crawling platform built with a containerized, API-driven architecture. It provides comprehensive web accessibility analysis using axe-core integration and flexible storage options for screenshots and reports.

## 🚀 Features

- **🌐 Web Crawling**: Intelligent website crawling with configurable depth and rules
- **♿ Accessibility Testing**: WCAG compliance testing powered by axe-core
- **📸 Screenshot Capture**: Automatic screenshot capture for violations and pages
- **💾 Flexible Storage**: Support for local, AWS S3, and Google Cloud Storage
- **🔌 RESTful APIs**: Clean API endpoints for crawl, test, and combined operations
- **🐳 Docker Ready**: Fully containerized with Docker Compose support
- **⚡ High Performance**: Concurrent processing with configurable limits
- **🛡️ Production Ready**: Built-in health checks, logging, and error handling

## 📋 Table of Contents

- [Quick Start](#-quick-start)
- [Makefile Commands](#makefile-commands)
- [Configuration](#️-configuration)
- [API Documentation](#-api-documentation)
- [License](#-license)

## ⚡ Quick Start

### Prerequisites

- **Node.js** 20+ (for local development)
- **Docker** & **Docker Compose** (for containerized deployment)
- **Git** (for cloning the repository)

### Using Docker (Recommended)

1. **Clone the repository:**

   ```bash
   git clone <repository-url>
   cd LensCore
   ```

2. **Set up environment:**

   ```bash
   cp env.example .env
   ```

3. **Start the service (with Makefile):**

   ```bash
   make up
   ```

4. **Verify installation:**

   ```bash
   curl http://localhost:3001/api/health
   ```

5. **Stop services:**
   ```bash
   make down
   ```

### Using Node.js

1. **Install dependencies:**

   ```bash
   make install
   ```

2. **Set up environment:**

   ```bash
   cp env.example .env
   ```

3. **Start development server:**
   ```bash
   make dev
   ```

## Makefile Commands

Common tasks:

```bash
make install     # Install dependencies
make dev         # Run development server
make build       # Build for production
make start       # Run production server
make test        # Run all tests
make lint        # Run ESLint
make fmt         # Format code with Prettier
make typecheck   # TypeScript type checking

make up          # Start services with Docker Compose
make down        # Stop services with Docker Compose
make logs        # Tail Docker Compose logs

make env         # Print key env variables from .env
```

## ⚙️ Configuration

### Environment Variables

LensCore uses environment variables for configuration. Copy `env.example` to `.env` and customize as needed:

#### Core Application Settings

```env
NODE_ENV=development
PORT=3001
LOG_LEVEL=info
```

#### Storage Configuration

**Local Storage (Default):**

```env
STORAGE_TYPE=local
STORAGE_PATH=./storage
```

**AWS S3:**

```env
STORAGE_TYPE=s3
AWS_ACCESS_KEY_ID=your_aws_access_key
AWS_SECRET_ACCESS_KEY=your_aws_secret_key
AWS_REGION=us-east-1
AWS_S3_BUCKET=your-s3-bucket-name
```

**Google Cloud Storage:**

```env
STORAGE_TYPE=gcs
GCS_PROJECT_ID=your-gcs-project-id
GCS_KEY_FILE_PATH=./path/to/service-account-key.json
GCS_BUCKET_NAME=your-gcs-bucket-name
```

#### Crawling Configuration

```env
CRAWL_TIMEOUT=10000
CRAWL_CONCURRENCY=5
CRAWL_MAX_URLS=25
CRAWL_WAIT_UNTIL=domcontentloaded
```

#### Accessibility Testing Configuration

```env
AXE_TIMEOUT=10000
AXE_CONCURRENCY=5
```

## 📚 API Documentation

### Base URL

```
http://localhost:3001/api
```

### Response Format

All API responses follow a consistent JSON format with appropriate HTTP status codes.

---

### 🏥 Health Check

Check the health status of all services.

**Endpoint:** `GET /api/health`

**Example:**

```bash
curl http://localhost:3001/api/health
```

**Response:**

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

---

### 🕷️ Crawl Website

Crawl a website and discover all linked pages.

**Endpoint:** `POST /api/crawl`

**Request Body:**

```json
{
  "url": "https://example.com",
  "maxUrls": 10,
  "timeout": 10000,
  "concurrency": 3,
  "waitUntil": "domcontentloaded",
  "headers": {
    "User-Agent": "LensCore Bot"
  },
  "auth": {
    "username": "user",
    "password": "pass"
  }
}
```

**Parameters:**

- `url` (required): Target website URL
- `maxUrls` (optional): Maximum number of URLs to crawl (default: 25)
- `timeout` (optional): Request timeout in milliseconds (default: 10000)
- `concurrency` (optional): Number of concurrent requests (default: 5)
- `waitUntil` (optional): Page load condition (default: "domcontentloaded")
- `headers` (optional): Custom HTTP headers
- `auth` (optional): Basic authentication credentials

**Example:**

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

**Response:**

```json
{
  "pages": [
    {
      "url": "https://example.com",
      "title": "Example Domain",
      "description": "This domain is for use in illustrative examples",
      "statusCode": 200,
      "timestamp": "2024-01-01T00:00:00.000Z"
    }
  ],
  "totalPages": 1,
  "crawlTime": 1500
}
```

---

### ♿ Test Accessibility

Run accessibility tests on a single page using axe-core.

**Endpoint:** `POST /api/test`

**Request Body:**

```json
{
  "url": "https://example.com",
  "includeScreenshot": true,
  "timeout": 10000,
  "rules": ["color-contrast", "image-alt"],
  "tags": ["wcag2aa", "wcag143"]
}
```

**Parameters:**

- `url` (required): Target page URL
- `includeScreenshot` (optional): Capture screenshot (default: false)
- `timeout` (optional): Test timeout in milliseconds (default: 10000)
- `rules` (optional): Specific axe-core rules to test
- `tags` (optional): WCAG tags to include in testing

**Example:**

```bash
curl -X POST http://localhost:3001/api/test \
  -H "Content-Type: application/json" \
  -d '{
    "url": "https://example.com",
    "includeScreenshot": true,
    "timeout": 10000
  }'
```

**Response:**

```json
{
  "url": "https://example.com",
  "score": 85,
  "violations": [
    {
      "id": "color-contrast",
      "impact": "serious",
      "description": "Ensures the contrast between foreground and background colors meets WCAG 2 AA contrast ratio thresholds",
      "help": "Elements must have sufficient color contrast",
      "helpUrl": "https://dequeuniversity.com/rules/axe/4.8/color-contrast",
      "tags": ["cat.color", "wcag2aa", "wcag143"],
      "nodes": [
        {
          "target": ["h1"],
          "html": "<h1>Example Domain</h1>",
          "failureSummary": "Fix any of the following:\n  Element has insufficient color contrast of 2.52 (foreground color: #000000, background color: #ffffff, font size: 32px, font weight: normal). Expected contrast ratio of at least 3:1"
        }
      ]
    }
  ],
  "passes": [],
  "incomplete": [],
  "inapplicable": [],
  "screenshot": "https://storage.example.com/screenshots/uuid.png",
  "timestamp": "2024-01-01T00:00:00.000Z"
}
```

---

### 🔄 Test Multiple Pages

Run accessibility tests on multiple pages simultaneously.

**Endpoint:** `POST /api/test-multiple`

**Request Body:**

```json
[
  {
    "url": "https://example.com",
    "includeScreenshot": true,
    "timeout": 10000
  },
  {
    "url": "https://example.com/about",
    "includeScreenshot": true,
    "timeout": 10000
  }
]
```

**Example:**

```bash
curl -X POST http://localhost:3001/api/test-multiple \
  -H "Content-Type: application/json" \
  -d '[
    {
      "url": "https://example.com",
      "includeScreenshot": true
    },
    {
      "url": "https://example.com/about",
      "includeScreenshot": true
    }
  ]'
```

**Response:**

```json
{
  "results": [
    {
      "url": "https://example.com",
      "score": 85,
      "violations": [...],
      "passes": [],
      "incomplete": [],
      "inapplicable": [],
      "screenshot": "https://storage.example.com/screenshots/uuid1.png",
      "timestamp": "2024-01-01T00:00:00.000Z"
    },
    {
      "url": "https://example.com/about",
      "score": 92,
      "violations": [...],
      "passes": [],
      "incomplete": [],
      "inapplicable": [],
      "screenshot": "https://storage.example.com/screenshots/uuid2.png",
      "timestamp": "2024-01-01T00:00:00.000Z"
    }
  ],
  "totalPages": 2,
  "testTime": 3000
}
```

---

### 🚀 Combined Crawl and Test

Crawl a website and run accessibility tests on all discovered pages.

**Endpoint:** `POST /api/combined`

**Request Body:**

```json
{
  "url": "https://example.com",
  "crawlOptions": {
    "maxUrls": 5,
    "concurrency": 2,
    "timeout": 10000
  },
  "testOptions": {
    "includeScreenshot": true,
    "timeout": 15000,
    "rules": ["color-contrast"]
  }
}
```

**Parameters:**

- `url` (required): Target website URL
- `crawlOptions` (optional): Crawling configuration (see crawl API)
- `testOptions` (optional): Testing configuration (see test API)

**Example:**

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

**Response:**

```json
{
  "crawl": {
    "pages": [
      {
        "url": "https://example.com",
        "title": "Example Domain",
        "description": "This domain is for use in illustrative examples",
        "statusCode": 200,
        "timestamp": "2024-01-01T00:00:00.000Z"
      }
    ],
    "totalPages": 1,
    "crawlTime": 3000
  },
  "accessibility": {
    "results": [
      {
        "url": "https://example.com",
        "score": 85,
        "violations": [...],
        "passes": [],
        "incomplete": [],
        "inapplicable": [],
        "screenshot": "https://storage.example.com/screenshots/uuid.png",
        "timestamp": "2024-01-01T00:00:00.000Z"
      }
    ],
    "totalPages": 1,
    "testTime": 15000
  },
  "totalTime": 18000
}
```

---

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🙏 Acknowledgments

- [axe-core](https://github.com/dequelabs/axe-core) for accessibility testing
- [Puppeteer](https://github.com/puppeteer/puppeteer) for web automation
- [Express.js](https://expressjs.com/) for the web framework
- [Docker](https://www.docker.com/) for containerization

---

**Made with ❤️ by the AccessTime team**
