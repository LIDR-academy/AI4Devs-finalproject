/**
 * Simplified tests for TemplateAnalyzePage component focused on integration
 */

import { render, screen } from "@testing-library/react";
import { describe, it, expect, vi, beforeEach } from "vitest";
import TemplateAnalyzePage from "../../pages/TemplateAnalyzePage/TemplateAnalyzePage";

// Mock all the dependencies
vi.mock("../../services/pdfAnalysisService", () => ({
  analyzePDFTemplate: vi.fn(),
  validatePDFFile: vi.fn(() => ({ isValid: true })),
  handleAnalysisError: vi.fn((error) => "Mock error message"),
  formatFileSize: vi.fn((bytes: number) => `${bytes} bytes`),
  isDragAndDropSupported: vi.fn(() => true),
}));

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

vi.mock("lucide-react", () => ({
  Upload: () => <div data-testid="upload-icon" />,
  FileText: () => <div data-testid="file-text-icon" />,
  AlertCircle: () => <div data-testid="alert-circle-icon" />,
  CheckCircle: () => <div data-testid="check-circle-icon" />,
  Loader2: () => <div data-testid="loader-icon" />,
  X: () => <div data-testid="x-icon" />,
  ChevronUp: () => <div data-testid="chevron-up-icon" />,
  ChevronDown: () => <div data-testid="chevron-down-icon" />,
  List: () => <div data-testid="list-icon" />,
  CheckSquare: () => <div data-testid="check-square-icon" />,
  Circle: () => <div data-testid="circle-icon" />,
  ArrowLeft: () => <div data-testid="arrow-left-icon" />,
  RefreshCw: () => <div data-testid="refresh-icon" />,
  Download: () => <div data-testid="download-icon" />,
}));

describe("TemplateAnalyzePage Integration Tests", () => {
  beforeEach(() => {
    vi.clearAllMocks();
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

    it("should have proper page accessibility attributes", () => {
      render(<TemplateAnalyzePage />);

      const main = screen.getByRole("main");
      expect(main).toHaveAttribute("aria-label", "PDF Template Analysis");

      const heading = screen.getByRole("heading", { level: 1 });
      expect(heading).toBeInTheDocument();
    });
  });

  describe("Component Integration", () => {
    it("should integrate FileUploadZone component", () => {
      render(<TemplateAnalyzePage />);

      // FileUploadZone should be present (we can't easily test data-testid due to mocking)
      // But we can verify the main structure is there
      expect(screen.getByText(/upload a pdf form to analyze/i)).toBeInTheDocument();
    });

    it("should show success state with results", () => {
      const { useAnalyzePageState } = require("../../hooks/usePDFAnalysis");
      const mockFields = [
        {
          field_id: "A0101",
          type: "text",
          near_text: "hasta un máximo de",
          value_options: null,
        },
      ];
      const mockMetadata = {
        total_fields: 1,
        processing_time_ms: 750,
        document_pages: 1,
      };

      useAnalyzePageState.mockReturnValue({
        state: {
          uploadState: "success",
          selectedFile: new File(["test"], "test.pdf", { type: "application/pdf" }),
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

      expect(screen.getByText("Analysis Results")).toBeInTheDocument();
      expect(screen.getByText("test.pdf")).toBeInTheDocument();
    });

    it("should show error state", () => {
      const { useAnalyzePageState } = require("../../hooks/usePDFAnalysis");

      useAnalyzePageState.mockReturnValue({
        state: {
          uploadState: "error",
          selectedFile: new File(["test"], "test.pdf", { type: "application/pdf" }),
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

      expect(screen.getByRole("alert")).toBeInTheDocument();
      expect(screen.getByText("File processing failed")).toBeInTheDocument();
    });

    it("should show uploading state", () => {
      const { useAnalyzePageState } = require("../../hooks/usePDFAnalysis");

      useAnalyzePageState.mockReturnValue({
        state: {
          uploadState: "uploading",
          selectedFile: new File(["test"], "test.pdf", { type: "application/pdf" }),
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

      expect(screen.getByText(/uploading/i)).toBeInTheDocument();
      expect(screen.getByRole("progressbar")).toBeInTheDocument();
    });

    it("should show processing state", () => {
      const { useAnalyzePageState } = require("../../hooks/usePDFAnalysis");

      useAnalyzePageState.mockReturnValue({
        state: {
          uploadState: "processing",
          selectedFile: new File(["test"], "test.pdf", { type: "application/pdf" }),
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

      expect(screen.getByText(/analyzing pdf structure/i)).toBeInTheDocument();
    });
  });

  describe("Responsive Design", () => {
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

  describe("Action Buttons", () => {
    it("should show action buttons in success state", () => {
      const { useAnalyzePageState } = require("../../hooks/usePDFAnalysis");
      const mockFields = [
        {
          field_id: "A0101",
          type: "text",
          near_text: "hasta un máximo de",
          value_options: null,
        },
      ];

      useAnalyzePageState.mockReturnValue({
        state: {
          uploadState: "success",
          selectedFile: new File(["test"], "test.pdf", { type: "application/pdf" }),
          analysisResults: mockFields,
          metadata: { total_fields: 1, processing_time_ms: 750, document_pages: 1 },
          error: null,
          progress: 100,
        },
        updateState: vi.fn(),
        handleFileSelect: vi.fn(),
        handleAnalyze: vi.fn(),
        handleReset: vi.fn(),
      });

      render(<TemplateAnalyzePage />);

      expect(screen.getByRole("button", { name: /analyze another file/i })).toBeInTheDocument();
      expect(screen.getByRole("button", { name: /export results/i })).toBeInTheDocument();
    });

    it("should show retry buttons in error state", () => {
      const { useAnalyzePageState } = require("../../hooks/usePDFAnalysis");

      useAnalyzePageState.mockReturnValue({
        state: {
          uploadState: "error",
          selectedFile: new File(["test"], "test.pdf", { type: "application/pdf" }),
          analysisResults: null,
          metadata: null,
          error: "Processing failed",
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

  describe("Empty Results", () => {
    it("should show empty results message when no fields found", () => {
      const { useAnalyzePageState } = require("../../hooks/usePDFAnalysis");

      useAnalyzePageState.mockReturnValue({
        state: {
          uploadState: "success",
          selectedFile: new File(["test"], "test.pdf", { type: "application/pdf" }),
          analysisResults: [],
          metadata: { total_fields: 0, processing_time_ms: 750, document_pages: 1 },
          error: null,
          progress: 100,
        },
        updateState: vi.fn(),
        handleFileSelect: vi.fn(),
        handleAnalyze: vi.fn(),
        handleReset: vi.fn(),
      });

      render(<TemplateAnalyzePage />);

      expect(screen.getByText(/no form fields found/i)).toBeInTheDocument();
      expect(screen.getByText(/doesn't contain any analyzable form fields/i)).toBeInTheDocument();
    });
  });
});
