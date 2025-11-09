# Spec Requirements Document

> Spec: Delete Functionality (Templates, Versions, Comparisons)  
> Created: 2025-11-08

## Overview

Implement complete DELETE functionality for the three main entities (Templates, Template Versions, and Comparisons) with referential integrity through database CASCADE rules and business logic validation to prevent deletion of current versions. This feature will allow users to maintain a clean data catalog by removing obsolete templates, old versions, and unnecessary comparisons while ensuring data consistency.

## User Stories

### Catalog Cleanup

As a product architect, I want to delete obsolete templates and old comparisons, so that I can maintain a clean and relevant catalog of SEPE templates without accumulating unnecessary historical data.

When a template is no longer relevant or was uploaded by mistake, I can delete it from the templates list page. The system will remove all associated versions, fields, and comparisons automatically. Similarly, when a comparison analysis is no longer needed, I can delete it from the comparisons list to keep my workspace organized.

### Version Management

As a product architect, I want to delete outdated template versions that are no longer needed, so that I can reduce clutter while keeping the current version safe from accidental deletion.

When viewing the version history of a template, I can see a delete button for each non-current version. If I try to delete the current version, the system will prevent this action and suggest deleting the entire template instead. This ensures I never accidentally lose the active version while still being able to clean up old versions.

### Safe Deletion with Confirmation

As a product architect, I want to confirm deletion operations before they execute, so that I can prevent accidental data loss and understand what will be deleted.

Before any deletion occurs, the system shows me a confirmation modal explaining what will be deleted and any cascading effects. For example, when deleting a template, I see that all versions and comparisons will also be removed. This gives me a chance to cancel if I realize I'm about to delete something important.

## Spec Scope

1. **Database CASCADE Rules** - Implement `ondelete="CASCADE"` on all foreign key relationships to ensure automatic cleanup of dependent records when parent entities are deleted.

2. **Delete Template Endpoint** - Enhance the existing `DELETE /api/v1/templates/{template_id}` endpoint to physically delete PDF files from the file system after database deletion succeeds.

3. **Delete Version Endpoint** - Create new `DELETE /api/v1/templates/{template_id}/versions/{version_id}` endpoint with validation to prevent deletion of current versions (is_current=True).

4. **Delete Comparison Endpoint** - Implement `DELETE /api/v1/comparisons/{comparison_id}` endpoint to remove comparison records and their associated fields.

5. **Frontend Delete UI** - Add delete buttons (trash icon) with confirmation modals in Templates list page, Comparisons list page, and Version History modal.

6. **Activity Logging** - Register deletion events in the activity log system with new activity types: TEMPLATE_DELETED, VERSION_DELETED, and COMPARISON_DELETED.

## Out of Scope

- Soft delete functionality (logical deletion with is_deleted flags)
- Bulk delete operations (multi-select and delete multiple items at once)
- Deletion history or undo capabilities
- Archiving functionality as an alternative to deletion
- Role-based permissions for delete operations (assumes authenticated users can delete)

## Expected Deliverable

1. Users can delete templates from the Templates list page, which removes all versions, fields, comparisons, and physical PDF files, with the deletion logged in the activity system.

2. Users can delete non-current versions from the Version History modal, but receive a clear error message preventing deletion of the current version.

3. Users can delete comparisons from the Comparisons list page, with automatic cleanup of comparison fields.

4. All delete operations require user confirmation through a modal dialog before execution.
