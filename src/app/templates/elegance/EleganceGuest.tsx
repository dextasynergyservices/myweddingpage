"use client";

import React, { useState, useEffect, useRef, useCallback, useMemo } from "react";
import { Heart, MessageCircle, Send } from "lucide-react";
// import { useToast } from "@/app/templates/elegance/hooks/use-toast";
import { toast } from "react-hot-toast";
import { useParams } from "next/navigation";

interface Comment {
  id: string;
  name: string;
  message: string;
  created_at: string;
}

interface CommentsProps {
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

const Comments: React.FC<CommentsProps> = (props) => {
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
  const [isVisible, setIsVisible] = useState(false);
  const sectionRef = useRef<HTMLDivElement>(null);
  // const { toast: _toastHook } = useToast();

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setIsVisible(true);
        }
      },
      { threshold: 0.3 }
    );

    if (sectionRef.current) {
      observer.observe(sectionRef.current);
    }

    return () => observer.disconnect();
  }, []);

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
    <section id="comments" className="py-24 bg-white">
      <div className="container mx-auto px-4">
        <div
          ref={sectionRef}
          className={`text-center mb-16 transition-all duration-800 ${
            isVisible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-8"
          }`}
        >
          <MessageCircle className="w-12 h-12 mx-auto mb-6 text-rose-600 animate-bounce" />
          <h2 className="font-serif md:text-5xl text-2xl font-bold text-gray-900 mb-6">{title}</h2>
          <p className="font-sans text-xl text-gray-600 max-w-3xl mx-auto">{description}</p>
        </div>

        <div className="max-w-4xl mx-auto">
          {/* Comment Form */}
          <div
            className={`overflow-hidden bg-white shadow-lg p-8 transition-all duration-800 rounded-2xl ${
              isVisible ? "opacity-100 scale-100" : "opacity-0 scale-95"
            }`}
          >
            <form
              onSubmit={(e) => {
                e.preventDefault();
                handleSendMessage();
              }}
              className="space-y-6"
            >
              <div>
                <label className="block font-sans text-sm font-medium text-gray-900 mb-2">
                  Your Name(s)
                </label>
                <input
                  type="text"
                  value={guestName}
                  onChange={(e) => setGuestName(e.target.value)}
                  placeholder="Enter your name or family name"
                  className="w-full px-3 py-2 border border-gray-300 rounded-md font-sans text-sm text-gray-900 bg-white focus:ring-2 focus:ring-rose-600 focus:border-transparent focus:outline-none"
                />
              </div>

              <div>
                <label className="block font-sans text-sm font-medium text-gray-900 mb-2">
                  Your Message
                </label>
                <textarea
                  value={newMessage}
                  onChange={(e) => setNewMessage(e.target.value)}
                  placeholder="Share your wishes, memories, or advice for the happy couple..."
                  rows={4}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md font-sans text-sm text-gray-900 bg-white resize-none focus:ring-2 focus:ring-rose-600 focus:border-transparent focus:outline-none"
                />
              </div>

              <button
                type="submit"
                disabled={sending}
                className="w-full sm:w-auto bg-rose-600 hover:bg-rose-700 text-white font-semibold px-8 py-3 rounded-lg transition-all shadow-lg flex items-center justify-center disabled:opacity-70"
              >
                <Send className="w-4 h-4 mr-2" />
                {sending ? "Sending..." : "Send Your Wishes"}
              </button>
            </form>
          </div>

          {/* Comments List */}
          <div className="space-y-6">
            <h3 className="font-serif md:text-2xl text-xl font-semibold text-gray-900 mb-8 text-center">
              Messages from Family & Friends ({comments.length})
            </h3>

            {loadingComments ? (
              <div className="text-center py-12">
                <p className="font-sans text-gray-600">Loading messages...</p>
              </div>
            ) : comments.length === 0 ? (
              <div className="text-center py-12">
                <MessageCircle className="w-16 h-16 mx-auto mb-4 text-gray-600 opacity-50" />
                <p className="font-sans text-gray-600">
                  No wishes yet. Be the first to leave a message!
                </p>
              </div>
            ) : (
              paginatedComments.map((comment, index) => {
                const commentDate = new Date(comment.created_at);
                const formattedDate = commentDate.toLocaleDateString("en-US", {
                  month: "short",
                  day: "numeric",
                  year: "numeric",
                });

                return (
                  <div
                    key={comment.id}
                    className={`bg-white shadow-lg hover:shadow-xl transition-all duration-500 p-6 rounded-2xl ${
                      isVisible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-4"
                    }`}
                    style={{ animationDelay: `${(index + 1) * 100}ms` }}
                  >
                    <div className="flex items-start space-x-4">
                      <div className="flex-shrink-0">
                        <div className="w-10 h-10 rounded-full bg-rose-100 flex items-center justify-center">
                          <Heart className="w-5 h-5 text-rose-600" />
                        </div>
                      </div>

                      <div className="flex-1">
                        <div className="flex items-center justify-between mb-3">
                          <h4 className="font-serif text-lg font-semibold text-gray-900">
                            {comment.name}
                          </h4>
                          <span className="font-sans text-sm text-gray-600">{formattedDate}</span>
                        </div>

                        <p className="font-sans text-gray-600 leading-relaxed">{comment.message}</p>
                      </div>
                    </div>
                  </div>
                );
              })
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
                        : "bg-rose-600 text-white hover:opacity-80"
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
                            ? "bg-rose-600 text-white"
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
                        : "bg-rose-600 text-white hover:opacity-80"
                    }`}
                  >
                    Next
                  </button>
                </div>

                {/* Page Info */}
                <p className="text-sm text-gray-600">
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

export default Comments;
