"use client";

import { useEffect, useRef, useState, useCallback, useMemo } from "react";
import { Heart, MessageSquare, Send } from "lucide-react";
import Image from "next/image";
import { toast } from "react-hot-toast";
import { useParams } from "next/navigation";

interface Comment {
  id: string;
  name: string;
  message: string;
  created_at: string;
  avatar?: string;
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

export default function Comments(props: CommentsProps) {
  const params = useParams();
  const [comments, setComments] = useState<Comment[]>([]);
  const [newMessage, setNewMessage] = useState("");
  const [guestName, setGuestName] = useState("");
  const [sending, setSending] = useState(false);
  const [loadingComments, setLoadingComments] = useState(false);

  // Get slug from URL params (e.g., /alison-favour)
  const slug = params.slug as string;

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
  const sectionRef = useRef<HTMLElement>(null);

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setIsVisible(true);
        }
      },
      { threshold: 0.1 }
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
    <section
      ref={sectionRef}
      className="py-24 bg-gradient-to-br from-indigo-50 via-purple-50 to-pink-50 relative overflow-hidden"
    >
      {/* Background Elements */}
      <div className="absolute inset-0 opacity-10">
        <div className="absolute top-28 right-20 w-48 h-48 rounded-full bg-indigo-300 blur-2xl"></div>
        <div className="absolute bottom-32 left-16 w-40 h-40 rounded-full bg-purple-300 blur-2xl"></div>
      </div>

      <div className="container mx-auto px-6 relative z-10">
        <div
          className={`text-center mb-16 transition-all duration-1000 transform ${isVisible ? "translate-y-0 opacity-100" : "translate-y-12 opacity-0"}`}
        >
          <h2
            className="text-2xl md:text-5xl
           font-bold bg-gradient-to-r from-indigo-600 via-purple-600 to-pink-600 bg-clip-text text-transparent mb-6"
          >
            {title}
          </h2>
          <p className="text-xl text-gray-600 max-w-2xl mx-auto">{description}</p>
        </div>

        <div className="max-w-4xl mx-auto">
          {/* Comment Form */}
          <div
            className={`bg-white/80 backdrop-blur-sm rounded-2xl shadow-xl p-8 mb-12 transition-all duration-1000 delay-200 transform ${isVisible ? "translate-y-0 opacity-100 scale-100" : "translate-y-12 opacity-0 scale-95"}`}
          >
            <h3 className="text-2xl font-bold text-gray-800 mb-6 flex items-center gap-3">
              <MessageSquare className="w-6 h-6 text-purple-600" />
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
                <input
                  type="text"
                  placeholder="Your Name"
                  value={guestName}
                  onChange={(e) => setGuestName(e.target.value)}
                  className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:border-purple-500 focus:ring-2 focus:ring-purple-200 transition-all duration-300 bg-white/50 backdrop-blur-sm"
                  required
                />
              </div>
              <div>
                <textarea
                  placeholder="Share your wishes, memories, or excitement..."
                  value={newMessage}
                  onChange={(e) => setNewMessage(e.target.value)}
                  rows={4}
                  className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:border-purple-500 focus:ring-2 focus:ring-purple-200 transition-all duration-300 bg-white/50 backdrop-blur-sm resize-none"
                  required
                />
              </div>
              <button
                type="submit"
                disabled={sending}
                className="bg-gradient-to-r from-indigo-500 to-purple-500 text-white px-8 py-3 rounded-xl font-medium hover:from-indigo-600 hover:to-purple-600 transition-all duration-300 transform hover:scale-105 flex items-center gap-2 shadow-lg disabled:opacity-70 disabled:cursor-not-allowed"
              >
                <Send className="w-5 h-5" />
                {sending ? "Sending..." : "Send Your Wishes"}
              </button>
            </form>
          </div>

          {/* Comments List */}
          <div className="space-y-6">
            {loadingComments ? (
              <div className="text-center py-12">
                <p className="text-lg text-gray-600">Loading messages...</p>
              </div>
            ) : comments.length === 0 ? (
              <div className="text-center py-12">
                <MessageSquare className="w-16 h-16 mx-auto mb-4 text-gray-400 opacity-50" />
                <p className="text-lg text-gray-600">
                  No wishes yet. Be the first to leave a message!
                </p>
              </div>
            ) : (
              comments.map((comment, index) => {
                const commentDate = new Date(comment.created_at);
                const formattedDate = commentDate.toLocaleDateString("en-US", {
                  month: "short",
                  day: "numeric",
                  year: "numeric",
                });

                return (
                  <div
                    key={comment.id}
                    className={`bg-white/60 backdrop-blur-sm rounded-2xl shadow-lg hover:shadow-xl p-6 transition-all duration-700 transform hover:scale-[1.02] ${
                      isVisible ? "translate-y-0 opacity-100" : "translate-y-12 opacity-0"
                    }`}
                    style={{ transitionDelay: `${400 + index * 150}ms` }}
                  >
                    <div className="flex items-start gap-4">
                      {comment.avatar ? (
                        <Image
                          src={comment.avatar}
                          alt={comment.name}
                          width={48}
                          height={48}
                          className="w-12 h-12 rounded-full object-cover ring-2 ring-purple-200"
                        />
                      ) : (
                        <div className="w-12 h-12 rounded-full bg-gradient-to-br from-indigo-500 to-purple-500 flex items-center justify-center text-white font-bold text-lg">
                          {comment.name.charAt(0)}
                        </div>
                      )}

                      <div className="flex-1">
                        <div className="flex items-center justify-between mb-2">
                          <h4 className="font-bold text-gray-800">{comment.name}</h4>
                          <span className="text-sm text-gray-500">{formattedDate}</span>
                        </div>
                        <p className="text-gray-600 leading-relaxed">{comment.message}</p>
                        <div className="flex items-center gap-2 mt-3">
                          <button className="flex items-center gap-2 text-pink-500 hover:text-pink-600 transition-colors duration-200">
                            <Heart className="w-4 h-4" />
                            <span className="text-sm">Love this</span>
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </div>

        {/* Footer */}
        <div
          className={`text-center mt-20 transition-all duration-1000 delay-600 transform ${isVisible ? "translate-y-0 opacity-100" : "translate-y-8 opacity-0"}`}
        >
          <div className="bg-gradient-to-r from-pink-500 to-rose-500 text-white rounded-2xl p-8 max-w-2xl mx-auto shadow-xl">
            <h3 className="text-3xl font-bold mb-4">Thank You!</h3>
            <p className="text-lg opacity-90">
              Your love and support mean the world to us. We can&apos;t wait to celebrate with all
              of you on our special day!
            </p>
            <div className="mt-6 text-2xl">💕</div>
          </div>
        </div>
      </div>
    </section>
  );
}
