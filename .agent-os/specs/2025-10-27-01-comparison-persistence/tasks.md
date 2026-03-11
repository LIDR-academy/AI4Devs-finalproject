# Spec Tasks

## Tasks

- [x] 1. Backend: Database Schema Migration

  - [x] 1.1 Create Alembic migration file with version-based foreign keys
  - [x] 1.2 Add rename operations for source/target_template_id → source/target_version_id
  - [x] 1.3 Add new columns to comparisons table (modification_percentage, field counts)
  - [x] 1.4 Add new columns to comparison_fields table (field_id, status, page numbers, diff fields, JSONB columns)
  - [x] 1.5 Create new indexes on version_id columns and status fields
  - [x] 1.6 Add check constraints for data integrity validation
  - [x] 1.7 Implement complete downgrade function for rollback capability
  - [x] 1.8 Test migration upgrade and downgrade in development environment

- [x] 2. Backend: Update Database Models

  - [x] 2.1 Write tests for updated Comparison model
  - [x] 2.2 Update Comparison model in backend/app/models/comparison.py with new columns and relationships
  - [x] 2.3 Write tests for updated ComparisonField model
  - [x] 2.4 Update ComparisonField model with all new columns (field_id, status, diff fields)
  - [x] 2.5 Update model relationships to reference template_versions instead of pdf_templates
  - [x] 2.6 Add model properties and validators for data integrity
  - [x] 2.7 Verify all model tests pass

- [x] 3. Backend: Pydantic Schemas for Persistence

  - [x] 3.1 Write tests for new Pydantic schemas
  - [x] 3.2 Create ComparisonSummary schema in backend/app/schemas/comparison.py
  - [x] 3.3 Create ComparisonListResponse schema with pagination fields
  - [x] 3.4 Create ComparisonSaveResponse schema for ingest endpoint response
  - [x] 3.5 Update ComparisonResult schema to include optional id field
  - [x] 3.6 Add validation rules and field descriptions to all schemas
  - [x] 3.7 Verify all schema tests pass

- [x] 4. Backend: Comparison Service Extensions

  - [x] 4.1 Write tests for save_comparison method (success, duplicate, errors)
  - [x] 4.2 Implement save_comparison method in ComparisonService with transaction handling
  - [x] 4.3 Write tests for get_comparison method (success, not found)
  - [x] 4.4 Implement get_comparison method to reconstruct ComparisonResult from database
  - [x] 4.5 Write tests for list_comparisons method (pagination, sorting, filtering)
  - [x] 4.6 Implement list_comparisons method with query building and eager loading
  - [x] 4.7 Write tests for comparison_exists method
  - [x] 4.8 Implement comparison_exists method for duplicate detection
  - [x] 4.9 Add error handling and logging throughout service methods
  - [x] 4.10 Verify all service tests pass with >90% coverage

- [x] 5. Backend: API Endpoints for Persistence

  - [x] 5.1 Write tests for POST /api/v1/comparisons/ingest endpoint
  - [x] 5.2 Implement POST /ingest endpoint with authentication and validation
  - [x] 5.3 Write tests for GET /api/v1/comparisons/{comparison_id} endpoint
  - [x] 5.4 Implement GET /{comparison_id} endpoint with error handling
  - [x] 5.5 Write tests for GET /api/v1/comparisons endpoint (list with pagination)
  - [x] 5.6 Implement GET / endpoint with query parameters and filtering
  - [x] 5.7 Write tests for GET /api/v1/comparisons/check endpoint
  - [x] 5.8 Implement GET /check endpoint for existence verification
  - [x] 5.9 Add comprehensive OpenAPI documentation with examples for all endpoints
  - [x] 5.10 Verify all API endpoint tests pass

- [x] 6. Frontend: TypeScript Types and API Service

  - [x] 6.1 Add ComparisonSummary interface to frontend/src/types/comparison.types.ts
  - [x] 6.2 Add ComparisonListResponse interface with pagination fields
  - [x] 6.3 Add SaveComparisonResponse interface
  - [x] 6.4 Add ComparisonCheckResponse interface
  - [x] 6.5 Add ListComparisonsParams interface
  - [x] 6.6 Write tests for comparisons API service methods
  - [x] 6.7 Implement saveComparison method in comparisons service
  - [x] 6.8 Implement getComparison method in comparisons service
  - [x] 6.9 Implement listComparisons method with pagination parameters
  - [x] 6.10 Implement checkComparisonExists method
  - [x] 6.11 Verify all API service tests pass

