/**
 * Custom React hook for managing template customization
 * Provides easy access to save and fetch customization data
 */

import { useState, useCallback } from "react";
import {
  UserCustomization,
  SaveCustomizationResponse,
  GetCustomizationResponse,
  DEFAULT_CUSTOMIZATION,
} from "@/types/customization";

interface UseCustomizationReturn {
  customization: UserCustomization | null;
  isLoading: boolean;
  isSaving: boolean;
  error: string | null;
  fetchCustomization: (templateId: string) => Promise<void>;
  saveCustomization: (
    templateId: string,
    customization: UserCustomization
  ) => Promise<boolean>;
  resetToDefaults: () => void;
}

/**
 * Hook for managing template customization
 */
export function useCustomization(): UseCustomizationReturn {
  const [customization, setCustomization] = useState<UserCustomization | null>(
    null
  );
  const [isLoading, setIsLoading] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  /**
   * Fetches customization for a template
   */
  const fetchCustomization = useCallback(async (templateId: string) => {
    setIsLoading(true);
    setError(null);

    try {
      const response = await fetch(
        `/api/user/templates/${templateId}/customization`,
        {
          method: "GET",
          credentials: "include",
        }
      );

      if (!response.ok) {
        throw new Error(
          `Failed to fetch customization: ${response.statusText}`
        );
      }

      const data: GetCustomizationResponse = await response.json();

      if (data.success) {
        setCustomization(data.customization || DEFAULT_CUSTOMIZATION);
      } else {
        throw new Error(data.message || "Failed to fetch customization");
      }
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : "Unknown error";
      setError(errorMessage);
      console.error("Error fetching customization:", err);
      // Set default customization on error
      setCustomization(DEFAULT_CUSTOMIZATION);
    } finally {
      setIsLoading(false);
    }
  }, []);

  /**
   * Saves customization for a template
   */
  const saveCustomization = useCallback(
    async (
      templateId: string,
      customization: UserCustomization
    ): Promise<boolean> => {
      setIsSaving(true);
      setError(null);

      try {
        const response = await fetch("/api/user/templates/customize", {
          method: "PUT",
          credentials: "include",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            templateId,
            customization,
          }),
        });

        if (!response.ok) {
          const errorData = await response.json();
          throw new Error(
            errorData.error ||
              `Failed to save customization: ${response.statusText}`
          );
        }

        const data: SaveCustomizationResponse = await response.json();

        if (data.success) {
          setCustomization(data.userTemplate.colorScheme);
          return true;
        } else {
          throw new Error(data.message || "Failed to save customization");
        }
      } catch (err) {
        const errorMessage =
          err instanceof Error ? err.message : "Unknown error";
        setError(errorMessage);
        console.error("Error saving customization:", err);
        return false;
      } finally {
        setIsSaving(false);
      }
    },
    []
  );

  /**
   * Resets customization to defaults
   */
  const resetToDefaults = useCallback(() => {
    setCustomization(DEFAULT_CUSTOMIZATION);
    setError(null);
  }, []);

  return {
    customization,
    isLoading,
    isSaving,
    error,
    fetchCustomization,
    saveCustomization,
    resetToDefaults,
  };
}
