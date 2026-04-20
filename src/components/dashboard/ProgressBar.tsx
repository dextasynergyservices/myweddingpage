interface ProgressBarProps {
  title: string;
  current: number;
  total: number;
  color: string;
  isDarkMode: boolean;
  format: "currency" | "percentage" | "count";
}

const ProgressBar = ({
  title,
  current,
  total,
  color,
  isDarkMode,
  format,
}: ProgressBarProps) => {
  // Guard against division by zero or invalid numbers
  const safeCurrent = Number.isFinite(current) ? current : 0;
  const safeTotal = Number.isFinite(total) && total > 0 ? total : 0;
  const rawPercentage = safeTotal > 0 ? (safeCurrent / safeTotal) * 100 : 0;
  const percentage = Math.max(
    0,
    Math.min(100, Number.isFinite(rawPercentage) ? rawPercentage : 0)
  );

  const formatValue = () => {
    // When there's no total, show a friendly placeholder instead of 0/0 or NaN%
    if (safeTotal === 0) {
      // If the title looks like RSVP/Guests, show a clearer message
      if (/rsvp|guest/i.test(title)) return "No guests";
      return "—";
    }

    switch (format) {
      case "currency":
        return `$${safeCurrent.toLocaleString()}/${safeTotal.toLocaleString()}`;
      case "percentage":
        return `${Math.round(percentage)}%`;
      case "count":
        return `${safeCurrent}/${safeTotal}`;
      default:
        return `${safeCurrent}/${safeTotal}`;
    }
  };

  return (
    <div
      className={`p-3 md:p-4 rounded-lg md:rounded-xl ${isDarkMode ? "bg-slate-800" : "bg-white"}`}
    >
      <div className="flex items-center justify-between mb-1 md:mb-2">
        <span
          className={`text-xs md:text-sm font-medium ${isDarkMode ? "text-slate-300" : "text-slate-700"}`}
        >
          {title}
        </span>
        <span
          className={`text-xs md:text-sm ${isDarkMode ? "text-slate-400" : "text-slate-600"}`}
        >
          {formatValue()}
        </span>
      </div>
      <div
        className={`w-full h-1.5 md:h-2 rounded-full ${isDarkMode ? "bg-slate-700" : "bg-slate-200"}`}
      >
        <div
          className={`h-1.5 md:h-2 bg-gradient-to-r ${color} rounded-full`}
          style={{ width: `${percentage}%` }}
        />
      </div>
    </div>
  );
};

export default ProgressBar;
