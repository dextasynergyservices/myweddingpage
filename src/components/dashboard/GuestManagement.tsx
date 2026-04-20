import React, { useState, useEffect } from "react";
import { motion } from "framer-motion";
import {
  Users,
  CheckCircle,
  XCircle,
  Clock,
  Edit,
  Trash2,
  Search,
  UserPlus,
} from "lucide-react";
import { useTheme } from "@/contexts/ThemeContext";
import { useCSRFToken } from "@/hooks/useCSRFToken";
import axios from "axios";
import toast from "react-hot-toast";

interface Guest {
  id: string;
  name: string;
  email: string;
  phone?: string;
  customMessage?: string;
  rsvpStatus: "PENDING" | "ATTENDING" | "DECLINED";
  mealPreference?: string;
  tableAssignment?: number;
  plusOne?: boolean;
  dietaryRestrictions?: string;
  invitedBy: "BRIDE" | "GROOM" | "BOTH";
  category: "FAMILY" | "FRIENDS" | "COLLEAGUES" | "OTHER";
  invitationToken: string;
  invitationCard?: string;
}

interface FormData {
  name: string;
  email: string;
  phone: string;
  customMessage?: string;
  tableAssignment?: number;
  mealPreference?: string;
  plusOne: boolean;
  invitedBy: "BRIDE" | "GROOM" | "BOTH";
  category: "FAMILY" | "FRIENDS" | "COLLEAGUES" | "OTHER";
  invitationCard?: string | File | null;
}

// Simple AlertDialog component since it's not in your UI components
const AlertDialog = ({
  open,
  onOpenChange,
  onConfirm,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onConfirm: () => void;
}) => {
  const { isDarkMode } = useTheme();
  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
      <div
        className={`w-full max-w-md rounded-2xl p-6 ${isDarkMode ? "bg-slate-800" : "bg-white"}`}
      >
        <h2 className="text-xl font-semibold mb-2">Are you sure?</h2>
        <p className="mb-6">
          This action cannot be undone. This will permanently delete the guest.
        </p>
        <div className="flex justify-end gap-3">
          <button
            onClick={() => onOpenChange(false)}
            className="px-4 py-2 rounded-lg bg-gray-200 dark:bg-slate-700 cursor-pointer"
          >
            Cancel
          </button>
          <button
            onClick={onConfirm}
            className="px-4 py-2 rounded-lg bg-red-600 text-white cursor-pointer"
          >
            Delete
          </button>
        </div>
      </div>
    </div>
  );
};

