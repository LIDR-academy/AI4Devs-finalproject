# Spec: Template Management Page - All Templates View

## Context

The SEPE Templates Comparator project has established foundational infrastructure including:

- **Backend API**: Existing `/api/v1/templates/` endpoint providing template listing functionality
- **Frontend Page**: Route `/templates` already configured in the React application
- **Database Schema**: Complete schema with `pdf_templates`, `template_versions`, and `template_fields` tables fully implemented
- **Project Foundation**: Specification @2025-09-17-01-project-initialization/ defines the architectural patterns and tech stack

### Database Schema Context (from `database_schema.md`)

**pdf_templates table:**

- `id`, `name`, `version`, `file_path`, `file_size_bytes`, `field_count`, `sepe_url`, `uploaded_by`, `created_at`, `updated_at`
- Relationships: 1:N with `template_versions`

**template_versions table:**

- `id`, `template_id`, `version_number`, `change_summary`, `is_current`, `created_at`
- Additional metadata: `title`, `author`, `subject`, `creation_date`, `modification_date`, `page_count`
- Relationships: N:1 with `pdf_templates`, 1:N with `template_fields`

**template_fields table:**

- `id`, `version_id`, `field_id`, `field_type`, `raw_type`, `page_number`, `field_page_order`, `near_text`, `value_options`, `position_data`, `created_at`
- Relationships: N:1 with `template_versions`

### Frontend Stack

- React 19 with TypeScript
- Vite for development
- TailwindCSS for styling
- React Router for navigation
- React Hook Form for forms
- Axios for HTTP requests
- Lucide Icons for iconography
- Vitest + React Testing Library for testing

## Objective

Implement a complete Template Management interface that allows users to:

1. **View all templates** in a paginated, sortable, filterable table
2. **Download template PDF files** directly from the interface
3. **View version history** for each template with detailed metadata
4. **Inspect AcroForm fields** from the current version in a modal dialog with comprehensive field details

This specification builds upon the existing infrastructure and creates the primary interface for template management and exploration.

## User Stories

### US-1: View Templates Table

**As a** SEPE form administrator  
**I want to** see all uploaded templates in a comprehensive table  
**So that** I can quickly browse, search, and access template information

**Acceptance Criteria:**

- Display templates in a data table with columns: Name, Version, File Size (MB), Field Count, Last Updated
- Include an actions column with icon buttons for: Download, View Versions, View Fields
- Support pagination with configurable page size (10, 20, 50, 100)
- Support sorting by any column (ascending/descending)
- Support filtering by template name and version
- Display loading states during data fetching
- Display empty states when no templates exist
- Handle errors gracefully with user-friendly messages
- Responsive design that works on desktop and tablet devices

### US-2: Download Template PDF

**As a** SEPE form administrator  
**I want to** download the PDF file of any template  
**So that** I can review the original document offline

**Acceptance Criteria:**

- Click download icon to trigger PDF download
- Download the PDF from the current version (latest `version_number` where `is_current = true`)
- File downloaded with meaningful name: `{template_name}_v{version}.pdf`
- Display loading indicator during download
- Show success/error feedback to user
- Handle large files gracefully without blocking UI
- Support CORS-compliant file download

### US-3: View Version History

**As a** SEPE form administrator  
**I want to** see all versions of a specific template  
**So that** I can track changes and understand template evolution over time

**Acceptance Criteria:**

- Click "View Versions" icon to open versions modal/panel
- Display all versions in reverse chronological order (newest first)
- Show for each version: Version Number, Created Date, Change Summary, Page Count, Author, Current Status
- Highlight the current version with a badge/indicator
- Display PDF metadata: Title, Subject, Creation Date, Modification Date
- Allow closing the modal/panel
- Support navigation between templates without closing the view
- Responsive design for modal content

### US-4: View AcroForm Fields

**As a** SEPE form administrator  
**I want to** see detailed information about all AcroForm fields in the current template version  
**So that** I can understand the structure and content of the PDF form

**Acceptance Criteria:**

