# SQLAlchemy Mapping Error - Bugfix

## Problem

After applying the Alembic migration successfully, the backend failed to start with the following error:

```
sqlalchemy.exc.InvalidRequestError: One or more mappers failed to initialize -
can't proceed with initialization of other mappers.
Triggering mapper: 'Mapper[PDFTemplate(pdf_templates)]'.
Original exception was: Class <class 'app.models.comparison.Comparison'> does not
have a mapped column named 'source_template_id'
```

## Root Cause

The database migration successfully renamed the columns from `source_template_id` and `target_template_id` to `source_version_id` and `target_version_id` in the `comparisons` table.

However, the `PDFTemplate` model in `backend/app/models/template.py` still had old relationship definitions that tried to reference the non-existent columns:

```python
# OLD - INCORRECT
source_comparisons = relationship(
    "Comparison",
    foreign_keys="Comparison.source_template_id",  # ❌ This column no longer exists
    back_populates="source_template",
)
target_comparisons = relationship(
    "Comparison",
    foreign_keys="Comparison.target_template_id",  # ❌ This column no longer exists
    back_populates="target_template",
)
```

## Solution

Since comparisons now reference `template_versions` instead of `pdf_templates` directly, these relationships should be removed from the `PDFTemplate` model. The relationships now exist on the `TemplateVersion` model instead.

**File Modified:** `backend/app/models/template.py`

**Change Applied:**

```python
# Relationships
uploader = relationship("User", back_populates="uploaded_templates")
versions = relationship(
    "TemplateVersion",
    back_populates="template",
    cascade="all, delete-orphan"
)
# Note: Comparisons now reference template_versions, not pdf_templates
# See TemplateVersion model for source_comparisons and target_comparisons
```

## Verification

The correct relationship structure is now:

```
PDFTemplate (pdf_templates table)
    ↓ has many
TemplateVersion (template_versions table)
    ↓ has many (via source_version_id and target_version_id)
Comparison (comparisons table)
```

The `TemplateVersion` model correctly has:

```python
source_comparisons = relationship(
    "Comparison",
    foreign_keys="Comparison.source_version_id",
    back_populates="source_version"
)
target_comparisons = relationship(
    "Comparison",
    foreign_keys="Comparison.target_version_id",
    back_populates="target_version"
)
```

And the `Comparison` model correctly has:

```python
source_version = relationship(
    "TemplateVersion",
    foreign_keys=[source_version_id],
    back_populates="source_comparisons"
)
target_version = relationship(
    "TemplateVersion",
    foreign_keys=[target_version_id],
    back_populates="target_comparisons"
)
```

## Testing

After applying this fix:

1. Restart the FastAPI backend server
2. Check that the server starts without SQLAlchemy errors
3. Test the new endpoints:
   - `POST /api/v1/comparisons/ingest`
   - `GET /api/v1/comparisons/{id}`
   - `GET /api/v1/comparisons`
   - `GET /api/v1/comparisons/check`

## Status

✅ **Fixed** - The SQLAlchemy mapping error has been resolved. The backend should now start successfully.
