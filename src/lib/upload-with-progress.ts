/**
 * Upload utilities with progress tracking support
 * Provides XMLHttpRequest-based uploads with detailed progress information
 */

export interface UploadProgressCallback {
  onProgress?: (
    loaded: number,
    total: number,
    percentage: number,
    speed?: number
  ) => void;
  onSuccess?: (response: unknown) => void;
  onError?: (error: string) => void;
  onStart?: () => void;
  onComplete?: () => void;
}

interface UploadOptions extends UploadProgressCallback {
  method?: "POST" | "PUT";
  headers?: Record<string, string>;
  timeout?: number; // milliseconds
}

/**
 * Upload file with progress tracking using XMLHttpRequest
 */
export const uploadWithProgress = async (
  url: string,
  file: File | FormData,
  options: UploadOptions = {}
): Promise<unknown> => {
  return new Promise((resolve, reject) => {
    const xhr = new XMLHttpRequest();
    const startTime = Date.now();
    let lastProgressTime = startTime;
    let lastLoaded = 0;

    // Setup progress tracking
    xhr.upload.addEventListener("progress", (event) => {
      if (event.lengthComputable) {
        const currentTime = Date.now();
        const timeElapsed = (currentTime - lastProgressTime) / 1000; // seconds
        const bytesUploaded = event.loaded - lastLoaded;

        // Calculate upload speed (bytes per second)
        const speed = timeElapsed > 0 ? bytesUploaded / timeElapsed : 0;
        const percentage = (event.loaded / event.total) * 100;

        // Update tracking variables
        lastProgressTime = currentTime;
        lastLoaded = event.loaded;

        // Call progress callback
        options.onProgress?.(event.loaded, event.total, percentage, speed);
      }
    });

    // Setup response handlers
    xhr.addEventListener("loadstart", () => {
      options.onStart?.();
    });

    xhr.addEventListener("load", () => {
      if (xhr.status >= 200 && xhr.status < 300) {
        try {
          const response = JSON.parse(xhr.responseText);
          options.onSuccess?.(response);
          options.onComplete?.();
          resolve(response);
        } catch {
          const errorMsg = "Invalid JSON response from server";
          options.onError?.(errorMsg);
          options.onComplete?.();
          reject(new Error(errorMsg));
        }
      } else {
        let errorMsg = `Upload failed with status ${xhr.status}`;
        try {
          const errorResponse = JSON.parse(xhr.responseText);
          errorMsg = errorResponse.error || errorResponse.message || errorMsg;
        } catch {
          // Use default error message
        }
        options.onError?.(errorMsg);
        options.onComplete?.();
        reject(new Error(errorMsg));
      }
    });

    xhr.addEventListener("error", () => {
      const errorMsg = "Network error occurred during upload";
      options.onError?.(errorMsg);
      options.onComplete?.();
      reject(new Error(errorMsg));
    });

    xhr.addEventListener("timeout", () => {
      const errorMsg = "Upload timed out";
      options.onError?.(errorMsg);
      options.onComplete?.();
      reject(new Error(errorMsg));
    });

    xhr.addEventListener("abort", () => {
      const errorMsg = "Upload was cancelled";
      options.onError?.(errorMsg);
      options.onComplete?.();
      reject(new Error(errorMsg));
    });

    // Configure request
    xhr.open(options.method || "POST", url);

    // Set timeout if specified
    if (options.timeout) {
      xhr.timeout = options.timeout;
    }

    // Set headers
    if (options.headers) {
      Object.entries(options.headers).forEach(([key, value]) => {
        xhr.setRequestHeader(key, value);
      });
    }

    // Prepare data
    let data: FormData | File;
    if (file instanceof FormData) {
      data = file;
    } else {
      data = file;
    }

    // Send request
    xhr.send(data);

    // Return abort function for cancellation support
    return {
      abort: () => xhr.abort(),
      xhr,
    };
  });
};

/**
 * Upload multiple files with progress tracking
 */
