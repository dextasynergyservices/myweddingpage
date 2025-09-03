// src/components/dashboard/EditWeddingDetailsModal.tsx
"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import { useTheme } from "@/contexts/ThemeContext";
import { X, Upload, User, Calendar, MapPin, FileText } from "lucide-react";
import Modal from "@/components/ui/Modal";
import { toast } from "react-toastify";

interface EditWeddingDetailsModalProps {
  isOpen: boolean;
  onClose: () => void;
  initialData: {
    brideName: string;
    groomName: string;
    weddingDate: string;
    venue: string;
    story: string;
    heroImage: string;
    storyImage: string;
  };
  onSave: (formData: FormData) => Promise<void>;
  isSaving: boolean;
}

const EditWeddingDetailsModal = ({
  isOpen,
  onClose,
  initialData,
  onSave,
  isSaving
}: EditWeddingDetailsModalProps) => {
  const { isDarkMode } = useTheme();
  const [formData, setFormData] = useState(initialData);
  const [heroImageFile, setHeroImageFile] = useState<File | null>(null);
  const [storyImageFile, setStoryImageFile] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState({
    hero: initialData.heroImage,
    story: initialData.storyImage
  });

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>, imageType: 'hero' | 'story') => {
    const file = e.target.files?.[0];
    if (file) {
      if (imageType === 'hero') {
        setHeroImageFile(file);
        setImagePreview(prev => ({ ...prev, hero: URL.createObjectURL(file) }));
      } else {
        setStoryImageFile(file);
        setImagePreview(prev => ({ ...prev, story: URL.createObjectURL(file) }));
      }
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    const formDataToSend = new FormData();
    formDataToSend.append("brideName", formData.brideName);
    formDataToSend.append("groomName", formData.groomName);
    formDataToSend.append("weddingDate", formData.weddingDate);
    formDataToSend.append("venue", formData.venue);
    formDataToSend.append("story", formData.story);

    if (heroImageFile) {
      formDataToSend.append("heroImage", heroImageFile);
    }
    if (storyImageFile) {
      formDataToSend.append("storyImage", storyImageFile);
    }

    await onSave(formDataToSend);
  };

  const resetForm = () => {
    setFormData(initialData);
    setHeroImageFile(null);
    setStoryImageFile(null);
    setImagePreview({
      hero: initialData.heroImage,
      story: initialData.storyImage
    });
  };

  const handleClose = () => {
    resetForm();
    onClose();
  };

  return (
    <Modal isOpen={isOpen} onClose={handleClose}>
      <div className={`p-6 rounded-xl max-w-md mx-auto ${isDarkMode ? "bg-slate-800" : "bg-white"}`}>
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

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className={`block text-xs mb-1 ${isDarkMode ? "text-slate-400" : "text-slate-600"}`}>
                Groom's Name
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
              <label className={`block text-xs mb-1 ${isDarkMode ? "text-slate-400" : "text-slate-600"}`}>
                Bride's Name
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
            <label className={`block text-xs mb-1 ${isDarkMode ? "text-slate-400" : "text-slate-600"}`}>
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
            <label className={`block text-xs mb-1 ${isDarkMode ? "text-slate-400" : "text-slate-600"}`}>
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
            <label className={`block text-xs mb-1 ${isDarkMode ? "text-slate-400" : "text-slate-600"}`}>
              Our Love Story
            </label>
            <textarea
              value={formData.story}
              onChange={(e) => setFormData({ ...formData, story: e.target.value })}
              rows={4}
              className={`w-full px-3 py-2 rounded-lg border text-sm ${
                isDarkMode
                  ? "bg-slate-700 border-slate-600 text-white"
                  : "bg-white border-slate-300 text-slate-900"
              }`}
              placeholder="Share your love story..."
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className={`block text-xs mb-1 ${isDarkMode ? "text-slate-400" : "text-slate-600"}`}>
                Hero Image
              </label>
              <div className="flex flex-col gap-2">
                <input
                  type="file"
                  accept="image/*"
                  onChange={(e) => handleImageUpload(e, 'hero')}
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
                  <img src={imagePreview.hero} alt="Hero preview" className="w-full h-20 object-cover rounded" />
                )}
              </div>
            </div>
            <div>
              <label className={`block text-xs mb-1 ${isDarkMode ? "text-slate-400" : "text-slate-600"}`}>
                Story Image
              </label>
              <div className="flex flex-col gap-2">
                <input
                  type="file"
                  accept="image/*"
                  onChange={(e) => handleImageUpload(e, 'story')}
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
                  <img src={imagePreview.story} alt="Story preview" className="w-full h-20 object-cover rounded" />
                )}
              </div>
            </div>
          </div>

          <motion.button
            type="submit"
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            disabled={isSaving}
            className={`w-full px-4 py-2 rounded-lg text-white text-sm ${
              isDarkMode
                ? "bg-blue-600 hover:bg-blue-700"
                : "bg-blue-600 hover:bg-blue-700"
            } disabled:opacity-50 disabled:cursor-not-allowed`}
          >
            {isSaving ? "Updating..." : "Update Details"}
          </motion.button>
        </form>
      </div>
    </Modal>
  );
};

export default EditWeddingDetailsModal;