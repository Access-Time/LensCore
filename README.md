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
- **🤖 AI-Powered Analysis**: Plain language explanations and tech-stack specific remediation
- **🧠 Intelligent Caching**: Smart caching system to minimize AI API costs and improve performance
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
- [AI Integration](#-ai-integration)
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

### Docker with Redis (Production)

For production deployments with Redis caching:

1. **Set up environment:**

   ```bash
   cp env.example .env
   # Edit .env and set CACHE_TYPE=redis
   ```

2. **Start with Redis:**

   ```bash
   docker-compose up -d
   ```

3. **Verify Redis connection:**

   ```bash
   curl http://localhost:3001/api/cache/stats
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

#### AI Processing Configuration (Optional)

```env
OPENAI_API_KEY=your-openai-api-key
OPENAI_MODEL=gpt-3.5-turbo
OPENAI_MAX_TOKENS=1000
OPENAI_TEMPERATURE=0.7
OPENAI_TIMEOUT=30000
OPENAI_RETRY_ATTEMPTS=3
OPENAI_RETRY_DELAY=1000
```

#### Cache Configuration (Optional)

```env
CACHE_TYPE=memory          # memory, filesystem, redis
CACHE_TTL=3600            # 1 hour in seconds
CACHE_MAX_SIZE=1000       # For memory cache
CACHE_PATH=./cache         # For filesystem cache
REDIS_HOST=localhost       # Redis host
REDIS_PORT=6379           # Redis port
REDIS_PASSWORD=            # Redis password (optional)
REDIS_DB=0                # Redis database
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
  "max_depth": 2,
  "maxUrls": 10,
  "timeout": 10000,
  "concurrency": 3,
  "waitUntil": "domcontentloaded",
  "headers": {
    "Authorization": "Bearer token"
  },
  "rules": {
    "include_subdomains": true,
    "follow_external": false,
    "exclude_paths": ["/admin", "/private"],
    "include_paths": ["/public", "/docs"],
    "respect_robots": true
  },
  "enableAI": true,
  "aiApiKey": "sk-your-openai-key",
  "projectContext": {
    "framework": "React",
    "cssFramework": "Tailwind CSS",
    "language": "TypeScript",
    "buildTool": "Vite"
  }
}
```

**Parameters:**

- `url` (required): Target website URL
- `max_depth` (optional): Maximum crawling depth (1-5, default: 2)
- `maxUrls` (optional): Maximum number of URLs to crawl (default: 25)
- `timeout` (optional): Request timeout in milliseconds (default: 10000)
- `concurrency` (optional): Number of concurrent requests (default: 5)
- `waitUntil` (optional): Page load condition (default: "domcontentloaded")
- `headers` (optional): Custom HTTP headers for requests
- `rules` (optional): Crawling rules configuration
- `enableAI` (optional): Enable AI processing for accessibility issues (default: false)
- `projectContext` (optional): Structured project context for more precise AI analysis

**Crawling Rules:**

- `include_subdomains` (optional): Include subdomains in crawling (default: false)
- `follow_external` (optional): Follow external links (default: false)
- `exclude_paths` (optional): Array of paths to exclude from crawling
- `include_paths` (optional): Array of paths to include (if specified, only these paths will be crawled)
- `respect_robots` (optional): Respect robots.txt (default: true)

**Project Context Structure:**

```json
{
  "framework": "React",
  "cssFramework": "Tailwind CSS",
  "language": "TypeScript",
  "buildTool": "Vite",
  "additionalContext": "Custom context"
}
```

**Example:**

```bash
curl -X POST http://localhost:3001/api/crawl \
  -H "Content-Type: application/json" \
  -d '{
    "url": "https://example.com",
    "max_depth": 2,
    "maxUrls": 10,
    "timeout": 10000,
    "concurrency": 3,
    "rules": {
      "include_subdomains": true,
      "follow_external": false,
      "exclude_paths": ["/admin", "/private"]
    },
    "enableAI": true,
    "projectContext": {
      "framework": "React",
      "cssFramework": "Tailwind CSS",
      "language": "TypeScript",
      "additionalContext": "Need to detail explanation"
    }
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
    },
    {
      "url": "https://example.com/about",
      "title": "About Us",
      "description": "Learn more about our company",
      "statusCode": 200,
      "timestamp": "2024-01-01T00:00:01.000Z"
    }
  ],
  "totalPages": 2,
  "crawlTime": 2500,
  "metadata": {
    "crawledAt": "2024-01-01T00:00:02.000Z",
    "maxDepth": 2,
    "rules": {
      "include_subdomains": true,
      "follow_external": false,
      "exclude_paths": ["/admin", "/private"]
    },
    "totalPages": 2,
    "crawlTime": 2500,
    "aiEnabled": true,
    "cacheHits": 0,
    "cacheMisses": 0,
    "processingTime": 150
  }
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
  "tags": ["wcag2aa", "wcag143"],
  "enableAI": true,
  "projectContext": {
    "framework": "Vue.js",
    "cssFramework": "Bootstrap",
    "language": "JavaScript"
  }
}
```

**Parameters:**

- `url` (required): Target page URL
- `includeScreenshot` (optional): Capture screenshot (default: false)
- `timeout` (optional): Test timeout in milliseconds (default: 10000)
- `rules` (optional): Specific axe-core rules to test
- `tags` (optional): WCAG tags to include in testing
- `enableAI` (optional): Enable AI processing for accessibility issues (default: false)
- `projectContext` (optional): Structured project context for more precise AI analysis

**Project Context Structure:**

```json
{
  "framework": "React",
  "cssFramework": "Tailwind CSS",
  "language": "TypeScript",
  "buildTool": "Vite",
  "additionalContext": "Custom context"
}
```

**Example:**

```bash
curl -X POST http://localhost:3001/api/test \
  -H "Content-Type: application/json" \
  -d '{
    "url": "https://example.com",
    "includeScreenshot": true,
    "timeout": 10000,
    "enableAI": true,
    "projectContext": {
      "framework": "Next.js",
      "cssFramework": "Tailwind CSS",
      "language": "TypeScript"
    }
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
      ],
      "aiExplanation": "This accessibility issue occurs when text doesn't have enough contrast against its background...",
      "aiRemediation": "To fix this issue:\n1. Increase color contrast ratio...\n2. Use CSS: color: #000; background: #fff;",
      "userStory": "Users with screen readers have difficulty navigating because there is no clear main landmark. Users who use keyboard navigation cannot jump to the main content quickly. Users with cognitive disabilities may be confused by unclear page structure."
    }
  ],
  "passes": [],
  "incomplete": [],
  "inapplicable": [],
  "screenshot": "https://storage.example.com/screenshots/uuid.png",
  "timestamp": "2024-01-01T00:00:00.000Z",
  "aiEnabled": true,
  "aiError": null
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
  },
  "enableAI": true,
  "projectContext": {
    "framework": "Angular",
    "cssFramework": "Material UI",
    "language": "TypeScript"
  }
}
```

**Parameters:**

- `url` (required): Target website URL
- `crawlOptions` (optional): Crawling configuration (see crawl API)
- `testOptions` (optional): Testing configuration (see test API)
- `enableAI` (optional): Enable AI processing for accessibility issues (default: false)
- `projectContext` (optional): Structured project context for more precise AI analysis

**Project Context Structure:**

```json
{
  "framework": "React",
  "cssFramework": "Tailwind CSS",
  "language": "TypeScript",
  "buildTool": "Vite",
  "additionalContext": "Custom context"
}
```

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
    },
    "enableAI": true,
    "projectContext": {
      "framework": "React",
      "cssFramework": "Tailwind CSS",
      "language": "TypeScript"
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
        "violations": [
          {
            "id": "color-contrast",
            "impact": "serious",
            "description": "Elements must have sufficient color contrast",
            "help": "Ensure all text elements have sufficient color contrast",
            "helpUrl": "https://dequeuniversity.com/rules/axe/4.8/color-contrast",
            "nodes": [...],
            "aiExplanation": "This accessibility issue occurs when text doesn't have enough contrast...",
            "aiRemediation": "To fix this issue:\n1. Increase color contrast ratio...\n2. Use CSS: color: #000; background: #fff;"
          }
        ],
        "passes": [],
        "incomplete": [],
        "inapplicable": [],
        "screenshot": "https://storage.example.com/screenshots/uuid.png",
        "timestamp": "2024-01-01T00:00:00.000Z",
        "aiEnabled": true,
        "aiError": null
      }
    ],
    "totalPages": 1,
    "testTime": 15000
  },
  "totalTime": 18000
}
```

