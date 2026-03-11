# Tasks - Upload Template Flow Refactoring

## Task Breakdown

### Task 1: Backend - New Version Detail Endpoint ✅

**Estimated Time:** 2-3 hours | **Actual Time:** ~2 hours

- [x] 1.1 Create `TemplateBasicInfo` schema in `backend/app/schemas/template.py`
- [x] 1.2 Create `TemplateVersionDetailResponse` schema in `backend/app/schemas/template.py`
- [x] 1.3 Implement `GET /api/v1/templates/versions/{version_id}` endpoint in `backend/app/api/v1/endpoints/templates.py`
- [x] 1.4 Add endpoint to router with proper tags and documentation
- [x] 1.5 Write unit tests for the new endpoint (5 tests)
- [x] 1.6 Test endpoint manually via Swagger/Postman
- [x] 1.7 Verify all error cases (404, 401, 403)

**Notes:** Fixed route ordering issue - endpoint must be defined before `/{template_id}` to avoid conflicts.

### Task 2: Backend - Update Ingestion Response ✅

**Estimated Time:** 1 hour | **Actual Time:** ~30 minutes

- [x] 2.1 Add `version_id` field to `TemplateIngestResponse` schema
- [x] 2.2 Update ingestion endpoint to include version_id in response
- [x] 2.3 Update existing ingestion tests to verify version_id is returned
- [x] 2.4 Update API documentation

**Notes:** This simplifies frontend navigation to success page directly after ingestion.

### Task 3: Frontend - TypeScript Type Definitions ✅

**Estimated Time:** 30 minutes | **Actual Time:** ~20 minutes

- [x] 3.1 Add `TemplateVersionDetail` interface to `frontend/src/types/templates.types.ts`
- [x] 3.2 Add `TemplateBasicInfo` interface (nested in TemplateVersionDetail)
- [x] 3.3 Update `TemplateIngestResponse` to include `version_id` field
- [x] 3.4 Verify TypeScript compilation

**Notes:** All type definitions match backend schemas perfectly for type safety.

### Task 4: Frontend - Templates Service Update ✅

**Estimated Time:** 30 minutes | **Actual Time:** ~30 minutes

- [x] 4.1 Add `getVersionById(versionId: number)` method to `TemplatesService`
- [x] 4.2 Write unit tests for the new service method (6 tests)
- [x] 4.3 Verify service method returns correctly typed data

**Notes:** Service method includes comprehensive JSDoc documentation and error handling.

### Task 5: Frontend - Custom Hook ✅

**Estimated Time:** 1 hour | **Actual Time:** ~45 minutes

- [x] 5.1 Create `frontend/src/hooks/useTemplateVersion.ts`
- [x] 5.2 Implement hook with loading, error, and data states
- [x] 5.3 Add proper TypeScript types
- [x] 5.4 Write unit tests for the hook (12 tests)
- [x] 5.5 Export hook from `frontend/src/hooks/index.ts`

**Notes:** Hook follows React best practices with useCallback and proper dependency management.

### Task 6: Frontend - Routing Updates ✅

**Estimated Time:** 1 hour | **Actual Time:** ~30 minutes

- [x] 6.1 Move `/analyze` route to protected routes with layout in `App.tsx`
- [x] 6.2 Add new route `/templates/created/:versionId` → `TemplateCreatedPage`
- [x] 6.3 Verify `/analyze` now shows navigation sidebar
- [x] 6.4 Verify routing works correctly with browser navigation

**Notes:** Created placeholder TemplateCreatedPage component. `/analyze` now protected and integrated with navigation.

### Task 7: Frontend - Navigation Component Update ✅

**Estimated Time:** 30 minutes | **Actual Time:** ~15 minutes

- [x] 7.1 Update "Upload Template" menu item to point to `/analyze`
- [x] 7.2 Verify active state highlighting works for `/analyze` route
- [x] 7.3 Test menu navigation from all pages

**Notes:** Sidebar navigation updated. Upload Template now points to `/analyze` instead of `/templates/upload`.

### Task 8: Frontend - TemplateAnalyzePage Modification ✅

**Estimated Time:** 1-2 hours | **Actual Time:** ~1 hour

- [x] 8.1 Import `useNavigate` from react-router-dom
- [x] 8.2 Update `handleSaveTemplate` to redirect on success
- [x] 8.3 Extract `version_id` from ingestion response
- [x] 8.4 Navigate to `/templates/created/{version_id}` after successful save
- [x] 8.5 Keep error handling in modal for failed saves
- [x] 8.6 Test the complete flow from upload to redirect

**Notes:** Modified `usePDFAnalysis` hook to accept success callback with version_id. Errors still show in modal for retry.

### Task 9: Frontend - TemplateCreatedPage Component ✅

**Estimated Time:** 4-5 hours | **Actual Time:** ~2 hours

- [x] 9.1 Create `frontend/src/pages/templates/TemplateCreatedPage.tsx`
- [x] 9.2 Implement component structure with loading state
- [x] 9.3 Implement error state with retry button
- [x] 9.4 Fetch version data using `versionId` from URL params
- [x] 9.5 Design and implement success message section
- [x] 9.6 Design and implement template information card
- [x] 9.7 Design and implement version details card
- [x] 9.8 Implement "Download PDF" button
- [x] 9.9 Implement "View Template" button (navigate to `/templates/{templateId}`)
- [x] 9.10 Implement "Upload Another" button (navigate to `/analyze`)
- [x] 9.11 Add proper ARIA labels and accessibility features
- [x] 9.12 Make component responsive (mobile, tablet, desktop)
- [x] 9.13 Add dark mode support

