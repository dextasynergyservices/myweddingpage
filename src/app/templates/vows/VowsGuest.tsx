"use client";

import { useState, useEffect, useCallback, useMemo } from "react";
import { useScrollAnimation } from "@/app/templates/vows/hooks/useScrollAnimation";
import { Card, CardContent } from "@/app/templates/vows/components/ui/card";
import { Button } from "@/app/templates/vows/components/ui/button";
import { Textarea } from "@/app/templates/vows/components/ui/textarea";
import { Input } from "@/app/templates/vows/components/ui/input";
import { toast } from "sonner";
import { useParams } from "next/navigation";

interface Comment {
  id: string;
  name: string;
  message: string;
  created_at: string;
}

interface CommentsSectionProps {
  title?: string;
  description?: string;
  existingComments?: Comment[];
  placeholder?: {
    name?: string;
    message?: string;
  };
  // Additional user data props for full integration
  userId?: string;
  gifts?: Record<string, unknown>[];
  gallery?: string[];
  bankDetails?: Record<string, unknown>[];
  storyImage?: string;
  heroImage?: string;
  // Legacy support for guests/guestMessages/initialComments props
  guests?: Comment[];
  guestMessages?: Comment[];
  initialComments?: Comment[];
}

export const CommentsSection = (props: CommentsSectionProps) => {
  const params = useParams();
  const [comments, setComments] = useState<Comment[]>([]);
  const [newMessage, setNewMessage] = useState("");
  const [guestName, setGuestName] = useState("");
  const [sending, setSending] = useState(false);
  const [loadingComments, setLoadingComments] = useState(false);

  // Pagination state
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 5; // Show 5 comments per page

  // Get slug from URL params (e.g., /alison-favour)
  const slug = params.slug as string;

  // Pagination logic
  const totalPages = Math.ceil(comments.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const endIndex = startIndex + itemsPerPage;
  const paginatedComments = comments.slice(startIndex, endIndex);

  // Pagination handlers
  const handlePreviousPage = () => {
    setCurrentPage((prev) => Math.max(prev - 1, 1));
  };

  const handleNextPage = () => {
    setCurrentPage((prev) => Math.min(prev + 1, totalPages));
  };

  const handlePageClick = (page: number) => {
    setCurrentPage(page);
  };

  // Extract data from props with fallbacks
  const title = props.title || "Well Wishes";
  const description =
    props.description ||
    "Share your love, memories, and well wishes for our special day. Your kind words mean the world to us!";

  // Extract guest messages from props (prioritize initialComments > guestMessages)
  // Only use guests prop for preview mode (when no slug)
  const initialComments = useMemo(() => {
    if (slug) {
      // When we have a slug (real wedding page), don't use guests prop - only use API data
      return props.initialComments || props.guestMessages || props.existingComments || [];
    } else {
      // When no slug (preview mode), use all available props
      return (
        props.initialComments || props.guests || props.guestMessages || props.existingComments || []
      );
    }
  }, [props.initialComments, props.guests, props.guestMessages, props.existingComments, slug]);

  // const _placeholder = props.placeholder || {
  //   name: "Your Name",
  //   message: "Share your well wishes...",
  // };
  const { ref: sectionRef, isVisible } = useScrollAnimation(0.2);

  // Fetch approved comments
  const fetchComments = useCallback(async () => {
    if (!slug) return;

    setLoadingComments(true);
    try {
      const response = await fetch(`/api/guests/comments?slug=${encodeURIComponent(slug)}`);

      if (response.ok) {
        const commentsData = await response.json();
        setComments(commentsData);
      } else {
        console.error("Failed to fetch comments");
        // Don't fall back to initial comments when we have a slug - just show empty state
        setComments([]);
      }
    } catch (error) {
      console.error("Error fetching comments:", error);
      // Don't fall back to initial comments when we have a slug - just show empty state
      setComments([]);
    } finally {
      setLoadingComments(false);
    }
  }, [slug]);

  // Initialize comments
  useEffect(() => {
    if (slug) {
      // Always fetch from API when we have a slug
      fetchComments();
    } else if (initialComments && initialComments.length > 0) {
      // Only use initial comments if no slug (fallback for preview mode)
      setComments(initialComments);
    }
  }, [initialComments, slug, fetchComments]);

  const handleSendMessage = async () => {
    if (!guestName.trim() || !newMessage.trim()) {
      toast.error("Please enter both your name and a message");
      return;
    }

    if (!slug) {
      toast.error("Unable to identify wedding page. Please refresh and try again.");
      return;
    }

    setSending(true);
    const loadingToast = toast.loading("Sending your message...");

    try {
      const response = await fetch("/api/guests/comments", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          name: guestName.trim(),
          message: newMessage.trim(),
          slug: slug,
        }),
      });

      const responseText = await response.text();

      let responseData;
      try {
        responseData = JSON.parse(responseText);
      } catch {
        console.error("Non-JSON response:", responseText.substring(0, 200));
        throw new Error("Server returned an error page");
      }

      if (response.ok) {
        toast.dismiss(loadingToast);
        toast.success("Thank you for your message! It will be visible after approval.");
        setNewMessage("");
        setGuestName("");

        // Refresh comments after successful submission
        // (Note: new comment won't appear until it's approved)
        fetchComments();
      } else {
        toast.dismiss(loadingToast);
        toast.error(responseData.error || "Failed to send message");
      }
    } catch (error) {
      console.error("Error sending message:", error);
      toast.dismiss(loadingToast);
      toast.error("An error occurred while sending your message");
    } finally {
      setSending(false);
    }
  };

  return (
    <section className="lg:py-32 md:py-16 py-4 px-4 lg:px-16 bg-muted">
      <div className="container-wedding">
        <div
          ref={sectionRef}
          className={`text-center mb-16 transition-all duration-1000 delay-200 ${
            isVisible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-8"
          }`}
        >
          <h2 className="font-heading text-5xl md:text-6xl lg:text-7xl text-black/80 mb-6">
            {title}
          </h2>
          <div className="w-24 h-px bg-accent mx-auto mb-8" />
          <p className="font-body text-lg md:text-xl text-black/80 max-w-3xl mx-auto leading-relaxed">
            {description}
          </p>
        </div>

        <div className="grid lg:grid-cols-2 gap-12 lg:gap-16">
          {/* Comment Form */}
          <div
            className={`transition-all duration-1000 delay-400 ${
              isVisible ? "opacity-100 translate-x-0" : "opacity-0 -translate-x-8"
            }`}
          >
            <Card className="elegant-card">
              <CardContent className="p-8">
                <h3 className="font-heading text-2xl md:text-3xl text-black/80 mb-6">
                  Leave a Message
                </h3>

                <form
                  onSubmit={(e) => {
                    e.preventDefault();
                    handleSendMessage();
                  }}
                  className="space-y-6"
                >
                  <div>
                    <label className="font-body text-sm font-medium text-black/80 mb-2 block">
                      Your Name
                    </label>
                    <Input
                      value={guestName}
                      onChange={(e) => setGuestName(e.target.value)}
                      placeholder="Enter your name"
                      className="font-body text-black/80"
                    />
                  </div>

                  <div>
                    <label className="font-body text-sm font-medium text-black/80 mb-2 block">
                      Your Message
                    </label>
                    <Textarea
                      value={newMessage}
                      onChange={(e) => setNewMessage(e.target.value)}
                      placeholder="Share your well wishes, memories, or advice for the happy couple..."
                      rows={4}
                      className="font-body resize-none text-black/80"
                    />
                  </div>

                  <Button
                    type="submit"
                    disabled={sending}
                    className="w-full bg-black text-white hover:bg-black/80 transition-colors duration-300 font-body disabled:opacity-70"
                  >
                    {sending ? "Sending..." : "Share Your Wishes"}
                  </Button>
                </form>
              </CardContent>
            </Card>
          </div>

          {/* Comments Display */}
          <div
            className={`transition-all duration-1000 delay-600 ${
              isVisible ? "opacity-100 translate-x-0" : "opacity-0 translate-x-8"
            }`}
          >
            <h3 className="font-heading text-2xl md:text-3xl text-black/80 mb-8">
              Messages from Loved Ones
            </h3>

            {loadingComments ? (
              <div className="text-center py-12">
                <p className="font-body text-lg text-black/80">Loading messages...</p>
              </div>
            ) : comments.length === 0 ? (
              <div className="text-center py-12">
                <p className="font-body text-lg text-black/80">
                  No wishes yet. Be the first to leave a message!
                </p>
              </div>
            ) : (
              <div
                className="space-y-6 max-h-96 overflow-y-auto pr-2"
                style={{
                  scrollbarWidth: "thin",
                  scrollbarColor: "hsl(var(--accent)) hsl(var(--muted))",
                }}
              >
                {paginatedComments.map((comment, index) => {
                  const commentDate = new Date(comment.created_at);
                  const formattedDate = commentDate.toLocaleDateString("en-US", {
                    month: "short",
                    day: "numeric",
                    year: "numeric",
                  });

                  return (
                    <Card
                      key={comment.id}
                      className={`border border-border-light hover:shadow-soft transition-all duration-300 ${
                        index === 0 && comment.created_at ? "bg-primary/5 border-primary/20" : ""
                      }`}
                    >
                      <CardContent className="p-6">
                        <div className="flex items-center justify-between mb-3">
                          <h4 className="font-body font-semibold text-black/80">{comment.name}</h4>
                          <span className="font-body text-xs text-black/80">{formattedDate}</span>
                        </div>
                        <p className="font-body text-black/80 leading-relaxed">{comment.message}</p>
                      </CardContent>
                    </Card>
                  );
                })}
              </div>
            )}

            {/* Pagination Controls */}
            {totalPages > 1 && (
              <div className="flex flex-col items-center mt-12 space-y-4">
                {/* Page Numbers */}
                <div className="flex items-center space-x-2">
                  <button
                    onClick={handlePreviousPage}
                    disabled={currentPage === 1}
                    className={`px-4 py-2 rounded-full text-sm font-medium transition-all duration-300 ${
                      currentPage === 1
                        ? "bg-gray-200 text-gray-400 cursor-not-allowed"
                        : "bg-black text-white hover:opacity-80"
                    }`}
                  >
                    Previous
                  </button>

                  <div className="flex items-center space-x-1">
                    {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => (
                      <button
                        key={page}
                        onClick={() => handlePageClick(page)}
                        className={`w-10 h-10 rounded-full text-sm font-medium transition-all duration-300 ${
                          currentPage === page
                            ? "bg-black text-white"
                            : "bg-gray-200 text-gray-600 hover:bg-gray-300"
                        }`}
                      >
                        {page}
                      </button>
                    ))}
                  </div>

                  <button
                    onClick={handleNextPage}
                    disabled={currentPage === totalPages}
                    className={`px-4 py-2 rounded-full text-sm font-medium transition-all duration-300 ${
                      currentPage === totalPages
                        ? "bg-gray-200 text-gray-400 cursor-not-allowed"
                        : "bg-black text-white hover:opacity-80"
                    }`}
                  >
                    Next
                  </button>
                </div>

                {/* Page Info */}
                <p className="text-sm text-black/60">
                  Page {currentPage} of {totalPages} • {comments.length} total comments
                </p>
              </div>
            )}
          </div>
        </div>
      </div>
    </section>
  );
};
