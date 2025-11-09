# Database Schema

This is the database schema implementation for the spec detailed in @.agent-os/specs/2025-10-27-01-comparison-persistence/spec.md

## Overview

This migration transforms the existing `comparisons` and `comparison_fields` tables from a template-based structure to a version-based structure that can store complete comparison analysis payloads.

## Schema Changes

### 1. Table: `comparisons` (Modifications)

#### Foreign Key Changes (CRITICAL)

**Current Schema:**

```sql
source_template_id INTEGER REFERENCES pdf_templates(id)
target_template_id INTEGER REFERENCES pdf_templates(id)
```

**New Schema:**

```sql
source_version_id INTEGER REFERENCES template_versions(id) NOT NULL
target_version_id INTEGER REFERENCES template_versions(id) NOT NULL
```

**Migration Steps:**

1. Drop existing foreign key constraints
2. Rename columns:
   - `source_template_id` → `source_version_id`
   - `target_template_id` → `target_version_id`
3. Add new foreign key constraints to `template_versions` table
4. Update indexes

#### New Columns (Global Metrics)

```sql
ALTER TABLE comparisons
ADD COLUMN modification_percentage FLOAT NOT NULL DEFAULT 0.0;

ALTER TABLE comparisons
ADD COLUMN fields_added INTEGER NOT NULL DEFAULT 0;

ALTER TABLE comparisons
ADD COLUMN fields_removed INTEGER NOT NULL DEFAULT 0;

ALTER TABLE comparisons
ADD COLUMN fields_modified INTEGER NOT NULL DEFAULT 0;

ALTER TABLE comparisons
ADD COLUMN fields_unchanged INTEGER NOT NULL DEFAULT 0;
```

**Column Descriptions:**

| Column                    | Type    | Nullable | Default | Description                                 |
| ------------------------- | ------- | -------- | ------- | ------------------------------------------- |
| `modification_percentage` | FLOAT   | NOT NULL | 0.0     | Percentage of fields that changed (0-100)   |
| `fields_added`            | INTEGER | NOT NULL | 0       | Count of fields added in target version     |
| `fields_removed`          | INTEGER | NOT NULL | 0       | Count of fields removed from source version |
| `fields_modified`         | INTEGER | NOT NULL | 0       | Count of fields with changes                |
| `fields_unchanged`        | INTEGER | NOT NULL | 0       | Count of fields without changes             |

#### Updated Indexes

```sql
-- Drop old indexes
DROP INDEX IF EXISTS ix_comparisons_source_template_id;
DROP INDEX IF EXISTS ix_comparisons_target_template_id;

-- Create new indexes
CREATE INDEX ix_comparisons_source_version_id ON comparisons(source_version_id);
CREATE INDEX ix_comparisons_target_version_id ON comparisons(target_version_id);
CREATE INDEX ix_comparisons_created_at ON comparisons(created_at);
CREATE INDEX ix_comparisons_modification_percentage ON comparisons(modification_percentage);
```

#### Column Retention

The following columns remain unchanged:

- `id` (PRIMARY KEY)
- `comparison_type` (VARCHAR(50), nullable)
- `status` (VARCHAR(50), default='completed')
- `differences_count` (INTEGER, nullable) - can be deprecated in favor of new metrics
- `created_by` (INTEGER, FK to users.id)
- `created_at` (TIMESTAMP WITH TIME ZONE)
- `completed_at` (TIMESTAMP WITH TIME ZONE, nullable)

### 2. Table: `comparison_fields` (Major Overhaul)

#### New Columns (Complete Field Change Data)