---

### 🗄️ Cache Management

Manage the intelligent caching system for AI responses.

#### Get Cache Statistics

**Endpoint:** `GET /api/cache/stats`

**Example:**

```bash
curl http://localhost:3001/api/cache/stats
```

**Response:**

```json
{
  "status": "success",
  "data": {
    "hits": 15,
    "misses": 8,
    "size": 12,
    "hitRate": 0.65
  }
}
```

#### Clear Cache

**Endpoint:** `DELETE /api/cache/clear`

**Example:**

```bash
curl -X DELETE http://localhost:3001/api/cache/clear
```

**Response:**

```json
{
  "status": "success",
  "message": "Cache cleared successfully"
}
```

---

## 🤖 AI Integration

LensCore includes optional AI-powered analysis for accessibility issues, providing plain language explanations and tech-stack specific remediation steps.

### Features

- **Plain Language Explanations**: Convert technical accessibility issues into easy-to-understand explanations
- **Tech-Stack Specific Remediation**: Get specific, actionable steps tailored to your technology stack
- **Dynamic Prompt Engineering**: Intelligent prompt generation based on project context
- **Structured Response Parsing**: Consistent JSON response format with fallback handling
- **Optional Processing**: AI processing is opt-in and doesn't affect existing functionality
- **Cost Effective**: Only processes AI when explicitly requested

