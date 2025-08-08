import { motion, AnimatePresence } from "framer-motion";

interface DashboardAIAssistantProps {
  showAIAssistant: boolean;
  isDarkMode: boolean;
}

const DashboardAIAssistant = ({ showAIAssistant, isDarkMode }: DashboardAIAssistantProps) => {
  return (
    <AnimatePresence>
      {showAIAssistant && (
        <motion.div
          initial={{ width: 0, opacity: 0 }}
          animate={{ width: 400, opacity: 1 }}
          exit={{ width: 0, opacity: 0 }}
          transition={{ duration: 0.3 }}
          className={`hidden md:block border-l overflow-hidden ${
            isDarkMode ? "bg-slate-800 border-slate-700" : "bg-white border-slate-200"
          }`}
        >
          {/* AI Assistant content would go here */}
        </motion.div>
      )}
    </AnimatePresence>
  );
};

export default DashboardAIAssistant;
