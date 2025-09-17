"use client";

import { useState, useEffect } from "react";
import { Users, Calendar, MapPin } from "lucide-react";

interface Stream {
  id: string;
  name: string;
  youtubeUrl: string;
  youtubeId: string;
  camera: string;
  quality: string;
  isActive: boolean;
  viewerCount: number;
  createdAt: string;
  updatedAt: string;
}

interface LiveStreamHeroProps {
  stream: Stream;
  brideName?: string;
  groomName?: string;
  weddingDate?: string;
  venue?: string;
  subtitle?: string;
  description?: string;
  // Template-specific styling classes
  className?: string;
  overlayClassName?: string;
  contentClassName?: string;
}

export const LiveStreamHero = ({
  stream,
  brideName = "Bride",
  groomName = "Groom",
  weddingDate,
  venue,
  subtitle,
  description,
  className = "",
  overlayClassName = "",
  contentClassName = "",
}: LiveStreamHeroProps) => {
  const [viewerCount, setViewerCount] = useState(stream.viewerCount);
  const [isLoading, setIsLoading] = useState(true);

  // Format wedding date if provided
  let formattedDate = "";
  if (weddingDate) {
    try {
      const date = new Date(weddingDate);
      formattedDate = date.toLocaleDateString("en-US", {
        month: "long",
        day: "numeric",
        year: "numeric",
      });
    } catch {
      formattedDate = weddingDate;
    }
  }

  // Poll for viewer count updates every 30 seconds
  useEffect(() => {
    const interval = setInterval(async () => {
      try {
        const response = await fetch(`/api/youtube-stats?videoId=${stream.youtubeId}`);
        if (response.ok) {
          const data = await response.json();
          setViewerCount(data.viewerCount || viewerCount);
        }
      } catch (error) {
        console.error("Error fetching viewer count:", error);
      }
    }, 30000); // Update every 30 seconds

    return () => clearInterval(interval);
  }, [stream.youtubeId, viewerCount]);

  // Create YouTube embed URL
  const embedUrl = `https://www.youtube.com/embed/${stream.youtubeId}?autoplay=1&mute=1&controls=1&rel=0&showinfo=0&modestbranding=1`;

  return (
    <section
      className={`relative min-h-screen flex items-center justify-center overflow-hidden ${className}`}
    >
      {/* Live Stream Video Background */}
      <div className="absolute inset-0">
        <iframe
          src={embedUrl}
          className="w-full h-full object-cover"
          style={{
            transform: "scale(1.1)", // Slight zoom to hide iframe borders
            filter: "brightness(0.7)", // Darken for better text readability
          }}
          allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
          allowFullScreen
          onLoad={() => setIsLoading(false)}
        />

        {/* Overlay for better text readability */}
        <div className={`absolute inset-0 bg-black/40 ${overlayClassName}`} />
      </div>

      {/* Loading state */}
      {isLoading && (
        <div className="absolute inset-0 bg-black flex items-center justify-center z-20">
          <div className="text-white text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-white mx-auto mb-4"></div>
            <p>Loading Live Stream...</p>
          </div>
        </div>
      )}

      {/* Content Overlay */}
      <div
        className={`relative z-10 text-center px-4 max-w-4xl mx-auto text-white ${contentClassName}`}
      >
        {/* Live Indicator */}
        <div className="flex items-center justify-center mb-6">
          <div className="flex items-center bg-red-600 px-4 py-2 rounded-full">
            <div className="w-3 h-3 bg-white rounded-full mr-2 animate-pulse"></div>
            <span className="font-semibold text-sm uppercase">Live Now</span>
          </div>
        </div>

        {/* Stream Info */}
        <div className="mb-8 p-4 bg-black/30 rounded-lg backdrop-blur-sm">
          <h3 className="text-xl font-semibold mb-2">{stream.name}</h3>
          <div className="flex items-center justify-center space-x-4 text-sm">
            {/* <div className="flex items-center">
              <Eye className="w-4 h-4 mr-1" />
              <span>{viewerCount} watching</span>
            </div> */}
            <div className="flex items-center">
              <Users className="w-4 h-4 mr-1" />
              <span>{stream.quality}</span>
            </div>
          </div>
        </div>

        {/* Wedding Information */}
        <div className="space-y-4">
          <h1 className="text-4xl md:text-6xl font-bold mb-4">
            {brideName} & {groomName}
          </h1>

          {subtitle && <p className="text-xl md:text-2xl mb-6 opacity-90">{subtitle}</p>}

          {formattedDate && (
            <div className="flex items-center justify-center mb-4">
              <Calendar className="w-5 h-5 mr-2" />
              <span className="text-lg">{formattedDate}</span>
            </div>
          )}

          {venue && (
            <div className="flex items-center justify-center mb-6">
              <MapPin className="w-5 h-5 mr-2" />
              <span className="text-lg">{venue}</span>
            </div>
          )}

          {description && <p className="text-lg opacity-80 max-w-2xl mx-auto">{description}</p>}
        </div>

        {/* Call to Action */}
        <div className="mt-8">
          <button
            onClick={() => {
              const iframe = document.querySelector("iframe");
              if (iframe && iframe.requestFullscreen) {
                iframe.requestFullscreen();
              }
            }}
            className="bg-white text-black px-8 py-3 rounded-full font-semibold hover:bg-gray-100 transition-colors"
          >
            Watch Fullscreen
          </button>
        </div>
      </div>
    </section>
  );
};
