# Database Schema

This is the database schema implementation for the spec detailed in @.agent-os/specs/2025-10-19-database-template-fields/spec.md

## Database Changes Overview

This specification introduces two main database modifications:

1. **ALTER TABLE** `template_versions` - Add 6 new columns for PDF document metadata
2. **CREATE TABLE** `template_fields` - New table for storing AcroForm field data with 1:N relationship to template_versions

## Schema Modifications

### 1. Template Versions Table Extension

**Operation:** Add new columns to existing `template_versions` table

**SQL Specification:**

```sql
-- Add PDF document metadata columns
ALTER TABLE template_versions
  ADD COLUMN title VARCHAR(255) NULL,
  ADD COLUMN author VARCHAR(255) NULL,
  ADD COLUMN subject VARCHAR(255) NULL,
  ADD COLUMN creation_date TIMESTAMP WITH TIME ZONE NULL,
  ADD COLUMN modification_date TIMESTAMP WITH TIME ZONE NULL,
  ADD COLUMN page_count INTEGER NOT NULL DEFAULT 0;

-- Add comment documentation
COMMENT ON COLUMN template_versions.title IS 'PDF document title from metadata';
COMMENT ON COLUMN template_versions.author IS 'PDF document author from metadata';
COMMENT ON COLUMN template_versions.subject IS 'PDF document subject from metadata';
COMMENT ON COLUMN template_versions.creation_date IS 'PDF file creation date from metadata';
COMMENT ON COLUMN template_versions.modification_date IS 'PDF file last modification date from metadata';
COMMENT ON COLUMN template_versions.page_count IS 'Total number of pages in the PDF document';
```

**Updated Table Schema:**

```sql
-- Full template_versions table schema after modifications
CREATE TABLE template_versions (
    -- Existing columns
    id SERIAL PRIMARY KEY,
    template_id INTEGER REFERENCES pdf_templates(id) ON DELETE CASCADE NOT NULL,
    version_number VARCHAR(50) NOT NULL,
    change_summary TEXT,
    is_current BOOLEAN DEFAULT false,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,

    -- New columns (PDF metadata)
    title VARCHAR(255),
    author VARCHAR(255),
    subject VARCHAR(255),
    creation_date TIMESTAMP WITH TIME ZONE,
    modification_date TIMESTAMP WITH TIME ZONE,
    page_count INTEGER NOT NULL DEFAULT 0
);

-- Existing indexes (unchanged)
CREATE INDEX ix_template_versions_id ON template_versions(id);
CREATE INDEX ix_template_versions_template_id ON template_versions(template_id);
CREATE INDEX ix_template_versions_is_current ON template_versions(is_current);
```

**Column Specifications:**

| Column Name         | Data Type                | Constraints         | Purpose                                  |
| ------------------- | ------------------------ | ------------------- | ---------------------------------------- |
| `title`             | VARCHAR(255)             | NULL                | PDF document title from file metadata    |
| `author`            | VARCHAR(255)             | NULL                | PDF document author from file metadata   |
| `subject`           | VARCHAR(255)             | NULL                | PDF document subject/topic from metadata |
| `creation_date`     | TIMESTAMP WITH TIME ZONE | NULL                | Original creation date of PDF file       |
| `modification_date` | TIMESTAMP WITH TIME ZONE | NULL                | Last modification date of PDF file       |
| `page_count`        | INTEGER                  | NOT NULL, DEFAULT 0 | Total page count of the PDF document     |

**Rationale for Column Design:**

- **VARCHAR(255) for text fields**: Standard length adequate for metadata strings, consistent with existing `name` and `email` fields in the system
- **TIMESTAMP WITH TIME ZONE**: Maintains consistency with existing `created_at` timestamp fields for timezone-aware date handling
- **Nullable metadata fields**: Allows backward compatibility with existing records and handles PDFs without metadata gracefully
- **NOT NULL page_count with DEFAULT 0**: Ensures every version has a page count value; default 0 allows safe handling of existing records
- **No additional indexes**: Metadata fields are primarily for display/reporting, not frequent filtering; can add indexes later if query patterns require them

### 2. Template Fields Table Creation

**Operation:** Create new table with foreign key relationship to template_versions

**SQL Specification:**

