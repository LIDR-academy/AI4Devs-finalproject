# Component Specification

This is the component specification for the spec detailed in @.agent-os/specs/2025-10-05-frontend-template-analyzer/spec.md

## Component Structure

### TemplateAnalyzePage Component

**Location:** `src/pages/TemplateAnalyzePage/TemplateAnalyzePage.tsx`  
**Route:** `/analyze`  
**Purpose:** Main container component that orchestrates file upload and result display

```typescript
interface TemplateAnalyzePageProps {
  className?: string;
}

const TemplateAnalyzePage: React.FC<TemplateAnalyzePageProps> = ({
  className,
}) => {
  // Component implementation with state management
  // File upload handling, API integration, and result display
};
```

**Key Features:**

- File upload state management (idle, uploading, processing, success, error)
- API integration with error handling and retry logic
- Responsive layout with mobile-first design
- Accessibility compliance with proper ARIA labels and keyboard navigation
- Loading states with progress indicators and user feedback

### FileUploadZone Component

**Location:** `src/components/FileUploadZone/FileUploadZone.tsx`  
**Purpose:** Drag-and-drop file upload interface with validation

```typescript
interface FileUploadZoneProps {
  onFileSelect: (file: File) => void;
  onAnalyze: () => void;
  selectedFile: File | null;
  uploadState: UploadState;
  error: string | null;
  disabled?: boolean;
  className?: string;
}

const FileUploadZone: React.FC<FileUploadZoneProps> = ({
  onFileSelect,
  onAnalyze,
  selectedFile,
  uploadState,
  error,
  disabled = false,
  className,
}) => {
  // Drag and drop implementation
  // File validation and error display
  // Visual feedback for drag states
};
```

**Key Features:**

- HTML5 drag-and-drop API integration
- File type and size validation (PDF, 10MB max)
- Visual feedback for drag states (hover, active, error)
- Fallback file input for traditional file selection
- Progress indicator during upload and processing
- Clear error messages with recovery suggestions

### TemplateFieldTable Component

**Location:** `src/components/TemplateFieldTable/TemplateFieldTable.tsx`  
**Purpose:** Responsive table displaying analysis results

```typescript
interface TemplateFieldTableProps {
  fields: TemplateField[];
  metadata: AnalysisMetadata;
  loading?: boolean;
  className?: string;
}

const TemplateFieldTable: React.FC<TemplateFieldTableProps> = ({
  fields,
  metadata,
  loading = false,
  className,
}) => {
  // Table rendering with responsive design
  // Column sorting and filtering
  // Mobile-friendly layout
};
```

**Key Features:**

- Responsive table design with horizontal scroll on mobile
- Column headers: Field ID, Type, Nearest Label, Options
- Proper handling of null/undefined value_options
- Row hover effects and zebra striping
- Loading skeleton while data is being fetched
- Empty state when no fields are found

## Component Layout Structure

### Page Layout

```tsx
<div className="template-analyze-page min-h-screen bg-gray-50 dark:bg-gray-900">
  <div className="container mx-auto px-4 py-8">
    {/* Page Header */}
    <header className="mb-8">
      <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
        PDF Template Analyzer
      </h1>
      <p className="mt-2 text-gray-600 dark:text-gray-400">
        Upload a PDF template to analyze its AcroForm field structure
      </p>
    </header>

    {/* Upload Section */}
    <section className="mb-8">
      <FileUploadZone
        onFileSelect={handleFileSelect}
        onAnalyze={handleAnalyze}
        selectedFile={selectedFile}
        uploadState={uploadState}
        error={error}
      />
    </section>

    {/* Results Section */}
    {analysisResults && (
      <section>
        <TemplateFieldTable
          fields={analysisResults}
          metadata={metadata}
          loading={uploadState === "processing"}
        />
      </section>
    )}
  </div>
</div>
```

### Table Layout

