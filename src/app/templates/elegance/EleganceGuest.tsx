"use client";

import React, { useState, useEffect, useRef } from "react";
import { Heart, MessageCircle, Send } from "lucide-react";
import { useToast } from "@/app/templates/elegance/hooks/use-toast";
import styles from "@/styles/templates/elegance.module.css";

interface Comment {
  id: number;
  name: string;
  message: string;
  date: string;
}

interface CommentsProps {
  title?: string;
  description?: string;
  existingComments?: Array<{
    id: number;
    name: string;
    message: string;
    date: string;
  }>;
  placeholder?: {
    name?: string;
    message?: string;
  };
}

const Comments: React.FC<CommentsProps> = (props) => {
  // Extract data from props with fallbacks
  const title = props.title || "Well Wishes";
  const description =
    props.description ||
    "Share your love, memories, and well wishes for our special day. Your kind words mean the world to us!";

  const existingComments = props.existingComments || [
    {
      id: 1,
      name: "Sarah & Mike Johnson",
      message:
        "We couldn't be happier for you both! Your love story is truly inspiring. Wishing you a lifetime of happiness and adventure together. ❤️",
      date: "March 15, 2024",
    },
    {
      id: 2,
      name: "The Williams Family",
      message:
        "Watching your love grow has been such a joy. We're so excited to celebrate with you and can't wait to see what beautiful memories you'll create as husband and wife!",
      date: "March 12, 2024",
    },
    {
      id: 3,
      name: "Alex Thompson",
      message:
        "From college buddies to wedding celebrations - it's been amazing watching this love story unfold. You two are perfect for each other! 🥂",
      date: "March 10, 2024",
    },
  ];

  const placeholder = props.placeholder || {
    name: "Your Name",
    message: "Share your well wishes...",
  };
  const [isVisible, setIsVisible] = useState(false);
  const [comments, setComments] = useState<Comment[]>(existingComments);

  const [newComment, setNewComment] = useState({ name: "", message: "" });
  const sectionRef = useRef<HTMLDivElement>(null);
  const { toast } = useToast();

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

  const handleSubmitComment = (e: React.FormEvent) => {
    e.preventDefault();

    if (!newComment.name.trim() || !newComment.message.trim()) {
      toast({
        title: "Please fill in all fields",
        description: "Both name and message are required.",
        variant: "destructive",
      });
      return;
    }

    const comment: Comment = {
      id: comments.length + 1,
      name: newComment.name,
      message: newComment.message,
      date: new Date().toLocaleDateString("en-US", {
        year: "numeric",
        month: "long",
        day: "numeric",
      }),
    };

    setComments((prev) => [comment, ...prev]);
    setNewComment({ name: "", message: "" });

    toast({
      title: "Thank you for your wishes! ❤️",
      description: "Your message has been shared with Emma and James.",
    });
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
            <form onSubmit={handleSubmitComment} className={styles.spaceY6}>
              <div>
                <label
                  className={`${styles.block} ${styles.fontBody} ${styles.textSm} ${styles.fontMedium} ${styles.textForeground} ${styles.mb2}`}
                >
                  Your Name(s)
                </label>
                <input
                  type="text"
                  value={newComment.name}
                  onChange={(e) => setNewComment((prev) => ({ ...prev, name: e.target.value }))}
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
                  value={newComment.message}
                  onChange={(e) => setNewComment((prev) => ({ ...prev, message: e.target.value }))}
                  placeholder="Share your wishes, memories, or advice for the happy couple..."
                  rows={4}
                  className={`${styles.wFull} ${styles.px3} ${styles.py2} ${styles.border} ${styles.borderBorder} ${styles.roundedMd} ${styles.fontBody} ${styles.textSm} ${styles.textForeground} ${styles.bgBackground} ${styles.resizeNone} ${styles.focusRingPrimary} ${styles.focusBorderPrimary}`}
                />
              </div>

              <button
                type="submit"
                className={`${styles.wFull} ${styles.smWAuto} ${styles.bgPrimary} ${styles.hoverBgPrimary90} ${styles.textPrimaryForeground} ${styles.fontSemibold} ${styles.px8} ${styles.py3} ${styles.roundedLg} ${styles.transitionAll} ${styles.shadowGlow} font-lg flex items-center justify-center`}
              >
                <Send className={`${styles.w4} ${styles.h4} ${styles.mr2}`} />
                Send Your Wishes
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

            {comments.map((comment, index) => (
              <div
                key={comment.id}
                className={`${styles.bgCard} ${styles.shadowElevated} ${styles.hoverShadowGlow} ${styles.transitionAll} ${styles.duration500} ${styles.p6} ${
                  isVisible ? styles.animateFadeInUp : `${styles.opacity0} ${styles.translateY4}`
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
                        {comment.date}
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
            ))}
          </div>

          {comments.length === 0 && (
            <div className={`${styles.textCenter} ${styles.py12}`}>
              <MessageCircle
                className={`${styles.w16} ${styles.h16} ${styles.mxAuto} ${styles.mb4} ${styles.textMutedForeground} ${styles.opacity50}`}
              />
              <p className={`${styles.fontBody} ${styles.textMutedForeground}`}>
                Be the first to share your wishes for Emma and James!
              </p>
            </div>
          )}
        </div>
      </div>
    </section>
  );
};

export default Comments;
