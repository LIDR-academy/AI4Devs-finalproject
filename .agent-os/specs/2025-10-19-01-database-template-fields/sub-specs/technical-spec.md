# Technical Specification

This is the technical specification for the spec detailed in @.agent-os/specs/2025-10-19-database-template-fields/spec.md

## Technical Requirements

### 1. Model Modifications

**File:** `backend/app/models/template.py`

#### 1.1 TemplateVersion Model Extensions

Add the following column definitions to the `TemplateVersion` class:

```python
# PDF Document Metadata
title = Column(String(255), nullable=True)
author = Column(String(255), nullable=True)
subject = Column(String(255), nullable=True)
creation_date = Column(DateTime(timezone=True), nullable=True)
modification_date = Column(DateTime(timezone=True), nullable=True)
page_count = Column(Integer, nullable=False, default=0)
```

**Type Specifications:**

- `title`, `author`, `subject`: VARCHAR(255) - Standard string fields for text metadata
- `creation_date`, `modification_date`: TIMESTAMP WITH TIME ZONE - Timezone-aware datetime for consistency with existing date fields
- `page_count`: INTEGER NOT NULL DEFAULT 0 - Required field with safe default

**Rationale:**

- All metadata fields except `page_count` are nullable to support existing records without migration
- `page_count` defaults to 0 to ensure data integrity while allowing existing records to remain valid
- DateTime fields use timezone awareness consistent with existing `created_at` pattern

#### 1.2 TemplateField Model Creation

Create a new SQLAlchemy model in `backend/app/models/template.py`:

```python
class TemplateField(Base):
    """Template field model for storing extracted PDF AcroForm field data."""

    __tablename__ = "template_fields"

    # Primary Key
    id = Column(Integer, primary_key=True, index=True)

    # Foreign Key to template_versions
    version_id = Column(Integer, ForeignKey("template_versions.id"), nullable=False, index=True)

    # Field Identification
    field_id = Column(String(255), nullable=False)
    field_type = Column(String(50), nullable=False)
    raw_type = Column(String(50), nullable=True)

    # Page Information
    page_number = Column(Integer, nullable=False)
    field_page_order = Column(Integer, nullable=False)

    # Field Content
    near_text = Column(Text, nullable=True)

    # JSON Fields (using JSONB for PostgreSQL)
    value_options = Column(JSON, nullable=True)
    position_data = Column(JSON, nullable=True)

    # Timestamps
    created_at = Column(DateTime(timezone=True), server_default=func.now())

    # Relationships
    version = relationship("TemplateVersion", back_populates="fields")

    def __repr__(self) -> str:
        return f"<TemplateField(id={self.id}, version_id={self.version_id}, field_id='{self.field_id}', type='{self.field_type}')>"
```

**Relationship Update in TemplateVersion:**

Add to the `TemplateVersion` class:

```python
# Relationships
template = relationship("PDFTemplate", back_populates="versions")
fields = relationship(
    "TemplateField",
    back_populates="version",
    cascade="all, delete-orphan"
)
```

**Type Specifications:**

- `id`: INTEGER - Auto-incrementing primary key (consistent with existing tables)
- `version_id`: INTEGER FK - Foreign key to template_versions.id
- `field_id`: VARCHAR(255) - Form field identifier (e.g., "A0101")
- `field_type`: VARCHAR(50) - Final control type (e.g., "text", "radiobutton", "checkbox")
- `raw_type`: VARCHAR(50) - Native PDF field type (e.g., "/Tx", "/Btn")
- `page_number`: INTEGER - Page number where field appears
- `field_page_order`: INTEGER - Sequential order of field within the page
- `near_text`: TEXT - Descriptive label or nearby text
- `value_options`: JSONB - Array of available options for select/radio fields
- `position_data`: JSONB - Bounding box coordinates {x0, y0, x1, y1}
- `created_at`: TIMESTAMP WITH TIME ZONE - Record creation timestamp

**Note on UUID vs Integer:** The user specification requested UUID for primary keys, but the existing codebase consistently uses Integer (SERIAL) for all primary keys across `users`, `pdf_templates`, `template_versions`, `comparisons`, and `comparison_fields` tables. To maintain consistency with the established pattern and avoid breaking existing relationships, this specification uses Integer primary keys. If UUID keys are required in the future, a separate migration strategy should be designed.

### 2. Import Requirements

Ensure the following imports are present in `backend/app/models/template.py`:

```python
from sqlalchemy import Column, Integer, String, DateTime, ForeignKey, Boolean, Text, JSON
from sqlalchemy.sql import func
from sqlalchemy.orm import relationship
```

