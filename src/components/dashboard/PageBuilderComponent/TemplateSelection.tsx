"use client";

import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { useTheme } from "@/contexts/ThemeContext";
import Image from "next/image";
import { Search, Eye } from "lucide-react";
import TemplatePreviewModal from "@/components/TemplatePreviewModal";
import { Template, UserPlan } from "@/types/wedding";

interface TemplateSelectionProps {
  onTemplateSelect: (template: Template) => void;
  userPlan: UserPlan | null;
}

const TemplateSelection = ({ onTemplateSelect, userPlan }: TemplateSelectionProps) => {
  const { isDarkMode } = useTheme();
  const [templates, setTemplates] = useState<Template[]>([]);
  const [filteredTemplates, setFilteredTemplates] = useState<Template[]>([]);
  const [templateToPreview, setTemplateToPreview] = useState<Template | null>(null);
  const [activeCategory, setActiveCategory] = useState<string>("all");
  const [searchTerm, setSearchTerm] = useState("");
  const [isLoading, setIsLoading] = useState(true);
  const [showTemplatePreviewModal, setShowTemplatePreviewModal] = useState(false);

  useEffect(() => {
    const fetchTemplates = async () => {
      try {
        const response = await fetch("/api/templates", {
          credentials: "include",
        });

        if (response.ok) {
          const templatesData = await response.json();
          setTemplates(templatesData);
          setFilteredTemplates(templatesData);
        }
      } catch (error) {
        console.error("Error fetching templates:", error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchTemplates();
  }, []);

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

  const templateCategories = [
    { id: "all", name: "All Templates" },
    ...Array.from(new Set(templates.map((t) => t.category.name))).map((category) => ({
      id: category,
      name: category.charAt(0).toUpperCase() + category.slice(1),
    })),
  ];

  const handlePreviewTemplate = (template: Template) => {
    setTemplateToPreview(template);
    setShowTemplatePreviewModal(true);
  };

  return (
    <>
      <div
        className={`rounded-xl p-4 md:p-6 shadow-lg border mb-4 ${isDarkMode ? "bg-slate-800 border-slate-700" : "bg-white border-slate-100"}`}
      >
        <div className="flex flex-col md:flex-row md:items-center md:justify-between mb-4 gap-4">
          <h2
            className={`text-lg md:text-xl font-semibold ${isDarkMode ? "text-white" : "text-slate-900"}`}
          >
            Choose a Template
          </h2>

          <div className="flex flex-col md:flex-row gap-4">
            {/* Search Input */}
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
              <input
                type="text"
                placeholder="Search templates..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-sm"
              />
            </div>

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
        </div>

        {isLoading ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
            {[1, 2, 3, 4].map((i) => (
              <motion.div
                key={i}
                className="p-4 rounded-xl bg-slate-200 dark:bg-slate-700 h-32 md: h-40"
                initial={{ opacity: 0.5 }}
                animate={{ opacity: 1 }}
                transition={{ repeat: Infinity, duration: 1.5, repeatType: "reverse" }}
              ></motion.div>
            ))}
          </div>
        ) : filteredTemplates.length === 0 ? (
          <div className="text-center py-8">
            <p className={`text-sm ${isDarkMode ? "text-slate-400" : "text-slate-600"}`}>
              No templates available for your current plan.
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
            {filteredTemplates.map((template) => (
              <motion.div
                key={template.id}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.3 }}
                className={`p-3 rounded-xl border cursor-pointer transition-all duration-300 ${
                  isDarkMode
                    ? "border-slate-600 hover:border-slate-500 bg-slate-700/30"
                    : "border-slate-200 hover:border-slate-300 bg-slate-50"
                }`}
                whileHover={{ y: -5 }}
              >
                <div
                  className="relative h-24 md:h-32 w-full mb-2 overflow-hidden rounded-lg"
                  onClick={() => handlePreviewTemplate(template)}
                >
                  <Image
                    src={template.thumbnail || "/default-template.jpg"}
                    alt={template.name}
                    fill
                    className="object-cover transition-transform duration-300 hover:scale-105"
                  />
                  <div className="absolute top-2 left-2">
                    <span
                      className={`text-xs px-2 py-1 rounded-full ${
                        isDarkMode ? "bg-slate-800 text-slate-200" : "bg-white text-slate-800"
                      }`}
                    >
                      {template.category.name}
                    </span>
                  </div>
                  <div className="absolute inset-0 bg-black bg-opacity-0 hover:bg-opacity-20 transition-all duration-300 flex items-center justify-center">
                    <Eye className="h-6 w-6 text-white opacity-0 hover:opacity-100 transition-opacity duration-300" />
                  </div>
                </div>
                <h4
                  className={`text-sm md:text-base font-medium ${isDarkMode ? "text-white" : "text-slate-900"}`}
                >
                  {template.name}
                </h4>
                <p
                  className={`text-xs ${isDarkMode ? "text-slate-400" : "text-slate-600"} line-clamp-2`}
                >
                  {template.description}
                </p>
                <p className={`text-xs mt-1 ${isDarkMode ? "text-slate-500" : "text-slate-500"}`}>
                  {template.sections?.length || 0} sections
                </p>
                <button
                  onClick={() => handlePreviewTemplate(template)}
                  className="w-full mt-2 px-3 py-1 bg-indigo-600 text-white text-xs rounded-lg hover:bg-indigo-700 transition-colors"
                >
                  Preview & Select
                </button>
              </motion.div>
            ))}
          </div>
        )}
      </div>

      {templateToPreview && (
        <TemplatePreviewModal
          isOpen={showTemplatePreviewModal}
          onClose={() => {
            setShowTemplatePreviewModal(false);
            setTemplateToPreview(null);
          }}
          template={templateToPreview}
          onSelectTemplate={onTemplateSelect}
          userPlan={userPlan}
        />
      )}
    </>
  );
};

export default TemplateSelection;
