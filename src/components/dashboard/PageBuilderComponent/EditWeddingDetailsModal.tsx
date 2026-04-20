"use client";

import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { useTheme } from "@/contexts/ThemeContext";
import { X, Upload } from "lucide-react";
import Modal from "@/components/ui/Modal";
import toast from "react-hot-toast";
import Image from "next/image";
import { uploadToApiWithProgress } from "@/lib/upload-with-progress";
import { useUploadProgress, UploadProgress } from "@/components/ui/UploadProgress";
import { useCSRFToken } from "@/hooks/useCSRFToken";
import {
  getStoryComponent,
  getStoryFormFields,
  createInitialStoryData,
  setNestedValue,
  convertFormDataForComponent,
} from "@/lib/story-component-registry";

interface EditWeddingDetailsModalProps {
  isOpen: boolean;
  onClose: () => void;
  section: {
    id: string;
    type: string;
  };
  templateId: string;
  weddingPage?: unknown;
  onSave: (sectionId: string, content: Record<string, unknown>) => Promise<void>;
  isSaving: boolean;
}

const EditWeddingDetailsModal = ({
  isOpen,
  onClose,
  section,
  templateId,
  // weddingPage: _weddingPage,
  onSave,
  isSaving,
}: EditWeddingDetailsModalProps) => {
  const { isDarkMode } = useTheme();
  const { token: csrfToken } = useCSRFToken();
  const [formData, setFormData] = useState({
    brideName: "",
    groomName: "",
    weddingDate: "",
    venue: "",
    story: "",
    heroImage: "",
    storyImage: "",
    logoUrl: "",
    logoAlt: "",
  });
  const [imagePreview, setImagePreview] = useState({
    hero: "",
    story: "",
    logo: "",
  });
  const [loading, setLoading] = useState(false);

  // Upload progress tracking
  const progressHandler = useUploadProgress();

  // Story-specific state
  const [storyFormData, setStoryFormData] = useState<Record<string, unknown>>({});
  const [storyImagePreviews, setStoryImagePreviews] = useState<Record<string, string>>({});

  // Get story component configuration
  const [storyConfig, setStoryConfig] = useState<Record<string, unknown> | null>(null);
  const [storyFormFields, setStoryFormFields] = useState<Record<string, unknown>[]>([]);

  // Load story configuration when modal opens
  useEffect(() => {
    const loadStoryConfig = async () => {
      if (section.type === "STORY") {
        console.log(
          "EditWeddingDetailsModal - Looking for story component for templateId:",
          templateId
        );
        const config = await getStoryComponent(templateId);
        console.log("EditWeddingDetailsModal - Found story config:", config);
        setStoryConfig(config);

        if (config) {
          const fields = await getStoryFormFields(templateId);
          setStoryFormFields(fields);
        }
      }
    };

    if (isOpen) {
      loadStoryConfig();
    }
  }, [section.type, templateId, isOpen]);

  // Load section data when modal opens
  useEffect(() => {
    if (!isOpen || !section || !templateId) return;

    const loadSectionData = async () => {
      setLoading(true);
      try {
        const response = await fetch(
          `/api/template-sections/edit?templateId=${templateId}&sectionId=${section.id}`
        );
        if (response.ok) {
          const data = await response.json();
          const content = data.content || {};

          if (section.type === "STORY" && storyConfig) {
            // Initialize story form data with template defaults and existing content
            const initialStoryData = await createInitialStoryData(templateId, content);
            setStoryFormData(initialStoryData);

            // Set up image previews for story images
            const imagePreviews: Record<string, string> = {};
            storyFormFields.forEach((field) => {
              if (field.type === "file") {
                const value = getNestedValue(initialStoryData, field.key as string);
                if (value && typeof value === "string") {
                  imagePreviews[field.key as string] = value;
                }
              }
            });
            setStoryImagePreviews(imagePreviews);
          } else {
            // Regular form data for HERO section
            setFormData({
              brideName: content.brideName || content.groomName || "",
              groomName: content.groomName || content.brideName || "",
              weddingDate: content.weddingDate || content.date || "",
              venue: content.venue || content.location || "",
              story: content.story || content.text || content.content || "",
              heroImage: content.heroImage || content.hero_image || "",
              storyImage: content.storyImage || content.story_image || "",
              logoUrl: content.logoUrl || content.logo_url || "",
              logoAlt: content.logoAlt || content.logo_alt || "",
            });

            setImagePreview({
              hero: content.heroImage || content.hero_image || "",
              story: content.storyImage || content.story_image || "",
              logo: content.logoUrl || content.logo_url || "",
            });
          }
        }
      } catch (error) {
        console.error("Error loading section data:", error);
        toast.error("Failed to load section data");
      } finally {
        setLoading(false);
      }
    };

    loadSectionData();
  }, [isOpen, section, templateId, storyConfig, storyFormFields]);

  // Helper function to get nested value
  const getNestedValue = (obj: Record<string, unknown>, path: string) => {
    return path
      .split(".")
      .reduce((current: unknown, key) => (current as Record<string, unknown>)?.[key], obj);
  };

  const handleImageUpload = async (
    e: React.ChangeEvent<HTMLInputElement>,
    imageType: "hero" | "story" | "logo" | string
  ) => {
    const file = e.target.files?.[0];
    if (file) {
      // Show preview immediately
      if (imageType === "hero") {
        setImagePreview((prev) => ({
          ...prev,
          hero: URL.createObjectURL(file),
        }));
      } else if (imageType === "story") {
        setImagePreview((prev) => ({
          ...prev,
          story: URL.createObjectURL(file),
        }));
      } else if (imageType === "logo") {
        setImagePreview((prev) => ({
          ...prev,
          logo: URL.createObjectURL(file),
        }));
      } else if (section.type === "STORY") {
        // Handle story-specific image uploads
        setStoryImagePreviews((prev) => ({
          ...prev,
          [imageType]: URL.createObjectURL(file),
        }));
      }

      // Upload to Cloudinary via our API with progress tracking
      try {
        const uploadData = new FormData();
        uploadData.append("file", file);
        uploadData.append("imageType", imageType);

        // Add upload to progress tracker
        progressHandler.addUpload(file.name, file.size);

        const data = await uploadToApiWithProgress("/api/upload-image", uploadData, {
          onProgress: (loaded, total, speed) => {
            progressHandler.updateProgress(file.name, loaded, speed);
          },
          headers: {
            "x-csrf-token": csrfToken || "",
          },
        });

        const uploadResult = data as { secure_url: string };
        const imageUrl = uploadResult.secure_url;
        console.log("Image uploaded successfully:", imageUrl);

        // Mark upload as successful
        progressHandler.setUploadSuccess(file.name);

        // Update form data with the uploaded image URL
        if (imageType === "hero") {
          setFormData((prev) => ({ ...prev, heroImage: imageUrl }));
        } else if (imageType === "story") {
          setFormData((prev) => ({ ...prev, storyImage: imageUrl }));
        } else if (imageType === "logo") {
          setFormData((prev) => ({ ...prev, logoUrl: imageUrl }));

          // Also save logo directly to WeddingPage using the dedicated logo API
          try {
            const logoResponse = await fetch("/api/wedding-pages/logo", {
              method: "POST",
              credentials: "include",
              headers: {
                "Content-Type": "application/json",
                "x-csrf-token": csrfToken || "",
              },
              body: JSON.stringify({
                logoUrl: imageUrl,
                logoAlt: formData.logoAlt || "Wedding Logo",
              }),
            });

            if (logoResponse.ok) {
              await logoResponse.json();
              console.log("Logo saved successfully to WeddingPage");
            } else {
              const errorText = await logoResponse.text();
              console.error("Failed to save logo:", {
                status: logoResponse.status,
                statusText: logoResponse.statusText,
                error: errorText,
              });
            }
          } catch (error) {
            console.error("Error saving logo via dedicated API:", error);
          }
        } else if (section.type === "STORY") {
          // Update story form data with the uploaded image URL
          setStoryFormData((prev: Record<string, unknown>) => {
            const newData = { ...prev };
            setNestedValue(newData, imageType, imageUrl);
            return newData;
          });
        }

        toast.success("Image uploaded successfully! Click 'Update Section' to save it.");
      } catch (error) {
        console.error("Error uploading image:", error);
        progressHandler.setUploadError(
          file.name,
          error instanceof Error ? error.message : "Upload failed"
        );
        toast.error(
          `Failed to upload image: ${error instanceof Error ? error.message : "Unknown error"}`
        );
      }
    }
  };

  // Handle story form field changes
  const handleStoryFieldChange = (fieldKey: string, value: string) => {
    setStoryFormData((prev: Record<string, unknown>) => {
      const newData = { ...prev };
      setNestedValue(newData, fieldKey, value);
      return newData;
    });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    try {
      // Prepare content based on section type
      let content = {};

      if (section.type === "HERO") {
        content = {
          title: `${formData.groomName} & ${formData.brideName}`,
          subtitle: formData.weddingDate,
          venue: formData.venue,
          groomName: formData.groomName,
          brideName: formData.brideName,
          weddingDate: formData.weddingDate,
          heroImage: formData.heroImage,
          logoUrl: formData.logoUrl,
          logoAlt: formData.logoAlt,
        };
        console.log("EditWeddingDetailsModal - Saving HERO content:", content);
        console.log("EditWeddingDetailsModal - Logo data being saved:", {
          logoUrl: formData.logoUrl,
          logoAlt: formData.logoAlt,
          hasLogoUrl: !!formData.logoUrl,
          hasLogoAlt: !!formData.logoAlt,
        });
      } else if (section.type === "STORY") {
        if (storyConfig) {
          // Convert form data to the structure expected by the component
          content = convertFormDataForComponent(storyFormData);
          console.log("EditWeddingDetailsModal - Saving STORY content:", content);
        } else {
          // Fallback to simple story format
          content = {
            text: formData.story,
            content: formData.story,
            story: formData.story,
            imageUrl: formData.storyImage,
            storyImage: formData.storyImage,
          };
          console.log("EditWeddingDetailsModal - Saving STORY content (fallback):", content);
        }
      }

      console.log("EditWeddingDetailsModal - Calling onSave with:", section.id, content);
      await onSave(section.id, content);
      toast.success("Section updated successfully!");
    } catch (error) {
      console.error("EditWeddingDetailsModal - Error saving section:", error);
      toast.error("Failed to update section");
    }
  };

  const resetForm = () => {
    setFormData({
      brideName: "",
      groomName: "",
      weddingDate: "",
      venue: "",
      story: "",
      heroImage: "",
      storyImage: "",
      logoUrl: "",
      logoAlt: "",
    });
    setImagePreview({
      hero: "",
      story: "",
      logo: "",
    });
    setStoryFormData({});
    setStoryImagePreviews({});
  };

  const handleClose = () => {
    resetForm();
    onClose();
  };

  // Render story component for preview
  const renderStoryPreview = () => {
    if (section.type !== "STORY" || !storyConfig) return null;

    const StoryComponent = storyConfig.component as React.ComponentType<Record<string, unknown>>;
    const previewProps = {
      ...(storyConfig.props as Record<string, unknown>),
      ...storyFormData,
      // Add any additional props needed for preview
      userId: "preview",
      gifts: [],
      gallery: [],
      guests: [],
      bankDetails: [],
    };

    return (
      <div className="mb-6 p-4 border rounded-lg bg-gray-50 max-h-96 overflow-y-auto">
        <h3 className="text-sm font-medium text-gray-700 mb-3">Live Preview</h3>
        <div className="transform scale-75 origin-top">
          <StoryComponent {...previewProps} />
        </div>
      </div>
    );
  };

  // Render story form fields
  const renderStoryFormFields = () => {
    if (section.type !== "STORY" || !storyFormFields.length) return null;

    return (
      <div className="space-y-4">
        <h3 className="text-sm font-medium text-gray-700 mb-3">Edit Story Content</h3>
        {storyFormFields.map((field, index) => (
          <div key={index}>
            <label
              className={`block text-xs mb-1 ${isDarkMode ? "text-slate-400" : "text-slate-600"}`}
            >
              {field.label as string}
            </label>
            {field.type === "textarea" ? (
              <textarea
                value={(getNestedValue(storyFormData, field.key as string) as string) || ""}
                onChange={(e) => handleStoryFieldChange(field.key as string, e.target.value)}
                rows={4}
                className={`w-full px-3 py-2 rounded-lg border text-sm ${
                  isDarkMode
                    ? "bg-slate-700 border-slate-600 text-white"
                    : "bg-white border-slate-300 text-slate-900"
                }`}
                placeholder={field.defaultValue as string}
              />
            ) : field.type === "file" ? (
              <div className="flex flex-col gap-2">
                <input
                  type="file"
                  accept="image/*"
                  onChange={(e) => handleImageUpload(e, field.key as string)}
                  className="hidden"
                  id={`story-${field.key}`}
                />
                <label
                  htmlFor={`story-${field.key}`}
                  className="flex items-center justify-center gap-2 px-3 py-2 border border-dashed rounded-lg cursor-pointer text-sm"
                >
                  <Upload className="h-4 w-4" />
                  Upload {field.label as string}
                </label>
                {storyImagePreviews[field.key as string] && (
                  <Image
                    src={storyImagePreviews[field.key as string]}
                    alt={`${field.label as string} preview`}
                    width={400}
                    height={80}
                    className="w-full h-20 object-cover rounded"
                  />
                )}
              </div>
            ) : (
              <input
                type={
                  field.type as
                    | "text"
                    | "email"
                    | "password"
                    | "number"
                    | "tel"
                    | "url"
                    | "search"
                    | "date"
                    | "time"
                    | "datetime-local"
                    | "month"
                    | "week"
                    | "color"
                    | "file"
                    | "hidden"
                    | "image"
                    | "submit"
                    | "reset"
                    | "button"
                }
                value={(getNestedValue(storyFormData, field.key as string) as string) || ""}
                onChange={(e) => handleStoryFieldChange(field.key as string, e.target.value)}
                className={`w-full px-3 py-2 rounded-lg border text-sm ${
                  isDarkMode
                    ? "bg-slate-700 border-slate-600 text-white"
                    : "bg-white border-slate-300 text-slate-900"
                }`}
                placeholder={field.defaultValue as string}
              />
            )}
          </div>
        ))}
      </div>
    );
  };

  return (
    <Modal isOpen={isOpen} onClose={handleClose} size="xl">
      <div
        className={`p-6 rounded-xl max-w-6xl mx-auto ${isDarkMode ? "bg-slate-800" : "bg-white"}`}
      >
        <div className="flex items-center justify-between mb-6">
          <h2 className={`text-xl font-semibold ${isDarkMode ? "text-white" : "text-slate-900"}`}>
            Edit {section.type === "STORY" ? "Story" : "Wedding"} Details
          </h2>
          <motion.button
            whileHover={{ rotate: 90 }}
            onClick={handleClose}
            className={`p-1 rounded-full ${isDarkMode ? "hover:bg-slate-700" : "hover:bg-slate-100"}`}
          >
            <X className="h-5 w-5" />
          </motion.button>
        </div>

        {loading ? (
          <div className="flex items-center justify-center h-32">
            <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-indigo-500"></div>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Story Preview + Form Layout */}
            {section.type === "STORY" && storyConfig ? (
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* Left side: Live Preview */}
                <div className="lg:order-1">{renderStoryPreview()}</div>

                {/* Right side: Form Fields */}
                <div className="lg:order-2">{renderStoryFormFields()}</div>
              </div>
            ) : (
              /* Regular HERO section form */
              section.type === "HERO" && (
                <div className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label
                        className={`block text-xs mb-1 ${isDarkMode ? "text-slate-400" : "text-slate-600"}`}
                      >
                        Groom&apos;s Name
                      </label>
                      <input
                        type="text"
                        value={formData.groomName}
                        onChange={(e) =>
                          setFormData({
                            ...formData,
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
                    <div>
                      <label
                        className={`block text-xs mb-1 ${isDarkMode ? "text-slate-400" : "text-slate-600"}`}
                      >
                        Bride&apos;s Name
                      </label>
                      <input
                        type="text"
                        value={formData.brideName}
                        onChange={(e) =>
                          setFormData({
                            ...formData,
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
                  </div>

                  <div>
                    <label
                      className={`block text-xs mb-1 ${isDarkMode ? "text-slate-400" : "text-slate-600"}`}
                    >
                      Wedding Date
                    </label>
                    <input
                      type="date"
                      value={formData.weddingDate}
                      onChange={(e) =>
                        setFormData({
                          ...formData,
                          weddingDate: e.target.value,
                        })
                      }
                      className={`w-full px-3 py-2 rounded-lg border text-sm ${
                        isDarkMode
                          ? "bg-slate-700 border-slate-600 text-white"
                          : "bg-white border-slate-300 text-slate-900"
                      }`}
                    />
                  </div>

                  <div>
                    <label
                      className={`block text-xs mb-1 ${isDarkMode ? "text-slate-400" : "text-slate-600"}`}
                    >
                      Venue
                    </label>
                    <input
                      type="text"
                      value={formData.venue}
                      onChange={(e) => setFormData({ ...formData, venue: e.target.value })}
                      className={`w-full px-3 py-2 rounded-lg border text-sm ${
                        isDarkMode
                          ? "bg-slate-700 border-slate-600 text-white"
                          : "bg-white border-slate-300 text-slate-900"
                      }`}
                      placeholder="Wedding venue"
                    />
                  </div>

                  <div>
                    <label
                      className={`block text-xs mb-1 ${isDarkMode ? "text-slate-400" : "text-slate-600"}`}
                    >
                      Hero Image
                    </label>
                    <div className="flex flex-col gap-2">
                      <input
                        type="file"
                        accept="image/*"
                        onChange={(e) => handleImageUpload(e, "hero")}
                        className="hidden"
                        id="heroImage"
                      />
                      <label
                        htmlFor="heroImage"
                        className="flex items-center justify-center gap-2 px-3 py-2 border border-dashed rounded-lg cursor-pointer text-sm"
                      >
                        <Upload className="h-4 w-4" />
                        Upload Hero Image
                      </label>
                      {imagePreview.hero && (
                        <Image
                          src={imagePreview.hero}
                          alt="Hero preview"
                          width={400}
                          height={80}
                          className="w-full h-20 object-cover rounded"
                        />
                      )}
                    </div>
                  </div>

                  <div>
                    <label
                      className={`block text-xs mb-1 ${isDarkMode ? "text-slate-400" : "text-slate-600"}`}
                    >
                      Wedding Logo (Optional)
                    </label>
                    <div className="flex flex-col gap-2">
                      <input
                        type="file"
                        accept="image/*"
                        onChange={(e) => handleImageUpload(e, "logo")}
                        className="hidden"
                        id="logoImage"
                      />
                      <label
                        htmlFor="logoImage"
                        className="flex items-center justify-center gap-2 px-3 py-2 border border-dashed rounded-lg cursor-pointer text-sm"
                      >
                        <Upload className="h-4 w-4" />
                        Upload Logo
                      </label>
                      {imagePreview.logo && (
                        <div className="flex items-center gap-2">
                          <Image
                            src={imagePreview.logo}
                            alt="Logo preview"
                            width={60}
                            height={60}
                            className="w-15 h-15 object-contain rounded border"
                          />
                          <div className="flex-1">
                            <input
                              type="text"
                              value={formData.logoAlt}
                              onChange={async (e) => {
                                const newAltText = e.target.value;
                                setFormData({
                                  ...formData,
                                  logoAlt: newAltText,
                                });

                                // Also update logo alt text in WeddingPage if logo URL exists
                                if (formData.logoUrl) {
                                  try {
                                    const logoResponse = await fetch("/api/wedding-pages/logo", {
                                      method: "POST",
                                      credentials: "include",
                                      headers: {
                                        "Content-Type": "application/json",
                                        "x-csrf-token": csrfToken || "",
                                      },
                                      body: JSON.stringify({
                                        logoUrl: formData.logoUrl,
                                        logoAlt: newAltText || "Wedding Logo",
                                      }),
                                    });

                                    if (logoResponse.ok) {
                                      console.log("Logo alt text updated successfully");
                                    } else {
                                      const errorText = await logoResponse.text();
                                      console.error("Failed to update logo alt text:", {
                                        status: logoResponse.status,
                                        statusText: logoResponse.statusText,
                                        error: errorText,
                                      });
                                    }
                                  } catch (error) {
                                    console.error("Error updating logo alt text:", error);
                                  }
                                }
                              }}
                              className={`w-full px-2 py-1 rounded border text-xs ${
                                isDarkMode
                                  ? "bg-slate-700 border-slate-600 text-white"
                                  : "bg-white border-slate-300 text-slate-900"
                              }`}
                              placeholder="Logo alt text (for accessibility)"
                            />
                          </div>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              )
            )}

            <motion.button
              type="submit"
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              disabled={isSaving}
              className={`w-full px-4 py-2 rounded-lg text-white text-sm ${
                isDarkMode ? "bg-blue-600 hover:bg-blue-700" : "bg-blue-600 hover:bg-blue-700"
              } disabled:opacity-50 disabled:cursor-not-allowed`}
            >
              {isSaving ? "Updating..." : "Update Section"}
            </motion.button>
          </form>
        )}
      </div>

      {/* Upload Progress Indicator */}
      <UploadProgress
        uploads={progressHandler.uploads}
        onCancel={(fileName: string) => progressHandler.removeUpload(fileName)}
        onRetry={(fileName: string) => {
          // Find the file input that was used for this upload and trigger re-upload
          // For now, just remove the failed upload
          progressHandler.removeUpload(fileName);
        }}
        onDismiss={(fileName: string) => progressHandler.removeUpload(fileName)}
      />
    </Modal>
  );
};

export default EditWeddingDetailsModal;