```sql
ALTER TABLE comparison_fields
ADD COLUMN field_id VARCHAR(255) NOT NULL;

ALTER TABLE comparison_fields
ADD COLUMN status VARCHAR(20) NOT NULL;

ALTER TABLE comparison_fields
ADD COLUMN source_page_number INTEGER;

ALTER TABLE comparison_fields
ADD COLUMN target_page_number INTEGER;

ALTER TABLE comparison_fields
ADD COLUMN page_number_changed BOOLEAN NOT NULL DEFAULT false;

ALTER TABLE comparison_fields
ADD COLUMN near_text_diff VARCHAR(20);

ALTER TABLE comparison_fields
ADD COLUMN source_near_text TEXT;

ALTER TABLE comparison_fields
ADD COLUMN target_near_text TEXT;

ALTER TABLE comparison_fields
ADD COLUMN value_options_diff VARCHAR(20);

ALTER TABLE comparison_fields
ADD COLUMN source_value_options JSONB;

ALTER TABLE comparison_fields
ADD COLUMN target_value_options JSONB;

ALTER TABLE comparison_fields
ADD COLUMN position_change VARCHAR(20);

ALTER TABLE comparison_fields
ADD COLUMN source_position JSONB;

ALTER TABLE comparison_fields
ADD COLUMN target_position JSONB;
```

**Column Descriptions:**

| Column                 | Type         | Nullable | Description                                                 |
| ---------------------- | ------------ | -------- | ----------------------------------------------------------- |
| `field_id`             | VARCHAR(255) | NOT NULL | Unique field identifier from template                       |
| `status`               | VARCHAR(20)  | NOT NULL | FieldChangeStatus enum: ADDED, REMOVED, MODIFIED, UNCHANGED |
| `field_type`           | VARCHAR(100) | YES      | Type of field: text, checkbox, select, radio, etc.          |
| `source_page_number`   | INTEGER      | YES      | Page number in source version (null if ADDED)               |
| `target_page_number`   | INTEGER      | YES      | Page number in target version (null if REMOVED)             |
| `page_number_changed`  | BOOLEAN      | NOT NULL | Whether page number differs between versions                |
| `near_text_diff`       | VARCHAR(20)  | YES      | DiffStatus enum: EQUAL, DIFFERENT, NOT_APPLICABLE           |
| `source_near_text`     | TEXT         | YES      | Label text in source version                                |
| `target_near_text`     | TEXT         | YES      | Label text in target version                                |
| `value_options_diff`   | VARCHAR(20)  | YES      | DiffStatus enum: EQUAL, DIFFERENT, NOT_APPLICABLE           |
| `source_value_options` | JSONB        | YES      | Array of options in source (for select/radio)               |
| `target_value_options` | JSONB        | YES      | Array of options in target (for select/radio)               |
| `position_change`      | VARCHAR(20)  | YES      | DiffStatus enum: EQUAL, DIFFERENT, NOT_APPLICABLE           |
| `source_position`      | JSONB        | YES      | Position data in source: {x0, y0, x1, y1}                   |
| `target_position`      | JSONB        | YES      | Position data in target: {x0, y0, x1, y1}                   |

#### Columns to Remove (Deprecated)

```sql
-- These columns will be removed in a separate migration after data migration
-- DO NOT remove in the same migration as adding new columns (to allow rollback)
-- ALTER TABLE comparison_fields DROP COLUMN field_name;
-- ALTER TABLE comparison_fields DROP COLUMN change_type;
-- ALTER TABLE comparison_fields DROP COLUMN old_value;
-- ALTER TABLE comparison_fields DROP COLUMN new_value;
-- ALTER TABLE comparison_fields DROP COLUMN position_x;
-- ALTER TABLE comparison_fields DROP COLUMN position_y;
```

**Deprecation Strategy:**

1. Add new columns in this migration
2. Keep old columns for backward compatibility
3. Remove old columns in future migration after confirming no dependencies

#### Updated Indexes

```sql
CREATE INDEX ix_comparison_fields_comparison_id ON comparison_fields(comparison_id);
CREATE INDEX ix_comparison_fields_field_id ON comparison_fields(field_id);
CREATE INDEX ix_comparison_fields_status ON comparison_fields(status);
```

#### Column Retention

The following columns remain unchanged:

- `id` (PRIMARY KEY)
- `comparison_id` (INTEGER, FK to comparisons.id)
- `created_at` (TIMESTAMP WITH TIME ZONE)

### 3. Relationships and Constraints