**Note:** The `JSON` type will be automatically mapped to `JSONB` in PostgreSQL for better performance and indexing capabilities.

### 3. Alembic Migration Requirements

**Migration Command:**

```bash
cd backend
alembic revision --autogenerate -m "Add template metadata and template_fields table"
```

**Expected Migration Content:**

- Add 6 new columns to `template_versions` table
- Create new `template_fields` table with all columns and constraints
- Create indexes on `template_fields.id` and `template_fields.version_id`
- Create foreign key constraint from `template_fields.version_id` to `template_versions.id`
- Implement proper `upgrade()` and `downgrade()` functions

**Migration Validation Steps:**

1. Review generated migration file for correctness
2. Execute `alembic upgrade head` to apply migration
3. Verify schema changes with PostgreSQL:
   ```bash
   podman exec -it sepe-postgres psql -U sepe_user -d sepe_comparator -c "\d template_versions"
   podman exec -it sepe-postgres psql -U sepe_user -d sepe_comparator -c "\d template_fields"
   ```
4. Test rollback with `alembic downgrade -1`
5. Re-apply with `alembic upgrade head`

### 4. Code Style Requirements

**Python Conventions:**

- Follow PEP 8 style guide
- Use snake_case for all column names and function names
- Include docstrings for the new `TemplateField` model
- Add type hints where applicable
- Include `__repr__` method for debugging

**SQLAlchemy Conventions:**

- Use `Column()` declarations with explicit types
- Define relationships with proper `back_populates` bidirectional references
- Use `cascade="all, delete-orphan"` for child entities (template_fields)
- Set `index=True` on foreign keys and frequently queried columns
- Use `server_default=func.now()` for timestamp columns

### 5. Performance Considerations

**Indexing Strategy:**

- Primary key index on `template_fields.id` (automatic)
- Foreign key index on `template_fields.version_id` (explicit)
- Consider future composite index on `(version_id, page_number, field_page_order)` for ordered queries

**JSONB Benefits:**

- PostgreSQL JSONB provides binary storage format for faster processing
- Supports indexing with GIN indexes if needed in future
- Enables JSON operators for querying within JSON fields

### 6. Data Integrity Rules

**Constraints:**

- `template_fields.version_id` must reference valid `template_versions.id` (FK constraint)
- `template_fields.field_id` cannot be null (ensures field identification)
- `template_fields.field_type` cannot be null (ensures type classification)
- `template_fields.page_number` cannot be null (ensures page tracking)
- `template_fields.field_page_order` cannot be null (ensures ordering)

**Cascade Behavior:**

- Deleting a `TemplateVersion` will cascade delete all associated `TemplateField` records
- This maintains referential integrity and prevents orphaned field records

## Testing Requirements

### Database Migration Testing

1. **Fresh Database Test:**

   - Drop and recreate database
   - Run all migrations from scratch
   - Verify schema matches expectations

2. **Incremental Migration Test:**

   - Apply migration on existing database with data
   - Verify existing records are not affected
   - Verify new columns contain NULL or default values for existing records

3. **Rollback Test:**
   - Apply migration
   - Create test records in new table
   - Execute downgrade
   - Verify clean rollback without errors
   - Re-apply migration and verify functionality

### Model Validation Testing

1. **Relationship Test:**

   - Create `TemplateVersion` record
   - Create associated `TemplateField` records
   - Verify bidirectional relationship works (`version.fields` and `field.version`)
   - Verify cascade delete removes fields when version is deleted

2. **Data Type Test:**
   - Insert records with JSON data in `value_options` and `position_data`
   - Query and verify JSON data is properly serialized/deserialized
   - Test NULL handling for optional fields

## External Dependencies

No new external dependencies are required. The specification uses existing packages:

- **SQLAlchemy** (already installed) - ORM and schema definition
- **Alembic** (already installed) - Database migration management
- **PostgreSQL** (already configured) - Database with JSONB support

## Implementation Checklist

- [ ] Add 6 metadata columns to `TemplateVersion` model
- [ ] Create `TemplateField` model class with all columns
- [ ] Add `fields` relationship to `TemplateVersion` model
- [ ] Verify all imports are present
- [ ] Generate Alembic migration with autogenerate
- [ ] Review generated migration file
- [ ] Apply migration with `alembic upgrade head`
- [ ] Verify schema in PostgreSQL
- [ ] Test relationship queries in Python shell
- [ ] Test migration rollback
- [ ] Update model tests if existing
- [ ] Document new models in database_schema.md (future task)
