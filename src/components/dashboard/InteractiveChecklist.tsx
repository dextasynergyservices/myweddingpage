"use client";

import React, { useState } from "react";
import { motion } from "framer-motion";
import {
  CheckSquare,
  Square,
  Calendar,
  User,
  AlertTriangle,
  CheckCircle,
  Users,
} from "lucide-react";
import { useTheme } from "@/contexts/ThemeContext";
import AnimatedSection from "@/components/AnimatedSection";

interface ChecklistItem {
  id: string;
  title: string;
  description: string;
  category: string;
  priority: "low" | "medium" | "high";
  dueDate: string;
  assignedTo?: string;
  completed: boolean;
  completedDate?: string;
  dependencies?: string[];
  estimatedTime: number;
}

interface Category {
  id: string;
  name: string;
  color: string;
  icon: React.ElementType;
}

const InteractiveChecklist = () => {
  const { isDarkMode } = useTheme();

  const [tasks, setTasks] = useState<ChecklistItem[]>([
    {
      id: "1",
      title: "Book Wedding Venue",
      description: "Research and book the perfect venue for the ceremony and reception",
      category: "venue",
      priority: "high",
      dueDate: "2024-02-01",
      assignedTo: "Both",
      completed: true,
      completedDate: "2024-01-15",
      estimatedTime: 8,
    },
    {
      id: "2",
      title: "Send Save the Dates",
      description: "Design and send save the date cards to all guests",
      category: "invitations",
      priority: "high",
      dueDate: "2024-03-01",
      assignedTo: "Emily",
      completed: false,
      dependencies: ["1"],
      estimatedTime: 4,
    },
    {
      id: "3",
      title: "Book Photographer",
      description: "Find and book wedding photographer",
      category: "vendors",
      priority: "high",
      dueDate: "2024-02-15",
      assignedTo: "David",
      completed: true,
      completedDate: "2024-01-20",
      estimatedTime: 6,
    },
    {
      id: "4",
      title: "Choose Wedding Dress",
      description: "Shop for and select the perfect wedding dress",
      category: "attire",
      priority: "medium",
      dueDate: "2024-04-01",
      assignedTo: "Emily",
      completed: false,
      estimatedTime: 12,
    },
    {
      id: "5",
      title: "Plan Menu Tasting",
      description: "Schedule and attend catering menu tasting",
      category: "catering",
      priority: "medium",
      dueDate: "2024-03-15",
      assignedTo: "Both",
      completed: false,
      dependencies: ["1"],
      estimatedTime: 3,
    },
  ]);

  const categories: Category[] = [
    { id: "venue", name: "Venue", color: "from-purple-500 to-indigo-600", icon: Calendar },
    { id: "vendors", name: "Vendors", color: "from-blue-500 to-cyan-600", icon: Users },
    {
      id: "invitations",
      name: "Invitations",
      color: "from-emerald-500 to-teal-600",
      icon: CheckSquare,
    },
    { id: "attire", name: "Attire", color: "from-pink-500 to-rose-600", icon: User },
    { id: "catering", name: "Catering", color: "from-amber-500 to-orange-600", icon: Calendar },
    { id: "flowers", name: "Flowers", color: "from-green-500 to-emerald-600", icon: Calendar },
  ];

  const [selectedCategory, setSelectedCategory] = useState("all");
  const [selectedPriority, setSelectedPriority] = useState("all");
  const [searchQuery, setSearchQuery] = useState("");
  const [showCompleted, setShowCompleted] = useState(true);

  const toggleTask = (id: string) => {
    setTasks((prev) =>
      prev.map((task) =>
        task.id === id
          ? {
              ...task,
              completed: !task.completed,
              completedDate: !task.completed ? new Date().toISOString().split("T")[0] : undefined,
            }
          : task
      )
    );
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case "high":
        return "text-red-600 bg-red-100 dark:bg-red-900/30 dark:text-red-400";
      case "medium":
        return "text-amber-600 bg-amber-100 dark:bg-amber-900/30 dark:text-amber-400";
      case "low":
        return "text-emerald-600 bg-emerald-100 dark:bg-emerald-900/30 dark:text-emerald-400";
      default:
        return "text-slate-600 bg-slate-100 dark:bg-slate-900/30 dark:text-slate-400";
    }
  };

  const getCategoryInfo = (categoryId: string) =>
    categories.find((cat) => cat.id === categoryId) || categories[0];

  const isOverdue = (dueDate: string, completed: boolean) =>
    !completed && new Date(dueDate) < new Date();

  const filteredTasks = tasks.filter((task) => {
    const matchesCategory = selectedCategory === "all" || task.category === selectedCategory;
    const matchesPriority = selectedPriority === "all" || task.priority === selectedPriority;
    const matchesSearch =
      task.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      task.description.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesCompletion = showCompleted || !task.completed;

    return matchesCategory && matchesPriority && matchesSearch && matchesCompletion;
  });

  const completedTasks = tasks.filter((t) => t.completed).length;
  const overdueTasks = tasks.filter((t) => isOverdue(t.dueDate, t.completed)).length;
  const totalTasks = tasks.length;
  // const completionPercentage = totalTasks > 0 ? (completedTasks / totalTasks) * 100 : 0;

  return (
    <AnimatedSection className="space-y-12">
      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {[
          {
            title: "Total Tasks",
            value: totalTasks,
            icon: CheckSquare,
            color: "from-blue-500 to-indigo-600",
          },
          {
            title: "Completed",
            value: completedTasks,
            icon: CheckCircle,
            color: "from-emerald-500 to-teal-600",
          },
          {
            title: "Overdue",
            value: overdueTasks,
            icon: AlertTriangle,
            color: "from-red-500 to-pink-600",
          },
        ].map((stat, i) => (
          <motion.div
            key={stat.title}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.1 }}
            className={`p-6 rounded-3xl shadow-lg border ${
              isDarkMode ? "bg-slate-800 border-slate-700" : "bg-white border-slate-100"
            }`}
          >
            <div className="flex justify-between items-center">
              <div>
                <p className="text-sm text-muted-foreground">{stat.title}</p>
                <p
                  className={`text-3xl font-light ${isDarkMode ? "text-white" : "text-slate-900"}`}
                >
                  {stat.value}
                </p>
              </div>
              <div className={`p-3 rounded-2xl bg-gradient-to-r ${stat.color}`}>
                <stat.icon className="text-white h-6 w-6" />
              </div>
            </div>
          </motion.div>
        ))}
      </div>

      {/* Filters */}
      <div className="flex flex-wrap gap-4 items-center justify-between">
        <input
          type="text"
          placeholder="Search tasks..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className={`flex-1 rounded-xl border px-4 py-2 text-sm bg-transparent ${
            isDarkMode
              ? "border-slate-600 text-white placeholder-slate-400 focus:border-slate-500"
              : "border-slate-400 text-slate-800 placeholder-slate-500 focus:border-slate-600"
          }`}
        />
        <select
          className={`rounded-xl border px-4 py-2 text-sm bg-transparent ${
            isDarkMode
              ? "border-slate-600 text-white focus:border-slate-500"
              : "border-slate-400 text-slate-800 focus:border-slate-600"
          }`}

          value={selectedCategory}
          onChange={(e) => setSelectedCategory(e.target.value)}
        >
          <option value="all">All Categories</option>
          {categories.map((c) => (
            <option key={c.id} value={c.id}>
              {c.name}
            </option>
          ))}
        </select>
        <select
          className={`rounded-xl border px-4 py-2 text-sm bg-transparent ${
            isDarkMode
              ? "border-slate-600 text-white focus:border-slate-500"
              : "border-slate-400 text-slate-800 focus:border-slate-600"
          }`}

          value={selectedPriority}
          onChange={(e) => setSelectedPriority(e.target.value)}
        >
          <option value="all">All Priorities</option>
          <option value="high">High</option>
          <option value="medium">Medium</option>
          <option value="low">Low</option>
        </select>
        <label
          className={`text-sm flex items-center gap-2 cursor-pointer ${
            isDarkMode ? "text-slate-300" : "text-slate-700"
          }`}
        >

          <input
            type="checkbox"
            checked={showCompleted}
            onChange={(e) => setShowCompleted(e.target.checked)}
            className={`rounded ${
              isDarkMode
                ? "border-slate-600 bg-slate-700 text-indigo-500 focus:ring-indigo-500"
                : "border-slate-400 bg-white text-indigo-600 focus:ring-indigo-500"
            }`}

          />
          Show Completed
        </label>
      </div>

      {/* Task List */}
      <div className="space-y-6">
        {filteredTasks.map((task) => {
          const overdue = isOverdue(task.dueDate, task.completed);
          const category = getCategoryInfo(task.category);
          return (
            <motion.div
              key={task.id}
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 }}
              className={`p-5 rounded-2xl shadow-md border flex justify-between items-start ${
                isDarkMode ? "bg-slate-800 border-slate-700" : "bg-white border-slate-100"
              }`}
            >
              <div className="flex items-start gap-4">
                <button
                  onClick={() => toggleTask(task.id)}
                  className={`rounded-full border p-2 ${
                    task.completed
                      ? "bg-emerald-500 text-white border-emerald-600"
                      : "text-slate-400 border-slate-300"
                  }`}
                >
                  {task.completed ? <CheckSquare /> : <Square />}
                </button>
                <div>
                  <h3
                    className={`text-lg font-medium ${isDarkMode ? "text-white" : "text-slate-900"}`}
                  >
                    {task.title}
                  </h3>
                  <p className="text-sm text-muted-foreground mb-2">{task.description}</p>
                  <div className="flex flex-wrap gap-2 text-xs items-center">
                    <span className={`${getPriorityColor(task.priority)} px-2 py-1 rounded-full`}>
                      Priority: {task.priority}
                    </span>
                    <span className="text-muted-foreground">Due: {task.dueDate}</span>
                    {overdue && !task.completed && (
                      <span className="text-red-500 font-medium">Overdue</span>
                    )}
                    <span className="text-muted-foreground">Assigned: {task.assignedTo}</span>
                    <span className="text-muted-foreground">Est: {task.estimatedTime}h</span>
                  </div>
                </div>
              </div>

              <div className="flex items-center gap-2 text-xs text-muted-foreground">
                <category.icon className="w-4 h-4" />
                <span>{category.name}</span>
              </div>
            </motion.div>
          );
        })}
        {filteredTasks.length === 0 && (
          <p className="text-center text-sm text-muted-foreground">No tasks found.</p>
        )}
      </div>
    </AnimatedSection>
  );
};

export default InteractiveChecklist;
