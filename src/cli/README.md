# LensCore CLI

LensCore CLI is a powerful command-line interface for accessibility testing and web crawling. It provides comprehensive tools to analyze websites for accessibility compliance, crawl web pages, and generate detailed reports.

## Installation

```bash
npm install -g @accesstime/lenscore
```

## Quick Start

1. **Setup LensCore**:
   ```bash
   lens-core setup --port 3009
   ```

2. **Build and start services**:
   ```bash
   lens-core build
   ```

3. **Check service status**:
   ```bash
   lens-core status
   ```

4. **Test a single page**:
   ```bash
   lens-core test https://example.com
   ```

5. **Crawl a website**:
   ```bash
   lens-core crawl https://example.com
   ```

6. **Full website scan**:
   ```bash
   lens-core scan https://example.com
   ```

**Note**: After setup, you can either run `lens-core build` (which builds and starts services) or `lens-core up` (which only starts services). Use `lens-core status` to check if services are running properly.

## Commands Overview

### Setup & Configuration

#### `setup [options]`
Setup LensCore configuration and Docker environment.


**Examples:**
```bash
# Interactive setup
lens-core setup
```

#### `config [options]`
Manage LensCore configuration settings.

**Options:**
- `-s, --set <key=value>`: Set configuration value (e.g., docker.port=3003)
- `-g, --get <key>`: Get configuration value (e.g., docker.port)
- `-l, --list`: List all configuration settings

**Examples:**
```bash
# List all configuration
lens-core config --list

# Get specific configuration value
lens-core config --get docker.port

# Set configuration value
lens-core config --set "docker.port=3009"

# Set OpenAI API key
lens-core config --set "openai.apiKey=your-key-here"
```

### Accessibility Testing

#### `test [options] <url>`
Test accessibility of a single page.

**Options:**
- `--enable-ai`: Enable AI analysis (uses config API key)
- `-k, --openai-key <key>`: Override OpenAI API key
- `-c, --project-context <context>`: Project context (e.g., react,tailwind,typescript)
- `-w, --web`: Open results in browser (default: JSON output)
- `-t, --timeout <number>`: Request timeout in milliseconds (default: 10000)
- `-r, --rules <rules>`: Specific axe-core rules (comma-separated)
- `-g, --tags <tags>`: WCAG tags (comma-separated)
- `--no-screenshot`: Disable screenshot capture

**Examples:**
```bash
# Basic accessibility test
lens-core test https://example.com

# Test with AI analysis
lens-core test https://example.com --enable-ai

# Test with custom timeout
lens-core test https://example.com --timeout 30000

# Test with specific rules
lens-core test https://example.com --rules "color-contrast,keyboard"

# Test with project context
lens-core test https://example.com --project-context "react,tailwind"

# Test with web output
lens-core test https://example.com --web

# Test without screenshot
lens-core test https://example.com --no-screenshot
```

#### `test-multiple [options] <urls...>`
Test accessibility of multiple pages simultaneously.

**Options:**
- `--enable-ai`: Enable AI analysis (uses config API key)
- `-k, --openai-key <key>`: Override OpenAI API key
- `-c, --project-context <context>`: Project context (e.g., react,tailwind,typescript)
- `-w, --web`: Open results in browser (default: JSON output)
- `-t, --timeout <number>`: Request timeout in milliseconds (default: 10000)
- `-r, --rules <rules>`: Specific axe-core rules (comma-separated)
- `-g, --tags <tags>`: WCAG tags (comma-separated)
- `--no-screenshot`: Disable screenshot capture

**Examples:**
```bash
# Test multiple pages
lens-core test-multiple https://example.com https://google.com https://github.com

# Test with AI analysis
lens-core test-multiple https://example.com https://google.com --enable-ai

# Test with custom timeout
lens-core test-multiple https://example.com https://google.com --timeout 30000

# Test with project context
lens-core test-multiple https://example.com https://google.com --project-context "react,tailwind"

# Test with web output
lens-core test-multiple https://example.com https://google.com --web
```

### Web Crawling

#### `crawl [options] <url>`
Crawl website and discover pages.

**Options:**
- `-w, --web`: Open results in browser (default: JSON output)
- `-u, --max-urls <number>`: Maximum URLs to crawl (default: 10)
- `-d, --max-depth <number>`: Maximum crawl depth (default: 2)
- `-t, --timeout <number>`: Request timeout in milliseconds (default: 10000)
- `-j, --concurrency <number>`: Number of concurrent requests (default: 3)
- `-l, --wait-until <condition>`: Page load condition (default: domcontentloaded)

**Examples:**
```bash
# Basic crawl
lens-core crawl https://example.com

# Crawl with custom limits
lens-core crawl https://example.com --max-urls 50 --max-depth 3

# Crawl with custom concurrency
lens-core crawl https://example.com --concurrency 5

# Crawl with web output
lens-core crawl https://example.com --web
```

