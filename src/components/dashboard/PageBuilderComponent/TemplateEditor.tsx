"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useTheme } from "@/contexts/ThemeContext";
import { useCSRFToken } from "@/hooks/useCSRFToken";
import { ColorScheme } from "@/lib/component-registry";
import { SectionType } from "@/generated/prisma";
import {
  injectCSSVariables,
  removeCSSVariables,
} from "@/lib/css-variable-injection";
import { loadFontsFromScheme } from "@/lib/font-utils";
import type { FontScheme } from "@/types/customization";
import {
  Eye,
  Save,
  Download,
  Edit,
  Heart,
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
import { UserTemplate, Template, UserPlan, WeddingPage } from "@/types/wedding";
import toast from "react-hot-toast";

interface TemplateEditorProps {
  userTemplate: UserTemplate | null;
  selectedTemplate: Template | null;
  weddingPage: WeddingPage | null;
  userPlan: UserPlan | null;
  onTemplateUpdate: (template: Template) => void;
  onContentUpdate: (
    sectionId: string,
    content: Record<string, unknown>
  ) => void;
  editedSections: string[];
  onWeddingPageUpdate?: (weddingPage: WeddingPage | null) => void;
  onUserTemplateUpdate?: (userTemplate: UserTemplate | null) => void;
  setActiveTab?: (tab: string) => void;
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
  setActiveTab,
}: TemplateEditorProps) => {
  const { isDarkMode } = useTheme();
  const { token: csrfToken } = useCSRFToken();
  const [selectedSection, setSelectedSection] = useState<{
    id: string;
    type: string;
  } | null>(null);
  const [selectedColorScheme] = useState<ColorScheme | null>(null);
  const [isSaving, setIsSaving] = useState(false);
  const [isPublishing, setIsPublishing] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [showPreviewModal, setShowPreviewModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [showSlugModal, setShowSlugModal] = useState(false);
  const [slug, setSlug] = useState("");
  const [sectionStatus, setSectionStatus] = useState<
    Array<{
      sectionId: string;
      type: string;
      isComplete: boolean;
      hasContent: boolean;
    }>
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
    heroImage: undefined as string | undefined,
    storyImage: undefined as string | undefined,
    gallery: [] as Array<{
      id: string;
      url: string;
      title?: string;
      category?: string;
    }>,
    gifts: [] as Array<{
      id: string;
      item: string;
      price: string;
      image: string;
      purchased: boolean;
    }>,
    guests: [] as Array<{
      id: string;
      name: string;
      email?: string;
      phone?: string;
      rsvp?: "yes" | "no" | "pending";
    }>,
    bankDetails: {} as Record<string, unknown>,
    id: "",
  });

  useEffect(() => {
    // Fetch user data for the template
    const fetchUserData = async () => {
      try {
        const response = await fetch("/api/wedding-data");
        if (response.ok) {
          const data = await response.json();
          console.log(
            "TemplateEditor - API response wedding date:",
            data.userData?.weddingDate
          );
          setUserData({
            ...data.userData,
            // Ensure we have all required fields with fallbacks
            brideName: data.userData?.brideName || "Bride",
            groomName: data.userData?.groomName || "Groom",
            weddingDate:
              data.userData?.weddingDate ||
              new Date().toLocaleDateString("en-US", {
                year: "numeric",
                month: "long",
                day: "numeric",
              }),
            venue: data.userData?.venue || "Venue",
            heroImage: data.userData?.heroImage || undefined,
            storyImage: data.userData?.storyImage || undefined,
            gallery: data.userData?.gallery || [],
            gifts: data.userData?.gifts || [],
            guests: data.userData?.guests || [],
            bankDetails: data.userData?.bankDetails || {},
            id: data.userData?.id || "",
          });
          console.log("TemplateEditor - Final userData state:", {
            weddingDate:
              data.userData?.weddingDate ||
              new Date().toLocaleDateString("en-US", {
                year: "numeric",
                month: "long",
                day: "numeric",
              }),
          });
        }
      } catch (error) {
        console.error("Error fetching user data:", error);
        // Set fallback data on error
        setUserData({
          brideName: "Bride",
          groomName: "Groom",
          weddingDate: new Date().toLocaleDateString("en-US", {
            year: "numeric",
            month: "long",
            day: "numeric",
          }),
          venue: "Venue",
          heroImage: undefined,
          storyImage: undefined,
          gallery: [],
          gifts: [],
          guests: [],
          bankDetails: {},
          id: "",
        });
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

  // Inject CSS variables for preview modal when customization exists
  useEffect(() => {
    if (!showPreviewModal || !userTemplate?.colorScheme) return;

    const customization = userTemplate.colorScheme as {
      colors?: {
        primary: string;
        secondary: string;
        accent: string;
        background: string;
        text: string;
        buttonPrimary: string;
        buttonPrimaryText: string;
        buttonPrimaryHover: string;
        buttonSecondary: string;
        buttonSecondaryText: string;
        buttonSecondaryHover: string;
      };
      fonts?: { heading: string; body: string; script: string };
    };

    if (!customization.colors || !customization.fonts) return;

    // Load fonts
    loadFontsFromScheme(customization.fonts as FontScheme);

    // Inject CSS variables into the preview container
    const containerId = "template-editor-preview";
    const element = document.getElementById(containerId);
    if (element) {
      injectCSSVariables(
        containerId,
        customization.colors,
        customization.fonts as FontScheme
      );
    }

    // Cleanup on unmount or when modal closes
    return () => {
      removeCSSVariables(containerId);
    };
  }, [showPreviewModal, userTemplate?.colorScheme]);

  if (!selectedTemplate) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600"></div>
      </div>
    );
  }

  // Debug logging
  console.log("TemplateEditor - selectedTemplate:", selectedTemplate);
  console.log(
    "TemplateEditor - selectedTemplate.sections:",
    selectedTemplate.sections
  );
  console.log("TemplateEditor - userTemplate:", userTemplate);
  console.log("TemplateEditor - userTemplate.content:", userTemplate?.content);
  console.log("TemplateEditor - userData:", userData);

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
        credentials: "include",
        headers: {
          "Content-Type": "application/json",
          "x-csrf-token": csrfToken || "",
        },
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
      const publishData = {
        templateId: selectedTemplate.id,
        content: userTemplate?.content || {},
        colorScheme: selectedColorScheme || userTemplate?.colorScheme,
        title: `${userData.groomName || "Groom"} & ${userData.brideName || "Bride"} Wedding`,
        slug: customSlug || slug,
      };

      console.log("TemplateEditor - Publishing with data:", publishData);
      console.log(
        "TemplateEditor - userTemplate content:",
        userTemplate?.content
      );

      const response = await fetch("/api/wedding-pages/publish", {
        method: "POST",
        credentials: "include",
        headers: {
          "Content-Type": "application/json",
          "x-csrf-token": csrfToken || "",
        },
        body: JSON.stringify(publishData),
      });

      console.log("TemplateEditor - Response status:", response.status);
      console.log("TemplateEditor - Response ok:", response.ok);

      if (response.ok) {
        const data = await response.json();
        console.log("TemplateEditor - Response data:", data);
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
        console.error("TemplateEditor - Error response:", errorData);
        throw new Error(errorData.error || "Failed to publish template");
      }
    } catch (err: unknown) {
      console.error("Error publishing template:", err);
      toast.error(
        (err as Error)?.message ||
          String(err) ||
          "Failed to publish wedding page"
      );
    } finally {
      setIsPublishing(false);
    }
  };

  const handleUpdateLiveSite = async () => {
    if (!selectedTemplate) return;

    setIsPublishing(true);
    try {
      const response = await fetch("/api/wedding-pages/update-live", {
        method: "POST",
        credentials: "include",
        headers: {
          "Content-Type": "application/json",
          "x-csrf-token": csrfToken || "",
        },
        body: JSON.stringify({
          templateId: selectedTemplate.id,
        }),
      });

      if (response.ok) {
        const data = await response.json();
        toast.success("Live site updated successfully!");

        if (onWeddingPageUpdate) {
          onWeddingPageUpdate(data.weddingPage);
        }
      } else {
        const errorData = await response.json();
        throw new Error(errorData.error || "Failed to update live site");
      }
    } catch (err: unknown) {
      console.error("Error updating live site:", err);
      toast.error(
        (err as Error)?.message || String(err) || "Failed to update live site"
      );
    } finally {
      setIsPublishing(false);
    }
  };

  const handleDelete = async () => {
    if (!weddingPage) return;

    setIsDeleting(true);
    try {
      const response = await fetch("/api/wedding-pages/delete", {
        method: "DELETE",
        credentials: "include",
        headers: {
          "Content-Type": "application/json",
          "x-csrf-token": csrfToken || "",
        },
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
    } catch (err: unknown) {
      console.error("Error deleting wedding page:", err);
      toast.error(
        (err as Error)?.message ||
          String(err) ||
          "Failed to delete wedding page"
      );
    } finally {
      setIsDeleting(false);
    }
  };

  const openEditModal = (section: { id: string; type: string }) => {
    // Check if wedding page is soft deleted - disable editing
    if (weddingPage && weddingPage.deleted_at) {
      toast.error(
        "Cannot edit deleted wedding page. Please restore your subscription to continue editing."
      );
      return;
    }

    // Only allow editing for hero and story sections
    if (!section.type.includes("HERO") && !section.type.includes("STORY")) {
      return;
    }

    setSelectedSection(section);
    setShowEditModal(true);
  };

  const handleSectionContentUpdate = (
    sectionId: string,
    content: Record<string, unknown>
  ) => {
    console.log(
      "TemplateEditor - handleSectionContentUpdate called with:",
      sectionId,
      content
    );
    onContentUpdate(sectionId, content);
  };

  const renderSectionContent = (section: {
    id: string;
    type: string;
    components: Record<string, unknown>;
  }) => {
    const content =
      (userTemplate?.content?.[section.id] as
        | Record<string, unknown>
        | undefined) ||
      (section.components as Record<string, unknown> | undefined) ||
      {};

    const renderText = (
      value: unknown,
      fallback?: string
    ): string | undefined => {
      if (value === null || value === undefined) return fallback ?? undefined;
      if (
        typeof value === "string" ||
        typeof value === "number" ||
        typeof value === "boolean"
      )
        return String(value);
      return fallback ?? undefined;
    };

    switch (section.type) {
      case "HERO":
        return (
          <div className="text-center">
            <h1
              className={`text-2xl md:text-4xl font-bold mb-2 ${isDarkMode ? "text-white" : "text-black"}`}
            >
              {renderText(
                content.title,
                `${userData.brideName || "Bride"} & ${userData.groomName || "Groom"}`
              )}
            </h1>
            <div
              className={`flex items-center justify-center gap-2 text-lg md:text-xl ${isDarkMode ? "text-white" : "text-black"}`}
            >
              <Calendar className="h-5 w-5" />
              <p>
                {renderText(
                  content.subtitle,
                  renderText(content.date, userData.weddingDate)
                )}
              </p>
            </div>
            {(content.venue || content.location || userData.venue) && (
              <div
                className={`flex items-center justify-center gap-2 text-sm md:text-base mt-2 ${isDarkMode ? "text-white" : "text-black"}`}
              >
                <MapPin className="h-4 w-4" />
                <p>
                  {renderText(
                    content.venue,
                    renderText(content.location, userData.venue)
                  )}
                </p>
              </div>
            )}
          </div>
        );
      case "STORY":
        return (
          <div>
            <h2
              className={`text-xl md:text-2xl font-semibold mb-2 flex items-center gap-2 ${isDarkMode ? "text-white" : "text-black"}`}
            >
              <Heart className="h-5 w-5 text-pink-500" />
              {renderText(content.title, "Our Story")}
            </h2>
            <p
              className={`text-sm md:text-base ${isDarkMode ? "text-white" : "text-black"}`}
            >
              {renderText(
                content.text,
                renderText(content.content, "Your love story goes here...")
              )}
            </p>
          </div>
        );
      case "GALLERY":
        return (
          <div
            onClick={(e) => {
              e.stopPropagation();
              if (setActiveTab) {
                setActiveTab("gallery");
              }
            }}
          >
            <h2
              className={`text-xl md:text-2xl font-semibold mb-2 cursor-pointer transition-colors flex items-center gap-2  ${isDarkMode ? "text-white" : "text-black"}`}
            >
              Photo Gallery
            </h2>
            <p
              className={`text-sm md:text-base ${isDarkMode ? "text-white" : "text-black"}`}
            >
              {renderText(content.content, "Add photos and videos ...")}
            </p>
          </div>
        );
      case "REGISTRY":
        return (
          <div
            onClick={(e) => {
              e.stopPropagation();
              if (setActiveTab) {
                setActiveTab("gift");
              }
            }}
          >
            <h2
              className={`text-xl md:text-2xl font-semibold mb-2 flex items-center cursor-pointer gap-2 ${isDarkMode ? "text-white" : "text-black"}`}
            >
              <Gift className="h-5 w-5 text-amber-500" />
              Gift Registry
            </h2>
            <p
              className={`text-sm md:text-base ${isDarkMode ? "text-white" : "text-black"}`}
            >
              {renderText(content.content, "Browse our gift registry...")}
            </p>
          </div>
        );
      case "WISHES":
        return (
          <div
            onClick={(e) => {
              e.stopPropagation();
              if (setActiveTab) {
                setActiveTab("gift:comments");
              }
            }}
          >
            <h2
              className={`text-xl md:text-2xl font-semibold mb-2 flex items-center gap-2 cursor-pointer transition-colors ${isDarkMode ? "text-white" : "text-black"}`}
            >
              <Users className="h-5 w-5 text-blue-500" />
              Guest Wishes
            </h2>
            <p
              className={`text-sm md:text-base ${isDarkMode ? "text-white" : "text-black"}`}
            >
              {renderText(
                content.content,
                "Leave your wishes for the couple..."
              )}
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
          isDarkMode
            ? "bg-slate-800 border-slate-700"
            : "bg-white border-slate-200"
        } border shadow-lg gap-4 md:gap-0`}
      >
        <div>
          <h2
            className={`text-xl font-semibold ${isDarkMode ? "text-white" : "text-slate-900"}`}
          >
            Editing: {selectedTemplate.name}
          </h2>
          <p
            className={`text-sm ${isDarkMode ? "text-slate-400" : "text-slate-600"}`}
          >
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
            disabled={
              isSaving ||
              (weddingPage?.deleted_at !== null &&
                weddingPage?.deleted_at !== undefined)
            }
            type="button"
            className={`flex items-center gap-2 px-3 py-1.5 md:px-4 md:py-2 rounded-lg transition-colors text-sm ${
              isSaving
                ? "bg-gray-400 cursor-not-allowed"
                : "bg-indigo-600 hover:bg-indigo-700"
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
              if (weddingPage && weddingPage.is_live) {
                handleUpdateLiveSite();
              } else {
                publishTemplate();
              }
            }}
            disabled={
              isSaving ||
              isPublishing ||
              (weddingPage?.deleted_at !== null &&
                weddingPage?.deleted_at !== undefined)
            }
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
              disabled={isDeleting}
              className="flex items-center gap-2 px-3 py-1.5 md:px-4 md:py-2 rounded-lg transition-colors text-sm bg-red-600 hover:bg-red-700 text-white disabled:opacity-50 disabled:cursor-not-allowed"
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
            <span
              className={`text-sm ${isDarkMode ? "text-slate-400" : "text-slate-600"}`}
            >
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
          weddingPage={weddingPage}
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
              isDarkMode
                ? "border-slate-600 bg-slate-800/50"
                : "border-slate-300 bg-slate-50"
            }`}
          >
            <div className="p-4 md:p-6 space-y-4 md:space-y-6">
              <AnimatePresence>
                {selectedTemplate.sections?.map((section) => {
                  const isEdited = editedSections.includes(section.id);
                  const sectionStatusData = sectionStatus.find(
                    (s) => s.sectionId === section.id
                  );
                  const isComplete = sectionStatusData?.isComplete || false;

                  return (
                    <motion.div
                      key={section.id}
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -20 }}
                      transition={{
                        type: "spring",
                        stiffness: 300,
                        damping: 30,
                      }}
                      className={`relative p-4 md:p-6 rounded-xl border-2 border-dashed transition-all duration-300 cursor-pointer group ${isDarkMode ? "hover:bg-slate-800" : "hover:bg-slate-300"} ${
                        isComplete
                          ? "border-green-400 bg-green-50 dark:bg-green-900/20"
                          : ""
                      }`}
                      onClick={() => openEditModal(section)}
                      style={{
                        backgroundColor: selectedColorScheme?.background,
                        color: selectedColorScheme?.text,
                        borderColor: isComplete
                          ? "#10b981"
                          : selectedColorScheme?.primary,
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
                          ></motion.div>
                          {/* <h3 className="text-sm font-medium text-black">
                            {section.type.charAt(0) + section.type.slice(1).toLowerCase()}
                          </h3> */}
                        </div>
                        {/* Edit button for editable sections */}
                        {(section.type === "HERO" ||
                          section.type === "STORY") && (
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

                      <div className="text-xs md:text-sm">
                        {renderSectionContent(section)}
                      </div>
                    </motion.div>
                  );
                })}
              </AnimatePresence>
            </div>
          </motion.div>
        </div>
      </div>

      {/* Preview Modal */}
      <Modal
        isOpen={showPreviewModal}
        onClose={() => setShowPreviewModal(false)}
        maxWidth="max-w-[95vw]"
      >
        <div
          className={`p-6 h-full ${isDarkMode ? "bg-slate-900" : "bg-white"}`}
        >
          <div className="flex items-center justify-between mb-6">
            <h2
              className={`text-xl font-semibold ${isDarkMode ? "text-white" : "text-slate-900"}`}
            >
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

          <div
            id="template-editor-preview"
            className="h-[calc(100%-4rem)] overflow-auto"
          >
            <DynamicTemplateRenderer
              template={{
                ...selectedTemplate,
                sections: selectedTemplate.sections.map((section) => ({
                  ...section,
                  layout:
                    (section as unknown as { layout?: string }).layout ??
                    (section.type as string),
                  type: section.type as unknown as SectionType,
                  order: (section as unknown as { order?: number }).order ?? 0,
                  components: {
                    ...(section.components || {}),
                    ...(userTemplate?.content?.[section.id] || {}), // Merge user's saved content
                  },
                })),
              }}
              userPlan={
                userPlan || {
                  id: "default",
                  name: "Default",
                  maxComponents: 10,
                }
              }
              userData={{
                ...userData,
                // Extract hero image from template content if available
                heroImage: (() => {
                  // First check if there's a hero image in the template content
                  const heroSection = selectedTemplate.sections?.find(
                    (s) => s.type === "HERO"
                  );
                  console.log("TemplateEditor - heroSection:", heroSection);
                  console.log(
                    "TemplateEditor - heroSection content:",
                    heroSection
                      ? userTemplate?.content?.[heroSection.id]
                      : "No hero section"
                  );

                  if (heroSection && userTemplate?.content?.[heroSection.id]) {
                    const sectionContent = userTemplate.content[
                      heroSection.id
                    ] as Record<string, unknown>;
                    if (sectionContent.heroImage) {
                      const heroImage = sectionContent.heroImage as string;
                      console.log(
                        "TemplateEditor - Using hero image from template content:",
                        heroImage
                      );
                      return heroImage;
                    }
                  }
                  // Fall back to userData.heroImage
                  console.log(
                    "TemplateEditor - Using hero image from userData:",
                    userData.heroImage
                  );
                  return userData.heroImage;
                })(),
                // Extract story image from template content if available
                storyImage: (() => {
                  const storySection = selectedTemplate.sections?.find(
                    (s) => s.type === "STORY"
                  );
                  if (
                    storySection &&
                    userTemplate?.content?.[storySection.id]
                  ) {
                    const sectionContent = userTemplate.content[
                      storySection.id
                    ] as Record<string, unknown>;
                    if (sectionContent.storyImage) {
                      return sectionContent.storyImage as string;
                    }
                  }
                  return userData.storyImage;
                })(),
                sections: (userTemplate?.content || {}) as Record<
                  string,
                  Record<string, unknown>
                >, // Pass userTemplate content as sections
              }}
              colorScheme={((): ColorScheme | undefined => {
                if (selectedColorScheme) return selectedColorScheme;
                const cs = userTemplate?.colorScheme as unknown;
                if (!cs || typeof cs !== "object") return undefined;
                const maybe = cs as Partial<ColorScheme>;
                if (
                  maybe.name &&
                  maybe.primary &&
                  maybe.secondary &&
                  maybe.background &&
                  maybe.text
                ) {
                  return maybe as ColorScheme;
                }
                return undefined;
              })()}
              editable={false}
              isPreview={true}
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
            <h2
              className={`text-xl font-semibold ${isDarkMode ? "text-white" : "text-slate-900"}`}
            >
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
                <span
                  className={`text-sm ${isDarkMode ? "text-slate-400" : "text-slate-600"}`}
                >
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
              <p
                className={`text-xs mt-1 ${isDarkMode ? "text-slate-500" : "text-slate-500"}`}
              >
                This will be your unique wedding page URL
              </p>
            </div>

            <motion.button
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              onClick={() => handlePublish(slug)}
              disabled={isPublishing || !slug.trim()}
              className={`w-full px-4 py-2 rounded-lg text-white text-sm ${
                isDarkMode
                  ? "bg-blue-600 hover:bg-blue-700"
                  : "bg-blue-600 hover:bg-blue-700"
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
            <h2
              className={`text-xl font-semibold ${isDarkMode ? "text-white" : "text-slate-900"}`}
            >
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
              <p
                className={`text-sm ${isDarkMode ? "text-red-300" : "text-red-700"}`}
              >
                <strong>Warning:</strong> This action cannot be undone. This
                will permanently delete your wedding page and template.
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
                    setDeleteConfirmation({
                      ...deleteConfirmation,
                      brideName: e.target.value,
                    })
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
                    setDeleteConfirmation({
                      ...deleteConfirmation,
                      groomName: e.target.value,
                    })
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
                disabled={isDeleting}
                className="flex-1 px-4 py-2 rounded-lg text-sm bg-red-600 hover:bg-red-700 text-white disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isDeleting ? "Deleting..." : "Delete Forever"}
              </motion.button>
            </div>
          </div>
        </div>
      </Modal>
    </>
  );
};

export default TemplateEditor;
