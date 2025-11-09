# Technical Specification

This is the technical specification for the spec detailed in @.agent-os/specs/2025-10-25-01-template-management-page/spec.md

## Technical Requirements

### Frontend Component Architecture

- Create modular React components following project standards with TypeScript strict mode
- Main page component `TemplatesPage.tsx` in `src/pages/templates/` directory
- Feature components in `src/components/templates/` directory: `TemplatesTable`, `TemplateActionsMenu`, `VersionHistoryModal`, `TemplateFieldsModal`, `TablePagination`, `TableFilters`, `EmptyState`
- Custom hooks in `src/hooks/`: `useTemplates`, `useTemplateVersions`, `useTemplateFields` for data management
- TypeScript interfaces in `src/types/templates.types.ts` defining `Template`, `TemplateVersion`, `TemplateField`, `PaginatedResponse`, `TemplatesFilters`, `SortConfig`
- Utility functions in `src/utils/`: `formatters.ts` for file size and date formatting, `file-download.ts` for handling PDF downloads

### Data Table Implementation

- Implement sortable table with ascending/descending sort on all columns
- Table columns: Actions (120px), Name (flex min 200px), Version (100px), File Size MB (120px right-aligned), Field Count (120px center-aligned), Last Updated (180px with relative time)
- Support filtering by template name (debounced search input 300ms) and version (dropdown)
- Pagination with configurable page size options: 10, 20, 50, 100 items per page
- Display pagination info: "Showing X-Y of Z results" with Previous/Next navigation
- Loading skeleton states during data fetching
- Empty state component with helpful guidance when no templates exist
- Zebra striping with alternating row background colors

### Modal Dialogs

- Version History Modal with 800px max-width, semi-transparent overlay, centered positioning
- Timeline-style layout for versions with current version highlighted badge
- Display metadata grid: Version Number, Created Date, Change Summary, Title, Author, Subject, Page Count, PDF Creation Date, PDF Modification Date
- Fields Inspection Modal with 1200px max-width for comprehensive field data
- Fields table with columns: Field ID (150px), Near Text (flex 300px), Page (80px center), Order (80px center), Type (120px badge), Value Options (flex 200px truncated)
- Color-coded field type badges: text=blue, checkbox=green, radiobutton=purple, select=orange, textarea=light-blue, button=gray, signature=red
- Search functionality filtering by field_id or near_text with debounced input
- Pagination within modals supporting large datasets (20 items per page)
- ESC key and click-outside to close modals with proper focus management

### State Management

- Implement React Context or local state for templates list with loading/error/success states
- Pagination state tracking current page, limit, total count, and offset
- Filter state for name and version with debounced updates
- Sort state tracking column and direction (asc/desc)
- Modal visibility states for version history and fields dialogs
- Selected template state for modal operations

### Performance Optimizations

- Lazy load version history and fields data only when modals opened
- Implement data caching with React Query or SWR for templates, versions, and fields
- Debounce search inputs (300ms) and filter changes
- Virtual scrolling for fields modal when >100 fields using react-window library
- Stream large PDF files on download without blocking UI
- Optimize table rendering for datasets up to 100 templates with <500ms render time

### Error Handling

- Network errors display toast notifications with retry buttons
- 404 errors show "Template not found" message with navigation back to list
- 401 authentication errors redirect to login and clear auth tokens
- File download errors display toast with specific error message
- Consistent backend error format with error code, message, and timestamp
- Graceful degradation for partial data failures

### Styling and Design System

- Use TailwindCSS utility classes following project design system
- Lucide React icons: Download, History, FileText for action buttons
- Tooltips on icon buttons showing action descriptions
- Responsive design for desktop (1024px+) and tablet (768px-1023px) breakpoints
- Card-based layout with shadow and border for table container
- Sticky table header during scroll
- Accessible color contrast meeting WCAG AA standards
- Focus indicators for keyboard navigation

### Testing Requirements

- Unit tests for all React components using Vitest and React Testing Library
- Test rendering, user interactions (clicks, input), conditional rendering states
- Integration tests for API service methods with mocked responses
- Test data fetching, state updates, modal operations, pagination, sorting, filtering
- End-to-end tests using Playwright or Cypress for critical flows: loading templates, searching, opening modals, downloading PDFs
- Mock data generators for consistent testing
- Achieve minimum 80% code coverage across frontend components
- Backend endpoint tests with mocked database and file system

### Accessibility Requirements

- Semantic HTML5 elements (table, thead, tbody, button, dialog)
- ARIA labels for icon-only buttons
- ARIA live regions for dynamic content updates (pagination info, search results count)
- Keyboard navigation support: Tab through interactive elements, Enter to activate, ESC to close modals
- Focus trap within open modals
- Screen reader announcements for loading states and errors
- Skip links for keyboard users
- Color contrast ratio ≥4.5:1 for normal text, ≥3:1 for large text

## External Dependencies

No new external dependencies required. The implementation uses existing project dependencies:

- **React 19** - Already configured for frontend framework
- **TypeScript** - Already configured for type safety
- **TailwindCSS** - Already configured for styling
- **React Router** - Already configured for routing to `/templates` page
- **Axios** - Already configured for HTTP requests to backend API
- **React Hook Form** - Already available if needed for filter forms
- **Lucide React** - Already configured for icon components
- **Vitest + React Testing Library** - Already configured for testing

All necessary libraries are part of the existing tech stack as defined in @.agent-os/product/tech-stack.md
