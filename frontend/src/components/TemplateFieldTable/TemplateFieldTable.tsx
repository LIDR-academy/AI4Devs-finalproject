/**
 * TemplateFieldTable - Responsive table component for displaying PDF analysis results
 */

import {
  CheckSquare,
  ChevronDown,
  ChevronUp,
  Circle,
  FileText,
  List,
  Loader2,
} from "lucide-react";
import React, { useMemo } from "react";
import {
  useResponsiveBreakpoints,
  useTableSorting,
} from "../../hooks/usePDFAnalysis";
import type {
  AnalysisMetadata,
  TemplateField,
  TemplateFieldTableProps,
} from "../../types/pdfAnalysis";

/**
 * Get icon component for field type
 */
const getFieldTypeIcon = (type: TemplateField["type"]) => {
  const iconProps = { className: "h-4 w-4", "aria-hidden": true };
  
  switch (type) {
    case "text":
      return <FileText {...iconProps} data-testid="file-text-icon" />;
    case "radiobutton":
      return <Circle {...iconProps} data-testid="circle-icon" />;
    case "checkbox":
      return <CheckSquare {...iconProps} data-testid="check-square-icon" />;
    case "listbox":
      return <List {...iconProps} data-testid="list-icon" />;
    default:
      return <FileText {...iconProps} data-testid="file-text-icon" />;
  }
};

/**
 * Format field type for display
 */
const formatFieldType = (type: TemplateField["type"]): string => {
  switch (type) {
    case "text":
      return "Text";
    case "radiobutton":
      return "Radio Button";
    case "checkbox":
      return "Checkbox";
    case "listbox":
      return "Listbox";
    default:
      return type.charAt(0).toUpperCase() + type.slice(1);
  }
};

/**
 * Format value options for display
 */
const formatValueOptions = (options: string[] | null): string => {
  if (!options || options.length === 0) {
    return "N/A";
  }
  return options.join(", ");
};

/**
 * Table header component with sorting
 */
interface TableHeaderProps {
  label: string;
  sortKey: keyof TemplateField;
  currentSort: { sortKey: keyof TemplateField | null; sortDirection: "asc" | "desc" };
  onSort: (key: keyof TemplateField) => void;
}

const TableHeader: React.FC<TableHeaderProps> = ({
  label,
  sortKey,
  currentSort,
  onSort,
}) => {
  const isSorted = currentSort.sortKey === sortKey;
  const sortDirection = isSorted ? currentSort.sortDirection : "none";

  const handleClick = () => {
    onSort(sortKey);
  };

  const handleKeyDown = (event: React.KeyboardEvent) => {
    if (event.key === "Enter" || event.key === " ") {
      event.preventDefault();
      onSort(sortKey);
    }
  };

  return (
    <th
      className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer hover:bg-gray-100 dark:text-gray-400 dark:hover:bg-gray-700 transition-colors"
      aria-sort={
        sortDirection === "asc"
          ? "ascending"
          : sortDirection === "desc"
          ? "descending"
          : "none"
      }
      onClick={handleClick}
      onKeyDown={handleKeyDown}
      tabIndex={0}
      role="columnheader"
    >
      <div className="flex items-center space-x-1">
        <span>{label}</span>
        <div className="flex flex-col">
          {isSorted && currentSort.sortDirection === "asc" && (
            <ChevronUp
              className="h-3 w-3 text-gray-400"
              data-testid="chevron-up-icon"
            />
          )}
          {isSorted && currentSort.sortDirection === "desc" && (
            <ChevronDown
              className="h-3 w-3 text-gray-400"
              data-testid="chevron-down-icon"
            />
          )}
        </div>
      </div>
    </th>
  );
};

/**
 * Table row component
 */
interface TableRowProps {
  field: TemplateField;
  index: number;
}

const TableRow: React.FC<TableRowProps> = React.memo(({ field, index }) => {
  const isEven = index % 2 === 0;
  const rowClasses = `
    ${isEven ? "bg-white dark:bg-gray-900" : "bg-gray-50 dark:bg-gray-800"}
    hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors
  `.trim();

  return (
    <tr className={rowClasses}>
      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900 dark:text-gray-100">
        {field.field_id}
      </td>
      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">
        <div className="flex items-center space-x-2">
          {getFieldTypeIcon(field.type)}
          <span>{formatFieldType(field.type)}</span>
        </div>
      </td>
      <td className="px-6 py-4 text-sm text-gray-900 dark:text-gray-100 max-w-xs truncate">
        {field.near_text}
      </td>
      <td className="px-6 py-4 text-sm text-gray-500 dark:text-gray-400 max-w-sm">
        <span className="break-words">
          {formatValueOptions(field.value_options)}
        </span>
      </td>
    </tr>
  );
});

TableRow.displayName = "TableRow";

/**
 * Mobile card component
 */
interface MobileCardProps {
  field: TemplateField;
}

