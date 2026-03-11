/**
 * Tests for PDF Template Analysis TypeScript interfaces and API utilities
 */

import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import {
    analyzePDFTemplate,
    handleAnalysisError,
    handleResponse,
    uploadWithProgress,
    validatePDFFile,
} from "../../services/pdfAnalysisService";
import {
    AnalysisError,
    AnalysisResponse,
    AnalyzePageState,
    ErrorResponse,
    FileValidationResult,
    TemplateField,
    UploadState
} from "../../types/pdfAnalysis";

// Mock fetch globally
const mockFetch = vi.fn();
global.fetch = mockFetch;

// Mock XMLHttpRequest for progress tracking tests
const mockXMLHttpRequest = vi.fn(() => ({
  open: vi.fn(),
  send: vi.fn(),
  upload: {
    addEventListener: vi.fn(),
  },
  addEventListener: vi.fn(),
  status: 200,
  responseText: JSON.stringify({
    status: "success",
    data: [],
    metadata: { total_fields: 0, processing_time_ms: 100, document_pages: 1 },
  }),
}));
global.XMLHttpRequest = mockXMLHttpRequest as any;

describe("PDF Analysis TypeScript Interfaces", () => {
  describe("TemplateField Interface", () => {
    it("should accept valid template field data", () => {
      const validField: TemplateField = {
        field_id: "A0101",
        type: "text",
        near_text: "hasta un máximo de",
        value_options: null,
      };

      expect(validField.field_id).toBe("A0101");
      expect(validField.type).toBe("text");
      expect(validField.near_text).toBe("hasta un máximo de");
      expect(validField.value_options).toBeNull();
    });

    it("should accept field with value options", () => {
      const fieldWithOptions: TemplateField = {
        field_id: "B0201",
        type: "radiobutton",
        near_text: "Seleccione una opción:",
        value_options: ["Sí", "No"],
      };

      expect(fieldWithOptions.value_options).toEqual(["Sí", "No"]);
      expect(fieldWithOptions.type).toBe("radiobutton");
    });

    it("should accept all valid field types", () => {
      const textField: TemplateField = {
        field_id: "T1",
        type: "text",
        near_text: "Text field",
        value_options: null,
      };

      const radioField: TemplateField = {
        field_id: "R1",
        type: "radiobutton",
        near_text: "Radio field",
        value_options: ["Option 1"],
      };

      const checkboxField: TemplateField = {
        field_id: "C1",
        type: "checkbox",
        near_text: "Checkbox field",
        value_options: null,
      };

      const listboxField: TemplateField = {
        field_id: "L1",
        type: "listbox",
        near_text: "Listbox field",
        value_options: ["Item 1", "Item 2"],
      };

      expect(textField.type).toBe("text");
      expect(radioField.type).toBe("radiobutton");
      expect(checkboxField.type).toBe("checkbox");
      expect(listboxField.type).toBe("listbox");
    });
  });

  describe("AnalysisResponse Interface", () => {
    it("should structure complete analysis response correctly", () => {
      const response: AnalysisResponse = {
        status: "success",
        data: [
          {
            field_id: "A0101",
            type: "text",
            near_text: "hasta un máximo de",
            value_options: null,
          },
        ],
        metadata: {
          total_fields: 1,
          processing_time_ms: 850,
          document_pages: 2,
        },
      };

      expect(response.status).toBe("success");
      expect(response.data).toHaveLength(1);
      expect(response.metadata.total_fields).toBe(1);
      expect(response.metadata.processing_time_ms).toBe(850);
      expect(response.metadata.document_pages).toBe(2);
    });

    it("should handle error response format", () => {
      const errorResponse: ErrorResponse = {
        status: "error",
        error: "invalid_file_format",
        message: "Please upload a valid PDF file.",
        timestamp: "2025-10-05T10:00:00Z",
      };

      expect(errorResponse.status).toBe("error");
      expect(errorResponse.error).toBe("invalid_file_format");
      expect(errorResponse.message).toBe("Please upload a valid PDF file.");
    });
  });

  describe("State Management Interfaces", () => {
    it("should define upload states correctly", () => {
      const states: UploadState[] = [
        "idle",
        "uploading",
        "processing",
        "success",
        "error",
      ];

      states.forEach((state) => {
        expect(typeof state).toBe("string");
      });
    });

    it("should structure analyze page state correctly", () => {
      const initialState: AnalyzePageState = {
        uploadState: "idle",
        selectedFile: null,
        analysisResults: null,
        metadata: null,
        error: null,
        progress: 0,
      };

      expect(initialState.uploadState).toBe("idle");
      expect(initialState.selectedFile).toBeNull();
      expect(initialState.progress).toBe(0);
    });

    it("should handle state with results", () => {
      const stateWithResults: AnalyzePageState = {
        uploadState: "success",
        selectedFile: new File(["test"], "test.pdf", { type: "application/pdf" }),
        analysisResults: [
          {
            field_id: "A0101",
            type: "text",
            near_text: "test",
            value_options: null,
          },
        ],
        metadata: {
          total_fields: 1,
          processing_time_ms: 100,
          document_pages: 1,
        },
        error: null,
        progress: 100,
      };

      expect(stateWithResults.uploadState).toBe("success");
      expect(stateWithResults.analysisResults).toHaveLength(1);
      expect(stateWithResults.progress).toBe(100);
    });
  });
});

