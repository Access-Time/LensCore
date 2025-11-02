# Contributing to LensCore

Thank you for your interest in contributing to LensCore! 🎉

This document provides guidelines and instructions for contributing to the project.

## 🤝 How to Contribute

### Reporting Bugs

Found a bug? Please [open an issue](https://github.com/your-org/LensCore/issues/new?template=bug_report.yml) with:

- Clear description of the issue
- Steps to reproduce
- Expected vs actual behavior
- Environment details (OS, Node version, etc.)

### Suggesting Features

Have an idea? [Submit a feature request](https://github.com/your-org/LensCore/issues/new?template=feature_request.yml) with:

- Feature description
- Problem it solves
- Use case/user story

### Code Contributions

1. **Fork the repository**
2. **Create a branch** from `main`:
   ```bash
   git checkout -b feature/your-feature-name
   ```
3. **Make your changes**
4. **Follow our standards** (see below)
5. **Test your changes**:
   ```bash
   make test
   make lint
   make typecheck
   ```
6. **Commit your changes** using [Conventional Commits](https://www.conventionalcommits.org/):
   ```bash
   git commit -m "feat: add new accessibility rule"
   ```
7. **Push to your fork**:
   ```bash
   git push origin feature/your-feature-name
   ```
8. **Open a Pull Request**

## 📝 Commit Message Guidelines

We use [Conventional Commits](https://www.conventionalcommits.org/). Format:

```
<type>(<scope>): <subject>

[optional body]

[optional footer]
```

**Types:**

- `feat`: New feature
- `fix`: Bug fix
- `docs`: Documentation changes
- `style`: Code style changes (formatting, etc.)
- `refactor`: Code refactoring
- `test`: Adding or updating tests
- `chore`: Maintenance tasks

**Examples:**

```
feat(api): add caching support for AI responses
fix(crawler): handle timeout errors gracefully
docs(readme): update installation instructions
```

## ✅ Coding Standards

### Code Style

- **TypeScript**: Follow TypeScript best practices
- **Formatting**: We use Prettier - run `make format` before committing
- **Linting**: We use ESLint - run `make lint` to check
- **Type Checking**: Run `make typecheck` before submitting

### Code Quality

- Write clear, readable code
- Add comments for complex logic
- Keep functions focused and small
- Follow existing code patterns
- Add tests for new features

### Testing

- Write tests for new features
- Ensure all tests pass: `make test`
- Aim for good test coverage

## 🔍 Pull Request Process

1. **Update documentation** if needed
2. **Add tests** for new features
3. **Ensure all checks pass**:
   - Tests pass
   - Linting passes
   - Type checking passes
   - Build succeeds
4. **Request review** from maintainers
5. **Address feedback** promptly

## 📚 Development Setup

### Prerequisites

- Node.js 20+
- Docker & Docker Compose (optional)
- Git

### Setup Steps

```bash
# Clone your fork
git clone https://github.com/your-username/LensCore.git
cd LensCore

# Install dependencies
make install

# Copy environment file
cp env.example .env

# Start development server
make dev
```

### Useful Commands

```bash
make install      # Install dependencies
make dev          # Run development server
make build        # Build for production
make test         # Run tests
make lint         # Check code style
make format       # Format code
make typecheck    # Type check
```

## 🐛 Testing

Before submitting:

- Run unit tests: `make test`
- Run linting: `make lint`
- Run type checking: `make typecheck`
- Test manually if applicable

## 📖 Documentation

- Update README.md if you change features
- Add JSDoc comments for new functions
- Update API docs if you change endpoints
- Keep comments clear and helpful

## 🎯 Where to Start

Good first contributions:

- Fix typos in documentation
- Improve error messages
- Add tests for existing features
- Fix small bugs
- Improve code comments

Check [issues labeled "good first issue"](https://github.com/your-org/LensCore/labels/good%20first%20issue).

## 📞 Getting Help

- **Discussions**: Use GitHub Discussions
- **Issues**: Open an issue for bugs or features
- **Code of Conduct**: Please read our [Code of Conduct](CODE_OF_CONDUCT.md)

## 🙏 Recognition

Contributors help make LensCore better. Thank you for your contributions!

### Contributors

Thank you to all contributors who have helped improve LensCore!

<!-- Replace 'your-org/LensCore' with your actual GitHub repository path -->

<div align="center">

<a href="https://github.com/your-org/LensCore/graphs/contributors">
  <img src="https://contrib.rocks/image?repo=your-org/LensCore&max=100" />
</a>

<p>Made with <a href="https://contrib.rocks">AccessTime team</a></p>

</div>

---

**Made with ❤️ by the AccessTime team**
