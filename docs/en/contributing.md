# Contributing to LensCore

Thank you for your interest in contributing to LensCore! We welcome contributions from everyone. This guide will help you get started contributing to the project.

## Ways to Contribute

- Report bugs and issues
- Propose new features or enhancements
- Improve documentation
- Write tests
- Submit code changes
- Review pull requests
- Help other users in discussions

## Getting Started

### 1. Fork the Repository

Start by forking the repository on GitHub:

```bash
# Fork on GitHub, then clone your fork
git clone https://github.com/YOUR_USERNAME/LensCore.git
cd LensCore
```

### 2. Setup Development Environment

```bash
# Install dependencies
make install

# Copy environment file
cp env.example .env

# Run development server
make dev
```

### 3. Create a Branch

Create a new branch for your feature or bugfix:

```bash
git checkout -b feature/your-feature-name
# or
git checkout -b fix/your-bugfix-name
```

## Development Workflow

### Running Tests

```bash
# Run all tests
make test

# Run tests in watch mode
npm run test:watch

# Run specific test file
npm test -- path/to/test.ts
```

### Linting & Formatting

```bash
# Run linter
make lint

# Fix linting issues
make lint:fix

# Format code
make format
```

### Type Checking

```bash
# Run TypeScript type checking
make typecheck
```

## Contribution Guidelines

### Code Style

- Follow the existing code style and conventions
- Use TypeScript with strict type checking
- Write clear and self-documenting code
- Add comments for complex logic
- Use meaningful variable and function names

### Testing

- Write tests for new features
- Ensure existing tests pass
- Target high code coverage
- Test edge cases and error scenarios

### Accessibility

- Follow WCAG 2.1 guidelines
- Ensure keyboard navigation works
- Provide appropriate ARIA labels
- Test with screen readers
- Maintain sufficient color contrast

### Documentation

- Update relevant documentation
- Add JSDoc comments to functions
- Update README if needed
- Document breaking changes

## Submitting a Pull Request

### Before Submitting

1. Ensure all tests pass and code is linted
2. Update documentation if needed
3. Add or update tests for your changes
4. Commit your changes with clear messages
5. Push to your fork and create a pull request

### Commit Message Format

Use clear and descriptive commit messages:

```bash
feat: add new accessibility rule for color contrast
fix: correct crawling issue with nested pages
docs: update API documentation for new endpoint
test: add unit tests for accessibility service
refactor: improve code structure in AI processor
```

### Pull Request Template

Include the following in your PR description:

- **Description**: What does this PR do?
- **Related Issue**: Link to related issue(s)
- **Type of Change**: Bug fix, feature, documentation, etc.
- **Testing**: How was this tested?
- **Screenshots**: If applicable
- **Checklist**: Tests pass, docs updated, etc.

## Code of Conduct

We are committed to providing a friendly and inclusive environment. Please be respectful and considerate in your interactions with other contributors. We expect all contributors to follow our Code of Conduct.

### Our Standards

- Be respectful and inclusive
- Welcome newcomers
- Accept constructive criticism gracefully
- Focus on what is best for the community
- Show empathy towards other community members

## Development Setup Details

### Prerequisites

- Node.js >= 20.0.0
- Docker and Docker Compose
- Git
- npm or yarn

### Project Structure

```
LensCore/
├── src/               # Source code
│   ├── api/          # API routes and handlers
│   ├── cli/          # CLI commands and services
│   ├── services/     # Core services
│   ├── types/        # TypeScript types
│   └── utils/        # Utility functions
├── tests/            # Test files
├── docs/             # Documentation (VitePress)
├── pages/            # Legacy HTML pages
└── dist/             # Compiled output
```

### Available Commands

```bash
# Development
make dev              # Start development server
make build            # Build TypeScript
make start            # Start production server

# Testing
make test             # Run tests
make test:coverage    # Run tests with coverage
make test:watch       # Run tests in watch mode

# Quality
make lint             # Run linter
make lint:fix         # Fix linting issues
make format           # Format code
make typecheck        # Type checking

# Docker
make docker-build     # Build Docker image
make docker-up        # Start Docker containers
make docker-down      # Stop Docker containers
```

## Issue Guidelines

### Reporting Bugs

When reporting bugs, include:

1. **Description**: Clear description of the bug
2. **Steps to Reproduce**: Numbered steps to reproduce
3. **Expected Behavior**: What you expected to happen
4. **Actual Behavior**: What actually happened
5. **Environment**: OS, Node version, browser, etc.
6. **Screenshots**: If applicable
7. **Logs**: Relevant error logs

### Suggesting Features

When suggesting features, include:

1. **Problem**: What problem does this solve?
2. **Proposed Solution**: Your suggested approach
3. **Alternatives**: Other solutions you considered
4. **Additional Context**: Screenshots, examples, etc.

## Review Process

1. **Submission**: You submit a pull request
2. **Automated Checks**: CI runs tests and linting
3. **Code Review**: Maintainers review your code
4. **Feedback**: You address review comments
5. **Approval**: Maintainers approve and merge

## Getting Help

If you have questions about contributing:

- Open an issue on [GitHub](https://github.com/Access-Time/LensCore/issues)
- Join our community discussions
- Contact the maintainers

## Recognition

Contributors are recognized in:

- GitHub contributors list
- Release notes
- Project README
- Documentation credits

## License

By contributing to LensCore, you agree that your contributions will be licensed under the MIT License.

---

Thank you for contributing to LensCore! Your efforts help make accessibility testing better for everyone. 🎉

