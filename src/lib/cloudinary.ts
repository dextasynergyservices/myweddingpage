import { v2 as cloudinary } from "cloudinary";

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME!,
  api_key: process.env.CLOUDINARY_API_KEY!,
  api_secret: process.env.CLOUDINARY_API_SECRET!,
});

// Client-side upload configuration
export const getCloudinaryConfig = () => ({
  cloudName: process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME!,
  uploadPreset: process.env.NEXT_PUBLIC_CLOUDINARY_UPLOAD_PRESET!,
});

// Direct upload function for client-side use
export const uploadToCloudinary = async (
  file: File,
  options: {
    resourceType?: "image" | "video" | "auto";
    folder?: string;
    publicId?: string;
  } = {}
) => {
  const config = getCloudinaryConfig();
  const formData = new FormData();

  formData.append("file", file);
  formData.append("upload_preset", config.uploadPreset);

  if (options.folder) {
    formData.append("folder", options.folder);
  }

  if (options.publicId) {
    formData.append("public_id", options.publicId);
  }

  const resourceType = options.resourceType || "auto";
  const uploadUrl = `https://api.cloudinary.com/v1_1/${config.cloudName}/${resourceType}/upload`;

  const response = await fetch(uploadUrl, {
    method: "POST",
    body: formData,
  });

  if (!response.ok) {
    throw new Error(`Cloudinary upload failed: ${response.statusText}`);
  }

  return response.json();
};

export default cloudinary;
