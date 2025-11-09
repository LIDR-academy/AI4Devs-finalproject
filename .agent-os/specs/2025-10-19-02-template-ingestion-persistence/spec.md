# Spec Requirements Document

> Spec: Template Ingestion, Persistence, and Visualization
> Created: 2025-10-19

## Overview

Implement a comprehensive template ingestion system that allows authenticated users to persist analyzed PDF templates along with their extracted field data into the database, following SOLID principles by separating ingestion logic from CRUD operations. This feature enables the application to build a historical catalog of SEPE templates with full field-level detail for future comparison and tracking capabilities.

## User Stories

### Template Ingestion and Persistence

As a product architecture team member, I want to save analyzed PDF templates with all their extracted field data into the database, so that I can build a catalog of SEPE templates for future comparison and change tracking.

**Workflow:**

1. User uploads a PDF template and analyzes it using the existing `/analyze` endpoint
2. User reviews the analysis results showing all extracted fields with their types, positions, and nearby text
3. User clicks "Guardar como Versión Inicial" (Save as Initial Version) button
4. User provides template metadata: name, version number, and optional SEPE URL
5. System persists the PDF file to persistent storage, creates database records for the template, version, and all fields
6. User receives confirmation that the template has been saved successfully
7. User can now view the saved template in the templates catalog and use it for comparisons

### Template Analysis Enhancement

As a developer, I want the analysis page to provide a clear path to save analyzed templates, so that users can seamlessly transition from analysis to persistence without losing context.

**Workflow:**

1. User completes PDF analysis and views results table
2. System displays a prominent "Guardar como Versión Inicial" button in the action area
3. User clicks the save button, which opens a modal form requesting template metadata
4. User fills in required fields (name, version) and optional fields (SEPE URL)
5. System validates the input and calls the ingestion API endpoint with the original file and metadata
6. System provides real-time feedback on the save operation
7. Upon success, user sees a confirmation message with a link to view the saved template

## Spec Scope

1. **Backend Ingestion Endpoint (POST /api/v1/templates/ingest)** - Create a new authenticated endpoint that handles file upload, analysis, and transactional persistence of templates with all related data into pdf_templates, template_versions, and template_fields tables.

2. **Template Service Layer** - Implement or extend TemplateService to centralize ingestion logic including file storage, checksum calculation, PDF analysis orchestration, and transactional database operations.

3. **Pydantic Schema Enhancement** - Create TemplateIngestRequest schema for file upload with metadata, and TemplateFieldData schema matching the template_fields table structure with page_number, position_data, and field_page_order.

4. **Router Refactoring (SOLID Principle)** - Create new ingest.py router file for the ingestion endpoint, keeping templates.py focused solely on CRUD operations (GET, PUT, DELETE for templates).

5. **Frontend Save Functionality** - Add "Guardar como Versión Inicial" button to TemplateAnalyzePage with modal form for metadata input, and implement API integration to call the ingestion endpoint with the original analyzed file.

## Out of Scope

- Multi-version management and version comparison (future feature)
- Automatic template update detection from SEPE website
- Template comparison functionality (separate spec)
- Bulk template ingestion from multiple files
- Template validation rules or approval workflows
- Edit functionality for already-saved templates
- User permissions beyond basic authentication requirement

## Expected Deliverable

1. **Backend API endpoint** - A working POST /api/v1/templates/ingest endpoint that accepts authenticated requests, stores PDF files, analyzes them, and persists all data transactionally to the database.

2. **Frontend save workflow** - A complete user flow in TemplateAnalyzePage where users can analyze a PDF, click a save button, enter metadata in a modal form, and successfully persist the template with confirmation feedback.

3. **Database integrity** - All template data including the file, metadata, version information, and individual fields are correctly stored with proper relationships, checksums, and page ordering preserved from the analysis.
