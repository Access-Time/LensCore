# CLI Usage

LensCore CLI is a powerful command-line interface for accessibility testing and web crawling. It provides comprehensive tools to analyze websites for accessibility compliance, crawl web pages, and generate detailed reports.

## Installation

LensCore CLI is published as the `@accesstime/lenscore` npm package and requires **Node.js 20+**.

```bash
# Global install (recommended)
npm install -g @accesstime/lenscore

# Or run without global install
npx @accesstime/lenscore --help
```

After a global install the CLI is available everywhere as the `lens-core` command.

## Quick Start Guide

### 1. Setup LensCore

```bash
lens-core setup --port 3009
```

### 2. Build and Start Services

```bash
lens-core build
```

### 3. Check Service Status

```bash
lens-core status
```

### 4. Test a Single Page

```bash
lens-core test https://example.com
```

### 5. Crawl a Website

```bash
lens-core crawl https://example.com
```

### 6. Full Website Scan

```bash
lens-core scan https://example.com
```

::: tip Note
After setup, you can either run `lens-core build` (which builds and starts services) or `lens-core up` (which only starts services). Use `lens-core status` to check if services are running properly.
:::

## Commands Overview

### Setup & Configuration

#### `setup [options]`

Setup LensCore configuration and Docker environment.

```bash
# Interactive setup
lens-core setup
```

**Options:**

- `--port <port>`: Set API port (default: 3001)
- `-u, --url <url>`: Set custom base URL (e.g., `http://localhost:3003`)
- `--ai`: Enable AI features during setup
- `-k, --openai-key <key>`: Set OpenAI API key

---

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

## Accessibility Testing

### `test [options] <url>`

Test accessibility of a single page.

**Options:**

- `--enable-ai`: Enable AI-powered analysis
- `-k, --openai-key <key>`: OpenAI API key
- `-c, --project-context <context>`: Project context (e.g., "react,tailwind")
- `-w, --web`: Generate HTML report
- `-t, --timeout <ms>`: Page load timeout (default: 30000)
- `-r, --rules <rules>`: Specific rules to test (comma-separated)
- `-g, --tags <tags>`: WCAG tags to test (e.g., "wcag2a,wcag2aa")
- `--custom-tests <tests>`: Custom tests to run (comma-separated, e.g., "responsive")
- `--no-screenshot`: Skip screenshot capture
- `--skip-cache`: Bypass cache and force a fresh test

**Examples:**

```bash
lens-core test https://example.com
lens-core test https://example.com --enable-ai
lens-core test https://example.com --timeout 30000
lens-core test https://example.com --rules "color-contrast,keyboard"
lens-core test https://example.com --project-context "react,tailwind"
lens-core test https://example.com --web
lens-core test https://example.com --no-screenshot
lens-core test https://example.com --custom-tests=responsive --enable-ai
```

---

### `test-multiple [options] <urls...>`

Test accessibility of multiple pages simultaneously.

**Examples:**

```bash
lens-core test-multiple https://example.com https://google.com
lens-core test-multiple https://example.com https://google.com --enable-ai
lens-core test-multiple https://example.com https://google.com --web
```

## Web Crawling

### `crawl [options] <url>`

Crawl website and discover pages.

**Options:**

- `-w, --web`: Generate HTML report
- `-u, --max-urls <number>`: Maximum URLs to crawl
- `-d, --max-depth <number>`: Maximum crawl depth
- `-t, --timeout <ms>`: Page load timeout
- `-j, --concurrency <number>`: Concurrent requests
- `-l, --wait-until <event>`: Wait until event (load|domcontentloaded|networkidle)
- `--skip-cache`: Bypass cache and force a fresh crawl

**Examples:**

```bash
lens-core crawl https://example.com
lens-core crawl https://example.com --max-urls 50 --max-depth 3
lens-core crawl https://example.com --concurrency 5
lens-core crawl https://example.com --web
```

---

### `scan [options] <url>`

Crawl website and test accessibility (combined operation).

**Examples:**

```bash
lens-core scan https://example.com
lens-core scan https://example.com --enable-ai
lens-core scan https://example.com --max-urls 50 --max-depth 3
lens-core scan https://example.com --project-context "react,tailwind"
lens-core scan https://example.com --web
lens-core scan https://example.com --custom-tests=responsive --enable-ai --max-urls 10
```

**Options (summary):**

- All `crawl` options: `--max-urls`, `--max-depth`, `--timeout`, `--concurrency`, `--wait-until`, `--skip-cache`
- All `test` options: `--enable-ai`, `--openai-key`, `--project-context`, `--web`, `--timeout`, `--rules`, `--tags`, `--custom-tests`, `--no-screenshot`