describe("File Validation", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe("validatePDFFile", () => {
    it("should validate correct PDF file", () => {
      const validFile = new File(["test content"], "test.pdf", {
        type: "application/pdf",
      });

      const result: FileValidationResult = validatePDFFile(validFile);

      expect(result.isValid).toBe(true);
      expect(result.error).toBeUndefined();
    });

    it("should reject non-PDF file by type", () => {
      const invalidFile = new File(["test content"], "test.txt", {
        type: "text/plain",
      });

      const result = validatePDFFile(invalidFile);

      expect(result.isValid).toBe(false);
      expect(result.error).toContain("PDF file (.pdf extension required)");
    });

    it("should reject non-PDF file by extension", () => {
      const invalidFile = new File(["test content"], "test.doc", {
        type: "application/pdf", // Type is PDF but extension is not
      });

      const result = validatePDFFile(invalidFile);

      expect(result.isValid).toBe(false);
      expect(result.error).toContain("PDF file (.pdf extension required)");
    });

    it("should reject oversized file", () => {
      // Create a file larger than 10MB
      const largeContent = new Array(11 * 1024 * 1024).fill("a").join("");
      const largeFile = new File([largeContent], "large.pdf", {
        type: "application/pdf",
      });

      const result = validatePDFFile(largeFile);

      expect(result.isValid).toBe(false);
      expect(result.error).toContain("exceeds 10MB limit");
    });

    it("should reject empty file", () => {
      const emptyFile = new File([], "empty.pdf", {
        type: "application/pdf",
      });

      const result = validatePDFFile(emptyFile);

      expect(result.isValid).toBe(false);
      expect(result.error).toContain("empty");
    });

    it("should accept file with PDF extension regardless of MIME type", () => {
      const fileWithPdfExtension = new File(["test content"], "test.pdf", {
        type: "application/octet-stream", // Generic type
      });

      const result = validatePDFFile(fileWithPdfExtension);

      expect(result.isValid).toBe(true);
    });

    it("should handle file size edge cases", () => {
      // File exactly at 10MB limit
      const exactSizeContent = new Array(10 * 1024 * 1024).fill("a").join("");
      const exactSizeFile = new File([exactSizeContent], "exact.pdf", {
        type: "application/pdf",
      });

      const result = validatePDFFile(exactSizeFile);

      expect(result.isValid).toBe(true);
    });
  });
});

