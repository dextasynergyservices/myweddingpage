"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useTheme } from "@/contexts/ThemeContext";
import Image from "next/image";
import {
  Layout,
  Image as ImageIcon,
  Users,
  FileText,
  Plus,
  Eye,
  Save,
  Smartphone,
  Monitor,
  Tablet,
  Download,
  X,
  Heart,
  Calendar,
  MapPin,
  Gift,
} from "lucide-react";
import Modal from "@/components/ui/Modal";

interface ComponentContent {
  title?: string;
  subtitle?: string;
  venue?: string;
  content?: string;
  images?: string[];
}

interface Component {
  id: string;
  type: string;
  name: string;
  icon: React.ComponentType<{ className?: string }>;
  content?: ComponentContent;
  styles?: Record<string, string>;
}

interface DroppedComponent extends Component {
  position: number;
}

interface Template {
  id: string;
  name: string;
  preview: string;
  components: DroppedComponent[];
  category?: string;
}

const WeddingPageBuilder = () => {
  const { isDarkMode } = useTheme();
  const [selectedComponent, setSelectedComponent] = useState<DroppedComponent | null>(null);
  const [previewMode, setPreviewMode] = useState<"desktop" | "tablet" | "mobile">("desktop");
  const [templates, setTemplates] = useState<Template[]>([]);
  const [filteredTemplates, setFilteredTemplates] = useState<Template[]>([]);
  const [selectedTemplate, setSelectedTemplate] = useState<Template | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [showPreviewModal, setShowPreviewModal] = useState(false);
  const [showFormModal, setShowFormModal] = useState(false);
  const [activeCategory, setActiveCategory] = useState<string>("all");
  const [formData, setFormData] = useState({
    coupleNames: "",
    weddingDate: "",
    venue: "",
    story: "",
  });
  const [userPlan, setUserPlan] = useState<string | null>(null);

  // Enhanced template categories
  const templateCategories = [
    { id: "all", name: "All Templates" },
    { id: "classic", name: "Classic" },
    { id: "modern", name: "Modern" },
    { id: "minimalist", name: "Minimalist" },
    { id: "rustic", name: "Rustic" },
  ];

  // Fetch user plan and available templates
  useEffect(() => {
    const fetchUserDataAndTemplates = async () => {
      setIsLoading(true);
      try {
        // Fetch user plan
        const userResponse = await fetch("/api/user/wedding-data");
        if (!userResponse.ok) throw new Error("Failed to fetch user data");
        const userData = await userResponse.json();
        setUserPlan(userData.planName);

        // Fetch templates based on user plan
        const templatesResponse = await fetch("/api/templates");
        if (!templatesResponse.ok) throw new Error("Failed to fetch templates");
        const templatesData = await templatesResponse.json();

        // Enhance templates with categories for filtering
        const enhancedTemplates = templatesData.map((template: Template) => ({
          ...template,
          category: template.category || "classic" // Default category if not specified
        }));

        setTemplates(enhancedTemplates);
        setFilteredTemplates(enhancedTemplates);
      } catch (error) {
        console.error("Error fetching data:", error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchUserDataAndTemplates();
  }, []);

  // Filter templates by category
  useEffect(() => {
    if (activeCategory === "all") {
      setFilteredTemplates(templates);
    } else {
      setFilteredTemplates(templates.filter(template => template.category === activeCategory));
    }
  }, [activeCategory, templates]);

  // Save template to user's WeddingPage
  const saveTemplate = async () => {
    if (!selectedTemplate) return;

    setIsSaving(true);
    try {
      const response = await fetch("/api/wedding-data", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          templateId: selectedTemplate.id,
          layout_data: selectedTemplate.components,
          title: `${formData.coupleNames || "Wedding"} Page`,
          slug: `${formData.coupleNames || "wedding"}-${Date.now()}`,
          color_theme: selectedTemplate.components[0]?.styles?.backgroundColor || "#ffffff",
        }),
      });

      if (!response.ok) throw new Error("Failed to save template");

      // Enhanced success animation
      const saveButton = document.querySelector('.save-button');
      if (saveButton) {
        saveButton.classList.add('animate-pulse');
        setTimeout(() => {
          saveButton.classList.remove('animate-pulse');
        }, 1000);
      }

      alert("Template saved successfully!");
    } catch (error) {
      console.error("Error saving template:", error);
      alert("Failed to save template");
    } finally {
      setIsSaving(false);
    }
  };

  // Publish template
  const publishTemplate = async () => {
    if (!selectedTemplate) return;

    setIsSaving(true);
    try {
      const response = await fetch("/api/wedding-data/publish", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          templateId: selectedTemplate.id,
          layout_data: selectedTemplate.components,
          title: `${formData.coupleNames || "Wedding"} Page`,
          slug: `${formData.coupleNames || "wedding"}-${Date.now()}`,
          color_theme: selectedTemplate.components[0]?.styles?.backgroundColor || "#ffffff",
          is_live: true,
        }),
      });

      if (!response.ok) throw new Error("Failed to publish template");

      // Enhanced animation for publish
      const publishButton = document.querySelector('.publish-button');
      if (publishButton) {
        publishButton.classList.add('animate-bounce');
        setTimeout(() => {
          publishButton.classList.remove('animate-bounce');
        }, 1000);
      }

      setShowFormModal(true);
    } catch (error) {
      console.error("Error publishing template:", error);
      alert("Failed to publish wedding page");
    } finally {
      setIsSaving(false);
    }
  };

  // Enhanced component rendering with better animations
  const renderComponentContent = (component: DroppedComponent) => {
    const content = component.content || {};

    switch (component.type) {
      case "hero":
        return (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.5 }}
            className="text-center"
          >
            <h1 className="text-2xl md:text-4xl font-bold mb-2">{content.title || "Wedding Title"}</h1>
            <div className="flex items-center justify-center gap-2 text-lg md:text-xl">
              <Calendar className="h-5 w-5" />
              <p>{content.subtitle || "Wedding Date"}</p>
            </div>
            {content.venue && (
              <div className="flex items-center justify-center gap-2 text-sm md:text-base mt-2">
                <MapPin className="h-4 w-4" />
                <p>{content.venue}</p>
              </div>
            )}
          </motion.div>
        );
      case "story":
        return (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3 }}
          >
            <h2 className="text-xl md:text-2xl font-semibold mb-2 flex items-center gap-2">
              <Heart className="h-5 w-5 text-pink-500" />
              {content.title || "Our Story"}
            </h2>
            <p className="text-sm md:text-base">{content.content || "Your love story goes here..."}</p>
          </motion.div>
        );
      case "gallery":
        return (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.5 }}
          >
            <h2 className="text-xl md:text-2xl font-semibold mb-2">Photo Gallery</h2>
            <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
              {(content.images || [1, 2, 3]).map((img, i) => (
                typeof img === 'string' ? (
                  <motion.div
                    key={i}
                    className="aspect-square relative"
                    whileHover={{ scale: 1.03 }}
                  >
                    <Image
                      src={img}
                      alt={`Gallery image ${i+1}`}
                      fill
                      className="object-cover rounded"
                    />
                  </motion.div>
                ) : (
                  <div key={i} className="aspect-square bg-slate-200 dark:bg-slate-600 rounded"></div>
                )
              ))}
            </div>
          </motion.div>
        );
      case "gift":
        return (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.5 }}
          >
            <h2 className="text-xl md:text-2xl font-semibold mb-2 flex items-center gap-2">
              <Gift className="h-5 w-5 text-amber-500" />
              Gift Registry
            </h2>
            <p className="text-sm md:text-base">{content.content || "Browse our gift registry..."}</p>
          </motion.div>
        );
      case "guest":
        return (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.5 }}
          >
            <h2 className="text-xl md:text-2xl font-semibold mb-2 flex items-center gap-2">
              <Users className="h-5 w-5 text-blue-500" />
              Guest Information
            </h2>
            <p className="text-sm md:text-base">{content.content || "Guest details and RSVP..."}</p>
          </motion.div>
        );
      default:
        return `${component.name} component preview`;
    }
  };

  const renderComponentPreview = (component: DroppedComponent) => {
    const baseClasses = `relative p-4 md:p-6 rounded-xl border-2 border-dashed transition-all duration-300 cursor-pointer ${
      selectedComponent?.id === component.id
        ? "border-indigo-500 bg-indigo-50 dark:bg-indigo-900/20"
        : isDarkMode
          ? "border-slate-600 hover:border-slate-500 bg-slate-700/30"
          : "border-slate-300 hover:border-slate-400 bg-slate-50"
    }`;

    return (
      <motion.div
        key={component.id}
        layout
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: -20 }}
        transition={{ type: "spring", stiffness: 300, damping: 30 }}
        className={baseClasses}
        onClick={() => setSelectedComponent(component)}
        style={{
          backgroundColor: component.styles?.backgroundColor,
          color: component.styles?.textColor,
          padding: component.styles?.padding,
          borderRadius: component.styles?.borderRadius,
        }}
      >
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-2">
            <motion.div
              className="p-1.5 bg-gradient-to-r from-indigo-600 to-purple-600 rounded-lg"
              whileHover={{ rotate: 10 }}
            >
              <component.icon className="h-4 w-4 text-white" />
            </motion.div>
            <h3 className={`text-sm font-medium ${isDarkMode ? "text-white" : "text-slate-900"}`}>
              {component.name}
            </h3>
          </div>
        </div>

        <div className={`text-xs md:text-sm ${isDarkMode ? "text-slate-300" : "text-slate-600"}`}>
          {renderComponentContent(component)}
        </div>
      </motion.div>
    );
  };

  const getPreviewWidth = () => {
    switch (previewMode) {
      case "mobile":
        return "max-w-sm";
      case "tablet":
        return "max-w-2xl";
      default:
        return "max-w-full";
    }
  };

  const updateComponentContent = (id: string, content: ComponentContent) => {
    if (!selectedTemplate) return;

    const updatedComponents = selectedTemplate.components.map((comp) =>
      comp.id === id ? { ...comp, content: { ...comp.content, ...content } } : comp
    );

    setSelectedTemplate({
      ...selectedTemplate,
      components: updatedComponents
    });
  };

  const updateComponentStyles = (id: string, styles: Record<string, string>) => {
    if (!selectedTemplate) return;

    const updatedComponents = selectedTemplate.components.map((comp) =>
      comp.id === id ? { ...comp, styles: { ...comp.styles, ...styles } } : comp
    );

    setSelectedTemplate({
      ...selectedTemplate,
      components: updatedComponents
    });
  };

  const handleFormSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (selectedTemplate) {
      updateComponentContent(selectedTemplate.components[0].id, {
        title: formData.coupleNames,
        subtitle: formData.weddingDate,
        venue: formData.venue,
      });
      if (selectedTemplate.components[1]?.type === "story") {
        updateComponentContent(selectedTemplate.components[1].id, {
          content: formData.story,
        });
      }
    }
    setShowFormModal(false);
    alert("Wedding page published successfully with your custom data!");
  };

  return (
    <div className="h-full flex flex-col">
      {/* Header */}
      <div className="mb-6">
        <h1 className={`text-2xl md:text-3xl font-light mb-2 ${isDarkMode ? "text-white" : "text-slate-900"}`}>
          Wedding Page Builder
        </h1>
        <p className={`text-sm md:text-base ${isDarkMode ? "text-slate-400" : "text-slate-600"}`}>
          Select and customize your wedding page template
        </p>
      </div>

      <div className="flex-1 flex flex-col gap-4">
        {/* Template Selection */}
        <div className={`rounded-xl p-4 md:p-6 shadow-lg border mb-4 ${
          isDarkMode ? "bg-slate-800 border-slate-700" : "bg-white border-slate-100"
        }`}>
          <div className="flex flex-col md:flex-row md:items-center md:justify-between mb-4 gap-4">
            <h2 className={`text-lg md:text-xl font-semibold ${
              isDarkMode ? "text-white" : "text-slate-900"
            }`}>
              Templates
            </h2>

            {/* Template Category Filter */}
            <div className="flex flex-wrap gap-2">
              {templateCategories.map((category) => (
                <motion.button
                  key={category.id}
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={() => setActiveCategory(category.id)}
                  className={`px-3 py-1 text-xs md:text-sm rounded-full transition-colors ${
                    activeCategory === category.id
                      ? "bg-indigo-600 text-white"
                      : isDarkMode
                        ? "bg-slate-700 text-slate-300 hover:bg-slate-600"
                        : "bg-slate-100 text-slate-700 hover:bg-slate-200"
                  }`}
                >
                  {category.name}
                </motion.button>
              ))}
            </div>
          </div>

          {isLoading ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
              {[1, 2, 3, 4].map((i) => (
                <motion.div
                  key={i}
                  className="p-4 rounded-xl bg-slate-200 dark:bg-slate-700 h-32 md:h-40"
                  initial={{ opacity: 0.5 }}
                  animate={{ opacity: 1 }}
                  transition={{ repeat: Infinity, duration: 1.5, repeatType: "reverse" }}
                ></motion.div>
              ))}
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
              {filteredTemplates.map((template) => (
                <motion.div
                  key={template.id}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.3 }}
                  onClick={() => {
                    setSelectedTemplate(template);
                    setSelectedComponent(null);
                  }}
                  className={`p-3 rounded-xl border cursor-pointer transition-all duration-300 ${
                    selectedTemplate?.id === template.id
                      ? "border-indigo-500 bg-indigo-50 dark:bg-indigo-900/20"
                      : isDarkMode
                        ? "border-slate-600 hover:border-slate-500 bg-slate-700/30"
                        : "border-slate-200 hover:border-slate-300 bg-slate-50"
                  }`}
                  whileHover={{ y: -5 }}
                >
                  <div className="relative h-24 md:h-32 w-full mb-2 overflow-hidden rounded-lg">
                    <Image
                      src={template.preview}
                      alt={template.name}
                      fill
                      className="object-cover transition-transform duration-300 hover:scale-105"
                    />
                  </div>
                  <h4 className={`text-sm md:text-base font-medium ${isDarkMode ? "text-white" : "text-slate-900"}`}>
                    {template.name}
                  </h4>
                  <p className={`text-xs ${isDarkMode ? "text-slate-400" : "text-slate-600"}`}>
                    {template.components.length} components
                  </p>
                </motion.div>
              ))}
            </div>
          )}
        </div>

        {/* Preview Controls */}
        <div className={`flex flex-col md:flex-row items-center justify-between p-4 rounded-xl mb-4 ${
          isDarkMode ? "bg-slate-800 border-slate-700" : "bg-white border-slate-200"
        } border shadow-lg gap-4 md:gap-0`}>
          <div className="flex items-center gap-2">
            <motion.button
              whileHover={{ scale: 1.1 }}
              whileTap={{ scale: 0.9 }}
              onClick={() => setPreviewMode("desktop")}
              className={`p-2 rounded-lg transition-colors ${
                previewMode === "desktop"
                  ? "bg-indigo-600 text-white"
                  : isDarkMode
                    ? "text-slate-400 hover:text-white hover:bg-slate-700"
                    : "text-slate-600 hover:text-slate-900 hover:bg-slate-100"
              }`}
              aria-label="Desktop preview"
            >
              <Monitor className="h-4 w-4" />
            </motion.button>
            <motion.button
              whileHover={{ scale: 1.1 }}
              whileTap={{ scale: 0.9 }}
              onClick={() => setPreviewMode("tablet")}
              className={`p-2 rounded-lg transition-colors ${
                previewMode === "tablet"
                  ? "bg-indigo-600 text-white"
                  : isDarkMode
                    ? "text-slate-400 hover:text-white hover:bg-slate-700"
                    : "text-slate-600 hover:text-slate-900 hover:bg-slate-100"
              }`}
              aria-label="Tablet preview"
            >
              <Tablet className="h-4 w-4" />
            </motion.button>
            <motion.button
              whileHover={{ scale: 1.1 }}
              whileTap={{ scale: 0.9 }}
              onClick={() => setPreviewMode("mobile")}
              className={`p-2 rounded-lg transition-colors ${
                previewMode === "mobile"
                  ? "bg-indigo-600 text-white"
                  : isDarkMode
                    ? "text-slate-400 hover:text-white hover:bg-slate-700"
                    : "text-slate-600 hover:text-slate-900 hover:bg-slate-100"
              }`}
              aria-label="Mobile preview"
            >
              <Smartphone className="h-4 w-4" />
            </motion.button>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={saveTemplate}
              disabled={!selectedTemplate || isSaving}
              className={`save-button flex items-center gap-2 px-3 py-1.5 md:px-4 md:py-2 rounded-lg transition-colors text-sm ${
                !selectedTemplate || isSaving
                  ? "bg-gray-400 cursor-not-allowed"
                  : "bg-indigo-600 hover:bg-indigo-700"
              } text-white`}
            >
              <Save className="h-3 w-3 md:h-4 md:w-4" />
              {isSaving ? "Saving..." : "Save"}
            </motion.button>
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => setShowPreviewModal(true)}
              disabled={!selectedTemplate}
              className={`flex items-center gap-2 px-3 py-1.5 md:px-4 md:py-2 rounded-lg transition-colors text-sm ${
                !selectedTemplate
                  ? "bg-gray-400 cursor-not-allowed"
                  : "bg-emerald-600 hover:bg-emerald-700"
              } text-white`}
            >
              <Eye className="h-3 w-3 md:h-4 md:w-4" />
              Preview
            </motion.button>
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={publishTemplate}
              disabled={!selectedTemplate || isSaving}
              className={`publish-button flex items-center gap-2 px-3 py-1.5 md:px-4 md:py-2 rounded-lg transition-colors text-sm ${
                !selectedTemplate || isSaving
                  ? "bg-gray-400 cursor-not-allowed"
                  : "bg-purple-600 hover:bg-purple-700"
              } text-white`}
            >
              <Download className="h-3 w-3 md:h-4 md:w-4" />
              {isSaving ? "Publishing..." : "Publish"}
            </motion.button>
          </div>
        </div>

        {/* Template Preview */}
        <div className="flex-1 overflow-auto">
          <div className={`mx-auto transition-all duration-300 ${getPreviewWidth()}`}>
            {!selectedTemplate ? (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className={`min-h-64 md:min-h-96 rounded-xl border-2 border-dashed flex flex-col items-center justify-center ${
                  isDarkMode ? "border-slate-600 bg-slate-800/50" : "border-slate-300 bg-slate-50"
                }`}
              >
                <div className="flex flex-col items-center justify-center h-64 md:h-96 text-center p-4">
                  <motion.div
                    className={`p-4 rounded-full mb-3 ${
                      isDarkMode ? "bg-slate-700" : "bg-slate-200"
                    }`}
                    animate={{ rotate: 360 }}
                    transition={{ repeat: Infinity, duration: 10, ease: "linear" }}
                  >
                    <Plus className={`h-8 w-8 ${
                      isDarkMode ? "text-slate-400" : "text-slate-500"
                    }`} />
                  </motion.div>
                  <h3 className={`text-lg md:text-xl font-semibold mb-1 ${
                    isDarkMode ? "text-white" : "text-slate-900"
                  }`}>
                    Select a Template
                  </h3>
                  <p className={`text-xs md:text-sm ${isDarkMode ? "text-slate-400" : "text-slate-600"}`}>
                    Choose a template from above to preview and customize
                  </p>
                </div>
              </motion.div>
            ) : (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className={`min-h-64 md:min-h-96 rounded-xl border-2 border-dashed ${
                  isDarkMode ? "border-slate-600 bg-slate-800/50" : "border-slate-300 bg-slate-50"
                }`}
              >
                <div className="p-4 md:p-6 space-y-4 md:space-y-6">
                  <AnimatePresence>
                    {selectedTemplate.components
                      .sort((a, b) => a.position - b.position)
                      .map((component) => renderComponentPreview(component))}
                  </AnimatePresence>
                </div>
              </motion.div>
            )}
          </div>
        </div>

        {/* Edit Panel Sidebar */}
        <AnimatePresence>
          {selectedComponent && (
            <motion.div
              initial={{ x: "100%" }}
              animate={{ x: 0 }}
              exit={{ x: "100%" }}
              transition={{ type: "spring", damping: 30, stiffness: 300 }}
              className={`fixed inset-y-0 right-0 w-full sm:w-96 z-50 shadow-xl border-l ${
                isDarkMode ? "bg-slate-800 border-slate-700" : "bg-white border-slate-200"
              }`}
            >
              <div className="h-full overflow-y-auto p-4 md:p-6">
                <div className="flex items-center justify-between mb-4">
                  <h2 className={`text-lg md:text-xl font-semibold ${
                    isDarkMode ? "text-white" : "text-slate-900"
                  }`}>
                    Edit Component
                  </h2>
                  <motion.button
                    whileHover={{ rotate: 90 }}
                    onClick={() => setSelectedComponent(null)}
                    className={`p-1 rounded-full ${
                      isDarkMode ? "hover:bg-slate-700" : "hover:bg-slate-100"
                    }`}
                  >
                    <X className="h-4 w-4" />
                  </motion.button>
                </div>

                <div className="space-y-6">
                  {/* Content Section */}
                  <motion.div
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                  >
                    <h3 className={`text-sm font-medium mb-3 ${
                      isDarkMode ? "text-slate-300" : "text-slate-700"
                    }`}>
                      Content
                    </h3>

                    {selectedComponent.type === "hero" && (
                      <div className="space-y-3">
                        <div>
                          <label className={`block text-xs mb-1 ${
                            isDarkMode ? "text-slate-400" : "text-slate-600"
                          }`}>
                            Couple Names
                          </label>
                          <input
                            type="text"
                            value={selectedComponent.content?.title || ""}
                            onChange={(e) =>
                              updateComponentContent(selectedComponent.id, {
                                title: e.target.value,
                              })
                            }
                            className={`w-full px-3 py-2 rounded-lg border transition-colors text-sm ${
                              isDarkMode
                                ? "bg-slate-700 border-slate-600 text-white"
                                : "bg-white border-slate-300 text-slate-900"
                            }`}
                          />
                        </div>
                        <div>
                          <label className={`block text-xs mb-1 ${
                            isDarkMode ? "text-slate-400" : "text-slate-600"
                          }`}>
                            Wedding Date
                          </label>
                          <input
                            type="text"
                            value={selectedComponent.content?.subtitle || ""}
                            onChange={(e) =>
                              updateComponentContent(selectedComponent.id, {
                                subtitle: e.target.value,
                              })
                            }
                            className={`w-full px-3 py-2 rounded-lg border transition-colors text-sm ${
                              isDarkMode
                                ? "bg-slate-700 border-slate-600 text-white"
                                : "bg-white border-slate-300 text-slate-900"
                            } `}
                          />
                        </div>
                        <div>
                          <label className={`block text-xs mb-1 ${
                            isDarkMode ? "text-slate-400" : "text-slate-600"
                          }`}>
                            Venue
                          </label>
                          <input
                            type="text"
                            value={selectedComponent.content?.venue || ""}
                            onChange={(e) =>
                              updateComponentContent(selectedComponent.id, {
                                venue: e.target.value,
                              })
                            }
                            className={`w-full px-3 py-2 rounded-lg border transition-colors text-sm ${
                              isDarkMode
                                ? "bg-slate-700 border-slate-600 text-white"
                                : "bg-white border-slate-300 text-slate-900"
                            } `}
                          />
                        </div>
                      </div>
                    )}

                    {selectedComponent.type === "story" && (
                      <div className="space-y-3">
                        <div>
                          <label className={`block text-xs mb-1 ${
                            isDarkMode ? "text-slate-400" : "text-slate-600"
                          }`}>
                            Title
                          </label>
                          <input
                            type="text"
                            value={selectedComponent.content?.title || ""}
                            onChange={(e) =>
                              updateComponentContent(selectedComponent.id, {
                                title: e.target.value,
                              })
                            }
                            className={`w-full px-3 py-2 rounded-lg border transition-colors text-sm ${
                              isDarkMode
                                ? "bg-slate-700 border-slate-600 text-white"
                                : "bg-white border-slate-300 text-slate-900"
                            } `}
                          />
                        </div>
                        <div>
                          <label className={`block text-xs mb-1 ${
                            isDarkMode ? "text-slate-400" : "text-slate-600"
                          }`}>
                            Content
                          </label>
                          <textarea
                            value={selectedComponent.content?.content || ""}
                            onChange={(e) =>
                              updateComponentContent(selectedComponent.id, {
                                content: e.target.value,
                              })
                            }
                            rows={5}
                            className={`w-full px-3 py-2 rounded-lg border transition-colors text-sm ${
                              isDarkMode
                                ? "bg-slate-700 border-slate-600 text-white"
                                : "bg-white border-slate-300 text-slate-900"
                            } `}
                          />
                        </div>
                      </div>
                    )}

                    {selectedComponent.type === "gallery" && (
                      <div className="space-y-3">
                        <div>
                          <label className={`block text-xs mb-1 ${
                            isDarkMode ? "text-slate-400" : "text-slate-600"
                          }`}>
                            Images (URLs, one per line)
                          </label>
                          <textarea
                            value={selectedComponent.content?.images?.join("\n") || ""}
                            onChange={(e) =>
                              updateComponentContent(selectedComponent.id, {
                                images: e.target.value.split("\n").filter((url) => url.trim()),
                              })
                            }
                            rows={5}
                            className={`w-full px-3 py-2 rounded-lg border transition-colors text-sm ${
                              isDarkMode
                                ? "bg-slate-700 border-slate-600 text-white"
                                : "bg-white border-slate-300 text-slate-900"
                            } `}
                          />
                        </div>
                      </div>
                    )}
                  </motion.div>

                  {/* Styling Section */}
                  <motion.div
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.1 }}
                  >
                    <h3 className={`text-sm font-medium mb-3 ${
                      isDarkMode ? "text-slate-300" : "text-slate-700"
                    }`}>
                      Styling
                    </h3>
                    <div className="space-y-3">
                      <div>
                        <label className={`block text-xs mb-1 ${
                          isDarkMode ? "text-slate-400" : "text-slate-600"
                        }`}>
                          Background Color
                        </label>
                        <div className="flex gap-2">
                          <motion.input
                            whileHover={{ scale: 1.05 }}
                            type="color"
                            value={selectedComponent.styles?.backgroundColor || "#ffffff"}
                            onChange={(e) =>
                              updateComponentStyles(selectedComponent.id, {
                                backgroundColor: e.target.value,
                              })
                            }
                            className="w-10 h-10 rounded border"
                          />
                          <input
                            type="text"
                            value={selectedComponent.styles?.backgroundColor || "#ffffff"}
                            onChange={(e) =>
                              updateComponentStyles(selectedComponent.id, {
                                backgroundColor: e.target.value,
                              })
                            }
                            className={`flex-1 px-3 py-2 rounded-lg border text-sm ${
                              isDarkMode
                                ? "bg-slate-700 border-slate-600 text-white"
                                : "bg-white border-slate-300 text-slate-900"
                            } `}
                          />
                        </div>
                      </div>
                      <div>
                        <label className={`block text-xs mb-1 ${
                          isDarkMode ? "text-slate-400" : "text-slate-600"
                        }`}>
                          Text Color
                        </label>
                        <div className="flex gap-2">
                          <motion.input
                            whileHover={{ scale: 1.05 }}
                            type="color"
                            value={selectedComponent.styles?.textColor || "#000000"}
                            onChange={(e) =>
                              updateComponentStyles(selectedComponent.id, {
                                textColor: e.target.value,
                              })
                            }
                            className="w-10 h-10 rounded border"
                          />
                          <input
                            type="text"
                            value={selectedComponent.styles?.textColor || "#000000"}
                            onChange={(e) =>
                              updateComponentStyles(selectedComponent.id, {
                                textColor: e.target.value,
                              })
                            }
                            className={`flex-1 px-3 py-2 rounded-lg border text-sm ${
                              isDarkMode
                                ? "bg-slate-700 border-slate-600 text-white"
                                : "bg-white border-slate-300 text-slate-900"
                            } `}
                          />
                        </div>
                      </div>
                    </div>
                  </motion.div>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Preview Modal */}
        <Modal isOpen={showPreviewModal} onClose={() => setShowPreviewModal(false)}>
          <div className={`p-6 rounded-xl max-w-4xl mx-auto ${isDarkMode ? "bg-slate-800" : "bg-white"}`}>
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

            {selectedTemplate && (
              <div className="space-y-6">
                <AnimatePresence>
                  {selectedTemplate.components
                    .sort((a, b) => a.position - b.position)
                    .map((component) => (
                      <motion.div
                        key={component.id}
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -20 }}
                        className={`p-6 rounded-xl`}
                        style={{
                          backgroundColor: component.styles?.backgroundColor,
                          color: component.styles?.textColor,
                          padding: component.styles?.padding,
                          borderRadius: component.styles?.borderRadius,
                        }}
                      >
                        {renderComponentContent(component)}
                      </motion.div>
                    ))}
                </AnimatePresence>
              </div>
            )}
          </div>
        </Modal>

        {/* Form Modal */}
        <Modal isOpen={showFormModal} onClose={() => setShowFormModal(false)}>
          <div className={`p-6 rounded-xl max-w-md mx-auto ${isDarkMode ? "bg-slate-800" : "bg-white"}`}>
            <div className="flex items-center justify-between mb-6">
              <h2 className={`text-xl font-semibold ${isDarkMode ? "text-white" : "text-slate-900"}`}>
                Publish Wedding Page
              </h2>
              <motion.button
                whileHover={{ rotate: 90 }}
                onClick={() => setShowFormModal(false)}
                className={`p-1 rounded-full ${isDarkMode ? "hover:bg-slate-700" : "hover:bg-slate-100"}`}
              >
                <X className="h-5 w-5" />
              </motion.button>
            </div>

            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="space-y-4"
            >
              <div>
                <label className={`block text-xs mb-1 ${isDarkMode ? "text-slate-400" : "text-slate-600"}`}>
                  Couple Names
                </label>
                <input
                  type="text"
                  value={formData.coupleNames}
                  onChange={(e) => setFormData({ ...formData, coupleNames: e.target.value })}
                  className={`w-full px-3 py-2 rounded-lg border text-sm ${
                    isDarkMode ? "bg-slate-700 border-slate-600 text-white" : "bg-white border-slate-300 text-slate-900"
                  } `}
                />
              </div>
              <div>
                <label className={`block text-xs mb-1 ${isDarkMode ? "text-slate-400" : "text-slate-600"}`}>
                  Wedding Date
                </label>
                <input
                  type="text"
                  value={formData.weddingDate}
                  onChange={(e) => setFormData({ ...formData, weddingDate: e.target.value })}
                  className={`w-full px-3 py-2 rounded-lg border text-sm ${
                    isDarkMode ? "bg-slate-700 border-slate-600 text-white" : "bg-white border-slate-300 text-slate-900"
                  } `}
                />
              </div>
              <div>
                <label className={`block text-xs mb-1 ${isDarkMode ? "text-slate-400" : "text-slate-600"}`}>
                  Venue
                </label>
                <input
                  type="text"
                  value={formData.venue}
                  onChange={(e) => setFormData({ ...formData, venue: e.target.value })}
                  className={`w-full px-3 py-2 rounded-lg border text-sm ${
                    isDarkMode ? "bg-slate-700 border-slate-600 text-white" : "bg-white border-slate-300 text-slate-900"
                  } `}
                />
              </div>
              <div>
                <label className={`block text-xs mb-1 ${isDarkMode ? "text-slate-400" : "text-slate-600"}`}>
                  Our Story
                </label>
                <textarea
                  value={formData.story}
                  onChange={(e) => setFormData({ ...formData, story: e.target.value })}
                  rows={5}
                  className={`w-full px-3 py-2 rounded-lg border text-sm ${
                    isDarkMode ? "bg-slate-700 border-slate-600 text-white" : "bg-white border-slate-300 text-slate-900"
                  } `}
                />
              </div>
              <motion.button
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                onClick={handleFormSubmit}
                className={`w-full px-4 py-2 rounded-lg text-white text-sm ${
                  isDarkMode ? "bg-purple-600 hover:bg-purple-700" : "bg-purple-600 hover:bg-purple-700"
                }`}
              >
                Publish
              </motion.button>
            </motion.div>
          </div>
        </Modal>
      </div>
    </div>
  );
};

export default WeddingPageBuilder;