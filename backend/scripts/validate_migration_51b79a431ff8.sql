-- Migration Validation Script for 51b79a431ff8
-- Refactor Template Versioning Structure
--
-- This script provides SQL queries to validate the migration
-- before and after running it.

-- ============================================================================
-- PRE-MIGRATION VALIDATION QUERIES
-- ============================================================================

-- 1. Count existing templates
SELECT COUNT(*) as total_templates FROM pdf_templates;

-- 2. Count existing versions
SELECT COUNT(*) as total_versions FROM template_versions;

-- 3. Count versions marked as current
SELECT COUNT(*) as current_versions FROM template_versions WHERE is_current = TRUE;

-- 4. Verify all templates have at least one version
SELECT COUNT(*) as templates_without_versions
FROM pdf_templates pt
LEFT JOIN template_versions tv ON pt.id = tv.template_id
WHERE tv.id IS NULL;

-- 5. Check for templates with data that will be migrated
SELECT 
    pt.id,
    pt.name,
    pt.version as current_version_name,
    pt.file_path,
    pt.file_size_bytes,
    pt.field_count,
    pt.sepe_url
FROM pdf_templates pt
LIMIT 5;

-- 6. Verify current version exists for each template
SELECT 
    pt.id as template_id,
    pt.name,
    pt.version as template_version,
    tv.id as version_id,
    tv.version_number,
    tv.is_current
FROM pdf_templates pt
LEFT JOIN template_versions tv ON pt.id = tv.template_id AND tv.is_current = TRUE
LIMIT 5;

-- ============================================================================
-- POST-MIGRATION VALIDATION QUERIES
-- ============================================================================

-- 7. Verify column rename (current_version should exist)
SELECT column_name, data_type, is_nullable
FROM information_schema.columns
WHERE table_name = 'pdf_templates'
  AND column_name IN ('current_version', 'version', 'comment', 'file_path', 'file_size_bytes', 'field_count', 'sepe_url')
ORDER BY column_name;

-- 8. Verify new columns in template_versions
SELECT column_name, data_type, is_nullable
FROM information_schema.columns
WHERE table_name = 'template_versions'
  AND column_name IN ('file_path', 'file_size_bytes', 'field_count', 'sepe_url')
ORDER BY column_name;

-- 9. Verify data migration - check all versions have file data
SELECT COUNT(*) as versions_missing_file_path
FROM template_versions
WHERE file_path IS NULL;

SELECT COUNT(*) as versions_missing_file_size
FROM template_versions
WHERE file_size_bytes IS NULL;

SELECT COUNT(*) as versions_missing_field_count
FROM template_versions
WHERE field_count IS NULL;

-- 10. Verify unique constraint exists
SELECT constraint_name, constraint_type
FROM information_schema.table_constraints
WHERE table_name = 'template_versions'
  AND constraint_name = 'uq_template_versions_template_id_version_number';

-- 11. Verify indexes were created
SELECT indexname, indexdef
FROM pg_indexes
WHERE tablename = 'template_versions'
  AND indexname IN ('idx_template_versions_current_lookup', 'idx_template_versions_version_number');

-- 12. Sample data verification - compare template and version data
SELECT 
    pt.id as template_id,
    pt.name,
    pt.current_version,
    pt.comment,
    tv.id as version_id,
    tv.version_number,
    tv.file_path,
    tv.file_size_bytes,
    tv.field_count,
    tv.sepe_url,
    tv.is_current
FROM pdf_templates pt
JOIN template_versions tv ON pt.id = tv.template_id
WHERE tv.is_current = TRUE
LIMIT 5;

-- 13. Verify no data loss - count should match pre-migration
SELECT COUNT(*) as total_templates_after FROM pdf_templates;
SELECT COUNT(*) as total_versions_after FROM template_versions;

-- 14. Check for any null values that shouldn't be null (except sepe_url)
SELECT 
    id,
    template_id,
    version_number,
    CASE WHEN file_path IS NULL THEN 'file_path is NULL' END as issue1,
    CASE WHEN file_size_bytes IS NULL THEN 'file_size_bytes is NULL' END as issue2,
    CASE WHEN field_count IS NULL THEN 'field_count is NULL' END as issue3
FROM template_versions
WHERE file_path IS NULL 
   OR file_size_bytes IS NULL 
   OR field_count IS NULL;

-- 15. Verify referential integrity
SELECT COUNT(*) as orphaned_versions
FROM template_versions tv
LEFT JOIN pdf_templates pt ON tv.template_id = pt.id
WHERE pt.id IS NULL;

-- ============================================================================
-- ROLLBACK VALIDATION QUERIES
-- ============================================================================

-- 16. After rollback, verify original structure is restored
SELECT column_name, data_type, is_nullable
FROM information_schema.columns
WHERE table_name = 'pdf_templates'
  AND column_name IN ('version', 'current_version', 'comment', 'file_path', 'file_size_bytes', 'field_count', 'sepe_url')
ORDER BY column_name;

-- 17. After rollback, verify data is restored to pdf_templates
SELECT 
    pt.id,
    pt.name,
    pt.version,
    pt.file_path,
    pt.file_size_bytes,
    pt.field_count,
    pt.sepe_url
FROM pdf_templates pt
LIMIT 5;

-- 18. After rollback, verify columns removed from template_versions
SELECT column_name
FROM information_schema.columns
WHERE table_name = 'template_versions'
  AND column_name IN ('file_path', 'file_size_bytes', 'field_count', 'sepe_url');

-- ============================================================================
-- PERFORMANCE CHECK QUERIES
-- ============================================================================

-- 19. Test query performance - get templates with current version data
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

-- 20. Test index usage for current version lookup
EXPLAIN ANALYZE
SELECT *
FROM template_versions
WHERE template_id = 1 AND is_current = TRUE;

