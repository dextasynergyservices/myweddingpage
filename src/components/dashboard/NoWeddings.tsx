import { Heart, Plus } from "lucide-react";

interface NoWeddingsProps {
  isDarkMode: boolean;
  handleCreateWedding: () => void;
}

const NoWeddings = ({ isDarkMode, handleCreateWedding }: NoWeddingsProps) => {
  return (
    <div className="text-center py-8 md:py-16">
      <div
        className={`p-4 md:p-6 rounded-full w-16 h-16 md:w-24 md:h-24 mx-auto mb-4 md:mb-6 flex items-center justify-center ${
          isDarkMode ? "bg-slate-700" : "bg-slate-100"
        }`}
      >
        <Heart
          className={`h-6 md:h-8 w-6 md:w-8 ${isDarkMode ? "text-slate-400" : "text-slate-400"}`}
        />
      </div>
      <h3
        className={`text-lg md:text-xl font-semibold mb-1 md:mb-2 ${isDarkMode ? "text-white" : "text-slate-900"}`}
      >
        No wedding pages yet
      </h3>
      <p className={`font-light mb-4 md:mb-6 ${isDarkMode ? "text-slate-400" : "text-slate-600"}`}>
        Create your first wedding page to get started.
      </p>
      <button
        onClick={handleCreateWedding}
        className="bg-gradient-to-r from-indigo-600 to-purple-600 text-white px-6 md:px-8 py-2 md:py-3 rounded-xl md:rounded-2xl font-medium hover:shadow-lg transition-all duration-300 flex items-center gap-2 mx-auto"
      >
        <Plus className="h-3 md:h-4 w-3 md:w-4" />
        <span className="text-sm md:text-base">Create Wedding Page</span>
      </button>
    </div>
  );
};

export default NoWeddings;
