/**
 * Simplified integration tests for the PDF Template Analysis workflow
 * Focuses on testing the component integration without complex mocking
 */

import { render, screen } from "@testing-library/react";
import { BrowserRouter } from "react-router-dom";
import { beforeEach, describe, expect, it, vi } from "vitest";
import TemplateAnalyzePage from "../../pages/TemplateAnalyzePage/TemplateAnalyzePage";
import { AnalysisMetadata, TemplateField } from "../../types/pdfAnalysis";

// Mock the PDF analysis service
vi.mock("../../services/pdfAnalysisService", () => ({
  analyzePDFTemplate: vi.fn(),
  validatePDFFile: vi.fn(() => ({ isValid: true })),
  handleAnalysisError: vi.fn((error) => "Mock error message"),
  formatFileSize: vi.fn((bytes: number) => `${(bytes / 1024 / 1024).toFixed(1)} MB`),
  isDragAndDropSupported: vi.fn(() => true),
  analyzePDFWithRetry: vi.fn(),
}));

// Mock hooks
vi.mock("../../hooks/usePDFAnalysis", () => ({
  useAnalyzePageState: vi.fn(),
  useResponsiveBreakpoints: vi.fn(() => ({
    isXs: false,
    isSm: false,
    isMd: true,
    isLg: true,
    isXl: true,
  })),
  useTableSorting: vi.fn(() => ({
    sortedData: [],
    sortConfig: { key: null, direction: "asc" },
    handleSort: vi.fn(),
  })),
  useDragAndDrop: vi.fn(() => ({
    isDragOver: false,
    handleDragOver: vi.fn(),
    handleDragLeave: vi.fn(),
    handleDrop: vi.fn(),
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
    field_id: "B0201",
    type: "radiobutton",
    near_text: "Seleccione una opción:",
    value_options: ["Sí", "No"],
  },
];

const mockMetadata: AnalysisMetadata = {
  total_fields: 2,
  total_pages: 1,
  processing_time_ms: 500,
  file_size_bytes: 1024000,
};

// Helper to wrap component with router
const renderWithRouter = (component: React.ReactElement) => {
  return render(<BrowserRouter>{component}</BrowserRouter>);
};

describe("PDF Template Analysis Integration Tests", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe("Component Integration", () => {
    it("should render the complete page structure", () => {
      const { useAnalyzePageState } = require("../../hooks/usePDFAnalysis");
      
      useAnalyzePageState.mockReturnValue({
        state: {
          uploadState: "idle",
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

      renderWithRouter(<TemplateAnalyzePage />);

      // Verify main page elements
      expect(screen.getByText("PDF Template Analyzer")).toBeInTheDocument();
      expect(screen.getByText("Upload a PDF form to analyze its structure")).toBeInTheDocument();
      expect(screen.getByTestId("file-upload-zone")).toBeInTheDocument();
    });

    it("should display results when analysis is successful", () => {
      const { useAnalyzePageState } = require("../../hooks/usePDFAnalysis");
      
      useAnalyzePageState.mockReturnValue({
        state: {
          uploadState: "success",
          selectedFile: new File(["test"], "test.pdf", { type: "application/pdf" }),
          analysisResults: mockTemplateFields,
          metadata: mockMetadata,
          error: null,
          progress: 100,
        },
        handleFileSelect: vi.fn(),
        handleAnalyze: vi.fn(),
        handleReset: vi.fn(),
      });

      renderWithRouter(<TemplateAnalyzePage />);

      // Verify success state
      expect(screen.getByText("Analysis Complete!")).toBeInTheDocument();
      expect(screen.getByText("Analysis Results")).toBeInTheDocument();
      
      // Verify action buttons
      expect(screen.getByText("Analyze Another File")).toBeInTheDocument();
      expect(screen.getByText("Export Results")).toBeInTheDocument();
    });

    it("should display error state correctly", () => {
      const { useAnalyzePageState } = require("../../hooks/usePDFAnalysis");
      
      useAnalyzePageState.mockReturnValue({
        state: {
          uploadState: "error",
          selectedFile: null,
          analysisResults: null,
          metadata: null,
          error: "File validation failed",
          progress: 0,
        },
        handleFileSelect: vi.fn(),
        handleAnalyze: vi.fn(),
        handleReset: vi.fn(),
      });

      renderWithRouter(<TemplateAnalyzePage />);

      // Verify error state
      expect(screen.getByText("Analysis Failed")).toBeInTheDocument();
      expect(screen.getByText("File validation failed")).toBeInTheDocument();
      
      // Verify retry options
      expect(screen.getByText("Try Again")).toBeInTheDocument();
      expect(screen.getByText("Choose Different File")).toBeInTheDocument();
    });

    it("should display processing states", () => {
      const { useAnalyzePageState } = require("../../hooks/usePDFAnalysis");
      
      // Test uploading state
      useAnalyzePageState.mockReturnValue({
        state: {
          uploadState: "uploading",
          selectedFile: new File(["test"], "test.pdf", { type: "application/pdf" }),
          analysisResults: null,
          metadata: null,
          error: null,
          progress: 50,
        },
        handleFileSelect: vi.fn(),
        handleAnalyze: vi.fn(),
        handleReset: vi.fn(),
      });

      const { rerender } = renderWithRouter(<TemplateAnalyzePage />);

      expect(screen.getByText("Uploading PDF...")).toBeInTheDocument();
      expect(screen.getByText("50%")).toBeInTheDocument();

      // Test processing state
      useAnalyzePageState.mockReturnValue({
        state: {
          uploadState: "processing",
          selectedFile: new File(["test"], "test.pdf", { type: "application/pdf" }),
          analysisResults: null,
          metadata: null,
          error: null,
          progress: 100,
        },
        handleFileSelect: vi.fn(),
        handleAnalyze: vi.fn(),
        handleReset: vi.fn(),
      });

      rerender(<BrowserRouter><TemplateAnalyzePage /></BrowserRouter>);

      expect(screen.getByText("Analyzing PDF structure...")).toBeInTheDocument();
    });

    it("should display empty results state", () => {
      const { useAnalyzePageState } = require("../../hooks/usePDFAnalysis");
      
      useAnalyzePageState.mockReturnValue({
        state: {
          uploadState: "success",
          selectedFile: new File(["test"], "test.pdf", { type: "application/pdf" }),
          analysisResults: [],
          metadata: { ...mockMetadata, total_fields: 0 },
          error: null,
          progress: 100,
        },
        handleFileSelect: vi.fn(),
        handleAnalyze: vi.fn(),
        handleReset: vi.fn(),
      });

      renderWithRouter(<TemplateAnalyzePage />);

      // Verify empty state
      expect(screen.getByText("No Form Fields Found")).toBeInTheDocument();
      expect(screen.getByText("The uploaded PDF doesn't contain any analyzable form fields")).toBeInTheDocument();
      expect(screen.getByText("Try Another File")).toBeInTheDocument();
    });
  });

  describe("Accessibility Integration", () => {
    it("should maintain proper accessibility structure", () => {
      const { useAnalyzePageState } = require("../../hooks/usePDFAnalysis");
      
      useAnalyzePageState.mockReturnValue({
        state: {
          uploadState: "success",
          selectedFile: new File(["test"], "test.pdf", { type: "application/pdf" }),
          analysisResults: mockTemplateFields,
          metadata: mockMetadata,
          error: null,
          progress: 100,
        },
        handleFileSelect: vi.fn(),
        handleAnalyze: vi.fn(),
        handleReset: vi.fn(),
      });

      renderWithRouter(<TemplateAnalyzePage />);

      // Verify main landmarks
      expect(screen.getByRole("main")).toBeInTheDocument();
      expect(screen.getByRole("main")).toHaveAttribute("aria-label", "PDF Template Analysis");

      // Verify proper heading hierarchy
      expect(screen.getByRole("heading", { level: 1 })).toHaveTextContent("PDF Template Analyzer");
      expect(screen.getByRole("heading", { level: 2 })).toHaveTextContent("Analysis Results");

      // Verify buttons are properly labeled
      const exportButton = screen.getByRole("button", { name: /export results/i });
      expect(exportButton).toBeInTheDocument();

      const analyzeAnotherButton = screen.getByRole("button", { name: /analyze another file/i });
      expect(analyzeAnotherButton).toBeInTheDocument();
    });
  });

  describe("Responsive Behavior", () => {
    it("should adapt to different screen sizes", () => {
      const { useAnalyzePageState, useResponsiveBreakpoints } = require("../../hooks/usePDFAnalysis");
      
      useAnalyzePageState.mockReturnValue({
        state: {
          uploadState: "idle",
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

      // Test mobile layout
      useResponsiveBreakpoints.mockReturnValue({
        isXs: true,
        isSm: false,
        isMd: false,
        isLg: false,
        isXl: false,
      });

      const { rerender } = renderWithRouter(<TemplateAnalyzePage />);

      // Verify mobile-specific classes are applied
      const pageContainer = screen.getByTestId("template-analyze-page");
      expect(pageContainer).toHaveClass("px-4"); // Mobile padding

      // Test desktop layout
      useResponsiveBreakpoints.mockReturnValue({
        isXs: false,
        isSm: false,
        isMd: false,
        isLg: true,
        isXl: true,
      });

      rerender(<BrowserRouter><TemplateAnalyzePage /></BrowserRouter>);

      expect(pageContainer).toHaveClass("px-8"); // Desktop padding
    });
  });

  describe("Error Handling Integration", () => {
    it("should handle various error scenarios", () => {
      const { useAnalyzePageState } = require("../../hooks/usePDFAnalysis");
      
      const errorScenarios = [
        {
          error: "File size exceeds 10MB limit",
          description: "file size error",
        },
        {
          error: "Invalid file format. Please upload a PDF file.",
          description: "invalid format error",
        },
        {
          error: "Network connection failed. Please try again.",
          description: "network error",
        },
      ];

      errorScenarios.forEach(({ error, description }) => {
        useAnalyzePageState.mockReturnValue({
          state: {
            uploadState: "error",
            selectedFile: null,
            analysisResults: null,
            metadata: null,
            error,
            progress: 0,
          },
          handleFileSelect: vi.fn(),
          handleAnalyze: vi.fn(),
          handleReset: vi.fn(),
        });

        const { unmount } = renderWithRouter(<TemplateAnalyzePage />);

        // Verify error is displayed
        expect(screen.getByText("Analysis Failed")).toBeInTheDocument();
        expect(screen.getByText(error)).toBeInTheDocument();

        // Verify recovery options are available
        expect(screen.getByText("Try Again")).toBeInTheDocument();
        expect(screen.getByText("Choose Different File")).toBeInTheDocument();

        unmount();
      });
    });
  });
});
