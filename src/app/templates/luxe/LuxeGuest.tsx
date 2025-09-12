"use client";

import { useEffect, useRef, useState } from "react";
import { Heart, MessageSquare, Send } from "lucide-react";
import Image from "next/image";

interface Comment {
  id: number;
  name: string;
  message: string;
  date: string;
  avatar?: string;
}

export default function Comments() {
  const [isVisible, setIsVisible] = useState(false);
  const [comments, setComments] = useState<Comment[]>([
    {
      id: 1,
      name: "Emma Johnson",
      message:
        "So excited to celebrate with you both! You&apos;re perfect for each other. Can&apos;t wait for the big day! 💕",
      date: "2 days ago",
      avatar:
        "https://images.pexels.com/photos/774909/pexels-photo-774909.jpeg?auto=compress&cs=tinysrgb&w=100",
    },
    {
      id: 2,
      name: "David Smith",
      message:
        "Congratulations! Been waiting for this moment since you two started dating. Wishing you both a lifetime of happiness! 🎉",
      date: "1 week ago",
      avatar:
        "https://images.pexels.com/photos/220453/pexels-photo-220453.jpeg?auto=compress&cs=tinysrgb&w=100",
    },
    {
      id: 3,
      name: "Lisa Chen",
      message:
        "Your love story is so beautiful! Thank you for sharing your journey with us. See you at the altar! ✨",
      date: "2 weeks ago",
      avatar:
        "https://images.pexels.com/photos/415829/pexels-photo-415829.jpeg?auto=compress&cs=tinysrgb&w=100",
    },
  ]);

  const [newComment, setNewComment] = useState({ name: "", message: "" });
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

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (newComment.name && newComment.message) {
      const comment: Comment = {
        id: comments.length + 1,
        name: newComment.name,
        message: newComment.message,
        date: "Just now",
      };
      setComments([comment, ...comments]);
      setNewComment({ name: "", message: "" });
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
            Wedding Wishes
          </h2>
          <p className="text-xl text-gray-600 max-w-2xl mx-auto">
            Share your love, blessings, and excitement for our special day
          </p>
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

            <form onSubmit={handleSubmit} className="space-y-6">
              <div>
                <input
                  type="text"
                  placeholder="Your Name"
                  value={newComment.name}
                  onChange={(e) => setNewComment({ ...newComment, name: e.target.value })}
                  className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:border-purple-500 focus:ring-2 focus:ring-purple-200 transition-all duration-300 bg-white/50 backdrop-blur-sm"
                  required
                />
              </div>
              <div>
                <textarea
                  placeholder="Share your wishes, memories, or excitement..."
                  value={newComment.message}
                  onChange={(e) => setNewComment({ ...newComment, message: e.target.value })}
                  rows={4}
                  className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:border-purple-500 focus:ring-2 focus:ring-purple-200 transition-all duration-300 bg-white/50 backdrop-blur-sm resize-none"
                  required
                />
              </div>
              <button
                type="submit"
                className="bg-gradient-to-r from-indigo-500 to-purple-500 text-white px-8 py-3 rounded-xl font-medium hover:from-indigo-600 hover:to-purple-600 transition-all duration-300 transform hover:scale-105 flex items-center gap-2 shadow-lg"
              >
                <Send className="w-5 h-5" />
                Send Your Wishes
              </button>
            </form>
          </div>

          {/* Comments List */}
          <div className="space-y-6">
            {comments.map((comment, index) => (
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
                      <span className="text-sm text-gray-500">{comment.date}</span>
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
            ))}
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
