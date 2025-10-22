# LensCore - Minimal Makefile

.PHONY: help install dev build start test lint fmt typecheck clean build-docker up down logs env env-all

help: ## Show available commands
	@echo "LensCore - Available commands"
	@grep -E '^[a-zA-Z_-]+:.*?## .*$$' $(MAKEFILE_LIST) | awk 'BEGIN {FS = ":.*?## "}; {printf "\033[36m%-12s\033[0m %s\n", $$1, $$2}'

install: ## Install dependencies
	npm install

dev: ## Run development server
	npm run dev

build: ## Build for production
	npm run build

start: ## Run production server
	npm start

test: ## Run all tests
	npm test

lint: ## Run ESLint
	npm run lint

format: ## Format code with Prettier
	npm run format

typecheck: ## Run TypeScript type checking
	npm run typecheck

clean: ## Remove build and coverage outputs
	rm -rf dist/ coverage/

build-docker: ## Build Docker image and setup node_modules
	docker-compose --profile init run --rm lenscore-init
	docker-compose up -d --build
	@echo "Copying node_modules for IDE support..."; \
	docker cp lenscore-app:/app/node_modules ./; \
	echo "✅ node_modules copied for IDE support!"

up: ## Start services with Docker Compose
	docker-compose up -d

down: ## Stop services with Docker Compose
	docker-compose down

logs: ## Tail Docker Compose logs
	docker-compose logs -f

env: ## Print important env variables from .env (if present)
	@/bin/sh -c 'set -a; [ -f .env ] && . ./.env; set +a; \
	echo "NODE_ENV: $$NODE_ENV"; \
	echo "PORT: $$PORT"; \
	echo "STORAGE_TYPE: $$STORAGE_TYPE";'

env-all: ## Print all environment variables from .env file
	@if [ -f .env ]; then \
		echo "=== Environment Variables from .env ==="; \
		cat .env | grep -v '^#' | grep -v '^$$' | sort; \
	else \
		echo "No .env file found"; \
	fi
