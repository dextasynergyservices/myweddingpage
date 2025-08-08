interface ProgressBarProps {
  title: string;
  current: number;
  total: number;
  color: string;
  isDarkMode: boolean;
  format: "currency" | "percentage" | "count";
}

const ProgressBar = ({ title, current, total, color, isDarkMode, format }: ProgressBarProps) => {
  const percentage = (current / total) * 100;

  const formatValue = () => {
    switch (format) {
      case "currency":
        return `$${current.toLocaleString()}/${total.toLocaleString()}`;
      case "percentage":
        return `${Math.round(percentage)}%`;
      case "count":
        return `${current}/${total}`;
      default:
        return `${current}/${total}`;
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
        <span className={`text-xs md:text-sm ${isDarkMode ? "text-slate-400" : "text-slate-600"}`}>
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
