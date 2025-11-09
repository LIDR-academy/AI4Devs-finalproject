# Migration 51b79a431ff8 Testing Guide

## Overview

This document provides step-by-step instructions for testing the database migration that refactors the template versioning structure.

**Migration:** `51b79a431ff8_refactor_template_versioning_structure.py`

**Purpose:** Move version-specific attributes from `pdf_templates` to `template_versions` to implement proper version atomicity.

## Pre-Migration Checklist

### 1. Backup Database

```bash
# Create a backup before running migration
pg_dump -h localhost -U your_user -d your_database > backup_before_51b79a431ff8.sql

# Or if using docker
docker exec -t your_postgres_container pg_dump -U your_user your_database > backup_before_51b79a431ff8.sql
```

### 2. Verify Current State

Run the pre-migration validation queries from `scripts/validate_migration_51b79a431ff8.sql`:

```bash
psql -h localhost -U your_user -d your_database -f scripts/validate_migration_51b79a431ff8.sql
```

**Expected Results:**

- Count of templates and versions should be > 0
- All templates should have at least one version
- Templates marked as `is_current = TRUE` should exist

### 3. Document Current Counts

Record these values for comparison after migration:

```sql
-- Record these numbers
SELECT COUNT(*) as total_templates FROM pdf_templates;
SELECT COUNT(*) as total_versions FROM template_versions;
SELECT COUNT(*) as current_versions FROM template_versions WHERE is_current = TRUE;
```

**Recorded Values:**

- Total templates: **\_\_**
- Total versions: **\_\_**
- Current versions: **\_\_**

## Migration Execution

### 1. Check Migration Status

```bash
cd backend
alembic current
```

**Expected Output:** Should show `fa338313b3a3` (previous migration)

### 2. Review Migration Plan

```bash
alembic upgrade 51b79a431ff8 --sql > migration_plan.sql
```

Review the generated SQL to understand what will be executed.

### 3. Run Migration (Development First!)

```bash
# IMPORTANT: Test on development database first!
alembic upgrade head
```

**Expected Output:**

```
INFO  [alembic.runtime.migration] Running upgrade fa338313b3a3 -> 51b79a431ff8, refactor_template_versioning_structure
```

### 4. Verify Migration Applied

```bash
alembic current
```

**Expected Output:** Should show `51b79a431ff8`

## Post-Migration Validation

### 1. Run Validation Queries

Execute post-migration validation queries from the validation script:

```sql
-- Verify column changes in pdf_templates
SELECT column_name, data_type, is_nullable
FROM information_schema.columns
WHERE table_name = 'pdf_templates'
  AND column_name IN ('current_version', 'comment')
ORDER BY column_name;
```

**Expected Results:**

- `current_version` should exist (VARCHAR(50), NOT NULL)
- `comment` should exist (TEXT, NULL)
- `version`, `file_path`, `file_size_bytes`, `field_count`, `sepe_url` should NOT exist

```sql
-- Verify new columns in template_versions
SELECT column_name, data_type, is_nullable
FROM information_schema.columns
WHERE table_name = 'template_versions'
  AND column_name IN ('file_path', 'file_size_bytes', 'field_count', 'sepe_url')
ORDER BY column_name;
```

**Expected Results:**

- All 4 columns should exist
- `file_path`, `file_size_bytes`, `field_count` should be NOT NULL
- `sepe_url` should be NULL

### 2. Verify Data Migration

```sql
-- Check for NULL values (should return 0 rows)
SELECT COUNT(*) FROM template_versions WHERE file_path IS NULL;
SELECT COUNT(*) FROM template_versions WHERE file_size_bytes IS NULL;
SELECT COUNT(*) FROM template_versions WHERE field_count IS NULL;
```

**Expected Result:** All counts should be `0`

```sql
-- Sample data verification
SELECT
    pt.id,
    pt.name,
    pt.current_version,
    tv.version_number,
    tv.file_path,
    tv.file_size_bytes,
    tv.field_count,
    tv.is_current
FROM pdf_templates pt
JOIN template_versions tv ON pt.id = tv.template_id
WHERE tv.is_current = TRUE
LIMIT 5;
```

**Expected Result:** Should show templates with their current version data populated

### 3. Verify Constraints and Indexes

```sql
-- Check unique constraint
SELECT constraint_name FROM information_schema.table_constraints
WHERE table_name = 'template_versions'
  AND constraint_name = 'uq_template_versions_template_id_version_number';
```

**Expected Result:** Should return 1 row

```sql
-- Check indexes
SELECT indexname FROM pg_indexes
WHERE tablename = 'template_versions'
  AND indexname IN ('idx_template_versions_current_lookup', 'idx_template_versions_version_number');
```

**Expected Result:** Should return 2 rows

### 4. Verify No Data Loss

Compare counts with pre-migration values:

```sql
SELECT COUNT(*) as total_templates FROM pdf_templates;
SELECT COUNT(*) as total_versions FROM template_versions;
```

**Expected Result:** Counts should match pre-migration values exactly

### 5. Test Application Queries

Test the query pattern that will be used in the application:

```sql
-- Get templates with current version data
SELECT
    pt.id,
    pt.name,
    pt.current_version,
    pt.comment,
    tv.file_path,
    tv.file_size_bytes,
    tv.field_count,
    tv.sepe_url
FROM pdf_templates pt
LEFT JOIN template_versions tv ON pt.id = tv.template_id AND tv.is_current = TRUE
LIMIT 10;
```

