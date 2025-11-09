# Makefile for SEPE Templates Comparator

.PHONY: help setup build up down logs clean test lint format migrate shell

# Default target
help: ## Show this help message
	@echo "SEPE Templates Comparator - Development Commands"
	@echo "================================================"
	@awk 'BEGIN {FS = ":.*?## "} /^[a-zA-Z_-]+:.*?## / {printf "\033[36m%-20s\033[0m %s\n", $$1, $$2}' $(MAKEFILE_LIST)

# Environment setup
setup: ## Set up development environment
	@echo "Setting up development environment..."
	@chmod +x scripts/dev-setup.sh
	@./scripts/dev-setup.sh

# Docker operations
build: ## Build all Docker images
	@echo "Building Docker images..."
	docker-compose build --no-cache

up: ## Start all services
	@echo "Starting services..."
	docker-compose up -d

down: ## Stop all services
	@echo "Stopping services..."
	docker-compose down

restart: ## Restart all services
	@echo "Restarting services..."
	docker-compose restart

logs: ## Show logs for all services
	docker-compose logs -f

logs-backend: ## Show backend logs
	docker-compose logs -f backend

logs-frontend: ## Show frontend logs
	docker-compose logs -f frontend

logs-db: ## Show database logs
	docker-compose logs -f postgres

# Development
shell: ## Access backend shell
	docker-compose exec backend bash

shell-db: ## Access database shell
	docker-compose exec postgres psql -U sepe_user -d sepe_comparator

# Database operations
migrate: ## Run database migrations
	@echo "Running database migrations..."
	docker-compose exec backend alembic upgrade head

migrate-create: ## Create new migration (use: make migrate-create MESSAGE="description")
	@echo "Creating new migration..."
	docker-compose exec backend alembic revision --autogenerate -m "$(MESSAGE)"

migrate-rollback: ## Rollback last migration
	@echo "Rolling back last migration..."
	docker-compose exec backend alembic downgrade -1

migrate-history: ## Show migration history
	docker-compose exec backend alembic history

# Testing
test: ## Run all tests
	@echo "Running backend tests..."
	docker-compose exec backend python -m pytest tests/ -v

test-coverage: ## Run tests with coverage
	@echo "Running tests with coverage..."
	docker-compose exec backend python -m pytest tests/ --cov=app --cov-report=html

test-frontend: ## Run frontend tests
	@echo "Running frontend tests..."
	docker-compose exec frontend npm test

# Code quality
lint: ## Run linting for backend
	@echo "Running backend linting..."
	docker-compose exec backend flake8 app tests
	docker-compose exec backend mypy app

lint-frontend: ## Run linting for frontend
	@echo "Running frontend linting..."
	docker-compose exec frontend npm run lint

format: ## Format code
	@echo "Formatting backend code..."
	docker-compose exec backend black app tests
	docker-compose exec backend isort app tests
	@echo "Formatting frontend code..."
	docker-compose exec frontend npm run format

# Cleanup
clean: ## Clean up containers, volumes, and images
	@echo "Cleaning up..."
	docker-compose down -v --remove-orphans
	docker system prune -f

clean-all: ## Clean everything including images
	@echo "Cleaning everything..."
	docker-compose down -v --remove-orphans --rmi all
	docker system prune -af

# Backup and restore
backup-db: ## Backup database
	@echo "Creating database backup..."
	@mkdir -p database/backups
	docker-compose exec postgres pg_dump -U sepe_user sepe_comparator > database/backups/backup_$(shell date +%Y%m%d_%H%M%S).sql

restore-db: ## Restore database (use: make restore-db FILE=backup_file.sql)
	@echo "Restoring database from $(FILE)..."
	docker-compose exec -T postgres psql -U sepe_user -d sepe_comparator < database/backups/$(FILE)

# Production
prod-build: ## Build production images
	@echo "Building production images..."
	docker-compose -f docker-compose.yml build --no-cache

prod-up: ## Start production services
	@echo "Starting production services..."
	docker-compose -f docker-compose.yml up -d

# Health checks
health: ## Check service health
	@echo "Checking service health..."
	@echo "Backend API:"
	@curl -f http://localhost:8000/api/v1/health || echo "Backend not responding"
	@echo "\nFrontend:"
	@curl -f http://localhost:3000/health || echo "Frontend not responding"
	@echo "\nDatabase:"
	@docker-compose exec postgres pg_isready -U sepe_user -d sepe_comparator || echo "Database not ready"
	@echo "\nRedis:"
	@docker-compose exec redis redis-cli ping || echo "Redis not responding"

# Development utilities
reset: ## Reset development environment (clean + setup)
	@echo "Resetting development environment..."
	@make clean
	@make setup

install-hooks: ## Install pre-commit hooks
	@echo "Installing pre-commit hooks..."
	docker-compose exec backend pre-commit install

# Documentation
docs: ## Generate API documentation
	@echo "Generating API documentation..."
	@echo "API documentation available at: http://localhost:8000/docs"

# Quick start
quick-start: build up migrate ## Quick start: build, start services, and run migrations
	@echo "Quick start completed!"
	@echo "Frontend: http://localhost:3000"
	@echo "Backend API: http://localhost:8000"
	@echo "API Docs: http://localhost:8000/docs"
