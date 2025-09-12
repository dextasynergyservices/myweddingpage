"use client";

import { useState } from "react";
import { useScrollAnimation } from "@/app/templates/vows/hooks/useScrollAnimation";
import { Card, CardContent } from "@/app/templates/vows/components/ui/card";
import { Button } from "@/app/templates/vows/components/ui/button";
import { Textarea } from "@/app/templates/vows/components/ui/textarea";
import { Input } from "@/app/templates/vows/components/ui/input";
import { toast } from "sonner";

interface CommentsSectionProps {
  title?: string;
  description?: string;
  existingComments?: Array<{
    id: number;
    name: string;
    message: string;
    timestamp: string;
  }>;
  placeholder?: {
    name?: string;
    message?: string;
  };
}

export const CommentsSection = (props: CommentsSectionProps) => {
  // Extract data from props with fallbacks
  const title = props.title || "Well Wishes";
  const description =
    props.description ||
    "Share your love, memories, and well wishes for our special day. Your kind words mean the world to us!";

  const existingComments = props.existingComments || [
    {
      id: 1,
      name: "Emily Rodriguez",
      message:
        "So excited to celebrate with you both! Your love story is truly inspiring and I cannot wait to see you walk down the aisle. Wishing you a lifetime of happiness! 💕",
      timestamp: "2 days ago",
    },
    {
      id: 2,
      name: "David Chen",
      message:
        "Congratulations to the beautiful couple! I have had the pleasure of watching your relationship grow over the years. Here's to your new adventure together!",
      timestamp: "3 days ago",
    },
    {
      id: 3,
      name: "Jennifer Smith",
      message:
        "You two are perfect for each other! Can't wait to dance the night away at your wedding. Love you both! 💃✨",
      timestamp: "1 week ago",
    },
    {
      id: 4,
      name: "Robert Johnson",
      message:
        "From the moment I met you both, I knew you were meant to be together. Your wedding is going to be absolutely magical! Congratulations! 🎉",
      timestamp: "1 week ago",
    },
  ];

  const placeholder = props.placeholder || {
    name: "Your Name",
    message: "Share your well wishes...",
  };
  const { ref: sectionRef, isVisible } = useScrollAnimation(0.2);
  const [newComment, setNewComment] = useState({ name: "", message: "" });
  const [comments, setComments] = useState(existingComments);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (!newComment.name.trim() || !newComment.message.trim()) {
      toast.error("Please fill in both your name and message");
      return;
    }

    const comment = {
      id: comments.length + 1,
      name: newComment.name,
      message: newComment.message,
      timestamp: "Just now",
    };

    setComments([comment, ...comments]);
    setNewComment({ name: "", message: "" });
    toast.success("Your message has been shared! ✨");
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
          <p className="font-body text-lg md:text-xl text-muted-foreground max-w-3xl mx-auto leading-relaxed">
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

                <form onSubmit={handleSubmit} className="space-y-6">
                  <div>
                    <label className="font-body text-sm font-medium text-black/80 mb-2 block">
                      Your Name
                    </label>
                    <Input
                      value={newComment.name}
                      onChange={(e) => setNewComment((prev) => ({ ...prev, name: e.target.value }))}
                      placeholder="Enter your name"
                      className="font-body"
                    />
                  </div>

                  <div>
                    <label className="font-body text-sm font-medium text-black/80 mb-2 block">
                      Your Message
                    </label>
                    <Textarea
                      value={newComment.message}
                      onChange={(e) =>
                        setNewComment((prev) => ({ ...prev, message: e.target.value }))
                      }
                      placeholder="Share your well wishes, memories, or advice for the happy couple..."
                      rows={4}
                      className="font-body resize-none"
                    />
                  </div>

                  <Button
                    type="submit"
                    className="w-full bg-black text-white hover:bg-black/80 transition-colors duration-300 font-body"
                  >
                    Share Your Wishes
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

            <div
              className="space-y-6 max-h-96 overflow-y-auto pr-2"
              style={{
                scrollbarWidth: "thin",
                scrollbarColor: "hsl(var(--accent)) hsl(var(--muted))",
              }}
            >
              {comments.map((comment, index) => (
                <Card
                  key={comment.id}
                  className={`border border-border-light hover:shadow-soft transition-all duration-300 ${
                    index === 0 && comment.timestamp === "Just now"
                      ? "bg-primary/5 border-primary/20"
                      : ""
                  }`}
                >
                  <CardContent className="p-6">
                    <div className="flex items-center justify-between mb-3">
                      <h4 className="font-body font-semibold text-black/80">{comment.name}</h4>
                      <span className="font-body text-xs text-muted-black/80">
                        {comment.timestamp}
                      </span>
                    </div>
                    <p className="font-body text-muted-foreground leading-relaxed">
                      {comment.message}
                    </p>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};
