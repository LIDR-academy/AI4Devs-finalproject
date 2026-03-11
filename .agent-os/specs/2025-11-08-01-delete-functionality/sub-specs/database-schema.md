# Database Schema

This is the database schema implementation for the spec detailed in @.agent-os/specs/2025-11-08-01-delete-functionality/spec.md

## Overview

The delete functionality requires ensuring proper CASCADE deletion rules are configured on all foreign key relationships. This document details the current state, required changes, and migration strategy.

## Current CASCADE Configuration Status

### ✅ Already Configured (No Changes Needed)

**Comparisons Table:**

```python
# comparisons.source_version_id
ForeignKey("template_versions.id", ondelete="CASCADE")

# comparisons.target_version_id
ForeignKey("template_versions.id", ondelete="CASCADE")
```

**Comparison Fields Table:**

```python
# comparison_fields.comparison_id
ForeignKey("comparisons.id", ondelete="CASCADE")
```

**SQLAlchemy Relationships (ORM-level CASCADE):**

```python
# PDFTemplate → TemplateVersion
relationship("TemplateVersion", cascade="all, delete-orphan")

# TemplateVersion → TemplateField
relationship("TemplateField", cascade="all, delete-orphan")

# Comparison → ComparisonField
relationship("ComparisonField", cascade="all, delete-orphan")
```

### ⚠️ Missing CASCADE Configuration (Requires Changes)

**Template Versions Table:**

```python
# Current (template.py line 94-96):
template_id = Column(
    Integer, ForeignKey("pdf_templates.id"), nullable=False, index=True
)

# Required:
template_id = Column(
    Integer,
    ForeignKey("pdf_templates.id", ondelete="CASCADE"),
    nullable=False,
    index=True
)
```

**Template Fields Table:**

```python
# Current (template.py line 163-165):
version_id = Column(
    Integer, ForeignKey("template_versions.id"), nullable=False, index=True
)

# Required:
version_id = Column(
    Integer,
    ForeignKey("template_versions.id", ondelete="CASCADE"),
    nullable=False,
    index=True
)
```

## Required Database Changes

### 1. Update SQLAlchemy Models

**File: `backend/app/models/template.py`**

**Change 1 - TemplateVersion.template_id:**

```python
# Line 94-96
# FROM:
template_id = Column(
    Integer, ForeignKey("pdf_templates.id"), nullable=False, index=True
)

# TO:
template_id = Column(
    Integer,
    ForeignKey("pdf_templates.id", ondelete="CASCADE"),
    nullable=False,
    index=True
)
```

**Change 2 - TemplateField.version_id:**

```python
# Line 163-165
# FROM:
version_id = Column(
    Integer, ForeignKey("template_versions.id"), nullable=False, index=True
)

# TO:
version_id = Column(
    Integer,
    ForeignKey("template_versions.id", ondelete="CASCADE"),
    nullable=False,
    index=True
)
```

### 2. Generate Alembic Migration

**Command:**

```bash
cd backend
source venv/bin/activate
alembic revision --autogenerate -m "add_cascade_delete_to_template_foreign_keys"
```

**Expected Migration Content:**
The autogenerate should detect the foreign key constraint changes and generate ALTER TABLE statements to update the constraints.

**Migration Structure:**

```python
"""add_cascade_delete_to_template_foreign_keys

Revision ID: {generated_id}
Revises: {previous_revision}
Create Date: {timestamp}
"""
from alembic import op

def upgrade():
    # Drop existing foreign key constraints
    op.drop_constraint(
        'template_versions_template_id_fkey',
        'template_versions',
        type_='foreignkey'
    )
    op.drop_constraint(
        'template_fields_version_id_fkey',
        'template_fields',
        type_='foreignkey'
    )

    # Re-create foreign key constraints with CASCADE
    op.create_foreign_key(
        'template_versions_template_id_fkey',
        'template_versions', 'pdf_templates',
        ['template_id'], ['id'],
        ondelete='CASCADE'
    )
    op.create_foreign_key(
        'template_fields_version_id_fkey',
        'template_fields', 'template_versions',
        ['version_id'], ['id'],
        ondelete='CASCADE'
    )

def downgrade():
    # Drop CASCADE constraints
    op.drop_constraint(
        'template_versions_template_id_fkey',
        'template_versions',
        type_='foreignkey'
    )
    op.drop_constraint(
        'template_fields_version_id_fkey',
        'template_fields',
        type_='foreignkey'
    )

    # Re-create without CASCADE
    op.create_foreign_key(
        'template_versions_template_id_fkey',
        'template_versions', 'pdf_templates',
        ['template_id'], ['id']
    )
    op.create_foreign_key(
        'template_fields_version_id_fkey',
        'template_fields', 'template_versions',
        ['version_id'], ['id']
    )
```

