# Development Guide

## Setup

### Prerequisites

- Node.js 18+
- npm or yarn
- Docker (optional)

### Installation

```bash
git clone <repository-url>
cd LensCore
npm install
```

### Environment Setup

```bash
cp env.example .env
# Edit .env with your configuration
```

### Development Server

```bash
npm run dev
```

## Project Structure

```
src/
├── api/           # Express API routes
│   └── index.ts   # Main API server
├── core/          # Core business logic
│   └── index.ts   # Core exports
├── services/      # Service implementations
│   ├── crawling.ts
│   ├── accessibility.ts
│   └── index.ts
├── storage/       # Storage abstractions
│   └── index.ts
├── types/         # TypeScript type definitions
│   └── index.ts
├── utils/         # Utility functions
│   ├── env.ts
│   ├── logger.ts
│   └── index.ts
└── index.ts       # Main entry point
```

## Development Scripts

```bash
npm run dev          # Start development server
npm run build        # Build for production
npm run start        # Start production server
npm test             # Run tests
npm run test:watch   # Run tests in watch mode
npm run test:coverage # Run tests with coverage
npm run lint         # Run ESLint
npm run lint:fix     # Fix ESLint issues
npm run format       # Format code with Prettier
npm run typecheck    # Run TypeScript type checking
```

## Testing

### Unit Tests

```bash
npm test
```

### Integration Tests

```bash
npm run test:integration
```

### End-to-End Tests

```bash
npm run test:e2e
```

### Test Coverage

```bash
npm run test:coverage
```

## Code Quality

### ESLint

```bash
npm run lint
npm run lint:fix
```

### Prettier

```bash
npm run format
npm run format:check
```

### TypeScript

```bash
npm run typecheck
```

## API Development

### Adding New Endpoints

1. Add route to `src/api/index.ts`
2. Add validation schema
3. Add service method
4. Add tests
5. Update documentation

### Error Handling

- Use Zod for validation
- Return structured error responses
- Log errors appropriately
- Handle async errors properly

## Service Development

### Adding New Services

1. Create service class
2. Implement interface
3. Add to exports
4. Add tests
5. Update documentation

### Storage Integration

- Implement StorageService interface
- Add configuration support
- Handle errors gracefully
- Add tests

## Docker Development

### Development with Docker

```bash
docker-compose up -d
```

### Building Image

```bash
docker build -t lenscore .
```

### Running Container

```bash
docker run -p 3001:3001 lenscore
```

## Debugging

### Logs

- Check `logs/` directory
- Use appropriate log levels
- Include context in logs

### Debug Mode

```bash
DEBUG=* npm run dev
```

### Chrome DevTools

- Use `--inspect` flag
- Connect to debugger
- Set breakpoints

## Performance

### Monitoring

- Use health check endpoint
- Monitor memory usage
- Track response times
- Monitor error rates

### Optimization

- Use connection pooling
- Implement caching
- Optimize queries
- Monitor performance

## Contributing

### Code Style

- Follow ESLint rules
- Use Prettier formatting
- Write TypeScript types
- Add JSDoc comments

### Testing

- Write unit tests
- Add integration tests
- Test error cases
- Maintain coverage

### Documentation

- Update README
- Document APIs
- Add examples
- Keep docs current
