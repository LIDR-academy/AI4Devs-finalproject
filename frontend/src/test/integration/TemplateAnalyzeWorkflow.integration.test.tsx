/**
 * Integration tests for the complete PDF Template Analysis workflow
 * Tests the end-to-end process from file upload to results display
 */

import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { BrowserRouter } from "react-router-dom";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import TemplateAnalyzePage from "../../pages/TemplateAnalyzePage/TemplateAnalyzePage";
import { AnalysisMetadata, AnalysisResponse, TemplateField } from "../../types/pdfAnalysis";

// Mock the PDF analysis service with real-like responses
const mockAnalyzePDFWithRetry = vi.fn();
const mockValidatePDFFile = vi.fn();
const mockHandleAnalysisError = vi.fn();
const mockFormatFileSize = vi.fn((bytes: number) => `${(bytes / 1024 / 1024).toFixed(1)} MB`);
const mockIsDragAndDropSupported = vi.fn(() => true);

vi.mock("../../services/pdfAnalysisService", () => ({
  analyzePDFTemplate: mockAnalyzePDFWithRetry,
  validatePDFFile: mockValidatePDFFile,
  handleAnalysisError: mockHandleAnalysisError,
  formatFileSize: mockFormatFileSize,
  isDragAndDropSupported: mockIsDragAndDropSupported,
  analyzePDFWithRetry: mockAnalyzePDFWithRetry,
}));

// Mock hooks with realistic implementations
const mockUseAnalyzePageState = vi.fn();
const mockUseResponsiveBreakpoints = vi.fn(() => ({
  isXs: false,
  isSm: false,
  isMd: true,
  isLg: true,
  isXl: true,
}));
const mockUseTableSorting = vi.fn();
const mockUseDragAndDrop = vi.fn();
const mockUseFocusManagement = vi.fn(() => ({
  handleKeyDown: vi.fn(),
}));

vi.mock("../../hooks/usePDFAnalysis", () => ({
  useAnalyzePageState: mockUseAnalyzePageState,
  useResponsiveBreakpoints: mockUseResponsiveBreakpoints,
  useTableSorting: mockUseTableSorting,
  useDragAndDrop: mockUseDragAndDrop,
  useFocusManagement: mockUseFocusManagement,
}));

// Mock Lucide React icons
vi.mock("lucide-react", () => ({
  Upload: ({ className, ...props }: any) => (
    <div data-testid="upload-icon" className={className} {...props} />
  ),
  FileText: ({ className, ...props }: any) => (
    <div data-testid="file-text-icon" className={className} {...props} />
  ),
  AlertCircle: ({ className, ...props }: any) => (
    <div data-testid="alert-circle-icon" className={className} {...props} />
  ),
  CheckCircle: ({ className, ...props }: any) => (
    <div data-testid="check-circle-icon" className={className} {...props} />
  ),
  Loader2: ({ className, ...props }: any) => (
    <div data-testid="loader-icon" className={className} {...props} />
  ),
  X: ({ className, ...props }: any) => (
    <div data-testid="x-icon" className={className} {...props} />
  ),
  ArrowLeft: ({ className, ...props }: any) => (
    <div data-testid="arrow-left-icon" className={className} {...props} />
  ),
  RefreshCw: ({ className, ...props }: any) => (
    <div data-testid="refresh-icon" className={className} {...props} />
  ),
  Download: ({ className, ...props }: any) => (
    <div data-testid="download-icon" className={className} {...props} />
  ),
  ChevronUp: ({ className, ...props }: any) => (
    <div data-testid="chevron-up-icon" className={className} {...props} />
  ),
  ChevronDown: ({ className, ...props }: any) => (
    <div data-testid="chevron-down-icon" className={className} {...props} />
  ),
  List: ({ className, ...props }: any) => (
    <div data-testid="list-icon" className={className} {...props} />
  ),
  CheckSquare: ({ className, ...props }: any) => (
    <div data-testid="check-square-icon" className={className} {...props} />
  ),
  Circle: ({ className, ...props }: any) => (
    <div data-testid="circle-icon" className={className} {...props} />
  ),
}));

