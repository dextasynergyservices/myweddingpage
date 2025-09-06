"use client";

import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { useTheme } from "@/contexts/ThemeContext";
import { X, Check } from "lucide-react";
import Modal from "@/components/ui/Modal";
import ConfirmDeleteModal from "@/components/ui/ConfirmDeleteModal";
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
  // Called after successful selection; receives the saved UserTemplate from server
  // userTemplate may be undefined when the selection was deleted
  onSelectTemplate?: (userTemplate?: UserTemplate) => void;
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
  const [isDeleting, setIsDeleting] = useState(false);

  const isSelectedForThisTemplate = Boolean(
    userTemplate?.isSelected && userTemplate?.templateId === template.id
  );
  const isAnotherTemplateSelected = Boolean(
    userTemplate?.isSelected && userTemplate?.templateId !== template.id
  );

  // Fetch correct data source when modal opens
  useEffect(() => {
    if (!isOpen) return;

    const fetchData = async () => {
      setLoadingData(true);
      try {
        // When isSelect = true → fetch dynamic wedding data
        // When isSelect = false → fetch static preview
        const url = isSelect
          ? `/api/wedding-data?templateId=${template.id}`
          : `/api/template-preview?templateId=${template.id}`;

        const res = await fetch(url);
        if (!res.ok) throw new Error("Failed to fetch preview data");

        const data = await res.json();
        console.log("TemplatePreviewModal fetched:", { url, data });
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
      const res = await fetch("/api/templates/select", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ templateId: template.id }),
      });

      if (!res.ok) {
        const err = await res.json().catch(() => ({}));
        throw new Error(err?.error || "Failed to select template");
      }

      const userTemplateData = await res.json();

      toast.success("Template selected successfully!");

      // Notify parent to update local state (selected template, etc.)
      if (onSelectTemplate) onSelectTemplate(userTemplateData as UserTemplate);

      onClose();
    } catch (error: any) {
      console.error("Error selecting template:", error);
      toast.error(error?.message || "Failed to select template");
    } finally {
      setIsSelecting(false);
    }
  };

  const handleDeleteTemplate = async () => {
    if (!isSelectedForThisTemplate) return;
    setIsDeleting(true);
    try {
      const res = await fetch("/api/templates/delete", {
        method: "DELETE",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ templateId: template.id }),
      });

      if (!res.ok) {
        const err = await res.json().catch(() => ({}));
        throw new Error(err?.error || "Failed to delete template");
      }

      toast.success("Template deleted successfully");

      // Notify parent to clear selection
      if (onSelectTemplate) onSelectTemplate(undefined as any);

      onClose();
    } catch (error: any) {
      console.error("Error deleting template:", error);
      toast.error(error?.message || "Failed to delete template");
    } finally {
      setIsDeleting(false);
    }
  };

  const [showConfirmDelete, setShowConfirmDelete] = useState(false);

  // Extract basic data from wedding page if needed
  const extractUserDataFromWeddingPage = (wp: any) => {
    if (!wp) return undefined;
    const ai = wp.ai_data || wp.layout_data || {};
    return {
      brideName: ai?.brideName || ai?.bride_name || wp?.welcomeMessage,
      groomName: ai?.groomName || ai?.groom_name,
      weddingDate: ai?.weddingDate || wp?.created_at,
      venue: wp?.venue || ai?.venue,
    };
  };

  const fallbackTemplate = previewData?.template ||
    userTemplate?.template || { ...template, sections: template.sections || [] };

  const fallbackUserData =
    previewData?.userData ||
    previewData?.previewData ||
    userTemplate?.content ||
    extractUserDataFromWeddingPage(weddingPage) ||
    template.previewData ||
    {};

  // ✅ Corrected renderer logic
  const rendererData = isSelect
    ? {
        // Customize: use actual user wedding data
        template: fallbackTemplate,
        userData: fallbackUserData,
      }
    : {
        // Preview only: show static template demo content
        template: fallbackTemplate,
        userData: previewData?.previewData || template.previewData || {},
      };

  return (
    <Modal isOpen={isOpen} onClose={onClose} maxWidth="max-w-[95vw]">
      <div className={`p-0 ${isDarkMode ? "bg-slate-900" : "bg-white"}`}>
        <div
          className={`flex items-center justify-between mb-6 px-4 py-3 rounded-t ${
            isDarkMode
              ? "bg-gradient-to-r from-slate-800 to-slate-700"
              : "bg-gradient-to-r from-indigo-50 to-white"
          }`}
        >
          <h2
            className={`text-lg md:text-xl font-semibold ${isDarkMode ? "text-white" : "text-slate-900"}`}
          >
            {template.name} Preview
          </h2>
          <motion.button
            whileHover={{ rotate: 90 }}
            onClick={onClose}
            aria-label="Close"
            className={`p-2 rounded-md border ${isDarkMode ? "border-slate-700 text-slate-200" : "border-slate-100 text-slate-700"}`}
          >
            <X className="h-5 w-5" />
          </motion.button>
        </div>

        {/* <div className="mb-6">
          <div className={`text-sm ${isDarkMode ? "text-slate-400" : "text-slate-600"}`}>
            {!isSelect ? (
              <span>Preview mode – showing sample template data</span>
            ) : (
              <div className="flex items-center gap-2 text-green-600">
                <Check className="h-4 w-4" />
                <span>Your selected template with your customizations</span>
              </div>
            )}
          </div>
        </div> */}

        <div className="w-full overflow-auto">
          {loadingData ? (
            <div className="flex justify-center items-center h-64">
              <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-indigo-500"></div>
            </div>
          ) : rendererData.template ? (
            <DynamicTemplateRenderer
              template={rendererData.template}
              userPlan={userPlan || { id: "preview", name: "Preview", maxComponents: 10 }}
              userData={rendererData.userData}
              colorScheme={userTemplate?.colorScheme || template.colorSchemes?.[0]}
              editable={isSelect} // allow editing only when customizing
              isPreview={!isSelect} // true for static preview
            />
          ) : (
            <p className="text-center text-red-500 py-6">Failed to load data</p>
          )}
        </div>

        <div className="flex gap-3 mt-6 items-center py-5 px-5">
          {!isSelect && (
            // show Select button for preview mode
            <div className="flex-1">
              <motion.button
                whileHover={{ scale: isSelecting || isAnotherTemplateSelected ? 1 : 1.02 }}
                whileTap={{ scale: isSelecting || isAnotherTemplateSelected ? 1 : 0.98 }}
                onClick={handleSelectTemplate}
                disabled={isSelecting || isAnotherTemplateSelected}
                className={`w-full text-sm font-medium py-2 px-4 rounded-lg shadow-sm transition-colors hidden ${
                  isSelecting || isAnotherTemplateSelected
                    ? "bg-indigo-400 text-white cursor-not-allowed opacity-70"
                    : "bg-indigo-600 hover:bg-indigo-700 text-white"
                }`}
              >
                {isSelecting ? "Selecting..." : "Select Template"}
              </motion.button>

              {isAnotherTemplateSelected && (
                <p className="mt-2 text-xs text-slate-400 px-5 py-5">
                  You already have a selected template. Delete it first to choose a different
                  template.
                </p>
              )}
            </div>
          )}

          {/* If this template is currently selected for the user, show delete instead of preview/select */}
          {isSelectedForThisTemplate && (
            <motion.button
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              onClick={() => setShowConfirmDelete(true)}
              disabled={isDeleting}
              className="w-full bg-red-600 text-white py-2 px-4 rounded-lg disabled:opacity-50"
            >
              {isDeleting ? "Deleting..." : "Delete Template"}
            </motion.button>
          )}

          <ConfirmDeleteModal
            isOpen={showConfirmDelete}
            onClose={() => setShowConfirmDelete(false)}
            onConfirm={async () => {
              await handleDeleteTemplate();
            }}
          />

          <motion.button
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            onClick={onClose}
            className={`${!isSelect ? "flex-1" : "w-full"} text-sm font-medium py-2 px-4 rounded-lg border ${
              isDarkMode
                ? "border-slate-700 text-slate-200 bg-slate-800/50"
                : "border-slate-200 text-slate-700 bg-white"
            }`}
          >
            Close
          </motion.button>
        </div>
      </div>
    </Modal>
  );
};

export default TemplatePreviewModal;
