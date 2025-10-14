# LensCore

[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)
[![Docker](https://img.shields.io/badge/Docker-Ready-blue.svg)](https://www.docker.com/)
[![TypeScript](https://img.shields.io/badge/TypeScript-Ready-blue.svg)](https://www.typescriptlang.org/)

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
- [Installation](#-installation)
- [Configuration](#-configuration)
- [API Documentation](#-api-documentation)
- [Development Guide](#-development-guide)
- [Deployment](#-deployment)
- [Contributing](#-contributing)
- [License](#-license)

## ⚡ Quick Start

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

3. **Start the service:**

   ```bash
   docker-compose up -d
   ```

4. **Verify installation:**
   ```bash
   curl http://localhost:3001/api/health
   ```

### Using Node.js

1. **Install dependencies:**

   ```bash
   npm install
   ```

2. **Set up environment:**

   ```bash
   cp env.example .env
   ```

3. **Start development server:**
   ```bash
   npm run dev
   ```

## 🛠️ Installation

### Prerequisites

- **Node.js** 20+ (for local development)
- **Docker** & **Docker Compose** (for containerized deployment)
- **Git** (for cloning the repository)

### Local Development Setup

1. **Clone and install:**

   ```bash
   git clone <repository-url>
   cd LensCore
   npm install
   ```

2. **Environment configuration:**

   ```bash
   cp env.example .env
   # Edit .env with your preferred settings
   ```

3. **Start development:**
   ```bash
   npm run dev
   ```

### Docker Setup

1. **Build and run:**

   ```bash
   docker-compose up -d
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

### Docker Compose Configuration

The `docker-compose.yml` file automatically reads from your `.env` file and supports environment variable overrides:

```bash
# Use different port
PORT=3002 docker-compose up -d

# Use S3 storage
STORAGE_TYPE=s3 docker-compose up -d

# Debug mode
LOG_LEVEL=debug docker-compose up -d
```

## 📚 API Documentation

### Base URL

```
http://localhost:3001/api
```

### Authentication

Currently, no authentication is required. All endpoints are publicly accessible.

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

### Available Scripts

```bash
# Development
npm run dev          # Start development server with hot reload
npm run build        # Build TypeScript to JavaScript
npm run start        # Start production server

# Testing
npm test             # Run unit tests
npm run test:watch   # Run tests in watch mode
npm run test:coverage # Run tests with coverage report

# Code Quality
npm run lint         # Run ESLint
npm run lint:fix     # Fix ESLint issues automatically
npm run format       # Format code with Prettier
npm run format:check # Check code formatting
npm run typecheck    # Run TypeScript type checking
```

## 🚀 Deployment

### Docker Deployment

**Build and run:**

```bash
docker-compose up -d
```

### Cloud Deployment Examples

**AWS ECS:**

```bash
# Build and push to ECR
docker build -t lenscore .
docker tag lenscore:latest <account>.dkr.ecr.<region>.amazonaws.com/lenscore:latest
docker push <account>.dkr.ecr.<region>.amazonaws.com/lenscore:latest
```

**Google Cloud Run:**

```bash
# Build and deploy
gcloud builds submit --tag gcr.io/<project>/lenscore
gcloud run deploy --image gcr.io/<project>/lenscore --platform managed
```

## 🤝 Contributing

We welcome contributions! Please follow these guidelines:

### Getting Started

1. **Fork the repository**
2. **Clone your fork:**

   ```bash
   git clone https://github.com/your-username/LensCore.git
   cd LensCore
   ```

3. **Create a feature branch:**

   ```bash
   git checkout -b feature/amazing-feature
   ```

4. **Make your changes** and add tests

5. **Run the test suite:**

   ```bash
   npm test
   npm run lint
   npm run format:check
   ```

6. **Commit your changes:**

   ```bash
   git commit -m "Add amazing feature"
   ```

7. **Push to your fork:**

   ```bash
   git push origin feature/amazing-feature
   ```

8. **Create a Pull Request**

### Contribution Guidelines

- Follow the existing code style
- Add tests for new features
- Update documentation as needed
- Ensure all tests pass
- Follow semantic commit messages

### Development Setup

```bash
# Install dependencies
npm install

# Set up environment
cp env.example .env

# Start development server
npm run dev

# Run tests
npm test
```

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🙏 Acknowledgments

- [axe-core](https://github.com/dequelabs/axe-core) for accessibility testing
- [Puppeteer](https://github.com/puppeteer/puppeteer) for web automation
- [Express.js](https://expressjs.com/) for the web framework
- [Docker](https://www.docker.com/) for containerization

---

**Made with ❤️ by the AccessTime team**
