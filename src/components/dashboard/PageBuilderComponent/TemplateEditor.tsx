"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useTheme } from "@/contexts/ThemeContext";
import {
  Eye,
  Save,
  ExternalLink,
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
  onContentUpdate: (sectionId: string, content: any) => void;
  editedSections: string[];
}

const TemplateEditor = ({
  userTemplate,
  selectedTemplate,
  weddingPage,
  userPlan,
  onTemplateUpdate,
  onContentUpdate,
  editedSections = [],
}: TemplateEditorProps) => {
  const { isDarkMode } = useTheme();
  const [selectedSection, setSelectedSection] = useState<any>(null);
  const [selectedColorScheme, setSelectedColorScheme] = useState<any>(null);
  const [isSaving, setIsSaving] = useState(false);
  const [showPreviewModal, setShowPreviewModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
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

  if (!selectedTemplate) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600"></div>
      </div>
    );
  }

  const saveTemplateContent = async () => {
    setIsSaving(true);
    try {
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

      if (!response.ok) throw new Error("Failed to save template content");

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

    setIsSaving(true);
    try {
      const response = await fetch("/api/wedding-data", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          templateId: selectedTemplate.id,
          content: userTemplate?.content || {},
          colorScheme: selectedColorScheme || userTemplate?.colorScheme,
          title: `${userData.groomName || "Groom"} & ${userData.brideName || "Bride"} Wedding`,
          slug: `${userData.groomName || "groom"}-${userData.brideName || "bride"}-wedding`
            .toLowerCase()
            .replace(/\s+/g, "-"),
        }),
      });

      if (response.ok) {
        toast.success("Wedding page published successfully!");
      } else {
        throw new Error("Failed to publish template");
      }
    } catch (error) {
      console.error("Error publishing template:", error);
      toast.error("Failed to publish wedding page");
    } finally {
      setIsSaving(false);
    }
  };

  const openEditModal = (section: any) => {
    // Only allow editing for hero and story sections
    if (!section.type.includes("HERO") && !section.type.includes("STORY")) {
      return;
    }

    setSelectedSection(section);
    setShowEditModal(true);
  };

  const handleSectionContentUpdate = (sectionId: string, content: any) => {
    onContentUpdate(sectionId, content);
  };

  const renderSectionContent = (section: any) => {
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
              {(content.images || [1, 2, 3]).map((img: any, i: number) =>
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
            onClick={saveTemplateContent}
            disabled={isSaving}
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
            onClick={publishTemplate}
            disabled={isSaving}
            className={`flex items-center gap-2 px-3 py-1.5 md:px-4 md:py-2 rounded-lg transition-colors text-sm ${
              isSaving
                ? "bg-gray-400 cursor-not-allowed"
                : weddingPage && weddingPage.is_live
                  ? "bg-green-600 hover:bg-green-700"
                  : "bg-purple-600 hover:bg-purple-700"
            } text-white`}
          >
            <Download className="h-3 w-3 md:h-4 md:w-4" />
            {isSaving
              ? "Publishing..."
              : weddingPage && weddingPage.is_live
                ? "Update Live Site"
                : "Publish"}
          </motion.button>
        </div>
      </div>

      {/* Edit Details Modal */}
      {selectedSection && (
        <EditWeddingDetailsModal
          isOpen={showEditModal}
          onClose={() => {
            setShowEditModal(false);
            setSelectedSection(null);
          }}
          initialData={{
            brideName: userData.brideName || "",
            groomName: userData.groomName || "",
            weddingDate: userData.weddingDate || "",
            venue: userData.venue || "",
            story: userTemplate?.content?.[selectedSection.id]?.text || "",
            heroImage: userTemplate?.content?.[selectedSection.id]?.hero_image || "",
            storyImage: userTemplate?.content?.[selectedSection.id]?.story_image || "",
          }}
          onSave={async (formData) => {
            // Handle form submission
            const brideName = formData.get("brideName") as string;
            const groomName = formData.get("groomName") as string;
            const weddingDate = formData.get("weddingDate") as string;
            const venue = formData.get("venue") as string;
            const story = formData.get("story") as string;

            // Update user data
            setUserData({
              brideName,
              groomName,
              weddingDate,
              venue,
            });

            // Update section content
            if (selectedSection.type === "HERO") {
              handleSectionContentUpdate(selectedSection.id, {
                title: `${groomName} & ${brideName}`,
                subtitle: weddingDate,
                venue: venue,
              });
            } else if (selectedSection.type === "STORY") {
              handleSectionContentUpdate(selectedSection.id, {
                text: story,
                content: story,
              });
            }

            setShowEditModal(false);
            toast.success("Details updated successfully!");
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

                  return (
                    <motion.div
                      key={section.id}
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -20 }}
                      transition={{ type: "spring", stiffness: 300, damping: 30 }}
                      className="relative p-4 md:p-6 rounded-xl border-2 border-dashed transition-all duration-300 cursor-pointer group"
                      onClick={() => openEditModal(section)}
                      style={{
                        backgroundColor: selectedColorScheme?.background,
                        color: selectedColorScheme?.text,
                        borderColor: selectedColorScheme?.primary,
                      }}
                    >
                      {isEdited && (
                        <div className="absolute top-2 right-2 z-10 bg-green-100 text-green-800 text-xs px-2 py-1 rounded-full flex items-center gap-1">
                          <CheckCircle className="h-3 w-3" />
                          Edited
                        </div>
                      )}

                      <div className="flex items-center justify-between mb-3">
                        <div className="flex items-center gap-2">
                          <motion.div
                            className="p-1.5 rounded-lg"
                            whileHover={{ rotate: 10 }}
                            style={{
                              background: `linear-gradient(to right, ${selectedColorScheme?.primary}, ${selectedColorScheme?.secondary})`,
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
    </>
  );
};

export default TemplateEditor;
