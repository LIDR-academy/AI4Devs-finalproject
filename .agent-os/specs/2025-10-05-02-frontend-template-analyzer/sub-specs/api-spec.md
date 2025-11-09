# API Specification

This is the API specification for the spec detailed in @.agent-os/specs/2025-10-05-frontend-template-analyzer/spec.md

## Frontend API Integration

### API Endpoint Usage

**Endpoint:** POST /api/v1/templates/analyze  
**Purpose:** Upload PDF file and receive structured AcroForm field analysis  
**Content-Type:** multipart/form-data

### Request Implementation

```typescript
// API request function
const analyzePDFTemplate = async (file: File): Promise<AnalysisResponse> => {
  const formData = new FormData();
  formData.append("file", file);

  const response = await fetch("/api/v1/templates/analyze", {
    method: "POST",
    body: formData,
  });

  if (!response.ok) {
    throw new Error(`Analysis failed: ${response.statusText}`);
  }

  return response.json();
};
```

### Response Type Definitions

```typescript
// Template field interface matching backend response
interface TemplateField {
  field_id: string;
  type: "text" | "radiobutton" | "checkbox" | "listbox";
  near_text: string;
  value_options: string[] | null;
}

// Analysis metadata interface
interface AnalysisMetadata {
  total_fields: number;
  processing_time_ms: number;
  document_pages: number;
}

// Complete API response interface
interface AnalysisResponse {
  status: "success" | "error";
  data: TemplateField[];
  metadata: AnalysisMetadata;
}

// Error response interface
interface ErrorResponse {
  status: "error";
  error: string;
  message: string;
  timestamp: string;
}
```

### Component State Interfaces

```typescript
// Upload state management
type UploadState = "idle" | "uploading" | "processing" | "success" | "error";

// Component state interface
interface AnalyzePageState {
  uploadState: UploadState;
  selectedFile: File | null;
  analysisResults: TemplateField[] | null;
  metadata: AnalysisMetadata | null;
  error: string | null;
  progress: number;
}

// File upload validation result
interface FileValidationResult {
  isValid: boolean;
  error?: string;
}
```

### Component Props Interfaces

```typescript
// Main page component props
interface TemplateAnalyzePageProps {
  className?: string;
}

// File upload component props
interface FileUploadProps {
  onFileSelect: (file: File) => void;
  onAnalyze: () => void;
  selectedFile: File | null;
  uploadState: UploadState;
  error: string | null;
  className?: string;
}

// Table component props
interface TemplateFieldTableProps {
  fields: TemplateField[];
  metadata: AnalysisMetadata;
  loading?: boolean;
  className?: string;
}

// Table row component props
interface TableRowProps {
  field: TemplateField;
  index: number;
  className?: string;
}
```

## Error Handling

### Error Types and Handling

```typescript
// Custom error class for API errors
class AnalysisError extends Error {
  constructor(
    message: string,
    public statusCode?: number,
    public errorCode?: string
  ) {
    super(message);
    this.name = "AnalysisError";
  }
}

// Error handling utility
const handleAnalysisError = (error: unknown): string => {
  if (error instanceof AnalysisError) {
    switch (error.errorCode) {
      case "invalid_file_format":
        return "Please upload a valid PDF file.";
      case "file_too_large":
        return "File size exceeds 10MB limit. Please choose a smaller file.";
      case "no_form_fields":
        return "No form fields found in this PDF. Please upload a form-enabled PDF.";
      default:
        return error.message;
    }
  }

  return "An unexpected error occurred. Please try again.";
};
```

### HTTP Status Code Handling

```typescript
// Response status handler
const handleResponse = async (
  response: Response
): Promise<AnalysisResponse> => {
  if (response.ok) {
    return response.json();
  }

  const errorData: ErrorResponse = await response.json().catch(() => ({
    status: "error" as const,
    error: "unknown_error",
    message: "Unknown error occurred",
    timestamp: new Date().toISOString(),
  }));

  throw new AnalysisError(errorData.message, response.status, errorData.error);
};
```

## API Integration Utilities

### File Validation

```typescript
// File validation utility
const validatePDFFile = (file: File): FileValidationResult => {
  // Check file type
  if (
    file.type !== "application/pdf" &&
    !file.name.toLowerCase().endsWith(".pdf")
  ) {
    return {
      isValid: false,
      error: "Please select a PDF file (.pdf extension required).",
    };
  }

  // Check file size (10MB limit)
  const maxSize = 10 * 1024 * 1024; // 10MB in bytes
  if (file.size > maxSize) {
    return {
      isValid: false,
      error: `File size (${(file.size / (1024 * 1024)).toFixed(
        1
      )}MB) exceeds 10MB limit.`,
    };
  }

  // Check if file is empty
  if (file.size === 0) {
    return {
      isValid: false,
      error: "Selected file is empty. Please choose a valid PDF file.",
    };
  }

  return { isValid: true };
};
```

### Progress Tracking

```typescript
// Progress tracking for file upload
const uploadWithProgress = async (
  file: File,
  onProgress: (progress: number) => void
): Promise<AnalysisResponse> => {
  return new Promise((resolve, reject) => {
    const xhr = new XMLHttpRequest();
    const formData = new FormData();
    formData.append("file", file);

    xhr.upload.addEventListener("progress", (event) => {
      if (event.lengthComputable) {
        const progress = (event.loaded / event.total) * 100;
        onProgress(Math.round(progress));
      }
    });

    xhr.addEventListener("load", () => {
      if (xhr.status >= 200 && xhr.status < 300) {
        try {
          const response: AnalysisResponse = JSON.parse(xhr.responseText);
          resolve(response);
        } catch (error) {
          reject(new AnalysisError("Invalid response format"));
        }
      } else {
        reject(
          new AnalysisError(`Upload failed: ${xhr.statusText}`, xhr.status)
        );
      }
    });

    xhr.addEventListener("error", () => {
      reject(new AnalysisError("Network error occurred"));
    });

    xhr.open("POST", "/api/v1/templates/analyze");
    xhr.send(formData);
  });
};
```
