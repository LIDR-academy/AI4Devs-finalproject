# Spec Tasks

## Tasks

- [x] 1. Backend: Create Template Service Layer

  - [x] 1.1 Write tests for TemplateService class
  - [x] 1.2 Create `backend/app/services/template_service.py` with TemplateService class
  - [x] 1.3 Implement file storage method with UUID generation and SHA256 checksum
  - [x] 1.4 Implement PDF metadata extraction method using PyPDF2
  - [x] 1.5 Implement transactional database persistence method (template + version + fields)
  - [x] 1.6 Implement main `ingest_template` method orchestrating the complete workflow
  - [x] 1.7 Add proper error handling and file cleanup on failures
  - [x] 1.8 Verify all tests pass for TemplateService

- [x] 2. Backend: Enhance Pydantic Schemas

  - [x] 2.1 Write tests for new Pydantic schemas validation
  - [x] 2.2 Add `TemplateIngestRequest` schema to `backend/app/schemas/template.py`
  - [x] 2.3 Add `TemplateFieldData` schema with page_number, field_page_order, position_data
  - [x] 2.4 Add `TemplateIngestResponse` schema with checksum field
  - [x] 2.5 Add validators for URL format and field constraints
  - [x] 2.6 Verify all schema tests pass

- [x] 3. Backend: Create Ingestion Router (SOLID Refactoring)

  - [x] 3.1 Write tests for ingestion endpoint
  - [x] 3.2 Create `backend/app/api/v1/endpoints/ingest.py` with new router
  - [x] 3.3 Implement POST /ingest endpoint with authentication dependency
  - [x] 3.4 Add request validation (file type, size, required fields)
  - [x] 3.5 Integrate TemplateService for complete ingestion workflow
  - [x] 3.6 Add comprehensive error responses (400, 401, 413, 500)
  - [x] 3.7 Register ingest router in `backend/app/api/v1/api.py`
  - [x] 3.8 Verify all endpoint tests pass

- [x] 4. Backend: Refactor Templates Router (SOLID Compliance)

  - [x] 4.1 Write tests to ensure CRUD operations still work after refactoring
  - [x] 4.2 Remove upload-related code from `backend/app/api/v1/endpoints/templates.py` if redundant
  - [x] 4.3 Ensure templates.py only contains CRUD operations (GET, PUT, DELETE, versions)
  - [x] 4.4 Update route tags and OpenAPI documentation for clarity
  - [x] 4.5 Verify all CRUD endpoint tests pass

- [x] 5. Frontend: Create Template Save Modal Component

  - [x] 5.1 Write tests for TemplateSaveModal component
  - [x] 5.2 Create `frontend/src/components/TemplateSaveModal/TemplateSaveModal.tsx`
  - [x] 5.3 Implement form fields (name, version, sepe_url) with React Hook Form
  - [x] 5.4 Add form validation (required fields, length limits, URL format)
  - [x] 5.5 Implement loading state, error display, and success feedback
  - [x] 5.6 Add accessibility features (ARIA labels, keyboard navigation)
  - [x] 5.7 Style component with TailwindCSS for mobile responsiveness
  - [x] 5.8 Create index.ts export file
  - [x] 5.9 Verify all component tests pass

- [x] 6. Frontend: Create Template Service API Integration

  - [x] 6.1 Write tests for templateService API functions
  - [x] 6.2 Create `frontend/src/services/templateService.ts`
  - [x] 6.3 Implement `ingestTemplate` function with FormData handling
  - [x] 6.4 Add authentication token management (read from auth context)
  - [x] 6.5 Implement error handling and response parsing
  - [x] 6.6 Add TypeScript interfaces for request and response
  - [x] 6.7 Verify all service tests pass

- [x] 7. Frontend: Enhance TemplateAnalyzePage with Save Functionality

  - [ ] 7.1 Write tests for save workflow in TemplateAnalyzePage
  - [x] 7.2 Update `usePDFAnalysis` hook with save state management
  - [x] 7.3 Add `handleSaveTemplate`, `handleOpenSaveModal`, `handleCloseSaveModal` functions
  - [x] 7.4 Update AnalyzePageState interface with saveState, saveError, showSaveModal
  - [x] 7.5 Add "Guardar como Versión Inicial" button to ActionButtons component
  - [x] 7.6 Integrate TemplateSaveModal component with proper props
  - [x] 7.7 Implement success toast notification and optional redirect
  - [ ] 7.8 Verify all page tests pass including save workflow

- [ ] 8. Integration Testing and Documentation
  - [ ] 8.1 Write end-to-end integration tests (upload → analyze → save → verify database)
  - [ ] 8.2 Test complete user workflow in development environment
  - [ ] 8.3 Verify file storage in backend_uploads volume
  - [ ] 8.4 Verify database records (pdf_templates, template_versions, template_fields)
  - [ ] 8.5 Test error scenarios (invalid file, unauthorized, database failure)
  - [ ] 8.6 Update API documentation with new endpoint examples
  - [ ] 8.7 Verify all linting and type checking passes
  - [ ] 8.8 Run full test suite and confirm all tests pass