- Click "View Fields" icon to open fields modal
- Display fields from the current version (`is_current = true`) only
- Show fields in a table with columns: Field ID, Near Text, Page Number, Field Order, Field Type, Value Options
- Order fields by: `page_number` ASC, then `field_page_order` ASC
- Support pagination within the modal (20 fields per page)
- Display field type with color coding or icons (text, checkbox, radiobutton, select, textarea, button, signature)
- Display value options as comma-separated list for select/radio fields
- Show field count summary at the top of the modal
- Support search/filter by field ID or near text
- Allow closing the modal
- Responsive design for modal content

## Specification Scope

### In Scope

1. **Frontend Components:**

   - `TemplatesPage` - Main page component with layout
   - `TemplatesTable` - Data table component with sorting, filtering, pagination
   - `TemplateActionsMenu` - Actions column with icon buttons
   - `VersionHistoryModal` - Modal displaying template versions
   - `TemplateFieldsModal` - Modal displaying AcroForm fields
   - `TablePagination` - Reusable pagination component
   - `TableFilters` - Search and filter controls
   - `EmptyState` - Display when no data available
   - `LoadingSpinner` - Loading state component

2. **Backend API Endpoints (New):**

   - `GET /api/v1/templates/{template_id}/download` - Download template PDF file
   - `GET /api/v1/templates/{template_id}/versions` - Get all versions of a template
   - `GET /api/v1/templates/{template_id}/versions/{version_id}/fields` - Get fields for a specific version
   - `GET /api/v1/templates/{template_id}/fields/current` - Get fields for the current version (convenience endpoint)

3. **State Management:**

   - Templates list state with loading/error states
   - Pagination state (page, limit, total)
   - Filtering state (name, version)
   - Sorting state (column, direction)
   - Modal visibility states
   - Selected template state

4. **API Services:**

   - `templatesService.ts` - API client methods for template operations
   - Error handling and response transformation
   - File download handling

5. **Testing:**
   - Unit tests for all components
   - Integration tests for API calls
   - E2E tests for critical user flows
   - Mock data for testing

### Out of Scope

- Template upload functionality (separate feature)
- Template editing or modification
- Comparison functionality (separate feature)
- Bulk operations (delete, download multiple)
- Advanced filtering (date ranges, file size ranges)
- Template preview/viewer within the application
- Export functionality (CSV, JSON)
- Template sharing or permissions
- Real-time updates or WebSocket integration
- Mobile responsive design (tablet and desktop only)

## Technical Specification

### Frontend Architecture

#### Component Structure

```
src/
├── pages/
│   └── templates/
│       └── TemplatesPage.tsx              # Main page component
├── components/
│   └── templates/
│       ├── TemplatesTable.tsx              # Main data table
│       ├── TemplateActionsMenu.tsx         # Actions column
│       ├── VersionHistoryModal.tsx         # Version history modal
│       ├── TemplateFieldsModal.tsx         # Fields modal
│       ├── TablePagination.tsx             # Pagination component
│       ├── TableFilters.tsx                # Filter controls
│       ├── EmptyState.tsx                  # Empty state UI
│       └── __tests__/                      # Component tests
├── services/
│   └── templates.service.ts                # API client
├── hooks/
│   ├── useTemplates.ts                     # Templates data hook
│   ├── useTemplateVersions.ts              # Versions data hook
│   └── useTemplateFields.ts                # Fields data hook
├── types/
│   └── templates.types.ts                  # TypeScript interfaces
└── utils/
    ├── formatters.ts                       # Format file size, dates
    └── file-download.ts                    # File download helper
```

#### TypeScript Interfaces

```typescript
interface Template {
  id: number;
  name: string;
  version: string;
  file_path: string;
  file_size_bytes: number;
  field_count: number;
  sepe_url: string | null;
  uploaded_by: number | null;
  created_at: string;
  updated_at: string;
}

interface TemplateVersion {
  id: number;
  template_id: number;
  version_number: string;
  change_summary: string | null;
  is_current: boolean;
  created_at: string;
  title: string | null;
  author: string | null;
  subject: string | null;
  creation_date: string | null;
  modification_date: string | null;
  page_count: number;
}

interface TemplateField {
  id: number;
  version_id: number;
  field_id: string;
  field_type:
    | "text"
    | "checkbox"
    | "radiobutton"
    | "select"
    | "textarea"
    | "button"
    | "signature";
  raw_type: string | null;
  page_number: number;
  field_page_order: number;
  near_text: string | null;
  value_options: string[] | null;
  position_data: {
    x0: number;
    y0: number;
    x1: number;
    y1: number;
  } | null;
  created_at: string;
}

interface PaginatedResponse<T> {
  items: T[];
  total: number;
  limit: number;
  offset: number;
}

interface TemplatesFilters {
  name?: string;
  version?: string;
}

interface SortConfig {
  column: keyof Template;
  direction: "asc" | "desc";
}
```