#### Foreign Keys

**comparisons table:**

```sql
ALTER TABLE comparisons
ADD CONSTRAINT fk_comparisons_source_version_id
FOREIGN KEY (source_version_id)
REFERENCES template_versions(id)
ON DELETE CASCADE;

ALTER TABLE comparisons
ADD CONSTRAINT fk_comparisons_target_version_id
FOREIGN KEY (target_version_id)
REFERENCES template_versions(id)
ON DELETE CASCADE;

ALTER TABLE comparisons
ADD CONSTRAINT fk_comparisons_created_by
FOREIGN KEY (created_by)
REFERENCES users(id)
ON DELETE SET NULL;
```

**comparison_fields table:**

```sql
ALTER TABLE comparison_fields
ADD CONSTRAINT fk_comparison_fields_comparison_id
FOREIGN KEY (comparison_id)
REFERENCES comparisons(id)
ON DELETE CASCADE;
```

**Cascade Behavior:**

- Deleting a template version will delete all comparisons that reference it
- Deleting a comparison will delete all its comparison_fields
- Deleting a user will set `created_by` to NULL (retain comparison data)

#### Check Constraints

```sql
ALTER TABLE comparisons
ADD CONSTRAINT chk_comparisons_different_versions
CHECK (source_version_id != target_version_id);

ALTER TABLE comparisons
ADD CONSTRAINT chk_comparisons_modification_percentage
CHECK (modification_percentage >= 0 AND modification_percentage <= 100);

ALTER TABLE comparisons
ADD CONSTRAINT chk_comparisons_field_counts
CHECK (fields_added >= 0 AND fields_removed >= 0 AND fields_modified >= 0 AND fields_unchanged >= 0);

ALTER TABLE comparison_fields
ADD CONSTRAINT chk_comparison_fields_status
CHECK (status IN ('ADDED', 'REMOVED', 'MODIFIED', 'UNCHANGED'));

ALTER TABLE comparison_fields
ADD CONSTRAINT chk_comparison_fields_near_text_diff
CHECK (near_text_diff IN ('EQUAL', 'DIFFERENT', 'NOT_APPLICABLE') OR near_text_diff IS NULL);

ALTER TABLE comparison_fields
ADD CONSTRAINT chk_comparison_fields_value_options_diff
CHECK (value_options_diff IN ('EQUAL', 'DIFFERENT', 'NOT_APPLICABLE') OR value_options_diff IS NULL);

ALTER TABLE comparison_fields
ADD CONSTRAINT chk_comparison_fields_position_change
CHECK (position_change IN ('EQUAL', 'DIFFERENT', 'NOT_APPLICABLE') OR position_change IS NULL);
```

### 4. JSONB Schema Definitions

#### source_position / target_position

```json
{
  "type": "object",
  "properties": {
    "x0": { "type": "number" },
    "y0": { "type": "number" },
    "x1": { "type": "number" },
    "y1": { "type": "number" }
  },
  "required": ["x0", "y0", "x1", "y1"]
}
```

**Example:**

```json
{
  "x0": 100.5,
  "y0": 250.75,
  "x1": 350.25,
  "y1": 275.5
}
```

#### source_value_options / target_value_options

```json
{
  "type": "array",
  "items": { "type": "string" }
}
```

**Example:**

```json
["Contributiva", "Asistencial", "Subsidio agrario"]
```

### 5. Table Statistics (Post-Migration)

**comparisons table:**

- Estimated row size: ~200 bytes (with new columns)
- Estimated rows per 1MB: ~5,000
- Estimated rows for 1 year (10 comparisons/day): ~3,650

**comparison_fields table:**

- Estimated row size: ~500 bytes (with JSONB data)
- Estimated rows per comparison (average): 50-100 fields
- Estimated rows for 1 year: ~182,500 - 365,000

**Storage Estimate:**

- comparisons: ~0.7 MB per year
- comparison_fields: ~90-180 MB per year
- Total: < 200 MB per year (negligible)

## Alembic Migration Implementation

### Migration File Structure

