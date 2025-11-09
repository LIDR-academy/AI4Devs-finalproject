# Technical Specification

This is the technical specification for the spec detailed in @.agent-os/specs/2025-11-08-01-delete-functionality/spec.md

## Technical Requirements

### Backend - Database CASCADE Configuration

**Requirement:** Verify and ensure all foreign key relationships have proper `ondelete="CASCADE"` configuration.

**Current State Analysis:**

- ✅ `Comparison.source_version_id` → Already has `ondelete="CASCADE"` (line 46 in comparison.py)
- ✅ `Comparison.target_version_id` → Already has `ondelete="CASCADE"` (line 52 in comparison.py)
- ✅ `ComparisonField.comparison_id` → Already has `ondelete="CASCADE"` (line 130 in comparison.py)
- ✅ `PDFTemplate.versions` relationship → Already has `cascade="all, delete-orphan"` (line 55 in template.py)
- ✅ `TemplateVersion.fields` relationship → Already has `cascade="all, delete-orphan"` (line 121 in template.py)
- ✅ `ComparisonField` relationship → Already has `cascade="all, delete-orphan"` (line 94 in comparison.py)

**Required Actions:**

1. Verify `TemplateVersion.template_id` foreign key has `ondelete="CASCADE"` (currently missing in template.py line 95)
2. Verify `TemplateField.version_id` foreign key has `ondelete="CASCADE"` (currently missing in template.py line 164)
3. Generate Alembic migration if changes are needed: `alembic revision --autogenerate -m "add_cascade_to_template_foreign_keys"`
4. Review and test migration in development environment

### Backend - DELETE Endpoints

**1. Delete Comparison**

- **Endpoint:** `DELETE /api/v1/comparisons/{comparison_id}`
- **Authentication:** Required (JWT via `get_current_active_user`)
- **Authorization:** User must be the creator of the comparison or admin
- **Business Logic:**
  - Verify comparison exists (404 if not found)
  - Verify user owns the comparison (403 if not)
  - Delete comparison record (CASCADE will handle comparison_fields)
  - Log activity: `COMPARISON_DELETED`
