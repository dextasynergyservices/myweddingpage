"use client";

import { useState, useEffect } from "react";
import { useTheme } from "@/contexts/ThemeContext";
import { Send } from "lucide-react";

interface GuestMessage {
  id: string;
  guest: string;
  message: string;
  date: string;
}

export default function LuxuryGuest() {
  const { isDarkMode } = useTheme();
  const [messages, setMessages] = useState<GuestMessage[]>([]);
  const [newMessage, setNewMessage] = useState("");
  const [guestName, setGuestName] = useState("");
  const [loading, setLoading] = useState(true);
  const [sending, setSending] = useState(false);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const response = await fetch("/api/wedding-data");
        const data = await response.json();
        setMessages(data.guestMessages || []);
      } catch (error) {
        console.error("Error fetching guest messages:", error);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  const handleSendMessage = async () => {
    if (!guestName || !newMessage) return;
    setSending(true);

    try {
      const response = await fetch("/api/guest-messages", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          guest: guestName,
          message: newMessage
        }),
      });

      if (response.ok) {
        const newMsg = await response.json();
        setMessages([newMsg, ...messages]);
        setNewMessage("");
        setGuestName("");
      }
    } catch (error) {
      console.error("Error sending message:", error);
    } finally {
      setSending(false);
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-indigo-500"></div>
      </div>
    );
  }

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
      {messages.length === 0 ? (
        <div className="text-center py-12">
          <p className={`text-lg ${isDarkMode ? "text-slate-400" : "text-slate-600"}`}>
            No messages yet. Be the first to leave a message!
          </p>
        </div>
      ) : (
        <div className="space-y-8">
          {messages.map((message) => {
            const messageDate = new Date(message.date);
            const formattedDate = messageDate.toLocaleDateString('en-US', {
              month: 'short',
              day: 'numeric',
              year: 'numeric'
            });

            return (
              <div
                key={message.id}
                className={`border-l-4 border-indigo-500 pl-8 py-6 rounded-r-3xl ${
                  isDarkMode ? "bg-slate-700" : "bg-slate-50"
                }`}
              >
                <div className="flex justify-between items-start mb-4">
                  <h3
                    className={`font-semibold text-lg ${isDarkMode ? "text-white" : "text-slate-900"}`}
                  >
                    {message.guest}
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
                  {message.message}
                </p>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}