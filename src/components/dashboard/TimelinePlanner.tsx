"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import {
  Calendar,
  Clock,
  Plus,
  Edit,
  Trash2,
  Users,
  MapPin,
  CheckCircle,
  Camera,
  Utensils,
  Heart,
} from "lucide-react";
import { useTheme } from "@/contexts/ThemeContext";

interface TimelineEvent {
  id: string;
  time: string;
  title: string;
  description: string;
  duration: number;
  category: "ceremony" | "reception" | "photos" | "vendor" | "personal";
  vendor?: string;
  location?: string;
  notes?: string;
  completed: boolean;
}

const TimelinePlanner = () => {
  const { isDarkMode } = useTheme();
  const [selectedDate, setSelectedDate] = useState("2024-06-15");
  const [events, setEvents] = useState<TimelineEvent[]>([
    {
      id: "1",
      time: "09:00",
      title: "Hair & Makeup",
      description: "Bridal party getting ready",
      duration: 180,
      category: "personal",
      vendor: "Beauty Studio",
      location: "Bridal Suite",
      completed: false,
    },
    {
      id: "2",
      time: "12:00",
      title: "Photography Session",
      description: "Bridal portraits and getting ready shots",
      duration: 120,
      category: "photos",
      vendor: "John Photography",
      location: "Hotel Room",
      completed: false,
    },
    {
      id: "3",
      time: "15:00",
      title: "Ceremony",
      description: "Wedding ceremony",
      duration: 60,
      category: "ceremony",
      location: "Garden Valley Estate",
      completed: false,
    },
    {
      id: "4",
      time: "16:30",
      title: "Cocktail Hour",
      description: "Guests enjoy cocktails and appetizers",
      duration: 90,
      category: "reception",
      location: "Garden Terrace",
      completed: false,
    },
    {
      id: "5",
      time: "18:00",
      title: "Reception Dinner",
      description: "Wedding dinner and speeches",
      duration: 120,
      category: "reception",
      vendor: "Catering Co.",
      location: "Main Hall",
      completed: false,
    },
  ]);

  const [showAddEvent, setShowAddEvent] = useState(false);

  const getCategoryColor = (category: string) => {
    switch (category) {
      case "ceremony":
        return "from-purple-500 to-indigo-600";
      case "reception":
        return "from-emerald-500 to-teal-600";
      case "photos":
        return "from-pink-500 to-rose-600";
      case "vendor":
        return "from-amber-500 to-orange-600";
      case "personal":
        return "from-blue-500 to-cyan-600";
      default:
        return "from-slate-500 to-slate-600";
    }
  };

  const getCategoryIcon = (category: string) => {
    switch (category) {
      case "ceremony":
        return Heart;
      case "reception":
        return Utensils;
      case "photos":
        return Camera;
      case "vendor":
        return Users;
      case "personal":
        return Clock;
      default:
        return Calendar;
    }
  };

  const toggleEventCompletion = (id: string) => {
    setEvents(
      events.map((event) => (event.id === id ? { ...event, completed: !event.completed } : event))
    );
  };

  const sortedEvents = events.sort((a, b) => a.time.localeCompare(b.time));

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 sm:gap-6">

        <div>
          <h1
            className={`text-3xl font-light mb-2 ${isDarkMode ? "text-white" : "text-slate-900"}`}
          >
            Wedding Timeline
          </h1>
          <p className={`${isDarkMode ? "text-slate-400" : "text-slate-600"}`}>
            Plan your perfect wedding day schedule
          </p>
        </div>
        <button
          onClick={() => setShowAddEvent(true)}
          className="w-full sm:w-auto flex items-center justify-center gap-2 px-4 py-2 sm:px-6 sm:py-3 bg-gradient-to-r from-indigo-600 to-purple-600 text-white rounded-xl sm:rounded-2xl hover:shadow-lg transition-all duration-300"

        >
          <Plus className="h-5 w-5" />
          Add Event
        </button>

        {showAddEvent && (
          <div
            className={`rounded-2xl border p-6 mt-4 ${
              isDarkMode ? "bg-slate-700 border-slate-600" : "bg-white border-slate-200"
            }`}
          >
            <h3
              className={`text-lg font-semibold mb-4 ${isDarkMode ? "text-white" : "text-slate-900"}`}
            >
              Add New Event
            </h3>
            <form
              onSubmit={(e) => {
                e.preventDefault();
                // Add form logic here
                setShowAddEvent(false); // hide form after submission
              }}
              className="space-y-4"
            >
              <input
                type="text"
                placeholder="Event Title"
                className="w-full px-4 py-2 rounded-xl border focus:outline-none"
              />
              <input
                type="time"
                placeholder="Time"
                className="w-full px-4 py-2 rounded-xl border focus:outline-none"
              />
              {/* Add more fields as needed */}
              <div className="flex gap-2">
                <button
                  type="submit"
                  className="px-4 py-2 bg-indigo-600 text-white rounded-xl hover:bg-indigo-700"
                >
                  Save
                </button>
                <button
                  type="button"
                  onClick={() => setShowAddEvent(false)}
                  className="px-4 py-2 bg-slate-300 text-slate-800 rounded-xl hover:bg-slate-400"
                >
                  Cancel
                </button>
              </div>
            </form>
          </div>
        )}
      </div>

      {/* Date Selector */}
      <div
        className={`rounded-3xl p-6 shadow-lg border ${isDarkMode ? "bg-slate-800 border-slate-700" : "bg-white border-slate-100"}`}
      >
        <div className="flex items-center justify-between">
          <div>
            <h2
              className={`text-xl font-semibold mb-2 ${isDarkMode ? "text-white" : "text-slate-900"}`}
            >
              Wedding Day Schedule
            </h2>
            <p className={`${isDarkMode ? "text-slate-400" : "text-slate-600"}`}>
              {new Date(selectedDate).toLocaleDateString("en-US", {
                weekday: "long",
                year: "numeric",
                month: "long",
                day: "numeric",
              })}
            </p>
          </div>
          <input
            type="date"
            value={selectedDate}
            onChange={(e) => setSelectedDate(e.target.value)}
            className={`px-4 py-2 rounded-xl border transition-colors ${
              isDarkMode
                ? "bg-slate-700 border-slate-600 text-white"
                : "bg-white border-slate-300 text-slate-900"
            } focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500`}
          />
        </div>
      </div>

      {/* Timeline */}
      <div
        className={`rounded-xl sm:rounded-3xl p-4 sm:p-6 md:p-8 shadow-lg border ${
          isDarkMode ? "bg-slate-800 border-slate-700" : "bg-white border-slate-100"
        }`}
      >
        <div className="space-y-4 sm:space-y-6">

          {sortedEvents.map((event, index) => {
            const CategoryIcon = getCategoryIcon(event.category);

            return (
              <motion.div
                key={event.id}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: index * 0.1 }}
                className={`relative flex flex-col sm:flex-row gap-4 sm:gap-6 p-4 sm:p-6 rounded-xl sm:rounded-2xl border transition-all duration-300 ${

                  event.completed
                    ? isDarkMode
                      ? "bg-slate-700/50 border-slate-600"
                      : "bg-slate-50 border-slate-200"
                    : isDarkMode
                      ? "bg-slate-700 border-slate-600 hover:border-slate-500"
                      : "bg-white border-slate-200 hover:border-slate-300"
                }`}
              >
                {/* Time */}
                <div className="flex sm:flex-col items-center sm:items-start gap-3 sm:gap-0 flex-shrink-0">
                  <div
                    className={`text-xl sm:text-2xl font-light ${isDarkMode ? "text-white" : "text-slate-900"}`}
                  >
                    {event.time}
                  </div>
                  <div
                    className={`text-xs sm:text-sm ${isDarkMode ? "text-slate-400" : "text-slate-600"}`}
                  >

                    {event.duration}min
                  </div>
                </div>

                {/* Event Details */}
                <div className="flex-1 min-w-0">
                  <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-3 sm:gap-4 mb-3">
                    <div className="flex items-start gap-3">
                      <div
                        className={`p-2 bg-gradient-to-r ${getCategoryColor(event.category)} rounded-lg sm:rounded-xl`}
                      >
                        <CategoryIcon className="h-4 sm:h-5 w-4 sm:w-5 text-white" />
                      </div>
                      <div>
                        <h3
                          className={`text-base sm:text-lg font-semibold ${event.completed ? "line-through opacity-60" : ""} ${
                            isDarkMode ? "text-white" : "text-slate-900"
                          }`}
                        >
                          {event.title}
                        </h3>
                        {event.description && (
                          <p
                            className={`text-xs sm:text-sm ${isDarkMode ? "text-slate-400" : "text-slate-600"} mt-1`}
                          >
                            {event.description}
                          </p>
                        )}
                      </div>
                    </div>

                    <div className="flex items-center justify-end sm:justify-start gap-1 sm:gap-2">
                      <button
                        onClick={() => toggleEventCompletion(event.id)}
                        className={`p-1 sm:p-2 rounded-md sm:rounded-lg transition-colors ${

                          event.completed
                            ? "bg-emerald-600 text-white"
                            : isDarkMode
                              ? "text-slate-400 hover:bg-slate-600 hover:text-white"
                              : "text-slate-600 hover:bg-slate-100 hover:text-slate-900"
                        }`}
                      >
                        <CheckCircle className="h-4 w-4" />
                      </button>
                      <button
                        className={`p-1 sm:p-2 rounded-md sm:rounded-lg transition-colors ${

                          isDarkMode
                            ? "text-slate-400 hover:bg-slate-600 hover:text-white"
                            : "text-slate-600 hover:bg-slate-100 hover:text-slate-900"
                        }`}
                      >
                        <Edit className="h-4 w-4" />
                      </button>
                      <button className="p-1 sm:p-2 rounded-md sm:rounded-lg text-red-600 hover:bg-red-100 dark:hover:bg-red-900/30 transition-colors">

                        <Trash2 className="h-4 w-4" />
                      </button>
                    </div>
                  </div>

                  {/* Event Meta */}
                  {(event.location || event.vendor) && (
                    <div className="flex flex-wrap gap-2 sm:gap-3 text-xs sm:text-sm">
                      {event.location && (
                        <div
                          className={`flex items-center gap-1 sm:gap-2 ${
                            isDarkMode ? "text-slate-400" : "text-slate-600"
                          }`}
                        >
                          <MapPin className="h-3 sm:h-4 w-3 sm:w-4 flex-shrink-0" />
                          <span className="truncate">{event.location}</span>
                        </div>
                      )}
                      {event.vendor && (
                        <div
                          className={`flex items-center gap-1 sm:gap-2 ${
                            isDarkMode ? "text-slate-400" : "text-slate-600"
                          }`}
                        >
                          <Users className="h-3 sm:h-4 w-3 sm:w-4 flex-shrink-0" />
                          <span className="truncate">{event.vendor}</span>
                        </div>
                      )}
                    </div>
                  )}

                </div>
              </motion.div>
            );
          })}
        </div>
      </div>

      {/* Progress Summary */}
      <div
        className={`rounded-3xl p-6 shadow-lg border ${isDarkMode ? "bg-slate-800 border-slate-700" : "bg-white border-slate-100"}`}
      >
        <h2
          className={`text-xl font-semibold mb-4 ${isDarkMode ? "text-white" : "text-slate-900"}`}
        >
          Timeline Progress
        </h2>
        <div className="flex items-center gap-4">
          <div className="flex-1">
            <div
              className={`w-full h-3 rounded-full ${isDarkMode ? "bg-slate-700" : "bg-slate-200"}`}
            >
              <div
                className="h-3 bg-gradient-to-r from-emerald-500 to-teal-600 rounded-full transition-all duration-500"
                style={{
                  width: `${(events.filter((e) => e.completed).length / events.length) * 100}%`,
                }}
              />
            </div>
          </div>
          <span className={`text-sm font-medium ${isDarkMode ? "text-white" : "text-slate-900"}`}>
            {events.filter((e) => e.completed).length} of {events.length} completed
          </span>
        </div>
      </div>
    </div>
  );
};

export default TimelinePlanner;