- [x] 7. Frontend: Save Comparison Button Component

  - [x] 7.1 Write tests for SaveComparisonButton component
  - [x] 7.2 Create SaveComparisonButton component with props interface
  - [x] 7.3 Implement button states (default, loading, success, error, exists)
  - [x] 7.4 Add onClick handler to call saveComparison API method
  - [x] 7.5 Implement success state with link to saved comparison
  - [x] 7.6 Implement error state with user-friendly error messages
  - [x] 7.7 Add responsive styling and dark mode support
  - [x] 7.8 Integrate button into ComparisonResultsPage below GlobalMetricsCard
  - [x] 7.9 Verify all component tests pass (15/15 passing)

- [x] 8. Frontend: Comparisons List Page

  - [x] 8.1 Write tests for ComparisonsPage component
  - [x] 8.2 Create ComparisonsPage component at frontend/src/pages/comparisons/ComparisonsPage.tsx
  - [x] 8.3 Implement page header with title and "New Comparison" button
  - [x] 8.4 Implement search bar with debounced input (300ms delay)
  - [x] 8.5 Implement sort dropdown and sort order toggle
  - [x] 8.6 Implement comparisons table with all columns (Source/Target, %, Changes, Date, Actions)
  - [x] 8.7 Implement row click navigation to detail page
  - [x] 8.8 Implement pagination controls (Previous/Next, page numbers, items per page)
  - [x] 8.9 Implement empty state with helpful message and CTA
  - [x] 8.10 Add loading skeleton for table rows
  - [x] 8.11 Add responsive design (horizontal scroll on mobile)
  - [x] 8.12 Verify all page tests pass

- [x] 9. Frontend: Saved Comparison Detail Page

  - [x] 9.1 Write tests for SavedComparisonPage component
  - [x] 9.2 Create SavedComparisonPage component at frontend/src/pages/comparisons/SavedComparisonPage.tsx
  - [x] 9.3 Implement useEffect to fetch comparison data on mount
  - [x] 9.4 Add page header with breadcrumb navigation
  - [x] 9.5 Display source/target version info and date saved in header
  - [x] 9.6 Reuse GlobalMetricsCard component for metrics display
  - [x] 9.7 Reuse ComparisonTable component for field changes
  - [x] 9.8 Implement "View in New Analysis" button to pre-fill comparison form
  - [x] 9.9 Add loading skeleton while fetching data
  - [x] 9.10 Add 404 error handling for missing comparison
  - [x] 9.11 Verify all component tests pass

- [x] 10. Frontend: Routing and Navigation

  - [x] 10.1 Add /comparisons route to App.tsx routing configuration
  - [x] 10.2 Add /comparisons/:id route to App.tsx routing configuration
  - [x] 10.3 Add "Comparisons" link to navigation menu with icon
  - [x] 10.4 Test navigation flow: Create → Save → List → Detail
  - [x] 10.5 Verify route guards and error boundaries work correctly
  - [x] 10.6 Test browser back/forward navigation
  - [x] 10.7 Verify all routing integration tests pass

- [ ] 11. Integration Testing and Quality Assurance

  - [ ] 11.1 Test complete save flow: Analyze → Save → Confirmation
  - [ ] 11.2 Test list page with various filter/sort combinations
  - [ ] 11.3 Test detail page retrieval and display accuracy
  - [ ] 11.4 Test error scenarios (401, 404, 422, 500)
  - [ ] 11.5 Test responsive design on mobile, tablet, and desktop
  - [ ] 11.6 Verify dark mode support across all new components
  - [ ] 11.7 Verify accessibility compliance (keyboard navigation, ARIA labels, screen readers)
  - [ ] 11.8 Run linter and fix all errors in new code
  - [ ] 11.9 Verify performance targets (<500ms save, <200ms retrieve, <300ms list)
  - [ ] 11.10 Run all tests (backend and frontend) and verify 100% pass rate

- [ ] 12. Documentation and Deployment
  - [ ] 12.1 Verify API documentation in Swagger UI at /docs
  - [ ] 12.2 Test all API endpoints through Swagger UI "Try it out" feature
  - [ ] 12.3 Update user documentation with new comparison persistence features
  - [ ] 12.4 Create deployment guide with migration instructions
  - [ ] 12.5 Review and update README with new feature description
  - [ ] 12.6 Create rollback plan documentation
  - [ ] 12.7 Prepare staging environment deployment checklist
  - [ ] 12.8 Conduct final code review and merge to staging branch

## Task Dependencies

**Critical Path:**

1. Task 1 (Database Migration) must complete before Task 2 (Models)
2. Task 2 (Models) must complete before Task 3 (Schemas)
3. Task 3 (Schemas) must complete before Task 4 (Service)
4. Task 4 (Service) must complete before Task 5 (API Endpoints)
5. Tasks 6-10 (Frontend) can proceed in parallel after Task 5 completes
6. Task 11 (Integration Testing) requires all previous tasks complete
7. Task 12 (Documentation) can be done in parallel with Task 11