```python
"""add_comparison_persistence

Revision ID: <generated_id>
Revises: <previous_revision>
Create Date: <timestamp>
"""
from alembic import op
import sqlalchemy as sa
from sqlalchemy.dialects import postgresql

# revision identifiers
revision = '<generated_id>'
down_revision = '<previous_revision>'
branch_labels = None
depends_on = None


def upgrade():
    """
    Upgrade database schema for comparison persistence.
    """
    # Step 1: Drop old foreign key constraints
    op.drop_constraint(
        'fk_comparisons_source_template_id_pdf_templates',
        'comparisons',
        type_='foreignkey'
    )
    op.drop_constraint(
        'fk_comparisons_target_template_id_pdf_templates',
        'comparisons',
        type_='foreignkey'
    )

    # Step 2: Rename columns
    op.alter_column(
        'comparisons',
        'source_template_id',
        new_column_name='source_version_id'
    )
    op.alter_column(
        'comparisons',
        'target_template_id',
        new_column_name='target_version_id'
    )

    # Step 3: Add new foreign key constraints
    op.create_foreign_key(
        'fk_comparisons_source_version_id',
        'comparisons',
        'template_versions',
        ['source_version_id'],
        ['id'],
        ondelete='CASCADE'
    )
    op.create_foreign_key(
        'fk_comparisons_target_version_id',
        'comparisons',
        'template_versions',
        ['target_version_id'],
        ['id'],
        ondelete='CASCADE'
    )

    # Step 4: Add new columns to comparisons
    op.add_column(
        'comparisons',
        sa.Column('modification_percentage', sa.Float(), nullable=False, server_default='0.0')
    )
    op.add_column(
        'comparisons',
        sa.Column('fields_added', sa.Integer(), nullable=False, server_default='0')
    )
    op.add_column(
        'comparisons',
        sa.Column('fields_removed', sa.Integer(), nullable=False, server_default='0')
    )
    op.add_column(
        'comparisons',
        sa.Column('fields_modified', sa.Integer(), nullable=False, server_default='0')
    )
    op.add_column(
        'comparisons',
        sa.Column('fields_unchanged', sa.Integer(), nullable=False, server_default='0')
    )

    # Step 5: Add new columns to comparison_fields
    op.add_column(
        'comparison_fields',
        sa.Column('field_id', sa.String(255), nullable=False, server_default='')
    )
    op.add_column(
        'comparison_fields',
        sa.Column('status', sa.String(20), nullable=False, server_default='UNCHANGED')
    )
    op.add_column(
        'comparison_fields',
        sa.Column('source_page_number', sa.Integer(), nullable=True)
    )
    op.add_column(
        'comparison_fields',
        sa.Column('target_page_number', sa.Integer(), nullable=True)
    )
    op.add_column(
        'comparison_fields',
        sa.Column('page_number_changed', sa.Boolean(), nullable=False, server_default='false')
    )
    op.add_column(
        'comparison_fields',
        sa.Column('near_text_diff', sa.String(20), nullable=True)
    )
    op.add_column(
        'comparison_fields',
        sa.Column('source_near_text', sa.Text(), nullable=True)
    )
    op.add_column(
        'comparison_fields',
        sa.Column('target_near_text', sa.Text(), nullable=True)
    )
    op.add_column(
        'comparison_fields',
        sa.Column('value_options_diff', sa.String(20), nullable=True)
    )
    op.add_column(
        'comparison_fields',
        sa.Column('source_value_options', postgresql.JSONB(astext_type=sa.Text()), nullable=True)
    )
    op.add_column(
        'comparison_fields',
        sa.Column('target_value_options', postgresql.JSONB(astext_type=sa.Text()), nullable=True)
    )
    op.add_column(
        'comparison_fields',
        sa.Column('position_change', sa.String(20), nullable=True)
    )
    op.add_column(
        'comparison_fields',
        sa.Column('source_position', postgresql.JSONB(astext_type=sa.Text()), nullable=True)
    )
    op.add_column(
        'comparison_fields',
        sa.Column('target_position', postgresql.JSONB(astext_type=sa.Text()), nullable=True)
    )

    # Step 6: Drop old indexes and create new ones
    op.drop_index('ix_comparisons_source_template_id', table_name='comparisons')
    op.drop_index('ix_comparisons_target_template_id', table_name='comparisons')

    op.create_index(
        'ix_comparisons_source_version_id',
        'comparisons',
        ['source_version_id']
    )
    op.create_index(
        'ix_comparisons_target_version_id',
        'comparisons',
        ['target_version_id']
    )
    op.create_index(
        'ix_comparisons_modification_percentage',
        'comparisons',
        ['modification_percentage']
    )

    op.create_index(
        'ix_comparison_fields_field_id',
        'comparison_fields',
        ['field_id']
    )
    op.create_index(
        'ix_comparison_fields_status',
        'comparison_fields',
        ['status']
    )

    # Step 7: Add check constraints
    op.create_check_constraint(
        'chk_comparisons_different_versions',
        'comparisons',
        'source_version_id != target_version_id'
    )
    op.create_check_constraint(
        'chk_comparisons_modification_percentage',
        'comparisons',
        'modification_percentage >= 0 AND modification_percentage <= 100'
    )
    op.create_check_constraint(
        'chk_comparisons_field_counts',
        'comparisons',
        'fields_added >= 0 AND fields_removed >= 0 AND fields_modified >= 0 AND fields_unchanged >= 0'
    )
    op.create_check_constraint(
        'chk_comparison_fields_status',
        'comparison_fields',
        "status IN ('ADDED', 'REMOVED', 'MODIFIED', 'UNCHANGED')"
    )


def downgrade():
    """
    Downgrade database schema (rollback changes).
    """
    # Drop check constraints
    op.drop_constraint('chk_comparison_fields_status', 'comparison_fields', type_='check')
    op.drop_constraint('chk_comparisons_field_counts', 'comparisons', type_='check')
    op.drop_constraint('chk_comparisons_modification_percentage', 'comparisons', type_='check')
    op.drop_constraint('chk_comparisons_different_versions', 'comparisons', type_='check')

    # Drop new indexes
    op.drop_index('ix_comparison_fields_status', table_name='comparison_fields')
    op.drop_index('ix_comparison_fields_field_id', table_name='comparison_fields')
    op.drop_index('ix_comparisons_modification_percentage', table_name='comparisons')
    op.drop_index('ix_comparisons_target_version_id', table_name='comparisons')
    op.drop_index('ix_comparisons_source_version_id', table_name='comparisons')

    # Drop new columns from comparison_fields
    op.drop_column('comparison_fields', 'target_position')
    op.drop_column('comparison_fields', 'source_position')
    op.drop_column('comparison_fields', 'position_change')
    op.drop_column('comparison_fields', 'target_value_options')
    op.drop_column('comparison_fields', 'source_value_options')
    op.drop_column('comparison_fields', 'value_options_diff')
    op.drop_column('comparison_fields', 'target_near_text')
    op.drop_column('comparison_fields', 'source_near_text')
    op.drop_column('comparison_fields', 'near_text_diff')
    op.drop_column('comparison_fields', 'page_number_changed')
    op.drop_column('comparison_fields', 'target_page_number')
    op.drop_column('comparison_fields', 'source_page_number')
    op.drop_column('comparison_fields', 'status')
    op.drop_column('comparison_fields', 'field_id')

    # Drop new columns from comparisons
    op.drop_column('comparisons', 'fields_unchanged')
    op.drop_column('comparisons', 'fields_modified')
    op.drop_column('comparisons', 'fields_removed')
    op.drop_column('comparisons', 'fields_added')
    op.drop_column('comparisons', 'modification_percentage')

    # Drop new foreign key constraints
    op.drop_constraint('fk_comparisons_target_version_id', 'comparisons', type_='foreignkey')
    op.drop_constraint('fk_comparisons_source_version_id', 'comparisons', type_='foreignkey')

    # Rename columns back
    op.alter_column(
        'comparisons',
        'target_version_id',
        new_column_name='target_template_id'
    )
    op.alter_column(
        'comparisons',
        'source_version_id',
        new_column_name='source_template_id'
    )

    # Recreate old foreign key constraints
    op.create_foreign_key(
        'fk_comparisons_target_template_id_pdf_templates',
        'comparisons',
        'pdf_templates',
        ['target_template_id'],
        ['id']
    )
    op.create_foreign_key(
        'fk_comparisons_source_template_id_pdf_templates',
        'comparisons',
        'pdf_templates',
        ['source_template_id'],
        ['id']
    )

    # Recreate old indexes
    op.create_index('ix_comparisons_target_template_id', 'comparisons', ['target_template_id'])
    op.create_index('ix_comparisons_source_template_id', 'comparisons', ['source_template_id'])
```

