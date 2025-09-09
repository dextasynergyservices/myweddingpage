"use client";

import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { useTheme } from "@/contexts/ThemeContext";
import { X, Upload } from "lucide-react";
import Modal from "@/components/ui/Modal";
import toast from "react-hot-toast";
import Image from "next/image";

interface EditWeddingDetailsModalProps {
  isOpen: boolean;
  onClose: () => void;
  section: {
    id: string;
    type: string;
  };
  templateId: string;
  onSave: (sectionId: string, content: Record<string, unknown>) => Promise<void>;
  isSaving: boolean;
}

const EditWeddingDetailsModal = ({
  isOpen,
  onClose,
  section,
  templateId,
  onSave,
  isSaving,
}: EditWeddingDetailsModalProps) => {
  const { isDarkMode } = useTheme();
  const [formData, setFormData] = useState({
    brideName: "",
    groomName: "",
    weddingDate: "",
    venue: "",
    story: "",
    heroImage: "",
    storyImage: "",
  });
  const [imagePreview, setImagePreview] = useState({
    hero: "",
    story: "",
  });
  const [loading, setLoading] = useState(false);

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

          setFormData({
            brideName: content.brideName || content.groomName || "",
            groomName: content.groomName || content.brideName || "",
            weddingDate: content.weddingDate || content.date || "",
            venue: content.venue || content.location || "",
            story: content.story || content.text || content.content || "",
            heroImage: content.heroImage || content.hero_image || "",
            storyImage: content.storyImage || content.story_image || "",
          });

          setImagePreview({
            hero: content.heroImage || content.hero_image || "",
            story: content.storyImage || content.story_image || "",
          });
        }
      } catch (error) {
        console.error("Error loading section data:", error);
        toast.error("Failed to load section data");
      } finally {
        setLoading(false);
      }
    };

    loadSectionData();
  }, [isOpen, section, templateId]);

  const handleImageUpload = async (
    e: React.ChangeEvent<HTMLInputElement>,
    imageType: "hero" | "story"
  ) => {
    const file = e.target.files?.[0];
    if (file) {
      // Show preview immediately
      if (imageType === "hero") {
        setHeroImageFile(file);
        setImagePreview((prev) => ({ ...prev, hero: URL.createObjectURL(file) }));
      } else {
        setStoryImageFile(file);
        setImagePreview((prev) => ({ ...prev, story: URL.createObjectURL(file) }));
      }

      // Upload to Cloudinary via our API
      try {
        const formData = new FormData();
        formData.append("file", file);
        formData.append("imageType", imageType);

        const response = await fetch("/api/upload-image", {
          method: "POST",
          body: formData,
        });

        if (response.ok) {
          const data = await response.json();
          const imageUrl = data.secure_url;
          console.log("Image uploaded successfully:", imageUrl);

          // Update form data with the uploaded image URL
          if (imageType === "hero") {
            setFormData((prev) => ({ ...prev, heroImage: imageUrl }));
          } else {
            setFormData((prev) => ({ ...prev, storyImage: imageUrl }));
          }

          toast.success("Image uploaded successfully!");
        } else {
          const errorData = await response.json();
          console.error("Image upload failed:", errorData);
          throw new Error(errorData.error || "Failed to upload image");
        }
      } catch (error) {
        console.error("Error uploading image:", error);
        toast.error(
          `Failed to upload image: ${error instanceof Error ? error.message : "Unknown error"}`
        );
      }
    }
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
        };
      } else if (section.type === "STORY") {
        content = {
          text: formData.story,
          content: formData.story,
          story: formData.story,
          imageUrl: formData.storyImage, // Save as imageUrl to match template structure
          storyImage: formData.storyImage, // Keep for backward compatibility
        };
      }

      await onSave(section.id, content);
      toast.success("Section updated successfully!");
    } catch {
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
    });
    setHeroImageFile(null);
    setStoryImageFile(null);
    setImagePreview({
      hero: "",
      story: "",
    });
  };

  const handleClose = () => {
    resetForm();
    onClose();
  };

  return (
    <Modal isOpen={isOpen} onClose={handleClose}>
      <div
        className={`p-6 rounded-xl max-w-md mx-auto ${isDarkMode ? "bg-slate-800" : "bg-white"}`}
      >
        <div className="flex items-center justify-between mb-6">
          <h2 className={`text-xl font-semibold ${isDarkMode ? "text-white" : "text-slate-900"}`}>
            Edit Wedding Details
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
          <form onSubmit={handleSubmit} className="space-y-4">
            {section.type === "HERO" && (
              <>
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
                      onChange={(e) => setFormData({ ...formData, groomName: e.target.value })}
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
                      onChange={(e) => setFormData({ ...formData, brideName: e.target.value })}
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
                    onChange={(e) => setFormData({ ...formData, weddingDate: e.target.value })}
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
              </>
            )}

            {section.type === "STORY" && (
              <>
                <div>
                  <label
                    className={`block text-xs mb-1 ${isDarkMode ? "text-slate-400" : "text-slate-600"}`}
                  >
                    Our Love Story
                  </label>
                  <textarea
                    value={formData.story}
                    onChange={(e) => setFormData({ ...formData, story: e.target.value })}
                    rows={6}
                    className={`w-full px-3 py-2 rounded-lg border text-sm ${
                      isDarkMode
                        ? "bg-slate-700 border-slate-600 text-white"
                        : "bg-white border-slate-300 text-slate-900"
                    }`}
                    placeholder="Share your love story..."
                  />
                </div>

                <div>
                  <label
                    className={`block text-xs mb-1 ${isDarkMode ? "text-slate-400" : "text-slate-600"}`}
                  >
                    Story Image
                  </label>
                  <div className="flex flex-col gap-2">
                    <input
                      type="file"
                      accept="image/*"
                      onChange={(e) => handleImageUpload(e, "story")}
                      className="hidden"
                      id="storyImage"
                    />
                    <label
                      htmlFor="storyImage"
                      className="flex items-center justify-center gap-2 px-3 py-2 border border-dashed rounded-lg cursor-pointer text-sm"
                    >
                      <Upload className="h-4 w-4" />
                      Upload Story Image
                    </label>
                    {imagePreview.story && (
                      <Image
                        src={imagePreview.story}
                        alt="Story preview"
                        width={400}
                        height={80}
                        className="w-full h-20 object-cover rounded"
                      />
                    )}
                  </div>
                </div>
              </>
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
    </Modal>
  );
};

export default EditWeddingDetailsModal;
