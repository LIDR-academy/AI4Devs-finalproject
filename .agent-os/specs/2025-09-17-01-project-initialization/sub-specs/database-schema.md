# Database Schema

This is the database schema implementation for the spec detailed in @.agent-os/specs/2025-09-17-project-initialization/spec.md

## Database Changes

### Initial Schema Setup
- Create PostgreSQL database with proper user permissions and connection configuration
- Set up Alembic migration system with initial migration structure
- Configure database connection pooling and session management
- Create base table structure with common fields (id, created_at, updated_at)

### Core Tables Structure
- **users** - Basic user authentication and profile information
- **pdf_templates** - Storage metadata for uploaded PDF templates
- **template_versions** - Version history tracking for template changes
- **comparisons** - Comparison results and metadata between templates
- **comparison_fields** - Detailed field-level comparison results

## Database Schema Specifications

### Users Table
```sql
CREATE TABLE users (
    id SERIAL PRIMARY KEY,
    email VARCHAR(255) UNIQUE NOT NULL,
    hashed_password VARCHAR(255) NOT NULL,
    full_name VARCHAR(255),
    is_active BOOLEAN DEFAULT true,
    is_superuser BOOLEAN DEFAULT false,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_users_email ON users(email);
CREATE INDEX idx_users_active ON users(is_active);
```

### PDF Templates Table
```sql
CREATE TABLE pdf_templates (
    id SERIAL PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    version VARCHAR(50) NOT NULL,
    file_path VARCHAR(500) NOT NULL,
    file_size_bytes INTEGER NOT NULL,
    field_count INTEGER DEFAULT 0,
    sepe_url VARCHAR(1000),
    uploaded_by INTEGER REFERENCES users(id),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_templates_name ON pdf_templates(name);
CREATE INDEX idx_templates_version ON pdf_templates(version);
CREATE INDEX idx_templates_created ON pdf_templates(created_at);
```

### Template Versions Table
```sql
CREATE TABLE template_versions (
    id SERIAL PRIMARY KEY,
    template_id INTEGER REFERENCES pdf_templates(id) ON DELETE CASCADE,
    version_number VARCHAR(50) NOT NULL,
    change_summary TEXT,
    is_current BOOLEAN DEFAULT false,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_versions_template ON template_versions(template_id);
CREATE INDEX idx_versions_current ON template_versions(is_current);
```

### Comparisons Table
```sql
CREATE TABLE comparisons (
    id SERIAL PRIMARY KEY,
    source_template_id INTEGER REFERENCES pdf_templates(id),
    target_template_id INTEGER REFERENCES pdf_templates(id),
    comparison_type VARCHAR(50) DEFAULT 'structure',
    status VARCHAR(50) DEFAULT 'pending',
    differences_count INTEGER DEFAULT 0,
    created_by INTEGER REFERENCES users(id),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    completed_at TIMESTAMP WITH TIME ZONE
);

CREATE INDEX idx_comparisons_source ON comparisons(source_template_id);
CREATE INDEX idx_comparisons_target ON comparisons(target_template_id);
CREATE INDEX idx_comparisons_status ON comparisons(status);
```

### Comparison Fields Table
```sql
CREATE TABLE comparison_fields (
    id SERIAL PRIMARY KEY,
    comparison_id INTEGER REFERENCES comparisons(id) ON DELETE CASCADE,
    field_name VARCHAR(255) NOT NULL,
    field_type VARCHAR(100),
    change_type VARCHAR(50), -- 'added', 'removed', 'modified', 'unchanged'
    old_value TEXT,
    new_value TEXT,
    position_x FLOAT,
    position_y FLOAT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_comparison_fields_comparison ON comparison_fields(comparison_id);
CREATE INDEX idx_comparison_fields_type ON comparison_fields(change_type);
```

## Migration Configuration

### Alembic Setup
- Initialize Alembic with proper configuration for PostgreSQL
- Create migration template with automatic timestamp and description
- Configure migration environment with database URL from environment variables
- Set up migration naming convention: `{timestamp}_{description}`

### Initial Migration
```python
"""Initial database schema

Revision ID: 001_initial_schema
Revises: 
Create Date: 2025-09-17

"""
from alembic import op
import sqlalchemy as sa
from sqlalchemy.dialects import postgresql

# Migration implementation with all table creations
# and index definitions as specified above
```

## Rationale

### Design Decisions
- **Serial Primary Keys**: Using PostgreSQL SERIAL for auto-incrementing primary keys provides better performance than UUIDs for this use case
- **Timestamp with Time Zone**: All timestamp fields use timezone-aware timestamps for proper handling across different environments
- **Cascading Deletes**: Template versions and comparison fields use CASCADE delete to maintain referential integrity
- **Indexing Strategy**: Indexes on frequently queried fields (email, template names, comparison status) to optimize query performance

### Performance Considerations
- **Connection Pooling**: SQLAlchemy connection pooling configured for optimal database connection management
- **Query Optimization**: Foreign key indexes and composite indexes for common query patterns
- **Data Integrity**: Foreign key constraints ensure data consistency while allowing for efficient queries

### Data Integrity Rules
- **User Authentication**: Email uniqueness constraint with proper password hashing
- **Template Versioning**: One current version per template with proper version tracking
- **Comparison Tracking**: Complete audit trail of all comparison operations with user attribution
- **Field Change Tracking**: Detailed field-level change tracking for comprehensive comparison analysis
