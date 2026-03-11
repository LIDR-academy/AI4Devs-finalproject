# Database Schema

This is the database schema implementation for the spec detailed in @.agent-os/specs/2025-10-26-01-database-version-refactor/spec.md

## Schema Changes Overview

This refactoring moves version-specific attributes from the parent `pdf_templates` table to the `template_versions` table to implement proper version atomicity. Each version will have its own complete set of metadata, ensuring historical accuracy and preventing data inconsistencies.

## Table: pdf_templates

### Modified Columns

| Column Name       | Type        | Constraints       | Change Type | Description                                                   |
| ----------------- | ----------- | ----------------- | ----------- | ------------------------------------------------------------- |
| `current_version` | VARCHAR(50) | NOT NULL, INDEXED | RENAMED     | Previously `version`. Indicates the active version identifier |
| `comment`         | TEXT        | NULL              | NEW         | Administrative notes or comments about the template           |

### Removed Columns

| Column Name       | Type          | Migration Target                             | Reason                                                    |
| ----------------- | ------------- | -------------------------------------------- | --------------------------------------------------------- |
| `file_path`       | VARCHAR(500)  | Moved to `template_versions.file_path`       | Version-specific: Each version has its own PDF file       |
| `file_size_bytes` | INTEGER       | Moved to `template_versions.file_size_bytes` | Version-specific: File size varies per version            |
| `field_count`     | INTEGER       | Moved to `template_versions.field_count`     | Version-specific: Field count may change between versions |
| `sepe_url`        | VARCHAR(1000) | Moved to `template_versions.sepe_url`        | Version-specific: SEPE URL may differ per version         |

### Retained Columns (Unchanged)

| Column Name   | Type                     | Constraints                      | Description                            |
| ------------- | ------------------------ | -------------------------------- | -------------------------------------- |
| `id`          | INTEGER                  | PRIMARY KEY                      | Template unique identifier             |
| `name`        | VARCHAR(255)             | NOT NULL, INDEXED                | Template name (shared across versions) |
| `uploaded_by` | INTEGER                  | FOREIGN KEY (users.id), NULL     | User who uploaded the template         |
| `created_at`  | TIMESTAMP WITH TIME ZONE | NOT NULL, DEFAULT NOW(), INDEXED | Template creation timestamp            |
| `updated_at`  | TIMESTAMP WITH TIME ZONE | NULL, ON UPDATE NOW()            | Last update timestamp                  |

### Final Schema for pdf_templates

```sql
CREATE TABLE pdf_templates (
    id SERIAL PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    current_version VARCHAR(50) NOT NULL,
    comment TEXT NULL,
    uploaded_by INTEGER NULL REFERENCES users(id),
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE NULL
);

CREATE INDEX idx_pdf_templates_name ON pdf_templates(name);
CREATE INDEX idx_pdf_templates_current_version ON pdf_templates(current_version);
CREATE INDEX idx_pdf_templates_created_at ON pdf_templates(created_at);
```

## Table: template_versions

### New Columns

| Column Name       | Type          | Constraints         | Source                                     | Description                               |
| ----------------- | ------------- | ------------------- | ------------------------------------------ | ----------------------------------------- |
| `file_path`       | VARCHAR(500)  | NOT NULL            | Moved from `pdf_templates.file_path`       | Path to the PDF file for this version     |
| `file_size_bytes` | INTEGER       | NOT NULL            | Moved from `pdf_templates.file_size_bytes` | Size of the PDF file in bytes             |
| `field_count`     | INTEGER       | NOT NULL, DEFAULT 0 | Moved from `pdf_templates.field_count`     | Number of AcroForm fields in this version |
| `sepe_url`        | VARCHAR(1000) | NULL                | Moved from `pdf_templates.sepe_url`        | SEPE website URL for this version         |

### Retained Columns (Unchanged)

| Column Name         | Type                     | Constraints                                       | Description                                    |
| ------------------- | ------------------------ | ------------------------------------------------- | ---------------------------------------------- |
| `id`                | INTEGER                  | PRIMARY KEY                                       | Version unique identifier                      |
| `template_id`       | INTEGER                  | FOREIGN KEY (pdf_templates.id), NOT NULL, INDEXED | Reference to parent template                   |
| `version_number`    | VARCHAR(50)              | NOT NULL                                          | Version number/identifier (e.g., "1.0", "2.0") |
| `change_summary`    | TEXT                     | NULL                                              | Description of changes in this version         |
| `is_current`        | BOOLEAN                  | NOT NULL, DEFAULT FALSE, INDEXED                  | Whether this is the active version             |
| `created_at`        | TIMESTAMP WITH TIME ZONE | NOT NULL, DEFAULT NOW()                           | Version creation timestamp                     |
| `title`             | VARCHAR(255)             | NULL                                              | PDF document title metadata                    |
| `author`            | VARCHAR(255)             | NULL                                              | PDF document author metadata                   |
| `subject`           | VARCHAR(255)             | NULL                                              | PDF document subject metadata                  |
| `creation_date`     | TIMESTAMP WITH TIME ZONE | NULL                                              | PDF document creation date                     |
| `modification_date` | TIMESTAMP WITH TIME ZONE | NULL                                              | PDF document modification date                 |
| `page_count`        | INTEGER                  | NOT NULL, DEFAULT 0                               | Number of pages in the PDF                     |

