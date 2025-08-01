"use client";

import React, { useState } from "react";
import { motion } from "framer-motion";
import {
  DollarSign,
  Plus,
  TrendingUp,
  AlertTriangle,
  CheckCircle,
  Calendar,
  CreditCard,
  Edit,
  Trash2,
} from "lucide-react";
import { useTheme } from "@/contexts/ThemeContext"; // ✅ update this path if your ThemeContext lives elsewhere

interface BudgetCategory {
  id: string;
  name: string;
  budgeted: number;
  spent: number;
  color: string;
  icon: React.ElementType;
}

interface Expense {
  id: string;
  category: string;
  vendor: string;
  amount: number;
  date: string;
  status: "paid" | "pending" | "overdue";
  description: string;
}

const BudgetTracker = () => {
  const { isDarkMode } = useTheme();
  const [totalBudget] = useState(25000);

  const [categories] = useState<BudgetCategory[]>([
    {
      id: "1",
      name: "Venue & Catering",
      budgeted: 12000,
      spent: 8500,
      color: "from-purple-500 to-indigo-600",
      icon: Calendar,
    },
    {
      id: "2",
      name: "Photography",
      budgeted: 3000,
      spent: 2800,
      color: "from-pink-500 to-rose-600",
      icon: Calendar,
    },
    {
      id: "3",
      name: "Flowers & Decor",
      budgeted: 2500,
      spent: 1200,
      color: "from-emerald-500 to-teal-600",
      icon: Calendar,
    },
    {
      id: "4",
      name: "Attire & Beauty",
      budgeted: 2000,
      spent: 1800,
      color: "from-amber-500 to-orange-600",
      icon: Calendar,
    },
    {
      id: "5",
      name: "Music & Entertainment",
      budgeted: 1500,
      spent: 0,
      color: "from-blue-500 to-cyan-600",
      icon: Calendar,
    },
  ]);

  const [expenses] = useState<Expense[]>([
    {
      id: "1",
      category: "Venue & Catering",
      vendor: "Garden Valley Estate",
      amount: 8500,
      date: "2024-01-15",
      status: "paid",
      description: "Venue booking and catering deposit",
    },
    {
      id: "2",
      category: "Photography",
      vendor: "John Photography",
      amount: 2800,
      date: "2024-01-20",
      status: "paid",
      description: "Wedding photography package",
    },
    {
      id: "3",
      category: "Flowers & Decor",
      vendor: "Bloom Studio",
      amount: 1200,
      date: "2024-02-01",
      status: "pending",
      description: "Bridal bouquet and centerpieces",
    },
  ]);

  const totalSpent = categories.reduce((sum, cat) => sum + cat.spent, 0);
  const remainingBudget = totalBudget - totalSpent;
  const budgetUsedPercentage = (totalSpent / totalBudget) * 100;

  const getStatusColor = (status: string) => {
    switch (status) {
      case "paid":
        return "bg-emerald-100 text-emerald-800 dark:bg-emerald-900/30 dark:text-emerald-400";
      case "pending":
        return "bg-amber-100 text-amber-800 dark:bg-amber-900/30 dark:text-amber-400";
      case "overdue":
        return "bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400";
      default:
        return "bg-slate-100 text-slate-800 dark:bg-slate-900/30 dark:text-slate-400";
    }
  };

  const getCategoryProgress = (category: BudgetCategory) =>
    Math.min((category.spent / category.budgeted) * 100, 100);

  const getCategoryStatus = (category: BudgetCategory) => {
    const percentage = getCategoryProgress(category);
    if (percentage > 100) return "over";
    if (percentage > 90) return "warning";
    return "good";
  };

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 sm:gap-6">

        <div>
          <h1
            className={`text-3xl font-light mb-2 ${isDarkMode ? "text-white" : "text-slate-900"}`}
          >
            Budget Tracker
          </h1>
          <p className={isDarkMode ? "text-slate-400" : "text-slate-600"}>
            Monitor your wedding expenses and stay on budget
          </p>
        </div>
        <button className="w-full sm:w-auto flex items-center justify-center gap-2 px-4 py-2 sm:px-6 sm:py-3 bg-gradient-to-r from-indigo-600 to-purple-600 text-white rounded-xl sm:rounded-2xl hover:shadow-lg transition-all duration-300">

          <Plus className="h-5 w-5" />
          Add Expense
        </button>
      </div>

      {/* Overview */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Total Budget */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className={`rounded-3xl p-6 shadow-lg border ${
            isDarkMode ? "bg-slate-800 border-slate-700" : "bg-white border-slate-100"
          }`}
        >
          <div className="flex items-center justify-between mb-4">
            <div className="p-3 bg-gradient-to-r from-blue-500 to-indigo-600 rounded-2xl">
              <DollarSign className="h-6 w-6 text-white" />
            </div>
            <div className={budgetUsedPercentage > 90 ? "text-red-600" : "text-emerald-600"}>
              <TrendingUp className="h-5 w-5" />
            </div>
          </div>
          <h3
            className={`text-3xl font-light mb-1 ${isDarkMode ? "text-white" : "text-slate-900"}`}
          >
            ${totalBudget.toLocaleString()}
          </h3>
          <p className={isDarkMode ? "text-slate-400" : "text-slate-600"}>Total Budget</p>
        </motion.div>

        {/* Total Spent */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className={`rounded-3xl p-6 shadow-lg border ${
            isDarkMode ? "bg-slate-800 border-slate-700" : "bg-white border-slate-100"
          }`}
        >
          <div className="flex items-center justify-between mb-4">
            <div className="p-3 bg-gradient-to-r from-emerald-500 to-teal-600 rounded-2xl">
              <CreditCard className="h-6 w-6 text-white" />
            </div>
            <CheckCircle className="h-5 w-5 text-emerald-600" />
          </div>
          <h3
            className={`text-3xl font-light mb-1 ${isDarkMode ? "text-white" : "text-slate-900"}`}
          >
            ${totalSpent.toLocaleString()}
          </h3>
          <p className={isDarkMode ? "text-slate-400" : "text-slate-600"}>
            Total Spent ({budgetUsedPercentage.toFixed(1)}%)
          </p>
        </motion.div>

        {/* Remaining / Over Budget */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className={`rounded-3xl p-6 shadow-lg border ${
            isDarkMode ? "bg-slate-800 border-slate-700" : "bg-white border-slate-100"
          }`}
        >
          <div className="flex items-center justify-between mb-4">
            <div
              className={`p-3 rounded-2xl ${
                remainingBudget < 0
                  ? "bg-gradient-to-r from-red-500 to-pink-600"
                  : "bg-gradient-to-r from-amber-500 to-orange-600"
              }`}
            >
              <DollarSign className="h-6 w-6 text-white" />
            </div>
            {remainingBudget < 0 && <AlertTriangle className="h-5 w-5 text-red-600" />}
          </div>
          <h3
            className={`text-3xl font-light mb-1 ${
              remainingBudget < 0 ? "text-red-600" : isDarkMode ? "text-white" : "text-slate-900"
            }`}
          >
            ${Math.abs(remainingBudget).toLocaleString()}
          </h3>
          <p className={isDarkMode ? "text-slate-400" : "text-slate-600"}>
            {remainingBudget < 0 ? "Over Budget" : "Remaining"}
          </p>
        </motion.div>
      </div>

      {/* Category Breakdown */}
      <div
        className={`rounded-3xl p-6 shadow-lg border ${isDarkMode ? "bg-slate-800 border-slate-700" : "bg-white border-slate-100"}`}
      >
        <h2
          className={`text-xl font-semibold mb-6 ${isDarkMode ? "text-white" : "text-slate-900"}`}
        >
          Budget Breakdown
        </h2>
        <div className="space-y-6">
          {categories.map((category, index) => {
            const progress = getCategoryProgress(category);
            const status = getCategoryStatus(category);
            const Icon = category.icon;

            return (
              <motion.div
                key={category.id}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: index * 0.1 }}
                className={`p-4 rounded-2xl border ${
                  isDarkMode ? "bg-slate-700/50 border-slate-600" : "bg-slate-50 border-slate-200"
                }`}
              >
                <div className="flex items-center justify-between mb-3">
                  <div className="flex items-center gap-3">
                    <div className={`p-2 bg-gradient-to-r ${category.color} rounded-xl`}>
                      <Icon className="h-5 w-5 text-white" />
                    </div>
                    <div>
                      <h3 className={`font-medium ${isDarkMode ? "text-white" : "text-slate-900"}`}>
                        {category.name}
                      </h3>
                      <p className={`text-sm ${isDarkMode ? "text-slate-400" : "text-slate-600"}`}>
                        ${category.spent.toLocaleString()} of ${category.budgeted.toLocaleString()}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    {status === "over" && <AlertTriangle className="h-5 w-5 text-red-600" />}
                    {status === "warning" && <AlertTriangle className="h-5 w-5 text-amber-600" />}
                    <span
                      className={`text-sm font-medium ${
                        status === "over"
                          ? "text-red-600"
                          : status === "warning"
                            ? "text-amber-600"
                            : "text-emerald-600"
                      }`}
                    >
                      {progress.toFixed(1)}%
                    </span>
                  </div>
                </div>

                <div
                  className={`w-full h-3 rounded-full ${isDarkMode ? "bg-slate-600" : "bg-slate-200"}`}
                >
                  <div
                    className={`h-3 rounded-full transition-all duration-500 ${
                      status === "over"
                        ? "bg-gradient-to-r from-red-500 to-red-600"
                        : status === "warning"
                          ? "bg-gradient-to-r from-amber-500 to-amber-600"
                          : `bg-gradient-to-r ${category.color}`
                    }`}
                    style={{ width: `${Math.min(progress, 100)}%` }}
                  />
                </div>
              </motion.div>
            );
          })}
        </div>
      </div>

      {/* Responsive Expenses Table */}
      <div
        className={`rounded-3xl shadow-lg border overflow-hidden ${isDarkMode ? "bg-slate-800 border-slate-700" : "bg-white border-slate-100"}`}
      >
        {/* Table Header */}
        <div className="p-4 sm:p-6 border-b border-slate-200 dark:border-slate-700">
          <h2
            className={`text-lg sm:text-xl font-semibold ${isDarkMode ? "text-white" : "text-slate-900"}`}
          >

            Recent Expenses
          </h2>
        </div>

        {/* Desktop Expenses Table */}
        <div className="hidden sm:block overflow-x-auto">

          <table className="w-full">
            <thead className={isDarkMode ? "bg-slate-700" : "bg-slate-50"}>
              <tr>
                {["Vendor", "Category", "Amount", "Status", "Actions"].map((label) => (
                  <th
                    key={label}
                    className={`px-4 sm:px-6 py-3 sm:py-4 text-left text-xs sm:text-sm font-medium ${

                      isDarkMode ? "text-slate-300" : "text-slate-700"
                    } ${label === "Actions" ? "text-right" : ""}`}
                  >
                    {label}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-200 dark:divide-slate-700">
              {expenses.map((expense) => (
                <motion.tr
                  key={expense.id}
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  className="hover:bg-slate-50 dark:hover:bg-slate-700/50 transition-colors"
                >
                  <td className="px-4 sm:px-6 py-3 sm:py-4">
                    <p className={`font-medium ${isDarkMode ? "text-white" : "text-slate-900"}`}>
                      {expense.vendor}
                    </p>
                    <p
                      className={`text-xs sm:text-sm ${isDarkMode ? "text-slate-400" : "text-slate-600"}`}
                    >
                      {expense.description}
                    </p>
                  </td>
                  <td className="px-4 sm:px-6 py-3 sm:py-4">
                    <span
                      className={`text-xs sm:text-sm ${isDarkMode ? "text-slate-300" : "text-slate-700"}`}
                    >
                      {expense.category}
                    </span>
                  </td>
                  <td className="px-4 sm:px-6 py-3 sm:py-4">
                    <span
                      className={`text-base sm:text-lg font-semibold ${isDarkMode ? "text-white" : "text-slate-900"}`}

                    >
                      ${expense.amount.toLocaleString()}
                    </span>
                  </td>
                  <td className="px-4 sm:px-6 py-3 sm:py-4">
                    <span
                      className={`inline-flex items-center gap-1 sm:gap-2 px-2 sm:px-3 py-1 rounded-full text-xs font-medium ${getStatusColor(expense.status)}`}

                    >
                      {expense.status.charAt(0).toUpperCase() + expense.status.slice(1)}
                    </span>
                  </td>
                  <td className="px-4 sm:px-6 py-3 sm:py-4 text-right">
                    <div className="flex items-center justify-end gap-1 sm:gap-2">
                      <button
                        className={`p-1 sm:p-2 rounded-md sm:rounded-lg transition-colors ${

                          isDarkMode
                            ? "text-slate-400 hover:bg-slate-700 hover:text-white"
                            : "text-slate-600 hover:bg-slate-100 hover:text-slate-900"
                        }`}
                      >
                        <Edit className="h-4 w-4" />
                      </button>
                      <button className="p-1 sm:p-2 rounded-md sm:rounded-lg text-red-600 hover:bg-red-100 dark:hover:bg-red-900/30 transition-colors">

                        <Trash2 className="h-4 w-4" />
                      </button>
                    </div>
                  </td>
                </motion.tr>
              ))}
            </tbody>
          </table>
        </div>
        {/* Mobile Expenses Table */}
        <div className="sm:hidden">
          {expenses.map((expense) => (
            <motion.div
              key={expense.id}
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className={`p-4 border-b ${isDarkMode ? "border-slate-700 hover:bg-slate-700/50" : "border-slate-200 hover:bg-slate-50"} transition-colors`}
            >
              <div className="flex justify-between items-start gap-3">
                <div className="flex-1">
                  <div className="flex items-center justify-between gap-2 mb-2">
                    <p className={`font-medium ${isDarkMode ? "text-white" : "text-slate-900"}`}>
                      {expense.vendor}
                    </p>
                    <span
                      className={`text-base font-semibold ${isDarkMode ? "text-white" : "text-slate-900"}`}
                    >
                      ${expense.amount.toLocaleString()}
                    </span>
                  </div>

                  {expense.description && (
                    <p
                      className={`text-xs ${isDarkMode ? "text-slate-400" : "text-slate-600"} mb-2`}
                    >
                      {expense.description}
                    </p>
                  )}

                  <div className="flex flex-wrap items-center gap-3">
                    <span
                      className={`inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(expense.status)}`}
                    >
                      {expense.status.charAt(0).toUpperCase() + expense.status.slice(1)}
                    </span>

                    <span className={`text-xs ${isDarkMode ? "text-slate-400" : "text-slate-600"}`}>
                      {expense.category}
                    </span>
                  </div>
                </div>

                <div className="flex flex-col items-end gap-1">
                  <button
                    className={`p-1 rounded-md transition-colors ${
                      isDarkMode
                        ? "text-slate-400 hover:bg-slate-700 hover:text-white"
                        : "text-slate-600 hover:bg-slate-100 hover:text-slate-900"
                    }`}
                  >
                    <Edit className="h-4 w-4" />
                  </button>
                  <button className="p-1 rounded-md text-red-600 hover:bg-red-100 dark:hover:bg-red-900/30 transition-colors">
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

export default BudgetTracker;
