# US0.4: Database Setup and Migration System - Task Breakdown

**Epic**: [AI4DFP-1 - Development Environment & Project Scaffolding](https://joangarme.atlassian.net/browse/AI4DFP-1)
**Jira Story**: [AI4DFP-32](https://joangarme.atlassian.net/browse/AI4DFP-32)

## User Story

**As a** developer,  
**I want** SQLite database with migration system configured,  
**So that** I can manage database schema changes systematically.

## Acceptance Criteria

- SQLite database initialized
- Alembic migration system configured
- Initial migration created
- Database connection properly configured
- Connection pooling set up
- Basic health check endpoint confirms DB connection
- Migration commands documented
- Database backup strategy implemented

## Task Breakdown

### Task ID: US0.4-T1

**Jira**: [AI4DFP-33](https://joangarme.atlassian.net/browse/AI4DFP-33)  
**Type**: [DevOps]  
**Title**: Install and configure Alembic for database migrations  
**Story Points**: 0.5  
**Dependencies**: None (requires US0.2 completed)

#### Description

**What**: Install Alembic and create initial migration configuration  
**Input**: Existing FastAPI project structure with SQLAlchemy installed  
**Output**: Alembic initialized with configuration files and directory structure  
**Boundary**: Only Alembic setup, no database models or migrations created yet

#### Acceptance Criteria

- [ ] Alembic installed and added to requirements.txt
- [ ] `alembic init alembic` executed successfully
- [ ] alembic.ini configured with SQLite connection string
- [ ] alembic/env.py configured to use app's Base metadata
- [ ] Migration directory structure created

#### Testing Requirements

- [ ] Test `alembic --version` shows correct version
- [ ] Verify alembic.ini has correct database URL pattern
- [ ] Test `alembic current` executes without errors
- [ ] Confirm alembic/versions directory exists
- [ ] Validate env.py imports work correctly

#### Technical Notes

- Use relative path for SQLite database file (e.g., `sqlite:///./app.db`)
- Configure env.py to import models' Base for autogenerate support
- Set `sqlalchemy.url` in alembic.ini to use environment variable
- Add alembic/ directory to git, but exclude \*.pyc files

---

### Task ID: US0.4-T2

**Jira**: [AI4DFP-34](https://joangarme.atlassian.net/browse/AI4DFP-34)  
**Type**: [Backend]  
**Title**: Create database configuration module  
**Story Points**: 1  
**Dependencies**: US0.4-T1

#### Description

**What**: Implement database connection configuration with SQLAlchemy  
**Input**: Alembic configuration and core/config.py  
**Output**: Database module with engine, session, and connection management  
**Boundary**: Configuration only, no models or actual database operations

#### Acceptance Criteria

- [ ] Database configuration in core/database.py
- [ ] SQLAlchemy engine created with proper settings
- [ ] SessionLocal factory configured
- [ ] Declarative Base created for models
- [ ] Database URL loaded from environment variables
- [ ] Connection pooling configured appropriately for SQLite

#### Testing Requirements

- [ ] Test database engine creation succeeds
- [ ] Verify session factory creates valid sessions
- [ ] Test connection with valid database URL
- [ ] Test error handling for invalid database URLs
- [ ] Verify Base metadata is accessible
- [ ] Test session cleanup/disposal works correctly

#### Technical Notes

```python
# core/database.py structure:
# - SQLALCHEMY_DATABASE_URL from settings
# - engine with connect_args for SQLite
# - SessionLocal with autocommit=False, autoflush=False
# - Base = declarative_base()
# - get_db() dependency for FastAPI
```

- SQLite requires `connect_args={"check_same_thread": False}`
- Use scoped_session for thread safety if needed
- Implement get_db() as FastAPI dependency

---

### Task ID: US0.4-T3

**Jira**: [AI4DFP-35](https://joangarme.atlassian.net/browse/AI4DFP-35)  
**Type**: [Database]  
**Title**: Create initial database migration  
**Story Points**: 0.5  
**Dependencies**: US0.4-T2

#### Description

**What**: Generate and verify initial Alembic migration for database schema  
**Input**: Database configuration with Base metadata  
**Output**: Initial migration file in alembic/versions/  
**Boundary**: Empty migration (no models yet), just establishes migration baseline

#### Acceptance Criteria

- [ ] Initial migration generated with descriptive name
- [ ] Migration file contains upgrade() and downgrade() functions
- [ ] Migration can be applied successfully
- [ ] Migration can be rolled back successfully
- [ ] Alembic version table created in database

#### Testing Requirements

- [ ] Test `alembic upgrade head` executes without errors
- [ ] Verify alembic_version table exists in database
- [ ] Test `alembic downgrade base` removes version table
- [ ] Test `alembic history` shows migration
- [ ] Validate migration file syntax is correct

#### Technical Notes

- Use: `alembic revision -m "Initial migration"`
- Even if empty, this establishes the baseline
- Document migration commands in README
- Consider using autogenerate when models exist: `alembic revision --autogenerate -m "message"`

---

### Task ID: US0.4-T4

**Jira**: [AI4DFP-36](https://joangarme.atlassian.net/browse/AI4DFP-36)  
**Type**: [Backend]  
**Title**: Implement database dependency injection  
**Story Points**: 0.5  
**Dependencies**: US0.4-T2

#### Description

**What**: Create FastAPI dependency for database session management  
**Input**: SessionLocal and database configuration  
**Output**: get_db() dependency function integrated with FastAPI  
**Boundary**: Only dependency setup, no endpoints using it yet

#### Acceptance Criteria

- [ ] get_db() function properly yields database sessions
- [ ] Session cleanup handled with try/finally
- [ ] Dependency can be injected into route handlers
- [ ] Sessions properly closed after request
- [ ] Type hints provided for IDE support

#### Testing Requirements

- [ ] Test get_db() yields valid session
- [ ] Verify session closes after use
- [ ] Test exception handling doesn't leak connections
- [ ] Confirm multiple calls create separate sessions
- [ ] Test with FastAPI TestClient

#### Technical Notes

```python
def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()
```

- Use as FastAPI Depends: `db: Session = Depends(get_db)`
- Add proper type hints for Session
- Document usage pattern for new endpoints

---

### Task ID: US0.4-T5

**Jira**: [AI4DFP-37](https://joangarme.atlassian.net/browse/AI4DFP-37)  
**Type**: [Backend]  
**Title**: Create database health check endpoint  
**Story Points**: 1  
**Dependencies**: US0.4-T4

#### Description

**What**: Implement /health/db endpoint to verify database connectivity  
**Input**: Database dependency and existing /health endpoint  
**Output**: New endpoint that tests actual database connection  
**Boundary**: Health check only, no complex queries or business logic

#### Acceptance Criteria

- [ ] /health/db endpoint returns 200 when DB is accessible
- [ ] Endpoint executes simple query to verify connection
- [ ] Returns appropriate error status if DB unavailable
- [ ] Response includes database status information
- [ ] Endpoint documented in OpenAPI/Swagger

#### Testing Requirements

- [ ] Test successful connection returns 200
- [ ] Test response format is correct
- [ ] Test endpoint with database unavailable (returns 503)
- [ ] Verify query executes quickly (< 1 second)
- [ ] Test endpoint doesn't leak connections
- [ ] Integration test with real database

#### Technical Notes

```python
@app.get("/health/db")
async def health_check_db(db: Session = Depends(get_db)):
    # Execute simple query: db.execute("SELECT 1")
    # Return status with connection info
```

- Use simple SELECT 1 or equivalent
- Catch database exceptions appropriately
- Return 503 Service Unavailable if DB is down
- Include in existing health check structure

---

### Task ID: US0.4-T6

**Jira**: [AI4DFP-38](https://joangarme.atlassian.net/browse/AI4DFP-38)  
**Type**: [Backend]  
**Title**: Implement database initialization script  
**Story Points**: 0.5  
**Dependencies**: US0.4-T3

#### Description

**What**: Create script to initialize database and run migrations  
**Input**: Alembic configuration and migrations  
**Output**: init_db.py script that sets up database from scratch  
**Boundary**: Initialization only, no seed data or fixtures

#### Acceptance Criteria

- [ ] Script creates database file if it doesn't exist
- [ ] Script runs all pending migrations
- [ ] Script verifies successful initialization
- [ ] Script has proper error handling
- [ ] Script documented with usage instructions

#### Testing Requirements

- [ ] Test script on non-existent database
- [ ] Test script on existing database (idempotent)
- [ ] Verify all migrations applied correctly
- [ ] Test error handling for failed migrations
- [ ] Test script can be run multiple times safely

#### Technical Notes

```python
# app/scripts/init_db.py or similar
# - Check if DB exists
# - Run alembic upgrade head
# - Verify connection
# - Log results
```

- Can be imported or run as script
- Include in project setup documentation
- Consider adding to Makefile or package scripts

---

### Task ID: US0.4-T7

**Jira**: [AI4DFP-39](https://joangarme.atlassian.net/browse/AI4DFP-39)  
**Type**: [DevOps]  
**Title**: Create database management scripts and commands  
**Story Points**: 0.5  
**Dependencies**: US0.4-T6

#### Description

**What**: Create helper scripts/Makefile targets for common database operations  
**Input**: Working database and migration setup  
**Output**: Convenient commands for database management tasks  
**Boundary**: Command wrappers only, no new functionality

#### Acceptance Criteria

- [ ] Script/command to reset database (drop and recreate)
- [ ] Script/command to create new migration
- [ ] Script/command to apply migrations
- [ ] Script/command to rollback last migration
- [ ] All commands documented in README

#### Testing Requirements

- [ ] Test each command executes correctly
- [ ] Verify reset command fully clears database
- [ ] Test migration creation with autogenerate
- [ ] Test rollback maintains data integrity
- [ ] Validate documentation is accurate

#### Technical Notes

```makefile
# Makefile examples:
db-init: # Initialize database
db-migrate: # Create new migration
db-upgrade: # Apply migrations
db-downgrade: # Rollback migration
db-reset: # Drop and recreate
```

- Use Makefile or shell scripts based on preference
- Include safety confirmations for destructive operations
- Document all parameters and options

---

### Task ID: US0.4-T8

**Jira**: [AI4DFP-40](https://joangarme.atlassian.net/browse/AI4DFP-40)  
**Type**: [Documentation]  
**Title**: Document database backup and recovery strategy  
**Story Points**: 0.5  
**Dependencies**: US0.4-T7

#### Description

**What**: Create documentation for database backup and recovery procedures  
**Input**: Working database setup and SQLite file location  
**Output**: Documentation of backup strategy and recovery steps  
**Boundary**: Documentation only, no automated backup implementation

#### Acceptance Criteria

- [ ] Backup strategy documented (manual for development)
- [ ] SQLite file backup procedure explained
- [ ] Recovery steps documented with examples
- [ ] Migration history backup strategy included
- [ ] Document location of database file
- [ ] Include in main README or separate DB docs

#### Testing Requirements

- [ ] Verify backup procedure actually works
- [ ] Test recovery from backup file
- [ ] Validate migration state after recovery
- [ ] Test documentation on clean environment
- [ ] Confirm all file paths are correct

#### Technical Notes

- For SQLite: Simple file copy for backup
- Document location: backend/app.db (or configured path)
- Include both database file and alembic version
- For production, recommend automated backup solutions
- Consider adding .db files to .gitignore
- Mention version control for migrations (already in git)

---

### Task ID: US0.4-T9

**Jira**: [AI4DFP-41](https://joangarme.atlassian.net/browse/AI4DFP-41)  
**Type**: [Backend]  
**Title**: Add database configuration to environment variables  
**Story Points**: 0.5  
**Dependencies**: US0.4-T2

#### Description

**What**: Update configuration files to include all database settings  
**Input**: Existing core/config.py with Pydantic Settings  
**Output**: Complete database configuration in environment system  
**Boundary**: Configuration only, no database code changes

#### Acceptance Criteria

- [ ] DATABASE_URL added to Settings class
- [ ] Database configuration in .env.example
- [ ] Default values for development provided
- [ ] Documentation updated with DB env vars
- [ ] Type hints and validation for DB settings

#### Testing Requirements

- [ ] Test DATABASE_URL loads from environment
- [ ] Verify .env file overrides work
- [ ] Test default SQLite path is valid
- [ ] Confirm validation catches invalid URLs
- [ ] Test with different database URL formats

#### Technical Notes

```python
# core/config.py additions:
DATABASE_URL: str = "sqlite:///./app.db"
DB_ECHO: bool = False  # SQLAlchemy echo
```

- Add to .env.example with explanation
- Support both relative and absolute paths
- Document URL format for SQLite
- Consider adding DB_ECHO for debugging

---

## Summary

**Total Story Points**: 6 (reasonable for database setup complexity)

**Sequence**: Tasks build incrementally:

1. Alembic setup (T1) → 2. DB config (T2) → 3. Initial migration (T3) / Dependency injection (T4) → 5. Health endpoint (T5) / Init script (T6) → 7. Management scripts (T7) → 8. Backup docs (T8)
2. Environment config (T9) can be done parallel with T2

**Key Outcomes**:

- Complete database and migration infrastructure
- All acceptance criteria from user story satisfied
- Database health monitoring in place
- Developer-friendly management commands
- Clear documentation for database operations
- Foundation ready for creating actual data models

**Next Steps**: After completing these tasks, the database infrastructure will be ready for implementing actual data models for user management (Epic 1) and transactions (Epic 2).
