# Spec Tasks - Template Comparison Feature

## Tasks

- [x] 1. Backend: Pydantic Schemas

  - [x] 1.1 Create ComparisonRequest schema with validation for different version IDs
  - [x] 1.2 Create FieldChangeStatus and DiffStatus enums
  - [x] 1.3 Create GlobalMetrics schema with all metrics fields
  - [x] 1.4 Create FieldChange schema with all comparison attributes
  - [x] 1.5 Create ComparisonResult schema combining metrics and field changes
  - [x] 1.6 Add all schemas to backend/app/schemas/comparison.py
  - [x] 1.7 Write unit tests for schema validation

- [x] 2. Backend: Comparison Service

  - [x] 2.1 Write tests for ComparisonService methods
  - [x] 2.2 Create ComparisonService class in backend/app/services/comparison_service.py
  - [x] 2.3 Implement \_get_version() method with 404 error handling
  - [x] 2.4 Implement \_get_version_fields() method to fetch all fields
  - [x] 2.5 Implement \_calculate_global_metrics() method
  - [x] 2.6 Implement \_compare_fields() method with add/remove/modify logic
  - [x] 2.7 Implement \_compare_field_attributes() for individual field comparison
  - [x] 2.8 Implement \_compare_positions() with tolerance logic
  - [x] 2.9 Implement \_compare_value_options() for list comparison
  - [x] 2.10 Implement main compare_versions() method
  - [x] 2.11 Add comprehensive error handling and logging
  - [x] 2.12 Verify all tests pass

- [x] 3. Backend: Comparison API Endpoint

  - [x] 3.1 Write tests for POST /api/v1/comparisons/analyze endpoint
  - [x] 3.2 Create comparison router in backend/app/api/v1/endpoints/comparison.py
  - [x] 3.3 Implement analyze_comparison endpoint with authentication
  - [x] 3.4 Add request validation (source != target)
  - [x] 3.5 Integrate with ComparisonService
  - [x] 3.6 Add comprehensive error handling (400, 401, 404, 422, 500)
  - [x] 3.7 Add OpenAPI documentation with examples
  - [x] 3.8 Register router in main API router
  - [x] 3.9 Verify all tests pass and endpoint works correctly

- [x] 4. Frontend: TypeScript Types

  - [x] 4.1 Add FieldChangeStatus and DiffStatus types to frontend/src/types/comparison.types.ts
  - [x] 4.2 Add ComparisonRequest interface
  - [x] 4.3 Add GlobalMetrics interface
  - [x] 4.4 Add FieldChange interface
  - [x] 4.5 Add ComparisonResult interface
  - [x] 4.6 Add helper types for filtering and sorting

- [x] 5. Frontend: API Service Method

  - [x] 5.1 Add analyzeComparison() method to comparisons service or templates service
  - [x] 5.2 Implement proper error handling and type safety
  - [x] 5.3 Write tests for API service method

- [x] 6. Frontend: Enhanced CreateComparisonPage

  - [x] 6.1 Write tests for CreateComparisonPage component
  - [x] 6.2 Read existing CreateComparisonPage.tsx structure
  - [x] 6.3 Add state management for source/target template and version selections
  - [x] 6.4 Implement cascading template and version selectors (Source side)
  - [x] 6.5 Implement cascading template and version selectors (Target side)
  - [x] 6.6 Add validation to prevent selecting same version IDs
  - [x] 6.7 Add "Execute Comparison" button with loading state
  - [x] 6.8 Integrate with analyzeComparison API method
  - [x] 6.9 Add error handling and display

- [x] 7. Frontend: Global Metrics Display

  - [x] 7.1 Write tests for GlobalMetricsCard component
  - [x] 7.2 Create GlobalMetricsCard component
  - [x] 7.3 Display page count comparison with visual indicator
  - [x] 7.4 Display field count comparison with visual indicator
  - [x] 7.5 Display change statistics (added/removed/modified)
  - [x] 7.6 Display modification percentage with progress bar
  - [x] 7.7 Display version metadata (version numbers, dates)
  - [x] 7.8 Add responsive layout and dark mode support

