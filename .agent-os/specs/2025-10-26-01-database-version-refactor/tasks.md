# Spec Tasks

## Tasks

- [x] 1. Database Migration Creation and Testing

  - [x] 1.1 Create Alembic migration file with upgrade and downgrade logic
  - [x] 1.2 Test migration upgrade on development database
  - [x] 1.3 Verify data is correctly transferred from pdf_templates to template_versions
  - [x] 1.4 Test migration rollback (downgrade) functionality
  - [x] 1.5 Verify referential integrity and constraints after migration
  - [x] 1.6 Document migration steps and validation queries

- [x] 2. Backend SQLAlchemy Models Update

  - [x] 2.1 Update PDFTemplate model (rename version to current_version, add comment, remove version-specific fields)
  - [x] 2.2 Update TemplateVersion model (add file_path, file_size_bytes, field_count, sepe_url)
  - [x] 2.3 Update model relationships and ensure proper cascade behavior
  - [x] 2.4 Write unit tests for updated models
  - [x] 2.5 Verify all model tests pass

- [x] 3. Backend Pydantic Schemas Update

  - [x] 3.1 Update TemplateBase schema (rename version to current_version, add comment)
  - [x] 3.2 Update TemplateResponse schema to include current version data
  - [x] 3.3 Update TemplateVersionResponse schema (add new fields)
  - [x] 3.4 Update TemplateCreate and TemplateUpdate schemas as needed
  - [x] 3.5 Write tests for schema validation
  - [x] 3.6 Verify all schema tests pass

- [x] 4. Backend API Endpoints Update

  - [x] 4.1 Write/update tests for GET /api/v1/templates/ with new joins
  - [x] 4.2 Update GET /api/v1/templates/ to join with current version
  - [x] 4.3 Write/update tests for GET /api/v1/templates/{id}
  - [x] 4.4 Update GET /api/v1/templates/{id} to fetch version-specific data
  - [x] 4.5 Write/update tests for GET /api/v1/templates/{id}/download
  - [x] 4.6 Update GET /api/v1/templates/{id}/download to use version file_path
  - [x] 4.7 Write/update tests for PUT /api/v1/templates/{id}
  - [x] 4.8 Update PUT /api/v1/templates/{id} to only update parent fields
  - [x] 4.9 Verify all endpoint tests pass

- [x] 5. Backend Ingest Endpoint Refactoring

  - [x] 5.1 Write/update tests for POST /api/v1/templates/ingest with new structure
  - [x] 5.2 Update ingest logic to create/update PDFTemplate with current_version
  - [x] 5.3 Update ingest logic to create TemplateVersion with all version-specific fields
  - [x] 5.4 Implement logic to mark previous versions as not current
  - [x] 5.5 Add validation to ensure data integrity during ingestion
  - [x] 5.6 Verify all ingest tests pass

- [x] 6. Frontend TypeScript Interface Updates

  - [x] 6.1 Update Template interface (rename version to current_version, add comment, add optional version fields)
  - [x] 6.2 Update TemplateVersion interface (add file_path, file_size_bytes, field_count, sepe_url)
  - [x] 6.3 Update any other related type definitions
  - [x] 6.4 Write/update tests for type definitions
  - [x] 6.5 Verify type definitions compile without errors

- [x] 7. Frontend Components and Hooks Update

  - [x] 7.1 Update useTemplates hook to handle current_version field
  - [x] 7.2 Update TemplatesTable component if needed for current_version
  - [x] 7.3 Update VersionHistoryModal to display version-specific fields
  - [x] 7.4 Update any other components that reference template/version data
  - [x] 7.5 Write/update tests for modified components and hooks
  - [x] 7.6 Verify all frontend tests pass

- [x] 8. Integration Testing and Validation
  - [x] 8.1 Run full backend test suite and fix any failures
  - [x] 8.2 Run full frontend test suite and fix any failures
  - [x] 8.3 Test template upload flow end-to-end
  - [x] 8.4 Test template list display with new structure
  - [x] 8.5 Test version history display with new fields
  - [x] 8.6 Test template download functionality
  - [x] 8.7 Verify API documentation (Swagger) is updated
  - [x] 8.8 Verify all functionality works correctly in browser
