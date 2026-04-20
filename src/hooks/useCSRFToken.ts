/**
 * Client-side CSRF Token Management
 *
 * This hook provides CSRF token functionality for client-side forms
 * Fetches token from API and manages state
 *
 * @module useCSRFToken
 */

import { useState, useEffect } from "react";

export interface CSRFTokenState {
  token: string | null;
  loading: boolean;
  error: string | null;
}

/**
 * Hook to fetch and manage CSRF token
 *
 * @returns CSRF token state and refresh function
 */
export function useCSRFToken() {
  const [state, setState] = useState<CSRFTokenState>({
    token: null,
    loading: true,
    error: null,
  });

  const fetchToken = async () => {
    try {
      setState((prev) => ({ ...prev, loading: true, error: null }));

      const response = await fetch("/api/csrf-token", {
        method: "GET",
        credentials: "include", // Important: include cookies
      });

      if (!response.ok) {
        throw new Error("Failed to fetch CSRF token");
      }

      const data = await response.json();

      setState({
        token: data.csrfToken,
        loading: false,
        error: null,
      });
    } catch (error) {
      setState({
        token: null,
        loading: false,
        error: error instanceof Error ? error.message : "Unknown error",
      });
    }
  };

  useEffect(() => {
    fetchToken();
  }, []);

  return {
    ...state,
    refresh: fetchToken,
  };
}

/**
 * Get CSRF token from cookie (client-side)
 *
 * @returns CSRF token from cookie or null
 */
export function getCSRFTokenFromCookie(): string | null {
  if (typeof document === "undefined") {
    return null;
  }

  const cookies = document.cookie.split("; ");
  const csrfCookie = cookies.find((cookie) => cookie.startsWith("csrf_token="));

  if (!csrfCookie) {
    return null;
  }

  return csrfCookie.split("=")[1];
}

/**
 * Add CSRF token to FormData
 *
 * @param formData - FormData object
 * @param token - CSRF token
 * @returns Modified FormData
 */
export function addCSRFTokenToFormData(
  formData: FormData,
  token: string
): FormData {
  formData.append("_csrf", token);
  return formData;
}

/**
 * Add CSRF token to fetch headers
 *
 * @param headers - Request headers
 * @param token - CSRF token
 * @returns Modified headers
 */
export function addCSRFTokenToHeaders(
  headers: HeadersInit = {},
  token: string
): HeadersInit {
  return {
    ...headers,
    "x-csrf-token": token,
  };
}

/**
 * Create a fetch wrapper with automatic CSRF token injection
 *
 * @param token - CSRF token
 * @returns Fetch function with CSRF token
 */
export function createCSRFProtectedFetch(token: string) {
  return async (url: string, options: RequestInit = {}) => {
    const method = options.method?.toUpperCase() || "GET";

    // Only add token for state-changing methods
    if (["POST", "PUT", "DELETE", "PATCH"].includes(method)) {
      options.headers = addCSRFTokenToHeaders(options.headers, token);
      options.credentials = "include"; // Ensure cookies are sent
    }

    return fetch(url, options);
  };
}

const csrfHooks = {
  useCSRFToken,
};

export default csrfHooks;