### 3. Apply Migration

**Development Environment:**

```bash
cd backend
source venv/bin/activate
alembic upgrade head
```

**Production Environment:**

```bash
# Run as part of deployment pipeline
cd backend
source venv/bin/activate
alembic upgrade head
```

## CASCADE Deletion Flow

### Deleting a Template (pdf_templates)

**Trigger:** `DELETE FROM pdf_templates WHERE id = ?`

**CASCADE Chain:**

1. `pdf_templates` (parent) is deleted
2. → All `template_versions` with matching `template_id` are deleted (CASCADE)
3. → → All `template_fields` with matching `version_id` are deleted (CASCADE)
4. → → All `comparisons` with matching `source_version_id` or `target_version_id` are deleted (CASCADE)
5. → → → All `comparison_fields` with matching `comparison_id` are deleted (CASCADE)

**Result:** Complete cleanup of all related data

### Deleting a Version (template_versions)

**Trigger:** `DELETE FROM template_versions WHERE id = ?`

**CASCADE Chain:**

1. `template_versions` (parent) is deleted
2. → All `template_fields` with matching `version_id` are deleted (CASCADE)
3. → All `comparisons` with matching `source_version_id` or `target_version_id` are deleted (CASCADE)
4. → → All `comparison_fields` with matching `comparison_id` are deleted (CASCADE)

**Result:** Complete cleanup of version-specific data and affected comparisons

### Deleting a Comparison (comparisons)

**Trigger:** `DELETE FROM comparisons WHERE id = ?`

**CASCADE Chain:**

1. `comparisons` (parent) is deleted
2. → All `comparison_fields` with matching `comparison_id` are deleted (CASCADE)

**Result:** Complete cleanup of comparison data

## Database Integrity Constraints

### Foreign Key Relationships After Changes

| Child Table       | Column            | Parent Table      | Parent Column | On Delete  |
| ----------------- | ----------------- | ----------------- | ------------- | ---------- |
| template_versions | template_id       | pdf_templates     | id            | CASCADE ✅ |
| template_fields   | version_id        | template_versions | id            | CASCADE ✅ |
| comparisons       | source_version_id | template_versions | id            | CASCADE ✅ |
| comparisons       | target_version_id | template_versions | id            | CASCADE ✅ |
| comparison_fields | comparison_id     | comparisons       | id            | CASCADE ✅ |

### Existing Indexes (No Changes Required)

All foreign key columns already have indexes:

- `template_versions.template_id` (index=True)
- `template_fields.version_id` (index=True)
- `comparisons.source_version_id` (index=True)
- `comparisons.target_version_id` (index=True)
- `comparison_fields.comparison_id` (index=True)

## Testing the Migration

### Pre-Migration Verification

**Check existing constraints:**

```sql
-- PostgreSQL command
SELECT
    tc.constraint_name,
    tc.table_name,
    kcu.column_name,
    ccu.table_name AS foreign_table_name,
    ccu.column_name AS foreign_column_name,
    rc.delete_rule
FROM information_schema.table_constraints AS tc
JOIN information_schema.key_column_usage AS kcu
  ON tc.constraint_name = kcu.constraint_name
JOIN information_schema.constraint_column_usage AS ccu
  ON ccu.constraint_name = tc.constraint_name
JOIN information_schema.referential_constraints AS rc
  ON tc.constraint_name = rc.constraint_name
WHERE tc.constraint_type = 'FOREIGN KEY'
  AND tc.table_name IN (
    'template_versions',
    'template_fields',
    'comparisons',
    'comparison_fields'
  );
```

