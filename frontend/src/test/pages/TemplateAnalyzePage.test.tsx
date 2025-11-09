/**
 * Tests for TemplateAnalyzePage component with complete workflow
 */

import { render, screen, waitFor, within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import TemplateAnalyzePage from "../../pages/TemplateAnalyzePage/TemplateAnalyzePage";
import { AnalysisResponse, TemplateField, AnalysisMetadata } from "../../types/pdfAnalysis";

// Mock the PDF analysis service
vi.mock("../../services/pdfAnalysisService", () => ({
  analyzePDFTemplate: vi.fn(),
  validatePDFFile: vi.fn(() => ({ isValid: true })),
  handleAnalysisError: vi.fn((error) => "Mock error message"),
  formatFileSize: vi.fn((bytes: number) => `${bytes} bytes`),
  isDragAndDropSupported: vi.fn(() => true),
}));

// Mock the hooks
vi.mock("../../hooks/usePDFAnalysis", () => ({
  useAnalyzePageState: vi.fn(() => ({
    state: {
      uploadState: "idle",
      selectedFile: null,
      analysisResults: null,
      metadata: null,
      error: null,
      progress: 0,
    },
    updateState: vi.fn(),
    handleFileSelect: vi.fn(),
    handleAnalyze: vi.fn(),
    handleReset: vi.fn(),
  })),
  useResponsiveBreakpoints: vi.fn(() => ({
    isXs: false,
    isSm: false,
    isMd: false,
    isLg: true,
    isXl: false,
    is2Xl: false,
  })),
  useTableSorting: vi.fn((data) => ({
    sortedData: data,
    sortKey: null,
    sortDirection: "asc" as const,
    handleSortChange: vi.fn(),
  })),
  useDragAndDrop: vi.fn(() => ({
    dragState: "idle",
    handleDragEnter: vi.fn(),
    handleDragOver: vi.fn(),
    handleDragLeave: vi.fn(),
    handleFileDrop: vi.fn(),
  })),
  useFocusManagement: vi.fn(() => ({
    handleKeyDown: vi.fn(),
  })),
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
  ArrowLeft: ({ className, ...props }: any) => (
    <div data-testid="arrow-left-icon" className={className} {...props} />
  ),
  RefreshCw: ({ className, ...props }: any) => (
    <div data-testid="refresh-icon" className={className} {...props} />
  ),
}));

describe("TemplateAnalyzePage Component", () => {
  const mockFields: TemplateField[] = [
    {
      field_id: "A0101",
      type: "text",
      near_text: "hasta un máximo de",
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
      value_options: ["Madrid", "Barcelona", "Valencia"],
    },
  ];

  const mockMetadata: AnalysisMetadata = {
    total_fields: 3,
    processing_time_ms: 750,
    document_pages: 1,
  };

  const mockAnalysisResponse: AnalysisResponse = {
    status: "success",
    data: mockFields,
    metadata: mockMetadata,
  };

  beforeEach(() => {
    vi.clearAllMocks();
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  describe("Initial Render", () => {
    it("should render the page with correct structure", () => {
      render(<TemplateAnalyzePage />);

      expect(screen.getByTestId("template-analyze-page")).toBeInTheDocument();
      expect(screen.getByRole("main")).toBeInTheDocument();
      expect(screen.getByRole("heading", { name: /pdf template analyzer/i })).toBeInTheDocument();
    });

    it("should render page header with title and description", () => {
      render(<TemplateAnalyzePage />);

      expect(screen.getByText("PDF Template Analyzer")).toBeInTheDocument();
      expect(screen.getByText(/upload a pdf form to analyze/i)).toBeInTheDocument();
    });

    it("should render FileUploadZone component", () => {
      render(<TemplateAnalyzePage />);

      expect(screen.getByTestId("file-upload-zone")).toBeInTheDocument();
      expect(screen.getByText(/drag and drop your pdf file here/i)).toBeInTheDocument();
    });

    it("should not render results section initially", () => {
      render(<TemplateAnalyzePage />);

      expect(screen.queryByTestId("template-field-table")).not.toBeInTheDocument();
      expect(screen.queryByText("Analysis Results")).not.toBeInTheDocument();
    });

    it("should have proper page accessibility attributes", () => {
      render(<TemplateAnalyzePage />);

      const main = screen.getByRole("main");
      expect(main).toHaveAttribute("aria-label", "PDF Template Analysis");

      const heading = screen.getByRole("heading", { level: 1 });
      expect(heading).toBeInTheDocument();
    });
  });

  describe("File Upload Workflow", () => {
    it("should handle file selection", async () => {
      const mockHandleFileSelect = vi.fn();
      const { useAnalyzePageState } = await import("../../hooks/usePDFAnalysis");
      
      (useAnalyzePageState as any).mockReturnValue({
        state: {
          uploadState: "idle",
          selectedFile: null,
          analysisResults: null,
          metadata: null,
          error: null,
          progress: 0,
        },
        updateState: vi.fn(),
        handleFileSelect: mockHandleFileSelect,
        handleAnalyze: vi.fn(),
        handleReset: vi.fn(),
      });

      const user = userEvent.setup();
      render(<TemplateAnalyzePage />);

      const file = new File(["test content"], "test.pdf", { type: "application/pdf" });
      const fileInput = screen.getByLabelText(/choose file/i);

      await user.upload(fileInput, file);

      expect(mockHandleFileSelect).toHaveBeenCalledWith(file);
    });

    it("should show selected file information", () => {
      const { useAnalyzePageState } = require("../../hooks/usePDFAnalysis");
      const selectedFile = new File(["test content"], "test.pdf", { type: "application/pdf" });
      
      useAnalyzePageState.mockReturnValue({
        state: {
          uploadState: "idle",
          selectedFile,
          analysisResults: null,
          metadata: null,
          error: null,
          progress: 0,
        },
        updateState: vi.fn(),
        handleFileSelect: vi.fn(),
        handleAnalyze: vi.fn(),
        handleReset: vi.fn(),
      });

      render(<TemplateAnalyzePage />);

      expect(screen.getByText("test.pdf")).toBeInTheDocument();
      expect(screen.getByRole("button", { name: /analyze pdf/i })).toBeInTheDocument();
    });

    it("should handle analyze button click", async () => {
      const { useAnalyzePageState } = require("../../hooks/usePDFAnalysis");
      const selectedFile = new File(["test content"], "test.pdf", { type: "application/pdf" });
      const mockHandleAnalyze = vi.fn();
      
      useAnalyzePageState.mockReturnValue({
        state: {
          uploadState: "idle",
          selectedFile,
          analysisResults: null,
          metadata: null,
          error: null,
          progress: 0,
        },
        updateState: vi.fn(),
        handleFileSelect: vi.fn(),
        handleAnalyze: mockHandleAnalyze,
        handleReset: vi.fn(),
      });

      const user = userEvent.setup();
      render(<TemplateAnalyzePage />);

      const analyzeButton = screen.getByRole("button", { name: /analyze pdf/i });
      await user.click(analyzeButton);

      expect(mockHandleAnalyze).toHaveBeenCalled();
    });
  });

  describe("Upload States", () => {
    it("should show uploading state", () => {
      const { useAnalyzePageState } = require("../../hooks/usePDFAnalysis");
      const selectedFile = new File(["test content"], "test.pdf", { type: "application/pdf" });
      
      useAnalyzePageState.mockReturnValue({
        state: {
          uploadState: "uploading",
          selectedFile,
          analysisResults: null,
          metadata: null,
          error: null,
          progress: 45,
        },
        updateState: vi.fn(),
        handleFileSelect: vi.fn(),
        handleAnalyze: vi.fn(),
        handleReset: vi.fn(),
      });

      render(<TemplateAnalyzePage />);

      expect(screen.getByTestId("loader-icon")).toBeInTheDocument();
      expect(screen.getByText(/uploading/i)).toBeInTheDocument();
    });

    it("should show processing state", () => {
      const { useAnalyzePageState } = require("../../hooks/usePDFAnalysis");
      const selectedFile = new File(["test content"], "test.pdf", { type: "application/pdf" });
      
      useAnalyzePageState.mockReturnValue({
        state: {
          uploadState: "processing",
          selectedFile,
          analysisResults: null,
          metadata: null,
          error: null,
          progress: 100,
        },
        updateState: vi.fn(),
        handleFileSelect: vi.fn(),
        handleAnalyze: vi.fn(),
        handleReset: vi.fn(),
      });

      render(<TemplateAnalyzePage />);

      expect(screen.getByTestId("loader-icon")).toBeInTheDocument();
      expect(screen.getByText(/analyzing/i)).toBeInTheDocument();
    });

    it("should show success state with results", () => {
      const { useAnalyzePageState } = require("../../hooks/usePDFAnalysis");
      const selectedFile = new File(["test content"], "test.pdf", { type: "application/pdf" });
      
      useAnalyzePageState.mockReturnValue({
        state: {
          uploadState: "success",
          selectedFile,
          analysisResults: mockFields,
          metadata: mockMetadata,
          error: null,
          progress: 100,
        },
        updateState: vi.fn(),
        handleFileSelect: vi.fn(),
        handleAnalyze: vi.fn(),
        handleReset: vi.fn(),
      });

      render(<TemplateAnalyzePage />);

      expect(screen.getByTestId("check-circle-icon")).toBeInTheDocument();
      expect(screen.getByText(/analysis complete/i)).toBeInTheDocument();
      expect(screen.getByTestId("template-field-table")).toBeInTheDocument();
    });

    it("should show error state", () => {
      const { useAnalyzePageState } = require("../../hooks/usePDFAnalysis");
      const selectedFile = new File(["test content"], "test.pdf", { type: "application/pdf" });
      
      useAnalyzePageState.mockReturnValue({
        state: {
          uploadState: "error",
          selectedFile,
          analysisResults: null,
          metadata: null,
          error: "File processing failed",
          progress: 0,
        },
        updateState: vi.fn(),
        handleFileSelect: vi.fn(),
        handleAnalyze: vi.fn(),
        handleReset: vi.fn(),
      });

      render(<TemplateAnalyzePage />);

      expect(screen.getByTestId("alert-circle-icon")).toBeInTheDocument();
      expect(screen.getByText("File processing failed")).toBeInTheDocument();
      expect(screen.getByRole("button", { name: /try again/i })).toBeInTheDocument();
    });
  });

  describe("Results Display", () => {
    beforeEach(() => {
      const { useAnalyzePageState } = require("../../hooks/usePDFAnalysis");
      const selectedFile = new File(["test content"], "test.pdf", { type: "application/pdf" });
      
      useAnalyzePageState.mockReturnValue({
        state: {
          uploadState: "success",
          selectedFile,
          analysisResults: mockFields,
          metadata: mockMetadata,
          error: null,
          progress: 100,
        },
        updateState: vi.fn(),
        handleFileSelect: vi.fn(),
        handleAnalyze: vi.fn(),
        handleReset: vi.fn(),
      });
    });

    it("should render results table", () => {
      render(<TemplateAnalyzePage />);

      expect(screen.getByTestId("template-field-table")).toBeInTheDocument();
      expect(screen.getByText("Analysis Results")).toBeInTheDocument();
    });

    it("should display all analyzed fields", () => {
      render(<TemplateAnalyzePage />);

      mockFields.forEach((field) => {
        expect(screen.getByText(field.field_id)).toBeInTheDocument();
        expect(screen.getByText(field.near_text)).toBeInTheDocument();
      });
    });

    it("should display metadata information", () => {
      render(<TemplateAnalyzePage />);

      expect(screen.getByText("3")).toBeInTheDocument(); // total_fields
      expect(screen.getByText("fields")).toBeInTheDocument();
      expect(screen.getByText("1")).toBeInTheDocument(); // document_pages
      expect(screen.getByText("pages")).toBeInTheDocument();
    });

    it("should show action buttons in results section", () => {
      render(<TemplateAnalyzePage />);

      expect(screen.getByRole("button", { name: /analyze another/i })).toBeInTheDocument();
      expect(screen.getByRole("button", { name: /export results/i })).toBeInTheDocument();
    });
  });

  describe("Action Buttons", () => {
    it("should handle analyze another file", async () => {
      const { useAnalyzePageState } = require("../../hooks/usePDFAnalysis");
      const selectedFile = new File(["test content"], "test.pdf", { type: "application/pdf" });
      const mockHandleReset = vi.fn();
      
      useAnalyzePageState.mockReturnValue({
        state: {
          uploadState: "success",
          selectedFile,
          analysisResults: mockFields,
          metadata: mockMetadata,
          error: null,
          progress: 100,
        },
        updateState: vi.fn(),
        handleFileSelect: vi.fn(),
        handleAnalyze: vi.fn(),
        handleReset: mockHandleReset,
      });

      const user = userEvent.setup();
      render(<TemplateAnalyzePage />);

      const analyzeAnotherButton = screen.getByRole("button", { name: /analyze another/i });
      await user.click(analyzeAnotherButton);

      expect(mockHandleReset).toHaveBeenCalled();
    });

    it("should handle export results", async () => {
      const { useAnalyzePageState } = require("../../hooks/usePDFAnalysis");
      const selectedFile = new File(["test content"], "test.pdf", { type: "application/pdf" });
      
      useAnalyzePageState.mockReturnValue({
        state: {
          uploadState: "success",
          selectedFile,
          analysisResults: mockFields,
          metadata: mockMetadata,
          error: null,
          progress: 100,
        },
        updateState: vi.fn(),
        handleFileSelect: vi.fn(),
        handleAnalyze: vi.fn(),
        handleReset: vi.fn(),
      });

      // Mock URL.createObjectURL and document.createElement
      const mockCreateObjectURL = vi.fn(() => "blob:mock-url");
      const mockClick = vi.fn();
      const mockAppendChild = vi.fn();
      const mockRemoveChild = vi.fn();
      
      global.URL.createObjectURL = mockCreateObjectURL;
      global.URL.revokeObjectURL = vi.fn();
      
      const mockAnchor = {
        href: "",
        download: "",
        click: mockClick,
      };
      
      vi.spyOn(document, "createElement").mockReturnValue(mockAnchor as any);
      vi.spyOn(document.body, "appendChild").mockImplementation(mockAppendChild);
      vi.spyOn(document.body, "removeChild").mockImplementation(mockRemoveChild);

      const user = userEvent.setup();
      render(<TemplateAnalyzePage />);

      const exportButton = screen.getByRole("button", { name: /export results/i });
      await user.click(exportButton);

      expect(mockCreateObjectURL).toHaveBeenCalled();
      expect(mockClick).toHaveBeenCalled();
    });

    it("should handle retry after error", async () => {
      const { useAnalyzePageState } = require("../../hooks/usePDFAnalysis");
      const selectedFile = new File(["test content"], "test.pdf", { type: "application/pdf" });
      const mockHandleAnalyze = vi.fn();
      
      useAnalyzePageState.mockReturnValue({
        state: {
          uploadState: "error",
          selectedFile,
          analysisResults: null,
          metadata: null,
          error: "Processing failed",
          progress: 0,
        },
        updateState: vi.fn(),
        handleFileSelect: vi.fn(),
        handleAnalyze: mockHandleAnalyze,
        handleReset: vi.fn(),
      });

      const user = userEvent.setup();
      render(<TemplateAnalyzePage />);

      const retryButton = screen.getByRole("button", { name: /try again/i });
      await user.click(retryButton);

      expect(mockHandleAnalyze).toHaveBeenCalled();
    });
  });

  describe("Progress Indicator", () => {
    it("should show progress bar during upload", () => {
      const { useAnalyzePageState } = require("../../hooks/usePDFAnalysis");
      const selectedFile = new File(["test content"], "test.pdf", { type: "application/pdf" });
      
      useAnalyzePageState.mockReturnValue({
        state: {
          uploadState: "uploading",
          selectedFile,
          analysisResults: null,
          metadata: null,
          error: null,
          progress: 65,
        },
        updateState: vi.fn(),
        handleFileSelect: vi.fn(),
        handleAnalyze: vi.fn(),
        handleReset: vi.fn(),
      });

      render(<TemplateAnalyzePage />);

      const progressBar = screen.getByRole("progressbar");
      expect(progressBar).toBeInTheDocument();
      expect(progressBar).toHaveAttribute("aria-valuenow", "65");
      expect(screen.getByText("65%")).toBeInTheDocument();
    });

    it("should show indeterminate progress during processing", () => {
      const { useAnalyzePageState } = require("../../hooks/usePDFAnalysis");
      const selectedFile = new File(["test content"], "test.pdf", { type: "application/pdf" });
      
      useAnalyzePageState.mockReturnValue({
        state: {
          uploadState: "processing",
          selectedFile,
          analysisResults: null,
          metadata: null,
          error: null,
          progress: 100,
        },
        updateState: vi.fn(),
        handleFileSelect: vi.fn(),
        handleAnalyze: vi.fn(),
        handleReset: vi.fn(),
      });

      render(<TemplateAnalyzePage />);

      expect(screen.getByTestId("loader-icon")).toBeInTheDocument();
      expect(screen.getByText(/analyzing pdf structure/i)).toBeInTheDocument();
    });
  });

  describe("Responsive Behavior", () => {
    it("should render mobile layout", () => {
      const { useResponsiveBreakpoints } = require("../../hooks/usePDFAnalysis");
      useResponsiveBreakpoints.mockReturnValue({
        isXs: true,
        isSm: false,
        isMd: false,
        isLg: false,
        isXl: false,
        is2Xl: false,
      });

      render(<TemplateAnalyzePage />);

      const pageContainer = screen.getByTestId("template-analyze-page");
      expect(pageContainer).toHaveClass("px-4"); // Mobile padding
    });

    it("should render desktop layout", () => {
      const { useResponsiveBreakpoints } = require("../../hooks/usePDFAnalysis");
      useResponsiveBreakpoints.mockReturnValue({
        isXs: false,
        isSm: false,
        isMd: false,
        isLg: true,
        isXl: false,
        is2Xl: false,
      });

      render(<TemplateAnalyzePage />);

      const pageContainer = screen.getByTestId("template-analyze-page");
      expect(pageContainer).toHaveClass("px-8"); // Desktop padding
    });
  });

  describe("Accessibility", () => {
    it("should have proper heading hierarchy", () => {
      render(<TemplateAnalyzePage />);

      const h1 = screen.getByRole("heading", { level: 1 });
      expect(h1).toHaveTextContent("PDF Template Analyzer");
    });

    it("should have proper ARIA labels", () => {
      render(<TemplateAnalyzePage />);

      const main = screen.getByRole("main");
      expect(main).toHaveAttribute("aria-label", "PDF Template Analysis");
    });

    it("should support keyboard navigation", async () => {
      const user = userEvent.setup();
      render(<TemplateAnalyzePage />);

      const uploadZone = screen.getByTestId("file-upload-zone");
      uploadZone.focus();

      await user.keyboard("{Tab}");
      
      // Should focus on the next interactive element
      expect(document.activeElement).toBeInTheDocument();
    });

    it("should announce state changes to screen readers", () => {
      const { useAnalyzePageState } = require("../../hooks/usePDFAnalysis");
      const selectedFile = new File(["test content"], "test.pdf", { type: "application/pdf" });
      
      useAnalyzePageState.mockReturnValue({
        state: {
          uploadState: "processing",
          selectedFile,
          analysisResults: null,
          metadata: null,
          error: null,
          progress: 100,
        },
        updateState: vi.fn(),
        handleFileSelect: vi.fn(),
        handleAnalyze: vi.fn(),
        handleReset: vi.fn(),
      });

      render(<TemplateAnalyzePage />);

      const statusRegion = screen.getByRole("status");
      expect(statusRegion).toBeInTheDocument();
      expect(statusRegion).toHaveAttribute("aria-live", "polite");
    });
  });

  describe("Error Handling", () => {
    it("should display validation errors", () => {
      const { useAnalyzePageState } = require("../../hooks/usePDFAnalysis");
      
      useAnalyzePageState.mockReturnValue({
        state: {
          uploadState: "error",
          selectedFile: null,
          analysisResults: null,
          metadata: null,
          error: "Please select a PDF file",
          progress: 0,
        },
        updateState: vi.fn(),
        handleFileSelect: vi.fn(),
        handleAnalyze: vi.fn(),
        handleReset: vi.fn(),
      });

      render(<TemplateAnalyzePage />);

      expect(screen.getByRole("alert")).toBeInTheDocument();
      expect(screen.getByText("Please select a PDF file")).toBeInTheDocument();
    });

    it("should display network errors", () => {
      const { useAnalyzePageState } = require("../../hooks/usePDFAnalysis");
      const selectedFile = new File(["test content"], "test.pdf", { type: "application/pdf" });
      
      useAnalyzePageState.mockReturnValue({
        state: {
          uploadState: "error",
          selectedFile,
          analysisResults: null,
          metadata: null,
          error: "Network error occurred. Please check your connection.",
          progress: 0,
        },
        updateState: vi.fn(),
        handleFileSelect: vi.fn(),
        handleAnalyze: vi.fn(),
        handleReset: vi.fn(),
      });

      render(<TemplateAnalyzePage />);

      expect(screen.getByText("Network error occurred. Please check your connection.")).toBeInTheDocument();
    });

    it("should provide recovery options", () => {
      const { useAnalyzePageState } = require("../../hooks/usePDFAnalysis");
      const selectedFile = new File(["test content"], "test.pdf", { type: "application/pdf" });
      
      useAnalyzePageState.mockReturnValue({
        state: {
          uploadState: "error",
          selectedFile,
          analysisResults: null,
          metadata: null,
          error: "Analysis failed",
          progress: 0,
        },
        updateState: vi.fn(),
        handleFileSelect: vi.fn(),
        handleAnalyze: vi.fn(),
        handleReset: vi.fn(),
      });

      render(<TemplateAnalyzePage />);

      expect(screen.getByRole("button", { name: /try again/i })).toBeInTheDocument();
      expect(screen.getByRole("button", { name: /choose different file/i })).toBeInTheDocument();
    });
  });

  describe("Integration", () => {
    it("should integrate FileUploadZone and TemplateFieldTable components", () => {
      const { useAnalyzePageState } = require("../../hooks/usePDFAnalysis");
      const selectedFile = new File(["test content"], "test.pdf", { type: "application/pdf" });
      
      useAnalyzePageState.mockReturnValue({
        state: {
          uploadState: "success",
          selectedFile,
          analysisResults: mockFields,
          metadata: mockMetadata,
          error: null,
          progress: 100,
        },
        updateState: vi.fn(),
        handleFileSelect: vi.fn(),
        handleAnalyze: vi.fn(),
        handleReset: vi.fn(),
      });

      render(<TemplateAnalyzePage />);

      // Both components should be present
      expect(screen.getByTestId("file-upload-zone")).toBeInTheDocument();
      expect(screen.getByTestId("template-field-table")).toBeInTheDocument();
    });

    it("should pass correct props to child components", () => {
      const { useAnalyzePageState } = require("../../hooks/usePDFAnalysis");
      const selectedFile = new File(["test content"], "test.pdf", { type: "application/pdf" });
      const mockHandleFileSelect = vi.fn();
      const mockHandleAnalyze = vi.fn();
      
      useAnalyzePageState.mockReturnValue({
        state: {
          uploadState: "idle",
          selectedFile,
          analysisResults: null,
          metadata: null,
          error: null,
          progress: 0,
        },
        updateState: vi.fn(),
        handleFileSelect: mockHandleFileSelect,
        handleAnalyze: mockHandleAnalyze,
        handleReset: vi.fn(),
      });

      render(<TemplateAnalyzePage />);

      // FileUploadZone should receive the correct props
      expect(screen.getByTestId("file-upload-zone")).toBeInTheDocument();
      expect(screen.getByText("test.pdf")).toBeInTheDocument();
    });
  });
});
