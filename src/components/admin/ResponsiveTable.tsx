/**
 * Responsive Table Component for Admin Dashboard
 *
 * Switches between table layout (desktop) and card layout (mobile)
 * Provides consistent responsive behavior across all admin tables
 */

import { motion } from "framer-motion";
import { ReactNode } from "react";

interface Column<T> {
  key: string;
  label: string;
  render: (item: T) => ReactNode;
  hideOnMobile?: boolean;
  className?: string;
}

interface ResponsiveTableProps<T> {
  data: T[];
  columns: Column<T>[];
  keyExtractor: (item: T) => string;
  emptyState?: {
    icon: ReactNode;
    message: string;
  };
  isDarkMode: boolean;
  onRowClick?: (item: T) => void;
}

export function ResponsiveTable<T>({
  data,
  columns,
  keyExtractor,
  emptyState,
  isDarkMode,
  onRowClick,
}: ResponsiveTableProps<T>) {
  if (data.length === 0 && emptyState) {
    return (
      <div className="px-6 py-12 text-center">
        {emptyState.icon}
        <p
          className={`mt-4 text-sm ${isDarkMode ? "text-gray-400" : "text-gray-600"}`}
        >
          {emptyState.message}
        </p>
      </div>
    );
  }

  return (
    <>
      {/* Desktop Table View */}
      <div className="hidden lg:block overflow-x-auto">
        <table className="w-full">
          <thead
            className={`border-b ${isDarkMode ? "border-gray-800 bg-gray-800/50" : "border-gray-200 bg-gray-50"}`}
          >
            <tr>
              {columns.map((column) => (
                <th
                  key={column.key}
                  className={`px-6 py-3 text-left text-xs font-medium uppercase tracking-wider ${
                    isDarkMode ? "text-gray-400" : "text-gray-600"
                  } ${column.className || ""}`}
                >
                  {column.label}
                </th>
              ))}
            </tr>
          </thead>
          <tbody
            className={`divide-y ${isDarkMode ? "divide-gray-800" : "divide-gray-200"}`}
          >
            {data.map((item, index) => (
              <motion.tr
                key={keyExtractor(item)}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.02 }}
                onClick={() => onRowClick?.(item)}
                className={`transition-colors ${
                  isDarkMode ? "hover:bg-gray-800/50" : "hover:bg-gray-50"
                } ${onRowClick ? "cursor-pointer" : ""}`}
              >
                {columns.map((column) => (
                  <td key={column.key} className="px-6 py-4">
                    {column.render(item)}
                  </td>
                ))}
              </motion.tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Mobile Card View */}
      <div className="lg:hidden space-y-4 p-4">
        {data.map((item, index) => (
          <motion.div
            key={keyExtractor(item)}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.02 }}
            onClick={() => onRowClick?.(item)}
            className={`rounded-lg border p-4 space-y-3 ${
              isDarkMode
                ? "border-gray-800 bg-gray-800/30"
                : "border-gray-200 bg-gray-50"
            } ${onRowClick ? "cursor-pointer active:scale-[0.98]" : ""}`}
          >
            {columns
              .filter((column) => !column.hideOnMobile)
              .map((column) => (
                <div
                  key={column.key}
                  className="flex items-start justify-between gap-3"
                >
                  <span
                    className={`text-xs font-medium uppercase tracking-wider ${
                      isDarkMode ? "text-gray-400" : "text-gray-600"
                    }`}
                  >
                    {column.label}
                  </span>
                  <div className="text-right flex-1">{column.render(item)}</div>
                </div>
              ))}
          </motion.div>
        ))}
      </div>
    </>
  );
}
