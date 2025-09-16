"use client";

import React, { useState, useEffect, useRef, useCallback, useMemo } from "react";
import { Heart, MessageCircle, Send } from "lucide-react";
// import { useToast } from "@/app/templates/elegance/hooks/use-toast";
import styles from "@/styles/templates/elegance.module.css";
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
    <section id="comments" className={`${styles.py24} ${styles.bgBackground}`}>
      <div className={`${styles.container} ${styles.mxAuto} ${styles.px4}`}>
        <div
          ref={sectionRef}
          className={`${styles.textCenter} ${styles.mb16} ${styles.transitionAll} ${styles.duration800} ${
            isVisible ? styles.animateFadeInUp : `${styles.opacity0} ${styles.translateY8}`
          }`}
        >
          <MessageCircle
            className={`${styles.w12} ${styles.h12} ${styles.mxAuto} ${styles.mb6} ${styles.textPrimary} ${styles.animateFloat}`}
          />
          <h2
            className={`${styles.fontDisplay} md:text-5xl text-2xl ${styles.fontBold} ${styles.textForeground} ${styles.mb6}`}
          >
            {title}
          </h2>
          <p
            className={`${styles.fontBody} ${styles.textXl} ${styles.textMutedForeground} ${styles.maxW3xl} ${styles.mxAuto}`}
          >
            {description}
          </p>
        </div>

        <div className={`${styles.maxW4xl} ${styles.mxAuto}`}>
          {/* Comment Form */}
          <div
            className={`${styles.overflowHidden} ${styles.bgGradientCard} ${styles.shadowElevated} ${styles.p8} ${styles.transitionAll} ${styles.duration800} ${
              isVisible ? styles.animateScaleIn : `${styles.opacity0} ${styles.scale95}`
            }`}
          >
            <form
              onSubmit={(e) => {
                e.preventDefault();
                handleSendMessage();
              }}
              className={styles.spaceY6}
            >
              <div>
                <label
                  className={`${styles.block} ${styles.fontBody} ${styles.textSm} ${styles.fontMedium} ${styles.textForeground} ${styles.mb2}`}
                >
                  Your Name(s)
                </label>
                <input
                  type="text"
                  value={guestName}
                  onChange={(e) => setGuestName(e.target.value)}
                  placeholder="Enter your name or family name"
                  className={`${styles.wFull} ${styles.px3} ${styles.py2} ${styles.border} ${styles.borderBorder} ${styles.roundedMd} ${styles.fontBody} ${styles.textSm} ${styles.textForeground} ${styles.bgBackground} ${styles.focusRingPrimary} ${styles.focusBorderPrimary}`}
                />
              </div>

              <div>
                <label
                  className={`${styles.block} ${styles.fontBody} ${styles.textSm} ${styles.fontMedium} ${styles.textForeground} ${styles.mb2}`}
                >
                  Your Message
                </label>
                <textarea
                  value={newMessage}
                  onChange={(e) => setNewMessage(e.target.value)}
                  placeholder="Share your wishes, memories, or advice for the happy couple..."
                  rows={4}
                  className={`${styles.wFull} ${styles.px3} ${styles.py2} ${styles.border} ${styles.borderBorder} ${styles.roundedMd} ${styles.fontBody} ${styles.textSm} ${styles.textForeground} ${styles.bgBackground} ${styles.resizeNone} ${styles.focusRingPrimary} ${styles.focusBorderPrimary}`}
                />
              </div>

              <button
                type="submit"
                disabled={sending}
                className={`${styles.wFull} ${styles.smWAuto} ${styles.bgPrimary} ${styles.hoverBgPrimary90} ${styles.textPrimaryForeground} ${styles.fontSemibold} ${styles.px8} ${styles.py3} ${styles.roundedLg} ${styles.transitionAll} ${styles.shadowGlow} font-lg flex items-center justify-center disabled:opacity-70`}
              >
                <Send className={`${styles.w4} ${styles.h4} ${styles.mr2}`} />
                {sending ? "Sending..." : "Send Your Wishes"}
              </button>
            </form>
          </div>

          {/* Comments List */}
          <div className={styles.spaceY6}>
            <h3
              className={`${styles.fontDisplay} md:text-2xl text-xl ${styles.fontSemibold} ${styles.textForeground} ${styles.mb8} ${styles.textCenter}`}
            >
              Messages from Family & Friends ({comments.length})
            </h3>

            {loadingComments ? (
              <div className={`${styles.textCenter} ${styles.py12}`}>
                <p className={`${styles.fontBody} ${styles.textMutedForeground}`}>
                  Loading messages...
                </p>
              </div>
            ) : comments.length === 0 ? (
              <div className={`${styles.textCenter} ${styles.py12}`}>
                <MessageCircle
                  className={`${styles.w16} ${styles.h16} ${styles.mxAuto} ${styles.mb4} ${styles.textMutedForeground} ${styles.opacity50}`}
                />
                <p className={`${styles.fontBody} ${styles.textMutedForeground}`}>
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
                    className={`${styles.bgCard} ${styles.shadowElevated} ${styles.hoverShadowGlow} ${styles.transitionAll} ${styles.duration500} ${styles.p6} ${
                      isVisible
                        ? styles.animateFadeInUp
                        : `${styles.opacity0} ${styles.translateY4}`
                    }`}
                    style={{ animationDelay: `${(index + 1) * 100}ms` }}
                  >
                    <div className={`${styles.flex} ${styles.itemsStart} ${styles.spaceX4}`}>
                      <div className={styles.flexShrink0}>
                        <div
                          className={`${styles.w10} ${styles.h10} ${styles.roundedFull} ${styles.bgPrimary10} ${styles.flex} ${styles.itemsCenter} ${styles.justifyCenter}`}
                        >
                          <Heart className={`${styles.w5} ${styles.h5} ${styles.textPrimary}`} />
                        </div>
                      </div>

                      <div className={styles.flex1}>
                        <div
                          className={`${styles.flex} ${styles.itemsCenter} ${styles.justifyBetween} ${styles.mb3}`}
                        >
                          <h4
                            className={`${styles.fontDisplay} ${styles.textLg} ${styles.fontSemibold} ${styles.textForeground}`}
                          >
                            {comment.name}
                          </h4>
                          <span
                            className={`${styles.fontBody} ${styles.textSm} ${styles.textMutedForeground}`}
                          >
                            {formattedDate}
                          </span>
                        </div>

                        <p
                          className={`${styles.fontBody} ${styles.textMutedForeground} ${styles.leadingRelaxed}`}
                        >
                          {comment.message}
                        </p>
                      </div>
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </div>
      </div>
    </section>
  );
};

export default Comments;
