import { useState, useEffect, useCallback } from "react";

interface GracePeriodStatus {
  status:
    | "active"
    | "grace-period"
    | "just-expired"
    | "deletion-pending"
    | "no-plan";
  isExpired: boolean;
  graceDaysLeft: number;
  message: string;
  canEdit: boolean;
  restrictions: string[];
}

interface UseGracePeriodOptions {
  userId?: string;
  autoRefresh?: boolean;
  refreshInterval?: number;
}

export function useGracePeriod(options: UseGracePeriodOptions = {}) {
  const { userId, autoRefresh = true, refreshInterval = 30000 } = options;

  const [status, setStatus] = useState<GracePeriodStatus>({
    status: "active",
    isExpired: false,
    graceDaysLeft: 0,
    message: "",
    canEdit: true,
    restrictions: [],
  });

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchStatus = useCallback(async () => {
    if (!userId) {
      setLoading(false);
      return;
    }

    try {
      setError(null);
      const response = await fetch(`/api/user/grace-period?userId=${userId}`);

      if (!response.ok) {
        throw new Error("Failed to fetch grace period status");
      }

      const data = await response.json();

      setStatus({
        status: data.status || "active",
        isExpired: data.subscription?.isExpired || false,
        graceDaysLeft: data.graceDaysLeft || 0,
        message: getStatusMessage(data.status, data.graceDaysLeft),
        canEdit: data.status === "active",
        restrictions: data.status === "grace-period" ? ["read-only"] : [],
      });
    } catch (err) {
      console.error("Error fetching grace period status:", err);
      setError(err instanceof Error ? err.message : "Unknown error");
    } finally {
      setLoading(false);
    }
  }, [userId]);

  const activateGracePeriod = async () => {
    if (!userId) return false;

    try {
      const response = await fetch("/api/user/grace-period", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ userId }),
      });

      if (!response.ok) {
        throw new Error("Failed to activate grace period");
      }

      await fetchStatus(); // Refresh status
      return true;
    } catch (err) {
      console.error("Error activating grace period:", err);
      setError(
        err instanceof Error ? err.message : "Failed to activate grace period"
      );
      return false;
    }
  };

  useEffect(() => {
    fetchStatus();
  }, [fetchStatus]);

  useEffect(() => {
    if (!autoRefresh || !userId) return;

    const interval = setInterval(fetchStatus, refreshInterval);
    return () => clearInterval(interval);
  }, [autoRefresh, refreshInterval, userId, fetchStatus]);

  return {
    ...status,
    loading,
    error,
    refresh: fetchStatus,
    activateGracePeriod,
  };
}

function getStatusMessage(status: string, graceDaysLeft: number): string {
  switch (status) {
    case "active":
      return "Plan is active";
    case "grace-period":
      return `Grace period: ${graceDaysLeft} day${graceDaysLeft !== 1 ? "s" : ""} left`;
    case "just-expired":
      return "Plan expired - Grace period available";
    case "deletion-pending":
      return "Grace period ended - Deletion pending";
    default:
      return "Status unknown";
  }
}

// Hook specifically for wedding page protection
export function useWeddingPageProtection(slug?: string, userId?: string) {
  const [protection, setProtection] = useState<{
    status: "active" | "grace-period" | "deleted";
    restrictions: string[];
    graceDaysLeft: number;
    message: string;
    canAccess: boolean;
  }>({
    status: "active",
    restrictions: [],
    graceDaysLeft: 0,
    message: "",
    canAccess: true,
  });

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!slug) {
      setLoading(false);
      return;
    }

    const checkProtection = async () => {
      try {
        setError(null);
        const params = new URLSearchParams({ slug });
        if (userId) params.append("userId", userId);

        const response = await fetch(`/api/wedding-page/protection?${params}`);

        if (response.status === 410) {
          // Page is deleted
          setProtection({
            status: "deleted",
            restrictions: ["deleted"],
            graceDaysLeft: 0,
            message: "This wedding page is no longer available",
            canAccess: false,
          });
          return;
        }

        if (!response.ok) {
          throw new Error("Failed to check page protection");
        }

        const data = await response.json();

        setProtection({
          status: data.status || "active",
          restrictions: data.restrictions || [],
          graceDaysLeft: data.graceDaysLeft || 0,
          message: data.message || "",
          canAccess: data.status !== "deleted",
        });
      } catch (err) {
        console.error("Error checking wedding page protection:", err);
        setError(err instanceof Error ? err.message : "Unknown error");
      } finally {
        setLoading(false);
      }
    };

    checkProtection();
  }, [slug, userId]);

  return {
    ...protection,
    loading,
    error,
  };
}
