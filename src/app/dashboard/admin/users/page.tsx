"use client";

import { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import toast from "react-hot-toast";
import {
  Users,
  Search,
  UserCog,
  Trash2,
  Shield,
  ShieldCheck,
  Eye,
  X,
  Check,
  AlertCircle,
  ChevronLeft,
  ChevronRight,
} from "lucide-react";
import { useTheme } from "@/contexts/ThemeContext";
import { PageSkeleton } from "@/components/admin/LoadingSkeleton";

interface User {
  id: string;
  name: string | null;
  email: string;
  role: "USER" | "ADMIN";
  twoFactorEnabled: boolean;
  emailVerified: Date | null;
  createdAt: string;
  lastLoginAt: string | null;
  accountLockedUntil: Date | null;
  failedLoginAttempts: number;
}

export default function UserManagementPage() {
  const { isDarkMode } = useTheme();
  const [users, setUsers] = useState<User[]>([]);
  const [filteredUsers, setFilteredUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedUser, setSelectedUser] = useState<User | null>(null);
  const [showModal, setShowModal] = useState(false);
  const [actionLoading, setActionLoading] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const usersPerPage = 10;

  useEffect(() => {
    fetchUsers();
  }, []);

  useEffect(() => {
    filterUsers();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [users, searchQuery]);

  const fetchUsers = async () => {
    try {
      const response = await fetch("/api/admin/users");
      if (response.ok) {
        const data = await response.json();
        setUsers(data.users || []);
      }
    } catch (error) {
      console.error("Error fetching users:", error);
    } finally {
      setLoading(false);
    }
  };

  const filterUsers = () => {
    if (!searchQuery) {
      setFilteredUsers(users);
    } else {
      const query = searchQuery.toLowerCase();
      const filtered = users.filter(
        (user) =>
          user.email.toLowerCase().includes(query) ||
          user.name?.toLowerCase().includes(query) ||
          user.role.toLowerCase().includes(query)
      );
      setFilteredUsers(filtered);
    }
    setCurrentPage(1); // Reset to first page when filtering
  };

  const handleToggleRole = async (userId: string, currentRole: string) => {
    if (!confirm(`Are you sure you want to change this user's role?`)) return;

    setActionLoading(true);
    try {
      const response = await fetch(`/api/admin/users/${userId}/role`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          role: currentRole === "ADMIN" ? "USER" : "ADMIN",
        }),
      });

      if (response.ok) {
        await fetchUsers();
        toast.success("User role updated successfully");
      } else {
        toast.error("Failed to update user role");
      }
    } catch (error) {
      console.error("Error updating role:", error);
      toast.error("Failed to update user role");
    } finally {
      setActionLoading(false);
    }
  };

  const handleReset2FA = async (userId: string) => {
    if (!confirm("Are you sure you want to reset this user's 2FA?")) return;

    setActionLoading(true);
    try {
      const response = await fetch(`/api/admin/users/${userId}/reset-2fa`, {
        method: "POST",
      });

      if (response.ok) {
        await fetchUsers();
        toast.success("2FA reset successfully");
      } else {
        toast.error("Failed to reset 2FA");
      }
    } catch (error) {
      console.error("Error resetting 2FA:", error);
      toast.error("Failed to reset 2FA");
    } finally {
      setActionLoading(false);
    }
  };

  const handleUnlockAccount = async (userId: string) => {
    setActionLoading(true);
    try {
      const response = await fetch(`/api/admin/users/${userId}/unlock`, {
        method: "POST",
      });

      if (response.ok) {
        await fetchUsers();
        toast.success("Account unlocked successfully");
      } else {
        toast.error("Failed to unlock account");
      }
    } catch (error) {
      console.error("Error unlocking account:", error);
      toast.error("Failed to unlock account");
    } finally {
      setActionLoading(false);
    }
  };

  const handleDeleteUser = async (userId: string, userEmail: string) => {
    if (!confirm(`Are you sure you want to delete ${userEmail}? This action cannot be undone.`))
      return;

    setActionLoading(true);
    try {
      const response = await fetch(`/api/admin/users/${userId}`, {
        method: "DELETE",
      });

      if (response.ok) {
        await fetchUsers();
        setShowModal(false);
        toast.success("User deleted successfully");
      } else {
        toast.error("Failed to delete user");
      }
    } catch (error) {
      console.error("Error deleting user:", error);
      toast.error("Failed to delete user");
    } finally {
      setActionLoading(false);
    }
  };

  const isAccountLocked = (user: User) => {
    return user.accountLockedUntil && new Date(user.accountLockedUntil) > new Date();
  };

  if (loading) {
    return <PageSkeleton />;
  }

  // Pagination calculations
  const totalPages = Math.ceil(filteredUsers.length / usersPerPage);
  const startIndex = (currentPage - 1) * usersPerPage;
  const endIndex = startIndex + usersPerPage;
  const currentUsers = filteredUsers.slice(startIndex, endIndex);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className={`text-3xl font-bold ${isDarkMode ? "text-white" : "text-gray-900"}`}>
          User Management
        </h1>
        <p className={`mt-2 text-sm ${isDarkMode ? "text-gray-400" : "text-gray-600"}`}>
          Manage users, roles, and security settings
        </p>
      </div>

      {/* Stats */}
      <div className="grid gap-4 sm:grid-cols-4">
        <div
          className={`rounded-xl border p-4 ${
            isDarkMode
              ? "border-gray-800 bg-gray-900/50 backdrop-blur"
              : "border-gray-200 bg-white shadow-sm"
          }`}
        >
          <div className="flex items-center justify-between">
            <div>
              <p className={`text-sm ${isDarkMode ? "text-gray-400" : "text-gray-600"}`}>
                Total Users
              </p>
              <p
                className={`mt-1 text-2xl font-bold ${isDarkMode ? "text-white" : "text-gray-900"}`}
              >
                {users.length}
              </p>
            </div>
            <Users className="h-8 w-8 text-[#ab862b]" />
          </div>
        </div>

        <div
          className={`rounded-xl border p-4 ${
            isDarkMode
              ? "border-gray-800 bg-gray-900/50 backdrop-blur"
              : "border-gray-200 bg-white shadow-sm"
          }`}
        >
          <div className="flex items-center justify-between">
            <div>
              <p className={`text-sm ${isDarkMode ? "text-gray-400" : "text-gray-600"}`}>Admins</p>
              <p
                className={`mt-1 text-2xl font-bold ${isDarkMode ? "text-white" : "text-gray-900"}`}
              >
                {users.filter((u) => u.role === "ADMIN").length}
              </p>
            </div>
            <ShieldCheck className="h-8 w-8 text-purple-600" />
          </div>
        </div>

        <div
          className={`rounded-xl border p-4 ${
            isDarkMode
              ? "border-gray-800 bg-gray-900/50 backdrop-blur"
              : "border-gray-200 bg-white shadow-sm"
          }`}
        >
          <div className="flex items-center justify-between">
            <div>
              <p className={`text-sm ${isDarkMode ? "text-gray-400" : "text-gray-600"}`}>
                2FA Enabled
              </p>
              <p
                className={`mt-1 text-2xl font-bold ${isDarkMode ? "text-white" : "text-gray-900"}`}
              >
                {users.filter((u) => u.twoFactorEnabled).length}
              </p>
            </div>
            <Shield className="h-8 w-8 text-green-600" />
          </div>
        </div>

        <div
          className={`rounded-xl border p-4 ${
            isDarkMode
              ? "border-gray-800 bg-gray-900/50 backdrop-blur"
              : "border-gray-200 bg-white shadow-sm"
          }`}
        >
          <div className="flex items-center justify-between">
            <div>
              <p className={`text-sm ${isDarkMode ? "text-gray-400" : "text-gray-600"}`}>Locked</p>
              <p
                className={`mt-1 text-2xl font-bold ${isDarkMode ? "text-white" : "text-gray-900"}`}
              >
                {users.filter((u) => isAccountLocked(u)).length}
              </p>
            </div>
            <AlertCircle className="h-8 w-8 text-red-600" />
          </div>
        </div>
      </div>

      {/* Search */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className={`rounded-xl border p-4 ${
          isDarkMode
            ? "border-gray-800 bg-gray-900/50 backdrop-blur"
            : "border-gray-200 bg-white shadow-sm"
        }`}
      >
        <div className="relative">
          <Search
            className={`absolute left-3 top-1/2 h-5 w-5 -translate-y-1/2 ${
              isDarkMode ? "text-gray-400" : "text-gray-500"
            }`}
          />
          <input
            type="text"
            placeholder="Search users by name, email, or role..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className={`w-full rounded-lg border py-2 pl-10 pr-4 text-sm focus:outline-none focus:ring-2 focus:ring-[#ab862b] ${
              isDarkMode
                ? "border-gray-700 bg-gray-800 text-white placeholder-gray-400"
                : "border-gray-300 bg-white text-gray-900 placeholder-gray-500"
            }`}
          />
        </div>
      </motion.div>

      {/* Users Table - Desktop */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
        className={`hidden md:block rounded-xl border ${
          isDarkMode
            ? "border-gray-800 bg-gray-900/50 backdrop-blur"
            : "border-gray-200 bg-white shadow-sm"
        }`}
      >
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead
              className={`border-b ${isDarkMode ? "border-gray-800 bg-gray-800/50" : "border-gray-200 bg-gray-50"}`}
            >
              <tr>
                <th
                  className={`px-6 py-3 text-left text-xs font-medium uppercase tracking-wider ${
                    isDarkMode ? "text-gray-400" : "text-gray-600"
                  }`}
                >
                  User
                </th>
                <th
                  className={`px-6 py-3 text-left text-xs font-medium uppercase tracking-wider ${
                    isDarkMode ? "text-gray-400" : "text-gray-600"
                  }`}
                >
                  Role
                </th>
                <th
                  className={`px-6 py-3 text-left text-xs font-medium uppercase tracking-wider ${
                    isDarkMode ? "text-gray-400" : "text-gray-600"
                  } hidden sm:table-cell`}
                >
                  2FA
                </th>
                <th
                  className={`px-6 py-3 text-left text-xs font-medium uppercase tracking-wider ${
                    isDarkMode ? "text-gray-400" : "text-gray-600"
                  }`}
                >
                  Status
                </th>
                <th
                  className={`px-6 py-3 text-left text-xs font-medium uppercase tracking-wider ${
                    isDarkMode ? "text-gray-400" : "text-gray-600"
                  } hidden md:table-cell`}
                >
                  Joined
                </th>
                <th
                  className={`px-6 py-3 text-right text-xs font-medium uppercase tracking-wider ${
                    isDarkMode ? "text-gray-400" : "text-gray-600"
                  }`}
                >
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className={`divide-y ${isDarkMode ? "divide-gray-800" : "divide-gray-200"}`}>
              {currentUsers.length === 0 ? (
                <tr>
                  <td colSpan={6} className="px-6 py-12 text-center">
                    <Users
                      className={`mx-auto h-12 w-12 ${isDarkMode ? "text-gray-600" : "text-gray-400"}`}
                    />
                    <p className={`mt-4 text-sm ${isDarkMode ? "text-gray-400" : "text-gray-600"}`}>
                      No users found
                    </p>
                  </td>
                </tr>
              ) : (
                currentUsers.map((user, index) => (
                  <motion.tr
                    key={user.id}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: index * 0.02 }}
                    className={`transition-colors ${
                      isDarkMode ? "hover:bg-gray-800/50" : "hover:bg-gray-50"
                    }`}
                  >
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        <div
                          className={`flex h-10 w-10 items-center justify-center rounded-full ${
                            isDarkMode ? "bg-gray-800" : "bg-gray-100"
                          }`}
                        >
                          <Users
                            className={`h-5 w-5 ${isDarkMode ? "text-gray-400" : "text-gray-600"}`}
                          />
                        </div>
                        <div>
                          <p
                            className={`text-sm font-medium ${isDarkMode ? "text-white" : "text-gray-900"}`}
                          >
                            {user.name || "No name"}
                          </p>
                          <p
                            className={`text-sm ${isDarkMode ? "text-gray-400" : "text-gray-600"}`}
                          >
                            {user.email}
                          </p>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <span
                        className={`rounded-full px-2.5 py-0.5 text-xs font-medium ${
                          user.role === "ADMIN"
                            ? isDarkMode
                              ? "bg-purple-900/30 text-purple-400 border border-purple-800"
                              : "bg-purple-100 text-purple-800 border border-purple-200"
                            : isDarkMode
                              ? "bg-gray-800 text-gray-400 border border-gray-700"
                              : "bg-gray-100 text-gray-800 border border-gray-200"
                        }`}
                      >
                        {user.role}
                      </span>
                    </td>
                    <td className="px-6 py-4 hidden sm:table-cell">
                      {user.twoFactorEnabled ? (
                        <Check className="h-5 w-5 text-green-600" />
                      ) : (
                        <X className="h-5 w-5 text-gray-400" />
                      )}
                    </td>
                    <td className="px-6 py-4">
                      {isAccountLocked(user) ? (
                        <span
                          className={`rounded-full px-2.5 py-0.5 text-xs font-medium ${
                            isDarkMode
                              ? "bg-red-900/30 text-red-400 border border-red-800"
                              : "bg-red-100 text-red-800 border border-red-200"
                          }`}
                        >
                          Locked
                        </span>
                      ) : user.emailVerified ? (
                        <span
                          className={`rounded-full px-2.5 py-0.5 text-xs font-medium ${
                            isDarkMode
                              ? "bg-green-900/30 text-green-400 border border-green-800"
                              : "bg-green-100 text-green-800 border border-green-200"
                          }`}
                        >
                          Active
                        </span>
                      ) : (
                        <span
                          className={`rounded-full px-2.5 py-0.5 text-xs font-medium ${
                            isDarkMode
                              ? "bg-yellow-900/30 text-yellow-400 border border-yellow-800"
                              : "bg-yellow-100 text-yellow-800 border border-yellow-200"
                          }`}
                        >
                          Pending
                        </span>
                      )}
                    </td>
                    <td
                      className={`whitespace-nowrap px-6 py-4 text-sm hidden md:table-cell ${
                        isDarkMode ? "text-gray-400" : "text-gray-600"
                      }`}
                    >
                      {new Date(user.createdAt).toLocaleDateString()}
                    </td>
                    <td className="px-6 py-4 text-right">
                      <div className="flex items-center justify-end gap-2">
                        <button
                          onClick={() => {
                            setSelectedUser(user);
                            setShowModal(true);
                          }}
                          className={`rounded-lg p-2 transition-colors ${
                            isDarkMode
                              ? "hover:bg-gray-800 text-gray-400"
                              : "hover:bg-gray-100 text-gray-600"
                          }`}
                          title="View Details"
                        >
                          <Eye className="h-4 w-4" />
                        </button>
                        <button
                          onClick={() => handleToggleRole(user.id, user.role)}
                          disabled={actionLoading}
                          className={`rounded-lg p-2 transition-colors ${
                            isDarkMode
                              ? "hover:bg-gray-800 text-purple-400"
                              : "hover:bg-purple-100 text-purple-600"
                          }`}
                          title="Toggle Role"
                        >
                          <UserCog className="h-4 w-4" />
                        </button>
                        {user.twoFactorEnabled && (
                          <button
                            onClick={() => handleReset2FA(user.id)}
                            disabled={actionLoading}
                            className={`rounded-lg p-2 transition-colors ${
                              isDarkMode
                                ? "hover:bg-gray-800 text-yellow-400"
                                : "hover:bg-yellow-100 text-yellow-600"
                            }`}
                            title="Reset 2FA"
                          >
                            <Shield className="h-4 w-4" />
                          </button>
                        )}
                        {isAccountLocked(user) && (
                          <button
                            onClick={() => handleUnlockAccount(user.id)}
                            disabled={actionLoading}
                            className={`rounded-lg p-2 transition-colors ${
                              isDarkMode
                                ? "hover:bg-gray-800 text-green-400"
                                : "hover:bg-green-100 text-green-600"
                            }`}
                            title="Unlock Account"
                          >
                            <Check className="h-4 w-4" />
                          </button>
                        )}
                        <button
                          onClick={() => handleDeleteUser(user.id, user.email)}
                          disabled={actionLoading}
                          className={`rounded-lg p-2 transition-colors ${
                            isDarkMode
                              ? "hover:bg-gray-800 text-red-400"
                              : "hover:bg-red-100 text-red-600"
                          }`}
                          title="Delete User"
                        >
                          <Trash2 className="h-4 w-4" />
                        </button>
                      </div>
                    </td>
                  </motion.tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {/* Desktop Pagination */}
        {totalPages > 1 && (
          <div
            className={`flex items-center justify-between border-t px-6 py-4 ${
              isDarkMode ? "border-gray-800" : "border-gray-200"
            }`}
          >
            <div className={`text-sm ${isDarkMode ? "text-gray-400" : "text-gray-600"}`}>
              Showing {startIndex + 1} to {Math.min(endIndex, filteredUsers.length)} of{" "}
              {filteredUsers.length} users
            </div>
            <div className="flex items-center gap-2">
              <button
                onClick={() => setCurrentPage((prev) => Math.max(1, prev - 1))}
                disabled={currentPage === 1}
                className={`rounded-lg p-2 transition-colors ${
                  currentPage === 1
                    ? isDarkMode
                      ? "text-gray-600 cursor-not-allowed"
                      : "text-gray-400 cursor-not-allowed"
                    : isDarkMode
                      ? "text-gray-300 hover:bg-gray-800"
                      : "text-gray-700 hover:bg-gray-100"
                }`}
              >
                <ChevronLeft className="h-5 w-5" />
              </button>
              <span className={`text-sm ${isDarkMode ? "text-gray-300" : "text-gray-700"}`}>
                Page {currentPage} of {totalPages}
              </span>
              <button
                onClick={() => setCurrentPage((prev) => Math.min(totalPages, prev + 1))}
                disabled={currentPage === totalPages}
                className={`rounded-lg p-2 transition-colors ${
                  currentPage === totalPages
                    ? isDarkMode
                      ? "text-gray-600 cursor-not-allowed"
                      : "text-gray-400 cursor-not-allowed"
                    : isDarkMode
                      ? "text-gray-300 hover:bg-gray-800"
                      : "text-gray-700 hover:bg-gray-100"
                }`}
              >
                <ChevronRight className="h-5 w-5" />
              </button>
            </div>
          </div>
        )}
      </motion.div>

      {/* Users Cards - Mobile */}
      <div className="md:hidden space-y-4">
        {currentUsers.length === 0 ? (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className={`rounded-xl border p-12 text-center ${
              isDarkMode
                ? "border-gray-800 bg-gray-900/50 backdrop-blur"
                : "border-gray-200 bg-white shadow-sm"
            }`}
          >
            <Users
              className={`mx-auto h-12 w-12 ${isDarkMode ? "text-gray-600" : "text-gray-400"}`}
            />
            <p className={`mt-4 text-sm ${isDarkMode ? "text-gray-400" : "text-gray-600"}`}>
              No users found
            </p>
          </motion.div>
        ) : (
          currentUsers.map((user, index) => (
            <motion.div
              key={user.id}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.02 }}
              className={`rounded-xl border p-4 ${
                isDarkMode
                  ? "border-gray-800 bg-gray-900/50 backdrop-blur"
                  : "border-gray-200 bg-white shadow-sm"
              }`}
            >
              {/* User Info */}
              <div className="flex items-start justify-between mb-4">
                <div className="flex items-center gap-3 flex-1">
                  <div
                    className={`flex h-12 w-12 items-center justify-center rounded-full ${
                      isDarkMode ? "bg-gray-800" : "bg-gray-100"
                    }`}
                  >
                    <Users
                      className={`h-6 w-6 ${isDarkMode ? "text-gray-400" : "text-gray-600"}`}
                    />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p
                      className={`text-base font-medium truncate ${isDarkMode ? "text-white" : "text-gray-900"}`}
                    >
                      {user.name || "No name"}
                    </p>
                    <p
                      className={`text-sm truncate ${isDarkMode ? "text-gray-400" : "text-gray-600"}`}
                    >
                      {user.email}
                    </p>
                  </div>
                </div>
                <button
                  onClick={() => {
                    setSelectedUser(user);
                    setShowModal(true);
                  }}
                  className={`ml-2 rounded-lg p-2 transition-colors ${
                    isDarkMode
                      ? "hover:bg-gray-800 text-gray-400"
                      : "hover:bg-gray-100 text-gray-600"
                  }`}
                >
                  <Eye className="h-5 w-5" />
                </button>
              </div>

              {/* User Details */}
              <div className="space-y-3 mb-4">
                <div className="flex items-center justify-between">
                  <span className={`text-sm ${isDarkMode ? "text-gray-400" : "text-gray-600"}`}>
                    Role
                  </span>
                  <span
                    className={`rounded-full px-2.5 py-0.5 text-xs font-medium ${
                      user.role === "ADMIN"
                        ? isDarkMode
                          ? "bg-purple-900/30 text-purple-400 border border-purple-800"
                          : "bg-purple-100 text-purple-800 border border-purple-200"
                        : isDarkMode
                          ? "bg-gray-800 text-gray-400 border border-gray-700"
                          : "bg-gray-100 text-gray-800 border border-gray-200"
                    }`}
                  >
                    {user.role}
                  </span>
                </div>

                <div className="flex items-center justify-between">
                  <span className={`text-sm ${isDarkMode ? "text-gray-400" : "text-gray-600"}`}>
                    Status
                  </span>
                  {isAccountLocked(user) ? (
                    <span
                      className={`rounded-full px-2.5 py-0.5 text-xs font-medium ${
                        isDarkMode
                          ? "bg-red-900/30 text-red-400 border border-red-800"
                          : "bg-red-100 text-red-800 border border-red-200"
                      }`}
                    >
                      Locked
                    </span>
                  ) : user.emailVerified ? (
                    <span
                      className={`rounded-full px-2.5 py-0.5 text-xs font-medium ${
                        isDarkMode
                          ? "bg-green-900/30 text-green-400 border border-green-800"
                          : "bg-green-100 text-green-800 border border-green-200"
                      }`}
                    >
                      Active
                    </span>
                  ) : (
                    <span
                      className={`rounded-full px-2.5 py-0.5 text-xs font-medium ${
                        isDarkMode
                          ? "bg-yellow-900/30 text-yellow-400 border border-yellow-800"
                          : "bg-yellow-100 text-yellow-800 border border-yellow-200"
                      }`}
                    >
                      Pending
                    </span>
                  )}
                </div>

                <div className="flex items-center justify-between">
                  <span className={`text-sm ${isDarkMode ? "text-gray-400" : "text-gray-600"}`}>
                    2FA
                  </span>
                  {user.twoFactorEnabled ? (
                    <Check className="h-5 w-5 text-green-600" />
                  ) : (
                    <X className="h-5 w-5 text-gray-400" />
                  )}
                </div>

                <div className="flex items-center justify-between">
                  <span className={`text-sm ${isDarkMode ? "text-gray-400" : "text-gray-600"}`}>
                    Joined
                  </span>
                  <span className={`text-sm ${isDarkMode ? "text-gray-300" : "text-gray-900"}`}>
                    {new Date(user.createdAt).toLocaleDateString()}
                  </span>
                </div>
              </div>

              {/* Actions */}
              <div className="flex items-center gap-2 pt-3 border-t ${isDarkMode ? 'border-gray-800' : 'border-gray-200'}">
                <button
                  onClick={() => handleToggleRole(user.id, user.role)}
                  disabled={actionLoading}
                  className={`flex-1 flex items-center justify-center gap-2 rounded-lg px-3 py-2 text-sm font-medium transition-colors ${
                    isDarkMode
                      ? "bg-gray-800 text-purple-400 hover:bg-gray-700"
                      : "bg-purple-50 text-purple-600 hover:bg-purple-100"
                  }`}
                >
                  <UserCog className="h-4 w-4" />
                  Toggle Role
                </button>
                {user.twoFactorEnabled && (
                  <button
                    onClick={() => handleReset2FA(user.id)}
                    disabled={actionLoading}
                    className={`flex-1 flex items-center justify-center gap-2 rounded-lg px-3 py-2 text-sm font-medium transition-colors ${
                      isDarkMode
                        ? "bg-gray-800 text-yellow-400 hover:bg-gray-700"
                        : "bg-yellow-50 text-yellow-600 hover:bg-yellow-100"
                    }`}
                  >
                    <Shield className="h-4 w-4" />
                    Reset 2FA
                  </button>
                )}
                {isAccountLocked(user) && (
                  <button
                    onClick={() => handleUnlockAccount(user.id)}
                    disabled={actionLoading}
                    className={`flex-1 flex items-center justify-center gap-2 rounded-lg px-3 py-2 text-sm font-medium transition-colors ${
                      isDarkMode
                        ? "bg-gray-800 text-green-400 hover:bg-gray-700"
                        : "bg-green-50 text-green-600 hover:bg-green-100"
                    }`}
                  >
                    <Check className="h-4 w-4" />
                    Unlock
                  </button>
                )}
                <button
                  onClick={() => handleDeleteUser(user.id, user.email)}
                  disabled={actionLoading}
                  className={`rounded-lg p-2 transition-colors ${
                    isDarkMode
                      ? "bg-gray-800 text-red-400 hover:bg-gray-700"
                      : "bg-red-50 text-red-600 hover:bg-red-100"
                  }`}
                >
                  <Trash2 className="h-4 w-4" />
                </button>
              </div>
            </motion.div>
          ))
        )}

        {/* Mobile Pagination */}
        {totalPages > 1 && (
          <div className="flex items-center justify-between pt-4">
            <span className={`text-sm ${isDarkMode ? "text-gray-400" : "text-gray-600"}`}>
              Page {currentPage} of {totalPages}
            </span>
            <div className="flex items-center gap-2">
              <button
                onClick={() => setCurrentPage((prev) => Math.max(1, prev - 1))}
                disabled={currentPage === 1}
                className={`rounded-lg p-2 transition-colors ${
                  currentPage === 1
                    ? isDarkMode
                      ? "text-gray-600"
                      : "text-gray-400"
                    : isDarkMode
                      ? "text-gray-300 hover:bg-gray-800"
                      : "text-gray-700 hover:bg-gray-100"
                }`}
              >
                <ChevronLeft className="h-5 w-5" />
              </button>
              <button
                onClick={() => setCurrentPage((prev) => Math.min(totalPages, prev + 1))}
                disabled={currentPage === totalPages}
                className={`rounded-lg p-2 transition-colors ${
                  currentPage === totalPages
                    ? isDarkMode
                      ? "text-gray-600"
                      : "text-gray-400"
                    : isDarkMode
                      ? "text-gray-300 hover:bg-gray-800"
                      : "text-gray-700 hover:bg-gray-100"
                }`}
              >
                <ChevronRight className="h-5 w-5" />
              </button>
            </div>
          </div>
        )}
      </div>

      {/* User Details Modal */}
      <AnimatePresence>
        {showModal && selectedUser && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4"
            onClick={() => setShowModal(false)}
          >
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              onClick={(e) => e.stopPropagation()}
              className={`w-full max-w-2xl rounded-xl border p-6 ${
                isDarkMode ? "border-gray-800 bg-gray-900" : "border-gray-200 bg-white"
              }`}
            >
              <div className="flex items-center justify-between mb-6">
                <h2 className={`text-2xl font-bold ${isDarkMode ? "text-white" : "text-gray-900"}`}>
                  User Details
                </h2>
                <button
                  onClick={() => setShowModal(false)}
                  className={`rounded-lg p-2 transition-colors ${
                    isDarkMode ? "hover:bg-gray-800" : "hover:bg-gray-100"
                  }`}
                >
                  <X className={`h-5 w-5 ${isDarkMode ? "text-gray-400" : "text-gray-600"}`} />
                </button>
              </div>

              <div className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <p className={`text-sm ${isDarkMode ? "text-gray-400" : "text-gray-600"}`}>
                      Name
                    </p>
                    <p
                      className={`mt-1 font-medium ${isDarkMode ? "text-white" : "text-gray-900"}`}
                    >
                      {selectedUser.name || "N/A"}
                    </p>
                  </div>
                  <div>
                    <p className={`text-sm ${isDarkMode ? "text-gray-400" : "text-gray-600"}`}>
                      Email
                    </p>
                    <p
                      className={`mt-1 font-medium ${isDarkMode ? "text-white" : "text-gray-900"}`}
                    >
                      {selectedUser.email}
                    </p>
                  </div>
                  <div>
                    <p className={`text-sm ${isDarkMode ? "text-gray-400" : "text-gray-600"}`}>
                      Role
                    </p>
                    <p
                      className={`mt-1 font-medium ${isDarkMode ? "text-white" : "text-gray-900"}`}
                    >
                      {selectedUser.role}
                    </p>
                  </div>
                  <div>
                    <p className={`text-sm ${isDarkMode ? "text-gray-400" : "text-gray-600"}`}>
                      2FA Status
                    </p>
                    <p
                      className={`mt-1 font-medium ${isDarkMode ? "text-white" : "text-gray-900"}`}
                    >
                      {selectedUser.twoFactorEnabled ? "Enabled" : "Disabled"}
                    </p>
                  </div>
                  <div>
                    <p className={`text-sm ${isDarkMode ? "text-gray-400" : "text-gray-600"}`}>
                      Email Verified
                    </p>
                    <p
                      className={`mt-1 font-medium ${isDarkMode ? "text-white" : "text-gray-900"}`}
                    >
                      {selectedUser.emailVerified ? "Yes" : "No"}
                    </p>
                  </div>
                  <div>
                    <p className={`text-sm ${isDarkMode ? "text-gray-400" : "text-gray-600"}`}>
                      Failed Login Attempts
                    </p>
                    <p
                      className={`mt-1 font-medium ${isDarkMode ? "text-white" : "text-gray-900"}`}
                    >
                      {selectedUser.failedLoginAttempts}
                    </p>
                  </div>
                  <div>
                    <p className={`text-sm ${isDarkMode ? "text-gray-400" : "text-gray-600"}`}>
                      Joined Date
                    </p>
                    <p
                      className={`mt-1 font-medium ${isDarkMode ? "text-white" : "text-gray-900"}`}
                    >
                      {new Date(selectedUser.createdAt).toLocaleString()}
                    </p>
                  </div>
                  <div>
                    <p className={`text-sm ${isDarkMode ? "text-gray-400" : "text-gray-600"}`}>
                      Last Login
                    </p>
                    <p
                      className={`mt-1 font-medium ${isDarkMode ? "text-white" : "text-gray-900"}`}
                    >
                      {selectedUser.lastLoginAt
                        ? new Date(selectedUser.lastLoginAt).toLocaleString()
                        : "Never"}
                    </p>
                  </div>
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
