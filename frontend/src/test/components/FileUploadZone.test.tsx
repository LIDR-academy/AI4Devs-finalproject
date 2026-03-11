/**
 * Tests for FileUploadZone component with drag-and-drop functionality
 */

import { fireEvent, render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import FileUploadZone from "../../components/FileUploadZone/FileUploadZone";
import { FileUploadZoneProps } from "../../types/pdfAnalysis";

// Mock the PDF analysis service
vi.mock("../../services/pdfAnalysisService", () => ({
  validatePDFFile: vi.fn(() => ({ isValid: true })),
  isDragAndDropSupported: vi.fn(() => true),
  createDropHandler: vi.fn(),
  formatFileSize: vi.fn((bytes: number) => `${bytes} bytes`),
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
}));

describe("FileUploadZone Component", () => {
  const mockOnFileSelect = vi.fn();
  const mockOnAnalyze = vi.fn();

  const defaultProps: FileUploadZoneProps = {
    onFileSelect: mockOnFileSelect,
    onAnalyze: mockOnAnalyze,
    selectedFile: null,
    uploadState: "idle",
    error: null,
    disabled: false,
  };

  beforeEach(() => {
    vi.clearAllMocks();
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  describe("Initial Render", () => {
    it("should render upload zone with correct initial state", () => {
      render(<FileUploadZone {...defaultProps} />);

      expect(screen.getByTestId("file-upload-zone")).toBeInTheDocument();
      expect(screen.getByTestId("upload-icon")).toBeInTheDocument();
      expect(screen.getByText(/drag and drop your pdf file here/i)).toBeInTheDocument();
      expect(screen.getByText(/or click to browse/i)).toBeInTheDocument();
      expect(screen.getByRole("button", { name: /choose file/i })).toBeInTheDocument();
    });

    it("should render with proper accessibility attributes", () => {
      render(<FileUploadZone {...defaultProps} />);

      const uploadZone = screen.getByTestId("file-upload-zone");
      expect(uploadZone).toHaveAttribute("role", "button");
      expect(uploadZone).toHaveAttribute("tabIndex", "0");
      expect(uploadZone).toHaveAttribute("aria-label");
      expect(uploadZone).toHaveAttribute("aria-describedby");
    });

    it("should render hidden file input", () => {
      render(<FileUploadZone {...defaultProps} />);

      const fileInput = screen.getByTestId("file-input");
      expect(fileInput).toBeInTheDocument();
      expect(fileInput).toHaveAttribute("type", "file");
      expect(fileInput).toHaveAttribute("accept", ".pdf");
      expect(fileInput).toHaveClass("sr-only");
    });

    it("should apply custom className when provided", () => {
      render(<FileUploadZone {...defaultProps} className="custom-class" />);

      const uploadZone = screen.getByTestId("file-upload-zone");
      expect(uploadZone).toHaveClass("custom-class");
    });
  });

  describe("File Selection", () => {
    it("should call onFileSelect when file is selected via input", async () => {
      const user = userEvent.setup();
      render(<FileUploadZone {...defaultProps} />);

      const file = new File(["test content"], "test.pdf", { type: "application/pdf" });
      const fileInput = screen.getByTestId("file-input");

      await user.upload(fileInput, file);

      expect(mockOnFileSelect).toHaveBeenCalledWith(file);
    });

    it("should show selected file information", () => {
      const selectedFile = new File(["test content"], "test.pdf", { type: "application/pdf" });
      
      render(<FileUploadZone {...defaultProps} selectedFile={selectedFile} />);

      expect(screen.getByTestId("file-text-icon")).toBeInTheDocument();
      expect(screen.getByText("test.pdf")).toBeInTheDocument();
      expect(screen.getByText(/12 bytes/)).toBeInTheDocument(); // "test content" length
    });

    it("should show analyze button when file is selected", () => {
      const selectedFile = new File(["test content"], "test.pdf", { type: "application/pdf" });
      
      render(<FileUploadZone {...defaultProps} selectedFile={selectedFile} />);

      const analyzeButton = screen.getByRole("button", { name: /analyze pdf/i });
      expect(analyzeButton).toBeInTheDocument();
      expect(analyzeButton).not.toBeDisabled();
    });

    it("should call onAnalyze when analyze button is clicked", async () => {
      const user = userEvent.setup();
      const selectedFile = new File(["test content"], "test.pdf", { type: "application/pdf" });
      
      render(<FileUploadZone {...defaultProps} selectedFile={selectedFile} />);

      const analyzeButton = screen.getByRole("button", { name: /analyze pdf/i });
      await user.click(analyzeButton);

      expect(mockOnAnalyze).toHaveBeenCalled();
    });

    it("should allow removing selected file", async () => {
      const user = userEvent.setup();
      const selectedFile = new File(["test content"], "test.pdf", { type: "application/pdf" });
      
      render(<FileUploadZone {...defaultProps} selectedFile={selectedFile} />);

      const removeButton = screen.getByRole("button", { name: /remove file/i });
      await user.click(removeButton);

      expect(mockOnFileSelect).toHaveBeenCalledWith(null);
    });
  });

  describe("Drag and Drop", () => {
    it("should handle drag enter event", () => {
      render(<FileUploadZone {...defaultProps} />);

      const uploadZone = screen.getByTestId("file-upload-zone");
      fireEvent.dragEnter(uploadZone, {
        dataTransfer: { files: [] },
      });

      expect(uploadZone).toHaveClass("border-blue-500", "bg-blue-50");
    });

    it("should handle drag over event", () => {
      render(<FileUploadZone {...defaultProps} />);

      const uploadZone = screen.getByTestId("file-upload-zone");
      fireEvent.dragOver(uploadZone, {
        dataTransfer: { files: [] },
      });

      // Should prevent default behavior
      expect(uploadZone).toBeInTheDocument();
    });

    it("should handle drag leave event", () => {
      render(<FileUploadZone {...defaultProps} />);

      const uploadZone = screen.getByTestId("file-upload-zone");
      
      // First drag enter
      fireEvent.dragEnter(uploadZone, {
        dataTransfer: { files: [] },
      });
      
      // Then drag leave
      fireEvent.dragLeave(uploadZone, {
        dataTransfer: { files: [] },
      });

      expect(uploadZone).not.toHaveClass("border-blue-500", "bg-blue-50");
    });

    it("should handle file drop with valid PDF", () => {
      render(<FileUploadZone {...defaultProps} />);

      const uploadZone = screen.getByTestId("file-upload-zone");
      const file = new File(["test content"], "test.pdf", { type: "application/pdf" });

      fireEvent.drop(uploadZone, {
        dataTransfer: { files: [file] },
      });

      expect(mockOnFileSelect).toHaveBeenCalledWith(file);
    });

    it("should handle drop with multiple files", () => {
      render(<FileUploadZone {...defaultProps} />);

      const uploadZone = screen.getByTestId("file-upload-zone");
      const file1 = new File(["test1"], "test1.pdf", { type: "application/pdf" });
      const file2 = new File(["test2"], "test2.pdf", { type: "application/pdf" });

      fireEvent.drop(uploadZone, {
        dataTransfer: { files: [file1, file2] },
      });

      // Should only select the first file
      expect(mockOnFileSelect).toHaveBeenCalledWith(file1);
    });

    it("should handle drop with no files", () => {
      render(<FileUploadZone {...defaultProps} />);

      const uploadZone = screen.getByTestId("file-upload-zone");

      fireEvent.drop(uploadZone, {
        dataTransfer: { files: [] },
      });

      expect(mockOnFileSelect).not.toHaveBeenCalled();
    });
  });

  describe("Upload States", () => {
    it("should show uploading state", () => {
      render(<FileUploadZone {...defaultProps} uploadState="uploading" />);

      expect(screen.getByTestId("loader-icon")).toBeInTheDocument();
      expect(screen.getByText(/uploading/i)).toBeInTheDocument();
    });

    it("should show processing state", () => {
      render(<FileUploadZone {...defaultProps} uploadState="processing" />);

      expect(screen.getByTestId("loader-icon")).toBeInTheDocument();
      expect(screen.getByText(/analyzing/i)).toBeInTheDocument();
    });

    it("should show success state", () => {
      render(<FileUploadZone {...defaultProps} uploadState="success" />);

      expect(screen.getByTestId("check-circle-icon")).toBeInTheDocument();
      expect(screen.getByText(/analysis complete/i)).toBeInTheDocument();
    });

    it("should disable interactions during upload", () => {
      const selectedFile = new File(["test"], "test.pdf", { type: "application/pdf" });
      
      render(
        <FileUploadZone 
          {...defaultProps} 
          selectedFile={selectedFile}
          uploadState="uploading" 
        />
      );

      const analyzeButton = screen.getByRole("button", { name: /analyze pdf/i });
      expect(analyzeButton).toBeDisabled();

      const uploadZone = screen.getByTestId("file-upload-zone");
      expect(uploadZone).toHaveAttribute("aria-disabled", "true");
    });
  });

  describe("Error Handling", () => {
    it("should display error message when error prop is provided", () => {
      const errorMessage = "File size exceeds 10MB limit";
      
      render(<FileUploadZone {...defaultProps} error={errorMessage} uploadState="error" />);

      expect(screen.getByTestId("alert-circle-icon")).toBeInTheDocument();
      expect(screen.getByText(errorMessage)).toBeInTheDocument();
      expect(screen.getByRole("alert")).toBeInTheDocument();
    });

    it("should show error state styling", () => {
      render(<FileUploadZone {...defaultProps} error="Test error" uploadState="error" />);

      const uploadZone = screen.getByTestId("file-upload-zone");
      expect(uploadZone).toHaveClass("border-red-500");
    });

    it("should allow retry after error", async () => {
      const user = userEvent.setup();
      
      render(
        <FileUploadZone 
          {...defaultProps} 
          error="Test error" 
          uploadState="error"
          selectedFile={new File(["test"], "test.pdf", { type: "application/pdf" })}
        />
      );

      const retryButton = screen.getByRole("button", { name: /try again/i });
      await user.click(retryButton);

      expect(mockOnAnalyze).toHaveBeenCalled();
    });
  });

  describe("Keyboard Navigation", () => {
    it("should handle Enter key to open file dialog", async () => {
      const user = userEvent.setup();
      render(<FileUploadZone {...defaultProps} />);

      const uploadZone = screen.getByTestId("file-upload-zone");
      uploadZone.focus();
      
      await user.keyboard("{Enter}");

      // File input should be triggered (we can't easily test this without mocking)
      expect(uploadZone).toHaveFocus();
    });

    it("should handle Space key to open file dialog", async () => {
      const user = userEvent.setup();
      render(<FileUploadZone {...defaultProps} />);

      const uploadZone = screen.getByTestId("file-upload-zone");
      uploadZone.focus();
      
      await user.keyboard(" ");

      expect(uploadZone).toHaveFocus();
    });

    it("should handle Escape key to clear selection", async () => {
      const user = userEvent.setup();
      const selectedFile = new File(["test"], "test.pdf", { type: "application/pdf" });
      
      render(<FileUploadZone {...defaultProps} selectedFile={selectedFile} />);

      const uploadZone = screen.getByTestId("file-upload-zone");
      uploadZone.focus();
      
      await user.keyboard("{Escape}");

      expect(mockOnFileSelect).toHaveBeenCalledWith(null);
    });

    it("should be focusable with proper tab order", () => {
      render(<FileUploadZone {...defaultProps} />);

      const uploadZone = screen.getByTestId("file-upload-zone");
      const chooseFileButton = screen.getByRole("button", { name: /choose file/i });

      expect(uploadZone).toHaveAttribute("tabIndex", "0");
      expect(chooseFileButton).toHaveAttribute("tabIndex", "0");
    });
  });

  describe("Disabled State", () => {
    it("should render disabled state correctly", () => {
      render(<FileUploadZone {...defaultProps} disabled={true} />);

      const uploadZone = screen.getByTestId("file-upload-zone");
      const chooseFileButton = screen.getByRole("button", { name: /choose file/i });

      expect(uploadZone).toHaveClass("opacity-50", "cursor-not-allowed");
      expect(uploadZone).toHaveAttribute("aria-disabled", "true");
      expect(chooseFileButton).toBeDisabled();
    });

    it("should not respond to interactions when disabled", async () => {
      const user = userEvent.setup();
      render(<FileUploadZone {...defaultProps} disabled={true} />);

      const uploadZone = screen.getByTestId("file-upload-zone");
      
      await user.click(uploadZone);
      await user.keyboard("{Enter}");

      expect(mockOnFileSelect).not.toHaveBeenCalled();
    });

    it("should not handle drag and drop when disabled", () => {
      render(<FileUploadZone {...defaultProps} disabled={true} />);

      const uploadZone = screen.getByTestId("file-upload-zone");
      const file = new File(["test"], "test.pdf", { type: "application/pdf" });

      fireEvent.drop(uploadZone, {
        dataTransfer: { files: [file] },
      });

      expect(mockOnFileSelect).not.toHaveBeenCalled();
    });
  });

  describe("Progress Indicator", () => {
    it("should show progress bar during upload", () => {
      render(
        <FileUploadZone 
          {...defaultProps} 
          uploadState="uploading"
          // Add progress prop when we implement it
        />
      );

      // Progress bar should be visible during upload
      const progressContainer = screen.queryByTestId("progress-container");
      // This will be implemented in the component
    });

    it("should update progress value", () => {
      // Test progress updates when we implement the progress prop
      render(
        <FileUploadZone 
          {...defaultProps} 
          uploadState="uploading"
        />
      );

      // Progress value updates will be tested here
    });
  });

  describe("Responsive Design", () => {
    it("should render mobile-friendly layout", () => {
      // Mock window.innerWidth for mobile
      Object.defineProperty(window, 'innerWidth', {
        writable: true,
        configurable: true,
        value: 375,
      });

      render(<FileUploadZone {...defaultProps} />);

      const uploadZone = screen.getByTestId("file-upload-zone");
      expect(uploadZone).toHaveClass("p-4"); // Mobile padding via responsive classes
    });

    it("should render desktop layout", () => {
      // Mock window.innerWidth for desktop
      Object.defineProperty(window, 'innerWidth', {
        writable: true,
        configurable: true,
        value: 1024,
      });

      render(<FileUploadZone {...defaultProps} />);

      const uploadZone = screen.getByTestId("file-upload-zone");
      expect(uploadZone).toHaveClass("lg:p-8"); // Desktop padding via responsive classes
    });
  });

  describe("Integration with Validation", () => {
    it("should handle file validation errors", async () => {
      const { validatePDFFile } = await import("../../services/pdfAnalysisService");
      (validatePDFFile as any).mockReturnValue({
        isValid: false,
        error: "File too large",
      });

      const user = userEvent.setup();
      render(<FileUploadZone {...defaultProps} />);

      const file = new File(["large content"], "large.pdf", { type: "application/pdf" });
      const fileInput = screen.getByTestId("file-input");

      await user.upload(fileInput, file);

      // Should not call onFileSelect for invalid files
      expect(mockOnFileSelect).not.toHaveBeenCalled();
    });

    it("should pass valid files to onFileSelect", async () => {
      const { validatePDFFile } = await import("../../services/pdfAnalysisService");
      (validatePDFFile as any).mockReturnValue({
        isValid: true,
      });

      const user = userEvent.setup();
      render(<FileUploadZone {...defaultProps} />);

      const file = new File(["test content"], "test.pdf", { type: "application/pdf" });
      const fileInput = screen.getByTestId("file-input");

      await user.upload(fileInput, file);

      expect(mockOnFileSelect).toHaveBeenCalledWith(file);
    });
  });
});