describe("Error Handling", () => {
  describe("AnalysisError Class", () => {
    it("should create error with message only", () => {
      const error = new AnalysisError("Test error message");

      expect(error.message).toBe("Test error message");
      expect(error.name).toBe("AnalysisError");
      expect(error.statusCode).toBeUndefined();
      expect(error.errorCode).toBeUndefined();
    });

    it("should create error with status code and error code", () => {
      const error = new AnalysisError(
        "File too large",
        413,
        "file_too_large"
      );

      expect(error.message).toBe("File too large");
      expect(error.statusCode).toBe(413);
      expect(error.errorCode).toBe("file_too_large");
    });

    it("should be instance of Error", () => {
      const error = new AnalysisError("Test");

      expect(error instanceof Error).toBe(true);
      expect(error instanceof AnalysisError).toBe(true);
    });
  });

  describe("handleAnalysisError", () => {
    it("should handle AnalysisError with known error codes", () => {
      const invalidFormatError = new AnalysisError(
        "Invalid format",
        400,
        "invalid_file_format"
      );
      const fileTooLargeError = new AnalysisError(
        "Too large",
        413,
        "file_too_large"
      );
      const noFormFieldsError = new AnalysisError(
        "No fields",
        400,
        "no_form_fields"
      );

      expect(handleAnalysisError(invalidFormatError)).toBe(
        "Please upload a valid PDF file."
      );
      expect(handleAnalysisError(fileTooLargeError)).toBe(
        "File size exceeds 10MB limit. Please choose a smaller file."
      );
      expect(handleAnalysisError(noFormFieldsError)).toBe(
        "No form fields found in this PDF. Please upload a form-enabled PDF."
      );
    });

    it("should handle AnalysisError with unknown error code", () => {
      const unknownError = new AnalysisError(
        "Custom error message",
        500,
        "unknown_error"
      );

      expect(handleAnalysisError(unknownError)).toBe("Custom error message");
    });

    it("should handle generic Error", () => {
      const genericError = new Error("Generic error message");

      expect(handleAnalysisError(genericError)).toBe(
        "An unexpected error occurred. Please try again."
      );
    });

    it("should handle unknown error types", () => {
      const unknownError = "String error";

      expect(handleAnalysisError(unknownError)).toBe(
        "An unexpected error occurred. Please try again."
      );
    });
  });
});

