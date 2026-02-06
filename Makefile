.PHONY: build up down init-db test test-infra test-unit test-integration test-storage shell clean front-install test-front front-shell front-dev

# Start services (database)
up:
	docker-compose up -d db

# Start frontend dev server
front-dev:
	docker-compose up frontend

# Stop all services (without removing volumes)
down:
	docker-compose down

# Build Docker images
build:
	docker-compose build

# Initialize database infrastructure (create buckets, policies)
init-db:
	docker-compose run --rm backend python /app/infra/init_db.py

# Run all tests inside Docker
test:
	docker-compose run --rm backend pytest -v

# Run only integration tests
test-infra:
	docker-compose run --rm backend pytest tests/integration/ -v

# Run only unit tests (when we have them)
test-unit:
	docker-compose run --rm backend pytest tests/unit/ -v

# Run specific integration test (e.g., make test-storage)
test-storage:
	docker-compose run --rm backend pytest tests/integration/test_storage_config.py -v

# Open a shell inside the backend container
shell:
	docker-compose run --rm backend /bin/sh

# ===== FRONTEND COMMANDS =====

# Install frontend dependencies inside Docker
front-install:
	docker-compose run --rm frontend npm install

# Run frontend tests (TDD workflow)
test-front:
	docker-compose run --rm frontend npm test

# Open a shell inside the frontend container
front-shell:
	docker-compose run --rm frontend /bin/sh

# Clean up containers and volumes
clean:
	docker-compose down -v
	docker system prune -f

# Help command
help:
	@echo "Available commands:"
	@echo "  make build         - Build Docker images"
	@echo "  make init-db       - Initialize database infrastructure (buckets, policies)"
	@echo "  make test          - Run all backend tests"
	@echo "  make test-infra    - Run integration tests only"
	@echo "  make test-unit     - Run unit tests only"
	@echo "  make test-storage  - Run storage infrastructure test"
	@echo "  make shell         - Open shell in backend container"
	@echo "  make front-install - Install frontend dependencies (npm install)"
	@echo "  make test-front    - Run frontend tests (Vitest)"
	@echo "  make front-shell   - Open shell in frontend container"
	@echo "  make front-dev     - Start frontend dev server (Vite)"
	@echo "  make clean         - Clean up containers and volumes"
