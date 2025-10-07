/**
 * Reusable loading skeleton components for admin dashboard
 * Provides better perceived performance than spinners
 */

export function TableSkeleton({ rows = 5 }: { rows?: number }) {
  return (
    <div className="space-y-3 animate-pulse">
      {/* Table Header */}
      <div className="grid grid-cols-4 gap-4 px-4 py-3 bg-gray-100 dark:bg-gray-800 rounded-lg">
        {[...Array(4)].map((_, i) => (
          <div key={i} className="h-4 bg-gray-300 dark:bg-gray-700 rounded" />
        ))}
      </div>

      {/* Table Rows */}
      {[...Array(rows)].map((_, rowIndex) => (
        <div
          key={rowIndex}
          className="grid grid-cols-4 gap-4 px-4 py-4 border border-gray-200 dark:border-gray-700 rounded-lg"
        >
          {[...Array(4)].map((_, colIndex) => (
            <div key={colIndex} className="h-4 bg-gray-200 dark:bg-gray-700 rounded" />
          ))}
        </div>
      ))}
    </div>
  );
}

export function CardSkeleton() {
  return (
    <div className="p-6 border border-gray-200 dark:border-gray-700 rounded-xl shadow-sm animate-pulse">
      {/* Icon placeholder */}
      <div className="w-12 h-12 bg-gray-200 dark:bg-gray-700 rounded-lg mb-4" />

      {/* Title */}
      <div className="h-4 bg-gray-300 dark:bg-gray-600 rounded w-1/2 mb-3" />

      {/* Value */}
      <div className="h-8 bg-gray-200 dark:bg-gray-700 rounded w-3/4 mb-2" />

      {/* Description */}
      <div className="h-3 bg-gray-200 dark:bg-gray-700 rounded w-full" />
    </div>
  );
}

export function StatCardsSkeleton({ count = 4 }: { count?: number }) {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
      {[...Array(count)].map((_, i) => (
        <CardSkeleton key={i} />
      ))}
    </div>
  );
}

export function ChartSkeleton({ height = "300px" }: { height?: string }) {
  return (
    <div className="p-6 border border-gray-200 dark:border-gray-700 rounded-xl shadow-sm animate-pulse">
      {/* Chart Title */}
      <div className="h-5 bg-gray-300 dark:bg-gray-600 rounded w-1/3 mb-6" />

      {/* Chart Bars/Lines placeholder */}
      <div style={{ height }} className="flex items-end gap-4">
        {[...Array(12)].map((_, i) => (
          <div
            key={i}
            className="flex-1 bg-gray-200 dark:bg-gray-700 rounded-t"
            style={{ height: `${Math.random() * 60 + 40}%` }}
          />
        ))}
      </div>

      {/* X-axis labels */}
      <div className="flex justify-between mt-4">
        {[...Array(6)].map((_, i) => (
          <div key={i} className="h-3 bg-gray-200 dark:bg-gray-700 rounded w-16" />
        ))}
      </div>
    </div>
  );
}

export function MetricSkeleton() {
  return (
    <div className="flex items-center justify-between p-4 border border-gray-200 dark:border-gray-700 rounded-lg animate-pulse">
      <div className="flex-1">
        <div className="h-4 bg-gray-300 dark:bg-gray-600 rounded w-1/3 mb-2" />
        <div className="h-6 bg-gray-200 dark:bg-gray-700 rounded w-1/2" />
      </div>
      <div className="w-16 h-16 bg-gray-200 dark:bg-gray-700 rounded-full" />
    </div>
  );
}

export function ListSkeleton({ items = 5 }: { items?: number }) {
  return (
    <div className="space-y-3">
      {[...Array(items)].map((_, i) => (
        <div
          key={i}
          className="flex items-center gap-4 p-4 border border-gray-200 dark:border-gray-700 rounded-lg animate-pulse"
        >
          {/* Avatar */}
          <div className="w-10 h-10 bg-gray-300 dark:bg-gray-600 rounded-full flex-shrink-0" />

          {/* Content */}
          <div className="flex-1 space-y-2">
            <div className="h-4 bg-gray-300 dark:bg-gray-600 rounded w-1/4" />
            <div className="h-3 bg-gray-200 dark:bg-gray-700 rounded w-1/2" />
          </div>

          {/* Action button */}
          <div className="w-20 h-8 bg-gray-200 dark:bg-gray-700 rounded" />
        </div>
      ))}
    </div>
  );
}

export function PageSkeleton() {
  return (
    <div className="space-y-6 animate-pulse">
      {/* Page Header */}
      <div className="space-y-2">
        <div className="h-8 bg-gray-300 dark:bg-gray-600 rounded w-1/4" />
        <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-1/2" />
      </div>

      {/* Stats Cards */}
      <StatCardsSkeleton />

      {/* Chart */}
      <ChartSkeleton />

      {/* Table */}
      <TableSkeleton />
    </div>
  );
}