- [x] 8. Frontend: Field Changes Table

  - [x] 8.1 Write tests for ComparisonTable component
  - [x] 8.2 Create ComparisonTable component with filtering
  - [x] 8.3 Implement filter buttons (All, Added, Removed, Modified, Unchanged)
  - [x] 8.4 Implement table columns: Field ID, Status, Source Page, Target Page
  - [x] 8.5 Add Near Text Diff column with expand/collapse for details
  - [x] 8.6 Add Value Options Diff column with expand/collapse for details
  - [x] 8.7 Add Position Change column
  - [x] 8.8 Implement color coding by status (green/red/orange/gray)
  - [x] 8.9 Add sorting functionality for columns
  - [x] 8.10 Add pagination for large result sets (> 50 fields)
  - [x] 8.11 Add empty state message when no results match filter
  - [x] 8.12 Verify accessibility (keyboard navigation, ARIA labels)

- [x] 9. Frontend: Integration and Polish

  - [x] 9.1 Integrate GlobalMetricsCard and ComparisonTable into ComparisonResultsPage
  - [x] 9.2 Add loading states with spinners
  - [x] 9.3 Add success/error notifications
  - [x] 9.4 Implement responsive design for mobile/tablet/desktop
  - [x] 9.5 Add help text and tooltips for better UX
  - [x] 9.6 Verify dark mode support throughout
  - [x] 9.7 Test complete workflow end-to-end
  - [x] 9.8 Fix any remaining linter errors

- [x] 10. Testing and Documentation

  - [x] 10.1 Write end-to-end tests for complete comparison workflow
  - [x] 10.2 Test comparison with various field change scenarios
  - [x] 10.3 Test error scenarios (invalid versions, identical versions)
  - [x] 10.4 Test filtering and sorting functionality
  - [x] 10.5 Test responsive behavior on different screen sizes
  - [x] 10.6 Verify API documentation in Swagger/OpenAPI
  - [x] 10.7 Update user documentation with comparison feature
  - [x] 10.8 Verify all tests pass and feature is production-ready

## Acceptance Criteria

### Backend

- ✅ API endpoint `/api/v1/comparisons/analyze` returns correct comparison data
- ✅ Service correctly identifies ADDED, REMOVED, MODIFIED, and UNCHANGED fields
- ✅ Global metrics are accurately calculated
- ✅ Position comparison uses tolerance for minor coordinate differences
- ✅ All database queries are optimized
- ✅ Comprehensive error handling for all edge cases
- ✅ 100% test coverage for comparison logic
- ✅ API documentation is complete and accurate

### Frontend

- ✅ Users can select two different template versions
- ✅ System prevents selection of identical versions with clear error message
- ✅ Global metrics display clearly shows all statistics
- ✅ Field changes table displays all comparison data
- ✅ Filtering works correctly (All, Added, Removed, Modified)
- ✅ Table is sortable by all columns
- ✅ Color coding clearly indicates change types
- ✅ Expandable rows show detailed diff information
- ✅ Loading states provide clear feedback
- ✅ Error messages are user-friendly
- ✅ Responsive design works on all screen sizes
- ✅ Dark mode is fully supported
- ✅ Component is accessible (WCAG compliant)

## Dependencies

- Existing `template_versions` and `template_fields` tables
- Existing authentication system
- Existing template and version API endpoints for selectors
- React Hook Form for form management
- Tailwind CSS for styling

## Risks and Mitigation

### Risk: Large field counts (> 200 fields) may cause slow comparison

**Mitigation:**

- Implement pagination in frontend table
- Add loading indicator during comparison
- Consider caching if performance is an issue

### Risk: Complex position comparison logic may have edge cases

**Mitigation:**

- Extensive unit tests with various coordinate scenarios
- Configurable tolerance parameter
- Clear documentation of comparison algorithm

### Risk: Version selection UX may be confusing

**Mitigation:**

- Clear labeling of source vs target
- Visual separation of the two selection panels
- Helpful tooltips and validation messages

## Timeline Estimate

- **Backend (Tasks 1-3):** 2-3 days
- **Frontend Types and Services (Tasks 4-5):** 0.5 day
- **Frontend Components (Tasks 6-8):** 3-4 days
- **Integration and Polish (Task 9):** 1-2 days
- **Testing and Documentation (Task 10):** 1-2 days

**Total:** 7.5-11.5 days (approximately 2 weeks)
