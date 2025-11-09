# Spec Tasks

## Tasks

- [x] 1. Backend: Template Names Endpoint

  - [x] 1.1 Write tests for GET /api/v1/templates/names endpoint
  - [x] 1.2 Add TemplateNameItem and TemplateNamesResponse schemas to backend/app/schemas/template.py
  - [x] 1.3 Implement GET /api/v1/templates/names endpoint in backend/app/api/v1/endpoints/templates.py with search, pagination, and sorting
  - [x] 1.4 Add proper authentication (get_current_active_user) and query validation
  - [x] 1.5 Add OpenAPI documentation with examples
  - [x] 1.6 Verify all tests pass and endpoint returns correct data

- [x] 2. Backend: Version Ingestion Service Logic

  - [x] 2.1 Write tests for TemplateService.ingest_template_version() method
  - [x] 2.2 Add TemplateVersionIngestRequest and TemplateVersionIngestResponse schemas to backend/app/schemas/template.py
  - [x] 2.3 Implement ingest_template_version() method in backend/app/services/template_service.py
  - [x] 2.4 Add template validation logic (verify template_id exists)
  - [x] 2.5 Implement PDF save, analysis, and field extraction workflow
  - [x] 2.6 Implement atomic version flag updates (set existing versions is_current=False, new version is_current=True)
  - [x] 2.7 Add database transaction handling with rollback on error
  - [x] 2.8 Add file cleanup on failure and comprehensive error logging
  - [x] 2.9 Verify all tests pass and version creation works correctly

- [x] 3. Backend: Version Ingestion Endpoint

  - [x] 3.1 Write tests for POST /api/v1/templates/ingest/version endpoint
  - [x] 3.2 Implement POST /api/v1/templates/ingest/version in backend/app/api/v1/endpoints/ingest.py
  - [x] 3.3 Add multipart form data handling (file, template_id, version, change_summary, sepe_url)
  - [x] 3.4 Add authentication (get_current_active_user) and file validation
  - [x] 3.5 Integrate with TemplateService.ingest_template_version() method
  - [x] 3.6 Add comprehensive error handling (400, 404, 413, 422, 500 responses)
  - [x] 3.7 Add OpenAPI documentation with request/response examples
  - [x] 3.8 Verify all tests pass and endpoint handles success/error cases correctly

- [x] 4. Frontend: Version Upload Modal Component

  - [x] 4.1 Write tests for VersionUploadModal component
  - [x] 4.2 Create VersionUploadModal.tsx component in frontend/src/components
  - [x] 4.3 Implement template selector with search/filter functionality using GET /api/v1/templates/names
  - [x] 4.4 Add version input field with validation (required, max 50 chars)
  - [x] 4.5 Add change_summary textarea (optional) and sepe_url input (optional, URL validation)
  - [x] 4.6 Implement form validation and error display
  - [x] 4.7 Add API integration for POST /api/v1/templates/ingest/version
  - [x] 4.8 Add loading states, success notification, and error handling
  - [x] 4.9 Implement redirect to /templates/versions/{version_id} on success
  - [x] 4.10 Verify all tests pass and modal works correctly

- [x] 5. Frontend: Analyze Page Refactoring

  - [x] 5.1 Update TemplateAnalyzePage.tsx to rename existing button from "Guardar como Versión Inicial" to "Guardar Nuevo Template"
  - [x] 5.2 Add new "Guardar Nueva Versión" button that opens VersionUploadModal
  - [x] 5.3 Add modal state management (open/close) for VersionUploadModal
  - [x] 5.4 Integrate VersionUploadModal component with API service (templatesService)
  - [x] 5.5 Pass PDF file to VersionUploadModal
  - [x] 5.6 Implement redirect to /templates/versions/{version_id} on successful version upload
  - [ ] 5.7 Write tests for updated TemplateAnalyzePage button functionality and version upload flow

- [x] 6. Frontend: API Service Functions and Types

  - [x] 6.1 Add TypeScript types for version ingestion (TemplateNameItem, TemplateNamesResponse, etc.) in frontend/src/types/templates.types.ts
  - [x] 6.2 Implement getTemplateNames() function in frontend/src/services/templates.service.ts
  - [x] 6.3 Implement ingestTemplateVersion() function with FormData handling in frontend/src/services/templates.service.ts
  - [x] 6.4 Add proper error handling and type safety
  - [x] 6.5 Update TemplatesFilters interface to include pagination and sorting fields
  - [ ] 6.6 Write tests for new API service functions

- [ ] 7. Integration Testing and Documentation
  - [ ] 7.1 Write end-to-end tests for complete version upload flow
  - [ ] 7.2 Test template selection, version input, and successful submission
  - [ ] 7.3 Test error scenarios (template not found, PDF invalid, database error)
  - [ ] 7.4 Test version flag updates (is_current logic) and database state
  - [ ] 7.5 Test redirect to version detail page after success
  - [ ] 7.6 Update API documentation with new endpoints
  - [ ] 7.7 Add user documentation for version upload feature
  - [ ] 7.8 Verify all integration tests pass and feature is production-ready
