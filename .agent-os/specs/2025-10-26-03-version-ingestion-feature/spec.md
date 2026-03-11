# Spec Requirements Document

> Spec: Version Ingestion Feature for Existing Templates
> Created: 2025-10-26

## Overview

Implement a version ingestion workflow that allows users to upload a new PDF as a version of an existing template, following the Single Responsibility Principle by creating a dedicated ingestion endpoint separate from the initial template creation. This feature enables proper version history tracking and comparison of template evolution over time.

## User Stories

### Version Upload for Existing Templates

As a **product architect**, I want to **upload a new version of an existing SEPE template**, so that **I can track changes over time and compare different versions without losing historical data**.

When a user has analyzed a new PDF that represents an updated version of an existing template, they can save it as a new version by:

1. Selecting the existing template from a dropdown list
2. Providing a version number and change summary
3. Uploading the new PDF file
4. Having the system automatically mark the new version as current and preserve the old version

This workflow maintains version history integrity while keeping the template catalog organized, enabling accurate change detection and historical comparison.

### Seamless UX for Version Management

As a **product architect**, I want to **clearly distinguish between creating a new template and adding a version**, so that **I don't accidentally create duplicate templates when I mean to add a version**.

The analyze page should provide two distinct actions:

1. "Save New Template" - Creates a brand new template entry
2. "Save New Version" - Adds a version to an existing template

This clear separation prevents confusion and maintains data integrity in the template catalog.

## Spec Scope

1. **Backend Version Ingestion Endpoint** - New POST endpoint at `/api/v1/templates/ingest/version` that handles version creation for existing templates with authentication
2. **Backend Template Names Endpoint** - New GET endpoint at `/api/v1/templates/names` that returns a lightweight list of template IDs and names for UI selectors
3. **Template Service Version Logic** - Service method to handle version creation including file storage, field extraction, version record creation, and current version flag management
4. **Frontend Version Upload Modal** - UI component with template selector, version input, change summary textarea, and save functionality
5. **Frontend Button Refactoring** - Update existing "Save as Initial Version" button to "Save New Template" and add new "Save New Version" button
6. **Version Success Redirect** - Navigation flow that redirects users to the version detail page after successful version upload

## Out of Scope

- Automatic version number generation (user must provide version number)
- Version comparison UI (covered by separate comparison feature)
- Version deletion or rollback functionality
- Bulk version upload
- Version approval workflows
- Automated version detection from SEPE website

## Expected Deliverable

1. **Working Version Upload Flow**: Users can analyze a PDF, click "Save New Version", select an existing template, provide version details, and successfully save the new version with proper database records and file storage.

2. **Clear UI Distinction**: The analyze page clearly shows two separate actions ("Save New Template" vs "Save New Version") and the version upload modal provides an intuitive template selection experience.

3. **Proper Version Management**: New versions are correctly marked as current, previous versions are marked as non-current, the parent template record is updated with the new current version, and all version history is preserved.
