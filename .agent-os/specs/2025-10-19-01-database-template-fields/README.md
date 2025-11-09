# Database Schema Modifications Specification

**Created:** 2025-10-19  
**Status:** Ready for Implementation  
**Sprint:** Database Enhancement for PDF Analysis

## Quick Links

- 📋 [Spec Requirements](spec.md) - Full specification document
- 📝 [Spec Summary (Lite)](spec-lite.md) - Quick overview
- 🔧 [Technical Specification](sub-specs/technical-spec.md) - Implementation details
- 🗄️ [Database Schema](sub-specs/database-schema.md) - SQL specifications and migration strategy

## Overview

This specification defines database schema modifications to support PDF template analysis functionality in the SEPE Templates Comparator project. The changes include:

1. **Template Versions Enhancement**: Add 6 metadata columns (title, author, subject, creation_date, modification_date, page_count)
2. **Template Fields Table**: Create new table to store detailed AcroForm field data with 1:N relationship

## Key Decisions

### Integer vs UUID Primary Keys

**Decision:** Use Integer (SERIAL) primary keys for `template_fields` table

**Rationale:**

- Maintains consistency with existing codebase (all tables use Integer PKs)
- Better performance for joins and smaller storage footprint
- Easier debugging with sequential IDs
- Avoids breaking existing relationship patterns

**Note:** The user specification requested UUID, but consistency with the established architecture takes precedence. A future migration to UUID can be planned if needed.

### JSONB for Variable Data

**Decision:** Use PostgreSQL JSONB for `value_options` and `position_data` columns

**Rationale:**

- Flexible schema for varying field types
- Native PostgreSQL support with efficient binary format
- Enables JSON operators for querying
- Avoids complex normalization for variable-length data

## Implementation Checklist

### Phase 1: Model Updates ✅ COMPLETED

- [x] Modify `TemplateVersion` model with 6 new metadata columns
- [x] Create `TemplateField` model class
- [x] Add bidirectional relationship between models
- [x] Verify imports (JSON, Text types)

### Phase 2: Migration ✅ COMPLETED

- [x] Generate Alembic migration: `alembic revision --autogenerate -m "Add template metadata and template_fields table"`
- [x] Review generated migration file
- [x] Apply migration: `alembic upgrade head`
- [x] Verify schema in PostgreSQL

### Phase 3: Validation ✅ COMPLETED

- [x] Test relationship queries (version.fields, field.version)
- [x] Test cascade delete behavior
- [x] Test migration rollback: `alembic downgrade -1`
- [x] Re-apply migration: `alembic upgrade head`

### Phase 4: Documentation ✅ COMPLETED

- [x] Update `techdesign/database_schema.md` with new structures
- [x] Added 6 new columns to template_versions documentation
- [x] Added complete template_fields table documentation
- [x] Updated relationship diagram
- [x] Added 8 example SQL queries

## Files to Modify

| File                                | Change Type | Description                                                  |
| ----------------------------------- | ----------- | ------------------------------------------------------------ |
| `backend/app/models/template.py`    | MODIFY      | Add 6 columns to TemplateVersion, create TemplateField class |
| `backend/alembic/versions/<new>.py` | CREATE      | New migration file (auto-generated)                          |
| `techdesign/database_schema.md`     | UPDATE      | Document new schema elements (future task)                   |

## Dependencies

- No new external dependencies required
- Uses existing: SQLAlchemy, Alembic, PostgreSQL with JSONB support

## Estimated Impact

- **Development Time:** 2-3 hours (model changes + migration + testing)
- **Database Size:** ~10-100 MB for 1000 template versions
- **Performance:** Minimal impact with proper indexing
- **Backward Compatibility:** ✅ Existing records unaffected (nullable columns)

## Testing Commands

```bash
# Apply migration
cd backend
source venv/bin/activate
alembic upgrade head

# Verify in PostgreSQL
podman exec -it sepe-postgres psql -U sepe_user -d sepe_comparator -c "\d+ template_versions"
podman exec -it sepe-postgres psql -U sepe_user -d sepe_comparator -c "\d+ template_fields"

# Test rollback
alembic downgrade -1
alembic upgrade head
```

## Next Steps

After reviewing this specification:

1. Run `/create-tasks` to generate implementation tasks
2. Implement model changes in `backend/app/models/template.py`
3. Generate and review Alembic migration
4. Apply migration and verify schema
5. Update documentation and tests

## Notes

- Migration is backward compatible (nullable columns)
- Cascade delete ensures referential integrity
- JSONB enables flexible field data storage
- Indexing strategy can be optimized based on query patterns
- Follows PEP 8 and project coding standards

---

**Ready for implementation** ✅
