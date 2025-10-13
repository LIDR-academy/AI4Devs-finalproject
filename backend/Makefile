# Makefile for Database Management
# 
# This Makefile provides convenient commands for common database operations
# using Alembic migrations and the database initialization script.
#
# Requirements:
# - Python virtual environment activated
# - Alembic configured (alembic.ini)
# - Database configuration in .env file

.PHONY: help db-init db-migrate db-upgrade db-downgrade db-reset db-current db-history

# Default target - show help
help:
	@echo "Database Management Commands:"
	@echo ""
	@echo "  make db-init         Initialize database and run all migrations"
	@echo "  make db-migrate      Create a new migration (requires MESSAGE variable)"
	@echo "  make db-upgrade      Apply all pending migrations"
	@echo "  make db-downgrade    Rollback the last migration"
	@echo "  make db-reset        Drop database and recreate from scratch (DESTRUCTIVE)"
	@echo "  make db-current      Show current migration version"
	@echo "  make db-history      Show migration history"
	@echo ""
	@echo "Examples:"
	@echo "  make db-init"
	@echo "  make db-migrate MESSAGE='add users table'"
	@echo "  make db-upgrade"
	@echo "  make db-downgrade"
	@echo "  make db-reset"
	@echo ""

# Initialize database and run all migrations
# This is idempotent and safe to run multiple times
db-init:
	@echo "Initializing database..."
	@python -m app.scripts.init_db
	@echo "Database initialization complete!"

# Create a new migration with autogenerate
# Usage: make db-migrate MESSAGE="description of changes"
db-migrate:
	@if [ -z "$(MESSAGE)" ]; then \
		echo "Error: MESSAGE is required"; \
		echo "Usage: make db-migrate MESSAGE='description of changes'"; \
		exit 1; \
	fi
	@echo "Creating new migration: $(MESSAGE)"
	@alembic revision --autogenerate -m "$(MESSAGE)"
	@echo "Migration created successfully!"
	@echo "Review the migration file in alembic/versions/ before applying."

# Apply all pending migrations to head
db-upgrade:
	@echo "Applying pending migrations..."
	@alembic upgrade head
	@echo "Migrations applied successfully!"

# Rollback the last migration
# Note: This moves down one revision
db-downgrade:
	@echo "Rolling back last migration..."
	@alembic downgrade -1
	@echo "Migration rolled back successfully!"

# Reset database - drop and recreate from scratch
# DESTRUCTIVE OPERATION - requires confirmation
db-reset:
	@echo "⚠️  WARNING: This will DELETE ALL DATA in the database!"
	@echo "⚠️  This operation is IRREVERSIBLE!"
	@echo ""
	@read -p "Are you sure you want to continue? Type 'yes' to confirm: " confirm; \
	if [ "$$confirm" = "yes" ]; then \
		echo "Resetting database..."; \
		rm -f app.db; \
		echo "Database file deleted."; \
		echo "Running migrations..."; \
		alembic upgrade head; \
		echo "Database reset complete!"; \
	else \
		echo "Database reset cancelled."; \
	fi

# Show current migration version
db-current:
	@echo "Current database migration version:"
	@alembic current

# Show migration history
db-history:
	@echo "Migration history:"
	@alembic history --verbose

