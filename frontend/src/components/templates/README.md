# Template Management Components

A comprehensive set of components for managing PDF templates with version history and form field analysis.

## Components Overview

### Table Components

#### EmptyState
Displays a friendly empty state message when no templates are available.

```tsx
import { EmptyState } from './components/templates';

<EmptyState
  title="No templates found"
  description="Upload your first template to get started"
  showIcon={true}
  action={{
    label: 'Upload Template',
    onClick: () => navigate('/upload')
  }}
/>
```

#### TableFilters
Search input with clear button for filtering templates.

```tsx
import { TableFilters } from './components/templates';

<TableFilters
  search={searchQuery}
  onSearchChange={setSearchQuery}
/>
```

#### TablePagination
Pagination controls with page size selector and navigation buttons.

```tsx
import { TablePagination } from './components/templates';

<TablePagination
  currentPage={2}
  totalPages={10}
  pageSize={20}
  totalItems={200}
  onPageChange={setPage}
  onPageSizeChange={setPageSize}
/>
```

#### TemplateActionsMenu
Action buttons for each template row (download, versions, fields).

```tsx
import { TemplateActionsMenu } from './components/templates';

<TemplateActionsMenu
  templateId={template.id}
  templateName={template.name}
  onDownload={handleDownload}
  onViewVersions={handleViewVersions}
  onViewFields={handleViewFields}
/>
```

#### TemplatesTable
Main table displaying templates with sortable columns.

```tsx
import { TemplatesTable } from './components/templates';

<TemplatesTable
  templates={templates}
  isLoading={isLoading}
  sortBy="updated_at"
  sortOrder="desc"
  onSort={handleSort}
  onDownload={handleDownload}
  onViewVersions={handleViewVersions}
  onViewFields={handleViewFields}
/>
```

### Modal Components

#### VersionHistoryModal
Timeline-based display of template version history with metadata.

```tsx
import { VersionHistoryModal } from './components/templates';

<VersionHistoryModal
  isOpen={isModalOpen}
  onClose={() => setIsModalOpen(false)}
  templateName="SEPE Template"
  versions={versions}
  isLoading={isLoading}
  error={error}
  currentPage={1}
  totalPages={3}
  onPageChange={setPage}
/>
```

**Features:**
- Timeline layout with current version highlighted
- PDF metadata display (author, dates, pages, size)
- Pagination for many versions
- ESC key and click-outside to close
- Full accessibility support

#### TemplateFieldsModal
Table display of PDF AcroForm fields with search and filtering.

```tsx
import { TemplateFieldsModal } from './components/templates';

<TemplateFieldsModal
  isOpen={isModalOpen}
  onClose={() => setIsModalOpen(false)}
  templateName="SEPE Template"
  fields={fields}
  versionInfo={versionInfo}
  isLoading={isLoading}
  error={error}
  currentPage={1}
  totalPages={2}
  search={search}
  pageNumber={pageNumber}
  onPageChange={setPage}
  onSearchChange={setSearch}
  onPageNumberFilter={setPageNumber}
  onClearPageFilter={clearPageNumber}
/>
```

**Features:**
- Color-coded field type badges
- Search by field ID or nearby text
- Filter by page number
- Field position coordinates
- Pagination
- ESC key and click-outside to close

## Custom Hooks

### useTemplates
Main hook for managing templates list with pagination, sorting, and search.

```tsx
import { useTemplates } from './hooks';

function TemplatesPage() {
  const {
    templates,
    isLoading,
    error,
    currentPage,
    totalPages,
    setPage,
    handleSort,
    search,
    setSearch,
  } = useTemplates();

  // ... component logic
}
```

**Features:**
- Automatic data fetching on mount
- Debounced search (300ms)
- Pagination and sorting
- Loading and error states

### useTemplateVersions
Hook for lazy-loading template versions (for modals).

```tsx
import { useTemplateVersions } from './hooks';

function VersionsModal() {
  const {
    versions,
    isLoading,
    fetchVersions,
    clearVersions,
  } = useTemplateVersions();

  useEffect(() => {
    if (isOpen && templateId) {
      fetchVersions(templateId);
    } else {
      clearVersions();
    }
  }, [isOpen, templateId]);
}
```

### useTemplateFields
Hook for lazy-loading template fields with search and filtering.

```tsx
import { useTemplateFields } from './hooks';

function FieldsModal() {
  const {
    fields,
    isLoading,
    search,
    setSearch,
    pageNumber,
    setPageNumber,
    fetchCurrentVersionFields,
    clearFields,
  } = useTemplateFields();
}
```

## Architecture

### State Management
- **React Hooks**: useState, useEffect, useCallback for local state
- **Custom Hooks**: Encapsulate business logic and API calls
- **No Redux**: Hooks-based architecture for simpler state management

### API Integration
- **Service Layer**: `templatesService` handles all API calls
- **Type Safety**: Full TypeScript coverage with strict types
- **Error Handling**: Consistent error states and user feedback

### Styling
- **TailwindCSS**: Utility-first CSS framework
- **Dark Mode**: Full dark mode support throughout
- **Responsive**: Mobile-first design approach

### Testing
- **158 Tests**: Comprehensive unit and integration tests
- **React Testing Library**: User-centric testing approach
- **Vitest**: Fast test runner with great DX

## File Structure

```
frontend/src/
├── components/templates/
│   ├── __tests__/
│   │   ├── EmptyState.test.tsx
│   │   ├── TableFilters.test.tsx
│   │   ├── TablePagination.test.tsx
│   │   ├── TemplateActionsMenu.test.tsx
│   │   ├── TemplatesTable.test.tsx
│   │   ├── VersionHistoryModal.test.tsx
│   │   └── TemplateFieldsModal.test.tsx
│   ├── EmptyState.tsx
│   ├── TableFilters.tsx
│   ├── TablePagination.tsx
│   ├── TemplateActionsMenu.tsx
│   ├── TemplatesTable.tsx
│   ├── VersionHistoryModal.tsx
│   ├── TemplateFieldsModal.tsx
│   ├── index.ts
│   └── README.md
├── hooks/
│   ├── useTemplates.ts
│   ├── useTemplateVersions.ts
│   ├── useTemplateFields.ts
│   └── index.ts
├── services/
│   ├── templates.service.ts
│   └── apiService.ts
├── types/
│   └── templates.types.ts
├── utils/
│   ├── formatters.ts
│   └── file-download.ts
└── pages/templates/
    ├── __tests__/
    │   └── TemplatesPage.test.tsx
    └── TemplatesPage.tsx
```

## Best Practices

### Component Design
- Single Responsibility Principle
- Props drilling avoided through custom hooks
- Composition over inheritance
- Reusable, testable components

### Performance
- Debounced search inputs
- Lazy loading for modal data
- Memoization where appropriate
- Pagination for large datasets

### Accessibility
- Semantic HTML elements
- ARIA attributes on interactive elements
- Keyboard navigation support
- Focus management in modals
- Screen reader friendly

### Code Quality
- TypeScript for type safety
- JSDoc documentation
- Consistent naming conventions
- ESLint and Prettier configured
- 100% test coverage on critical paths

## Contributing

When adding new features:

1. **Write Tests First**: Follow TDD approach
2. **Type Everything**: Use TypeScript strictly
3. **Document Thoroughly**: Add JSDoc comments
4. **Test Accessibility**: Use React Testing Library queries
5. **Follow Patterns**: Match existing code style

## License

Part of the AI4Devs Final Project.