### Combined Operations

#### `scan [options] <url>`
Crawl website and test accessibility (combined operation).

**Options:**
- `--enable-ai`: Enable AI analysis (uses config API key)
- `-k, --openai-key <key>`: Override OpenAI API key
- `-c, --project-context <context>`: Project context (e.g., react,tailwind,typescript)
- `-w, --web`: Open results in browser (default: JSON output)
- `-u, --max-urls <number>`: Maximum URLs to crawl (default: 10)
- `-d, --max-depth <number>`: Maximum crawl depth (default: 2)
- `-t, --timeout <number>`: Request timeout in milliseconds (default: 15000)
- `-j, --concurrency <number>`: Number of concurrent requests (default: 3)

**Examples:**
```bash
# Full website scan
lens-core scan https://example.com

# Scan with AI analysis
lens-core scan https://example.com --enable-ai

# Scan with custom parameters
lens-core scan https://example.com --max-urls 50 --max-depth 3

# Scan with project context
lens-core scan https://example.com --project-context "react,tailwind"

# Scan with web output
lens-core scan https://example.com --web
```

### Docker Management

#### `build`
Build and start LensCore Docker services.

**Examples:**
```bash
# Build and start services
lens-core build
```

#### `up`
Start LensCore Docker services.

**Examples:**
```bash
# Start services
lens-core up
```

#### `down`
Stop LensCore Docker services.

**Examples:**
```bash
# Stop services
lens-core down
```

#### `status`
Check LensCore Docker services status.

**Examples:**
```bash
# Check service status
lens-core status
```

### Health & Monitoring

#### `health`
Check LensCore health status.

**Examples:**
```bash
# Check health
lens-core health
```

## Output Formats

### JSON Output (Default)
```bash
lens-core test https://example.com
```

### Web Output (HTML Report)
```bash
lens-core test https://example.com --web
```

## Configuration

LensCore configuration is stored in `~/.lenscore/config.json` and includes:

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

## Environment Variables

- `LENSCORE_PORT`: Port for local Docker instance (default: 3001)
- `OPENAI_API_KEY`: OpenAI API key for AI-powered analysis
- `CACHE_TYPE`: Cache type (memory, redis, filesystem)
- `CACHE_TTL`: Cache time-to-live in seconds
- `CACHE_MAX_SIZE`: Maximum cache size

## Examples

### Complete Website Analysis
```bash
# Setup LensCore with AI
lens-core setup --ai --openai-key your-api-key

# Build and start services
lens-core build

# Check health
lens-core health

# Full website scan with AI analysis
lens-core scan https://example.com --max-urls 50 --enable-ai --web
```

### Batch Testing
```bash
# Test multiple pages with AI analysis
lens-core test-multiple \
  https://example.com \
  https://example.com/about \
  https://example.com/contact \
  --enable-ai \
  --project-context "react,tailwind" \
  --web
```

### Custom Crawling
```bash
# Deep crawl with custom settings
lens-core crawl https://example.com \
  --max-urls 50 \
  --max-depth 3 \
  --concurrency 5 \
  --wait-until networkidle \
  --web
```

## Troubleshooting

### Common Issues

1. **Docker not running**:
   ```bash
   # Check Docker status
   docker info
   
   # Start Docker services
   lens-core up
   ```

2. **Port conflicts**:
   ```bash
   # Use different port
   lens-core setup --port 3002
   ```

3. **Permission issues**:
   ```bash
   # Check permissions
   ls -la ~/.lenscore/
   
   # Reset configuration
   lens-core config --reset
   ```

### Getting Help

- Use `lens-core --help` for general help
- Use `lens-core help <command>` for specific command help
- Check service status with `lens-core status`
- View logs in `~/.lenscore/logs/`

## Advanced Usage

### Custom Rules
```bash
# Test with specific accessibility rules
lens-core test https://example.com --rules "color-contrast,keyboard"

# Test with WCAG tags
lens-core test https://example.com --tags "wcag2a,wcag2aa"
```

### Performance Tuning
```bash
# High-performance scan
lens-core scan https://example.com \
  --concurrency 5 \
  --timeout 30000 \
  --max-urls 50 \
  --max-depth 3
```

### Integration with CI/CD
```bash
# Non-interactive setup for CI
lens-core setup --port 3001 --ai --openai-key $OPENAI_API_KEY

# Build services
lens-core build

# Check health
lens-core health

# Run tests with JSON output
lens-core test https://example.com > results.json
```

## Support

For more information, visit:
- [GitHub Repository](https://github.com/Access-Time/LensCore)
- [Issue Tracker](https://github.com/Access-Time/lenscore/LensCore)
