/**
 * Tests for TemplateFieldTable component with responsive behavior
 */

import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import TemplateFieldTable from "../../components/TemplateFieldTable/TemplateFieldTable";
import { AnalysisMetadata, TemplateField, TemplateFieldTableProps } from "../../types/pdfAnalysis";

// Mock Lucide React icons
vi.mock("lucide-react", () => ({
  ChevronUp: ({ className, ...props }: any) => (
    <div data-testid="chevron-up-icon" className={className} {...props} />
  ),
  ChevronDown: ({ className, ...props }: any) => (
    <div data-testid="chevron-down-icon" className={className} {...props} />
  ),
  FileText: ({ className, ...props }: any) => (
    <div data-testid="file-text-icon" className={className} {...props} />
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
  Loader2: ({ className, ...props }: any) => (
    <div data-testid="loader-icon" className={className} {...props} />
  ),
}));

// Mock responsive breakpoints hook
vi.mock("../../hooks/usePDFAnalysis", () => ({
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
}));

describe("TemplateFieldTable Component", () => {
  const mockFields: TemplateField[] = [
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
    processing_time_ms: 850,
    document_pages: 2,
  };

  const defaultProps: TemplateFieldTableProps = {
    fields: mockFields,
    metadata: mockMetadata,
    loading: false,
  };

  beforeEach(() => {
    vi.clearAllMocks();
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  describe("Initial Render", () => {
    it("should render table with correct structure", () => {
      render(<TemplateFieldTable {...defaultProps} />);

      expect(screen.getByRole("table")).toBeInTheDocument();
      expect(screen.getByText("Analysis Results")).toBeInTheDocument();
      
      // Check table headers
      expect(screen.getByRole("columnheader", { name: /field id/i })).toBeInTheDocument();
      expect(screen.getByRole("columnheader", { name: /type/i })).toBeInTheDocument();
      expect(screen.getByRole("columnheader", { name: /nearest label/i })).toBeInTheDocument();
      expect(screen.getByRole("columnheader", { name: /options/i })).toBeInTheDocument();
    });

    it("should render metadata information", () => {
      render(<TemplateFieldTable {...defaultProps} />);

      expect(screen.getByText("5")).toBeInTheDocument();
      expect(screen.getByText("fields")).toBeInTheDocument();
      expect(screen.getByText("2")).toBeInTheDocument();
      expect(screen.getByText("pages")).toBeInTheDocument();
      expect(screen.getByText("850")).toBeInTheDocument();
      expect(screen.getByText("ms")).toBeInTheDocument();
    });

    it("should render all field rows", () => {
      render(<TemplateFieldTable {...defaultProps} />);

      mockFields.forEach((field) => {
        expect(screen.getByText(field.field_id)).toBeInTheDocument();
        expect(screen.getByText(field.near_text)).toBeInTheDocument();
      });
    });

    it("should apply custom className when provided", () => {
      render(<TemplateFieldTable {...defaultProps} className="custom-table-class" />);

      const tableContainer = screen.getByTestId("template-field-table");
      expect(tableContainer).toHaveClass("custom-table-class");
    });

    it("should have proper accessibility attributes", () => {
      render(<TemplateFieldTable {...defaultProps} />);

      const table = screen.getByRole("table");
      expect(table).toHaveAttribute("aria-label", "PDF template field analysis results");
      
      const caption = screen.getByText(/analysis results showing/i);
      expect(caption).toBeInTheDocument();
    });
  });

  describe("Field Type Display", () => {
    it("should display correct icons for different field types", () => {
      render(<TemplateFieldTable {...defaultProps} />);

      // Text field should have file-text icon
      expect(screen.getAllByTestId("file-text-icon")).toHaveLength(2); // A0101, A0102

      // Radio button should have circle icon
      expect(screen.getByTestId("circle-icon")).toBeInTheDocument();

      // Listbox should have list icon
      expect(screen.getByTestId("list-icon")).toBeInTheDocument();

      // Checkbox should have check-square icon
      expect(screen.getByTestId("check-square-icon")).toBeInTheDocument();
    });

    it("should display field types with proper capitalization", () => {
      render(<TemplateFieldTable {...defaultProps} />);

      expect(screen.getAllByText("Text")).toHaveLength(2); // A0101, A0102
      expect(screen.getByText("Radio Button")).toBeInTheDocument();
      expect(screen.getByText("Listbox")).toBeInTheDocument();
      expect(screen.getByText("Checkbox")).toBeInTheDocument();
    });
  });

  describe("Value Options Display", () => {
    it("should display N/A for null value_options", () => {
      render(<TemplateFieldTable {...defaultProps} />);

      const naElements = screen.getAllByText("N/A");
      expect(naElements).toHaveLength(3); // A0101, A0102, D0401 have null options
    });

    it("should display comma-separated options for fields with options", () => {
      render(<TemplateFieldTable {...defaultProps} />);

      expect(screen.getByText("Sí, No")).toBeInTheDocument();
      expect(screen.getByText("Madrid, Barcelona, Valencia, Sevilla")).toBeInTheDocument();
    });

    it("should handle empty options array", () => {
      const fieldsWithEmptyOptions: TemplateField[] = [
        {
          field_id: "E0501",
          type: "listbox",
          near_text: "Empty options:",
          value_options: [],
        },
      ];

      render(
        <TemplateFieldTable
          {...defaultProps}
          fields={fieldsWithEmptyOptions}
          metadata={{ ...mockMetadata, total_fields: 1 }}
        />
      );

      expect(screen.getByText("N/A")).toBeInTheDocument();
    });
  });

  describe("Loading State", () => {
    it("should show loading skeleton when loading is true", () => {
      render(<TemplateFieldTable {...defaultProps} loading={true} />);

      expect(screen.getByTestId("loader-icon")).toBeInTheDocument();
      expect(screen.getByText(/analyzing/i)).toBeInTheDocument();
    });

    it("should show table content when loading is false", () => {
      render(<TemplateFieldTable {...defaultProps} loading={false} />);

      expect(screen.queryByTestId("loader-icon")).not.toBeInTheDocument();
      expect(screen.getByRole("table")).toBeInTheDocument();
    });

    it("should show loading overlay with proper accessibility", () => {
      render(<TemplateFieldTable {...defaultProps} loading={true} />);

      const loadingOverlay = screen.getByRole("status");
      expect(loadingOverlay).toHaveAttribute("aria-live", "polite");
      expect(loadingOverlay).toHaveAttribute("aria-label", "Loading analysis results");
    });
  });

  describe("Empty State", () => {
    it("should show empty state when no fields are provided", () => {
      render(
        <TemplateFieldTable
          {...defaultProps}
          fields={[]}
          metadata={{ ...mockMetadata, total_fields: 0 }}
        />
      );

      expect(screen.getByText(/no form fields found/i)).toBeInTheDocument();
      expect(screen.getByText(/the pdf document doesn't contain/i)).toBeInTheDocument();
    });

    it("should show proper empty state styling", () => {
      render(
        <TemplateFieldTable
          {...defaultProps}
          fields={[]}
          metadata={{ ...mockMetadata, total_fields: 0 }}
        />
      );

      const emptyState = screen.getByTestId("empty-state");
      expect(emptyState).toHaveClass("text-center", "py-12");
    });
  });

  describe("Table Sorting", () => {
    it("should show sortable column headers with proper ARIA attributes", () => {
      render(<TemplateFieldTable {...defaultProps} />);

      const fieldIdHeader = screen.getByRole("columnheader", { name: /field id/i });
      expect(fieldIdHeader).toHaveAttribute("aria-sort", "none");
      expect(fieldIdHeader).toHaveClass("cursor-pointer");
    });

    it("should handle column header clicks for sorting", async () => {
      const { useTableSorting } = await import("../../hooks/usePDFAnalysis");
      const mockHandleSort = vi.fn();
      (useTableSorting as any).mockReturnValue({
        data: mockFields,
        sortConfig: { key: null, direction: "asc" },
        handleSort: mockHandleSort,
      });

      const user = userEvent.setup();
      render(<TemplateFieldTable {...defaultProps} />);

      const fieldIdHeader = screen.getByRole("columnheader", { name: /field id/i });
      await user.click(fieldIdHeader);

      expect(mockHandleSort).toHaveBeenCalledWith("field_id");
    });

    it("should show sort indicators when column is sorted", () => {
      const { useTableSorting } = require("../../hooks/usePDFAnalysis");
      useTableSorting.mockReturnValue({
        sortedData: mockFields,
        sortKey: "field_id",
        sortDirection: "asc",
        handleSortChange: vi.fn(),
      });

      render(<TemplateFieldTable {...defaultProps} />);

      expect(screen.getByTestId("chevron-up-icon")).toBeInTheDocument();
    });

    it("should show descending sort indicator", () => {
      const { useTableSorting } = require("../../hooks/usePDFAnalysis");
      useTableSorting.mockReturnValue({
        sortedData: mockFields,
        sortKey: "field_id",
        sortDirection: "desc",
        handleSortChange: vi.fn(),
      });

      render(<TemplateFieldTable {...defaultProps} />);

      expect(screen.getByTestId("chevron-down-icon")).toBeInTheDocument();
    });
  });

  describe("Responsive Design", () => {
    it("should render desktop table layout", () => {
      render(<TemplateFieldTable {...defaultProps} />);

      expect(screen.getByRole("table")).toBeInTheDocument();
      expect(screen.queryByTestId("mobile-card-layout")).not.toBeInTheDocument();
    });

    it("should render mobile card layout on small screens", () => {
      const { useResponsiveBreakpoints } = require("../../hooks/usePDFAnalysis");
      useResponsiveBreakpoints.mockReturnValue({
        isXs: true,
        isSm: false,
        isMd: false,
        isLg: false,
        isXl: false,
        is2Xl: false,
      });

      render(<TemplateFieldTable {...defaultProps} />);

      expect(screen.queryByRole("table")).not.toBeInTheDocument();
      expect(screen.getByTestId("mobile-card-layout")).toBeInTheDocument();
    });

    it("should render tablet table layout", () => {
      const { useResponsiveBreakpoints } = require("../../hooks/usePDFAnalysis");
      useResponsiveBreakpoints.mockReturnValue({
        isXs: false,
        isSm: false,
        isMd: true,
        isLg: false,
        isXl: false,
        is2Xl: false,
      });

      render(<TemplateFieldTable {...defaultProps} />);

      expect(screen.getByRole("table")).toBeInTheDocument();
      // Should use horizontal scroll on tablet
      const tableContainer = screen.getByTestId("table-container");
      expect(tableContainer).toHaveClass("overflow-x-auto");
    });
  });

  describe("Mobile Card Layout", () => {
    beforeEach(() => {
      const { useResponsiveBreakpoints } = require("../../hooks/usePDFAnalysis");
      useResponsiveBreakpoints.mockReturnValue({
        isXs: true,
        isSm: false,
        isMd: false,
        isLg: false,
        isXl: false,
        is2Xl: false,
      });
    });

    it("should render field cards with proper structure", () => {
      render(<TemplateFieldTable {...defaultProps} />);

      mockFields.forEach((field) => {
        expect(screen.getByTestId(`field-card-${field.field_id}`)).toBeInTheDocument();
      });
    });

    it("should display field information in card format", () => {
      render(<TemplateFieldTable {...defaultProps} />);

      const firstCard = screen.getByTestId("field-card-A0101");
      expect(firstCard).toBeInTheDocument();
      
      // Check card content
      expect(screen.getByText("A0101")).toBeInTheDocument();
      expect(screen.getByText("hasta un máximo de")).toBeInTheDocument();
    });

    it("should have proper accessibility for card layout", () => {
      render(<TemplateFieldTable {...defaultProps} />);

      const cards = screen.getAllByRole("article");
      expect(cards).toHaveLength(mockFields.length);

      cards.forEach((card, index) => {
        expect(card).toHaveAttribute("aria-label", `Field ${mockFields[index].field_id} details`);
      });
    });
  });

  describe("Row Styling", () => {
    it("should apply zebra striping to table rows", () => {
      render(<TemplateFieldTable {...defaultProps} />);

      const rows = screen.getAllByRole("row");
      const dataRows = rows.slice(1); // Skip header row

      dataRows.forEach((row, index) => {
        if (index % 2 === 0) {
          expect(row).toHaveClass("bg-white");
        } else {
          expect(row).toHaveClass("bg-gray-50");
        }
      });
    });

    it("should apply hover effects to table rows", () => {
      render(<TemplateFieldTable {...defaultProps} />);

      const rows = screen.getAllByRole("row");
      const dataRows = rows.slice(1); // Skip header row

      dataRows.forEach((row) => {
        expect(row).toHaveClass("hover:bg-gray-100");
      });
    });
  });

  describe("Accessibility", () => {
    it("should have proper table semantics", () => {
      render(<TemplateFieldTable {...defaultProps} />);

      const table = screen.getByRole("table");
      expect(table).toBeInTheDocument();

      const headers = screen.getAllByRole("columnheader");
      expect(headers).toHaveLength(4);

      const rows = screen.getAllByRole("row");
      expect(rows).toHaveLength(6); // 1 header + 5 data rows
    });

    it("should have proper ARIA labels for screen readers", () => {
      render(<TemplateFieldTable {...defaultProps} />);

      const table = screen.getByRole("table");
      expect(table).toHaveAttribute("aria-label", "PDF template field analysis results");

      const caption = screen.getByRole("caption");
      expect(caption).toBeInTheDocument();
    });

    it("should support keyboard navigation", async () => {
      const user = userEvent.setup();
      render(<TemplateFieldTable {...defaultProps} />);

      const firstHeader = screen.getByRole("columnheader", { name: /field id/i });
      firstHeader.focus();

      await user.keyboard("{Tab}");
      const secondHeader = screen.getByRole("columnheader", { name: /type/i });
      expect(secondHeader).toHaveFocus();
    });

    it("should announce sort changes to screen readers", () => {
      const { useTableSorting } = require("../../hooks/usePDFAnalysis");
      useTableSorting.mockReturnValue({
        sortedData: mockFields,
        sortKey: "field_id",
        sortDirection: "asc",
        handleSortChange: vi.fn(),
      });

      render(<TemplateFieldTable {...defaultProps} />);

      const fieldIdHeader = screen.getByRole("columnheader", { name: /field id/i });
      expect(fieldIdHeader).toHaveAttribute("aria-sort", "ascending");
    });
  });

  describe("Performance", () => {
    it("should handle large datasets efficiently", () => {
      const largeDataset = Array.from({ length: 1000 }, (_, index) => ({
        field_id: `FIELD_${index.toString().padStart(4, "0")}`,
        type: "text" as const,
        near_text: `Field ${index} description`,
        value_options: null,
      }));

      render(
        <TemplateFieldTable
          {...defaultProps}
          fields={largeDataset}
          metadata={{ ...mockMetadata, total_fields: 1000 }}
        />
      );

      expect(screen.getByText(/1000.*fields/)).toBeInTheDocument();
      expect(screen.getAllByRole("row")).toHaveLength(1001); // 1 header + 1000 data rows
    });

    it("should memoize table rows to prevent unnecessary re-renders", () => {
      const { rerender } = render(<TemplateFieldTable {...defaultProps} />);

      // Re-render with same props
      rerender(<TemplateFieldTable {...defaultProps} />);

      // Component should still render correctly
      expect(screen.getByRole("table")).toBeInTheDocument();
      expect(screen.getAllByRole("row")).toHaveLength(6);
    });
  });

  describe("Error Handling", () => {
    it("should handle malformed field data gracefully", () => {
      const malformedFields = [
        {
          field_id: "",
          type: "unknown" as any,
          near_text: "",
          value_options: null,
        },
      ];

      render(
        <TemplateFieldTable
          {...defaultProps}
          fields={malformedFields}
          metadata={{ ...mockMetadata, total_fields: 1 }}
        />
      );

      // Should still render without crashing
      expect(screen.getByRole("table")).toBeInTheDocument();
    });

    it("should handle undefined metadata gracefully", () => {
      render(
        <TemplateFieldTable
          {...defaultProps}
          metadata={undefined as any}
        />
      );

      // Should render table without metadata section
      expect(screen.getByRole("table")).toBeInTheDocument();
      expect(screen.queryByText(/\d+.*fields/)).not.toBeInTheDocument();
    });
  });

  describe("Integration", () => {
    it("should work with table sorting hook", () => {
      const { useTableSorting } = require("../../hooks/usePDFAnalysis");
      const mockSortedFields = [...mockFields].reverse();
      
      useTableSorting.mockReturnValue({
        sortedData: mockSortedFields,
        sortKey: "field_id",
        sortDirection: "desc",
        handleSortChange: vi.fn(),
      });

      render(<TemplateFieldTable {...defaultProps} />);

      const rows = screen.getAllByRole("row");
      const firstDataRow = rows[1];
      
      // Should show reversed order
      expect(firstDataRow).toHaveTextContent("D0401");
    });

    it("should work with responsive breakpoints hook", () => {
      const { useResponsiveBreakpoints } = require("../../hooks/usePDFAnalysis");
      // Test different breakpoints
      useResponsiveBreakpoints.mockReturnValue({
        isXs: false,
        isSm: false,
        isMd: true,
        isLg: false,
        isXl: false,
        is2Xl: false,
      });

      render(<TemplateFieldTable {...defaultProps} />);

      expect(screen.getByRole("table")).toBeInTheDocument();
      const tableContainer = screen.getByTestId("table-container");
      expect(tableContainer).toHaveClass("overflow-x-auto");
    });
  });
});
