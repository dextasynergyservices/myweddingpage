"use client";

import { useState, useEffect } from "react";
import { useTheme } from "@/contexts/ThemeContext";
import TemplatePreviewModal from "@/components/TemplatePreviewModal";
import TemplateSelection from "@/components/dashboard/PageBuilderComponent/TemplateFetch";
import TemplateEditor from "@/components/dashboard/PageBuilderComponent/TemplateEditor";
import { Template, UserTemplate, UserPlan, WeddingPage } from "@/types/wedding";

const WeddingPageBuilder = () => {
  const { isDarkMode } = useTheme();
  const [isSelect, setIsSelect] = useState(false);
  const [, setTemplates] = useState<Template[]>([]);
  const [selectedTemplate, setSelectedTemplate] = useState<Template | null>(null);
  const [userTemplate, setUserTemplate] = useState<UserTemplate | null>(null);
  const [weddingPage, setWeddingPage] = useState<WeddingPage | null>(null);
  const [userPlan, setUserPlan] = useState<UserPlan | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [showPreviewModal, setShowPreviewModal] = useState(false);
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
          // templateData.template may be undefined; normalize to null for state
          setSelectedTemplate((templateData && templateData.template) || null);
          if (templateData && templateData.template) {
            setIsSelect(true); // Switch to customize mode if template is selected
          }
        } else {
          setSelectedTemplate(null);
          setIsSelect(false); // Switch to choose template mode if no template selected
        }

        // Fetch wedding page if published. The API returns a wrapper object
        // (not just the wedding page). Normalize to the actual weddingPage
        // object so the UI can rely on `weddingPage.is_live` etc.
        const weddingPageResponse = await fetch("/api/wedding-data");
        if (weddingPageResponse.ok) {
          const weddingPageData = await weddingPageResponse.json();
          // API shape: { weddingPage: {...}, ... } — use the inner weddingPage when present
          setWeddingPage(
            (weddingPageData && weddingPageData.weddingPage) || weddingPageData || null
          );
        }

        // Fetch available templates
        const templatesResponse = await fetch("/api/templates");
        if (templatesResponse.ok) {
          const templatesData = await templatesResponse.json();
          setTemplates(templatesData);
        }
      } catch (error) {
        console.error("Error fetching user data:", error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchUserData();
  }, []);

  // Ensure we pass a userTemplate that definitely has a `template` field to TemplateSelection.
  // This prevents a type error when the underlying `userTemplate.template` may be undefined.
  const safeUserTemplate =
    userTemplate && userTemplate.template
      ? { ...userTemplate, template: userTemplate.template as Template }
      : undefined;

  const handleTemplateSelect = (userTemplateData?: UserTemplate | null) => {
    // Accepts the server-returned UserTemplate (or undefined when deleted)
    if (!userTemplateData) {
      // template deleted or not set: clear selection
      setUserTemplate(null);
      setSelectedTemplate(null);
      setIsSelect(false);
      return;
    }

    setUserTemplate(userTemplateData);
    // template may be undefined on some shapes; normalize to null
    setSelectedTemplate(userTemplateData.template ?? null);
    setIsSelect(true);
  };

  const handleContentUpdate = async (sectionId: string, content: Record<string, unknown>) => {
    if (!userTemplate || !selectedTemplate) return;

    try {
      console.log("Making request to /api/template-sections/edit with:", {
        templateId: selectedTemplate.id,
        sectionId,
        content,
      });

      // Save to backend using the new API
      const response = await fetch("/api/template-sections/edit", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          templateId: selectedTemplate.id,
          sectionId,
          content,
        }),
      });

      console.log("Response status:", response.status);
      console.log("Response headers:", response.headers);

      if (!response.ok) {
        const errorText = await response.text();
        console.error("Response error:", errorText);
        throw new Error(`Failed to save content: ${response.status} ${errorText}`);
      }

      const data = await response.json();
      console.log("Section edit response:", data);

      // Update local state
      if (data.userTemplate) {
        console.log("Updating userTemplate with:", data.userTemplate);
        setUserTemplate(data.userTemplate);
      }

      // Mark section as edited
      if (!editedSections.includes(sectionId)) {
        setEditedSections([...editedSections, sectionId]);
      }
    } catch (error) {
      console.error("Error saving template content:", error);
      throw error; // Re-throw to be caught by the caller
    }
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
            // Cast the callback argument to match our internal handler type
            onUserTemplateSelected={(userTemplate) =>
              handleTemplateSelect(userTemplate as unknown as UserTemplate | null)
            }
            userPlan={userPlan ?? null}
            // Provide a safe userTemplate only when it includes a template
            userTemplate={safeUserTemplate}
          />
        ) : selectedTemplate ? (
          <TemplateEditor
            userTemplate={userTemplate}
            selectedTemplate={selectedTemplate}
            weddingPage={weddingPage}
            userPlan={userPlan}
            onTemplateUpdate={(template) => setSelectedTemplate(template)}
            onContentUpdate={handleContentUpdate}
            editedSections={editedSections}
            onWeddingPageUpdate={(wp) => setWeddingPage(wp)}
            onUserTemplateUpdate={(ut) => setUserTemplate(ut)}
          />
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