export const uploadMultipleWithProgress = async (
  uploads: Array<{
    url: string;
    file: File | FormData;
    options?: UploadOptions;
  }>,
  globalOptions?: {
    onOverallProgress?: (
      completed: number,
      total: number,
      percentage: number
    ) => void;
    onFileComplete?: (index: number, response: unknown) => void;
    onFileError?: (index: number, error: string) => void;
    concurrent?: boolean;
  }
): Promise<unknown[]> => {
  const results: unknown[] = [];
  let completed = 0;

  const updateOverallProgress = () => {
    const percentage = (completed / uploads.length) * 100;
    globalOptions?.onOverallProgress?.(completed, uploads.length, percentage);
  };

  const uploadSingle = async (upload: (typeof uploads)[0], index: number) => {
    try {
      const result = await uploadWithProgress(upload.url, upload.file, {
        ...upload.options,
        onSuccess: (response) => {
          upload.options?.onSuccess?.(response);
          globalOptions?.onFileComplete?.(index, response);
          completed++;
          updateOverallProgress();
        },
        onError: (error) => {
          upload.options?.onError?.(error);
          globalOptions?.onFileError?.(index, error);
          completed++;
          updateOverallProgress();
        },
      });
      results[index] = result;
      return result;
    } catch (error) {
      results[index] = {
        error: error instanceof Error ? error.message : String(error),
      };
      throw error;
    }
  };

  if (globalOptions?.concurrent) {
    // Upload all files concurrently
    const promises = uploads.map(
      (upload, index) => uploadSingle(upload, index).catch(() => {}) // Don't fail the whole batch
    );
    await Promise.all(promises);
  } else {
    // Upload files sequentially
    for (let i = 0; i < uploads.length; i++) {
      try {
        await uploadSingle(uploads[i], i);
      } catch {
        // Continue with next file even if this one fails
      }
    }
  }

  return results;
};

/**
 * Direct Cloudinary upload with progress
 */
export const uploadToCloudinaryWithProgress = async (
  file: File,
  uploadPreset: string,
  options: UploadProgressCallback & {
    cloudName?: string;
    folder?: string;
    publicId?: string;
    transformation?: string;
    resourceType?: "auto" | "image" | "video" | "raw";
    tags?: string[];
  } = {}
): Promise<unknown> => {
  const cloudName =
    options.cloudName || process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME;
  if (!cloudName) {
    throw new Error("Cloudinary cloud name is required");
  }

  const formData = new FormData();
  formData.append("file", file);
  formData.append("upload_preset", uploadPreset);

  if (options.folder) formData.append("folder", options.folder);
  if (options.publicId) formData.append("public_id", options.publicId);
  if (options.transformation)
    formData.append("transformation", options.transformation);
  if (options.resourceType)
    formData.append("resource_type", options.resourceType);
  if (options.tags) formData.append("tags", options.tags.join(","));

  const url = `https://api.cloudinary.com/v1_1/${cloudName}/${options.resourceType || "auto"}/upload`;

  return uploadWithProgress(url, formData, {
    onProgress: options.onProgress,
    onSuccess: options.onSuccess,
    onError: options.onError,
    onStart: options.onStart,
    onComplete: options.onComplete,
    timeout: 120000, // 2 minutes timeout for large files
  });
};

/**
 * Upload to API endpoint with progress
 */
export const uploadToApiWithProgress = async (
  endpoint: string,
  fileOrFormData: File | FormData,
  options: UploadProgressCallback & {
    uploadType?: string;
    additionalData?: Record<string, string | Blob>;
    headers?: Record<string, string>;
  } = {}
): Promise<unknown> => {
  let formData: FormData;

  if (fileOrFormData instanceof FormData) {
    // Use the provided FormData directly
    formData = fileOrFormData;

    // Add uploadType if provided and not already in FormData
    if (options.uploadType && !formData.has("uploadType")) {
      formData.append("uploadType", options.uploadType);
    }
  } else {
    // Create FormData from File
    formData = new FormData();
    formData.append("file", fileOrFormData);

    if (options.uploadType) {
      formData.append("uploadType", options.uploadType);
    }
  }

  // Add any additional form data (only if not already present)
  if (options.additionalData) {
    Object.entries(options.additionalData).forEach(([key, value]) => {
      if (!formData.has(key)) {
        formData.append(key, value);
      }
    });
  }

  return uploadWithProgress(endpoint, formData, {
    onProgress: options.onProgress,
    onSuccess: options.onSuccess,
    onError: options.onError,
    onStart: options.onStart,
    onComplete: options.onComplete,
    headers: options.headers,
    timeout: 120000, // 2 minutes timeout
  });
};

const uploadUtilities = {
  uploadWithProgress,
  uploadMultipleWithProgress,
  uploadToCloudinaryWithProgress,
  uploadToApiWithProgress,
};

export default uploadUtilities;
