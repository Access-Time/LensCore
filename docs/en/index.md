---
layout: home

hero:
  name: LensCore
  text: Accessibility Testing & Web Crawling
  tagline: Open-source platform for comprehensive accessibility testing and intelligent web crawling
  image:
    src: /img/logo.jpeg
    alt: LensCore logo
  actions:
    - theme: brand
      text: Get Started
      link: /en/getting-started
    - theme: alt
      text: View on GitHub
      link: https://github.com/Access-Time/LensCore

features:
  - icon: 🔍
    title: Comprehensive Testing
    details: Automated accessibility testing powered by axe-core with AI-enhanced recommendations

  - icon: 🕷️
    title: Intelligent Crawling
    details: Advanced web crawling with configurable depth, concurrency, and smart URL discovery

  - icon: 🤖
    title: AI-Powered Analysis
    details: Optional OpenAI integration for contextual accessibility insights and recommendations

  - icon: 📊
    title: Detailed Reports
    details: Generate comprehensive HTML and JSON reports with screenshots and actionable insights

  - icon: ⚡
    title: High Performance
    details: Built with TypeScript and Puppeteer for fast, reliable testing at scale

  - icon: 🌐
    title: Multi-Language
    details: Full support for English and Indonesian documentation and interfaces

  - icon: 🐳
    title: Docker Ready
    details: Easy deployment with Docker and Docker Compose support

  - icon: 🔌
    title: Flexible API
    details: RESTful API with OpenAPI specification for easy integration

  - icon: ♿
    title: WCAG Compliant
    details: Follows WCAG 2.1 AA standards for accessibility testing and documentation
---

## Quick Start

Get up and running with LensCore in minutes:

```bash
# Install globally
npm install -g @accesstime/lenscore

# Initial setup (interactive wizard)
lens-core setup

# Or with custom port
lens-core setup --port 8080

# Build and start services
lens-core build

# Run your first test
lens-core test https://example.com
```

## Why LensCore?

LensCore combines powerful accessibility testing with intelligent web crawling to help you:

- **Identify Accessibility Issues**: Automatically detect WCAG violations and get actionable recommendations
- **Scale Your Testing**: Crawl entire websites and test multiple pages simultaneously
- **Get AI Insights**: Leverage OpenAI for contextual analysis and improvement suggestions
- **Integrate Easily**: Use via CLI, API, or integrate into your CI/CD pipeline
- **Save Time**: Automated testing and reporting reduce manual testing effort

## What's Next?

<div class="vp-doc">

- [Getting Started Guide](/en/getting-started) - Learn the basics and set up your environment
- [CLI Documentation](/en/cli) - Explore all CLI commands and options
- [API Reference](/en/api) - Integrate LensCore into your applications
- [Contributing Guide](/en/contributing) - Help make LensCore better

</div>

## Community & Support

- **GitHub**: [Report issues](https://github.com/Access-Time/LensCore/issues) or contribute
- **Documentation**: Comprehensive guides for all features
- **License**: MIT - Free for personal and commercial use