## Docker Management

### `build`

Build Docker image and start containers.

```bash
lens-core build
```

---

### `up`

Start Docker containers (without building).

```bash
lens-core up
```

---

### `down`

Stop and remove Docker containers.

```bash
lens-core down
```

---

### `status`

Check Docker container and API status.

```bash
lens-core status
```

---

### `health`

Check API health endpoint.

```bash
lens-core health
```

## Cache Management

### `cache:clear`

Clear all cached data used by LensCore (in-memory or external cache depending on your configuration).

```bash
lens-core cache:clear
```

### `cache:stats`

Show cache statistics such as hit rate and cache size.

```bash
lens-core cache:stats
```

## Output Formats

### JSON Output (Default)

```bash
lens-core test https://example.com
```

Returns JSON with:

- Test results
- Violations
- Passes
- Incomplete tests
- Screenshots (base64)

### Web Output (HTML Report)

```bash
lens-core test https://example.com --web
```

Generates an HTML report saved to `web/output/` directory with:

- Visual representation
- Detailed violation descriptions
- Screenshot previews
- Code snippets
- Recommendations

## Configuration File

LensCore configuration is stored in `~/.lenscore/config.json`:

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

- `LENSCORE_PORT`: API server port
- `OPENAI_API_KEY`: OpenAI API key
- `CACHE_TYPE`: Cache type (memory|redis|none)
- `CACHE_TTL`: Cache time-to-live (seconds)
- `CACHE_MAX_SIZE`: Maximum cache size

## Real-World Examples

### Complete Website Analysis

```bash
lens-core setup --ai --openai-key your-api-key
lens-core build
lens-core health
lens-core scan https://example.com --max-urls 50 --enable-ai --web
```

### Batch Testing

```bash
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
lens-core crawl https://example.com \
  --max-urls 50 \
  --max-depth 3 \
  --concurrency 5 \
  --wait-until networkidle \
  --web
```

### CI/CD Integration

```bash
lens-core setup --port 3001 --ai --openai-key $OPENAI_API_KEY
lens-core build
lens-core health
lens-core test https://example.com > results.json
```

## CI & Release Workflow

This section is intended for contributors and maintainers who work on the LensCore CLI itself.

### Continuous Integration (GitHub Actions)

On every push to `main` and for all pull requests, GitHub Actions runs:

- **Build Check** (`.github/workflows/build.yml`): `npm run typecheck` and `npm run build`
- **Test Check** (`.github/workflows/test.yml`): `npm run test` and `npm run test:coverage`
- **Lint Check** (`.github/workflows/lint.yml`): `npm run lint` and `npm run format:check`

In addition, the **Security Check** workflow (`.github/workflows/security.yml`) runs on a schedule to:

- Perform `npm audit` with a moderate severity threshold
- Generate reports about outdated dependencies

### Documentation Deployment

Documentation is built and deployed to GitHub Pages by `.github/workflows/deploy-docs.yml`:

- Triggered on pushes to `main` that touch `docs/**`, `package.json`, `package-lock.json`, or the workflow itself
- Runs `npm ci` and `npm run docs:build`
- Publishes the built docs to GitHub Pages

### Releasing a New CLI Version to npm

Releases of the `@accesstime/lenscore` npm package are automatically published when a GitHub release is created. The CI workflow (`npm-release.yml`) handles the publishing process:

1. **Update the version**
   - Use `npm version patch|minor|major` (preferred) or edit `package.json` manually.
   - This updates the version field and creates a Git tag when using `npm version`.
2. **Create a GitHub release**
   - Create a new GitHub release with the version tag.
   - The CI workflow will automatically check if the version exists, build the project, and publish to npm if it's a new version.
3. **Verify the new version**
   - Install globally on a clean environment: `npm install -g @accesstime/lenscore`
   - Run `lens-core --version` to confirm the published version.

## Troubleshooting

### Common Issues

```bash
# Docker not running
docker info
lens-core up

# Port conflicts
lens-core setup --port 3002

# Permission issues
ls -la ~/.lenscore/
lens-core config --reset
```

### Getting Help

- Use `lens-core --help` for command list
- Use `lens-core help <command>` for specific command help
- Check `lens-core status` for service health
- Review logs in `~/.lenscore/logs/`

## Advanced Usage

### Custom Tests

LensCore supports additional custom tests for deeper analysis. Currently available:

#### Responsive Test

Test website layout responsiveness using AI to detect responsive design issues across different viewport sizes.

**Requirements:**

