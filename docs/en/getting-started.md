# Getting Started with LensCore

Welcome to LensCore! This guide will help you get up and running with our accessibility testing and web crawling platform.

## What is LensCore?

LensCore is an open-source platform that combines:

- **Accessibility Testing** powered by axe-core
- **Intelligent Web Crawling** with Puppeteer
- **AI-Enhanced Analysis** using OpenAI (optional)
- **Comprehensive Reporting** in HTML and JSON formats

## Prerequisites

Before you begin, ensure you have:

- **Node.js** >= 20.0.0
- **Docker** (for containerized deployment)
- **npm** or **yarn** package manager
- **OpenAI API Key** (optional, for AI features)

## Installation

### Global Installation

Install LensCore globally via npm:

```bash
npm install -g @accesstime/lenscore
```

Or using yarn:

```bash
yarn global add @accesstime/lenscore
```

### Verify Installation

Check that LensCore is installed correctly:

```bash
lens-core --version
```

## Configuration

### Initial Setup

Run the setup wizard to configure LensCore:

```bash
lens-core setup --port 3001
```

This will:

- Create configuration file at `~/.lenscore/config.json`
- Set up Docker environment
- Configure API port
- Optionally set up OpenAI integration

### Manual Configuration

You can also manually edit the configuration file:

```json
{
  "mode": "local",
  "docker": {
    "image": "lenscore:latest",
    "port": 3001
  },
  "remote": {
    "baseUrl": "http://localhost:3001"
  },
  "openai": {
    "apiKey": "",
    "model": "gpt-3.5-turbo",
    "enabled": false
  },
  "project": {
    "framework": "",
    "cssFramework": "",
    "language": "",
    "buildTool": ""
  }
}
```

### Environment Variables

You can also configure LensCore using environment variables:

- `LENSCORE_PORT`: API server port (default: 3001)
- `OPENAI_API_KEY`: Your OpenAI API key
- `CACHE_TYPE`: Cache type (memory|redis|none)
- `CACHE_TTL`: Cache time-to-live in seconds
- `CACHE_MAX_SIZE`: Maximum cache size

## Quick Start

### 1. Initial Setup

Run the interactive setup wizard to configure LensCore for your project:

```bash
lens-core setup
```

This will guide you through:

- Creating `lenscore.config.json`
- Configuring accessibility test rules
- Setting up AI features (optional)
- Choosing cache strategy
- Project metadata

**Example with custom port:**

```bash
lens-core setup --port 8080
```

This allows you to specify a custom port for the API server.

### 2. Build and Start Services

After setup, build and start the services:

```bash
lens-core build
```

This command will:

- Build Docker image
- Start services in containers
- Initialize the API server

### 3. Check Service Status

```bash
lens-core status
```

You should see:

```
✓ Docker daemon is running
✓ Container lenscore is running
✓ API is healthy
```

### 4. Test a Single Page

Run your first accessibility test:

```bash
lens-core test https://example.com
```

This will:

- Load the webpage
- Run accessibility tests
- Generate a report
- Output results to console

### 5. Test with AI Analysis

Enable AI-powered recommendations:

```bash
lens-core test https://example.com --enable-ai
```

### 6. Generate HTML Report

Create a visual HTML report:

```bash
lens-core test https://example.com --web
```

The report will be saved to `web/output/` directory.

## Basic Usage Examples

### Test Multiple Pages

```bash
lens-core test-multiple \
  https://example.com \
  https://example.com/about \
  https://example.com/contact
```

### Crawl a Website

Discover and list all pages on a website:

```bash
lens-core crawl https://example.com --max-urls 50
```

### Full Website Scan

Crawl and test an entire website:

```bash
lens-core scan https://example.com \
  --max-urls 50 \
  --max-depth 3 \
  --enable-ai \
  --web
```

## Using the API

LensCore provides a RESTful API that you can use from any HTTP client.

### Start the API Server

```bash
lens-core up
```

### Test a Page via API

```bash
curl -X POST http://localhost:3001/api/test \
  -H "Content-Type: application/json" \
  -d '{
    "url": "https://example.com",
    "enableAI": false
  }'
```

### Check API Health

```bash
curl http://localhost:3001/api/health
```

## Project Structure

When you run LensCore, it creates the following structure:

```
~/.lenscore/
├── config.json          # Configuration file
├── logs/                # Application logs
│   ├── combined.log
│   └── error.log
└── cache/               # Cache directory

./
├── storage/             # Screenshot storage
│   └── screenshots/
└── web/                 # HTML reports
    └── output/
```

## Configuration Options

### Docker Configuration

```bash
# Set custom port
lens-core config --set "docker.port=3002"

# Check current configuration
lens-core config --list
```

### OpenAI Configuration

```bash
# Set API key
lens-core config --set "openai.apiKey=sk-..."

# Enable AI features
lens-core config --set "openai.enabled=true"

# Set model
lens-core config --set "openai.model=gpt-4"
```

### Project Context

Set project context for better AI recommendations:

```bash
lens-core config --set "project.framework=react"
lens-core config --set "project.cssFramework=tailwind"
```

## Troubleshooting

### Docker Not Running

If you see "Docker daemon is not running":

```bash
# Start Docker Desktop (macOS/Windows)
# Or start Docker service (Linux)
sudo systemctl start docker
```

### Port Already in Use

If port 3001 is already in use:

```bash
lens-core setup --port 3002
```

### Permission Issues

If you encounter permission errors:

```bash
# Linux/macOS
sudo chown -R $USER ~/.lenscore

# Check permissions
ls -la ~/.lenscore/
```

### Cache Issues

Clear the cache if you experience issues:

```bash
# Via API
curl -X DELETE http://localhost:3001/api/cache/clear

# Or restart services
lens-core down
lens-core up
```

## Next Steps

Now that you have LensCore set up, you can:

- [Explore CLI Commands](/en/cli) - Learn all available commands and options
- [Read API Documentation](/en/api) - Integrate LensCore into your applications
- [Learn About Accessibility](/en/accessibility) - Understand WCAG guidelines
- [Contribute to LensCore](/en/contributing) - Help improve the project

## Getting Help

If you need help:

- Check our [GitHub Issues](https://github.com/Access-Time/LensCore/issues)
- Read the [CLI documentation](/en/cli)
- Review the [API reference](/en/api)
- Join our community discussions

## Updates

Keep LensCore up to date:

```bash
# Check for updates
npm outdated -g @accesstime/lenscore

# Update to latest version
npm update -g @accesstime/lenscore
```

---

Ready to dive deeper? Check out the [CLI Documentation](/en/cli) for comprehensive command reference!