const GuestManagement = () => {
  const { isDarkMode } = useTheme();
  const { token: csrfToken } = useCSRFToken();
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [showAddGuest, setShowAddGuest] = useState(false);
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const [guestToDelete, setGuestToDelete] = useState<string | null>(null);
  const [editingGuest, setEditingGuest] = useState<Guest | null>(null);
  const [isUploading, setIsUploading] = useState(false);
  const [customMessage, setCustomMessage] = useState(
    "You're invited to our wedding! Please RSVP using the link below."
  );
  const [formData, setFormData] = useState<FormData>({
    name: "",
    email: "",
    phone: "",
    tableAssignment: undefined,
    mealPreference: "",
    plusOne: false,
    invitedBy: "BOTH",
    category: "FRIENDS",
  });
  const [guests, setGuests] = useState<Guest[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  // Configure axios with CSRF token
  useEffect(() => {
    if (csrfToken) {
      axios.defaults.withCredentials = true;
      axios.defaults.headers.common["x-csrf-token"] = csrfToken;
    }
  }, [csrfToken]);

  // Fetch guests (simplified without react-query)
  React.useEffect(() => {
    const fetchGuests = async () => {
      try {
        setIsLoading(true);
        const response = await axios.get("/api/guests");
        setGuests(response.data);
      } catch (error) {
        console.error("Failed to fetch guests:", error);
        toast.error("Failed to fetch guests");
      } finally {
        setIsLoading(false);
      }
    };
    fetchGuests();
  }, []);

  const filteredGuests = guests.filter((guest: Guest) => {
    const matchesSearch =
      (guest.name?.toLowerCase() || "").includes(searchQuery.toLowerCase()) ||
      (guest.email?.toLowerCase() || "").includes(searchQuery.toLowerCase());
    const matchesStatus =
      statusFilter === "all" || guest.rsvpStatus === statusFilter;
    return matchesSearch && matchesStatus;
  });

  const getStatusColor = (status: string) => {
    switch (status) {
      case "ATTENDING":
        return "bg-emerald-100 text-emerald-800 dark:bg-emerald-900/30 dark:text-emerald-400";
      case "DECLINED":
        return "bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400";
      case "PENDING":
        return "bg-amber-100 text-amber-800 dark:bg-amber-900/30 dark:text-amber-400";
      default:
        return "bg-slate-100 text-slate-800 dark:bg-slate-900/30 dark:text-slate-400";
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "ATTENDING":
        return <CheckCircle className="h-4 w-4" />;
      case "DECLINED":
        return <XCircle className="h-4 w-4" />;
      case "PENDING":
      default:
        return <Clock className="h-4 w-4" />;
    }
  };

  const handleEditGuest = (guest: Guest) => {
    setEditingGuest(guest);
    setFormData({
      name: guest.name,
      email: guest.email || "",
      phone: guest.phone || "",
      tableAssignment: guest.tableAssignment,
      mealPreference: guest.mealPreference || "",
      plusOne: guest.plusOne || false,
      invitedBy: guest.invitedBy,
      category: guest.category,
    });
    setShowAddGuest(true);
  };

  const handleDeleteClick = (id: string) => {
    setGuestToDelete(id);
    setShowDeleteDialog(true);
  };

  const handleDeleteConfirm = async () => {
    if (!guestToDelete) return;

    try {
      setIsLoading(true);
      const response = await axios.delete(`/api/guest/${guestToDelete}`);

      if (response.status === 204) {
        // Match your API's 204 No Content response
        setGuests(guests.filter((guest) => guest.id !== guestToDelete));
        toast.success("Guest deleted successfully");
      }
    } catch (error) {
      if (axios.isAxiosError(error)) {
        console.error("Delete error details:", error.response?.data);
        toast.error(error.response?.data?.error || "Failed to delete guest");
      } else {
        console.error("Unexpected error:", error);
        toast.error("Failed to delete guest");
      }
    } finally {
      setIsLoading(false);
      setShowDeleteDialog(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    // Check for duplicates
    const duplicate = guests.some(
      (g) => g.email === formData.email || g.phone === formData.phone
    );

    if (duplicate) {
      toast.error("Guest with this email or phone already exists");
      return;
    }

    // Check for duplicate table assignment if provided
    if (formData.tableAssignment) {
      const tableTaken = guests.some(
        (g) =>
          g.tableAssignment === formData.tableAssignment &&
          (!editingGuest || g.id !== editingGuest.id)
      );

      if (tableTaken) {
        toast.error("This table/seat number is already assigned");
        return;
      }
    }

    try {
      setIsLoading(true);
      let imageUrl = editingGuest?.invitationCard;

      // Handle image upload if a new file was provided
      if (formData.invitationCard instanceof File) {
        try {
          setIsUploading(true);

          const uploadFormData = new FormData();
          uploadFormData.append("file", formData.invitationCard);

          const response = await fetch("/api/upload-image", {
            method: "POST",
            credentials: "include",
            headers: {
              "x-csrf-token": csrfToken || "",
            },
            body: uploadFormData,
          });

          if (!response.ok) {
            const errorData = await response.json();
            throw new Error(errorData.error || "Image upload failed");
          }

          const { url } = await response.json();
          imageUrl = url;
        } catch (uploadError) {
          console.error("Image upload error:", uploadError);
          toast.error("Image upload failed - saving guest without image");
        } finally {
          setIsUploading(false);
        }
      }

      const guestData = {
        name: formData.name,
        email: formData.email,
        phone: formData.phone,
        customMessage: formData.customMessage,
        tableAssignment: formData.tableAssignment,
        mealPreference: formData.mealPreference,
        plusOne: formData.plusOne,
        invitedBy: formData.invitedBy,
        category: formData.category,
        invitationCard: imageUrl,
      };

      let updatedGuests;
      if (editingGuest) {
        const response = await axios.put(
          `/api/guests/${editingGuest.id}`,
          guestData
        );
        updatedGuests = guests.map((g) =>
          g.id === editingGuest.id ? response.data : g
        );
        toast.success("Guest updated successfully");
      } else {
        const response = await axios.post("/api/guests", guestData);
        updatedGuests = [...guests, response.data];
        toast.success("Guest invited successfully");
        setTimeout(() => window.location.reload(), 1000);
      }

      setGuests(updatedGuests);
      setShowAddGuest(false);
    } catch (error) {
      console.error("Save error:", error);
      toast.error("Failed to save guest");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="space-y-8">
      {/* Header and Add Guest Button */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 sm:gap-6">
        <div>
          <h1
            className={`text-2xl sm:text-3xl font-light mb-1 sm:mb-2 ${isDarkMode ? "text-white" : "text-slate-900"}`}
          >
            Guest Management
          </h1>
          <p
            className={`text-sm sm:text-base ${isDarkMode ? "text-slate-400" : "text-slate-600"}`}
          >
            Manage your wedding guest list, RSVPs, and seating arrangements
          </p>
        </div>
        <button
          onClick={() => {
            setEditingGuest(null);
            setFormData({
              name: "",
              email: "",
              phone: "",
              tableAssignment: undefined,
              mealPreference: "",
              plusOne: false,
              invitedBy: "BOTH",
              category: "FRIENDS",
            });
            setShowAddGuest(true);
          }}
          className="w-full sm:w-auto flex items-center justify-center gap-2 px-4 py-2 sm:px-6 sm:py-3 bg-gradient-to-r from-indigo-600 to-purple-600 hover:opacity-90 cursor-pointer text-white rounded-xl sm:rounded-2xl hover:shadow-lg transition-all duration-300"
        >
          <UserPlus className="h-4 sm:h-5 w-4 sm:w-5" />
          <span>Add Guest</span>
        </button>
      </div>

      {/* Add/Edit Guest Modal */}
      {showAddGuest && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 overflow-y-auto py-8">
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.95 }}
            className={`w-full max-w-xl p-6 rounded-3xl shadow-lg max-h-[90vh] overflow-y-auto ${isDarkMode ? "bg-slate-800 text-white" : "bg-white text-slate-900"}`}
          >
            <div className="flex justify-between items-center mb-4 sticky top-0 bg-inherit py-2 z-10">
              <h2 className="text-xl font-semibold">
                {editingGuest ? "Edit Guest" : "Add New Guest"}
              </h2>
              <button onClick={() => setShowAddGuest(false)}>
                <XCircle className="h-6 w-6" />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4 pb-4">
              <div>
                <label className="block text-sm mb-1">Name*</label>
                <input
                  required
                  type="text"
                  name="name"
                  value={formData.name}
                  onChange={(e) =>
                    setFormData({ ...formData, name: e.target.value })
                  }
                  className="w-full border rounded-xl px-4 py-2 bg-transparent"
                />
              </div>

              <div>
                <label className="block text-sm mb-1">Email*</label>
                <input
                  required
                  type="email"
                  name="email"
                  value={formData.email}
                  onChange={(e) =>
                    setFormData({ ...formData, email: e.target.value })
                  }
                  className="w-full border rounded-xl px-4 py-2 bg-transparent"
                />
              </div>

              <div>
                <label className="block text-sm mb-1">Phone (WhatsApp)*</label>
                <input
                  required
                  type="tel"
                  name="phone"
                  value={formData.phone}
                  onChange={(e) =>
                    setFormData({ ...formData, phone: e.target.value })
                  }
                  className="w-full border rounded-xl px-4 py-2 bg-transparent"
                />
              </div>

              <div>
                <label className="block text-sm mb-1">
                  Custom Invitation Message
                </label>
                <textarea
                  value={customMessage}
                  onChange={(e) => setCustomMessage(e.target.value)}
                  rows={4}
                  className="w-full border rounded-xl px-4 py-2 bg-transparent"
                />
              </div>

              <div>
                <label className="block text-sm mb-1">Table Assignment</label>
                <input
                  type="number"
                  name="tableAssignment"
                  value={formData.tableAssignment || ""}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      tableAssignment: e.target.value
                        ? parseInt(e.target.value)
                        : undefined,
                    })
                  }
                  className="w-full border rounded-xl px-4 py-2 bg-transparent"
                />
              </div>

              <div>
                <label className="block text-sm mb-1">
                  Invitation Card (Optional)
                </label>
                <input
                  type="file"
                  accept="image/jpeg, image/png, image/gif, image/webp"
                  onChange={(e) => {
                    const file = e.target.files?.[0];
                    if (file) {
                      // Client-side validation
                      if (file.size > 5 * 1024 * 1024) {
                        toast.error("Image must be smaller than 5MB");
                        e.target.value = ""; // Clear the input
                        return;
                      }
                      if (
                        ![
                          "image/jpeg",
                          "image/png",
                          "image/gif",
                          "image/webp",
                        ].includes(file.type)
                      ) {
                        toast.error(
                          "Only JPEG, PNG, GIF, and WebP images are allowed"
                        );
                        e.target.value = ""; // Clear the input
                        return;
                      }
                      setFormData({
                        ...formData,
                        invitationCard: file,
                      });
                    }
                  }}
                  className="w-full border rounded-xl px-4 py-2 bg-transparent"
                  disabled={isUploading}
                />
                {isUploading && (
                  <div className="mt-2 text-sm text-blue-600 flex items-center gap-2">
                    <svg className="animate-spin h-4 w-4" viewBox="0 0 24 24">
                      <circle
                        className="opacity-25"
                        cx="12"
                        cy="12"
                        r="10"
                        stroke="currentColor"
                        strokeWidth="4"
                      ></circle>
                      <path
                        className="opacity-75"
                        fill="currentColor"
                        d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                      ></path>
                    </svg>
                    Uploading image...
                  </div>
                )}
              </div>

              <div className="flex items-center gap-2">
                <input
                  type="checkbox"
                  id="plusOne"
                  checked={formData.plusOne}
                  onChange={(e) =>
                    setFormData({ ...formData, plusOne: e.target.checked })
                  }
                  className="h-4 w-4 rounded"
                />
                <label htmlFor="plusOne" className="text-sm">
                  Plus One
                </label>
              </div>

              <div className="flex justify-end gap-2 pt-4">
                <button
                  type="submit"
                  className="px-4 py-2 rounded-xl bg-gradient-to-r from-indigo-600 to-purple-600 text-white"
                  disabled={isLoading || isUploading}
                >
                  {isUploading
                    ? "Uploading image..."
                    : isLoading
                      ? "Processing..."
                      : editingGuest
                        ? "Update"
                        : "Invite"}
                </button>
              </div>
            </form>
          </motion.div>
        </div>
      )}

      {/* Delete Confirmation Dialog */}
      <AlertDialog
        open={showDeleteDialog}
        onOpenChange={setShowDeleteDialog}
        onConfirm={handleDeleteConfirm}
      />

      {/* Stats Cards */}
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
            value: guests.filter((g: Guest) => g.rsvpStatus === "ATTENDING")
              .length,
            icon: CheckCircle,
            color: "from-emerald-500 to-teal-600",
          },
          {
            title: "Pending",
            value: guests.filter((g: Guest) => g.rsvpStatus === "PENDING")
              .length,
            icon: Clock,
            color: "from-amber-500 to-orange-600",
          },
          {
            title: "Declined",
            value: guests.filter((g: Guest) => g.rsvpStatus === "DECLINED")
              .length,
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
              isDarkMode
                ? "bg-slate-800 border-slate-700"
                : "bg-white border-slate-100"
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

      {/* Search and Filter */}
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
            <option value="ATTENDING">Attending</option>
            <option value="PENDING">Pending</option>
            <option value="DECLINED">Declined</option>
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
                {["Guest", "RSVP Status", "Table", "Meal", "Actions"].map(
                  (title) => (
                    <th
                      key={title}
                      className={`px-6 py-4 text-${title === "Actions" ? "right" : "left"} text-sm font-medium ${
                        isDarkMode ? "text-slate-300" : "text-slate-700"
                      }`}
                    >
                      {title}
                    </th>
                  )
                )}
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-200 dark:divide-slate-700">
              {filteredGuests.map((guest: Guest) => (
                <motion.tr
                  key={`desktop-${guest.id}`}
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                >
                  <td className="px-6 py-4">
                    <p
                      className={`font-medium ${isDarkMode ? "text-white" : "text-slate-900"}`}
                    >
                      {guest.name}
                    </p>
                    <p
                      className={`text-sm ${isDarkMode ? "text-slate-400" : "text-slate-600"}`}
                    >
                      {guest.email}
                    </p>
                  </td>
                  <td className="px-6 py-4">
                    <span
                      className={`inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-medium ${getStatusColor(guest.rsvpStatus)}`}
                    >
                      {getStatusIcon(guest.rsvpStatus)}
                      {guest.rsvpStatus
                        ? guest.rsvpStatus.charAt(0) +
                          guest.rsvpStatus.slice(1).toLowerCase()
                        : "Pending"}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-sm">
                    <span
                      className={
                        isDarkMode ? "text-slate-300" : "text-slate-700"
                      }
                    >
                      {guest.tableAssignment
                        ? `Table ${guest.tableAssignment}`
                        : "Not assigned"}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-sm">
                    <span
                      className={
                        isDarkMode ? "text-slate-300" : "text-slate-700"
                      }
                    >
                      {guest.mealPreference || "Not selected"}
                    </span>
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex items-center justify-end gap-2">
                      <button
                        onClick={() => handleEditGuest(guest)}
                        disabled={guest.rsvpStatus === "DECLINED"}
                        className={`p-2 rounded-lg transition-colors ${
                          guest.rsvpStatus === "DECLINED"
                            ? "text-slate-400 cursor-not-allowed"
                            : isDarkMode
                              ? "text-slate-400 hover:bg-slate-700 hover:text-white"
                              : "text-slate-600 hover:bg-slate-100 hover:text-slate-900"
                        }`}
                      >
                        <Edit className="h-4 w-4" />
                      </button>
                      <button
                        onClick={() => handleDeleteClick(guest.id)}
                        className="p-2 rounded-lg text-red-600 hover:bg-red-100 dark:hover:bg-red-900/30 transition-colors"
                      >
                        <Trash2 className="h-4 w-4" />
                      </button>
                    </div>
                  </td>
                </motion.tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Mobile table */}
        <div className="md:hidden">
          {filteredGuests.map((guest: Guest) => (
            <motion.div
              key={`mobile-${guest.id}`}
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className={`p-4 border-b ${isDarkMode ? "border-slate-700" : "border-slate-200"}`}
            >
              <div className="flex justify-between items-start gap-4">
                <div className="flex-1">
                  <div className="flex items-center gap-3 mb-2">
                    <p
                      className={`font-medium ${isDarkMode ? "text-white" : "text-slate-900"}`}
                    >
                      {guest.name}
                    </p>
                    <span
                      className={`inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(guest.rsvpStatus)}`}
                    >
                      {getStatusIcon(guest.rsvpStatus)}
                      {guest.rsvpStatus
                        ? guest.rsvpStatus.charAt(0) +
                          guest.rsvpStatus.slice(1).toLowerCase()
                        : "Pending"}
                    </span>
                  </div>
                  <p
                    className={`text-sm ${isDarkMode ? "text-slate-400" : "text-slate-600"} mb-3`}
                  >
                    {guest.email}
                  </p>

                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <p
                        className={`text-xs ${isDarkMode ? "text-slate-400" : "text-slate-500"}`}
                      >
                        Table
                      </p>
                      <p
                        className={
                          isDarkMode ? "text-slate-300" : "text-slate-700"
                        }
                      >
                        {guest.tableAssignment || "Not assigned"}
                      </p>
                    </div>
                    <div>
                      <p
                        className={`text-xs ${isDarkMode ? "text-slate-400" : "text-slate-500"}`}
                      >
                        Meal
                      </p>
                      <p
                        className={
                          isDarkMode ? "text-slate-300" : "text-slate-700"
                        }
                      >
                        {guest.mealPreference || "Not selected"}
                      </p>
                    </div>
                  </div>
                </div>

                <div className="flex flex-col items-end gap-2">
                  <button
                    onClick={() => handleEditGuest(guest)}
                    disabled={guest.rsvpStatus === "DECLINED"}
                    className={`p-2 rounded-lg transition-colors ${
                      guest.rsvpStatus === "DECLINED"
                        ? "text-slate-400 cursor-not-allowed"
                        : isDarkMode
                          ? "text-slate-400 hover:bg-slate-700 hover:text-white"
                          : "text-slate-600 hover:bg-slate-100 hover:text-slate-900"
                    }`}
                  >
                    <Edit className="h-4 w-4" />
                  </button>
                  <button
                    onClick={() => handleDeleteClick(guest.id)}
                    className="p-2 rounded-lg text-red-600 hover:bg-red-100 dark:hover:bg-red-900/30 transition-colors"
                  >
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