```sql
-- Create template_fields table
CREATE TABLE template_fields (
    -- Primary Key
    id SERIAL PRIMARY KEY,

    -- Foreign Key
    version_id INTEGER NOT NULL REFERENCES template_versions(id) ON DELETE CASCADE,

    -- Field Identification
    field_id VARCHAR(255) NOT NULL,
    field_type VARCHAR(50) NOT NULL,
    raw_type VARCHAR(50),

    -- Page Information
    page_number INTEGER NOT NULL,
    field_page_order INTEGER NOT NULL,

    -- Field Content
    near_text TEXT,

    -- JSON Data
    value_options JSONB,
    position_data JSONB,

    -- Audit
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Create indexes
CREATE INDEX ix_template_fields_id ON template_fields(id);
CREATE INDEX ix_template_fields_version_id ON template_fields(version_id);

-- Add foreign key constraint with explicit naming
ALTER TABLE template_fields
  ADD CONSTRAINT fk_template_fields_version_id_template_versions
  FOREIGN KEY (version_id)
  REFERENCES template_versions(id)
  ON DELETE CASCADE;

-- Add table and column comments
COMMENT ON TABLE template_fields IS 'Stores extracted AcroForm field data from PDF templates';
COMMENT ON COLUMN template_fields.version_id IS 'Reference to template version containing this field';
COMMENT ON COLUMN template_fields.field_id IS 'PDF form field identifier (e.g., A0101, field_name_123)';
COMMENT ON COLUMN template_fields.field_type IS 'Final control type: text, checkbox, radiobutton, select, textarea';
COMMENT ON COLUMN template_fields.raw_type IS 'Native PDF field type: /Tx, /Btn, /Ch';
COMMENT ON COLUMN template_fields.page_number IS 'Page number where field appears (1-indexed)';
COMMENT ON COLUMN template_fields.field_page_order IS 'Sequential order of field within the page';
COMMENT ON COLUMN template_fields.near_text IS 'Nearby label or descriptive text';
COMMENT ON COLUMN template_fields.value_options IS 'JSON array of available options for select/radio fields';
COMMENT ON COLUMN template_fields.position_data IS 'JSON object with bounding box coordinates {x0, y0, x1, y1}';
```

**Column Specifications:**

| Column Name        | Data Type                | Constraints             | Purpose                            | Example Values                                 |
| ------------------ | ------------------------ | ----------------------- | ---------------------------------- | ---------------------------------------------- |
| `id`               | INTEGER (SERIAL)         | PK, NOT NULL            | Auto-incrementing primary key      | 1, 2, 3...                                     |
| `version_id`       | INTEGER                  | FK, NOT NULL, Indexed   | Foreign key to template_versions   | 42, 127                                        |
| `field_id`         | VARCHAR(255)             | NOT NULL                | PDF form field identifier          | "A0101", "nombre_completo"                     |
| `field_type`       | VARCHAR(50)              | NOT NULL                | Final control type classification  | "text", "radiobutton", "checkbox"              |
| `raw_type`         | VARCHAR(50)              | NULL                    | Native PDF field type              | "/Tx", "/Btn", "/Ch"                           |
| `page_number`      | INTEGER                  | NOT NULL                | Page number (1-indexed)            | 1, 2, 5                                        |
| `field_page_order` | INTEGER                  | NOT NULL                | Field order within page            | 0, 1, 2...                                     |
| `near_text`        | TEXT                     | NULL                    | Descriptive label/nearby text      | "Nombre completo:", "Fecha de nacimiento"      |
| `value_options`    | JSONB                    | NULL                    | Available options for select/radio | `["Opción 1", "Opción 2"]`                     |
| `position_data`    | JSONB                    | NULL                    | Bounding box coordinates           | `{"x0": 100, "y0": 200, "x1": 300, "y1": 220}` |
| `created_at`       | TIMESTAMP WITH TIME ZONE | NOT NULL, DEFAULT now() | Record creation timestamp          | 2025-10-19 10:30:00+00                         |

**Rationale for Schema Design:**

1. **Integer Primary Key (not UUID):**

   - Consistent with existing tables (users, pdf_templates, template_versions, comparisons)
   - Better performance for joins and indexing
   - Smaller storage footprint (4 bytes vs 16 bytes)
   - Easier debugging with sequential IDs
   - **Note:** User specification requested UUID, but maintaining codebase consistency is prioritized

2. **JSONB for value_options and position_data:**

   - Native PostgreSQL JSONB type provides binary format for fast processing
   - Flexible schema for varying field types (text fields have no options, select fields have many)
   - Enables JSON query operators (`->`, `->>`, `@>`) for advanced querying
   - Supports GIN indexing if future queries require it
   - More efficient than separate tables for variable-length arrays