## Data Migration Strategy

### Handling Existing Data

**If existing comparison data exists:**

1. Create a separate data migration script
2. Map old `comparison_fields.change_type` to new `status` enum
3. Populate `field_id` from `field_name` (may require template analysis)
4. Set default values for new fields not present in old data
5. Test thoroughly in staging environment before production deployment

**Recommended Approach:**

- Run migration in maintenance window (low traffic period)
- Take database backup before migration
- Test rollback procedure in staging
- Monitor migration progress with logging
- Verify data integrity after migration

### Testing the Migration

```bash
# Test upgrade
alembic upgrade head

# Verify tables and columns
psql -d your_database -c "\d comparisons"
psql -d your_database -c "\d comparison_fields"

# Test downgrade
alembic downgrade -1

# Verify rollback
psql -d your_database -c "\d comparisons"
psql -d your_database -c "\d comparison_fields"

# Re-apply upgrade
alembic upgrade head
```

## Performance Considerations

### Indexing Strategy

**Indexes on comparisons:**

- `source_version_id` - for JOIN with template_versions
- `target_version_id` - for JOIN with template_versions
- `created_at` - for date-based sorting and filtering
- `modification_percentage` - for sorting by significance

**Indexes on comparison_fields:**

- `comparison_id` - for JOIN with comparisons (FK index)
- `field_id` - for searching specific fields
- `status` - for filtering by change type