### Backend API Specification

#### Endpoint 1: Download Template PDF

**Purpose:** Download the PDF file of a template's current version

**Method:** `GET`  
**Path:** `/api/v1/templates/{template_id}/download`  
**Auth:** Required (JWT Bearer token)

**Path Parameters:**

- `template_id` (integer, required) - Template ID

**Response:**

- **Success (200):** Binary PDF file with headers:
  - `Content-Type: application/pdf`
  - `Content-Disposition: attachment; filename="{name}_v{version}.pdf"`
  - `Content-Length: {file_size_bytes}`
- **Errors:**
  - 404: Template not found
  - 404: PDF file not found on disk
  - 401: Unauthorized
  - 500: Internal server error (file read error)

**Implementation Notes:**

- Query `pdf_templates` table for the template
- Use `file_path` to locate the PDF on disk
- Stream the file to avoid memory issues with large PDFs
- Generate filename from template `name` and `version`

---

#### Endpoint 2: Get Template Versions

**Purpose:** Retrieve all versions of a specific template with metadata

**Method:** `GET`  
**Path:** `/api/v1/templates/{template_id}/versions`  
**Auth:** Required (JWT Bearer token)

**Path Parameters:**

- `template_id` (integer, required) - Template ID

**Query Parameters:**

- `limit` (integer, optional, default=20) - Number of results per page
- `offset` (integer, optional, default=0) - Number of results to skip
- `sort_by` (string, optional, default="created_at") - Sort field
- `sort_order` (string, optional, default="desc") - Sort order (asc/desc)

**Response:**

```json
{
  "items": [
    {
      "id": 1,
      "template_id": 1,
      "version_number": "2.0.0",
      "change_summary": "Updated field validations",
      "is_current": true,
      "created_at": "2025-10-20T10:00:00Z",
      "title": "SEPE Form 2024",
      "author": "SEPE",
      "subject": "Employment Registration",
      "creation_date": "2024-01-15T00:00:00Z",
      "modification_date": "2024-10-01T00:00:00Z",
      "page_count": 5
    }
  ],
  "total": 3,
  "limit": 20,
  "offset": 0
}
```

**Errors:**

- 404: Template not found
- 401: Unauthorized
- 422: Invalid query parameters

**Implementation Notes:**

- JOIN `template_versions` with `pdf_templates` on `template_id`
- Order by `created_at DESC` by default (newest first)
- Include all metadata fields
- Support pagination for templates with many versions

---

#### Endpoint 3: Get Template Fields (Current Version)

**Purpose:** Retrieve all AcroForm fields from the current version of a template

**Method:** `GET`  
**Path:** `/api/v1/templates/{template_id}/fields/current`  
**Auth:** Required (JWT Bearer token)

**Path Parameters:**

- `template_id` (integer, required) - Template ID

**Query Parameters:**

- `limit` (integer, optional, default=20) - Number of results per page
- `offset` (integer, optional, default=0) - Number of results to skip
- `page_number` (integer, optional) - Filter by page number
- `search` (string, optional) - Search in field_id or near_text

**Response:**

```json
{
  "items": [
    {
      "id": 1,
      "version_id": 1,
      "field_id": "A0101",
      "field_type": "text",
      "raw_type": "/Tx",
      "page_number": 1,
      "field_page_order": 0,
      "near_text": "Nombre completo:",
      "value_options": null,
      "position_data": {
        "x0": 100.0,
        "y0": 200.0,
        "x1": 300.0,
        "y1": 220.0
      },
      "created_at": "2025-10-20T10:00:00Z"
    }
  ],
  "total": 45,
  "limit": 20,
  "offset": 0,
  "version_info": {
    "version_id": 1,
    "version_number": "2.0.0",
    "field_count": 45
  }
}
```

**Errors:**

- 404: Template not found
- 404: No current version found
- 401: Unauthorized
- 422: Invalid query parameters

**Implementation Notes:**