### Final Schema for template_versions

```sql
CREATE TABLE template_versions (
    id SERIAL PRIMARY KEY,
    template_id INTEGER NOT NULL REFERENCES pdf_templates(id) ON DELETE CASCADE,
    version_number VARCHAR(50) NOT NULL,
    file_path VARCHAR(500) NOT NULL,
    file_size_bytes INTEGER NOT NULL,
    field_count INTEGER NOT NULL DEFAULT 0,
    sepe_url VARCHAR(1000) NULL,
    change_summary TEXT NULL,
    is_current BOOLEAN NOT NULL DEFAULT FALSE,
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
    title VARCHAR(255) NULL,
    author VARCHAR(255) NULL,
    subject VARCHAR(255) NULL,
    creation_date TIMESTAMP WITH TIME ZONE NULL,
    modification_date TIMESTAMP WITH TIME ZONE NULL,
    page_count INTEGER NOT NULL DEFAULT 0
);

CREATE INDEX idx_template_versions_template_id ON template_versions(template_id);
CREATE INDEX idx_template_versions_is_current ON template_versions(is_current);
```

## Table: template_fields

### Changes

**No changes required.** This table maintains its foreign key relationship to `template_versions.id` and is unaffected by the parent table refactoring.

## Alembic Migration Script

### Migration File

**File:** `backend/alembic/versions/YYYY_MM_DD_HHMM_refactor_template_versioning_structure.py`

### Migration Steps (Upgrade)

```python
"""Refactor template versioning structure

Revision ID: <auto_generated>
Revises: <previous_revision>
Create Date: <auto_generated>

"""
from alembic import op
import sqlalchemy as sa
from sqlalchemy import text

# revision identifiers
revision = '<auto_generated>'
down_revision = '<previous_revision>'
branch_labels = None
depends_on = None


def upgrade():
    # Step 1: Add new columns to template_versions (temporarily nullable)
    op.add_column('template_versions', sa.Column('file_path', sa.String(500), nullable=True))
    op.add_column('template_versions', sa.Column('file_size_bytes', sa.Integer(), nullable=True))
    op.add_column('template_versions', sa.Column('field_count', sa.Integer(), nullable=True))
    op.add_column('template_versions', sa.Column('sepe_url', sa.String(1000), nullable=True))

    # Step 2: Rename column in pdf_templates
    op.alter_column('pdf_templates', 'version', new_column_name='current_version')

    # Step 3: Add comment column to pdf_templates
    op.add_column('pdf_templates', sa.Column('comment', sa.Text(), nullable=True))

    # Step 4: Migrate data from pdf_templates to template_versions
    # This SQL updates each version with data from its parent template
    connection = op.get_bind()
    connection.execute(text("""
        UPDATE template_versions tv
        SET
            file_path = pt.file_path,
            file_size_bytes = pt.file_size_bytes,
            field_count = pt.field_count,
            sepe_url = pt.sepe_url
        FROM pdf_templates pt
        WHERE tv.template_id = pt.id
    """))

    # Step 5: Make new columns NOT NULL (except sepe_url which remains nullable)
    op.alter_column('template_versions', 'file_path', nullable=False)
    op.alter_column('template_versions', 'file_size_bytes', nullable=False)
    op.alter_column('template_versions', 'field_count', nullable=False, server_default='0')

    # Step 6: Drop old columns from pdf_templates
    op.drop_column('pdf_templates', 'file_path')
    op.drop_column('pdf_templates', 'file_size_bytes')
    op.drop_column('pdf_templates', 'field_count')
    op.drop_column('pdf_templates', 'sepe_url')


def downgrade():
    # Step 1: Add columns back to pdf_templates (temporarily nullable)
    op.add_column('pdf_templates', sa.Column('file_path', sa.String(500), nullable=True))
    op.add_column('pdf_templates', sa.Column('file_size_bytes', sa.Integer(), nullable=True))
    op.add_column('pdf_templates', sa.Column('field_count', sa.Integer(), nullable=True))
    op.add_column('pdf_templates', sa.Column('sepe_url', sa.String(1000), nullable=True))

    # Step 2: Migrate data back from template_versions to pdf_templates (current version only)
    connection = op.get_bind()
    connection.execute(text("""
        UPDATE pdf_templates pt
        SET
            file_path = tv.file_path,
            file_size_bytes = tv.file_size_bytes,
            field_count = tv.field_count,
            sepe_url = tv.sepe_url
        FROM template_versions tv
        WHERE tv.template_id = pt.id AND tv.is_current = TRUE
    """))

    # Step 3: Make columns NOT NULL (except sepe_url)
    op.alter_column('pdf_templates', 'file_path', nullable=False)
    op.alter_column('pdf_templates', 'file_size_bytes', nullable=False)
    op.alter_column('pdf_templates', 'field_count', nullable=False, server_default='0')

    # Step 4: Drop columns from template_versions
    op.drop_column('template_versions', 'sepe_url')
    op.drop_column('template_versions', 'field_count')
    op.drop_column('template_versions', 'file_size_bytes')
    op.drop_column('template_versions', 'file_path')

    # Step 5: Rename column in pdf_templates back
    op.alter_column('pdf_templates', 'current_version', new_column_name='version')

    # Step 6: Drop comment column from pdf_templates
    op.drop_column('pdf_templates', 'comment')
```