### Query Optimization

**List Comparisons (with pagination):**

```sql
SELECT
    c.id,
    c.source_version_id,
    c.target_version_id,
    sv.version_number AS source_version_number,
    tv.version_number AS target_version_number,
    st.name AS source_template_name,
    tt.name AS target_template_name,
    c.modification_percentage,
    c.fields_added,
    c.fields_removed,
    c.fields_modified,
    c.fields_unchanged,
    c.created_at,
    c.created_by
FROM comparisons c
INNER JOIN template_versions sv ON c.source_version_id = sv.id
INNER JOIN template_versions tv ON c.target_version_id = tv.id
INNER JOIN pdf_templates st ON sv.template_id = st.id
INNER JOIN pdf_templates tt ON tv.template_id = tt.id
WHERE st.name ILIKE '%search_term%' OR tt.name ILIKE '%search_term%'
ORDER BY c.created_at DESC
LIMIT 20 OFFSET 0;
```

**Get Single Comparison:**

```sql
SELECT
    c.*,
    sv.version_number AS source_version_number,
    tv.version_number AS target_version_number,
    sv.page_count AS source_page_count,
    tv.page_count AS target_page_count,
    sv.field_count AS source_field_count,
    tv.field_count AS target_field_count,
    sv.created_at AS source_created_at,
    tv.created_at AS target_created_at
FROM comparisons c
INNER JOIN template_versions sv ON c.source_version_id = sv.id
INNER JOIN template_versions tv ON c.target_version_id = tv.id
WHERE c.id = :comparison_id;

SELECT * FROM comparison_fields
WHERE comparison_id = :comparison_id
ORDER BY field_id;
```

### Estimated Query Performance