const MobileCard: React.FC<MobileCardProps> = ({ field }) => {
  return (
    <article
      className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-4 space-y-3"
      data-testid={`field-card-${field.field_id}`}
      aria-label={`Field ${field.field_id} details`}
    >
      <div className="flex items-center justify-between">
        <h3 className="text-sm font-medium text-gray-900 dark:text-gray-100">
          {field.field_id}
        </h3>
        <div className="flex items-center space-x-2 text-xs text-gray-500 dark:text-gray-400">
          {getFieldTypeIcon(field.type)}
          <span>{formatFieldType(field.type)}</span>
        </div>
      </div>
      
      <div className="space-y-2">
        <div>
          <dt className="text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wide">
            Nearest Label
          </dt>
          <dd className="text-sm text-gray-900 dark:text-gray-100 mt-1">
            {field.near_text}
          </dd>
        </div>
        
        <div>
          <dt className="text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wide">
            Options
          </dt>
          <dd className="text-sm text-gray-900 dark:text-gray-100 mt-1 break-words">
            {formatValueOptions(field.value_options)}
          </dd>
        </div>
      </div>
    </article>
  );
};

/**
 * Metadata display component
 */
interface MetadataDisplayProps {
  metadata: AnalysisMetadata;
}

const MetadataDisplay: React.FC<MetadataDisplayProps> = ({ metadata }) => {
  return (
    <div className="flex flex-wrap items-center gap-4 text-sm text-gray-600 dark:text-gray-400 mb-4">
      <span className="flex items-center">
        <strong className="mr-1">{metadata.total_fields}</strong>
        fields
      </span>
      <span className="flex items-center">
        <strong className="mr-1">{metadata.document_pages}</strong>
        pages
      </span>
      <span className="flex items-center">
        <strong className="mr-1">{metadata.processing_time_ms}ms</strong>
        processing time
      </span>
    </div>
  );
};

/**
 * Loading skeleton component
 */
const LoadingSkeleton: React.FC = () => {
  return (
    <div
      className="flex flex-col items-center justify-center py-12 space-y-4"
      role="status"
      aria-live="polite"
      aria-label="Loading analysis results"
    >
      <Loader2
        className="h-8 w-8 animate-spin text-blue-500"
        data-testid="loader-icon"
      />
      <p className="text-sm text-gray-600 dark:text-gray-400">
        Analyzing PDF structure...
      </p>
    </div>
  );
};

/**
 * Empty state component
 */
const EmptyState: React.FC = () => {
  return (
    <div
      className="text-center py-12 space-y-4"
      data-testid="empty-state"
    >
      <FileText className="mx-auto h-12 w-12 text-gray-400" />
      <div>
        <h3 className="text-sm font-medium text-gray-900 dark:text-gray-100">
          No Form Fields Found
        </h3>
        <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
          The PDF document doesn't contain any analyzable form fields.
        </p>
      </div>
    </div>
  );
};

/**
 * Main TemplateFieldTable component
 */
const TemplateFieldTable: React.FC<TemplateFieldTableProps> = ({
  fields,
  metadata,
  loading = false,
  className = "",
}) => {
  const breakpoints = useResponsiveBreakpoints();
  const { data: sortedData, sortConfig, handleSort } = useTableSorting(
    fields || []
  );

  // Ensure sortedData is always an array
  const safeData = sortedData || fields || [];

  // Determine layout based on screen size
  const isMobile = breakpoints.mobile;
  const isTablet = breakpoints.tablet;

  // Memoize table content to prevent unnecessary re-renders
  const tableContent = useMemo(() => {
    if (loading) {
      return <LoadingSkeleton />;
    }

    if (!fields || fields.length === 0) {
      return <EmptyState />;
    }

    if (isMobile) {
      return (
        <div
          className="space-y-4"
          data-testid="mobile-card-layout"
        >
          {safeData.map((field) => (
            <MobileCard key={field.field_id} field={field} />
          ))}
        </div>
      );
    }

    return (
      <div
        className={`${isTablet ? "overflow-x-auto" : ""}`}
        data-testid="table-container"
      >
        <table
          className="min-w-full divide-y divide-gray-200 dark:divide-gray-700"
          aria-label="PDF template field analysis results"
        >
          <caption className="sr-only">
            Analysis results showing {fields.length} form fields found in the PDF document
          </caption>
          <thead className="bg-gray-50 dark:bg-gray-700">
            <tr>
              <TableHeader
                label="Field ID"
                sortKey="field_id"
                currentSort={{ sortKey: sortConfig.key, sortDirection: sortConfig.direction }}
                onSort={handleSort}
              />
              <TableHeader
                label="Type"
                sortKey="type"
                currentSort={{ sortKey: sortConfig.key, sortDirection: sortConfig.direction }}
                onSort={handleSort}
              />
              <TableHeader
                label="Nearest Label"
                sortKey="near_text"
                currentSort={{ sortKey: sortConfig.key, sortDirection: sortConfig.direction }}
                onSort={handleSort}
              />
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                Options
              </th>
            </tr>
          </thead>
          <tbody className="bg-white dark:bg-gray-900 divide-y divide-gray-200 dark:divide-gray-700">
            {safeData.map((field, index) => (
              <TableRow
                key={field.field_id}
                field={field}
                index={index}
              />
            ))}
          </tbody>
        </table>
      </div>
    );
  }, [loading, fields, safeData, sortConfig, handleSort, isMobile, isTablet]);

  return (
    <div
      className={`template-field-table ${className}`}
      data-testid="template-field-table"
    >
      {/* Header */}
      <div className="mb-6">
        <h2 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-2">
          Analysis Results
        </h2>
        {metadata && !loading && (
          <MetadataDisplay metadata={metadata} />
        )}
      </div>

      {/* Main content */}
      <div className="bg-white dark:bg-gray-800 shadow-sm rounded-lg border border-gray-200 dark:border-gray-700 overflow-hidden">
        {tableContent}
      </div>
    </div>
  );
};

export default TemplateFieldTable;
