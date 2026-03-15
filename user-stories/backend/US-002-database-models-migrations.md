# US-002: Database Models and Migrations

## Description
As a **developer**, I want to define the database models using SQLModel and configure Alembic for migrations, so that the application has a robust data layer with version-controlled schema changes.

## Priority
🔴 **Critical** - Required for all data operations.

## Difficulty
⭐⭐ Medium

## Acceptance Criteria
- [ ] User model is created with all required fields (id, email, password_hash, api_key, is_active, created_at, updated_at, is_admin, last_renewed_at, usage_count, is_deleted)
- [ ] File model is created with all required fields (id, cid, user_id, original_filename, safe_filename, size, pinned, uploaded_at)
- [ ] AuditLog model is created with all required fields (id, user_id, action, timestamp, details)
- [ ] Foreign key relationships are properly defined
- [ ] Alembic is configured for database migrations
- [ ] Initial migration script is generated
- [ ] Database connection pooling is configured for optimal performance
- [ ] Models include proper indexes for frequently queried fields
- [ ] Soft delete is implemented for User model

## Technical Notes
- Use SQLModel which combines SQLAlchemy and Pydantic
- Configure PostgreSQL as the database backend
- Use UUID for primary keys where appropriate
- Implement timestamps using arrow library
- Connection string: `postgresql+psycopg2://user:pass@localhost:5432/ipfs_gateway`

## Dependencies
- US-001: Project Setup and Configuration

## Estimated Effort
6 hours

## Completion Status
- [ ] 0% - Not Started

## Workflow Diagram
```mermaid
flowchart TD
    A[Start] --> B[Define User Model]
    B --> C[Define File Model]
    C --> D[Define AuditLog Model]
    D --> E[Configure Relationships]
    E --> F[Add Indexes]
    F --> G[Configure Alembic]
    G --> H[Generate Initial Migration]
    H --> I[Test Migration Up/Down]
    I --> J[Document Migration Commands]
    J --> K[End]
```

## Data Model Diagram
```mermaid
erDiagram
    USER {
        int id PK
        string email UK
        string password_hash
        string api_key UK
        boolean is_active
        datetime created_at
        datetime updated_at
        boolean is_admin
        datetime last_renewed_at
        int usage_count
        boolean is_deleted
    }
    FILE {
        int id PK
        string cid UK
        int user_id FK
        string original_filename
        string safe_filename
        int size
        boolean pinned
        datetime uploaded_at
    }
    AUDITLOG {
        int id PK
        int user_id FK
        string action
        datetime timestamp
        text details
    }
    USER ||--o{ FILE : uploads
    USER ||--o{ AUDITLOG : generates
```

## Related Tasks
- TASK-US-002-01-create-user-model.md
- TASK-US-002-02-create-file-model.md
- TASK-US-002-03-create-auditlog-model.md
- TASK-US-002-04-configure-alembic.md
- TASK-US-002-05-create-initial-migration.md