- List query with JOINs: < 100ms (with indexes)
- Get single comparison: < 50ms (with FK indexes)
- Insert comparison with 50 fields: < 200ms (transactional)
- JSONB queries: < 50ms (PostgreSQL optimized)

## Rationale

### Why Change Foreign Keys from Templates to Versions?

**Problem with Template-based FKs:**

- Comparisons analyze specific versions, not templates
- Template can have multiple versions
- Cannot accurately identify which versions were compared
- Requires additional logic to track version relationship

**Benefits of Version-based FKs:**

- Direct relationship to analyzed data
- Accurate audit trail of version comparisons
- Simpler queries (no need to infer version from template)
- Aligns with actual comparison logic

### Why Store Global Metrics in comparisons Table?

**Benefits:**

- Fast list queries (no need to aggregate comparison_fields)
- Enables sorting by metrics (modification %, field counts)
- Reduces database load for common operations
- Denormalization improves read performance

**Trade-offs:**

- Slight data redundancy (metrics can be calculated from fields)
- Additional storage (~20 bytes per comparison)
- Must ensure consistency between metrics and field data

**Decision:** Benefits outweigh trade-offs for read-heavy workload

### Why Use JSONB for Position and Value Options?

**Benefits:**

- Flexible schema (can evolve without migrations)
- PostgreSQL has excellent JSONB indexing and querying
- Reduces table width (fewer columns)
- Matches original comparison API response format

**Trade-offs:**

- Less strict validation at database level
- Requires application-level schema enforcement
- Slightly larger storage than normalized columns

**Decision:** Flexibility and PostgreSQL JSONB performance justify the approach

### Why Keep Old Columns Temporarily?

**Rationale:**

- Enables gradual migration (no breaking changes)
- Allows rollback if issues discovered
- Provides time to verify new schema works correctly
- Can be removed in future migration once confirmed

**Timeline:**

- Migration 1: Add new columns
- Migration 2 (future): Remove old columns after verification

## Data Integrity Rules

### Validation at Application Level

1. **Status Enum Values:** Validate `status` is one of: ADDED, REMOVED, MODIFIED, UNCHANGED
2. **DiffStatus Enum Values:** Validate diff fields are: EQUAL, DIFFERENT, NOT_APPLICABLE
3. **JSONB Structure:** Validate position objects have x0, y0, x1, y1 keys
4. **Null Constraints:** Validate nullable fields based on status (e.g., source\_\* is null when status=ADDED)
5. **Metric Consistency:** Validate sum of (added + removed + modified + unchanged) equals total field count

### Database-Level Constraints

1. **Check Constraints:** Enforce enum values and numeric ranges
2. **Foreign Key Constraints:** Ensure referential integrity
3. **Not Null Constraints:** Prevent missing required data
4. **Unique Constraints:** None required (comparisons can be duplicated)

## Monitoring and Maintenance

### Metrics to Track

- Table sizes (MB)
- Row counts
- Index sizes
- Query performance (avg query time)
- Migration execution time

### Maintenance Tasks

- **Weekly:** Analyze table statistics (`ANALYZE comparisons, comparison_fields`)
- **Monthly:** Vacuum tables (`VACUUM ANALYZE comparisons, comparison_fields`)
- **Quarterly:** Review index usage and optimize if needed
- **Annually:** Archive old comparisons (if retention policy implemented)

## Rollback Plan

### If Migration Fails

1. Stop application servers
2. Restore database backup
3. Investigate failure cause
4. Fix migration script
5. Test in staging environment
6. Retry migration

### If Issues Discovered Post-Migration

1. Run `alembic downgrade -1` to rollback schema
2. Application continues to work with old schema
3. Fix issues in migration script
4. Re-test thoroughly
5. Re-apply migration

### Verification Checklist

- [ ] All foreign key constraints created successfully
- [ ] All indexes created successfully
- [ ] All new columns have correct types and defaults
- [ ] Check constraints enforce data integrity
- [ ] Rollback (downgrade) works correctly
- [ ] Application can query new schema without errors
- [ ] Performance of list/detail queries is acceptable
- [ ] No data loss or corruption
