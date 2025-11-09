# Spec Requirements Document

> Spec: Database Schema Modifications for Template Analysis
> Created: 2025-10-19

## Overview

Extend the database schema to support PDF document analysis by adding metadata fields to the `template_versions` table and creating a new `template_fields` table to store extracted AcroForm field data. This enhancement will enable comprehensive storage and retrieval of PDF structure information for template comparison and analysis features.

## User Stories

### Document Metadata Storage

As a **backend developer**, I want to store PDF document metadata (title, author, subject, dates, page count) in the `template_versions` table, so that the system can track and display comprehensive document properties for each analyzed template version.

When a PDF template is analyzed, the system extracts document properties from the PDF metadata and stores them alongside the version record. This allows users to view document creation dates, authors, and other key metadata without re-parsing the PDF file.

### Field-Level Analysis Storage

As a **system architect**, I want to store individual PDF form field data in a dedicated `template_fields` table, so that the comparison engine can perform granular field-by-field analysis across template versions.

Each analyzed PDF template will have its AcroForm fields extracted and stored with detailed information including field ID, type, position, page number, nearby text labels, and available options. This structured data enables precise tracking of form changes across versions and provides the foundation for the template comparison feature.

### Migration-Based Schema Evolution

As a **DevOps engineer**, I want all database schema changes to be managed through Alembic migrations, so that the database evolution is version-controlled, reproducible, and can be safely applied across different environments (development, staging, production).

Schema modifications will be captured in an Alembic migration script that can be reviewed, tested, and applied consistently. The migration will include both upgrade and downgrade paths to ensure rollback capability if needed.

## Spec Scope

1. **Template Versions Metadata Extension** - Add six new columns to `template_versions` table for storing PDF document metadata (title, author, subject, creation_date, modification_date, page_count).

2. **Template Fields Table Creation** - Create new `template_fields` table with complete schema including field identification, type classification, positioning data, and relationship to template versions.

3. **SQLAlchemy Model Updates** - Modify the `TemplateVersion` model and create a new `TemplateField` model with proper relationships, type hints, and documentation.

4. **Alembic Migration Generation** - Generate and validate a new Alembic migration script that captures all schema changes with proper naming conventions and reversibility.

5. **Data Type Consistency** - Ensure all new schema elements follow the project's existing patterns (Integer PKs, DateTime with timezone, proper indexing strategy).

## Out of Scope

- Data migration from existing records (new columns will be nullable to support existing data)
- Frontend UI changes to display the new metadata
- API endpoint modifications to expose the new fields
- Actual PDF parsing logic implementation
- Population of the new fields with data from existing PDFs
- Comparative analysis algorithms that utilize the new field data

## Expected Deliverable

1. **Modified SQLAlchemy Models** - Updated `backend/app/models/template.py` with new columns in `TemplateVersion` and new `TemplateField` model with proper relationships and type annotations.

2. **Alembic Migration Script** - New migration file in `backend/alembic/versions/` that successfully applies all schema changes and passes validation with `alembic upgrade head` and `alembic downgrade -1`.

3. **Verified Database Schema** - Database schema successfully updated with all new columns and table visible through PostgreSQL inspection commands without errors.
