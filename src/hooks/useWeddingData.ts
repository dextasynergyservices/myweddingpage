// hooks/useWeddingData.ts
import { useState, useEffect } from "react";

interface WeddingData {
  brideName: string;
  groomName: string;
  weddingDate: string;
  formattedWeddingDate: string;
  venue: string;
  welcomeMessage: string;
  colorTheme?: string;
  heroImage?: string;
  ourStory?: {
    content: string;
    imageUrl: string;
  };
  galleryPhotos?: Array<{ id: string; url: string; title: string; category: string }>;
  giftRegistry?: Array<{
    id: string;
    item: string;
    price: string;
    image: string;
    purchased: boolean;
  }>;
  guestMessages?: Array<{ id: string; guest: string; message: string; date: string }>;
}

export function useWeddingData() {
  const [data, setData] = useState<WeddingData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        setError(null);

        const response = await fetch("/api/wedding-data");

        if (!response.ok) {
          throw new Error(`Failed to load data: ${response.status}`);
        }

        const result = await response.json();

        if (result.error) {
          throw new Error(result.error);
        }

        setData(result);
      } catch (err: any) {
        console.error("Error fetching wedding data:", err);
        setError(err.message || "Failed to load wedding data");
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  return { data, loading, error };
}
