// src/components/dashboard/TemplateEditor.tsx
"use client";

import { useState } from "react";
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
  User,
} from "lucide-react";
import Modal from "@/components/ui/Modal";
import { DynamicTemplateRenderer } from "@/components/DynamicTemplateRenderer";
import EditWeddingDetailsModal from "./EditWeddingDetailsModal";
import { UserTemplate, Template, UserPlan, WeddingPage, TemplateComponent, ComponentContent } from "@/types/wedding";
import { toast } from "react-toastify";

interface TemplateEditorProps {
  userTemplate: UserTemplate;
  selectedTemplate: Template | null;
  weddingPage: WeddingPage | null;
  userPlan: UserPlan | null;
  onTemplateUpdate: (template: Template) => void;
}

const TemplateEditor = ({
  userTemplate,
  selectedTemplate,
  weddingPage,
  userPlan,
  onTemplateUpdate,
}: TemplateEditorProps) => {
  const { isDarkMode } = useTheme();
  const [selectedComponent, setSelectedComponent] = useState<TemplateComponent | null>(null);
  const [selectedColorScheme, setSelectedColorScheme] = useState<any>(null);
  const [isSaving, setIsSaving] = useState(false);
  const [showPreviewModal, setShowPreviewModal] = useState(false);
  const [showFormModal, setShowFormModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [userData, setUserData] = useState({
    brideName: "",
    groomName: "",
    weddingDate: "",
    venue: "",
  });
  const [websiteUrl, setWebsiteUrl] = useState("");

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
      const customizedContent = selectedTemplate.components.reduce(
        (acc: Record<string, ComponentContent>, component: TemplateComponent) => {
          acc[component.id] = component.content;
          return acc;
        },
        {} as Record<string, ComponentContent>
      );

      const response = await fetch("/api/user/templates/content", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({
          templateId: selectedTemplate.id,
          content: customizedContent,
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

  const updateWeddingDetails = async (formData: FormData) => {
    setIsSaving(true);
    try {
      // Use your existing /api/wedding-data endpoint with FormData
      const response = await fetch("/api/wedding-data", {
        method: "POST",
        credentials: "include",
        body: formData,
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || "Failed to update wedding details");
      }

      const result = await response.json();
      toast.success("Wedding details updated successfully!");

      // Extract text values from FormData
      const brideName = formData.get("brideName") as string;
      const groomName = formData.get("groomName") as string;
      const weddingDate = formData.get("weddingDate") as string;
      const venue = formData.get("venue") as string;
      const story = formData.get("story") as string;

      // Update the template content with the new data
      if (selectedTemplate) {
        const updatedComponents = selectedTemplate.components.map((comp: TemplateComponent) => {
          if (comp.type.includes("hero")) {
            return {
              ...comp,
              content: {
                ...comp.content,
                brideName: brideName || comp.content.brideName,
                groomName: groomName || comp.content.groomName,
                title: `${groomName || comp.content.groomName} & ${brideName || comp.content.brideName}`,
                subtitle: weddingDate || comp.content.weddingDate,
                venue: venue || comp.content.venue,
                weddingDate: weddingDate || comp.content.weddingDate,
                ...(result.images?.heroImage && { hero_image: result.images.heroImage })
              }
            };
          }
          if (comp.type.includes("story")) {
            return {
              ...comp,
              content: {
                ...comp.content,
                text: story || comp.content.text,
                content: story || comp.content.content,
                ...(result.images?.storyImage && { story_image: result.images.storyImage })
              }
            };
          }
          return comp;
        });

        onTemplateUpdate({
          ...selectedTemplate,
          components: updatedComponents,
        });
      }

      setShowEditModal(false);
    } catch (error) {
      console.error("Error updating wedding details:", error);
      toast.error(error instanceof Error ? error.message : "Failed to update wedding details");
    } finally {
      setIsSaving(false);
    }
  };

  const openEditModal = (component: TemplateComponent) => {
    // Only allow editing for hero and story components
    if (!component.type.includes("hero") && !component.type.includes("story")) {
      return;
    }

    const heroComponent = selectedTemplate.components.find(comp => comp.type.includes("hero"));
    const storyComponent = selectedTemplate.components.find(comp => comp.type.includes("story"));

    const initialData = {
      brideName: heroComponent?.content.brideName || "",
      groomName: heroComponent?.content.groomName || "",
      weddingDate: heroComponent?.content.weddingDate || heroComponent?.content.date || "",
      venue: heroComponent?.content.venue || heroComponent?.content.location || "",
      story: storyComponent?.content.story || storyComponent?.content.text || storyComponent?.content.content || "",
      heroImage: heroComponent?.content.hero_image || "",
      storyImage: storyComponent?.content.story_image || ""
    };

    setSelectedComponent(component);
    setShowEditModal(true);
  };

  const updateComponentContent = (id: string, content: ComponentContent) => {
    const updatedComponents = selectedTemplate.components.map((comp: TemplateComponent) =>
      comp.id === id ? { ...comp, content: { ...comp.content, ...content } } : comp
    );

    onTemplateUpdate({
      ...selectedTemplate,
      components: updatedComponents,
    });
  };

  const renderComponentContent = (component: TemplateComponent) => {
    const content = component.content || {};

    switch (component.type) {
      case "hero":
      case "rustic_hero":
      case "modern_hero":
      case "vintage_hero":
      case "luxury_hero":
        return (
          <div className="text-center">
            <h1 className="text-2xl md:text-4xl font-bold mb-2">
              {content.title || "Wedding Title"}
            </h1>
            <div className="flex items-center justify-center gap-2 text-lg md:text-xl">
              <Calendar className="h-5 w-5" />
              <p>{content.subtitle || content.date || "Wedding Date"}</p>
            </div>
            {(content.venue || content.location) && (
              <div className="flex items-center justify-center gap-2 text-sm md:text-base mt-2">
                <MapPin className="h-4 w-4" />
                <p>{content.venue || content.location}</p>
              </div>
            )}
          </div>
        );
      case "story":
      case "rustic_story":
      case "modern_story":
      case "vintage_story":
      case "luxury_story":
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
      case "gallery":
      case "rustic_gallery":
      case "modern_gallery":
      case "vintage_gallery":
      case "luxury_gallery":
        return (
          <div>
            <h2 className="text-xl md:text-2xl font-semibold mb-2">Photo Gallery</h2>
            <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
              {(content.images || [1, 2, 3]).map((img, i) =>
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
      case "gift":
      case "rustic_gift":
      case "modern_gift":
      case "vintage_gift":
      case "luxury_gift":
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
      case "guest":
      case "rustic_guest":
      case "modern_guest":
      case "vintage_guest":
      case "luxury_guest":
        return (
          <div>
            <h2 className="text-xl md:text-2xl font-semibold mb-2 flex items-center gap-2">
              <Users className="h-5 w-5 text-blue-500" />
              Guest Information
            </h2>
            <p className="text-sm md:text-base">{content.content || "Guest details and RSVP..."}</p>
          </div>
        );
      default:
        return <div>{component.type} component preview</div>;
    }
  };

  // Generate unique keys for components
  const getComponentKey = (component: TemplateComponent, index: number) => {
    return component.id || `${component.type}-${index}`;
  };

  return (
    <>
      {/* Header with template name and actions */}
      <div className={`flex flex-col md:flex-row items-center justify-between p-4 rounded-xl mb-4 ${
        isDarkMode ? "bg-slate-800 border-slate-700" : "bg-white border-slate-200"
      } border shadow-lg gap-4 md:gap-0`}>
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
            onClick={() => setShowFormModal(true)}
            disabled={isSaving}
            className={`flex items-center gap-2 px-3 py-1.5 md:px-4 md:py-2 rounded-lg transition-colors text-sm ${
              isSaving
                ? "bg-gray-400 cursor-not-allowed"
                : weddingPage && weddingPage.is_live
                  ? "bg-green-600 hover:bg-green-700"
                  : "bg-purple-600 hover:bg-purple-700"
            } text-white`}
          >
            {weddingPage && weddingPage.is_live ? (
              <>
                <ExternalLink className="h-3 w-3 md:h-4 md:w-4" />
                View Website
              </>
            ) : (
              <>
                <Download className="h-3 w-3 md:h-4 md:w-4" />
                {isSaving ? "Publishing..." : "Publish"}
              </>
            )}
          </motion.button>
        </div>
      </div>

      {/* Edit Details Modal - Only show when a hero or story component is clicked */}
      {selectedComponent && (
        <EditWeddingDetailsModal
          isOpen={showEditModal}
          onClose={() => {
            setShowEditModal(false);
            setSelectedComponent(null);
          }}
          initialData={{
            brideName: selectedComponent.content.brideName || "",
            groomName: selectedComponent.content.groomName || "",
            weddingDate: selectedComponent.content.weddingDate || selectedComponent.content.date || "",
            venue: selectedComponent.content.venue || selectedComponent.content.location || "",
            story: selectedComponent.content.story || selectedComponent.content.text || selectedComponent.content.content || "",
            heroImage: selectedComponent.content.hero_image || "",
            storyImage: selectedComponent.content.story_image || ""
          }}
          onSave={updateWeddingDetails}
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
                {selectedTemplate.components.map((component, index) => (
                  <motion.div
                    key={getComponentKey(component, index)}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -20 }}
                    transition={{ type: "spring", stiffness: 300, damping: 30 }}
                    className="relative p-4 md:p-6 rounded-xl border-2 border-dashed transition-all duration-300 cursor-pointer group"
                    onClick={() => openEditModal(component)}
                    style={{
                      backgroundColor: selectedColorScheme?.background,
                      color: selectedColorScheme?.text,
                      borderColor: selectedColorScheme?.primary,
                    }}
                  >
                    <div className="flex items-center justify-between mb-3">
                      <div className="flex items-center gap-2">
                        <motion.div
                          className="p-1.5 rounded-lg"
                          whileHover={{ rotate: 10 }}
                          style={{
                            background: `linear-gradient(to right, ${selectedColorScheme?.primary}, ${selectedColorScheme?.secondary})`,
                          }}
                        >
                          {/* Icons based on component type */}
                          {component.type.includes("hero") && <Heart className="h-4 w-4 text-white" />}
                          {component.type.includes("story") && <FileText className="h-4 w-4 text-white" />}
                          {component.type.includes("gallery") && <ImageIcon className="h-4 w-4 text-white" />}
                          {component.type.includes("gift") && <Gift className="h-4 w-4 text-white" />}
                          {component.type.includes("guest") && <Users className="h-4 w-4 text-white" />}
                        </motion.div>
                        <h3 className="text-sm font-medium">
                          {component.type
                            .split("_")
                            .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
                            .join(" ")}
                        </h3>
                      </div>
                      {/* Edit button for editable components */}
                      {(component.type.includes("hero") || component.type.includes("story")) && (
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            openEditModal(component);
                          }}
                          className="text-xs bg-blue-100 text-blue-700 px-2 py-1 rounded opacity-0 group-hover:opacity-100 transition-opacity"
                        >
                          <Edit className="h-3 w-3" />
                        </button>
                      )}
                    </div>

                    <div className="text-xs md:text-sm">
                      {renderComponentContent(component)}
                    </div>
                  </motion.div>
                ))}
              </AnimatePresence>
            </div>
          </motion.div>
        </div>
      </div>

      {/* Preview Modal */}
      <Modal isOpen={showPreviewModal} onClose={() => setShowPreviewModal(false)} size="full">
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
              colorScheme={selectedColorScheme || undefined}
            />
          </div>
        </div>
      </Modal>
    </>
  );
};

export default TemplateEditor;