**Parallel Work Opportunities:**

- While backend Tasks 1-5 are in progress, frontend types (Task 6.1-6.4) can be defined
- Frontend Tasks 7, 8, 9 can be developed in parallel once Task 6 completes
- Task 10 (Routing) can be done alongside Tasks 7-9

## Acceptance Criteria

### Database Migration (Task 1)

- ✅ Migration runs without errors in development and staging
- ✅ All foreign keys correctly reference template_versions table
- ✅ All new columns have correct data types and constraints
- ✅ Indexes created on all specified columns
- ✅ Downgrade function successfully rolls back all changes
- ✅ No data loss or corruption after migration

### Backend Implementation (Tasks 2-5)

- ✅ All model updates preserve existing functionality
- ✅ Pydantic schemas validate correctly with comprehensive error messages
- ✅ Service methods handle all edge cases (duplicates, not found, validation errors)
- ✅ Save operation is atomic (transaction rolls back on any error)
- ✅ API endpoints return correct status codes for all scenarios
- ✅ OpenAPI documentation complete with request/response examples
- ✅ Backend tests achieve >90% code coverage
- ✅ All tests pass (70+ test cases)

### Frontend Implementation (Tasks 6-10)

- ✅ TypeScript types match backend schemas exactly
- ✅ Save button shows all states correctly (default, loading, success, error)
- ✅ List page displays all comparisons with correct data
- ✅ Pagination, sorting, and search work correctly
- ✅ Detail page displays comparison using existing components
- ✅ Navigation flow works seamlessly (create → save → list → detail)
- ✅ Responsive design works on all screen sizes
- ✅ Dark mode supported throughout
- ✅ Accessibility compliant (WCAG 2.1 AA)
- ✅ Frontend tests achieve >90% code coverage
- ✅ All tests pass (50+ test cases)

### Integration & Quality (Tasks 11-12)

- ✅ End-to-end workflow completes without errors
- ✅ Error handling provides user-friendly messages
- ✅ Performance targets met (<500ms save, <200ms retrieve)
- ✅ No linter errors in any new code
- ✅ API documentation accurate and complete in Swagger UI
- ✅ Deployment guide provides step-by-step instructions
- ✅ Rollback plan tested and documented

## Risk Mitigation

### High-Risk Areas

1. **Database Migration (Task 1)**

   - **Risk:** Foreign key changes could fail or cause data loss
   - **Mitigation:**
     - Test thoroughly in staging with production data copy
     - Take full database backup before migration
     - Have rollback script ready
     - Schedule migration during low-traffic window

2. **Transaction Handling (Task 4.2)**

   - **Risk:** Partial saves could leave database in inconsistent state
   - **Mitigation:**
     - Use SQLAlchemy session management properly
     - Test rollback scenarios explicitly
     - Add comprehensive error logging
     - Monitor transaction duration

3. **Data Reconstruction (Task 4.4)**
   - **Risk:** Retrieved data might not match original analysis format
   - **Mitigation:**
     - Write comparison tests between saved and retrieved data
     - Validate JSONB structure on save and retrieve
     - Test with real comparison data from /analyze endpoint

### Medium-Risk Areas

1. **API Compatibility**

   - **Risk:** New endpoints might break existing functionality
   - **Mitigation:** Ensure backward compatibility for existing /analyze endpoint

2. **Frontend State Management**

   - **Risk:** Complex state interactions between pages
   - **Mitigation:** Use React Query or similar for proper cache management

3. **Performance**
   - **Risk:** Large comparisons might slow down list/detail pages
   - **Mitigation:** Implement pagination and lazy loading

## Estimated Time per Task

- **Task 1 (Migration):** 0.5 day
- **Task 2 (Models):** 0.5 day
- **Task 3 (Schemas):** 0.5 day
- **Task 4 (Service):** 2 days
- **Task 5 (API Endpoints):** 1.5 days
- **Task 6 (Types/API):** 0.5 day
- **Task 7 (Save Button):** 0.5 day
- **Task 8 (List Page):** 1.5 days
- **Task 9 (Detail Page):** 1 day
- **Task 10 (Routing):** 0.5 day
- **Task 11 (Integration):** 1.5 days
- **Task 12 (Documentation):** 0.5 day

**Total Estimated Time:** 11 days (~2.2 weeks)

**Buffer for unforeseen issues:** +2 days

**Total with Buffer:** 13 days (~2.5 weeks)