## Data Integrity Considerations

### Foreign Key Constraints

**Maintained:**

- `template_versions.template_id` → `pdf_templates.id` (CASCADE DELETE)
- `template_fields.version_id` → `template_versions.id` (CASCADE DELETE)

**Impact:** When a template is deleted, all its versions and fields are automatically deleted.

### Unique Constraints

**Consideration:** Should we add a unique constraint on `(template_id, version_number)` in `template_versions`?

**Recommendation:** Yes, to prevent duplicate version numbers for the same template:

```sql
CREATE UNIQUE INDEX idx_template_versions_unique_version
ON template_versions(template_id, version_number);
```

### Current Version Integrity

**Challenge:** Ensuring `pdf_templates.current_version` always matches an existing `template_versions.version_number` where `is_current = TRUE`.

**Options:**

1. **Application-level validation:** Enforce in business logic (FastAPI endpoints)
2. **Database trigger:** Create a trigger to validate consistency (more complex)
3. **Computed column:** Make `current_version` a generated/computed field (PostgreSQL 12+)

**Recommendation:** Use application-level validation with thorough testing.

## Index Strategy

### New Indexes

```sql
-- For fast lookup of current version
CREATE INDEX idx_template_versions_current_lookup
ON template_versions(template_id, is_current)
WHERE is_current = TRUE;

-- For version number searches
CREATE INDEX idx_template_versions_version_number
ON template_versions(version_number);
```

### Existing Indexes (Maintained)

- `pdf_templates.name` - For template name searches
- `pdf_templates.created_at` - For chronological sorting
- `template_versions.template_id` - For foreign key lookups
- `template_versions.is_current` - For filtering current versions

## Performance Impact

### Query Performance

**Before refactoring:**

```sql
SELECT * FROM pdf_templates WHERE id = 1;
-- Returns all data in one query
```

**After refactoring:**

```sql
SELECT pt.*, tv.file_path, tv.file_size_bytes, tv.field_count, tv.sepe_url
FROM pdf_templates pt
LEFT JOIN template_versions tv ON pt.id = tv.template_id AND tv.is_current = TRUE
WHERE pt.id = 1;
-- Requires a join, but with proper indexes should be equally fast
```

**Optimization:** Add index on `(template_id, is_current)` for efficient current version lookups.

### Storage Impact

**Estimated change:** Storage will increase slightly as file metadata is duplicated across versions instead of being shared. For typical usage:

- Before: 1 row in `pdf_templates` per template
- After: 1 row in `pdf_templates` + N rows in `template_versions` (where N = number of versions)

**Example:** A template with 5 versions:

- Additional storage per version: ~1 KB (4 new columns)
- Total additional storage: ~5 KB per template

**Impact:** Negligible for most deployments.

## Migration Testing Strategy

### Pre-Migration Checks

1. Backup database
2. Count records: `SELECT COUNT(*) FROM pdf_templates;`
3. Count versions: `SELECT COUNT(*) FROM template_versions;`
4. Verify current versions: `SELECT COUNT(*) FROM template_versions WHERE is_current = TRUE;`

### Post-Migration Validation

1. Verify no data loss: Record counts should match
2. Verify all versions have file data: `SELECT COUNT(*) FROM template_versions WHERE file_path IS NULL;` (should be 0)
3. Verify referential integrity: Check for orphaned records
4. Test API endpoints: Verify all template operations work correctly
5. Test frontend: Verify template page displays correctly

### Rollback Testing

1. Test downgrade migration in staging environment
2. Verify data is correctly restored to original structure
3. Document any data loss scenarios (e.g., `comment` field will be lost in rollback)

## Rationale

### Why This Refactoring?

**Problem:** The current schema stores version-specific data (file_path, file_size_bytes, field_count, sepe_url) in the parent `pdf_templates` table, creating these issues:

1. **Data Inconsistency:** When a new version is uploaded, the parent template's attributes are overwritten, losing historical accuracy
2. **Incomplete Versioning:** Versions don't have complete metadata; they depend on parent template
3. **Comparison Challenges:** Cannot accurately compare file sizes or field counts across versions
4. **Audit Trail Issues:** Historical data is lost when templates are updated

**Solution:** Move version-specific attributes to `template_versions` table where they belong, ensuring each version is self-contained and historically accurate.

### Performance Trade-offs

**Cost:** Additional join required for template queries that need version data
**Benefit:** Complete version isolation, accurate historical data, simpler comparison logic

**Decision:** The benefits of data integrity and historical accuracy outweigh the minimal performance cost of an indexed join.