- JOIN `template_fields` with `template_versions` where `is_current = true`
- JOIN with `pdf_templates` to verify template exists
- Order by `page_number ASC, field_page_order ASC`
- Support search with ILIKE on `field_id` and `near_text`
- Support filtering by `page_number`
- Include version metadata in response

---

#### Endpoint 4: Get Template Fields (Specific Version)

**Purpose:** Retrieve all AcroForm fields from a specific version of a template

**Method:** `GET`  
**Path:** `/api/v1/templates/{template_id}/versions/{version_id}/fields`  
**Auth:** Required (JWT Bearer token)

**Path Parameters:**

- `template_id` (integer, required) - Template ID
- `version_id` (integer, required) - Version ID

**Query Parameters:**

- Same as Endpoint 3

**Response:**

- Same structure as Endpoint 3

**Errors:**

- 404: Template not found
- 404: Version not found
- 400: Version does not belong to template
- 401: Unauthorized
- 422: Invalid query parameters

**Implementation Notes:**

- Verify that `version_id` belongs to `template_id`
- Same ordering and filtering as Endpoint 3
- Useful for viewing fields from historical versions

### UI/UX Design Specifications

#### Templates Table Design

**Layout:**

- Full-width container with max-width constraint
- Card-based layout with shadow and border
- Table header with sticky positioning
- Zebra striping for rows (alternating background)

**Table Columns:**

1. **Actions** (width: 120px)

   - Icon buttons: Download, Versions, Fields
   - Tooltip on hover
   - Lucide icons: `Download`, `History`, `FileText`

2. **Name** (width: flex, min: 200px)

   - Primary text, bold
   - Truncate with ellipsis if too long
   - Full text on hover tooltip

3. **Version** (width: 100px)

   - Secondary text
   - Badge styling

4. **File Size** (width: 120px)

   - Formatted in MB (2 decimals)
   - Right-aligned

5. **Field Count** (width: 120px)

   - Numeric value
   - Center-aligned

6. **Last Updated** (width: 180px)
   - Relative time format (e.g., "2 days ago")
   - Absolute date on hover tooltip

**Filters Section:**

- Positioned above table
- Search input for name (debounced)
- Dropdown for version filter
- Clear filters button

**Pagination:**

- Positioned below table
- Show: "Showing X-Y of Z results"
- Page size selector: 10, 20, 50, 100
- Previous/Next buttons
- Page number display

#### Version History Modal Design

**Layout:**

- Modal overlay with semi-transparent background
- Centered modal container (max-width: 800px)
- Header with template name and close button
- Scrollable content area
- Footer with action buttons

**Content:**

- Timeline-style layout for versions
- Each version as a card with:
  - Version badge (current version highlighted)
  - Metadata grid: Title, Author, Subject, Page Count
  - Dates: Created, PDF Creation, PDF Modification
  - Change summary (expandable if long)

**Interactions:**

- Click outside or ESC to close
- Smooth scroll within modal
- Expand/collapse change summaries

#### Template Fields Modal Design

**Layout:**

- Large modal overlay (max-width: 1200px)
- Header with template name, version, and field count
- Search/filter bar
- Scrollable table with virtual scrolling for large datasets
- Footer with pagination

**Table Columns:**

1. Field ID (150px)
2. Near Text (flex, 300px)
3. Page (80px, center)
4. Order (80px, center)
5. Type (120px, badge)
6. Value Options (flex, 200px, truncated)

**Field Type Styling:**

- Color-coded badges:
  - text: blue
  - checkbox: green
  - radiobutton: purple
  - select: orange
  - textarea: blue-light
  - button: gray
  - signature: red

**Interactions:**

- Sortable columns
- Search across field_id and near_text
- Filter by page number
- Click field row for detailed view (stretch goal)

### Performance Considerations

1. **Lazy Loading:**

   - Load templates on page mount
   - Load versions only when modal opened
   - Load fields only when modal opened

2. **Debouncing:**

   - Search input debounced (300ms)
   - Filter changes debounced

3. **Caching:**

   - Cache template list with React Query or SWR
   - Cache versions and fields per template
   - Invalidate cache on mutations

4. **Virtual Scrolling:**

   - Use virtual scrolling for fields modal (>100 fields)
   - Use `react-window` or similar library

5. **File Downloads:**
   - Stream large files
   - Show progress indicator
   - Handle download errors gracefully

