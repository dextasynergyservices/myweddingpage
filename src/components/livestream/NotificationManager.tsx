"use client";

import React, { useState, useRef, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  X,
  Eye,
  User,
  Bold as BoldIcon,
  Italic as ItalicIcon,
  Underline as UnderlineIcon,
  List as ListIcon,
  ListOrdered,
  Link as LinkIcon,
  Heading2,
} from "lucide-react";
import { useTheme } from "@/contexts/ThemeContext";
import { useEditor, EditorContent } from "@tiptap/react";
import StarterKit from "@tiptap/starter-kit";
import LinkExtension from "@tiptap/extension-link";
import UnderlineExtension from "@tiptap/extension-underline";

interface Recipient {
  id: string;
  name: string;
  contact: string;
}

interface NotificationManagerProps {
  streamId: string;
  streamName: string;
  weddingPageUrl: string;
}

export default function NotificationManager({
  streamId,
  streamName,
  weddingPageUrl,
}: NotificationManagerProps) {
  const { isDarkMode } = useTheme();
  const [recipients, setRecipients] = useState<Recipient[]>([]);
  const [currentName, setCurrentName] = useState("");
  const [currentContact, setCurrentContact] = useState("");
  const [message, setMessage] = useState("");
  const [notificationType, setNotificationType] = useState<"email" | "whatsapp">("email");
  const [sending, setSending] = useState(false);
  const [success, setSuccess] = useState("");
  const [error, setError] = useState("");
  const [showPreview, setShowPreview] = useState(false);
  const [previewRecipient, setPreviewRecipient] = useState<Recipient | null>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  // Default message for emails (rich text HTML)
  const defaultEmailMessage = `<p>Hello <strong>{name}</strong>,</p>
<p>You're invited to watch our wedding live stream! 🎊</p>
<p><strong>Stream:</strong> ${streamName}</p>
<p>Click the link to join us on our special day and celebrate with us in real-time! 💒✨</p>
<p><a href="${weddingPageUrl}" target="_blank">${weddingPageUrl || "Link will be shared soon"}</a></p>
<p>We can't wait to celebrate with you! ❤️</p>`;

  // Default message for WhatsApp (plain text)
  const defaultWhatsAppMessage = `Hello {name}, you are invited to watch our wedding live stream! 🎊

Stream: ${streamName}

Click the link to join us on our special day and celebrate with us in real-time! 💒✨

${weddingPageUrl || "Link will be shared soon"}

We can't wait to celebrate with you! ❤️`;

  // Tiptap editor for email rich text
  const editor = useEditor({
    immediatelyRender: false, // Fix SSR hydration issues
    extensions: [
      StarterKit,
      LinkExtension.configure({
        openOnClick: false,
        HTMLAttributes: {
          target: "_blank",
          rel: "noopener noreferrer",
        },
      }),
      UnderlineExtension,
    ],
    content: message || defaultEmailMessage,
    onUpdate: ({ editor }) => {
      setMessage(editor.getHTML());
    },
    editorProps: {
      attributes: {
        class: `prose prose-sm max-w-none focus:outline-none min-h-[200px] px-4 py-3 ${
          isDarkMode ? "bg-gray-700 text-white prose-invert" : "bg-white text-black"
        }`,
      },
    },
  });

  // Update editor content when message changes externally (like template button)
  useEffect(() => {
    if (editor && notificationType === "email" && message && editor.getHTML() !== message) {
      editor.commands.setContent(message);
    }
  }, [message, editor, notificationType]);

  const addRecipient = () => {
    const trimmedContact = currentContact.trim();
    const trimmedName = currentName.trim() || "Guest";

    if (notificationType === "email") {
      if (!trimmedContact || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(trimmedContact)) {
        setError("Please enter a valid email address");
        return;
      }
    } else {
      if (!trimmedContact) {
        setError("Please enter a phone number");
        return;
      }
    }

    if (recipients.some((r) => r.contact === trimmedContact)) {
      setError(`${notificationType === "email" ? "Email" : "Phone number"} already added`);
      return;
    }

    setRecipients([
      ...recipients,
      { id: Date.now().toString(), name: trimmedName, contact: trimmedContact },
    ]);
    setCurrentName("");
    setCurrentContact("");
    setError("");
  };

  const removeRecipient = (id: string) => {
    setRecipients(recipients.filter((r) => r.id !== id));
  };

  const insertNameTokenWhatsApp = () => {
    const textarea = textareaRef.current;
    if (!textarea) return;

    const start = textarea.selectionStart;
    const newText = message.substring(0, start) + "{name}" + message.substring(start);
    setMessage(newText);

    setTimeout(() => {
      textarea.focus();
      const newPosition = start + 6; // "{name}" is 6 characters
      textarea.setSelectionRange(newPosition, newPosition);
    }, 0);
  };

  const insertNameTokenEmail = () => {
    if (editor) {
      editor.chain().focus().insertContent(" {name} ").run();
    }
  };

  const setLinkInEditor = () => {
    if (!editor) return;
    const url = window.prompt("Enter URL:");
    if (url) {
      editor.chain().focus().setLink({ href: url }).run();
    }
  };

  const personalizeMessage = (msg: string, recipientName: string): string => {
    return msg.replace(/{name}/gi, recipientName);
  };

  // Convert plain text line breaks to HTML <br> for emails
  const convertLineBreaksToHtml = (text: string): string => {
    return text.replace(/\n/g, "<br>");
  };

  // Strip HTML and convert to plain text for WhatsApp
  const stripHtmlToPlainText = (html: string): string => {
    const temp = document.createElement("div");
    temp.innerHTML = html;
    return temp.textContent || temp.innerText || "";
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!message || message === "<p><br></p>") {
      setError("Message is required");
      return;
    }

    if (recipients.length === 0) {
      setError("Please add at least one recipient");
      return;
    }

    setSending(true);
    setError("");
    setSuccess("");

    try {
      let successCount = 0;
      let failCount = 0;

      for (const recipient of recipients) {
        try {
          let personalizedMessage = personalizeMessage(message, recipient.name);

          // Normalize message depending on channel
          if (notificationType === "whatsapp") {
            // Ensure WhatsApp gets plain text (strip any HTML)
            personalizedMessage = stripHtmlToPlainText(personalizedMessage);
          } else {
            // For email: if the content looks like plain text (no tags), convert newlines to <br>
            if (!/<[a-z][\s\S]*>/i.test(personalizedMessage)) {
              personalizedMessage = convertLineBreaksToHtml(personalizedMessage);
            }
          }

          const response = await fetch("/api/notifications", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              streamId, // Include streamId for tracking
              guestName: recipient.name,
              guestEmail: notificationType === "email" ? recipient.contact : null,
              guestPhone: notificationType === "whatsapp" ? recipient.contact : null,
              message: personalizedMessage,
              notificationType,
            }),
          });

          if (response.ok) {
            successCount++;
          } else {
            failCount++;
          }
        } catch {
          failCount++;
        }
      }

      if (successCount > 0) {
        setSuccess(
          `Sent ${successCount} personalized notification${successCount > 1 ? "s" : ""} successfully!`
        );
        if (failCount > 0) {
          setError(`${failCount} notification${failCount > 1 ? "s" : ""} failed to send.`);
        }
        setRecipients([]);
        setMessage("");
      } else {
        setError("Failed to send notifications. Please try again.");
      }
    } catch (error) {
      console.error("Error sending notifications:", error);
      setError("Failed to send notifications");
    } finally {
      setSending(false);
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className={`rounded-lg shadow-lg p-6 ${isDarkMode ? "bg-gray-800" : "bg-white"}`}
    >
      <h3
        className={`text-xl font-semibold mb-4 flex items-center gap-2 ${isDarkMode ? "text-white" : "text-black"}`}
      >
        Send Guest Notifications
      </h3>

      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label
            className={`block text-sm font-medium mb-2 ${isDarkMode ? "text-white" : "text-black"}`}
          >
            Notification Type
          </label>
          <div className="flex gap-4">
            <label className="flex items-center gap-2 cursor-pointer">
              <input
                type="radio"
                value="email"
                checked={notificationType === "email"}
                onChange={(e) => {
                  setNotificationType(e.target.value as "email");
                  setRecipients([]);
                }}
                className="text-purple-500 focus:ring-purple-500"
              />
              <span className={isDarkMode ? "text-white" : "text-black"}>Email (Rich Text)</span>
            </label>
            <label className="flex items-center gap-2 cursor-pointer">
              <input
                type="radio"
                value="whatsapp"
                checked={notificationType === "whatsapp"}
                onChange={(e) => {
                  setNotificationType(e.target.value as "whatsapp");
                  setRecipients([]);
                  setMessage(""); // Clear message when switching
                }}
                className="text-purple-500 focus:ring-purple-500"
              />
              <span className={isDarkMode ? "text-white" : "text-black"}>
                WhatsApp (Plain Text)
              </span>
            </label>
          </div>
        </div>

        <div>
          <label
            className={`block text-sm font-medium mb-2 ${isDarkMode ? "text-white" : "text-black"}`}
          >
            Add Recipients (with Names for Personalization)
          </label>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-2 mb-2">
            <input
              type="text"
              value={currentName}
              onChange={(e) => setCurrentName(e.target.value)}
              onKeyPress={(e) =>
                e.key === "Enter" && currentContact && (e.preventDefault(), addRecipient())
              }
              placeholder="Guest Name (e.g., John Doe)"
              className={`px-4 py-2 border rounded-lg focus:ring-2 focus:ring-purple-500 ${isDarkMode ? "bg-gray-700 border-gray-600 text-white placeholder-gray-400" : "bg-white border-gray-300 text-black"}`}
            />
            <div className="flex gap-2">
              <input
                type={notificationType === "email" ? "email" : "tel"}
                value={currentContact}
                onChange={(e) => setCurrentContact(e.target.value)}
                onKeyPress={(e) => e.key === "Enter" && (e.preventDefault(), addRecipient())}
                placeholder={notificationType === "email" ? "email@example.com" : "+1234567890"}
                className={`flex-1 px-4 py-2 border rounded-lg focus:ring-2 focus:ring-purple-500 ${isDarkMode ? "bg-gray-700 border-gray-600 text-white placeholder-gray-400" : "bg-white border-gray-300 text-black"}`}
              />
              <button
                type="button"
                onClick={addRecipient}
                className="px-4 py-2 bg-purple-500 text-white rounded-lg hover:bg-purple-600 transition-colors"
              >
                Add
              </button>
            </div>
          </div>
          <p className={`text-xs mb-2 ${isDarkMode ? "text-gray-400" : "text-gray-500"}`}>
            Add name and {notificationType === "email" ? "email" : "phone"}, then click Add or press
            Enter. Use {"{name}"} in your message for personalization!
          </p>

          {recipients.length > 0 && (
            <div className="mt-3 space-y-2 max-h-48 overflow-y-auto">
              {recipients.map((recipient) => (
                <div
                  key={recipient.id}
                  className={`flex items-center justify-between p-3 rounded-lg ${isDarkMode ? "bg-gray-700" : "bg-gray-100"}`}
                >
                  <div className="flex items-center gap-3">
                    <User className="h-4 w-4" />
                    <div>
                      <p
                        className={`font-medium text-sm ${isDarkMode ? "text-white" : "text-black"}`}
                      >
                        {recipient.name}
                      </p>
                      <p className={`text-xs ${isDarkMode ? "text-gray-400" : "text-gray-500"}`}>
                        {recipient.contact}
                      </p>
                    </div>
                  </div>
                  <div className="flex gap-2">
                    <button
                      type="button"
                      onClick={() => {
                        setPreviewRecipient(recipient);
                        setShowPreview(true);
                      }}
                      className="p-1 hover:text-blue-500 transition-colors"
                      title="Preview personalized message"
                    >
                      <Eye className="h-4 w-4" />
                    </button>
                    <button
                      type="button"
                      onClick={() => removeRecipient(recipient.id)}
                      className="p-1 hover:text-red-500 transition-colors"
                    >
                      <X className="h-4 w-4" />
                    </button>
                  </div>
                </div>
              ))}
              <p className={`text-xs mt-2 ${isDarkMode ? "text-gray-400" : "text-gray-500"}`}>
                Total: {recipients.length} recipient
                {recipients.length > 1 ? "s" : ""}
              </p>
            </div>
          )}
        </div>

        {/* Message Editor - Different for Email vs WhatsApp */}
        <div>
          <div className="flex items-center justify-between mb-2">
            <label className={`text-sm font-medium ${isDarkMode ? "text-white" : "text-black"}`}>
              {notificationType === "email" ? "Message (Rich Text Editor)" : "Message (Plain Text)"}
            </label>
            <div className="flex gap-2">
              <button
                type="button"
                onClick={
                  notificationType === "email" ? insertNameTokenEmail : insertNameTokenWhatsApp
                }
                className={`px-3 py-1 text-xs rounded transition-colors ${isDarkMode ? "bg-purple-600 text-white hover:bg-purple-700" : "bg-purple-100 text-purple-700 hover:bg-purple-200"}`}
              >
                Insert {"{name}"}
              </button>
              <button
                type="button"
                onClick={() =>
                  setMessage(
                    notificationType === "email" ? defaultEmailMessage : defaultWhatsAppMessage
                  )
                }
                className="px-3 py-1 text-xs text-purple-500 hover:text-purple-600"
              >
                Use Template
              </button>
            </div>
          </div>

          {/* Email: Rich Text Editor */}
          {notificationType === "email" ? (
            <div>
              {/* Tiptap Toolbar */}
              <div
                className={`flex flex-wrap gap-1 p-2 mb-0 border rounded-t-lg ${
                  isDarkMode ? "bg-gray-700 border-gray-600" : "bg-gray-50 border-gray-300"
                }`}
              >
                <button
                  type="button"
                  onClick={() => editor?.chain().focus().toggleBold().run()}
                  className={`p-2 rounded transition-colors ${
                    editor?.isActive("bold")
                      ? "bg-purple-500 text-white"
                      : isDarkMode
                        ? "text-white hover:bg-gray-600"
                        : "text-black hover:bg-gray-200"
                  }`}
                  title="Bold"
                >
                  <BoldIcon className="h-4 w-4" />
                </button>
                <button
                  type="button"
                  onClick={() => editor?.chain().focus().toggleItalic().run()}
                  className={`p-2 rounded transition-colors ${
                    editor?.isActive("italic")
                      ? "bg-purple-500 text-white"
                      : isDarkMode
                        ? "text-white hover:bg-gray-600"
                        : "text-black hover:bg-gray-200"
                  }`}
                  title="Italic"
                >
                  <ItalicIcon className="h-4 w-4" />
                </button>
                <button
                  type="button"
                  onClick={() => editor?.chain().focus().toggleUnderline().run()}
                  className={`p-2 rounded transition-colors ${
                    editor?.isActive("underline")
                      ? "bg-purple-500 text-white"
                      : isDarkMode
                        ? "text-white hover:bg-gray-600"
                        : "text-black hover:bg-gray-200"
                  }`}
                  title="Underline"
                >
                  <UnderlineIcon className="h-4 w-4" />
                </button>
                <button
                  type="button"
                  onClick={() => editor?.chain().focus().toggleHeading({ level: 2 }).run()}
                  className={`p-2 rounded transition-colors ${
                    editor?.isActive("heading", { level: 2 })
                      ? "bg-purple-500 text-white"
                      : isDarkMode
                        ? "text-white hover:bg-gray-600"
                        : "text-black hover:bg-gray-200"
                  }`}
                  title="Heading"
                >
                  <Heading2 className="h-4 w-4" />
                </button>
                <button
                  type="button"
                  onClick={() => editor?.chain().focus().toggleBulletList().run()}
                  className={`p-2 rounded transition-colors ${
                    editor?.isActive("bulletList")
                      ? "bg-purple-500 text-white"
                      : isDarkMode
                        ? "text-white hover:bg-gray-600"
                        : "text-black hover:bg-gray-200"
                  }`}
                  title="Bullet List"
                >
                  <ListIcon className="h-4 w-4" />
                </button>
                <button
                  type="button"
                  onClick={() => editor?.chain().focus().toggleOrderedList().run()}
                  className={`p-2 rounded transition-colors ${
                    editor?.isActive("orderedList")
                      ? "bg-purple-500 text-white"
                      : isDarkMode
                        ? "text-white hover:bg-gray-600"
                        : "text-black hover:bg-gray-200"
                  }`}
                  title="Numbered List"
                >
                  <ListOrdered className="h-4 w-4" />
                </button>
                <button
                  type="button"
                  onClick={setLinkInEditor}
                  className={`p-2 rounded transition-colors ${
                    editor?.isActive("link")
                      ? "bg-purple-500 text-white"
                      : isDarkMode
                        ? "text-white hover:bg-gray-600"
                        : "text-black hover:bg-gray-200"
                  }`}
                  title="Add Link"
                >
                  <LinkIcon className="h-4 w-4" />
                </button>
              </div>

              {/* Tiptap Editor */}
              <div
                className={`border border-t-0 rounded-b-lg ${
                  isDarkMode ? "border-gray-600" : "border-gray-300"
                }`}
              >
                <EditorContent editor={editor} />
              </div>
            </div>
          ) : (
            /* WhatsApp: Plain Text Area */
            <textarea
              ref={textareaRef}
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              placeholder={defaultWhatsAppMessage}
              className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-purple-500 resize-none ${isDarkMode ? "bg-gray-700 border-gray-600 text-white placeholder-gray-400" : "bg-white border-gray-300 text-black"}`}
              rows={12}
              required
            />
          )}

          <p className={`text-xs mt-2 ${isDarkMode ? "text-gray-400" : "text-gray-500"}`}>
            💡{" "}
            {notificationType === "email"
              ? "Full rich text formatting available. Use {name} for personalization."
              : "Plain text with line breaks preserved. Use {name} for personalization."}
          </p>
        </div>

        {error && (
          <div
            className={`p-3 rounded-lg border ${isDarkMode ? "bg-red-900/20 border-red-800 text-red-400" : "bg-red-50 border-red-200 text-red-600"}`}
          >
            <p className="text-sm">{error}</p>
          </div>
        )}

        {success && (
          <div
            className={`p-3 rounded-lg border ${isDarkMode ? "bg-green-900/20 border-green-800 text-green-400" : "bg-green-50 border-green-200 text-green-600"}`}
          >
            <p className="text-sm">{success}</p>
          </div>
        )}

        <button
          type="submit"
          disabled={sending || recipients.length === 0}
          className="w-full px-6 py-3 bg-gradient-to-r from-purple-500 to-pink-500 text-white font-medium rounded-lg shadow-lg hover:shadow-xl transition-all disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {sending
            ? "Sending personalized messages..."
            : `Send to ${recipients.length} Recipient${recipients.length !== 1 ? "s" : ""}`}
        </button>
      </form>

      <AnimatePresence>
        {showPreview && previewRecipient && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4"
            onClick={() => setShowPreview(false)}
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              onClick={(e) => e.stopPropagation()}
              className={`max-w-2xl w-full rounded-lg shadow-2xl p-6 ${isDarkMode ? "bg-gray-800" : "bg-white"}`}
            >
              <div className="flex items-center justify-between mb-4">
                <h4 className={`text-lg font-semibold ${isDarkMode ? "text-white" : "text-black"}`}>
                  Preview for {previewRecipient.name}
                </h4>
                <button
                  onClick={() => setShowPreview(false)}
                  className="p-2 hover:bg-gray-200 dark:hover:bg-gray-700 rounded-full transition-colors"
                >
                  <X className="h-5 w-5" />
                </button>
              </div>
              <div
                className={`p-4 rounded-lg border ${isDarkMode ? "bg-gray-700 border-gray-600" : "bg-gray-50 border-gray-200"}`}
              >
                <p className={`text-sm mb-3 ${isDarkMode ? "text-gray-400" : "text-gray-500"}`}>
                  <strong>To:</strong> {previewRecipient.contact}
                </p>
                {notificationType === "email" ? (
                  <div
                    className={`${isDarkMode ? "text-white" : "text-black"}`}
                    dangerouslySetInnerHTML={{
                      __html: personalizeMessage(
                        message || defaultEmailMessage,
                        previewRecipient.name
                      ),
                    }}
                  />
                ) : (
                  <pre
                    className={`whitespace-pre-wrap font-sans ${isDarkMode ? "text-white" : "text-black"}`}
                  >
                    {personalizeMessage(message || defaultWhatsAppMessage, previewRecipient.name)}
                  </pre>
                )}
              </div>
              <p className={`text-xs mt-3 ${isDarkMode ? "text-gray-400" : "text-gray-500"}`}>
                This is how the message will look when sent to {previewRecipient.name} via{" "}
                {notificationType}
              </p>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Tiptap Editor Styles */}
      <style jsx global>{`
        .ProseMirror {
          min-height: 200px;
          padding: 12px 16px;
        }
        .ProseMirror:focus {
          outline: none;
        }
        .ProseMirror p {
          margin: 0.5em 0;
        }
        .ProseMirror h2 {
          font-size: 1.5em;
          font-weight: bold;
          margin: 0.5em 0;
        }
        .ProseMirror ul,
        .ProseMirror ol {
          padding-left: 1.5em;
          margin: 0.5em 0;
        }
        .ProseMirror a {
          color: #a855f7;
          text-decoration: underline;
        }
        .ProseMirror a:hover {
          color: #9333ea;
        }
        .ProseMirror-focused {
          border-color: #a855f7;
        }
      `}</style>
    </motion.div>
  );
}