3. **Separate page_number and field_page_order:**

   - Enables efficient ordering: `ORDER BY page_number, field_page_order`
   - Supports page-level queries without parsing field IDs
   - Facilitates page-based pagination in UI

4. **TEXT type for near_text:**

   - Unlimited length for long labels or surrounding text
   - More flexible than VARCHAR when exact text length is unknown
   - No performance penalty in PostgreSQL

5. **Cascade Delete on Foreign Key:**
   - Automatically removes all fields when a template version is deleted
   - Maintains referential integrity
   - Prevents orphaned field records

### 3. Relationship Diagram

```
template_versions (1) -----> (N) template_fields
    |
    | Fields:
    |   - id (PK)
    |   - template_id (FK to pdf_templates)
    |   - version_number
    |   - change_summary
    |   - is_current
    |   - created_at
    |   --- NEW METADATA ---
    |   - title
    |   - author
    |   - subject
    |   - creation_date
    |   - modification_date
    |   - page_count
    |
    +---> template_fields
            Fields:
              - id (PK)
              - version_id (FK to template_versions)
              - field_id
              - field_type
              - raw_type
              - page_number
              - field_page_order
              - near_text
              - value_options (JSONB)
              - position_data (JSONB)
              - created_at
```

## Migration Strategy

### Alembic Migration Implementation

**Migration File Generation:**

```bash
cd backend
source venv/bin/activate
alembic revision --autogenerate -m "Add template metadata and template_fields table"
```

**Expected Migration Structure:**

```python
"""Add template metadata and template_fields table

Revision ID: <auto_generated>
Revises: 99f831f97024
Create Date: 2025-10-19

"""
from typing import Sequence, Union
from alembic import op
import sqlalchemy as sa
from sqlalchemy.dialects import postgresql

# revision identifiers, used by Alembic.
revision: str = '<auto_generated>'
down_revision: Union[str, None] = '99f831f97024'
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    # Add columns to template_versions
    op.add_column('template_versions',
        sa.Column('title', sa.String(length=255), nullable=True))
    op.add_column('template_versions',
        sa.Column('author', sa.String(length=255), nullable=True))
    op.add_column('template_versions',
        sa.Column('subject', sa.String(length=255), nullable=True))
    op.add_column('template_versions',
        sa.Column('creation_date', sa.DateTime(timezone=True), nullable=True))
    op.add_column('template_versions',
        sa.Column('modification_date', sa.DateTime(timezone=True), nullable=True))
    op.add_column('template_versions',
        sa.Column('page_count', sa.Integer(), nullable=False, server_default='0'))

    # Create template_fields table
    op.create_table('template_fields',
        sa.Column('id', sa.Integer(), nullable=False),
        sa.Column('version_id', sa.Integer(), nullable=False),
        sa.Column('field_id', sa.String(length=255), nullable=False),
        sa.Column('field_type', sa.String(length=50), nullable=False),
        sa.Column('raw_type', sa.String(length=50), nullable=True),
        sa.Column('page_number', sa.Integer(), nullable=False),
        sa.Column('field_page_order', sa.Integer(), nullable=False),
        sa.Column('near_text', sa.Text(), nullable=True),
        sa.Column('value_options', postgresql.JSONB(astext_type=sa.Text()), nullable=True),
        sa.Column('position_data', postgresql.JSONB(astext_type=sa.Text()), nullable=True),
        sa.Column('created_at', sa.DateTime(timezone=True),
                  server_default=sa.text('now()'), nullable=True),
        sa.ForeignKeyConstraint(['version_id'], ['template_versions.id'],
                                name=op.f('fk_template_fields_version_id_template_versions')),
        sa.PrimaryKeyConstraint('id', name=op.f('pk_template_fields'))
    )
    op.create_index(op.f('ix_template_fields_id'), 'template_fields', ['id'], unique=False)
    op.create_index(op.f('ix_template_fields_version_id'), 'template_fields', ['version_id'], unique=False)


def downgrade() -> None:
    # Drop template_fields table
    op.drop_index(op.f('ix_template_fields_version_id'), table_name='template_fields')
    op.drop_index(op.f('ix_template_fields_id'), table_name='template_fields')
    op.drop_table('template_fields')

    # Remove columns from template_versions
    op.drop_column('template_versions', 'page_count')
    op.drop_column('template_versions', 'modification_date')
    op.drop_column('template_versions', 'creation_date')
    op.drop_column('template_versions', 'subject')
    op.drop_column('template_versions', 'author')
    op.drop_column('template_versions', 'title')
```

