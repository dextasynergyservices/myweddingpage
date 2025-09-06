"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useTheme } from "@/contexts/ThemeContext";
import Image from "next/image";
import {
  Eye,
  Save,
  Download,
  X,
  Search,
  CheckCircle,
  Layout,
  Image as ImageIcon,
  Users,
  FileText,
  Gift,
  Heart,
  Calendar,
  MapPin,
} from "lucide-react";
import Modal from "@/components/ui/Modal";
import { DynamicTemplateRenderer } from "@/components/DynamicTemplateRenderer";
import TemplatePreviewModal from "@/components/TemplatePreviewModal";
import TemplateSelection from "@/components/dashboard/PageBuilderComponent/TemplateFetch";
import { Template, UserTemplate, UserPlan, WeddingPage } from "@/types/wedding";

const WeddingPageBuilder = () => {
  const { isDarkMode } = useTheme();
  const [isSelect, setIsSelect] = useState(false);
  const [templates, setTemplates] = useState<Template[]>([]);
  const [filteredTemplates, setFilteredTemplates] = useState<Template[]>([]);
  const [selectedTemplate, setSelectedTemplate] = useState<Template | null>(null);
  const [userTemplate, setUserTemplate] = useState<UserTemplate | null>(null);
  const [weddingPage, setWeddingPage] = useState<WeddingPage | null>(null);
  const [userPlan, setUserPlan] = useState<UserPlan | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [showPreviewModal, setShowPreviewModal] = useState(false);
  const [activeCategory, setActiveCategory] = useState<string>("all");
  const [searchTerm, setSearchTerm] = useState("");
  const [editedSections, setEditedSections] = useState<string[]>([]);

  // Fetch user data and templates
  useEffect(() => {
    const fetchUserData = async () => {
      setIsLoading(true);
      try {
        // Fetch user plan
        const planResponse = await fetch("/api/user/plans");
        if (planResponse.ok) {
          const planData = await planResponse.json();
          setUserPlan(planData);
        }

        // Fetch user's selected template
        const templateResponse = await fetch("/api/selected-template");
        if (templateResponse.ok) {
          const templateData = await templateResponse.json();
          setUserTemplate(templateData);
          if (templateData.template) {
            setSelectedTemplate(templateData.template);
            setIsSelect(true); // Switch to customize mode if template is selected
          }
        } else {
          setIsSelect(false); // Switch to choose template mode if no template selected
        }

        // Fetch wedding page if published
        const weddingPageResponse = await fetch("/api/wedding-data");
        if (weddingPageResponse.ok) {
          const weddingPageData = await weddingPageResponse.json();
          setWeddingPage(weddingPageData);
        }

        // Fetch available templates
        const templatesResponse = await fetch("/api/templates");
        if (templatesResponse.ok) {
          const templatesData = await templatesResponse.json();
          setTemplates(templatesData);
          setFilteredTemplates(templatesData);
        }
      } catch (error) {
        console.error("Error fetching user data:", error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchUserData();
  }, []);

  // Filter templates by category and search
  useEffect(() => {
    let filtered = templates;

    if (activeCategory !== "all") {
      filtered = filtered.filter((template) => template.category.name === activeCategory);
    }

    if (searchTerm) {
      filtered = filtered.filter(
        (template) =>
          template.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
          template.description.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    setFilteredTemplates(filtered);
  }, [activeCategory, searchTerm, templates]);

  // Get unique categories from templates
  const templateCategories = [
    { id: "all", name: "All Templates" },
    ...Array.from(new Set(templates.map((t) => t.category.name))).map((category) => ({
      id: category,
      name: category.charAt(0).toUpperCase() + category.slice(1),
    })),
  ];

  const handleTemplateSelect = (userTemplateData: any) => {
    // Accepts the server-returned UserTemplate (or undefined when deleted)
    if (!userTemplateData) {
      // template deleted: clear selection
      setUserTemplate(null);
      setSelectedTemplate(null);
      setIsSelect(false);
      return;
    }

    setUserTemplate(userTemplateData);
    setSelectedTemplate(userTemplateData.template);
    setIsSelect(true);
  };

  const handleContentUpdate = async (sectionId: string, content: any) => {
    if (!userTemplate || !selectedTemplate) return;

    // Update local state
    const updatedSections = selectedTemplate.sections.map((section) =>
      section.id === sectionId
        ? { ...section, components: { ...section.components, ...content } }
        : section
    );

    setSelectedTemplate({
      ...selectedTemplate,
      sections: updatedSections,
    });

    // Mark section as edited
    if (!editedSections.includes(sectionId)) {
      setEditedSections([...editedSections, sectionId]);
    }

    // Save to backend
    try {
      const response = await fetch("/api/user/templates/content", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          templateId: selectedTemplate.id,
          content: { [sectionId]: content },
        }),
      });

      if (!response.ok) throw new Error("Failed to save content");
    } catch (error) {
      console.error("Error saving template content:", error);
    }
  };

  const publishTemplate = async () => {
    if (!selectedTemplate || !userTemplate) return;

    setIsSaving(true);
    try {
      const templateName = userTemplate.template?.name ?? selectedTemplate.name;

      const response = await fetch("/api/wedding-data", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          templateId: selectedTemplate.id,
          content: userTemplate.content,
          colorScheme: userTemplate.colorScheme,
          title: `${templateName} Wedding Page`,
          slug: `${templateName.toLowerCase().replace(/\s+/g, "-")}-${Date.now()}`,
        }),
      });

      if (response.ok) {
        const weddingPageData = await response.json();
        setWeddingPage(weddingPageData);
        alert("Wedding page published successfully!");
      } else {
        throw new Error("Failed to publish template");
      }
    } catch (error) {
      console.error("Error publishing template:", error);
      alert("Failed to publish wedding page");
    } finally {
      setIsSaving(false);
    }
  };

  const switchToTemplateSelection = () => {
    setIsSelect(true);
    setSelectedTemplate(null);
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600"></div>
      </div>
    );
  }

  return (
    <div className="h-full flex flex-col">
      {/* Header */}
      <div className="mb-6">
        <h1
          className={`text-2xl md:text-3xl font-light mb-2 ${isDarkMode ? "text-white" : "text-slate-900"}`}
        >
          Wedding Page Builder
        </h1>
        <p className={`text-sm md:text-base ${isDarkMode ? "text-slate-400" : "text-slate-600"}`}>
          {isSelect
            ? "Customize your selected template"
            : "Choose a template for your wedding page"}
        </p>
      </div>

      {/* Mode Toggle */}
      <div className="mb-6">
        <div
          className={`p-1 rounded-lg inline-flex ${isDarkMode ? "bg-slate-700" : "bg-slate-200"}`}
        >
          <button
            onClick={() => setIsSelect(false)}
            className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${
              !isSelect
                ? "bg-white text-slate-900 shadow"
                : isDarkMode
                  ? "text-slate-300 hover:text-white"
                  : "text-slate-600 hover:text-slate-900"
            }`}
          >
            Choose Template
          </button>
          <button
            onClick={() => setIsSelect(true)}
            disabled={!selectedTemplate}
            className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${
              !isSelect
                ? "bg-white text-slate-900 shadow"
                : isDarkMode
                  ? "text-slate-300 hover:text-white disabled:text-slate-500"
                  : "text-slate-600 hover:text-slate-900 disabled:text-slate-400"
            }`}
          >
            Customize
          </button>
        </div>
      </div>

      {/* Content */}
      <div className="flex-1 overflow-auto">
        {!isSelect ? (
          <TemplateSelection
            onUserTemplateSelected={(userTemplate) => handleTemplateSelect(userTemplate)}
            userPlan={userPlan ?? null}
            userTemplate={userTemplate ?? undefined}
          />
        ) : selectedTemplate ? (
          <>
            {/* Editor Header */}
            <div
              className={`flex flex-col md:flex-row items-center justify-between p-4 rounded-xl mb-4 ${
                isDarkMode ? "bg-slate-800 border-slate-700" : "bg-white border-slate-200"
              } border shadow-lg gap-4 md:gap-0`}
            >
              <div>
                <h2
                  className={`text-xl font-semibold ${isDarkMode ? "text-white" : "text-slate-900"}`}
                >
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

            {/* Template Editor */}
            <div className="flex-1 overflow-auto">
              <div className="mx-auto max-w-full">
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  className={`min-h-64 md:min-h-96 rounded-xl border-2 border-dashed ${
                    isDarkMode ? "border-slate-600 bg-slate-800/50" : "border-slate-300 bg-slate-50"
                  }`}
                >
                  {selectedTemplate.sections && selectedTemplate.sections.length > 0 ? (
                    <div className="space-y-4">
                      {selectedTemplate.sections.map((section) => (
                        <motion.div
                          key={section.id}
                          initial={{ opacity: 0, y: 20 }}
                          animate={{ opacity: 1, y: 0 }}
                          className={`p-4 rounded-xl border-2 border-dashed transition-all duration-300 cursor-pointer group hover:border-indigo-400 ${
                            isDarkMode
                              ? "border-slate-600 bg-slate-800/50"
                              : "border-slate-300 bg-slate-50"
                          }`}
                          onClick={() => {
                            // Handle section click for editing
                            console.log("Edit section:", section.id, section.type);
                          }}
                        >
                          <div className="flex items-center justify-between mb-3">
                            <div className="flex items-center gap-2">
                              <div className="p-2 rounded-lg bg-indigo-100 dark:bg-indigo-900/30">
                                {section.type === "HERO" && (
                                  <Heart className="h-4 w-4 text-indigo-600" />
                                )}
                                {section.type === "STORY" && (
                                  <FileText className="h-4 w-4 text-indigo-600" />
                                )}
                                {section.type === "GALLERY" && (
                                  <ImageIcon className="h-4 w-4 text-indigo-600" />
                                )}
                                {section.type === "REGISTRY" && (
                                  <Gift className="h-4 w-4 text-indigo-600" />
                                )}
                                {section.type === "WISHES" && (
                                  <Users className="h-4 w-4 text-indigo-600" />
                                )}
                              </div>
                              <h3 className="text-sm font-medium">
                                {section.type.charAt(0) + section.type.slice(1).toLowerCase()}
                              </h3>
                            </div>
                            <button
                              onClick={(e) => {
                                e.stopPropagation();
                                console.log("Edit section:", section.id);
                              }}
                              className="text-xs bg-blue-100 text-blue-700 px-2 py-1 rounded opacity-0 group-hover:opacity-100 transition-opacity"
                            >
                              Edit
                            </button>
                          </div>
                          <div className="text-xs text-slate-500">Click to edit this section</div>
                        </motion.div>
                      ))}
                    </div>
                  ) : (
                    <div className="flex items-center justify-center h-64 text-center">
                      <p className={isDarkMode ? "text-slate-400" : "text-slate-600"}>
                        No sections available for this template.
                      </p>
                    </div>
                  )}
                </motion.div>
              </div>
            </div>
          </>
        ) : (
          <div
            className={`rounded-xl p-8 text-center ${isDarkMode ? "bg-slate-800" : "bg-slate-100"}`}
          >
            <p className={isDarkMode ? "text-slate-400" : "text-slate-600"}>
              No template selected. Please choose a template to begin customizing.
            </p>
            <button
              onClick={() => setIsSelect(true)}
              className="mt-4 px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700"
            >
              Choose Template
            </button>
          </div>
        )}
      </div>

      {/* Template Preview Modal */}
      {selectedTemplate && (
        <TemplatePreviewModal
          isOpen={showPreviewModal}
          onClose={() => setShowPreviewModal(false)}
          template={selectedTemplate!}
          userTemplate={userTemplate ?? undefined}
          weddingPage={weddingPage ?? undefined}
          userPlan={userPlan ?? undefined}
          onSelectTemplate={handleTemplateSelect}
          isSelect={isSelect} // pass current mode: false = Choose Template (static preview), true = Customize (dynamic preview)
        />
      )}
    </div>
  );
};

export default WeddingPageBuilder;
