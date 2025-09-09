"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useTheme } from "@/contexts/ThemeContext";
import {
  Eye,
  Save,
  Download,
  Edit,
  Heart,
  FileText,
  ImageIcon,
  Gift,
  Users,
  Calendar,
  MapPin,
  X,
  CheckCircle,
  Trash2,
} from "lucide-react";
import Modal from "@/components/ui/Modal";
import { DynamicTemplateRenderer } from "@/components/DynamicTemplateRenderer";
import EditWeddingDetailsModal from "./EditWeddingDetailsModal";
import TemplatePreviewModal from "@/components/TemplatePreviewModal";
import { UserTemplate, Template, UserPlan, WeddingPage } from "@/types/wedding";
import toast from "react-hot-toast";

interface TemplateEditorProps {
  userTemplate: UserTemplate | null;
  selectedTemplate: Template | null;
  weddingPage: WeddingPage | null;
  userPlan: UserPlan | null;
  onTemplateUpdate: (template: Template) => void;
  onContentUpdate: (sectionId: string, content: Record<string, unknown>) => void;
  editedSections: string[];
  onWeddingPageUpdate?: (weddingPage: WeddingPage | null) => void;
  onUserTemplateUpdate?: (userTemplate: UserTemplate | null) => void;
}

const TemplateEditor = ({
  userTemplate,
  selectedTemplate,
  weddingPage,
  userPlan,
  onContentUpdate,
  editedSections = [],
  onWeddingPageUpdate,
  onUserTemplateUpdate,
}: TemplateEditorProps) => {
  const { isDarkMode } = useTheme();
  const [selectedSection, setSelectedSection] = useState<{ id: string; type: string } | null>(null);
  const [selectedColorScheme] = useState<Record<string, unknown> | null>(null);
  const [isSaving, setIsSaving] = useState(false);
  const [isPublishing, setIsPublishing] = useState(false);
  const [showPreviewModal, setShowPreviewModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [showSlugModal, setShowSlugModal] = useState(false);
  const [slug, setSlug] = useState("");
  const [sectionStatus, setSectionStatus] = useState<
    Array<{ sectionId: string; type: string; isComplete: boolean; hasContent: boolean }>
  >([]);
  const [deleteConfirmation, setDeleteConfirmation] = useState({
    brideName: "",
    groomName: "",
  });
  const [userData, setUserData] = useState({
    brideName: "",
    groomName: "",
    weddingDate: "",
    venue: "",
  });

  useEffect(() => {
    // Fetch user data for the template
    const fetchUserData = async () => {
      try {
        const response = await fetch("/api/wedding-data");
        if (response.ok) {
          const data = await response.json();
          setUserData(
            data.userData || {
              brideName: "Bride",
              groomName: "Groom",
              weddingDate: new Date().toISOString(),
              venue: "Venue",
            }
          );
        }
      } catch (error) {
        console.error("Error fetching user data:", error);
      }
    };

    fetchUserData();
  }, []);

  // Fetch section status when template changes
  useEffect(() => {
    if (!selectedTemplate) return;

    const fetchSectionStatus = async () => {
      try {
        const response = await fetch(
          `/api/template-sections/status?templateId=${selectedTemplate.id}`
        );
        if (response.ok) {
          const data = await response.json();
          setSectionStatus(data.sectionStatus || []);
        }
      } catch (error) {
        console.error("Error fetching section status:", error);
      }
    };

    fetchSectionStatus();
  }, [selectedTemplate, userTemplate]);

  if (!selectedTemplate) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600"></div>
      </div>
    );
  }

  // Debug logging
  console.log("TemplateEditor - selectedTemplate:", selectedTemplate);
  console.log("TemplateEditor - selectedTemplate.sections:", selectedTemplate.sections);

  const saveTemplateContent = async () => {
    setIsSaving(true);
    try {
      console.log("Saving template content:", {
        templateId: selectedTemplate.id,
        content: userTemplate?.content || {},
        colorScheme: selectedColorScheme || userTemplate?.colorScheme,
      });

      // Save all content to user template
      const response = await fetch("/api/user/templates", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          templateId: selectedTemplate.id,
          content: userTemplate?.content || {},
          colorScheme: selectedColorScheme || userTemplate?.colorScheme,
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        console.error("Save failed:", errorData);
        throw new Error(errorData.error || "Failed to save template content");
      }

      const updatedUserTemplate = await response.json();
      console.log("Save successful:", updatedUserTemplate);

      // Update local state
      if (onUserTemplateUpdate) {
        onUserTemplateUpdate(updatedUserTemplate);
      }

      toast.success("Template content saved successfully!");
    } catch (error) {
      console.error("Error saving template content:", error);
      toast.error("Failed to save template content");
    } finally {
      setIsSaving(false);
    }
  };

  const publishTemplate = async () => {
    if (!selectedTemplate) return;

    console.log("Publish clicked - weddingPage:", weddingPage);
    console.log("Publish clicked - is_live:", weddingPage?.is_live);

    // If no existing wedding page, show slug modal
    if (!weddingPage || !weddingPage.is_live) {
      // Generate default slug from user data
      const defaultSlug =
        `${userData.groomName || "groom"}-${userData.brideName || "bride"}-wedding`
          .toLowerCase()
          .replace(/\s+/g, "-")
          .replace(/[^a-z0-9-]/g, "");
      console.log("Showing slug modal with default slug:", defaultSlug);
      setSlug(defaultSlug);
      setShowSlugModal(true);
      return;
    }

    // Update existing wedding page
    await handlePublish();
  };

  const handlePublish = async (customSlug?: string) => {
    if (!selectedTemplate) return;

    setIsPublishing(true);
    try {
      const response = await fetch("/api/wedding-pages/publish", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          templateId: selectedTemplate.id,
          content: userTemplate?.content || {},
          colorScheme: selectedColorScheme || userTemplate?.colorScheme,
          title: `${userData.groomName || "Groom"} & ${userData.brideName || "Bride"} Wedding`,
          slug: customSlug || slug,
        }),
      });

      if (response.ok) {
        const data = await response.json();
        toast.success(
          data.isNewPublication
            ? "Wedding page published successfully!"
            : "Wedding page updated successfully!"
        );

        if (onWeddingPageUpdate) {
          onWeddingPageUpdate(data.weddingPage);
        }

        setShowSlugModal(false);
      } else {
        const errorData = await response.json();
        throw new Error(errorData.error || "Failed to publish template");
      }
    } catch (error: unknown) {
      console.error("Error publishing template:", error);
      toast.error(error.message || "Failed to publish wedding page");
    } finally {
      setIsPublishing(false);
    }
  };

  const handleDelete = async () => {
    if (!weddingPage) return;

    setIsSaving(true);
    try {
      const response = await fetch("/api/wedding-pages/delete", {
        method: "DELETE",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          brideName: deleteConfirmation.brideName,
          groomName: deleteConfirmation.groomName,
        }),
      });

      if (response.ok) {
        toast.success("Wedding page deleted successfully!");

        if (onWeddingPageUpdate) {
          onWeddingPageUpdate(null);
        }

        if (onUserTemplateUpdate) {
          onUserTemplateUpdate(null);
        }

        setShowDeleteModal(false);
      } else {
        const errorData = await response.json();
        throw new Error(errorData.error || "Failed to delete wedding page");
      }
    } catch (error: unknown) {
      console.error("Error deleting wedding page:", error);
      toast.error(error.message || "Failed to delete wedding page");
    } finally {
      setIsSaving(false);
    }
  };

  const openEditModal = (section: { id: string; type: string }) => {
    // Only allow editing for hero and story sections
    if (!section.type.includes("HERO") && !section.type.includes("STORY")) {
      return;
    }

    setSelectedSection(section);
    setShowEditModal(true);
  };

  const handleSectionContentUpdate = (sectionId: string, content: Record<string, unknown>) => {
    onContentUpdate(sectionId, content);
  };

  const renderSectionContent = (section: {
    id: string;
    type: string;
    components: Record<string, unknown>;
  }) => {
    const content = userTemplate?.content?.[section.id] || section.components || {};

    switch (section.type) {
      case "HERO":
        return (
          <div className="text-center">
            <h1 className="text-2xl md:text-4xl font-bold mb-2">
              {content.title ||
                `${userData.groomName || "Groom"} & ${userData.brideName || "Bride"}`}
            </h1>
            <div className="flex items-center justify-center gap-2 text-lg md:text-xl">
              <Calendar className="h-5 w-5" />
              <p>{content.subtitle || content.date || userData.weddingDate}</p>
            </div>
            {(content.venue || content.location || userData.venue) && (
              <div className="flex items-center justify-center gap-2 text-sm md:text-base mt-2">
                <MapPin className="h-4 w-4" />
                <p>{content.venue || content.location || userData.venue}</p>
              </div>
            )}
          </div>
        );
      case "STORY":
        return (
          <div>
            <h2 className="text-xl md:text-2xl font-semibold mb-2 flex items-center gap-2">
              <Heart className="h-5 w-5 text-pink-500" />
              {content.title || "Our Story"}
            </h2>
            <p className="text-sm md:text-base">
              {content.text || content.content || "Your love story goes here..."}
            </p>
          </div>
        );
      case "GALLERY":
        return (
          <div>
            <h2 className="text-xl md:text-2xl font-semibold mb-2">Photo Gallery</h2>
            <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
              {((content.images as string[]) || [1, 2, 3]).map((img: string | number, i: number) =>
                typeof img === "string" ? (
                  <div key={i} className="aspect-square relative bg-gray-200 rounded">
                    <div className="absolute inset-0 flex items-center justify-center text-gray-500">
                      Image {i + 1}
                    </div>
                  </div>
                ) : (
                  <div key={i} className="aspect-square bg-gray-200 rounded"></div>
                )
              )}
            </div>
          </div>
        );
      case "REGISTRY":
        return (
          <div>
            <h2 className="text-xl md:text-2xl font-semibold mb-2 flex items-center gap-2">
              <Gift className="h-5 w-5 text-amber-500" />
              Gift Registry
            </h2>
            <p className="text-sm md:text-base">
              {content.content || "Browse our gift registry..."}
            </p>
          </div>
        );
      case "WISHES":
        return (
          <div>
            <h2 className="text-xl md:text-2xl font-semibold mb-2 flex items-center gap-2">
              <Users className="h-5 w-5 text-blue-500" />
              Guest Wishes
            </h2>
            <p className="text-sm md:text-base">
              {content.content || "Leave your wishes for the couple..."}
            </p>
          </div>
        );
      default:
        return <div>{section.type} section preview</div>;
    }
  };

  return (
    <>
      {/* Header with template name and actions */}
      <div
        className={`flex flex-col md:flex-row items-center justify-between p-4 rounded-xl mb-4 ${
          isDarkMode ? "bg-slate-800 border-slate-700" : "bg-white border-slate-200"
        } border shadow-lg gap-4 md:gap-0`}
      >
        <div>
          <h2 className={`text-xl font-semibold ${isDarkMode ? "text-white" : "text-slate-900"}`}>
            Editing: {selectedTemplate.name}
          </h2>
          <p className={`text-sm ${isDarkMode ? "text-slate-400" : "text-slate-600"}`}>
            Customize your wedding website with your details
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={(e) => {
              e.preventDefault();
              e.stopPropagation();
              saveTemplateContent();
            }}
            disabled={isSaving}
            type="button"
            className={`flex items-center gap-2 px-3 py-1.5 md:px-4 md:py-2 rounded-lg transition-colors text-sm ${
              isSaving ? "bg-gray-400 cursor-not-allowed" : "bg-indigo-600 hover:bg-indigo-700"
            } text-white`}
          >
            <Save className="h-3 w-3 md:h-4 md:w-4" />
            {isSaving ? "Saving..." : "Save Changes"}
          </motion.button>

          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={() => setShowPreviewModal(true)}
            className={`flex items-center gap-2 px-3 py-1.5 md:px-4 md:py-2 rounded-lg transition-colors text-sm ${
              isDarkMode
                ? "bg-slate-700 text-slate-300 hover:bg-slate-600"
                : "bg-slate-200 text-slate-700 hover:bg-slate-300"
            }`}
          >
            <Eye className="h-3 w-3 md:h-4 md:w-4" />
            Preview
          </motion.button>

          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={(e) => {
              e.preventDefault();
              e.stopPropagation();
              publishTemplate();
            }}
            disabled={isSaving || isPublishing}
            type="button"
            className={`flex items-center gap-2 px-3 py-1.5 md:px-4 md:py-2 rounded-lg transition-colors text-sm ${
              isSaving || isPublishing
                ? "bg-gray-400 cursor-not-allowed"
                : weddingPage && weddingPage.is_live
                  ? "bg-green-600 hover:bg-green-700"
                  : "bg-purple-600 hover:bg-purple-700"
            } text-white`}
          >
            <Download className="h-3 w-3 md:h-4 md:w-4" />
            {isPublishing
              ? "Publishing..."
              : weddingPage && weddingPage.is_live
                ? "Update Live Site"
                : "Publish"}
          </motion.button>

          {weddingPage && weddingPage.is_live && (
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => setShowDeleteModal(true)}
              disabled={isSaving}
              className="flex items-center gap-2 px-3 py-1.5 md:px-4 md:py-2 rounded-lg transition-colors text-sm bg-red-600 hover:bg-red-700 text-white"
            >
              <Trash2 className="h-3 w-3 md:h-4 md:w-4" />
              Delete
            </motion.button>
          )}
        </div>
      </div>

      {/* Published URL Display */}
      {weddingPage && weddingPage.is_live && (
        <div
          className={`mt-4 p-4 rounded-lg border ${isDarkMode ? "bg-green-900/20 border-green-700" : "bg-green-50 border-green-200"}`}
        >
          <div className="flex items-center gap-2 mb-2">
            <CheckCircle className="h-4 w-4 text-green-600" />
            <span
              className={`text-sm font-medium ${isDarkMode ? "text-green-300" : "text-green-800"}`}
            >
              Your wedding page is live!
            </span>
          </div>
          <div className="flex items-center gap-2">
            <span className={`text-sm ${isDarkMode ? "text-slate-400" : "text-slate-600"}`}>
              URL:
            </span>
            <a
              href={`${process.env.NEXT_PUBLIC_APP_URL}/${weddingPage.slug}`}
              target="_blank"
              rel="noopener noreferrer"
              className={`text-sm font-mono ${isDarkMode ? "text-blue-300 hover:text-blue-200" : "text-blue-600 hover:text-blue-700"} underline`}
            >
              {process.env.NEXT_PUBLIC_APP_URL}/{weddingPage.slug}
            </a>
            <button
              onClick={() =>
                navigator.clipboard.writeText(
                  `${process.env.NEXT_PUBLIC_APP_URL}/${weddingPage.slug}`
                )
              }
              className="text-xs bg-blue-100 text-blue-700 px-2 py-1 rounded hover:bg-blue-200"
            >
              Copy
            </button>
          </div>
        </div>
      )}

      {/* Edit Details Modal */}
      {selectedSection && (
        <EditWeddingDetailsModal
          isOpen={showEditModal}
          onClose={() => {
            setShowEditModal(false);
            setSelectedSection(null);
          }}
          section={selectedSection}
          templateId={selectedTemplate.id}
          onSave={async (sectionId, content) => {
            await handleSectionContentUpdate(sectionId, content);
            setShowEditModal(false);
          }}
          isSaving={isSaving}
        />
      )}

      {/* Template Editor Content */}
      <div className="flex-1 overflow-auto">
        <div className="mx-auto max-w-full">
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className={`min-h-64 md:min-h-96 rounded-xl border-2 border-dashed ${
              isDarkMode ? "border-slate-600 bg-slate-800/50" : "border-slate-300 bg-slate-50"
            }`}
          >
            <div className="p-4 md:p-6 space-y-4 md:space-y-6">
              <AnimatePresence>
                {selectedTemplate.sections?.map((section) => {
                  const isEdited = editedSections.includes(section.id);
                  const sectionStatusData = sectionStatus.find((s) => s.sectionId === section.id);
                  const isComplete = sectionStatusData?.isComplete || false;

                  return (
                    <motion.div
                      key={section.id}
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -20 }}
                      transition={{ type: "spring", stiffness: 300, damping: 30 }}
                      className={`relative p-4 md:p-6 rounded-xl border-2 border-dashed transition-all duration-300 cursor-pointer group ${
                        isComplete ? "border-green-400 bg-green-50 dark:bg-green-900/20" : ""
                      }`}
                      onClick={() => openEditModal(section)}
                      style={{
                        backgroundColor: selectedColorScheme?.background,
                        color: selectedColorScheme?.text,
                        borderColor: isComplete ? "#10b981" : selectedColorScheme?.primary,
                      }}
                    >
                      {isComplete && (
                        <div className="absolute top-2 right-2 z-10 bg-green-100 text-green-800 text-xs px-2 py-1 rounded-full flex items-center gap-1">
                          <CheckCircle className="h-3 w-3" />
                          Complete
                        </div>
                      )}
                      {isEdited && !isComplete && (
                        <div className="absolute top-2 right-2 z-10 bg-blue-100 text-blue-800 text-xs px-2 py-1 rounded-full flex items-center gap-1">
                          <Edit className="h-3 w-3" />
                          Edited
                        </div>
                      )}

                      <div className="flex items-center justify-between mb-3">
                        <div className="flex items-center gap-2">
                          <motion.div
                            className={`p-1.5 rounded-lg ${isComplete ? "bg-green-500" : ""}`}
                            whileHover={{ rotate: 10 }}
                            style={{
                              background: isComplete
                                ? "#10b981"
                                : `linear-gradient(to right, ${selectedColorScheme?.primary}, ${selectedColorScheme?.secondary})`,
                            }}
                          >
                            {/* Icons based on section type */}
                            {section.type === "HERO" && <Heart className="h-4 w-4 text-white" />}
                            {section.type === "STORY" && (
                              <FileText className="h-4 w-4 text-white" />
                            )}
                            {section.type === "GALLERY" && (
                              <ImageIcon className="h-4 w-4 text-white" />
                            )}
                            {section.type === "REGISTRY" && <Gift className="h-4 w-4 text-white" />}
                            {section.type === "WISHES" && <Users className="h-4 w-4 text-white" />}
                          </motion.div>
                          <h3 className="text-sm font-medium">
                            {section.type.charAt(0) + section.type.slice(1).toLowerCase()}
                          </h3>
                        </div>
                        {/* Edit button for editable sections */}
                        {(section.type === "HERO" || section.type === "STORY") && (
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              openEditModal(section);
                            }}
                            className="text-xs bg-blue-100 text-blue-700 px-2 py-1 rounded opacity-0 group-hover:opacity-100 transition-opacity"
                          >
                            <Edit className="h-3 w-3" />
                          </button>
                        )}
                      </div>

                      <div className="text-xs md:text-sm">{renderSectionContent(section)}</div>
                    </motion.div>
                  );
                })}
              </AnimatePresence>
            </div>
          </motion.div>
        </div>
      </div>

      {/* Preview Modal */}
      <Modal isOpen={showPreviewModal} onClose={() => setShowPreviewModal(false)} size="xl">
        <div className={`p-6 h-full ${isDarkMode ? "bg-slate-900" : "bg-white"}`}>
          <div className="flex items-center justify-between mb-6">
            <h2 className={`text-xl font-semibold ${isDarkMode ? "text-white" : "text-slate-900"}`}>
              Template Preview
            </h2>
            <motion.button
              whileHover={{ rotate: 90 }}
              onClick={() => setShowPreviewModal(false)}
              className={`p-1 rounded-full ${isDarkMode ? "hover:bg-slate-700" : "hover:bg-slate-100"}`}
            >
              <X className="h-5 w-5" />
            </motion.button>
          </div>

          <div className="h-[calc(100%-4rem)] overflow-auto">
            <DynamicTemplateRenderer
              template={selectedTemplate}
              userPlan={userPlan || { id: "default", name: "Default", maxComponents: 10 }}
              userData={userData}
              colorScheme={selectedColorScheme || userTemplate?.colorScheme}
              editable={false}
            />
          </div>
        </div>
      </Modal>

      {/* Slug Modal */}
      <Modal isOpen={showSlugModal} onClose={() => setShowSlugModal(false)}>
        <div
          className={`p-6 rounded-xl max-w-md mx-auto ${isDarkMode ? "bg-slate-800" : "bg-white"}`}
        >
          <div className="flex items-center justify-between mb-6">
            <h2 className={`text-xl font-semibold ${isDarkMode ? "text-white" : "text-slate-900"}`}>
              Create Your Wedding Page
            </h2>
            <motion.button
              whileHover={{ rotate: 90 }}
              onClick={() => setShowSlugModal(false)}
              className={`p-1 rounded-full ${isDarkMode ? "hover:bg-slate-700" : "hover:bg-slate-100"}`}
            >
              <X className="h-5 w-5" />
            </motion.button>
          </div>

          <div className="space-y-4">
            <div>
              <label
                className={`block text-sm mb-2 ${isDarkMode ? "text-slate-400" : "text-slate-600"}`}
              >
                Wedding Page URL
              </label>
              <div className="flex items-center gap-2">
                <span className={`text-sm ${isDarkMode ? "text-slate-400" : "text-slate-600"}`}>
                  {process.env.NEXT_PUBLIC_APP_URL}/
                </span>
                <input
                  type="text"
                  value={slug}
                  onChange={(e) => setSlug(e.target.value)}
                  className={`flex-1 px-3 py-2 rounded-lg border text-sm ${
                    isDarkMode
                      ? "bg-slate-700 border-slate-600 text-white"
                      : "bg-white border-slate-300 text-slate-900"
                  }`}
                  placeholder="your-wedding-slug"
                />
              </div>
              <p className={`text-xs mt-1 ${isDarkMode ? "text-slate-500" : "text-slate-500"}`}>
                This will be your unique wedding page URL
              </p>
            </div>

            <motion.button
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              onClick={() => handlePublish(slug)}
              disabled={isPublishing || !slug.trim()}
              className={`w-full px-4 py-2 rounded-lg text-white text-sm ${
                isDarkMode ? "bg-blue-600 hover:bg-blue-700" : "bg-blue-600 hover:bg-blue-700"
              } disabled:opacity-50 disabled:cursor-not-allowed`}
            >
              {isPublishing ? "Publishing..." : "Publish Wedding Page"}
            </motion.button>
          </div>
        </div>
      </Modal>

      {/* Delete Confirmation Modal */}
      <Modal isOpen={showDeleteModal} onClose={() => setShowDeleteModal(false)}>
        <div
          className={`p-6 rounded-xl max-w-md mx-auto ${isDarkMode ? "bg-slate-800" : "bg-white"}`}
        >
          <div className="flex items-center justify-between mb-6">
            <h2 className={`text-xl font-semibold ${isDarkMode ? "text-white" : "text-slate-900"}`}>
              Delete Wedding Page
            </h2>
            <motion.button
              whileHover={{ rotate: 90 }}
              onClick={() => setShowDeleteModal(false)}
              className={`p-1 rounded-full ${isDarkMode ? "hover:bg-slate-700" : "hover:bg-slate-100"}`}
            >
              <X className="h-5 w-5" />
            </motion.button>
          </div>

          <div className="space-y-4">
            <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg p-4">
              <p className={`text-sm ${isDarkMode ? "text-red-300" : "text-red-700"}`}>
                <strong>Warning:</strong> This action cannot be undone. This will permanently delete
                your wedding page and template.
              </p>
            </div>

            <div className="space-y-3">
              <div>
                <label
                  className={`block text-sm mb-1 ${isDarkMode ? "text-slate-400" : "text-slate-600"}`}
                >
                  Enter Bride&apos;s Name to Confirm
                </label>
                <input
                  type="text"
                  value={deleteConfirmation.brideName}
                  onChange={(e) =>
                    setDeleteConfirmation({ ...deleteConfirmation, brideName: e.target.value })
                  }
                  className={`w-full px-3 py-2 rounded-lg border text-sm ${
                    isDarkMode
                      ? "bg-slate-700 border-slate-600 text-white"
                      : "bg-white border-slate-300 text-slate-900"
                  }`}
                  placeholder="Bride's name"
                />
              </div>
              <div>
                <label
                  className={`block text-sm mb-1 ${isDarkMode ? "text-slate-400" : "text-slate-600"}`}
                >
                  Enter Groom&apos;s Name to Confirm
                </label>
                <input
                  type="text"
                  value={deleteConfirmation.groomName}
                  onChange={(e) =>
                    setDeleteConfirmation({ ...deleteConfirmation, groomName: e.target.value })
                  }
                  className={`w-full px-3 py-2 rounded-lg border text-sm ${
                    isDarkMode
                      ? "bg-slate-700 border-slate-600 text-white"
                      : "bg-white border-slate-300 text-slate-900"
                  }`}
                  placeholder="Groom's name"
                />
              </div>
            </div>

            <div className="flex gap-3">
              <motion.button
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                onClick={() => setShowDeleteModal(false)}
                className={`flex-1 px-4 py-2 rounded-lg text-sm ${
                  isDarkMode
                    ? "bg-slate-600 hover:bg-slate-700 text-white"
                    : "bg-slate-200 hover:bg-slate-300 text-slate-700"
                }`}
              >
                Cancel
              </motion.button>
              <motion.button
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                onClick={handleDelete}
                disabled={isSaving}
                className="flex-1 px-4 py-2 rounded-lg text-sm bg-red-600 hover:bg-red-700 text-white disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isSaving ? "Deleting..." : "Delete Forever"}
              </motion.button>
            </div>
          </div>
        </div>
      </Modal>

      {/* Template Preview Modal */}
      {selectedTemplate && (
        <TemplatePreviewModal
          isOpen={showPreviewModal}
          onClose={() => setShowPreviewModal(false)}
          template={selectedTemplate}
          userTemplate={userTemplate ?? undefined}
          weddingPage={weddingPage ?? undefined}
          userPlan={userPlan ?? undefined}
          isSelect={true} // This is customize mode, so show dynamic preview
        />
      )}
    </>
  );
};

export default TemplateEditor;