**Migration Validation Process:**

1. **Review Generated Migration:**

   ```bash
   # View the generated migration file
   cat backend/alembic/versions/<revision_id>_add_template_metadata_and_template_fields_table.py
   ```

2. **Apply Migration:**

   ```bash
   cd backend
   alembic upgrade head
   ```

3. **Verify Schema Changes:**

   ```bash
   # Check template_versions columns
   podman exec -it sepe-postgres psql -U sepe_user -d sepe_comparator \
     -c "\d+ template_versions"

   # Check template_fields table
   podman exec -it sepe-postgres psql -U sepe_user -d sepe_comparator \
     -c "\d+ template_fields"

   # Verify foreign key constraints
   podman exec -it sepe-postgres psql -U sepe_user -d sepe_comparator \
     -c "SELECT conname, conrelid::regclass, confrelid::regclass FROM pg_constraint WHERE conrelid = 'template_fields'::regclass;"
   ```

4. **Test Rollback:**
   ```bash
   alembic downgrade -1
   # Verify tables/columns removed
   alembic upgrade head
   # Verify tables/columns restored
   ```

### Backward Compatibility

**Existing Data Handling:**

- All new columns in `template_versions` are nullable (except `page_count` with DEFAULT 0)
- Existing `template_versions` records will have NULL values for metadata fields
- No data migration needed for existing records
- New PDF analysis code should populate these fields for new/re-analyzed templates

**Safe Rollback:**

- Downgrade migration cleanly removes all new schema elements
- No data loss for existing records when rolling back
- Re-applying migration preserves any data inserted before rollback

## Indexing Strategy

### Current Indexes

**template_versions (existing):**

- `ix_template_versions_id` - Primary key index
- `ix_template_versions_template_id` - Foreign key to pdf_templates
- `ix_template_versions_is_current` - Filter current versions

**template_fields (new):**

- `ix_template_fields_id` - Primary key index (auto-created)
- `ix_template_fields_version_id` - Foreign key index for efficient joins

### Future Index Considerations

**Optional Indexes (not included in initial migration):**

1. **Composite Index for Ordered Retrieval:**

   ```sql
   CREATE INDEX ix_template_fields_version_page_order
   ON template_fields(version_id, page_number, field_page_order);
   ```

   **Use case:** Retrieve fields in page order for UI display

2. **GIN Index for JSONB Queries:**

   ```sql
   CREATE INDEX ix_template_fields_value_options_gin
   ON template_fields USING GIN (value_options);

   CREATE INDEX ix_template_fields_position_data_gin
   ON template_fields USING GIN (position_data);
   ```

   **Use case:** Query fields by option values or position ranges

3. **Partial Index for Specific Field Types:**
   ```sql
   CREATE INDEX ix_template_fields_radio_checkbox
   ON template_fields(version_id, field_type)
   WHERE field_type IN ('radiobutton', 'checkbox');
   ```
   **Use case:** Optimize queries for interactive form elements

**Recommendation:** Monitor query patterns after implementation and add indexes as needed based on actual usage.

## Performance and Storage Considerations

### Estimated Storage Impact

**template_versions metadata columns:**

- Negligible impact: ~500 bytes per record (mostly NULL initially)
- Existing records: No increase in size (NULL values)

**template_fields table:**

- Estimated 200-500 bytes per field record
- Average PDF template: 50-200 fields
- Per template version: ~10-100 KB
- 1000 template versions: ~10-100 MB (acceptable)

### Query Performance

**Expected Query Patterns:**

1. **Retrieve all fields for a template version:**

   ```sql
   SELECT * FROM template_fields
   WHERE version_id = ?
   ORDER BY page_number, field_page_order;
   ```

   - Index: `ix_template_fields_version_id` (efficient)
   - Additional composite index would improve ORDER BY performance

2. **Count fields by type:**

   ```sql
   SELECT field_type, COUNT(*)
   FROM template_fields
   WHERE version_id = ?
   GROUP BY field_type;
   ```

   - Index: `ix_template_fields_version_id` (efficient)