### Usage

**Project Context (Recommended):**

```json
{
  "enableAI": true,
  "projectContext": {
    "framework": "React",
    "cssFramework": "Tailwind CSS",
    "language": "TypeScript",
    "buildTool": "Vite"
  }
}
```

**Backward Compatibility (Tech Stack String):**

```json
{
  "enableAI": true,
  "projectContext": {
    "additionalContext": "React, TypeScript, Tailwind CSS"
  }
}
```

### Response Fields

When AI is enabled, responses include additional fields:

- `aiExplanation`: Plain language explanation of the accessibility issue
- `aiRemediation`: Specific steps to fix the issue with code examples
- `userStory`: Human-readable impact explanation for the accessibility issue
- `aiEnabled`: Boolean indicating if AI processing was successful
- `aiError`: Error message if AI processing failed

### Configuration

Set your OpenAI API key in environment variables:

```env
OPENAI_API_KEY=your-openai-api-key
```

### AI Prompt Engineering

LensCore uses advanced prompt engineering to generate context-aware responses:

**Automatic Tech Stack Detection:**

- Framework: React, Vue.js, Angular, Svelte, Next.js, Nuxt.js
- CSS Framework: Tailwind CSS, Bootstrap, Material UI, Chakra UI
- Language: TypeScript, JavaScript
- Build Tools: Webpack, Vite, Rollup, Parcel

**Response Format:**

```json
{
  "rule_id": "color-contrast",
  "plain_explanation": "This text has insufficient contrast for users with visual impairments.",
  "remediation": "Use Tailwind CSS classes like text-gray-800 or text-gray-900 for better contrast."
}
```

**Fallback Handling:**

- Automatic fallback responses if AI fails
- Graceful degradation without breaking the API
- Consistent response structure

### Examples

**Test with AI (Project Context):**

```bash
curl -X POST http://localhost:3001/api/test \
  -H "Content-Type: application/json" \
  -d '{
    "url": "https://example.com",
    "enableAI": true,
    "projectContext": {
      "framework": "Vue.js",
      "cssFramework": "Bootstrap",
      "language": "JavaScript"
    }
  }'
```

**Test with AI (Backward Compatibility):**

```bash
curl -X POST http://localhost:3001/api/test \
  -H "Content-Type: application/json" \
  -d '{
    "url": "https://example.com",
    "enableAI": true,
    "projectContext": {
      "additionalContext": "Vue.js, JavaScript, Bootstrap"
    }
  }'
```

**Combined with AI:**

```bash
curl -X POST http://localhost:3001/api/combined \
  -H "Content-Type: application/json" \
  -d '{
    "url": "https://example.com",
    "enableAI": true,
    "projectContext": {
      "framework": "Next.js",
      "cssFramework": "Tailwind CSS",
      "language": "TypeScript"
    }
  }'
```

---

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🙏 Acknowledgments

- [axe-core](https://github.com/dequelabs/axe-core) for accessibility testing
- [Puppeteer](https://github.com/puppeteer/puppeteer) for web automation
- [Express.js](https://expressjs.com/) for the web framework
- [OpenAI](https://openai.com/) for AI-powered accessibility analysis
- [Docker](https://www.docker.com/) for containerization

---

**Made with ❤️ by the AccessTime team**
