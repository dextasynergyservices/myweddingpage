import React, { useState } from "react";
import { motion } from "framer-motion";
import {
  Users,
  CheckCircle,
  XCircle,
  Clock,
  Edit,
  Mail,
  Trash2,
  Search,
  UserPlus,
} from "lucide-react";
import { useTheme } from "@/contexts/ThemeContext";

interface Guest {
  id: string;
  name: string;
  email: string;
  phone?: string;
  rsvpStatus: "pending" | "attending" | "declined";
  mealPreference?: string;
  tableAssignment?: number;
  plusOne?: boolean;
  dietaryRestrictions?: string;
  invitedBy: "bride" | "groom" | "both";
  category: "family" | "friends" | "colleagues" | "other";
}

const GuestManagement = () => {
  const { isDarkMode } = useTheme();

  const [guests] = useState<Guest[]>([
    {
      id: "1",
      name: "Sarah Johnson",
      email: "sarah@example.com",
      phone: "+1-555-0123",
      rsvpStatus: "attending",
      mealPreference: "vegetarian",
      tableAssignment: 1,
      plusOne: true,
      invitedBy: "bride",
      category: "family",
    },
    {
      id: "2",
      name: "Michael Brown",
      email: "michael@example.com",
      rsvpStatus: "pending",
      plusOne: false,
      invitedBy: "groom",
      category: "friends",
    },
  ]);

  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [, setShowAddGuest] = useState(false);

  const filteredGuests = guests.filter((guest) => {
    const matchesSearch =
      guest.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      guest.email.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesStatus = statusFilter === "all" || guest.rsvpStatus === statusFilter;
    return matchesSearch && matchesStatus;
  });

  const getStatusColor = (status: string) => {
    switch (status) {
      case "attending":
        return "bg-emerald-100 text-emerald-800 dark:bg-emerald-900/30 dark:text-emerald-400";
      case "declined":
        return "bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400";
      case "pending":
        return "bg-amber-100 text-amber-800 dark:bg-amber-900/30 dark:text-amber-400";
      default:
        return "bg-slate-100 text-slate-800 dark:bg-slate-900/30 dark:text-slate-400";
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "attending":
        return <CheckCircle className="h-4 w-4" />;
      case "declined":
        return <XCircle className="h-4 w-4" />;
      case "pending":
      default:
        return <Clock className="h-4 w-4" />;
    }
  };

  return (
    <div className="space-y-8">
      {/* Responsive Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 sm:gap-6">
        <div>
          <h1
            className={`text-2xl sm:text-3xl font-light mb-1 sm:mb-2 ${isDarkMode ? "text-white" : "text-slate-900"}`}
          >
            Guest Management
          </h1>
          <p className={`text-sm sm:text-base ${isDarkMode ? "text-slate-400" : "text-slate-600"}`}>
            Manage your wedding guest list, RSVPs, and seating arrangements
          </p>
        </div>
        <button
          onClick={() => setShowAddGuest(true)}
          className="w-full sm:w-auto flex items-center justify-center gap-2 px-4 py-2 sm:px-6 sm:py-3 bg-gradient-to-r from-indigo-600 to-purple-600 text-white rounded-xl sm:rounded-2xl hover:shadow-lg transition-all duration-300"
        >
          <UserPlus className="h-4 sm:h-5 w-4 sm:w-5" />
          <span>Add Guest</span>
        </button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        {[
          {
            title: "Total Invited",
            value: guests.length,
            icon: Users,
            color: "from-blue-500 to-indigo-600",
          },
          {
            title: "Attending",
            value: guests.filter((g) => g.rsvpStatus === "attending").length,
            icon: CheckCircle,
            color: "from-emerald-500 to-teal-600",
          },
          {
            title: "Pending",
            value: guests.filter((g) => g.rsvpStatus === "pending").length,
            icon: Clock,
            color: "from-amber-500 to-orange-600",
          },
          {
            title: "Declined",
            value: guests.filter((g) => g.rsvpStatus === "declined").length,
            icon: XCircle,
            color: "from-red-500 to-pink-600",
          },
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
                  className={`text-sm font-medium ${isDarkMode ? "text-slate-400" : "text-slate-500"}`}
                >
                  {stat.title}
                </p>
                <p
                  className={`text-3xl font-light mt-1 ${isDarkMode ? "text-white" : "text-slate-900"}`}
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

      {/* Filter */}
      <div
        className={`rounded-3xl p-6 shadow-lg border ${isDarkMode ? "bg-slate-800 border-slate-700" : "bg-white border-slate-100"}`}
      >
        <div className="flex flex-col md:flex-row gap-4 items-center justify-between">
          <div className="flex-1 relative">
            <Search
              className={`absolute left-4 top-1/2 transform -translate-y-1/2 h-5 w-5 ${isDarkMode ? "text-slate-400" : "text-slate-500"}`}
            />
            <input
              type="text"
              placeholder="Search guests..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className={`w-full pl-12 pr-4 py-3 rounded-2xl border transition-colors ${
                isDarkMode
                  ? "bg-slate-700 border-slate-600 text-white placeholder-slate-400 focus:border-indigo-500"
                  : "bg-white border-slate-300 text-slate-900 placeholder-slate-500 focus:border-indigo-500"
              } focus:outline-none focus:ring-2 focus:ring-indigo-500/20`}
            />
          </div>

          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className={`px-4 py-3 rounded-2xl border transition-colors ${
              isDarkMode
                ? "bg-slate-700 border-slate-600 text-white"
                : "bg-white border-slate-300 text-slate-900"
            } focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500`}
          >
            <option value="all">All Status</option>
            <option value="attending">Attending</option>
            <option value="pending">Pending</option>
            <option value="declined">Declined</option>
          </select>
        </div>
      </div>

      {/* Guest Table */}
      <div
        className={`rounded-3xl shadow-lg border overflow-hidden ${isDarkMode ? "bg-slate-800 border-slate-700" : "bg-white border-slate-100"}`}
      >
        {/* Desktop Table */}
        <div className="hidden md:block overflow-x-auto">
          <table className="w-full">
            <thead className={isDarkMode ? "bg-slate-700" : "bg-slate-50"}>
              <tr>
                {["Guest", "RSVP Status", "Table", "Meal", "Actions"].map((title) => (
                  <th
                    key={title}
                    className={`px-6 py-4 text-${title === "Actions" ? "right" : "left"} text-sm font-medium ${
                      isDarkMode ? "text-slate-300" : "text-slate-700"
                    }`}
                  >
                    {title}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-200 dark:divide-slate-700">
              {filteredGuests.map((guest) => (
                <motion.tr
                  key={guest.id}
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  className="hover:bg-slate-50 dark:hover:bg-slate-700/50 transition-colors"
                >
                  <td className="px-6 py-4">
                    <p className={`font-medium ${isDarkMode ? "text-white" : "text-slate-900"}`}>
                      {guest.name}
                    </p>
                    <p className={`text-sm ${isDarkMode ? "text-slate-400" : "text-slate-600"}`}>
                      {guest.email}
                    </p>
                  </td>
                  <td className="px-6 py-4">
                    <span
                      className={`inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-medium ${getStatusColor(guest.rsvpStatus)}`}
                    >
                      {getStatusIcon(guest.rsvpStatus)}
                      {guest.rsvpStatus.charAt(0).toUpperCase() + guest.rsvpStatus.slice(1)}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-sm">
                    <span className={isDarkMode ? "text-slate-300" : "text-slate-700"}>
                      {guest.tableAssignment ? `Table ${guest.tableAssignment}` : "Not assigned"}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-sm">
                    <span className={isDarkMode ? "text-slate-300" : "text-slate-700"}>
                      {guest.mealPreference || "Not selected"}
                    </span>
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex items-center justify-end gap-2">
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
                        <Mail className="h-4 w-4" />
                      </button>
                      <button className="p-2 rounded-lg text-red-600 hover:bg-red-100 dark:hover:bg-red-900/30 transition-colors">
                        <Trash2 className="h-4 w-4" />
                      </button>
                    </div>
                  </td>
                </motion.tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Mobile table*/}
        <div className="md:hidden">
          {filteredGuests.map((guest) => (
            <motion.div
              key={guest.id}
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className={`p-4 border-b ${isDarkMode ? "border-slate-700 hover:bg-slate-700/50" : "border-slate-200 hover:bg-slate-50"} transition-colors`}
            >
              <div className="flex justify-between items-start gap-4">
                <div className="flex-1">
                  <div className="flex items-center gap-3 mb-2">
                    <p className={`font-medium ${isDarkMode ? "text-white" : "text-slate-900"}`}>
                      {guest.name}
                    </p>
                    <span
                      className={`inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(guest.rsvpStatus)}`}
                    >
                      {getStatusIcon(guest.rsvpStatus)}
                    </span>
                  </div>
                  <p className={`text-sm ${isDarkMode ? "text-slate-400" : "text-slate-600"} mb-3`}>
                    {guest.email}
                  </p>

                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <p className={`text-xs ${isDarkMode ? "text-slate-400" : "text-slate-500"}`}>
                        Table
                      </p>
                      <p className={isDarkMode ? "text-slate-300" : "text-slate-700"}>
                        {guest.tableAssignment || "Not assigned"}
                      </p>
                    </div>
                    <div>
                      <p className={`text-xs ${isDarkMode ? "text-slate-400" : "text-slate-500"}`}>
                        Meal
                      </p>
                      <p className={isDarkMode ? "text-slate-300" : "text-slate-700"}>
                        {guest.mealPreference || "Not selected"}
                      </p>
                    </div>
                  </div>
                </div>

                <div className="flex flex-col items-end gap-2">
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
                    <Mail className="h-4 w-4" />
                  </button>
                  <button className="p-2 rounded-lg text-red-600 hover:bg-red-100 dark:hover:bg-red-900/30 transition-colors">
                    <Trash2 className="h-4 w-4" />
                  </button>
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default GuestManagement;
