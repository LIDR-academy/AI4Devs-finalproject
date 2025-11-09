# Migration Notes: Comparison Persistence

**Migration ID:** `20251027_094913_add_comparison_persistence`  
**Date:** 2025-10-27  
**Revises:** `51b79a431ff8` (refactor_template_versioning_structure)

## Purpose

This migration transforms the database schema to support persistence of complete comparison analysis results. It changes the foreign key relationships from templates to template versions and adds comprehensive columns for storing comparison data.

## Critical Changes

### 1. Foreign Key Transformation (⚠️ HIGH RISK)

**Before:**

```sql
source_template_id → pdf_templates(id)
target_template_id → pdf_templates(id)
```

**After:**

```sql
source_version_id → template_versions(id)
target_version_id → template_versions(id)
```

This change is necessary because comparisons analyze specific versions, not templates.

### 2. New Columns in `comparisons` Table

- `modification_percentage` (FLOAT, default 0.0)
- `fields_added` (INTEGER, default 0)
- `fields_removed` (INTEGER, default 0)
- `fields_modified` (INTEGER, default 0)
- `fields_unchanged` (INTEGER, default 0)

### 3. New Columns in `comparison_fields` Table

**Field Identification:**

- `field_id` (VARCHAR(255))
- `status` (VARCHAR(20)) - ADDED/REMOVED/MODIFIED/UNCHANGED

**Page Information:**

- `source_page_number` (INTEGER)
- `target_page_number` (INTEGER)
- `page_number_changed` (BOOLEAN)

**Text Comparison:**

- `near_text_diff` (VARCHAR(20))
- `source_near_text` (TEXT)
- `target_near_text` (TEXT)

**Value Options (JSONB):**

- `value_options_diff` (VARCHAR(20))
- `source_value_options` (JSONB)
- `target_value_options` (JSONB)

**Position Data (JSONB):**

- `position_change` (VARCHAR(20))
- `source_position` (JSONB)
- `target_position` (JSONB)

### 4. New Indexes

- `ix_comparisons_source_version_id`
- `ix_comparisons_target_version_id`
- `ix_comparisons_modification_percentage`
- `ix_comparison_fields_field_id`
- `ix_comparison_fields_status`

### 5. Check Constraints

- Ensure source and target versions are different
- Ensure modification percentage is 0-100
- Ensure field counts are non-negative
- Ensure status values are valid enums
- Ensure diff status values are valid enums or NULL

## Migration Operations Summary

**Upgrade:** 39 operations

- 2 FK constraint drops
- 2 column renames
- 2 FK constraint creates
- 19 column additions
- 5 index operations (2 drops, 5 creates)
- 7 check constraint creates

**Downgrade:** 39 operations (complete rollback)

- All operations reversed in correct order
- Restores original schema exactly

## Pre-Migration Checklist

- [ ] Take full database backup
- [ ] Verify no active comparisons in progress
- [ ] Check that template_versions table has data
- [ ] Verify down_revision matches current head
- [ ] Test migration in staging environment first

## Running the Migration

### Upgrade

```bash
cd backend
alembic upgrade head
```

### Verify Migration

```bash
# Check current revision
alembic current

# List all revisions
alembic history

# Check database tables
psql -d your_database -c "\d comparisons"
psql -d your_database -c "\d comparison_fields"
```

### Rollback (if needed)

```bash
alembic downgrade -1
```

## Post-Migration Verification

1. **Check Foreign Keys:**

   ```sql
   SELECT conname, conrelid::regclass, confrelid::regclass
   FROM pg_constraint
   WHERE conrelid = 'comparisons'::regclass AND contype = 'f';
   ```

2. **Check New Columns:**

   ```sql
   SELECT column_name, data_type, is_nullable
   FROM information_schema.columns
   WHERE table_name = 'comparisons'
   ORDER BY ordinal_position;
   ```

3. **Check Indexes:**

   ```sql
   SELECT indexname, indexdef
   FROM pg_indexes
   WHERE tablename IN ('comparisons', 'comparison_fields')
   ORDER BY tablename, indexname;
   ```

4. **Check Constraints:**
   ```sql
   SELECT conname, contype, pg_get_constraintdef(oid)
   FROM pg_constraint
   WHERE conrelid IN ('comparisons'::regclass, 'comparison_fields'::regclass)
   AND contype = 'c'
   ORDER BY conname;
   ```

## Known Issues and Limitations

1. **Data Migration:** This migration does NOT migrate existing comparison data. If you have existing comparisons in the old format, you'll need a separate data migration script.

2. **Cascade Deletes:** Deleting a template version will cascade delete all comparisons referencing it. Ensure this behavior is acceptable.

3. **Old Columns:** The old columns (`field_name`, `change_type`, `old_value`, `new_value`, `position_x`, `position_y`) are retained for backward compatibility. They can be removed in a future migration.

## Performance Considerations

- The migration adds multiple indexes which will improve query performance
- JSONB columns provide flexible storage without sacrificing query capabilities
- Check constraints ensure data integrity at the database level
- Estimated migration time: < 10 seconds for small databases (< 1000 comparisons)

## Rollback Plan

If issues are discovered after migration:

1. **Immediate Rollback:**

   ```bash
   alembic downgrade -1
   ```

2. **Verify Rollback:**

   - Check that foreign keys point back to pdf_templates
   - Verify old column names are restored
   - Confirm all new columns are removed

3. **Fix and Retry:**
   - Address issues in migration file
   - Test in staging
   - Re-apply migration

## Testing Performed

✅ Syntax validation  
✅ Import statement check  
✅ Function signature verification  
✅ Operation count verification (39 upgrade, 39 downgrade)  
✅ Table and column name validation  
✅ Check constraint validation

## Next Steps

After successful migration:

1. Update SQLAlchemy models in `backend/app/models/comparison.py`
2. Create new Pydantic schemas
3. Implement comparison persistence service methods
4. Create API endpoints for save/retrieve/list
5. Update frontend to integrate with new endpoints

## Support

For issues or questions:

- Review migration file: `backend/alembic/versions/20251027_094913_add_comparison_persistence.py`
- Check specification: `.agent-os/specs/2025-10-27-01-comparison-persistence/`
- Database schema doc: `.agent-os/specs/2025-10-27-01-comparison-persistence/sub-specs/database-schema.md`
