import { useState, useEffect, useCallback, useMemo } from "react";
import { useScrollAnimation } from "./hooks/useScrollAnimation";
import { Button } from "./components/ui/button";
import { MessageCircle, Heart, Send } from "lucide-react";
import styles from "@/styles/templates/bloom.module.css";
import { toast } from "react-hot-toast";
import { useParams } from "next/navigation";

interface Comment {
  id: string;
  name: string;
  message: string;
  created_at: string;
  hearts?: number;
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

const Comments = (props: CommentsProps) => {
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
  const { elementRef, isVisible } = useScrollAnimation(0.2);

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

  const addHeart = (commentId: string) => {
    setComments(
      comments.map((comment) =>
        comment.id === commentId ? { ...comment, hearts: (comment.hearts || 0) + 1 } : comment
      )
    );
  };

  return (
    <section className={`${styles.sectionPadding} ${styles.bgBackground} relative overflow-hidden`}>
      {/* Background Elements */}
      <div className={`${styles.floatingElement} absolute top-32 right-10 opacity-5`}>
        <MessageCircle className={`w-36 h-36 text-primary ${styles.animateRomanticFloat}`} />
      </div>

      <div className={`${styles.containerBloom} mx-auto px-4`}>
        {/* Header */}
        <div
          ref={elementRef}
          className={`text-center mb-16 transition-all duration-1000 ${
            isVisible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-10"
          }`}
        >
          <h2 className={`${styles.fontHeading} text-2xl md:text-6xl font-bold mb-6`}>{title}</h2>
          <div className={`${styles.bgGradientRose} w-24 h-1 mx-auto mb-8`}></div>
          <p className={`text-lg ${styles.textMuted} max-w-2xl mx-auto leading-relaxed`}>
            {description}
          </p>
        </div>

        <div className={`${styles.guestContainer} max-w-4xl mx-auto`}>
          {/* Comment Form */}
          <div
            className={`mb-16 transition-all duration-1000 delay-300 ${
              isVisible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-10"
            }`}
          >
            <div className={`${styles.bgCard} p-8 ${styles.roundedLg} ${styles.shadowSoft}`}>
              <h3
                className={`${styles.fontHeading} text-2xl font-semibold ${styles.textForeground} mb-6 text-center`}
              >
                Leave Your Wedding Wishes
              </h3>

              <form
                onSubmit={(e) => {
                  e.preventDefault();
                  handleSendMessage();
                }}
                className={`${styles.commentForm} space-y-6`}
              >
                <div>
                  <label
                    className={`${styles.formLabel} block text-sm font-medium ${styles.textForeground} mb-2`}
                  >
                    Your Name
                  </label>
                  <input
                    type="text"
                    value={guestName}
                    onChange={(e) => setGuestName(e.target.value)}
                    className={`${styles.formInput} w-full px-4 py-3 border border-border rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent ${styles.transitionSmooth} bg-background ${styles.textForeground}`}
                    placeholder="Enter your name"
                    required
                  />
                </div>

                <div>
                  <label
                    className={`${styles.formLabel} block text-sm font-medium ${styles.textForeground} mb-2`}
                  >
                    Your Message
                  </label>
                  <textarea
                    value={newMessage}
                    onChange={(e) => setNewMessage(e.target.value)}
                    rows={4}
                    className={`${styles.formTextarea} w-full px-4 py-3 border border-border rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent ${styles.transitionSmooth} bg-background ${styles.textForeground} resize-none`}
                    placeholder="Share your wishes, memories, or excitement for Sarah and James..."
                    required
                  />
                </div>

                <div
                  className={`${styles.textCenter} bg-[hsl(340,75%,55%)] text-white hover:bg-[hsl(340,75%,55%)]/80 transition-colors duration-300 rounded-lg`}
                >
                  <Button
                    type="submit"
                    variant="romantic"
                    size="lg"
                    disabled={sending}
                    className={`${styles.commentSubmitButton} group disabled:opacity-70`}
                  >
                    <Send
                      className={`${styles.commentButtonIcon} w-5 h-5 mr-2 transition-transform group-hover:translate-x-1`}
                    />
                    {sending ? "Sending..." : "Send Your Wishes"}
                  </Button>
                </div>
              </form>
            </div>
          </div>

          {/* Comments List */}
          {loadingComments ? (
            <div className="text-center py-12">
              <p className={`text-lg ${styles.textMuted}`}>Loading messages...</p>
            </div>
          ) : comments.length === 0 ? (
            <div className="text-center py-12">
              <p className={`text-lg ${styles.textMuted}`}>
                No wishes yet. Be the first to leave a message!
              </p>
            </div>
          ) : (
            <div className={`${styles.spaceY8}`}>
              {comments.map((comment, index) => {
                const commentDate = new Date(comment.created_at);
                const formattedDate = commentDate.toLocaleDateString("en-US", {
                  month: "short",
                  day: "numeric",
                  year: "numeric",
                });

                return (
                  <div
                    key={comment.id}
                    className={`transition-all duration-700 ${
                      isVisible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-10"
                    }`}
                    style={{ transitionDelay: `${(index + 2) * 200}ms` }}
                  >
                    <div
                      className={`${styles.bgCard} p-6 ${styles.roundedLg} ${styles.shadowSoft} hover:${styles.shadowRomantic} ${styles.transitionRomantic}`}
                    >
                      <div
                        className={`${styles.commentHeader} flex items-start justify-between mb-4`}
                      >
                        <div>
                          <h4
                            className={`${styles.commentAuthor} font-semibold ${styles.textForeground} text-lg`}
                          >
                            {comment.name}
                          </h4>
                          <p className={`${styles.commentTimestamp} text-sm ${styles.textMuted}`}>
                            {formattedDate}
                          </p>
                        </div>

                        <button
                          onClick={() => addHeart(comment.id)}
                          className={`${styles.commentHeartButton} flex items-center gap-2 text-primary hover:text-primary-glow ${styles.transitionSmooth} group`}
                        >
                          <Heart
                            className={`${styles.commentHeartIcon} w-5 h-5 group-hover:scale-110 transition-transform`}
                          />
                          <span className={`${styles.commentHeartCount} text-sm font-medium`}>
                            {comment.hearts || 0}
                          </span>
                        </button>
                      </div>

                      <p
                        className={`${styles.commentMessage} ${styles.textForeground} leading-relaxed`}
                      >
                        {comment.message}
                      </p>
                    </div>
                  </div>
                );
              })}
            </div>
          )}

          {/* Thank You Note */}
          <div
            className={`text-center mt-16 transition-all duration-1000 delay-700 ${
              isVisible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-10"
            }`}
          >
            <div
              className={`${styles.thankYouCard} bg-gradient-to-r from-primary/10 to-accent/10 p-8 ${styles.roundedLg}`}
            >
              <Heart className={`${styles.thankYouIcon} w-12 h-12 text-primary mx-auto mb-4`} />
              <h3
                className={`${styles.fontHeading} text-2xl font-semibold ${styles.textForeground} mb-4`}
              >
                Thank You for Your Love
              </h3>
              <p
                className={`${styles.thankYouMessage} ${styles.textMuted} leading-relaxed max-w-2xl mx-auto`}
              >
                Every message fills our hearts with so much joy. Thank you for being part of our
                journey and for sharing in our happiness. We can&apos;t wait to celebrate with all
                of you!
              </p>
              <p className={`${styles.thankYouSignature} text-primary font-medium mt-4`}>
                With love, Sarah & James 💕
              </p>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default Comments;