- **Response:** HTTP 204 No Content
- **Error Responses:**
  - 401 Unauthorized (not authenticated)
  - 403 Forbidden (not the owner)
  - 404 Not Found (comparison doesn't exist)

**2. Delete Template Version**

- **Endpoint:** `DELETE /api/v1/templates/{template_id}/versions/{version_id}`
- **Authentication:** Required (JWT via `get_current_active_user`)
- **Authorization:** User must be the uploader of the template or admin
- **Business Logic:**
  - Verify template exists (404 if not found)
  - Verify version exists and belongs to template (404 if not found)
  - Verify user owns the template (403 if not)
  - **CRITICAL VALIDATION:** Check if `version.is_current == True`
    - If True: Return 400 Bad Request with message: "Cannot delete current version. Please delete the entire template instead."
    - If False: Proceed with deletion
  - Store file_path before deletion
  - Delete version record (CASCADE will handle template_fields and comparisons)
  - Delete physical PDF file from file system using stored file_path
  - Log activity: `VERSION_DELETED`
- **Response:** HTTP 204 No Content
- **Error Responses:**
  - 400 Bad Request (trying to delete current version)
  - 401 Unauthorized (not authenticated)
  - 403 Forbidden (not the owner)
  - 404 Not Found (template or version doesn't exist)

**3. Delete Template (Enhancement)**

- **Endpoint:** `DELETE /api/v1/templates/{template_id}` (existing endpoint to be enhanced)
- **Authentication:** Required (JWT via `get_current_active_user`)
- **Authorization:** User must be the uploader of the template or admin
- **Business Logic:**
  - Verify template exists (404 if not found)
  - Verify user owns the template (403 if not)
  - Collect all file_paths from template.versions before deletion
  - Delete template record (CASCADE will handle versions, fields, and comparisons)
  - Delete all physical PDF files from file system
  - Log activity: `TEMPLATE_DELETED`
- **Response:** HTTP 204 No Content
- **Error Responses:**
  - 401 Unauthorized (not authenticated)
  - 403 Forbidden (not the owner)
  - 404 Not Found (template doesn't exist)

### Backend - Activity Logging

**New Activity Types:**

- `TEMPLATE_DELETED` - "Template deleted: {template_name} by {user_email}"
- `VERSION_DELETED` - "Version deleted: {template_name} {version_number} by {user_email}"
- `COMPARISON_DELETED` - "Comparison deleted: {source_template_name} {source_version} vs {target_template_name} {target_version} by {user_email}"

**Implementation:**

- Update `ActivityType` enum in `backend/app/schemas/activity.py`
- Add activity logging calls in each delete endpoint after successful deletion
- Include human-readable template names and version numbers (not just IDs)

### Frontend - Delete UI Components

**1. Templates List Page (`/templates`)**

- Add trash icon (Lucide React `Trash2`) to each template row
- Icon placement: Right-aligned in row, after other action buttons
- Click handler: Open confirmation modal
- Modal content:
  - Title: "Delete Template"
  - Message: "Are you sure you want to delete '{template_name}'? This will permanently remove all versions, fields, and associated comparisons."
  - Buttons: "Cancel" (secondary) and "Delete" (danger/red)
- API call: `DELETE /api/v1/templates/{template_id}`
- Success: Show toast notification, refresh templates list
- Error: Show error toast with message from API

**2. Comparisons List Page (`/comparisons`)**

- Add trash icon (Lucide React `Trash2`) to each comparison row
- Icon placement: Right-aligned in row, after other action buttons
- Click handler: Open confirmation modal
- Modal content:
  - Title: "Delete Comparison"
  - Message: "Are you sure you want to delete this comparison between '{source}' and '{target}'?"
  - Buttons: "Cancel" (secondary) and "Delete" (danger/red)
- API call: `DELETE /api/v1/comparisons/{comparison_id}`
- Success: Show toast notification, refresh comparisons list
- Error: Show error toast with message from API

**3. Version History Modal**

- Add trash icon (Lucide React `Trash2`) to each version row (except current version)
- Current version: Show disabled trash icon with tooltip "Cannot delete current version"
- Non-current versions: Clickable trash icon
- Click handler: Open confirmation modal
- Modal content:
  - Title: "Delete Version"
  - Message: "Are you sure you want to delete version '{version_number}' of '{template_name}'? This will also remove any comparisons using this version."
  - Buttons: "Cancel" (secondary) and "Delete" (danger/red)
- API call: `DELETE /api/v1/templates/{template_id}/versions/{version_id}`
- Success: Show toast notification, refresh version history
- Error handling:
  - 400 error (current version): Show specific message about deleting current version
  - Other errors: Show error toast with message from API

### Frontend - Service Layer

**New Methods in `templatesService`:**

```typescript
// Delete template
deleteTemplate(templateId: number): Promise<void>

// Delete template version
deleteVersion(templateId: number, versionId: number): Promise<void>

// Delete comparison
deleteComparison(comparisonId: number): Promise<void>
```

**Implementation Notes:**

- Use `apiService.delete()` method with proper endpoints
- Handle HTTP 204 No Content response
- Propagate errors to UI layer for error handling
- All methods require authentication (handled by apiService interceptor)

### UI/UX Requirements

**Confirmation Modals:**

- Centered on screen with overlay backdrop
- Dark mode support
- Keyboard accessible (Escape to cancel, Enter to confirm)
- Focus management (focus on Cancel button when opened)
- ARIA labels for screen readers
- Loading state during API call (disable buttons, show spinner)

**Icon Styling:**

- Trash icon color: text-gray-500 dark:text-gray-400
- Hover state: text-red-600 dark:text-red-400
- Disabled state: text-gray-300 dark:text-gray-600 cursor-not-allowed
- Size: w-5 h-5 (Tailwind classes)
- Cursor: cursor-pointer (enabled), cursor-not-allowed (disabled)

**Toast Notifications:**

- Success: Green background, checkmark icon, auto-dismiss after 3 seconds
- Error: Red background, alert icon, requires manual dismissal
- Position: Top-right corner of screen

### Error Handling

**Backend:**

- Use proper HTTP status codes (400, 401, 403, 404, 500)
- Return structured error messages in JSON format
- Log all errors with context (user_id, resource_id, error_message)
- Handle database transaction failures gracefully
- Handle file system errors (file not found, permission denied)

**Frontend:**

- Display user-friendly error messages
- Handle network errors gracefully
- Show specific messages for different error types
- Provide actionable feedback (e.g., "Try again" button)
- Log errors to console for debugging

### File System Operations

**Physical PDF Deletion:**

- Location: `./uploads/` directory (relative to backend root)
- File naming pattern: `{template_id}_{version_number}_{timestamp}.pdf`
- Error handling: Log warning if file doesn't exist (already deleted or moved)
- Don't fail the entire operation if file deletion fails
- Use `os.remove()` or `pathlib.Path.unlink()` with error handling
- Verify file exists before attempting deletion

### Testing Requirements

**Backend Unit Tests:**

1. Test deletion of non-current version succeeds
2. Test deletion of current version fails with 400
3. Test template deletion removes all physical files
4. Test CASCADE deletion of comparison_fields
5. Test authorization checks (owner vs non-owner)
6. Test 404 responses for non-existent resources
7. Test activity logging for all delete operations

**Frontend Integration Tests:**

1. Test confirmation modal appears on delete click
2. Test cancel button closes modal without deletion
3. Test successful deletion refreshes list
4. Test error toast appears on API failure
5. Test disabled state for current version in version history

### Performance Considerations

- Delete operations should complete within 2 seconds
- File deletion should not block the HTTP response
- Consider using background task for file deletion if multiple files
- Database CASCADE should be efficient (proper indexes on foreign keys)
- Frontend should show loading state during deletion

## External Dependencies

This feature does not require any new external dependencies. All functionality can be implemented using existing libraries and frameworks.
