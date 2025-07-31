"use client";

import React, { useState, useRef, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Bot,
  Send,
  X,
  Sparkles,
  Calendar,
  DollarSign,
  Users,
  Camera,
  Lightbulb,
} from "lucide-react";
import { useTheme } from "@/contexts/ThemeContext";

interface Message {
  id: string;
  type: "user" | "assistant";
  content: string;
  timestamp: Date;
  suggestions?: string[];
}

interface AIAssistantProps {
  onClose: () => void;
}

const AIAssistant = ({ onClose }: AIAssistantProps) => {
  const { isDarkMode } = useTheme();
  const [messages, setMessages] = useState<Message[]>([
    {
      id: "1",
      type: "assistant",
      content:
        "Hi! I'm your AI wedding assistant. I can help with planning, budgeting, vendor recommendations, and more!",
      timestamp: new Date(),
      suggestions: [
        "Help me plan my timeline",
        "Suggest budget allocation",
        "Find vendors in my area",
        "Photo organization tips",
      ],
    },
  ]);
  const [inputValue, setInputValue] = useState("");
  const [isTyping, setIsTyping] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const quickActions = [
    { icon: Calendar, label: "Timeline Help", query: "Help me create a wedding day timeline" },
    { icon: DollarSign, label: "Budget Tips", query: "How should I allocate my wedding budget?" },
    { icon: Users, label: "Guest Management", query: "Tips for managing wedding guests and RSVPs" },
    { icon: Camera, label: "Photo Planning", query: "How to plan wedding photography timeline?" },
  ];

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const sendMessage = async (content: string) => {
    if (!content.trim()) return;
    const userMessage: Message = {
      id: Date.now().toString(),
      type: "user",
      content,
      timestamp: new Date(),
    };
    setMessages((prev) => [...prev, userMessage]);
    setInputValue("");
    setIsTyping(true);
    setTimeout(() => {
      const aiResponse = generateAIResponse(content);
      setMessages((prev) => [
        ...prev,
        {
          id: (Date.now() + 1).toString(),
          type: "assistant",
          content: aiResponse.content,
          timestamp: new Date(),
          suggestions: aiResponse.suggestions,
        },
      ]);
      setIsTyping(false);
    }, 1200);
  };

  const generateAIResponse = (input: string) => {
    const lower = input.toLowerCase();
    if (lower.includes("timeline")) {
      return {
        content: `Here's a simple wedding timeline...`,
        suggestions: ["Create detailed timeline", "Coordinate vendors", "Backup plans"],
      };
    }
    if (lower.includes("budget")) {
      return {
        content: `Typical budget: Venue 40%, Photos 10%, etc.`,
        suggestions: ["Track expenses", "Save costs", "Negotiate with vendors"],
      };
    }
    return {
      content: `I'm here to help with your wedding. Ask me anything!`,
      suggestions: ["Plan my timeline", "Help with budget", "Vendor tips"],
    };
  };

  return (
    <div className="h-full flex flex-col">
      <div className="p-4 border-b dark:border-slate-700 border-slate-200">
        <div className="flex justify-between items-center">
          <div className="flex gap-3 items-center">
            <div className="p-2 bg-gradient-to-r from-emerald-600 to-teal-600 rounded-xl">
              <Bot className="h-5 w-5 text-white" />
            </div>
            <div>
              <h3 className="font-semibold text-slate-900 dark:text-white">AI Wedding Assistant</h3>
              <p className="text-xs text-slate-600 dark:text-slate-400">Always here to help</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 rounded-lg text-slate-600 hover:bg-slate-100 dark:text-slate-400 dark:hover:bg-slate-700"
          >
            <X className="h-4 w-4" />
          </button>
        </div>
      </div>

      <div className="p-4 border-b border-slate-200 dark:border-slate-700 grid grid-cols-2 gap-2">
        {quickActions.map(({ icon: Icon, label, query }) => (
          <button
            key={label}
            onClick={() => sendMessage(query)}
            className="flex gap-2 items-center p-3 text-sm rounded-xl bg-slate-50 dark:bg-slate-700/50 hover:bg-slate-100 dark:hover:bg-slate-700 text-slate-600 dark:text-slate-300"
          >
            <Icon className="h-4 w-4 text-indigo-600" /> {label}
          </button>
        ))}
      </div>

      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        <AnimatePresence>
          {messages.map((msg) => (
            <motion.div
              key={msg.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className={`flex ${msg.type === "user" ? "justify-end" : "justify-start"}`}
            >
              <div className={`max-w-[80%] ${msg.type === "user" ? "order-2" : "order-1"}`}>
                {msg.type === "assistant" && (
                  <div className="flex items-center gap-2 mb-2">
                    <div className="p-1 bg-gradient-to-r from-emerald-600 to-teal-600 rounded-lg">
                      <Bot className="h-3 w-3 text-white" />
                    </div>
                    <span className="text-xs font-medium text-slate-600 dark:text-slate-400">
                      AI Assistant
                    </span>
                  </div>
                )}
                <div
                  className={`p-3 rounded-2xl text-sm whitespace-pre-line ${
                    msg.type === "user"
                      ? "bg-gradient-to-r from-indigo-600 to-purple-600 text-white"
                      : isDarkMode
                        ? "bg-slate-700 text-slate-100"
                        : "bg-slate-100 text-slate-900"
                  }`}
                >
                  {msg.content}
                </div>
                {msg.suggestions && (
                  <div className="mt-3 space-y-2">
                    {msg.suggestions.map((sug, i) => (
                      <button
                        key={i}
                        onClick={() => sendMessage(sug)}
                        className="block w-full text-left p-2 text-sm border rounded-xl flex items-center gap-2 bg-white hover:bg-slate-50 dark:bg-slate-700/50 dark:hover:bg-slate-700 dark:border-slate-600 border-slate-200 text-slate-600 dark:text-slate-300"
                      >
                        <Lightbulb className="h-3 w-3 text-amber-500" /> {sug}
                      </button>
                    ))}
                  </div>
                )}
                <div
                  className={`text-xs mt-2 ${msg.type === "user" ? "text-right" : "text-left"} text-slate-400 dark:text-slate-500`}
                >
                  {msg.timestamp.toLocaleTimeString()}
                </div>
              </div>
            </motion.div>
          ))}
        </AnimatePresence>
        {isTyping && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="flex items-center gap-2"
          >
            <Bot className="h-4 w-4 text-slate-400" />
            <span className="text-sm text-slate-400">AI Assistant is typing...</span>
          </motion.div>
        )}
        <div ref={messagesEndRef} />
      </div>

      <div className="p-4 border-t dark:border-slate-700 border-slate-200">
        <div className="flex gap-2">
          <input
            value={inputValue}
            onChange={(e) => setInputValue(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && sendMessage(inputValue)}
            placeholder="Ask me anything about your wedding..."
            className="flex-1 px-4 py-3 rounded-xl border focus:outline-none focus:ring-2 focus:ring-indigo-500/20 bg-white dark:bg-slate-700 border-slate-300 dark:border-slate-600 text-slate-900 dark:text-white placeholder-slate-500 dark:placeholder-slate-400"
          />
          <button
            onClick={() => sendMessage(inputValue)}
            disabled={!inputValue.trim()}
            className="p-3 bg-gradient-to-r from-indigo-600 to-purple-600 text-white rounded-xl hover:shadow-lg disabled:opacity-50"
          >
            <Send className="h-4 w-4" />
          </button>
        </div>
        <div className="mt-2 flex items-center gap-2 text-xs">
          <Sparkles className="h-3 w-3 text-emerald-600" />
          <span className="text-slate-600 dark:text-slate-400">
            Powered by AI • Always learning
          </span>
        </div>
      </div>
    </div>
  );
};

export default AIAssistant;