```tsx
<div className="bg-white dark:bg-gray-800 shadow-lg rounded-lg overflow-hidden">
  {/* Table Header with Metadata */}
  <div className="px-6 py-4 border-b border-gray-200 dark:border-gray-700">
    <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between">
      <h2 className="text-xl font-semibold text-gray-900 dark:text-white">
        Analysis Results
      </h2>
      <div className="mt-2 sm:mt-0 text-sm text-gray-500 dark:text-gray-400">
        {metadata.total_fields} fields • {metadata.document_pages} pages •
        {metadata.processing_time_ms}ms
      </div>
    </div>
  </div>

  {/* Responsive Table */}
  <div className="overflow-x-auto">
    <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
      <thead className="bg-gray-50 dark:bg-gray-700">
        <tr>
          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
            Field ID
          </th>
          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
            Type
          </th>
          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
            Nearest Label
          </th>
          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
            Options
          </th>
        </tr>
      </thead>
      <tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
        {fields.map((field, index) => (
          <TableRow key={field.field_id} field={field} index={index} />
        ))}
      </tbody>
    </table>
  </div>
</div>
```

## State Management

### Component State Structure

```typescript
// Main page state
interface AnalyzePageState {
  uploadState: UploadState;
  selectedFile: File | null;
  analysisResults: TemplateField[] | null;
  metadata: AnalysisMetadata | null;
  error: string | null;
  progress: number;
}

// Upload state enum
type UploadState = "idle" | "uploading" | "processing" | "success" | "error";

// State management hooks
const useAnalyzePageState = () => {
  const [state, setState] = useState<AnalyzePageState>({
    uploadState: "idle",
    selectedFile: null,
    analysisResults: null,
    metadata: null,
    error: null,
    progress: 0,
  });

  const updateState = useCallback((updates: Partial<AnalyzePageState>) => {
    setState((prev) => ({ ...prev, ...updates }));
  }, []);

  return { state, updateState };
};
```

### Event Handlers

```typescript
// File selection handler
const handleFileSelect = useCallback(
  (file: File) => {
    const validation = validatePDFFile(file);

    if (!validation.isValid) {
      updateState({
        uploadState: "error",
        error: validation.error,
        selectedFile: null,
      });
      return;
    }

    updateState({
      selectedFile: file,
      uploadState: "idle",
      error: null,
      analysisResults: null,
      metadata: null,
    });
  },
  [updateState]
);

// Analysis handler
const handleAnalyze = useCallback(async () => {
  if (!selectedFile) return;

  updateState({ uploadState: "uploading", error: null });

  try {
    const response = await uploadWithProgress(selectedFile, (progress) => {
      updateState({ progress });
    });

    updateState({
      uploadState: "success",
      analysisResults: response.data,
      metadata: response.metadata,
      progress: 100,
    });
  } catch (error) {
    updateState({
      uploadState: "error",
      error: handleAnalysisError(error),
      progress: 0,
    });
  }
}, [selectedFile, updateState]);
```

## Accessibility Features

### ARIA Labels and Roles

```typescript
// File upload zone accessibility
<div
  role="button"
  tabIndex={0}
  aria-label="Drag and drop PDF file here, or click to select file"
  aria-describedby="upload-instructions"
  onKeyDown={handleKeyDown}
  className="upload-zone"
>
  <div id="upload-instructions" className="sr-only">
    Upload a PDF file up to 10MB in size. Supported format: PDF only.
  </div>
</div>

// Table accessibility
<table
  role="table"
  aria-label="PDF template field analysis results"
  aria-describedby="table-summary"
>
  <caption id="table-summary" className="sr-only">
    Analysis results showing {fields.length} form fields found in the PDF template
  </caption>
</table>
```

### Keyboard Navigation

```typescript
// Keyboard event handling
const handleKeyDown = (event: React.KeyboardEvent) => {
  if (event.key === "Enter" || event.key === " ") {
    event.preventDefault();
    fileInputRef.current?.click();
  }
};

// Focus management
const focusNextElement = () => {
  const nextElement = document.querySelector(
    "[data-focus-next]"
  ) as HTMLElement;
  nextElement?.focus();
};
```

## Responsive Design

### Breakpoint Strategy

```typescript
// TailwindCSS responsive classes
const responsiveClasses = {
  container: "w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8",
  grid: "grid grid-cols-1 lg:grid-cols-2 gap-6",
  table: "overflow-x-auto sm:overflow-x-visible",
  card: "p-4 sm:p-6 lg:p-8"
};

// Mobile-first table design
<div className="block sm:hidden">
  {/* Card layout for mobile */}
  {fields.map(field => (
    <FieldCard key={field.field_id} field={field} />
  ))}
</div>

<div className="hidden sm:block">
  {/* Table layout for desktop */}
  <TemplateFieldTable fields={fields} metadata={metadata} />
</div>
```
