"use client";

import { useState, useEffect, useCallback, useMemo } from "react";
import { useTheme } from "@/contexts/ThemeContext";
import { Send } from "lucide-react";
import { toast } from "react-hot-toast";
import { useParams } from "next/navigation";

interface Comment {
  id: string;
  name: string;
  message: string;
  created_at: string;
}

interface VintageGuestProps {
  guests?: Comment[];
  guestMessages?: Comment[]; // Legacy support
  initialComments?: Comment[];
}

export default function VintageGuest(props: VintageGuestProps) {
  const { isDarkMode } = useTheme();
  const params = useParams();
  const [comments, setComments] = useState<Comment[]>([]);
  const [newMessage, setNewMessage] = useState("");
  const [guestName, setGuestName] = useState("");
  const [sending, setSending] = useState(false);
  const [loadingComments, setLoadingComments] = useState(false);

  // Get slug from URL params (e.g., /alison-favour)
  const slug = params.slug as string;

  // Extract guest messages from props (prioritize initialComments > guests > guestMessages)
  const initialComments = useMemo(
    () => props.initialComments || props.guests || props.guestMessages || [],
    [props.initialComments, props.guests, props.guestMessages]
  );

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
        // Fall back to initial comments if provided
        if (initialComments && initialComments.length > 0) {
          setComments(initialComments);
        }
      }
    } catch (error) {
      console.error("Error fetching comments:", error);
      // Fall back to initial comments if provided
      if (initialComments && initialComments.length > 0) {
        setComments(initialComments);
      }
    } finally {
      setLoadingComments(false);
    }
  }, [slug, initialComments]);

  // Initialize comments
  useEffect(() => {
    if (initialComments && initialComments.length > 0) {
      setComments(initialComments);
    } else if (slug) {
      // Only fetch from API if we have a slug and no initial comments
      fetchComments();
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
    <div
      className={`rounded-3xl p-12 shadow-lg border mb-16 ${
        isDarkMode ? "bg-slate-800 border-slate-700" : "bg-white border-slate-100"
      }`}
    >
      <div className="text-center mb-12">
        <h2
          className={`text-4xl font-light mb-6 tracking-tight ${
            isDarkMode ? "text-white" : "text-slate-900"
          }`}
        >
          Wedding Guestbook
        </h2>
        <div className="w-24 h-1 bg-gradient-to-r from-indigo-600 to-purple-600 mx-auto rounded-full mb-6"></div>
        <p className={`text-lg font-light ${isDarkMode ? "text-slate-400" : "text-slate-600"}`}>
          Leave us a message and share in our joy!
        </p>
      </div>

      {/* Message Form */}
      <div
        className={`rounded-3xl p-8 mb-12 border ${
          isDarkMode
            ? "bg-gradient-to-r from-slate-700 to-indigo-900/20 border-slate-600"
            : "bg-gradient-to-r from-slate-50 to-indigo-50 border-slate-100"
        }`}
      >
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
          <div>
            <label
              className={`block text-sm font-medium mb-3 ${isDarkMode ? "text-slate-300" : "text-slate-700"}`}
            >
              Your Name
            </label>
            <input
              type="text"
              value={guestName}
              onChange={(e) => setGuestName(e.target.value)}
              className={`w-full border rounded-2xl px-4 py-3 focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-colors duration-300 ${
                isDarkMode
                  ? "bg-slate-600 border-slate-500 text-white placeholder-slate-400"
                  : "bg-white border-slate-300 text-slate-900 placeholder-slate-500"
              }`}
              placeholder="Enter your name"
            />
          </div>
          <div className="flex items-end">
            <button
              onClick={handleSendMessage}
              disabled={sending}
              className="w-full bg-gradient-to-r from-indigo-600 to-purple-600 text-white py-3 px-6 rounded-2xl font-medium hover:shadow-lg transition-all duration-300 flex items-center justify-center gap-2 disabled:opacity-70"
            >
              {sending ? (
                "Sending..."
              ) : (
                <>
                  <Send className="h-4 w-4" />
                  Send Message
                </>
              )}
            </button>
          </div>
        </div>
        <div>
          <label
            className={`block text-sm font-medium mb-3 ${isDarkMode ? "text-slate-300" : "text-slate-700"}`}
          >
            Your Message
          </label>
          <textarea
            value={newMessage}
            onChange={(e) => setNewMessage(e.target.value)}
            rows={4}
            className={`w-full border rounded-2xl px-4 py-3 focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-colors duration-300 ${
              isDarkMode
                ? "bg-slate-600 border-slate-500 text-white placeholder-slate-400"
                : "bg-white border-slate-300 text-slate-900 placeholder-slate-500"
            }`}
            placeholder="Share your congratulations and well wishes..."
          />
        </div>
      </div>

      {/* Messages */}
      {loadingComments ? (
        <div className="text-center py-12">
          <p className={`text-lg ${isDarkMode ? "text-slate-400" : "text-slate-600"}`}>
            Loading messages...
          </p>
        </div>
      ) : comments.length === 0 ? (
        <div className="text-center py-12">
          <p className={`text-lg ${isDarkMode ? "text-slate-400" : "text-slate-600"}`}>
            No messages yet. Be the first to leave a message!
          </p>
        </div>
      ) : (
        <div className="space-y-8">
          {comments.map((comment) => {
            const commentDate = new Date(comment.created_at);
            const formattedDate = commentDate.toLocaleDateString("en-US", {
              month: "short",
              day: "numeric",
              year: "numeric",
            });

            return (
              <div
                key={comment.id}
                className={`border-l-4 border-indigo-500 pl-8 py-6 rounded-r-3xl ${
                  isDarkMode ? "bg-slate-700" : "bg-slate-50"
                }`}
              >
                <div className="flex justify-between items-start mb-4">
                  <h3
                    className={`font-semibold text-lg ${isDarkMode ? "text-white" : "text-slate-900"}`}
                  >
                    {comment.name}
                  </h3>
                  <span
                    className={`text-sm px-3 py-1 rounded-full ${
                      isDarkMode ? "text-slate-400 bg-slate-600" : "text-slate-500 bg-white"
                    }`}
                  >
                    {formattedDate}
                  </span>
                </div>
                <p
                  className={`leading-relaxed font-light text-lg ${isDarkMode ? "text-slate-300" : "text-slate-700"}`}
                >
                  {comment.message}
                </p>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
