.PHONY: build up down test test-infra test-unit test-integration test-storage shell clean

# Start services (database)
up:
	docker-compose up -d db

# Stop all services (without removing volumes)
down:
	docker-compose down

# Build Docker images
build:
	docker-compose build

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

# Clean up containers and volumes
clean:
	docker-compose down -v
	docker system prune -f

# Help command
help:
	@echo "Available commands:"
	@echo "  make build        - Build Docker images"
	@echo "  make test         - Run all tests"
	@echo "  make test-infra   - Run integration tests only"
	@echo "  make test-unit    - Run unit tests only"
	@echo "  make test-storage - Run storage infrastructure test"
	@echo "  make shell        - Open shell in backend container"
	@echo "  make clean        - Clean up containers and volumes"