- Requires `--enable-ai` or `--openai-key` to enable AI analysis
- Uses OpenAI models that support Vision API (automatically uses `gpt-4o` if needed)

**Usage:**

```bash
# Test responsiveness of a single page
lens-core test https://example.com --custom-tests=responsive --enable-ai

# Test responsiveness with scan
lens-core scan https://example.com --custom-tests=responsive --enable-ai --max-urls 10

# With web report
lens-core test https://example.com --custom-tests=responsive --enable-ai --web
```

**What It Does:**

- Captures screenshots at various viewports (mobile, tablet, desktop)
- Analyzes screenshots using AI to detect responsive issues
- Generates a report with screenshots and remediation recommendations

**Test Results:**

- Screenshots for each viewport
- List of detected responsive issues
- Remediation recommendations for each issue
- Pass/fail status for each viewport

### Custom Rules

LensCore supports custom rules to add additional accessibility rules. Custom rules can be Axe-core rules or Playwright tests.

#### Approved Rules

LensCore provides a curated set of approved rules available by default:

- `button-has-accessible-name` - Ensures buttons have accessible names
- `link-has-accessible-name` - Ensures links have accessible names
- `heading-order` - Ensures headings have logical hierarchy
- `page-has-heading-one` - Ensures page has a level 1 heading
- `image-alt-text` - Ensures images have appropriate alt text

Approved rules run automatically during tests. To disable:

```bash
lens-core test https://example.com --no-approved-rules
```

#### Custom Rules from Project

Create custom rules in your project by placing files in one of these locations:

- `.lenscore/rules/`
- `lenscore-rules/`
- `.lenscore-rules/`

**Example Axe Rule:**

Create file `.lenscore/rules/my-rule.json`:

```json
{
  "id": "my-custom-rule",
  "enabled": true,
  "metadata": {
    "description": "Custom rule description",
    "help": "Help text for the rule"
  },
  "rule": {
    "id": "color-contrast",
    "enabled": true,
    "tags": ["wcag2aa"]
  },
  "severity": "serious"
}
```

**Example Playwright Test:**

Create file `.lenscore/rules/my-test.js`:

```javascript
export default {
  id: 'my-test',
  name: 'My Custom Test',
  enabled: true,
  severity: 'moderate',
  run: async (context) => {
    const { page } = context;
    const elements = await page.$$eval('button', (buttons) => buttons.length);
    return {
      id: 'my-test',
      name: 'My Custom Test',
      passed: elements > 0,
      severity: 'moderate',
      description: elements > 0 
        ? `Found ${elements} buttons`
        : 'No buttons found',
    };
  }
};
```

#### Custom Rules Options

```bash
# Use custom rules from specific paths
lens-core test https://example.com --custom-rules-paths ./my-rules,./team-rules

# Use custom rules from config file
lens-core test https://example.com --custom-rules-config ./rules-config.json

# Disable default rules
lens-core test https://example.com --disable-default-rules color-contrast,keyboard

# Enable specific default rules
lens-core test https://example.com --enable-default-rules color-contrast
```

### Test Specific Accessibility Rules

```bash
lens-core test https://example.com --rules "color-contrast,keyboard"
lens-core test https://example.com --tags "wcag2a,wcag2aa"
```

### Performance Tuning

Optimize crawling performance:

```bash
lens-core scan https://example.com \
  --concurrency 5 \
  --timeout 30000 \
  --max-urls 50 \
  --max-depth 3
```

### Integration Examples

#### Node.js Integration

```javascript
const { exec } = require('child_process');

exec('lens-core test https://example.com', (error, stdout, stderr) => {
  if (error) {
    console.error(`Error: ${error.message}`);
    return;
  }
  const results = JSON.parse(stdout);
  console.log(`Found ${results.violations.length} violations`);
});
```

#### Shell Script Integration

```bash
#!/bin/bash
# test-suite.sh

lens-core health || exit 1

lens-core test https://example.com > results.json
if [ $(jq '.violations | length' results.json) -gt 0 ]; then
  echo "Accessibility violations found!"
  exit 1
fi
```

## Support

- **GitHub Repository**: [https://github.com/Access-Time/LensCore](https://github.com/Access-Time/LensCore)
- **Issue Tracker**: [https://github.com/Access-Time/LensCore/issues](https://github.com/Access-Time/LensCore/issues)
- **Documentation**: [https://accesstime.github.io/LensCore](https://accesstime.github.io/LensCore)

---

For more information about specific features, check out:

- [API Reference](/en/api) - RESTful API documentation
- [Accessibility Guide](/en/accessibility) - WCAG compliance information
- [Contributing Guide](/en/contributing) - How to contribute to LensCore
