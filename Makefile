.PHONY: build build-prod up up-all down init-db test test-all test-infra test-unit test-integration test-storage shell clean front-install test-front front-shell front-dev help

# ===== DOCKER LIFECYCLE =====

# Build Docker images (dev targets)
build:
	docker compose build

# Build production images
build-prod:
	docker build --target prod -t sf-pm-backend:prod --file src/backend/Dockerfile src/backend
	docker build --target prod -t sf-pm-frontend:prod --file src/frontend/Dockerfile src/frontend

# Start services (database + backend)
up:
	docker compose up -d db

# Start all services
up-all:
	docker compose up -d

# Stop all services (without removing volumes)
down:
	docker compose down

# Clean up containers and volumes
clean:
	docker compose down -v
	docker system prune -f

# ===== BACKEND COMMANDS =====

# Initialize database infrastructure (create buckets, policies)
init-db:
	docker compose run --rm backend python /app/infra/init_db.py

# Setup events table for T-004-BACK (automated via psycopg2)
setup-events:
	docker compose run --rm backend python /app/infra/setup_events_table.py

# Run all tests inside Docker (backend + agent)
test:
	@echo "🧪 Running backend tests..."
	docker compose run --rm backend pytest -v || true
	@echo "🤖 Running agent tests..."
	docker compose run --rm agent-worker python -m pytest tests/unit/ tests/integration/test_user_strings_e2e.py tests/integration/test_validate_file_task.py --ignore=tests/unit/test_validation_report_service.py -v

# Run only agent tests (unit + agent-specific integration)
# Note: Excludes backend-specific unit tests (test_validation_report_service.py)
test-agent:
	docker compose run --rm agent-worker python -m pytest tests/unit/ tests/integration/test_user_strings_e2e.py tests/integration/test_validate_file_task.py --ignore=tests/unit/test_validation_report_service.py -v

# Run only integration tests (backend)
test-infra:
	docker compose run --rm backend pytest tests/integration/ -v

# Run only unit tests (backend)
test-unit:
	docker compose run --rm backend pytest tests/unit/ -v

# Run specific integration test
test-storage:
	docker compose run --rm backend pytest tests/integration/test_storage_config.py -v

# Open a shell inside the backend container
shell:
	docker compose run --rm backend /bin/sh

# ===== FRONTEND COMMANDS =====

# Start frontend dev server
front-dev:
	docker compose up frontend

# Install frontend dependencies inside Docker
front-install:
	docker compose run --rm frontend npm install

# Run frontend tests (TDD workflow)
test-front:
	docker compose run --rm frontend bash -c "npm install && npm test"

# Open a shell inside the frontend container
front-shell:
	docker compose run --rm frontend /bin/sh

# ===== TEST PROFILES (isolated test containers) =====

# Run all tests via profile containers (backend + frontend)
test-all:
	docker compose --profile test run --rm test-backend
	docker compose --profile test run --rm test-frontend

# ===== HELP =====

help:
	@echo "Available commands:"
	@echo ""
	@echo "  Docker lifecycle:"
	@echo "    make build         - Build Docker images (dev)"
	@echo "    make build-prod    - Build production images"
	@echo "    make up            - Start database service"
	@echo "    make up-all        - Start all services"
	@echo "    make down          - Stop all services"
	@echo "    make clean         - Stop + remove volumes + prune"
	@echo ""
	@echo "  Backend:"
	@echo "    make init-db       - Initialize DB infrastructure (buckets, policies)"
	@echo "    make setup-events  - Create events table in Supabase (T-004-BACK)"
	@echo "    make test          - Run all tests (backend + agent)"
	@echo "    make test-agent    - Run agent tests only"
	@echo "    make test-unit     - Run backend unit tests only"
	@echo "    make test-infra    - Run backend integration tests only"
	@echo "    make test-storage  - Run storage infrastructure test"
	@echo "    make shell         - Open shell in backend container"
	@echo ""
	@echo "  Frontend:"
	@echo "    make front-dev     - Start frontend dev server (Vite)"
	@echo "    make front-install - Install frontend dependencies (npm install)"
	@echo "    make test-front    - Run frontend tests (Vitest)"
	@echo "    make front-shell   - Open shell in frontend container"
	@echo ""
	@echo "  Test profiles:"
	@echo "    make test-all      - Run all tests via isolated profile containers"
