import { useState } from "react";
import { useScrollAnimation } from "./hooks/useScrollAnimation";
import { Button } from "./components/ui/button";
import { MessageCircle, Heart, Send } from "lucide-react";
import styles from "@/styles/templates/bloom.module.css";

interface CommentsProps {
  title?: string;
  description?: string;
  existingComments?: Array<{
    id: number;
    name: string;
    message: string;
    timestamp: string;
    hearts: number;
  }>;
  placeholder?: {
    name?: string;
    message?: string;
  };
}

const Comments = ({
  title = "Well Wishes",
  description = "Share your love, memories, and well wishes for our special day. Your kind words mean the world to us!",
  existingComments = [
    {
      id: 1,
      name: "Emily Johnson",
      message:
        "Your love story is absolutely beautiful! Can't wait to celebrate with you both. Wishing you a lifetime of happiness! 💕",
      timestamp: "2 days ago",
      hearts: 12,
    },
    {
      id: 2,
      name: "Michael Chen",
      message:
        "So excited for your big day! You two are perfect for each other. Here's to your forever and always! 🥂",
      timestamp: "3 days ago",
      hearts: 8,
    },
    {
      id: 3,
      name: "Lisa Rodriguez",
      message:
        "Watching your love grow has been such a joy. Can't wait to see you walk down the aisle! You're going to be the most beautiful bride. ✨",
      timestamp: "5 days ago",
      hearts: 15,
    },
    {
      id: 4,
      name: "David Thompson",
      message:
        "You found yourself a keeper! You're getting an amazing partner. Cheers to your new adventure together! 🎉",
      timestamp: "1 week ago",
      hearts: 6,
    },
  ],
  placeholder = {
    name: "Your Name",
    message: "Share your well wishes...",
  },
}: CommentsProps) => {
  const { elementRef, isVisible } = useScrollAnimation(0.2);
  const [newComment, setNewComment] = useState({ name: "", message: "" });
  const [comments, setComments] = useState(existingComments);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (newComment.name.trim() && newComment.message.trim()) {
      const comment = {
        id: comments.length + 1,
        name: newComment.name,
        message: newComment.message,
        timestamp: "Just now",
        hearts: 0,
      };
      setComments([comment, ...comments]);
      setNewComment({ name: "", message: "" });
    }
  };

  const addHeart = (commentId: number) => {
    setComments(
      comments.map((comment) =>
        comment.id === commentId ? { ...comment, hearts: comment.hearts + 1 } : comment
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

              <form onSubmit={handleSubmit} className={`${styles.commentForm} space-y-6`}>
                <div>
                  <label
                    className={`${styles.formLabel} block text-sm font-medium ${styles.textForeground} mb-2`}
                  >
                    Your Name
                  </label>
                  <input
                    type="text"
                    value={newComment.name}
                    onChange={(e) => setNewComment((prev) => ({ ...prev, name: e.target.value }))}
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
                    value={newComment.message}
                    onChange={(e) =>
                      setNewComment((prev) => ({ ...prev, message: e.target.value }))
                    }
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
                    className={`${styles.commentSubmitButton} group`}
                  >
                    <Send
                      className={`${styles.commentButtonIcon} w-5 h-5 mr-2 transition-transform group-hover:translate-x-1`}
                    />
                    Send Your Wishes
                  </Button>
                </div>
              </form>
            </div>
          </div>

          {/* Comments List */}
          <div className={`${styles.spaceY8}`}>
            {comments.map((comment, index) => (
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
                  <div className={`${styles.commentHeader} flex items-start justify-between mb-4`}>
                    <div>
                      <h4
                        className={`${styles.commentAuthor} font-semibold ${styles.textForeground} text-lg`}
                      >
                        {comment.name}
                      </h4>
                      <p className={`${styles.commentTimestamp} text-sm ${styles.textMuted}`}>
                        {comment.timestamp}
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
                        {comment.hearts}
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
            ))}
          </div>

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
