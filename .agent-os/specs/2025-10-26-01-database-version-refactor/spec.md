# Spec Requirements Document

> Spec: Database Version Refactor
> Created: 2025-10-26

## Overview

Refactor the database structure to properly implement version atomicity by moving version-specific attributes from the `pdf_templates` table to the `template_versions` table. This refactoring ensures that each version has its own complete set of data (file path, file size, field count, SEPE URL) and eliminates data inconsistency issues where the parent template's attributes don't reflect the actual current version.

## User Stories

### Template Version Management

As a **product architecture team member**, I want each template version to store its own file metadata and field information, so that I can accurately track changes across different versions without data inconsistency.

When a new template version is uploaded, the system should:

1. Store the new PDF file with a unique file path specific to that version
2. Record the file size, field count, and SEPE URL for that specific version
3. Mark the new version as "current" and update the parent template's `current_version` reference
4. Maintain historical data for all previous versions without overwriting

### Historical Accuracy

As a **developer**, I want to access accurate historical data for any template version, so that I can perform reliable comparisons and audits.

When querying template version history, the system should:

1. Return the exact file metadata (size, field count) that was true for that version at the time it was created
2. Preserve the original SEPE URL and file path for each version
3. Allow downloading the specific PDF file for any historical version

### Data Integrity

As a **system administrator**, I want the database schema to prevent data anomalies, so that the application maintains data integrity as templates evolve.

The refactored schema should:

1. Ensure that version-specific attributes are never shared across versions
2. Maintain referential integrity between templates and their versions
3. Support adding optional comments to templates for administrative notes

## Spec Scope

1. **Database Schema Refactoring** - Rename `pdf_templates.version` to `current_version`, add `comment` field, and remove version-specific columns (`file_path`, `file_size_bytes`, `field_count`, `sepe_url`) from the parent table
2. **Template Versions Enhancement** - Add version-specific columns (`file_path`, `file_size_bytes`, `field_count`, `sepe_url`) to the `template_versions` table to ensure each version is self-contained
3. **Alembic Migration** - Create and test a database migration that safely transfers existing data from `pdf_templates` to `template_versions` without data loss
4. **Backend Model Updates** - Update SQLAlchemy models, Pydantic schemas, and all API endpoints to reflect the new database structure
5. **Frontend Type Definitions** - Update TypeScript interfaces and components to work with the new data structure where version-specific data comes from the version record

## Out of Scope

- Changes to the PDF analysis or comparison logic
- UI redesign or new visual components (only data structure updates)
- Migration of existing PDF files in the filesystem (file paths will be updated in the database, but physical files remain in place)
- Performance optimization beyond what's necessary for the schema change
- Changes to authentication or authorization logic

## Expected Deliverable

1. **Successful Migration** - Database migration completes without errors, all existing data is preserved in the new structure, and the `current_version` correctly references the active version for each template
2. **API Compatibility** - All existing API endpoints (`/api/v1/templates/`, `/api/v1/templates/{id}`, `/api/v1/templates/{id}/download`, etc.) continue to work correctly with the new schema, returning the same data structure to clients
3. **Frontend Functionality** - The templates page (`/templates`) displays template data correctly, including version information, file sizes, and field counts from the related version records without any console errors or visual glitches