describe("API Integration", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockFetch.mockClear();
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  describe("analyzePDFTemplate", () => {
    it("should make successful API call", async () => {
      const mockResponse: AnalysisResponse = {
        status: "success",
        data: [
          {
            field_id: "A0101",
            type: "text",
            near_text: "hasta un máximo de",
            value_options: null,
          },
        ],
        metadata: {
          total_fields: 1,
          processing_time_ms: 850,
          document_pages: 1,
        },
      };

      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: () => Promise.resolve(mockResponse),
      });

      const file = new File(["test"], "test.pdf", { type: "application/pdf" });
      const result = await analyzePDFTemplate(file);

      expect(mockFetch).toHaveBeenCalledWith("/api/v1/templates/analyze", {
        method: "POST",
        body: expect.any(FormData),
      });

      expect(result).toEqual(mockResponse);
    });

    it("should handle API error response", async () => {
      mockFetch.mockResolvedValueOnce({
        ok: false,
        status: 400,
        statusText: "Bad Request",
        json: () =>
          Promise.resolve({
            status: "error",
            error: "invalid_file_format",
            message: "Invalid PDF file",
            timestamp: "2025-10-05T10:00:00Z",
          }),
      });

      const file = new File(["test"], "test.pdf", { type: "application/pdf" });

      await expect(analyzePDFTemplate(file)).rejects.toThrow("Invalid PDF file");
    });

    it("should handle network error", async () => {
      mockFetch.mockRejectedValueOnce(new Error("Network error"));

      const file = new File(["test"], "test.pdf", { type: "application/pdf" });

      await expect(analyzePDFTemplate(file)).rejects.toThrow("Network error");
    });

    it("should create FormData with correct file", async () => {
      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: () =>
          Promise.resolve({
            status: "success",
            data: [],
            metadata: { total_fields: 0, processing_time_ms: 100, document_pages: 1 },
          }),
      });

      const file = new File(["test content"], "test.pdf", {
        type: "application/pdf",
      });
      await analyzePDFTemplate(file);

      const formData = mockFetch.mock.calls[0][1].body as FormData;
      expect(formData.get("file")).toBe(file);
    });
  });

  describe("handleResponse", () => {
    it("should return data for successful response", async () => {
      const mockData: AnalysisResponse = {
        status: "success",
        data: [],
        metadata: { total_fields: 0, processing_time_ms: 100, document_pages: 1 },
      };

      const response = {
        ok: true,
        json: () => Promise.resolve(mockData),
      } as Response;

      const result = await handleResponse(response);
      expect(result).toEqual(mockData);
    });

    it("should throw AnalysisError for error response", async () => {
      const errorData: ErrorResponse = {
        status: "error",
        error: "invalid_file_format",
        message: "Invalid PDF file",
        timestamp: "2025-10-05T10:00:00Z",
      };

      const response = {
        ok: false,
        status: 400,
        json: () => Promise.resolve(errorData),
      } as Response;

      await expect(handleResponse(response)).rejects.toThrow(AnalysisError);
      await expect(handleResponse(response)).rejects.toThrow("Invalid PDF file");
    });

    it("should handle malformed error response", async () => {
      const response = {
        ok: false,
        status: 500,
        json: () => Promise.reject(new Error("Invalid JSON")),
      } as Response;

      await expect(handleResponse(response)).rejects.toThrow(AnalysisError);
      await expect(handleResponse(response)).rejects.toThrow("Unknown error occurred");
    });
  });

  describe("uploadWithProgress", () => {
    it("should track upload progress", async () => {
      const mockXHR = {
        open: vi.fn(),
        send: vi.fn(),
        upload: {
          addEventListener: vi.fn(),
        },
        addEventListener: vi.fn(),
        status: 200,
        responseText: JSON.stringify({
          status: "success",
          data: [],
          metadata: { total_fields: 0, processing_time_ms: 100, document_pages: 1 },
        }),
      };

      mockXMLHttpRequest.mockReturnValueOnce(mockXHR);

      const file = new File(["test"], "test.pdf", { type: "application/pdf" });
      const onProgress = vi.fn();

      const promise = uploadWithProgress(file, onProgress);

      // Simulate progress event
      const progressCallback = mockXHR.upload.addEventListener.mock.calls[0][1];
      progressCallback({ lengthComputable: true, loaded: 50, total: 100 });

      expect(onProgress).toHaveBeenCalledWith(50);

      // Simulate load event
      const loadCallback = mockXHR.addEventListener.mock.calls.find(
        (call) => call[0] === "load"
      )[1];
      loadCallback();

      const result = await promise;
      expect(result.status).toBe("success");
    });

    it("should handle upload error", async () => {
      const mockXHR = {
        open: vi.fn(),
        send: vi.fn(),
        upload: {
          addEventListener: vi.fn(),
        },
        addEventListener: vi.fn(),
      };

      mockXMLHttpRequest.mockReturnValueOnce(mockXHR);

      const file = new File(["test"], "test.pdf", { type: "application/pdf" });
      const onProgress = vi.fn();

      const promise = uploadWithProgress(file, onProgress);

      // Simulate error event
      const errorCallback = mockXHR.addEventListener.mock.calls.find(
        (call) => call[0] === "error"
      )[1];
      errorCallback();

      await expect(promise).rejects.toThrow(AnalysisError);
      await expect(promise).rejects.toThrow("Network error occurred");
    });

    it("should handle non-computable progress", () => {
      const mockXHR = {
        open: vi.fn(),
        send: vi.fn(),
        upload: {
          addEventListener: vi.fn(),
        },
        addEventListener: vi.fn(),
      };

      mockXMLHttpRequest.mockReturnValueOnce(mockXHR);

      const file = new File(["test"], "test.pdf", { type: "application/pdf" });
      const onProgress = vi.fn();

      uploadWithProgress(file, onProgress);

      // Simulate progress event without lengthComputable
      const progressCallback = mockXHR.upload.addEventListener.mock.calls[0][1];
      progressCallback({ lengthComputable: false, loaded: 50, total: 100 });

      expect(onProgress).not.toHaveBeenCalled();
    });
  });
});