### Error Handling

**Frontend Error States:**

1. **Network Errors:**

   - Display toast notification
   - Retry button
   - Clear error message

2. **404 Errors:**

   - "Template not found" message
   - Navigation back to templates list

3. **Permission Errors:**

   - Redirect to login
   - Clear stored auth token

4. **File Download Errors:**
   - Toast notification with error
   - Log error for debugging

**Backend Error Responses:**

- Consistent error format:

```json
{
  "error": {
    "code": "TEMPLATE_NOT_FOUND",
    "message": "Template with ID 123 not found",
    "timestamp": "2025-10-20T10:00:00Z"
  }
}
```

### Testing Strategy

#### Unit Tests (Frontend)

- Component rendering tests
- User interaction tests (clicks, input)
- Conditional rendering (loading, error, empty states)
- Prop validation
- Format utilities (file size, dates)

#### Integration Tests (Frontend)

- API service mocking
- Data fetching and state updates
- Modal opening/closing
- Pagination and filtering
- Sorting functionality

#### Unit Tests (Backend)

- Endpoint handler tests with mocked database
- Query parameter validation
- Error handling for edge cases
- File streaming logic
- Authorization checks

#### E2E Tests

- Load templates page
- Search and filter templates
- Open version history modal
- Open fields modal and paginate
- Download template PDF
- Error scenarios (404, network error)

### Accessibility Requirements

- Semantic HTML elements
- ARIA labels for icon buttons
- Keyboard navigation support
- Focus management in modals
- Screen reader announcements for dynamic content
- Color contrast compliance (WCAG AA)
- Alt text for icons

### Documentation Requirements

1. **Component Documentation:**

   - JSDoc comments for all components
   - Props interface documentation
   - Usage examples

2. **API Documentation:**

   - OpenAPI/Swagger documentation
   - Request/response examples
   - Error codes reference

3. **User Guide:**
   - How to view templates
   - How to download templates
   - How to inspect versions and fields

## Migration and Deployment

### Database Migrations

**No database migrations required** - all tables already exist per `database_schema.md`

### Environment Variables

**Backend:**

- `PDF_STORAGE_PATH` - Base path for PDF file storage (default: `/uploads/templates/`)

**Frontend:**

- `VITE_API_BASE_URL` - Backend API base URL

### Deployment Checklist

- [ ] Backend API endpoints tested and documented
- [ ] Frontend components tested and reviewed
- [ ] API integration tested end-to-end
- [ ] PDF file download tested with various file sizes
- [ ] Error handling tested for all scenarios
- [ ] Accessibility audit completed
- [ ] Performance testing completed (large datasets)
- [ ] Documentation updated
- [ ] User acceptance testing completed

## Success Metrics

**Quantitative:**

- Page load time < 2 seconds
- Table rendering time < 500ms for 100 templates
- Modal opening time < 200ms
- PDF download initiation < 1 second
- Test coverage > 80%

**Qualitative:**

- Users can easily find and download templates
- Version history is clear and understandable
- Field inspection provides actionable insights
- Error messages are helpful and actionable
- UI is intuitive and requires no training

## Future Enhancements (Out of Scope)

1. **Template Upload** - Separate feature for uploading new templates
2. **Field Comparison** - Visual diff between field sets of different versions
3. **Bulk Operations** - Download/delete multiple templates
4. **Advanced Filters** - Date ranges, file size ranges, author filters
5. **Template Preview** - In-app PDF viewer
6. **Export Functionality** - Export table data to CSV/JSON
7. **Real-time Updates** - WebSocket for live template updates
8. **Mobile Responsive Design** - Full mobile support
9. **Field Visualization** - Visual representation of field positions on PDF pages
10. **Comparison Trigger** - Start comparison from templates page

## Appendix

### Related Specifications

- @2025-09-17-01-project-initialization/ - Project foundation and architecture
- `database_schema.md` - Complete database schema reference
- Frontend authentication specification (if exists)

### References

- React Hook Form documentation
- TailwindCSS component patterns
- Lucide Icons library
- FastAPI file responses documentation
- PostgreSQL JSONB querying

---

**Document Version:** 1.0.0  
**Created:** 2025-10-25  
**Author:** Product Architect (AI-assisted)  
**Status:** Ready for Implementation
