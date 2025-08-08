import { motion } from "framer-motion";
import { Wedding } from "@/types/dashboard";
import { Heart, Eye, Edit, Calendar } from "lucide-react";
import ProgressBar from "@/components/dashboard/ProgressBar";

interface WeddingCardProps {
  wedding: Wedding;
  isDarkMode: boolean;
  handleViewWedding: (weddingId: string) => void;
  setActiveTab: (tab: string) => void;
}

const WeddingCard = ({
  wedding,
  isDarkMode,
  handleViewWedding,
  setActiveTab,
}: WeddingCardProps) => {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className={`p-4 md:p-6 rounded-xl md:rounded-2xl border transition-all duration-300 hover:shadow-lg ${
        isDarkMode
          ? "bg-slate-700/50 border-slate-600 hover:border-slate-500"
          : "bg-slate-50 border-slate-200 hover:border-slate-300"
      }`}
    >
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="flex items-center gap-4 md:gap-6">
          <div className="p-3 md:p-4 bg-gradient-to-r from-pink-500 to-rose-600 rounded-xl md:rounded-2xl">
            <Heart className="h-6 md:h-8 w-6 md:w-8 text-white" fill="currentColor" />
          </div>
          <div>
            <h3
              className={`text-lg md:text-xl font-semibold mb-1 md:mb-2 ${isDarkMode ? "text-white" : "text-slate-900"}`}
            >
              {wedding.title}
            </h3>
            <div className="flex flex-wrap items-center gap-3 md:gap-6 text-xs md:text-sm">
              <div
                className={`flex items-center gap-1 md:gap-2 ${isDarkMode ? "text-slate-400" : "text-slate-600"}`}
              >
                <Calendar className="h-3 md:h-4 w-3 md:w-4" />
                {wedding.date}
              </div>
              <span className="inline-flex px-2 md:px-3 py-0.5 md:py-1 text-xs font-medium rounded-full bg-emerald-100 text-emerald-800 dark:bg-emerald-900/30 dark:text-emerald-400">
                {wedding.status}
              </span>
            </div>
          </div>
        </div>

        <div className="flex flex-col md:flex-row md:items-center gap-4 md:gap-8">
          <div className="grid grid-cols-2 gap-3 md:gap-6 text-center">
            <div>
              <p
                className={`text-xl md:text-2xl font-light ${isDarkMode ? "text-white" : "text-slate-900"}`}
              >
                {wedding.views}
              </p>
              <p className={`text-xs ${isDarkMode ? "text-slate-400" : "text-slate-500"}`}>Views</p>
            </div>
            <div>
              <p
                className={`text-xl md:text-2xl font-light ${isDarkMode ? "text-white" : "text-slate-900"}`}
              >
                {wedding.rsvpCount}/{wedding.guestCount}
              </p>
              <p className={`text-xs ${isDarkMode ? "text-slate-400" : "text-slate-500"}`}>RSVPs</p>
            </div>
          </div>

          <div className="flex gap-2 md:gap-3">
            <button
              onClick={() => handleViewWedding(wedding.id)}
              className="p-2 md:p-3 bg-indigo-600 text-white rounded-lg md:rounded-xl hover:bg-indigo-700 transition-colors duration-200"
            >
              <Eye className="h-3 md:h-4 w-3 md:w-4" />
            </button>
            <button
              onClick={() => setActiveTab("builder")}
              className="p-2 md:p-3 bg-slate-600 text-white rounded-lg md:rounded-xl hover:bg-slate-700 transition-colors duration-200"
            >
              <Edit className="h-3 md:h-4 w-3 md:w-4" />
            </button>
          </div>
        </div>
      </div>

      {/* Progress Indicators */}
      <div className="mt-4 md:mt-6 grid grid-cols-1 md:grid-cols-3 gap-3 md:gap-4">
        <ProgressBar
          title="Budget Progress"
          current={wedding.spent}
          total={wedding.budget}
          color="from-amber-500 to-orange-600"
          isDarkMode={isDarkMode}
          format="currency"
        />
        <ProgressBar
          title="RSVP Progress"
          current={wedding.rsvpCount}
          total={wedding.guestCount}
          color="from-emerald-500 to-teal-600"
          isDarkMode={isDarkMode}
          format="percentage"
        />
        <ProgressBar
          title="Tasks Complete"
          current={68}
          total={95}
          color="from-purple-500 to-pink-600"
          isDarkMode={isDarkMode}
          format="count"
        />
      </div>
    </motion.div>
  );
};

export default WeddingCard;
