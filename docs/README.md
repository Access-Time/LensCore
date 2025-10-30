# LensCore Documentation

This directory contains the VitePress-based documentation for LensCore.

## Development

### Prerequisites

- Node.js >= 20.0.0
- npm or yarn

### Local Development

Start the development server:

```bash
npm run docs:dev
```

The documentation will be available at `http://localhost:5173`

### Building

Build the static documentation site:

```bash
npm run docs:build
```

The built files will be in `docs/.vitepress/dist`

### Preview

Preview the built documentation:

```bash
npm run docs:preview
```

## Structure

```
docs/
├── .vitepress/          # VitePress configuration
│   ├── config.ts        # Main configuration
│   └── theme/           # Custom theme
│       ├── index.ts     # Theme entry
│       ├── custom.css   # Custom styles
│       └── components/  # Custom components
│           └── SwaggerUI.vue
├── en/                  # English documentation
│   ├── index.md         # Home page
│   ├── getting-started.md
│   ├── cli.md
│   ├── api.md
│   ├── accessibility.md
│   └── contributing.md
├── id/                  # Indonesian documentation
│   └── (same structure as en/)
└── public/              # Static assets
    └── img/
```

## Features

- ✅ Static site generator (VitePress)
- ✅ i18n/Localization (EN/ID)
- ✅ Search functionality (local search)
- ✅ Dark mode support
- ✅ WCAG 2.1 AA compliant
- ✅ Responsive design
- ✅ GitHub Pages deployment
- ✅ Automated deployment via GitHub Actions

## Configuration

### Base Path

The site is configured for GitHub Pages deployment with base path `/LensCore/`. Update this in `.vitepress/config.ts` if deploying elsewhere:

```ts
export default defineConfig({
  base: '/LensCore/', // Change this for different deployment
  // ...
});
```

### Locales

Currently supports:
- English (root `/en/`)
- Indonesian (`/id/`)

To add more locales, update the `locales` section in `.vitepress/config.ts`.

## Deployment

### GitHub Pages

The documentation is automatically deployed to GitHub Pages via GitHub Actions when changes are pushed to the `main` branch.

**Setup:**

1. Go to repository Settings → Pages
2. Set Source to "GitHub Actions"
3. Push changes to trigger deployment

**Workflow:** `.github/workflows/deploy-docs.yml`

### Manual Deployment

```bash
# Build
npm run docs:build

# The dist folder can be deployed to any static hosting service
cd docs/.vitepress/dist
```

## Accessibility

The documentation follows WCAG 2.1 AA standards:

- Semantic HTML structure
- Keyboard navigation support
- Sufficient color contrast
- Screen reader compatible
- Skip links
- Responsive design

### Testing Accessibility

An automated accessibility check runs on every PR via GitHub Actions:

**Workflow:** `.github/workflows/accessibility-check.yml`

You can also test locally:

```bash
# Install axe-core CLI
npm install -g @axe-core/cli

# Build and preview
npm run docs:build
npm run docs:preview

# Run accessibility test
axe http://localhost:4173
```

## Writing Documentation

### Markdown

VitePress uses Markdown with additional features:

#### Custom Containers

```md
::: tip
This is a tip
:::

::: warning
This is a warning
:::

::: danger
This is a danger message
:::
```

#### Code Blocks

````md
```bash
npm install
```

```javascript
console.log('Hello World');
```
````

#### Tables

```md
| Header 1 | Header 2 |
|----------|----------|
| Cell 1   | Cell 2   |
```

### Components

#### SwaggerUI (for API docs)

```vue
<SwaggerUI spec="http://localhost:3001/api/docs/openapi.json" />
```

## Troubleshooting

### Port Already in Use

If port 5173 is already in use:

```bash
# Kill process using the port
lsof -ti:5173 | xargs kill -9

# Or use a different port
vitepress dev docs --port 5174
```

### Build Errors

Clear cache and rebuild:

```bash
rm -rf docs/.vitepress/cache docs/.vitepress/dist
npm run docs:build
```

### Search Not Working

Local search is built during build time. If search isn't working:

1. Rebuild the documentation
2. Clear browser cache
3. Check console for errors

## Contributing

When contributing to documentation:

1. Follow the existing structure
2. Use proper Markdown formatting
3. Test locally before submitting PR
4. Ensure accessibility compliance
5. Update both EN and ID versions

## Resources

- [VitePress Documentation](https://vitepress.dev/)
- [Markdown Guide](https://www.markdownguide.org/)
- [WCAG 2.1 Guidelines](https://www.w3.org/WAI/WCAG21/quickref/)

## License

MIT License - see LICENSE file for details

