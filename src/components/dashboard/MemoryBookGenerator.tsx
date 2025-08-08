"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import Image from "next/image";
import {
  BookOpen,
  MessageSquare,
  Download,
  Image as ImageIcon,
  Share2,
  Edit,
  Plus,
  Layout,
  Sparkles,
  Eye,
  Printer,
  FileText,
  Heart,
  Trash2,
} from "lucide-react";
import { useTheme } from "../../contexts/ThemeContext";

interface PageContent {
  title?: string;
  subtitle?: string;
  date?: string;
  coverImage?: string;
  photos?: string[];
  caption?: string;
  messages?: Array<{
    author: string;
    message: string;
  }>;
  events?: Array<{
    time: string;
    event: string;
  }>;
  text?: string;
  image?: string;
}

interface MemoryPage {
  id: string;
  type: "cover" | "photos" | "messages" | "timeline" | "custom";
  title: string;
  content: PageContent;
  layout: string;
}

// interface Template {
//   id: string;
//   name: string;
//   preview: string;
//   pages: number;
//   style: string;
// }

const MemoryBookGenerator = () => {
  const { isDarkMode } = useTheme();
  const [currentBook, setCurrentBook] = useState<MemoryPage[]>([
    {
      id: "1",
      type: "cover",
      title: "Cover Page",
      content: {
        title: "Our Wedding Day",
        subtitle: "Emily & David",
        date: "June 15, 2024",
        coverImage:
          "https://images.pexels.com/photos/1024993/pexels-photo-1024993.jpeg?auto=compress&cs=tinysrgb&w=600",
      },
      layout: "classic",
    },
    {
      id: "2",
      type: "photos",
      title: "Ceremony Photos",
      content: {
        photos: [
          "https://images.pexels.com/photos/1444442/pexels-photo-1444442.jpeg?auto=compress&cs=tinysrgb&w=300",
          "https://images.pexels.com/photos/1024866/pexels-photo-1024866.jpeg?auto=compress&cs=tinysrgb&w=300",
          "https://images.pexels.com/photos/1024960/pexels-photo-1024960.jpeg?auto=compress&cs=tinysrgb&w=300",
          "https://images.pexels.com/photos/1444531/pexels-photo-1444531.jpeg?auto=compress&cs=tinysrgb&w=300",
        ],
        caption: 'The moment we said "I do"',
      },
      layout: "grid",
    },
    {
      id: "3",
      type: "messages",
      title: "Guest Messages",
      content: {
        messages: [
          {
            author: "Sarah Johnson",
            message: "Congratulations! Your wedding was absolutely beautiful.",
          },
          {
            author: "Michael Brown",
            message: "Wishing you both a lifetime of happiness and love.",
          },
          { author: "Lisa Davis", message: "Such a wonderful celebration! Love you both!" },
        ],
      },
      layout: "elegant",
    },
  ]);

  const [selectedPage, setSelectedPage] = useState<MemoryPage | null>(null);
  const [isGenerating, setIsGenerating] = useState(false);

  const generateMemoryBook = async () => {
    setIsGenerating(true);
    await new Promise((resolve) => setTimeout(resolve, 3000));

    const aiPages: MemoryPage[] = [
      {
        id: "4",
        type: "timeline",
        title: "Wedding Timeline",
        content: {
          events: [
            { time: "3:00 PM", event: "Ceremony Begins" },
            { time: "4:30 PM", event: "Cocktail Hour" },
            { time: "6:00 PM", event: "Reception Dinner" },
            { time: "9:00 PM", event: "First Dance" },
          ],
        },
        layout: "timeline",
      },
      {
        id: "5",
        type: "custom",
        title: "Thank You",
        content: {
          text: "Thank you to everyone who made our special day unforgettable.",
          image:
            "https://images.pexels.com/photos/1024960/pexels-photo-1024960.jpeg?auto=compress&cs=tinysrgb&w=600",
        },
        layout: "centered",
      },
    ];

    setCurrentBook((prev) => [...prev, ...aiPages]);
    setIsGenerating(false);
  };

  const deletePage = (id: string) => {
    setCurrentBook((prev) => prev.filter((page) => page.id !== id));
    if (selectedPage?.id === id) {
      setSelectedPage(null);
    }
  };

  const renderPagePreview = (page: MemoryPage) => {
    switch (page.type) {
      case "cover":
        return (
          <div className="aspect-[3/4] bg-gradient-to-br from-indigo-600 to-purple-600 rounded-2xl p-6 text-white flex flex-col justify-center items-center text-center">
            <h1 className="text-2xl font-bold mb-2">{page.content.title}</h1>
            <h2 className="text-lg mb-4">{page.content.subtitle}</h2>
            <p className="text-sm opacity-90">{page.content.date}</p>
          </div>
        );
      case "photos":
        return (
          <div className="aspect-[3/4] bg-white dark:bg-slate-700 rounded-2xl p-4">
            <h3
              className={`text-lg font-semibold mb-4 ${isDarkMode ? "text-white" : "text-slate-900"}`}
            >
              {page.title}
            </h3>
            <div className="grid grid-cols-2 gap-2">
              {page.content.photos?.slice(0, 4).map((photo, i) => (
                <Image
                  key={i}
                  src={photo}
                  alt={`Photo ${i + 1}`}
                  className="w-full h-16 object-cover rounded-lg"
                  width={100}
                  height={100}
                />
              ))}
            </div>
          </div>
        );
      case "messages":
        return (
          <div className="aspect-[3/4] bg-white dark:bg-slate-700 rounded-2xl p-4">
            <h3
              className={`text-lg font-semibold mb-4 ${isDarkMode ? "text-white" : "text-slate-900"}`}
            >
              {page.title}
            </h3>
            <div className="space-y-3">
              {page.content.messages?.slice(0, 2).map((msg, i) => (
                <div
                  key={i}
                  className={`p-3 rounded-lg ${isDarkMode ? "bg-slate-600" : "bg-slate-100"}`}
                >
                  <p className={`text-xs ${isDarkMode ? "text-slate-300" : "text-slate-700"}`}>
                    &quot;{msg.message.substring(0, 50)}...&quot;
                  </p>
                  <p
                    className={`text-xs mt-1 font-medium ${isDarkMode ? "text-slate-400" : "text-slate-600"}`}
                  >
                    - {msg.author}
                  </p>
                </div>
              ))}
            </div>
          </div>
        );
      default:
        return (
          <div className="aspect-[3/4] bg-slate-100 dark:bg-slate-700 rounded-2xl p-4 flex items-center justify-center">
            <div className="text-center">
              <FileText
                className={`h-8 w-8 mx-auto mb-2 ${isDarkMode ? "text-slate-400" : "text-slate-500"}`}
              />
              <p className={`text-sm ${isDarkMode ? "text-slate-400" : "text-slate-600"}`}>
                {page.title}
              </p>
            </div>
          </div>
        );
    }
  };

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 sm:gap-6">
        <div>
          <h1
            className={`text-3xl font-light mb-2 ${isDarkMode ? "text-white" : "text-slate-900"}`}
          >
            Memory Book Generator
          </h1>
          <p className={`${isDarkMode ? "text-slate-400" : "text-slate-600"}`}>
            Create a beautiful memory book of your wedding day
          </p>
        </div>
        <div className="flex gap-3">
          <button
            onClick={() => {}}
            className="flex items-center gap-2 px-6 py-3 bg-slate-600 text-white rounded-2xl hover:bg-slate-700 transition-all duration-300"
          >
            <Layout className="h-5 w-5" />
            Templates
          </button>
          <button
            onClick={generateMemoryBook}
            disabled={isGenerating}
            className="flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-emerald-600 to-teal-600 text-white rounded-2xl hover:shadow-lg transition-all duration-300 disabled:opacity-50"
          >
            {isGenerating ? (
              <>
                <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                Generating...
              </>
            ) : (
              <>
                <Sparkles className="h-5 w-5" />
                AI Generate
              </>
            )}
          </button>
        </div>
      </div>

      {/* Book Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        {[
          {
            title: "Total Pages",
            value: currentBook.length,
            icon: BookOpen,
            color: "from-blue-500 to-indigo-600",
          },
          {
            title: "Photos",
            value: currentBook.filter((p) => p.type === "photos").length,
            icon: ImageIcon,
            color: "from-purple-500 to-pink-600",
          },
          {
            title: "Messages",
            value: currentBook.filter((p) => p.type === "messages").length,
            icon: MessageSquare,
            color: "from-emerald-500 to-teal-600",
          },
          { title: "Completion", value: "75%", icon: Heart, color: "from-amber-500 to-orange-600" },
        ].map((stat, index) => (
          <motion.div
            key={stat.title}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.1 }}
            className={`rounded-3xl p-6 shadow-lg border ${
              isDarkMode ? "bg-slate-800 border-slate-700" : "bg-white border-slate-100"
            }`}
          >
            <div className="flex items-center justify-between">
              <div>
                <p
                  className={`text-sm font-medium ${
                    isDarkMode ? "text-slate-400" : "text-slate-500"
                  }`}
                >
                  {stat.title}
                </p>
                <p
                  className={`text-3xl font-light mt-1 ${
                    isDarkMode ? "text-white" : "text-slate-900"
                  }`}
                >
                  {stat.value}
                </p>
              </div>
              <div className={`p-3 bg-gradient-to-r ${stat.color} rounded-2xl`}>
                <stat.icon className="h-6 w-6 text-white" />
              </div>
            </div>
          </motion.div>
        ))}
      </div>

      {/* Page Builder */}
      <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
        {/* Page List */}
        <div
          className={`lg:col-span-1 rounded-3xl p-6 shadow-lg border h-fit ${
            isDarkMode ? "bg-slate-800 border-slate-700" : "bg-white border-slate-100"
          }`}
        >
          <div className="flex items-center justify-between mb-6">
            <h2 className={`text-xl font-semibold ${isDarkMode ? "text-white" : "text-slate-900"}`}>
              Pages
            </h2>
            <div className="relative">
              <button className="p-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors">
                <Plus className="h-4 w-4" />
              </button>
            </div>
          </div>

          <div className="space-y-3">
            {currentBook.map((page, index) => (
              <motion.div
                key={page.id}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: index * 0.05 }}
                onClick={() => setSelectedPage(page)}
                className={`p-3 rounded-2xl cursor-pointer transition-all duration-300 ${
                  selectedPage?.id === page.id
                    ? "bg-indigo-100 dark:bg-indigo-900/30 border-2 border-indigo-500"
                    : isDarkMode
                      ? "bg-slate-700 hover:bg-slate-600 border-2 border-transparent"
                      : "bg-slate-50 hover:bg-slate-100 border-2 border-transparent"
                }`}
              >
                <div className="flex items-center gap-3">
                  <div
                    className={`w-8 h-10 rounded border-2 flex items-center justify-center text-xs font-medium ${
                      isDarkMode ? "border-slate-600 bg-slate-600" : "border-slate-300 bg-white"
                    }`}
                  >
                    {index + 1}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p
                      className={`font-medium truncate ${
                        isDarkMode ? "text-white" : "text-slate-900"
                      }`}
                    >
                      {page.title}
                    </p>
                    <p className={`text-xs ${isDarkMode ? "text-slate-400" : "text-slate-600"}`}>
                      {page.type}
                    </p>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        </div>

        {/* Page Preview */}
        <div
          className={`lg:col-span-2 rounded-3xl p-8 shadow-lg border ${
            isDarkMode ? "bg-slate-800 border-slate-700" : "bg-white border-slate-100"
          }`}
        >
          <div className="flex items-center justify-between mb-6">
            <h2 className={`text-xl font-semibold ${isDarkMode ? "text-white" : "text-slate-900"}`}>
              Page Preview
            </h2>
            <div className="flex gap-2">
              <button
                className={`p-2 rounded-lg transition-colors ${
                  isDarkMode
                    ? "text-slate-400 hover:bg-slate-700 hover:text-white"
                    : "text-slate-600 hover:bg-slate-100 hover:text-slate-900"
                }`}
              >
                <Edit className="h-4 w-4" />
              </button>
              <button
                className={`p-2 rounded-lg transition-colors ${
                  isDarkMode
                    ? "text-slate-400 hover:bg-slate-700 hover:text-white"
                    : "text-slate-600 hover:bg-slate-100 hover:text-slate-900"
                }`}
              >
                <Eye className="h-4 w-4" />
              </button>
            </div>
          </div>

          <div className="flex justify-center">
            {selectedPage ? (
              <div className="w-full max-w-md">{renderPagePreview(selectedPage)}</div>
            ) : (
              <div className="w-full max-w-md aspect-[3/4] border-2 border-dashed border-slate-300 dark:border-slate-600 rounded-2xl flex items-center justify-center">
                <div className="text-center">
                  <BookOpen
                    className={`h-16 w-16 mx-auto mb-4 ${
                      isDarkMode ? "text-slate-600" : "text-slate-400"
                    }`}
                  />
                  <p className={`${isDarkMode ? "text-slate-400" : "text-slate-600"}`}>
                    Select a page to preview
                  </p>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Page Settings */}
        <div
          className={`lg:col-span-1 rounded-3xl p-6 shadow-lg border h-fit ${
            isDarkMode ? "bg-slate-800 border-slate-700" : "bg-white border-slate-100"
          }`}
        >
          <h2
            className={`text-xl font-semibold mb-6 ${isDarkMode ? "text-white" : "text-slate-900"}`}
          >
            Page Settings
          </h2>

          {selectedPage ? (
            <div className="space-y-6">
              <div>
                <label
                  className={`block text-sm font-medium mb-2 ${
                    isDarkMode ? "text-slate-300" : "text-slate-700"
                  }`}
                >
                  Page Title
                </label>
                <input
                  type="text"
                  value={selectedPage.title}
                  className={`w-full px-3 py-2 rounded-xl border transition-colors ${
                    isDarkMode
                      ? "bg-slate-700 border-slate-600 text-white"
                      : "bg-white border-slate-300 text-slate-900"
                  } focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500`}
                />
              </div>

              <div>
                <label
                  className={`block text-sm font-medium mb-2 ${
                    isDarkMode ? "text-slate-300" : "text-slate-700"
                  }`}
                >
                  Layout Style
                </label>
                <select
                  value={selectedPage.layout}
                  className={`w-full px-3 py-2 rounded-xl border transition-colors ${
                    isDarkMode
                      ? "bg-slate-700 border-slate-600 text-white"
                      : "bg-white border-slate-300 text-slate-900"
                  } focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500`}
                >
                  <option value="classic">Classic</option>
                  <option value="modern">Modern</option>
                  <option value="elegant">Elegant</option>
                  <option value="rustic">Rustic</option>
                </select>
              </div>

              <div className="pt-4 border-t border-slate-200 dark:border-slate-700">
                <button
                  onClick={() => selectedPage && deletePage(selectedPage.id)}
                  className="w-full flex items-center justify-center gap-2 px-4 py-2 bg-red-600 text-white rounded-xl hover:bg-red-700 transition-colors"
                >
                  <Trash2 className="h-4 w-4" />
                  Delete Page
                </button>
              </div>
            </div>
          ) : (
            <div className="text-center py-8">
              <BookOpen
                className={`h-12 w-12 mx-auto mb-4 ${
                  isDarkMode ? "text-slate-600" : "text-slate-400"
                }`}
              />
              <p className={`${isDarkMode ? "text-slate-400" : "text-slate-600"}`}>
                Select a page to edit settings
              </p>
            </div>
          )}
        </div>
      </div>

      {/* Export Options */}
      <div
        className={`rounded-3xl p-6 shadow-lg border ${
          isDarkMode ? "bg-slate-800 border-slate-700" : "bg-white border-slate-100"
        }`}
      >
        <h2
          className={`text-xl font-semibold mb-6 ${isDarkMode ? "text-white" : "text-slate-900"}`}
        >
          Export & Share
        </h2>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <button className="flex items-center justify-center gap-2 px-6 py-3 bg-gradient-to-r from-indigo-600 to-purple-600 text-white rounded-2xl hover:shadow-lg transition-all duration-300">
            <Download className="h-5 w-5" />
            Download PDF
          </button>
          <button className="flex items-center justify-center gap-2 px-6 py-3 bg-gradient-to-r from-emerald-600 to-teal-600 text-white rounded-2xl hover:shadow-lg transition-all duration-300">
            <Printer className="h-5 w-5" />
            Print Book
          </button>
          <button className="flex items-center justify-center gap-2 px-6 py-3 bg-gradient-to-r from-amber-600 to-orange-600 text-white rounded-2xl hover:shadow-lg transition-all duration-300">
            <Share2 className="h-5 w-5" />
            Share Digital
          </button>
        </div>
      </div>
    </div>
  );
};

export default MemoryBookGenerator;
