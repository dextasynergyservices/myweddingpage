"use client";

import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { useTheme } from "@/contexts/ThemeContext";
import { X } from "lucide-react";
import Modal from "@/components/ui/Modal";
import ConfirmDeleteModal from "@/components/ui/ConfirmDeleteModal";
import { DynamicTemplateRenderer } from "@/components/DynamicTemplateRenderer";
import { Template, UserTemplate, WeddingPage, UserPlan } from "@/types/wedding";
import { UserData } from "@/types/user-data";
import toast from "react-hot-toast";
import { useCSRFToken } from "@/hooks/useCSRFToken";

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
  const { token: csrfToken, loading: csrfLoading } = useCSRFToken();
  const [isSelecting, setIsSelecting] = useState(false);

  const [previewData, setPreviewData] = useState<UserData | null>(null);
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
        console.log("TemplatePreviewModal - template data:", data.template);
        console.log("TemplatePreviewModal - previewData:", data.previewData);
        console.log("TemplatePreviewModal - userTemplate prop:", userTemplate);
        console.log("TemplatePreviewModal - userData:", data.userData);
        console.log("TemplatePreviewModal - userTemplate from API:", data.userTemplate);
        setPreviewData(data);
      } catch (error) {
        console.error("Error fetching preview data:", error);
        toast.error("Failed to load template data");
      } finally {
        setLoadingData(false);
      }
    };

    fetchData();
  }, [isOpen, isSelect, template.id, userTemplate?.id, userTemplate]);

  const handleSelectTemplate = async () => {
    setIsSelecting(true);
    try {
      const res = await fetch("/api/templates/select", {
        method: "POST",
        credentials: "include", // Important: send cookies with request
        headers: {
          "Content-Type": "application/json",
          "x-csrf-token": csrfToken || "",
        },
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
    } catch (error: unknown) {
      console.error("Error selecting template:", error);
      toast.error(getErrorMessage(error) || "Failed to select template");
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
        credentials: "include", // Important: send cookies with request
        headers: {
          "Content-Type": "application/json",
          "x-csrf-token": csrfToken || "",
        },
        body: JSON.stringify({ templateId: template.id }),
      });

      if (!res.ok) {
        const err = await res.json().catch(() => ({}));
        throw new Error(err?.error || "Failed to delete template");
      }

      toast.success("Template deleted successfully");

      // Notify parent to clear selection
      if (onSelectTemplate) onSelectTemplate(undefined);

      onClose();
    } catch (error: unknown) {
      console.error("Error deleting template:", error);
      toast.error(getErrorMessage(error) || "Failed to delete template");
    } finally {
      setIsDeleting(false);
    }
  };

  const [showConfirmDelete, setShowConfirmDelete] = useState(false);

  // Extract basic data from wedding page if needed
  const extractUserDataFromWeddingPage = (
    wp?: WeddingPage | Record<string, unknown> | null
  ): UserData | undefined => {
    if (!wp) return undefined;
    const ai =
      (wp as Record<string, unknown>).ai_data || (wp as Record<string, unknown>).layout_data || {};
    return {
      brideName: String(
        (ai as Record<string, unknown>)?.brideName ||
          (ai as Record<string, unknown>)?.bride_name ||
          (wp as Record<string, unknown>)?.welcomeMessage ||
          ""
      ),
      groomName: String(
        (ai as Record<string, unknown>)?.groomName ||
          (ai as Record<string, unknown>)?.groom_name ||
          ""
      ),
      weddingDate: String(
        (ai as Record<string, unknown>)?.weddingDate ||
          (wp as Record<string, unknown>)?.created_at ||
          ""
      ),
      venue: String(
        (wp as Record<string, unknown>)?.venue || (ai as Record<string, unknown>)?.venue || ""
      ),
    };
  };

  const fallbackTemplate = (previewData?.template ||
    userTemplate?.template || {
      ...template,
      sections: template.sections || [],
    }) as Template;

  // Create a default UserData object that satisfies the interface
  const createDefaultUserData = (): UserData => ({
    id: "",
    brideName: "",
    groomName: "",
    weddingDate: "",
    venue: "",
  });

  // For customize mode, use the userData directly from API (contains sections)
  // For preview mode, use static preview data
  const fallbackUserData: UserData = isSelect
    ? (previewData?.userData as UserData) || // From API wedding-data - contains sections
      extractUserDataFromWeddingPage(weddingPage) ||
      (template.previewData as UserData) ||
      createDefaultUserData()
    : (previewData?.previewData as UserData) || // For preview mode - static data
      (template.previewData as UserData) ||
      createDefaultUserData();

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

  // Debug logging for customize mode
  if (isSelect) {
    console.log("TemplatePreviewModal - Customize mode data:", {
      previewData,
      fallbackUserData,
      rendererData,
      sections: fallbackUserData?.sections,
    });
  }

  // Helper to normalize unknown errors
  function getErrorMessage(err: unknown) {
    if (!err) return "Unknown error";
    if (err instanceof Error) return err.message;
    if (typeof err === "object" && err && "message" in err)
      return String((err as { message: unknown }).message);
    return String(err);
  }

  return (
    <Modal isOpen={isOpen} onClose={onClose} maxWidth="max-w-[95vw]">
      <div className={`p-0 ${isDarkMode ? "bg-white" : "bg-white"}`}>
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

        <div className="w-full overflow-auto">
          {loadingData ? (
            <div className="flex justify-center items-center h-64">
              <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-indigo-500"></div>
            </div>
          ) : rendererData.template ? (
            <DynamicTemplateRenderer
              template={rendererData.template as Template}
              userPlan={
                userPlan || {
                  id: "preview",
                  name: "Preview",
                  maxComponents: 10,
                }
              }
              userData={rendererData.userData as UserData}
              colorScheme={
                (userTemplate?.colorScheme || template.colorSchemes?.[0]) as {
                  name: string;
                  primary: string;
                  secondary: string;
                  background: string;
                  text: string;
                }
              }
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
                whileHover={{
                  scale: isSelecting || isAnotherTemplateSelected || csrfLoading ? 1 : 1.02,
                }}
                whileTap={{
                  scale: isSelecting || isAnotherTemplateSelected || csrfLoading ? 1 : 0.98,
                }}
                onClick={handleSelectTemplate}
                disabled={isSelecting || isAnotherTemplateSelected || csrfLoading || !csrfToken}
                className={`w-full text-sm font-medium py-2 px-4 rounded-lg shadow-sm transition-colors ${
                  isSelecting || isAnotherTemplateSelected || csrfLoading || !csrfToken
                    ? "bg-indigo-400 text-white cursor-not-allowed opacity-70"
                    : "bg-indigo-600 hover:bg-indigo-700 text-white"
                }`}
              >
                {csrfLoading ? "Loading..." : isSelecting ? "Selecting..." : "Select Template"}
              </motion.button>

              {isAnotherTemplateSelected && (
                <p className="mt-2 text-xs font-bold text-slate-900 px-5 py-5">
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
