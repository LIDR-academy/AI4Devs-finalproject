# Spec Tasks

## Tasks

- [x] 1. Update SQLAlchemy Models for Template Analysis

  - [x] 1.1 Verify current model structure and imports in `backend/app/models/template.py`
  - [x] 1.2 Add 6 metadata columns to `TemplateVersion` class (title, author, subject, creation_date, modification_date, page_count)
  - [x] 1.3 Update imports to include `Text` and `JSON` types from SQLAlchemy
  - [x] 1.4 Create new `TemplateField` model class with all 10 columns and proper docstring
  - [x] 1.5 Add bidirectional relationship to `TemplateVersion` (fields relationship with cascade delete)
  - [x] 1.6 Add `__repr__` method to `TemplateField` for debugging
  - [x] 1.7 Verify code follows PEP 8 style and snake_case naming conventions
  - [x] 1.8 Review model changes and ensure all type hints are correct

- [x] 2. Generate and Validate Alembic Migration

  - [x] 2.1 Ensure PostgreSQL and Redis containers are running (`podman-compose -f docker-compose.dev.yml up -d postgres redis`)
  - [x] 2.2 Activate backend virtual environment (`cd backend && source venv/bin/activate`)
  - [x] 2.3 Generate migration with autogenerate (`alembic revision --autogenerate -m "Add template metadata and template_fields table"`)
  - [x] 2.4 Review generated migration file for correctness (verify 6 columns added, new table created, indexes, foreign keys)
  - [x] 2.5 Check migration includes proper upgrade and downgrade functions
  - [x] 2.6 Verify migration uses `postgresql.JSONB` for JSON columns
  - [x] 2.7 Ensure foreign key naming follows convention (`fk_template_fields_version_id_template_versions`)
  - [x] 2.8 Confirm migration file is properly numbered and named

- [x] 3. Apply Migration and Verify Database Schema

  - [x] 3.1 Apply migration to database (`alembic upgrade head`)
  - [x] 3.2 Verify migration completes without errors
  - [x] 3.3 Inspect `template_versions` table schema (`podman exec -it sepe-postgres psql -U sepe_user -d sepe_comparator -c "\d+ template_versions"`)
  - [x] 3.4 Verify 6 new columns exist with correct types and nullable constraints
  - [x] 3.5 Inspect `template_fields` table schema (`podman exec -it sepe-postgres psql -U sepe_user -d sepe_comparator -c "\d+ template_fields"`)
  - [x] 3.6 Verify all 10 columns exist with correct types, indexes, and foreign key constraint
  - [x] 3.7 Check foreign key constraint details (`SELECT conname, conrelid::regclass, confrelid::regclass FROM pg_constraint WHERE conrelid = 'template_fields'::regclass;`)
  - [x] 3.8 Verify CASCADE delete is configured on foreign key

- [x] 4. Test Migration Rollback and Model Relationships

  - [x] 4.1 Test migration downgrade (`alembic downgrade -1`)
  - [x] 4.2 Verify `template_fields` table is dropped and columns removed from `template_versions`
  - [x] 4.3 Re-apply migration (`alembic upgrade head`)
  - [x] 4.4 Verify schema is restored correctly
  - [x] 4.5 Open Python shell and import models (`from app.models.template import TemplateVersion, TemplateField`)
  - [x] 4.6 Test creating a TemplateVersion record and associated TemplateField records
  - [x] 4.7 Verify bidirectional relationship works (`version.fields` and `field.version`)
  - [x] 4.8 Test cascade delete by deleting a version and confirming fields are removed

- [x] 5. Documentation and Cleanup
  - [x] 5.1 Update `techdesign/database_schema.md` to document new `template_versions` columns
  - [x] 5.2 Add documentation for new `template_fields` table in database_schema.md
  - [x] 5.3 Include relationship diagram showing `template_versions (1) -> (N) template_fields`
  - [x] 5.4 Document column purposes and data types in database_schema.md
  - [x] 5.5 Add example SQL queries for common use cases (retrieve fields, count by type)
  - [x] 5.6 Update README.md checkboxes to mark completed tasks
  - [x] 5.7 Verify all linter errors are resolved in modified files
  - [x] 5.8 Create summary of changes and migration instructions for team documentation