### Post-Migration Verification

**Verify CASCADE is configured:**

```sql
-- Should show 'CASCADE' in delete_rule column
SELECT
    tc.table_name,
    kcu.column_name,
    ccu.table_name AS foreign_table_name,
    rc.delete_rule
FROM information_schema.table_constraints AS tc
JOIN information_schema.key_column_usage AS kcu
  ON tc.constraint_name = kcu.constraint_name
JOIN information_schema.constraint_column_usage AS ccu
  ON ccu.constraint_name = tc.constraint_name
JOIN information_schema.referential_constraints AS rc
  ON tc.constraint_name = rc.constraint_name
WHERE tc.constraint_type = 'FOREIGN KEY'
  AND tc.table_name IN (
    'template_versions',
    'template_fields',
    'comparisons',
    'comparison_fields'
  )
ORDER BY tc.table_name;
```

**Expected Result:**
All rows should show `delete_rule = 'CASCADE'`

### Functional Testing

**Test 1 - Delete Template:**

```sql
-- Create test data
INSERT INTO pdf_templates (name, current_version, created_at)
VALUES ('Test Template', 'v1', NOW()) RETURNING id;
-- Note the returned ID (e.g., 999)

INSERT INTO template_versions (template_id, version_number, file_path, file_size_bytes, field_count, page_count, is_current, created_at)
VALUES (999, 'v1', '/test.pdf', 1000, 5, 2, true, NOW()) RETURNING id;
-- Note the returned ID (e.g., 888)

INSERT INTO template_fields (version_id, field_id, field_type, page_number, field_page_order, created_at)
VALUES (888, 'field1', 'text', 1, 1, NOW());

-- Delete template
DELETE FROM pdf_templates WHERE id = 999;

-- Verify cascade deletion
SELECT COUNT(*) FROM template_versions WHERE template_id = 999; -- Should be 0
SELECT COUNT(*) FROM template_fields WHERE version_id = 888; -- Should be 0
```

**Test 2 - Delete Version:**

```sql
-- Assuming template and version exist
-- Delete version
DELETE FROM template_versions WHERE id = 888;

-- Verify cascade deletion
SELECT COUNT(*) FROM template_fields WHERE version_id = 888; -- Should be 0
SELECT COUNT(*) FROM comparisons WHERE source_version_id = 888 OR target_version_id = 888; -- Should be 0
```

**Test 3 - Delete Comparison:**

```sql
-- Assuming comparison exists
-- Delete comparison
DELETE FROM comparisons WHERE id = 777;

-- Verify cascade deletion
SELECT COUNT(*) FROM comparison_fields WHERE comparison_id = 777; -- Should be 0
```

## Rollback Strategy

If issues are detected after migration:

**Immediate Rollback:**

```bash
cd backend
source venv/bin/activate
alembic downgrade -1
```

**Manual Rollback (if Alembic fails):**

```sql
-- Drop CASCADE constraints
ALTER TABLE template_versions
DROP CONSTRAINT template_versions_template_id_fkey;

ALTER TABLE template_fields
DROP CONSTRAINT template_fields_version_id_fkey;

-- Re-create without CASCADE
ALTER TABLE template_versions
ADD CONSTRAINT template_versions_template_id_fkey
FOREIGN KEY (template_id) REFERENCES pdf_templates(id);

ALTER TABLE template_fields
ADD CONSTRAINT template_fields_version_id_fkey
FOREIGN KEY (version_id) REFERENCES template_versions(id);
```

## Performance Impact

**Expected Performance:**

- Minimal impact on read operations (indexes remain unchanged)
- DELETE operations may be slightly slower due to CASCADE processing
- Database will handle CASCADE efficiently at the engine level
- No N+1 query issues (all handled in single transaction)

**Monitoring:**

- Monitor DELETE query execution times
- Check for lock contention during deletions
- Verify transaction log size during bulk deletions