**Expected Result:** Should return templates with version-specific data from the joined version record

## Rollback Testing

### 1. Test Rollback (Development Only!)

```bash
# Downgrade to previous migration
alembic downgrade fa338313b3a3
```

**Expected Output:**

```
INFO  [alembic.runtime.migration] Running downgrade 51b79a431ff8 -> fa338313b3a3, refactor_template_versioning_structure
```

### 2. Verify Rollback

```sql
-- Verify original structure restored
SELECT column_name FROM information_schema.columns
WHERE table_name = 'pdf_templates'
  AND column_name IN ('version', 'file_path', 'file_size_bytes', 'field_count', 'sepe_url');
```

**Expected Result:** All 5 columns should exist

```sql
-- Verify data restored to pdf_templates
SELECT id, name, version, file_path, file_size_bytes, field_count
FROM pdf_templates
LIMIT 5;
```

**Expected Result:** Data should be populated (from current versions)

### 3. Re-apply Migration

After verifying rollback works, re-apply the migration:

```bash
alembic upgrade head
```

## Performance Testing

### 1. Query Performance

Test the performance of the new query pattern:

```sql
EXPLAIN ANALYZE
SELECT
    pt.id,
    pt.name,
    pt.current_version,
    tv.file_path,
    tv.file_size_bytes,
    tv.field_count,
    tv.sepe_url
FROM pdf_templates pt
LEFT JOIN template_versions tv ON pt.id = tv.template_id AND tv.is_current = TRUE
LIMIT 20;
```

**Expected Result:**

- Should use index on `idx_template_versions_current_lookup`
- Execution time should be < 50ms for 20 rows

### 2. Index Usage Verification

```sql
EXPLAIN ANALYZE
SELECT * FROM template_versions
WHERE template_id = 1 AND is_current = TRUE;
```

**Expected Result:**

- Should use `idx_template_versions_current_lookup` index
- Index scan instead of sequential scan

## Troubleshooting

### Issue: Migration Fails with "column does not exist"

**Cause:** Migration was partially applied or database is in inconsistent state

**Solution:**

1. Check current migration version: `alembic current`
2. Manually verify which columns exist
3. If needed, manually fix schema then stamp: `alembic stamp 51b79a431ff8`

### Issue: Data migration fails (NULL values after migration)

**Cause:** Templates without corresponding versions

**Solution:**

1. Check for templates without versions:
   ```sql
   SELECT pt.* FROM pdf_templates pt
   LEFT JOIN template_versions tv ON pt.id = tv.template_id
   WHERE tv.id IS NULL;
   ```
2. Create missing versions or remove orphaned templates

### Issue: Unique constraint violation

**Cause:** Duplicate version numbers for same template

**Solution:**

1. Find duplicates:
   ```sql
   SELECT template_id, version_number, COUNT(*)
   FROM template_versions
   GROUP BY template_id, version_number
   HAVING COUNT(*) > 1;
   ```
2. Resolve duplicates before re-running migration

## Production Deployment Checklist

Before deploying to production:

- [ ] Migration tested successfully on development database
- [ ] Rollback tested successfully on development database
- [ ] All validation queries pass
- [ ] Performance tests show acceptable query times
- [ ] Backup created and verified
- [ ] Deployment window scheduled (estimate: 5-10 minutes)
- [ ] Rollback plan documented
- [ ] Team notified of deployment

### Production Deployment Steps

1. **Announce maintenance window** (application downtime)
2. **Create production backup**
   ```bash
   pg_dump -h prod_host -U prod_user -d prod_database > backup_prod_before_51b79a431ff8.sql
   ```
3. **Stop application servers** (prevent writes during migration)
4. **Run pre-migration validation queries**
5. **Execute migration**
   ```bash
   alembic upgrade head
   ```
6. **Run post-migration validation queries**
7. **Verify no data loss** (compare counts)
8. **Start application servers**
9. **Smoke test application** (verify templates page works)
10. **Monitor logs** for any errors

### Production Rollback Plan

If issues occur:

1. **Stop application servers**
2. **Run rollback**
   ```bash
   alembic downgrade fa338313b3a3
   ```
3. **Verify rollback** with validation queries
4. **Restore from backup if rollback fails**
   ```bash
   psql -h prod_host -U prod_user -d prod_database < backup_prod_before_51b79a431ff8.sql
   ```
5. **Start application servers** with old code version

## Success Criteria

Migration is considered successful when:

- [ ] Migration completes without errors
- [ ] All validation queries pass
- [ ] Template and version counts match pre-migration
- [ ] No NULL values in required fields
- [ ] Unique constraint and indexes created
- [ ] Application queries work correctly
- [ ] Performance is acceptable (< 50ms for template list)
- [ ] Rollback tested and works
- [ ] Frontend displays templates correctly

## Documentation

After successful migration:

1. Update database schema documentation
2. Document new query patterns for developers
3. Update API documentation
4. Add notes to project changelog
5. Archive this testing document with results

## Contact

For issues or questions:

- Database Admin: [contact info]
- Backend Team Lead: [contact info]
- DevOps Team: [contact info]