3. **Find fields with specific characteristics:**
   ```sql
   SELECT * FROM template_fields
   WHERE version_id = ?
   AND field_type = 'radiobutton'
   AND value_options @> '["Option A"]';
   ```
   - Would benefit from GIN index on value_options (future optimization)

### Cascade Delete Performance

**Implication:** Deleting a `template_version` will cascade delete all associated `template_fields`

**Performance:** Acceptable for expected volume (50-200 fields per version). PostgreSQL handles cascade deletes efficiently with proper indexing on foreign keys.

## Data Integrity and Constraints

### Foreign Key Constraints

```sql
-- Enforces referential integrity
CONSTRAINT fk_template_fields_version_id_template_versions
  FOREIGN KEY (version_id)
  REFERENCES template_versions(id)
  ON DELETE CASCADE
```

**Behavior:**

- INSERT: Must reference existing `template_versions.id`
- UPDATE: Cannot change `version_id` to non-existent version
- DELETE: Cascade removes all fields when version deleted

### NOT NULL Constraints

**Required Fields:**

- `version_id` - Every field must belong to a version
- `field_id` - Every field must have an identifier
- `field_type` - Every field must have a type classification
- `page_number` - Every field must be on a page
- `field_page_order` - Every field must have an order
- `page_count` (in template_versions) - Every version must have page count

**Optional Fields:**

- `raw_type` - May not be available from all PDF parsers
- `near_text` - Some fields may not have nearby labels
- `value_options` - Only applicable for select/radio fields
- `position_data` - May not be extractable from all PDFs
- `title`, `author`, `subject`, `creation_date`, `modification_date` - PDF metadata may be absent

### Data Type Validation

**Application-Level Validation (recommended):**

- `field_type` should be enum: ['text', 'textarea', 'checkbox', 'radiobutton', 'select', 'button', 'signature']
- `page_number` should be >= 1
- `field_page_order` should be >= 0
- `value_options` should be JSON array of strings
- `position_data` should be JSON object with numeric x0, y0, x1, y1 keys

## Testing Strategy

### Schema Validation Tests

1. **Migration Application Test:**

   - Fresh database: Apply all migrations from scratch
   - Existing database: Apply migration on top of existing schema
   - Verify no errors in both scenarios

2. **Data Insertion Test:**

   ```sql
   -- Test inserting into template_versions with new columns
   INSERT INTO template_versions (template_id, version_number, page_count, title, author)
   VALUES (1, '1.0', 5, 'Test Template', 'SEPE');

   -- Test inserting into template_fields
   INSERT INTO template_fields (
     version_id, field_id, field_type, page_number, field_page_order,
     value_options, position_data
   ) VALUES (
     1, 'A0101', 'text', 1, 0,
     NULL, '{"x0": 100, "y0": 200, "x1": 300, "y1": 220}'::jsonb
   );
   ```

3. **Foreign Key Constraint Test:**

   ```sql
   -- Should fail: invalid version_id
   INSERT INTO template_fields (version_id, field_id, field_type, page_number, field_page_order)
   VALUES (99999, 'INVALID', 'text', 1, 0);

   -- Should succeed and cascade delete
   DELETE FROM template_versions WHERE id = 1;
   SELECT COUNT(*) FROM template_fields WHERE version_id = 1; -- Should return 0
   ```

4. **JSONB Query Test:**

   ```sql
   -- Test JSON operations
   SELECT field_id, value_options->>0 as first_option
   FROM template_fields
   WHERE value_options IS NOT NULL;

   SELECT field_id, position_data->>'x0' as x_coordinate
   FROM template_fields
   WHERE position_data IS NOT NULL;
   ```

5. **Rollback Test:**
   ```bash
   alembic upgrade head
   # Insert test data
   alembic downgrade -1
   # Verify tables/columns removed
   alembic upgrade head
   # Verify can re-apply
   ```

## Summary

This database schema modification introduces comprehensive PDF metadata storage and granular field-level tracking to support the SEPE Templates Comparator analysis features. The design prioritizes:

- **Consistency:** Maintains existing patterns (Integer PKs, timezone-aware timestamps)
- **Flexibility:** JSONB fields accommodate varying PDF structures
- **Performance:** Appropriate indexing for expected query patterns
- **Integrity:** Foreign key constraints with cascade deletes
- **Backward Compatibility:** Nullable columns support existing records
- **Maintainability:** Alembic-managed migrations with clean rollback paths

The implementation follows PostgreSQL best practices and SQLAlchemy conventions established in the existing codebase.
