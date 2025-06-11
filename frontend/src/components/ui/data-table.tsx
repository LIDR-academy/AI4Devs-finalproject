import { Edit, MoreHorizontal, Trash2 } from "lucide-react";
import { ReactNode } from "react";
import { LoadingCard } from "./loading-spinner";

export interface TableColumn<T> {
  key: keyof T | string;
  label: string;
  render?: (item: T) => ReactNode;
  sortable?: boolean;
  className?: string;
}

export interface TableAction<T> {
  label: string;
  icon?: React.ComponentType<{ className?: string }>;
  onClick: (item: T) => void;
  variant?: "default" | "danger";
}

interface DataTableProps<T> {
  data: T[];
  columns: TableColumn<T>[];
  loading?: boolean;
  error?: string | null;
  emptyMessage?: string;
  actions?: TableAction<T>[];
  onEdit?: (item: T) => void;
  onDelete?: (item: T) => void;
  className?: string;
}

export function DataTable<T extends { id: string }>({
  data,
  columns,
  loading = false,
  error = null,
  emptyMessage = "No data available",
  actions = [],
  onEdit,
  onDelete,
  className = ""
}: DataTableProps<T>) {
  // Add default edit/delete actions if handlers provided
  const allActions: TableAction<T>[] = [
    ...actions,
    ...(onEdit ? [{
      label: "Edit",
      icon: Edit,
      onClick: onEdit,
      variant: "default" as const
    }] : []),
    ...(onDelete ? [{
      label: "Delete", 
      icon: Trash2,
      onClick: onDelete,
      variant: "danger" as const
    }] : [])
  ];

  if (loading) {
    return <LoadingCard text="Loading data..." />;
  }

  if (error) {
    return (
      <div className="bg-red-50 border border-red-200 rounded-lg p-8 text-center">
        <p className="text-red-700 font-medium">{error}</p>
      </div>
    );
  }

  if (data.length === 0) {
    return (
      <div className="bg-gray-50 border border-gray-200 rounded-lg p-8 text-center">
        <p className="text-gray-600">{emptyMessage}</p>
      </div>
    );
  }

  return (
    <div className={`bg-white rounded-lg shadow-md overflow-hidden ${className}`}>
      <div className="overflow-x-auto">
        <table className="w-full">
          <thead className="bg-gray-50 border-b border-gray-200">
            <tr>
              {columns.map((column, index) => (
                <th
                  key={index}
                  className={`px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider ${column.className || ""}`}
                >
                  {column.label}
                </th>
              ))}
              {allActions.length > 0 && (
                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Actions
                </th>
              )}
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {data.map((item, rowIndex) => (
              <tr key={item.id} className="hover:bg-gray-50 transition-colors">
                {columns.map((column, colIndex) => (
                  <td
                    key={colIndex}
                    className={`px-6 py-4 whitespace-nowrap text-sm text-gray-900 ${column.className || ""}`}
                  >
                    {column.render 
                      ? column.render(item)
                      : String(item[column.key as keyof T] || "")
                    }
                  </td>
                ))}
                {allActions.length > 0 && (
                  <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                    <div className="flex items-center justify-end gap-2">
                      {allActions.map((action, actionIndex) => {
                        const Icon = action.icon || MoreHorizontal;
                        return (
                          <button
                            key={actionIndex}
                            onClick={() => action.onClick(item)}
                            className={`p-2 rounded-lg transition-colors ${
                              action.variant === "danger"
                                ? "text-red-600 hover:bg-red-50"
                                : "text-gray-600 hover:bg-gray-100"
                            }`}
                            title={action.label}
                          >
                            <Icon className="w-4 h-4" />
                          </button>
                        );
                      })}
                    </div>
                  </td>
                )}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
} 