"use client";

import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { useTheme } from "@/contexts/ThemeContext";
import { X, Check } from "lucide-react";
import Modal from "@/components/ui/Modal";
import { DynamicTemplateRenderer } from "@/components/DynamicTemplateRenderer";
import { Template, UserTemplate, WeddingPage, UserPlan } from "@/types/wedding";
import toast from "react-hot-toast";

interface TemplatePreviewModalProps {
  isOpen: boolean;
  onClose: () => void;
  template: Template;
  userTemplate?: UserTemplate;
  weddingPage?: WeddingPage;
  userPlan?: UserPlan;
  onSelectTemplate: (template: Template) => Promise<void>;
  isSelect: boolean;
}

const TemplatePreviewModal = ({
  isOpen,
  onClose,
  template,
  userTemplate,
  weddingPage,
  userPlan,
  onSelectTemplate,
  isSelect,
}: TemplatePreviewModalProps) => {
  const { isDarkMode } = useTheme();
  const [isSelecting, setIsSelecting] = useState(false);
  const [previewData, setPreviewData] = useState<any>(null);
  const [loadingData, setLoadingData] = useState(false);

  const isSelectedForThisTemplate = Boolean(isSelect && userTemplate?.templateId === template.id);

  // Fetch correct data source when modal opens
  useEffect(() => {
    if (!isOpen) return;

    const fetchData = async () => {
      setLoadingData(true);
      try {
        let url;

        // If isSelect is true (Choose Template tab), use static preview
        // If isSelect is false (Customize tab), use dynamic data for selected template
        url = isSelect
          ? `/api/template-preview?templateId=${template.id}`
          : `/api/wedding-data?templateId=${template.id}`;

        const res = await fetch(url);
        if (!res.ok) throw new Error("Failed to fetch preview data");

        const data = await res.json();
        setPreviewData(data);
      } catch (error) {
        console.error("Error fetching preview data:", error);
        toast.error("Failed to load template data");
      } finally {
        setLoadingData(false);
      }
    };

    fetchData();
  }, [isOpen, isSelect, template.id]);

  const handleSelectTemplate = async () => {
    setIsSelecting(true);
    try {
      await onSelectTemplate(template);
      toast.success("Template selected successfully!");
      onClose();
    } catch (error) {
      console.error("Error selecting template:", error);
      toast.error("Failed to select template");
    } finally {
      setIsSelecting(false);
    }
  };

  // Determine what data to pass to the renderer
  const rendererData = isSelect
    ? {
        // Choose Template tab: use static preview data
        template: previewData || { ...template, sections: template.sections || [] },
        userData: previewData?.previewData,
      }
    : {
        // Customize tab: use dynamic user data
        template: previewData?.template,
        userData: previewData?.userData,
      };

  return (
    <Modal isOpen={isOpen} onClose={onClose} maxWidth="max-w-[95vw]">
      <div className={`p-0 ${isDarkMode ? "bg-slate-900" : "bg-white"}`}>
        <div className="flex items-center justify-between mb-6">
          <h2 className={`text-xl font-semibold ${isDarkMode ? "text-white" : "text-slate-900"}`}>
            {template.name} Preview
          </h2>
          <motion.button
            whileHover={{ rotate: 90 }}
            onClick={onClose}
            className={`p-1 rounded-full ${isDarkMode ? "hover:bg-slate-700" : "hover:bg-slate-100"}`}
          >
            <X className="h-5 w-5" />
          </motion.button>
        </div>

        <div className="mb-6">
          <div className={`text-sm ${isDarkMode ? "text-slate-400" : "text-slate-600"}`}>
            {isSelect ? (
              <span>Preview mode - Showing sample template data</span>
            ) : (
              <div className="flex items-center gap-2 text-green-600">
                <Check className="h-4 w-4" />
                <span>Your selected template with your customizations</span>
              </div>
            )}
          </div>
        </div>

        {/* Template Preview - full width */}
        <div className="w-full overflow-auto">
          {loadingData ? (
            <div className="flex justify-center items-center h-64">
              <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-indigo-500"></div>
            </div>
          ) : previewData ? (
            <DynamicTemplateRenderer
              template={rendererData.template}
              userPlan={userPlan || { id: "preview", name: "Preview", maxComponents: 10 }}
              userData={rendererData.userData}
              colorScheme={userTemplate?.colorScheme || template.colorSchemes?.[0]}
              editable={!isSelect}
              isPreview={isSelect}
            />
          ) : (
            <p className="text-center text-red-500 py-6">Failed to load data</p>
          )}
        </div>

        {/* Action Buttons */}
        <div className="flex gap-3 mt-6">
          {isSelect && (
            <motion.button
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              onClick={handleSelectTemplate}
              disabled={isSelecting}
              className="flex-1 bg-indigo-600 text-white py-2 px-4 rounded-lg disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isSelecting ? "Selecting..." : "Select Template"}
            </motion.button>
          )}

          <motion.button
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            onClick={onClose}
            className={`${isSelect ? "flex-1" : "w-full"} bg-gray-600 text-white py-2 px-4 rounded-lg`}
          >
            Close
          </motion.button>
        </div>
      </div>
    </Modal>
  );
};

export default TemplatePreviewModal;
