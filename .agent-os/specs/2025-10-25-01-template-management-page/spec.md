# Spec Requirements Document

> Spec: Template Management Page - All Templates View
> Created: 2025-10-25

## Overview

Implement a comprehensive Template Management interface that allows SEPE form administrators to view, download, and analyze uploaded PDF templates through an intuitive table-based interface with detailed version history and AcroForm field inspection capabilities. This feature builds upon existing infrastructure to provide the primary user interface for template exploration and management.

## User Stories

### View and Browse Templates

As a SEPE form administrator, I want to see all uploaded templates in a comprehensive data table, so that I can quickly browse, search, and access template information.

The administrator accesses the templates page where all uploaded PDF templates are displayed in a sortable, filterable table. Each row shows essential information including template name, version, file size in megabytes, total field count, and last update date. The table supports pagination to handle large datasets efficiently, with options to display 10, 20, 50, or 100 templates per page. Search and filter controls above the table enable quick location of specific templates by name or version. Loading states indicate when data is being fetched, and empty states guide users when no templates exist yet.

### Download and Archive Templates

As a SEPE form administrator, I want to download the PDF file of any template, so that I can review the original document offline or archive it for compliance purposes.

From the templates table, the administrator clicks a download icon button in the actions column of any template row. The system retrieves the current version of the template PDF and initiates a browser download with a meaningful filename that includes the template name and version number. A loading indicator shows during the download process, and feedback messages confirm success or report any errors. Large files are handled efficiently without blocking the user interface, allowing continued work while downloads complete.

### Track Version History

As a SEPE form administrator, I want to see all versions of a specific template with metadata, so that I can track changes and understand template evolution over time.

The administrator clicks the "View Versions" icon in the actions column to open a modal displaying the complete version history of the selected template. Versions are listed in reverse chronological order with the newest version at the top. Each version shows its version number, creation date, change summary, page count, author information, and PDF metadata including title, subject, and modification dates. The current version is prominently highlighted with a special badge. The modal allows smooth scrolling through long version histories and can be closed by clicking outside, pressing ESC, or using the close button.

### Inspect Template Fields

As a SEPE form administrator, I want to see detailed information about all AcroForm fields in the current template version, so that I can understand the structure and content of the PDF form for integration planning.

The administrator clicks the "View Fields" icon to open a modal showing all form fields from the current version. Fields are displayed in a table ordered by page number and field order within each page. The table shows field ID, descriptive text near the field, page number, order on page, field type with color-coded badges, and available value options for select/radio fields. Field types are visually distinguished with different colors (text=blue, checkbox=green, radiobutton=purple, select=orange, textarea=light blue, button=gray, signature=red). A search function allows filtering by field ID or near text, and pagination handles forms with many fields. The modal header displays the template name, version, and total field count for context.

## Spec Scope

1. **Templates Data Table** - Main page component with sortable columns, filtering by name and version, pagination controls, and responsive design for desktop and tablet
2. **Template Actions** - Action buttons for each template row to download PDF, view version history, and inspect AcroForm fields with appropriate loading states and error handling
3. **Version History Modal** - Modal dialog displaying complete version history with metadata timeline including PDF properties, change summaries, and version status indicators
4. **Fields Inspection Modal** - Modal dialog showing paginated list of AcroForm fields with search, filtering by page, and color-coded field type visualization
5. **Backend API Endpoints** - Four new REST endpoints for downloading PDFs, retrieving version lists, fetching current version fields, and accessing specific version fields with proper authentication and error responses

## Out of Scope

- Template upload functionality (separate feature)
- Template editing or modification capabilities
- Comparison functionality between templates (separate feature)
- Bulk operations such as downloading or deleting multiple templates
- Advanced filtering by date ranges or file size ranges
- In-application PDF preview or viewer
- Export functionality to CSV or JSON formats
- Template sharing or granular permissions management
- Real-time updates via WebSocket connections
- Full mobile responsive design (focus on desktop and tablet only)

## Expected Deliverable

1. A fully functional templates page at `/templates` route displaying all uploaded templates in a paginated, sortable, filterable table with working download, version history, and field inspection actions that can be tested in the browser
2. Four new backend API endpoints (`/download`, `/versions`, `/fields/current`, `/versions/{id}/fields`) that return appropriate data or files with proper error handling and authentication, testable via Swagger UI or API client
3. Complete test coverage including unit tests for React components, integration tests for API services, and end-to-end tests for critical user flows (viewing templates, downloading PDFs, opening modals) achieving >80% code coverage
