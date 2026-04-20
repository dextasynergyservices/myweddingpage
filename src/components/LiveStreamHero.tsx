"use client";

import { useState, useEffect, useRef } from "react";
import { Users, Calendar, MapPin, MessageSquare, X } from "lucide-react";
import ReactionButtons from "@/components/livestream/ReactionButtons";
import VirtualGuestbook from "@/components/livestream/VirtualGuestbook";
import ActivityFeed from "@/components/livestream/ActivityFeed";

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
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [overlayOpen, setOverlayOpen] = useState(false);
  const [heroVisible, setHeroVisible] = useState(true);
  const rootRef = useRef<HTMLElement | null>(null);

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
        const response = await fetch(
          `/api/youtube-stats?videoId=${stream.youtubeId}`
        );
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

  // Watch hero visibility to show/hide fixed controls only when hero is in view
  useEffect(() => {
    if (!rootRef.current) return;
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          setHeroVisible(entry.intersectionRatio > 0.25);
        });
      },
      { threshold: [0, 0.25, 0.5, 0.75, 1] }
    );

    observer.observe(rootRef.current);
    return () => observer.disconnect();
  }, []);

  return (
    <section
      ref={(el) => {
        rootRef.current = el;
      }}
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
            pointerEvents: overlayOpen ? "none" : "auto",
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
        className={`relative z-10 text-center px-4 max-w-4xl mx-auto text-white ${contentClassName} ${drawerOpen ? "pr-96" : ""}`}
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

          {subtitle && (
            <p className="text-xl md:text-2xl mb-6 opacity-90">{subtitle}</p>
          )}

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

          {description && (
            <p className="text-lg opacity-80 max-w-2xl mx-auto">
              {description}
            </p>
          )}
        </div>

        {/* Call to Action */}
        <div className="mt-8">
          <button
            onClick={() => {
              const iframe = document.querySelector("iframe");
              if (iframe && (iframe as HTMLElement).requestFullscreen) {
                (iframe as HTMLElement).requestFullscreen();
              }
            }}
            className="bg-white text-black px-8 py-3 rounded-full font-semibold hover:bg-gray-100 transition-colors"
          >
            Watch Fullscreen
          </button>

          {/* Show engagement (simulated fullscreen with engagement UI) */}
          <button
            onClick={async () => {
              // If the browser is in fullscreen (native), exit it so we can show our combined overlay
              if (document.fullscreenElement) {
                try {
                  await document.exitFullscreen();
                } catch (e) {
                  console.warn("Failed to exit fullscreen:", e);
                }
              }
              setOverlayOpen(true);
            }}
            className="ml-4 bg-white text-black px-4 py-3 rounded-full font-medium hover:bg-gray-100 transition-colors"
          >
            Show engagement
          </button>
        </div>

        {/* Reactions (visible only while hero in view) */}
        {heroVisible && (
          <div className="mt-6 relative z-20">
            <ReactionButtons streamId={stream.id} isGuest={true} />
          </div>
        )}

        {/* Engagement: unobtrusive floating button that opens a right-side drawer on lg+ screens (only when hero visible) */}
        {heroVisible && (
          <div className="hidden lg:block">
            {/* Floating Button */}
            <button
              aria-label="Open engagement drawer"
              onClick={() => setDrawerOpen(true)}
              className="fixed right-6 bottom-12 z-40 flex items-center gap-3 px-3 py-2 rounded-full border border-transparent bg-white/90 text-gray-800 shadow-md hover:shadow-lg transition-all"
              style={{ backdropFilter: "saturate(180%) blur(6px)" }}
            >
              <MessageSquare className="w-5 h-5" />
              <span className="text-sm font-medium">Engagement</span>
            </button>

            {/* Drawer */}
            <div
              className={`fixed top-16 right-0 bottom-0 z-60 transform bg-white shadow-2xl transition-all duration-300 ${
                drawerOpen ? "w-96" : "w-0 overflow-hidden"
              }`}
              aria-hidden={!drawerOpen}
            >
              <div
                className={`h-full flex flex-col ${drawerOpen ? "w-96" : "w-0"}`}
              >
                <div className="flex items-center justify-between p-4 border-b">
                  <h3 className="text-lg font-semibold">Live Engagement</h3>
                  <button
                    onClick={() => setDrawerOpen(false)}
                    aria-label="Close engagement drawer"
                    className="p-2 rounded-md text-gray-600 hover:bg-gray-100"
                  >
                    <X className="w-5 h-5" />
                  </button>
                </div>

                <div className="p-4 overflow-y-auto space-y-4">
                  <ActivityFeed streamId={stream.id} />
                  <VirtualGuestbook streamId={stream.id} />
                </div>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Combined fullscreen-like overlay (player + engagement) */}
      {overlayOpen && (
        <div
          className="fixed inset-0 z-80 bg-black/80 flex items-center justify-center p-4"
          // allow tapping the backdrop to close (only when clicking the backdrop itself)
          onClick={(e) => {
            if (e.target === e.currentTarget) {
              setOverlayOpen(false);
            }
          }}
        >
          {/* Close button moved to the overlay root so it sits above the iframe on mobile */}
          <button
            type="button"
            onClick={(e) => {
              e.stopPropagation();
              setOverlayOpen(false);
            }}
            onTouchStart={(e) => {
              e.stopPropagation();
              setOverlayOpen(false);
            }}
            aria-label="Close engagement overlay"
            className="p-4 rounded-full bg-white/95 hover:bg-white shadow-md"
            style={{
              zIndex: 2147483647,
              position: "absolute",
              right: 16,
              top: 24,
              pointerEvents: "auto",
              WebkitTapHighlightColor: "transparent",
            }}
          >
            <X className="w-5 h-5 text-gray-800" />
          </button>

          <div className="relative w-full h-full max-w-[1400px] max-h-full bg-transparent rounded-lg overflow-hidden">
            <div className="w-full h-full grid grid-cols-1 lg:grid-cols-3 gap-4">
              {/* Player area - spans two columns on lg */}
              <div className="lg:col-span-2 bg-black h-full">
                <iframe
                  src={embedUrl}
                  width="100%"
                  height="100%"
                  style={{
                    border: "none",
                    minHeight: "60vh",
                    pointerEvents: "none",
                  }}
                  allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                  allowFullScreen
                />
              </div>

              {/* Engagement area */}
              <div className="lg:col-span-1 bg-white h-full overflow-y-auto p-4">
                <h3 className="text-lg font-semibold mb-3">Live Engagement</h3>
                <div className="space-y-4">
                  <ActivityFeed streamId={stream.id} />
                  <VirtualGuestbook streamId={stream.id} />
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </section>
  );
};

export default LiveStreamHero;