// Test data
const mockTemplateFields: TemplateField[] = [
  {
    field_id: "A0101",
    type: "text",
    near_text: "hasta un máximo de",
    value_options: null,
  },
  {
    field_id: "A0102",
    type: "text",
    near_text: "que suponen un",
    value_options: null,
  },
  {
    field_id: "B0201",
    type: "radiobutton",
    near_text: "Seleccione una opción:",
    value_options: ["Sí", "No"],
  },
  {
    field_id: "C0301",
    type: "listbox",
    near_text: "Provincia:",
    value_options: ["Madrid", "Barcelona", "Valencia", "Sevilla"],
  },
  {
    field_id: "D0401",
    type: "checkbox",
    near_text: "Acepto términos:",
    value_options: null,
  },
];

const mockMetadata: AnalysisMetadata = {
  total_fields: 5,
  total_pages: 2,
  processing_time_ms: 850,
  file_size_bytes: 2048576,
};

const mockAnalysisResponse: AnalysisResponse = {
  data: mockTemplateFields,
  metadata: mockMetadata,
};

// Helper to wrap component with router
const renderWithRouter = (component: React.ReactElement) => {
  return render(<BrowserRouter>{component}</BrowserRouter>);
};

describe("PDF Template Analysis Integration Tests", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    
    // Setup service mocks directly
    mockAnalyzePDFWithRetry.mockResolvedValue(mockAnalysisResponse);
    mockValidatePDFFile.mockReturnValue({ isValid: true });
    mockHandleAnalysisError.mockReturnValue("Mock error message");

    // Setup hook mocks directly
    mockUseAnalyzePageState.mockReturnValue({
      state: {
        uploadState: "idle" as const,
        selectedFile: null,
        analysisResults: null,
        metadata: null,
        error: null,
        progress: 0,
      },
      handleFileSelect: vi.fn(),
      handleAnalyze: vi.fn(),
      handleReset: vi.fn(),
    });
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  describe("Complete Workflow - Success Path", () => {
    it("should complete the entire analysis workflow successfully", async () => {
      const user = userEvent.setup();
      
      // Mock successful file validation
      mockValidatePDFFile.mockReturnValue({ isValid: true });
      
      // Mock successful API response
      mockAnalyzePDFWithRetry.mockResolvedValue(mockAnalysisResponse);

      // Mock hook state progression
      let currentState = {
        uploadState: "idle" as const,
        selectedFile: null,
        analysisResults: null,
        metadata: null,
        error: null,
        progress: 0,
      };

      const mockHandleFileSelect = vi.fn((file: File) => {
        currentState = {
          ...currentState,
          selectedFile: file,
          uploadState: "idle",
          error: null,
        };
        mockUseAnalyzePageState.mockReturnValue({
          state: currentState,
          handleFileSelect: mockHandleFileSelect,
          handleAnalyze: mockHandleAnalyze,
          handleReset: mockHandleReset,
        });
      });

      const mockHandleAnalyze = vi.fn(async () => {
        // Simulate upload progress
        currentState = { ...currentState, uploadState: "uploading", progress: 50 };
        mockUseAnalyzePageState.mockReturnValue({
          state: currentState,
          handleFileSelect: mockHandleFileSelect,
          handleAnalyze: mockHandleAnalyze,
          handleReset: mockHandleReset,
        });

        // Simulate processing
        currentState = { ...currentState, uploadState: "processing", progress: 100 };
        mockUseAnalyzePageState.mockReturnValue({
          state: currentState,
          handleFileSelect: mockHandleFileSelect,
          handleAnalyze: mockHandleAnalyze,
          handleReset: mockHandleReset,
        });

        // Simulate success
        currentState = {
          ...currentState,
          uploadState: "success",
          analysisResults: mockTemplateFields,
          metadata: mockMetadata,
        };
        mockUseAnalyzePageState.mockReturnValue({
          state: currentState,
          handleFileSelect: mockHandleFileSelect,
          handleAnalyze: mockHandleAnalyze,
          handleReset: mockHandleReset,
        });
      });

      const mockHandleReset = vi.fn(() => {
        currentState = {
          uploadState: "idle",
          selectedFile: null,
          analysisResults: null,
          metadata: null,
          error: null,
          progress: 0,
        };
        mockUseAnalyzePageState.mockReturnValue({
          state: currentState,
          handleFileSelect: mockHandleFileSelect,
          handleAnalyze: mockHandleAnalyze,
          handleReset: mockHandleReset,
        });
      });

      // Initial state
      mockUseAnalyzePageState.mockReturnValue({
        state: currentState,
        handleFileSelect: mockHandleFileSelect,
        handleAnalyze: mockHandleAnalyze,
        handleReset: mockHandleReset,
      });

      renderWithRouter(<TemplateAnalyzePage />);

      // Step 1: Verify initial render
      expect(screen.getByText("PDF Template Analyzer")).toBeInTheDocument();
      expect(screen.getByText("Upload a PDF form to analyze its structure")).toBeInTheDocument();

      // Step 2: Upload file
      const testFile = new File(["test content"], "test-template.pdf", {
        type: "application/pdf",
      });

      const fileInput = screen.getByTestId("file-input");
      await user.upload(fileInput, testFile);

      expect(mockHandleFileSelect).toHaveBeenCalledWith(testFile);
      expect(mockValidatePDFFile).toHaveBeenCalledWith(testFile);

      // Step 3: Trigger analysis
      await mockHandleAnalyze();

      expect(mockAnalyzePDFWithRetry).toHaveBeenCalledWith(
        testFile,
        expect.any(Function)
      );

      // Step 4: Verify results are displayed
      // Note: Since we're mocking the state, we need to re-render with success state
      mockUseAnalyzePageState.mockReturnValue({
        state: {
          uploadState: "success",
          selectedFile: testFile,
          analysisResults: mockTemplateFields,
          metadata: mockMetadata,
          error: null,
          progress: 100,
        },
        handleFileSelect: mockHandleFileSelect,
        handleAnalyze: mockHandleAnalyze,
        handleReset: mockHandleReset,
      });

      renderWithRouter(<TemplateAnalyzePage />);

      // Verify success message
      expect(screen.getByText("Analysis Complete!")).toBeInTheDocument();

      // Verify results table is displayed
      expect(screen.getByText("Analysis Results")).toBeInTheDocument();
      expect(screen.getByRole("table")).toBeInTheDocument();

      // Verify all fields are displayed
      expect(screen.getByText("A0101")).toBeInTheDocument();
      expect(screen.getByText("A0102")).toBeInTheDocument();
      expect(screen.getByText("B0201")).toBeInTheDocument();
      expect(screen.getByText("C0301")).toBeInTheDocument();
      expect(screen.getByText("D0401")).toBeInTheDocument();

      // Verify metadata is displayed
      expect(screen.getByText("5")).toBeInTheDocument(); // total fields
      expect(screen.getByText("2")).toBeInTheDocument(); // total pages

      // Verify action buttons are available
      expect(screen.getByText("Analyze Another File")).toBeInTheDocument();
      expect(screen.getByText("Export Results")).toBeInTheDocument();
    });
  });

  describe("Error Scenarios", () => {
    it("should handle file validation errors", async () => {
      const user = userEvent.setup();

      // Mock file validation error
      mockValidatePDFFile.mockReturnValue({
        isValid: false,
        error: "File size exceeds 10MB limit",
      });

      const mockHandleFileSelect = vi.fn();
      const mockHandleAnalyze = vi.fn();
      const mockHandleReset = vi.fn();

      mockUseAnalyzePageState.mockReturnValue({
        state: {
          uploadState: "error",
          selectedFile: null,
          analysisResults: null,
          metadata: null,
          error: "File size exceeds 10MB limit",
          progress: 0,
        },
        handleFileSelect: mockHandleFileSelect,
        handleAnalyze: mockHandleAnalyze,
        handleReset: mockHandleReset,
      });

      renderWithRouter(<TemplateAnalyzePage />);

      // Verify error is displayed
      expect(screen.getByText("Analysis Failed")).toBeInTheDocument();
      expect(screen.getByText("File size exceeds 10MB limit")).toBeInTheDocument();

      // Verify retry options are available
      expect(screen.getByText("Try Again")).toBeInTheDocument();
      expect(screen.getByText("Choose Different File")).toBeInTheDocument();
    });

    it("should handle network/API errors", async () => {
      // Mock API error
      mockAnalyzePDFWithRetry.mockRejectedValue(new Error("Network error"));
      mockHandleAnalysisError.mockReturnValue("Failed to connect to analysis service");

      const mockHandleFileSelect = vi.fn();
      const mockHandleAnalyze = vi.fn();
      const mockHandleReset = vi.fn();

      mockUseAnalyzePageState.mockReturnValue({
        state: {
          uploadState: "error",
          selectedFile: new File(["test"], "test.pdf", { type: "application/pdf" }),
          analysisResults: null,
          metadata: null,
          error: "Failed to connect to analysis service",
          progress: 0,
        },
        handleFileSelect: mockHandleFileSelect,
        handleAnalyze: mockHandleAnalyze,
        handleReset: mockHandleReset,
      });

      renderWithRouter(<TemplateAnalyzePage />);

      // Verify network error is displayed
      expect(screen.getByText("Analysis Failed")).toBeInTheDocument();
      expect(screen.getByText("Failed to connect to analysis service")).toBeInTheDocument();

      // Verify retry button is available
      expect(screen.getByText("Try Again")).toBeInTheDocument();
    });

    it("should handle empty results gracefully", async () => {
      const mockHandleFileSelect = vi.fn();
      const mockHandleAnalyze = vi.fn();
      const mockHandleReset = vi.fn();

      mockUseAnalyzePageState.mockReturnValue({
        state: {
          uploadState: "success",
          selectedFile: new File(["test"], "test.pdf", { type: "application/pdf" }),
          analysisResults: [],
          metadata: { ...mockMetadata, total_fields: 0 },
          error: null,
          progress: 100,
        },
        handleFileSelect: mockHandleFileSelect,
        handleAnalyze: mockHandleAnalyze,
        handleReset: mockHandleReset,
      });

      renderWithRouter(<TemplateAnalyzePage />);

      // Verify empty state message
      expect(screen.getByText("No Form Fields Found")).toBeInTheDocument();
      expect(screen.getByText("The uploaded PDF doesn't contain any analyzable form fields")).toBeInTheDocument();
      expect(screen.getByText("Try Another File")).toBeInTheDocument();
    });
  });

  describe("User Interactions", () => {
    it("should handle export functionality", async () => {
      const user = userEvent.setup();

      // Mock successful state with results
      const testFile = new File(["test"], "test-template.pdf", { type: "application/pdf" });
      
      const mockHandleFileSelect = vi.fn();
      const mockHandleAnalyze = vi.fn();
      const mockHandleReset = vi.fn();

      mockUseAnalyzePageState.mockReturnValue({
        state: {
          uploadState: "success",
          selectedFile: testFile,
          analysisResults: mockTemplateFields,
          metadata: mockMetadata,
          error: null,
          progress: 100,
        },
        handleFileSelect: mockHandleFileSelect,
        handleAnalyze: mockHandleAnalyze,
        handleReset: mockHandleReset,
      });

      // Mock DOM methods for download
      const mockCreateElement = vi.spyOn(document, 'createElement');
      const mockAppendChild = vi.spyOn(document.body, 'appendChild');
      const mockRemoveChild = vi.spyOn(document.body, 'removeChild');
      const mockClick = vi.fn();
      const mockCreateObjectURL = vi.spyOn(URL, 'createObjectURL');
      const mockRevokeObjectURL = vi.spyOn(URL, 'revokeObjectURL');

      const mockAnchor = {
        href: '',
        download: '',
        click: mockClick,
      } as any;

      mockCreateElement.mockReturnValue(mockAnchor);
      mockCreateObjectURL.mockReturnValue('blob:mock-url');

      renderWithRouter(<TemplateAnalyzePage />);

      // Click export button
      const exportButton = screen.getByText("Export Results");
      await user.click(exportButton);

      // Verify download was triggered
      expect(mockCreateElement).toHaveBeenCalledWith('a');
      expect(mockCreateObjectURL).toHaveBeenCalled();
      expect(mockClick).toHaveBeenCalled();
      expect(mockAppendChild).toHaveBeenCalledWith(mockAnchor);
      expect(mockRemoveChild).toHaveBeenCalledWith(mockAnchor);
      expect(mockRevokeObjectURL).toHaveBeenCalledWith('blob:mock-url');

      // Cleanup mocks
      mockCreateElement.mockRestore();
      mockAppendChild.mockRestore();
      mockRemoveChild.mockRestore();
      mockCreateObjectURL.mockRestore();
      mockRevokeObjectURL.mockRestore();
    });

    it("should handle reset/analyze another file", async () => {
      const user = userEvent.setup();

      const mockHandleFileSelect = vi.fn();
      const mockHandleAnalyze = vi.fn();
      const mockHandleReset = vi.fn();

      // Start with success state
      mockUseAnalyzePageState.mockReturnValue({
        state: {
          uploadState: "success",
          selectedFile: new File(["test"], "test.pdf", { type: "application/pdf" }),
          analysisResults: mockTemplateFields,
          metadata: mockMetadata,
          error: null,
          progress: 100,
        },
        handleFileSelect: mockHandleFileSelect,
        handleAnalyze: mockHandleAnalyze,
        handleReset: mockHandleReset,
      });

      renderWithRouter(<TemplateAnalyzePage />);

      // Click "Analyze Another File"
      const resetButton = screen.getByText("Analyze Another File");
      await user.click(resetButton);

      expect(mockHandleReset).toHaveBeenCalled();
    });
  });

  describe("Accessibility", () => {
    it("should maintain proper accessibility throughout the workflow", async () => {
      const mockHandleFileSelect = vi.fn();
      const mockHandleAnalyze = vi.fn();
      const mockHandleReset = vi.fn();

      // Test with success state
      mockUseAnalyzePageState.mockReturnValue({
        state: {
          uploadState: "success",
          selectedFile: new File(["test"], "test.pdf", { type: "application/pdf" }),
          analysisResults: mockTemplateFields,
          metadata: mockMetadata,
          error: null,
          progress: 100,
        },
        handleFileSelect: mockHandleFileSelect,
        handleAnalyze: mockHandleAnalyze,
        handleReset: mockHandleReset,
      });

      renderWithRouter(<TemplateAnalyzePage />);

      // Verify main landmarks
      expect(screen.getByRole("main")).toBeInTheDocument();
      expect(screen.getByRole("main")).toHaveAttribute("aria-label", "PDF Template Analysis");

      // Verify table accessibility
      const table = screen.getByRole("table");
      expect(table).toBeInTheDocument();
      expect(table).toHaveAttribute("aria-label", "PDF template field analysis results");

      // Verify table has proper headers
      expect(screen.getByRole("columnheader", { name: /field id/i })).toBeInTheDocument();
      expect(screen.getByRole("columnheader", { name: /type/i })).toBeInTheDocument();
      expect(screen.getByRole("columnheader", { name: /nearest label/i })).toBeInTheDocument();
      expect(screen.getByRole("columnheader", { name: /options/i })).toBeInTheDocument();

      // Verify buttons are properly labeled
      const exportButton = screen.getByRole("button", { name: /export results/i });
      expect(exportButton).toBeInTheDocument();

      const analyzeAnotherButton = screen.getByRole("button", { name: /analyze another file/i });
      expect(analyzeAnotherButton).toBeInTheDocument();
    });
  });
});