**Notes:** Complete implementation with useTemplateVersion hook, PDF metadata display, download functionality, responsive + dark mode.

### Task 10: Frontend - Component Tests

**Estimated Time:** 2-3 hours

- [ ] 10.1 Create `TemplateCreatedPage.test.tsx`
- [ ] 10.2 Test loading state renders correctly
- [ ] 10.3 Test success state displays all information
- [ ] 10.4 Test error state shows error message
- [ ] 10.5 Test "Download PDF" button triggers correct action
- [ ] 10.6 Test "View Template" button navigates correctly
- [ ] 10.7 Test "Upload Another" button navigates to `/analyze`
- [ ] 10.8 Test 404 handling when version not found
- [ ] 10.9 Test accessibility with screen reader

### Task 11: Frontend - Integration Tests

**Estimated Time:** 2 hours

- [ ] 11.1 Test complete flow: upload → analyze → save → success page
- [ ] 11.2 Test navigation from success page to template detail
- [ ] 11.3 Test navigation from success page back to analyze
- [ ] 11.4 Test browser back button behavior
- [ ] 11.5 Verify all data displays correctly after ingestion

### Task 12: Documentation

**Estimated Time:** 1 hour

- [ ] 12.1 Update API documentation (Swagger)
- [ ] 12.2 Add component documentation for TemplateCreatedPage
- [ ] 12.3 Update project README with new flow diagram
- [ ] 12.4 Add JSDoc comments to new functions
- [ ] 12.5 Update user guide if applicable

### Task 13: End-to-End Testing

**Estimated Time:** 2 hours

- [ ] 13.1 Test complete flow in development environment
- [ ] 13.2 Test with various PDF files (different sizes, field counts)
- [ ] 13.3 Test error scenarios (invalid PDF, network errors)
- [ ] 13.4 Test on different browsers (Chrome, Firefox, Safari, Edge)
- [ ] 13.5 Test on mobile devices
- [ ] 13.6 Verify performance (page load times, API response times)

### Task 14: Code Review & Cleanup

**Estimated Time:** 1 hour

- [ ] 14.1 Run linters (ESLint, Prettier, Black, isort)
- [ ] 14.2 Fix any linting errors
- [ ] 14.3 Review code for best practices
- [ ] 14.4 Remove debug console.logs
- [ ] 14.5 Verify all tests pass
- [ ] 14.6 Check TypeScript compilation
- [ ] 14.7 Review and merge any conflicts

## Task Dependencies

```
Task 1 (Backend Endpoint) ──┐
                            │
Task 2 (Ingest Response) ───┼──> Task 3 (TypeScript Types) ──┐
                            │                                  │
                            └──────────────────────────────────┼──> Task 4 (Service) ──┐
                                                               │                       │
                                                               └───> Task 5 (Hook) ────┤
                                                                                       │
                                                                                       ├──> Task 6 (Routing)
                                                                                       │
                                                                                       ├──> Task 7 (Navigation)
                                                                                       │
                                                                                       ├──> Task 8 (Analyze Page)
                                                                                       │
                                                                                       └──> Task 9 (Created Page) ──┐
                                                                                                                    │
                                                                                                                    ├──> Task 10 (Component Tests)
                                                                                                                    │
                                                                                                                    ├──> Task 11 (Integration Tests)
                                                                                                                    │
                                                                                                                    └──> Task 12 (Documentation) ──> Task 13 (E2E Testing) ──> Task 14 (Cleanup)
```

## Recommended Implementation Order

### Phase 1: Backend Foundation (Tasks 1-2)

Start with backend implementation to have the API ready for frontend development.

### Phase 2: Frontend Types & Services (Tasks 3-5)

Set up the data layer and types before building UI components.

### Phase 3: Frontend Navigation (Tasks 6-7)

Update routing and navigation to integrate analyze page.

### Phase 4: Frontend Components (Tasks 8-9)

Update existing page and create new success page.

### Phase 5: Testing (Tasks 10-11)

Comprehensive component and integration testing.

### Phase 6: Polish (Tasks 12-14)

Documentation, end-to-end testing, and cleanup.

## Estimated Total Time

- **Backend:** 3-4 hours
- **Frontend:** 11-14 hours
- **Testing:** 4-5 hours
- **Documentation & Cleanup:** 2 hours

**Total:** 20-25 hours (2.5-3 days for a single developer)

## Success Criteria

- [ ] Users can upload templates from the "Upload Template" menu
- [ ] The analyze page shows navigation menu and is integrated with the app
- [ ] After successful save, users are redirected to a success page
- [ ] Success page displays all template and version information
- [ ] Users can download the PDF from the success page
- [ ] Users can navigate to template details or upload another template
- [ ] All tests pass (unit, integration, e2e)
- [ ] No linting errors
- [ ] TypeScript compiles without errors
- [ ] API documentation is updated
- [ ] Component documentation is complete

## Notes

- Consider implementing Task 2 (update ingestion response) first, as it simplifies the frontend flow
- Task 5 (custom hook) is optional but recommended for better code organization
- Focus on mobile responsiveness from the start (Task 9)
- Add accessibility features throughout development, not as an afterthought
- Test frequently during development, not just at the end
