# Makefile for SEPE Templates Comparator Backend

.PHONY: help install install-dev test test-cov lint format type-check clean run dev migrate upgrade downgrade shell

# Default target
help:
	@echo "Available commands:"
	@echo "  install      Install production dependencies"
	@echo "  install-dev  Install development dependencies"
	@echo "  test         Run tests"
	@echo "  test-cov     Run tests with coverage"
	@echo "  lint         Run linting (flake8)"
	@echo "  format       Format code (black, isort)"
	@echo "  type-check   Run type checking (mypy)"
	@echo "  clean        Clean cache files"
	@echo "  run          Run production server"
	@echo "  dev          Run development server"
	@echo "  migrate      Create new migration"
	@echo "  upgrade      Apply database migrations"
	@echo "  downgrade    Rollback last migration"
	@echo "  shell        Start interactive shell"

# Installation
install:
	pip install -r requirements.txt

install-dev:
	pip install -r requirements-dev.txt
	pre-commit install

# Testing
test:
	pytest

test-cov:
	pytest --cov=app --cov-report=term-missing --cov-report=html

test-watch:
	ptw --runner "pytest --cov=app"

# Code quality
lint:
	flake8 app tests

format:
	black app tests
	isort app tests

type-check:
	mypy app

check: lint type-check test

# Development
clean:
	find . -type d -name __pycache__ -delete
	find . -type f -name "*.pyc" -delete
	find . -type f -name "*.pyo" -delete
	find . -type d -name "*.egg-info" -exec rm -rf {} +
	rm -rf build/
	rm -rf dist/
	rm -rf .pytest_cache/
	rm -rf .mypy_cache/
	rm -rf htmlcov/
	rm -f .coverage

run:
	uvicorn app.main:app --host 0.0.0.0 --port 8000

dev:
	uvicorn app.main:app --reload --host 0.0.0.0 --port 8000

# Database
migrate:
	@read -p "Enter migration message: " message; \
	alembic revision --autogenerate -m "$$message"

upgrade:
	alembic upgrade head

downgrade:
	alembic downgrade -1

# Utilities
shell:
	python -c "from app.core.database import SessionLocal; from app.models import *; db = SessionLocal(); print('Database session available as db')"

# Docker
docker-build:
	docker build -t sepe-comparator-backend .

docker-run:
	docker run -p 8000:8000 sepe-comparator-backend

# Pre-commit
pre-commit-run:
	pre-commit run --all-files

pre-commit-update:
	pre-commit autoupdate
