"use client";

import { useEffect, useState, use } from "react"; // Added `use`
import { useRouter } from "next/navigation";
import {
  CheckSquare,
  Square,
  Calendar,
  AlertTriangle,
  Loader2,
} from "lucide-react";
import { useTheme } from "@/contexts/ThemeContext";
import AnimatedSection from "@/components/AnimatedSection";

interface Task {
  id: string;
  title: string;
  description: string;
  TaskCategory: {
    id: string;
    name: string;
    color: string;
  };
  TaskPriority: {
    id: string;
    name: string;
    level: number;
    color?: string;
  } | null; // Allow null priority
  dueDate: string;
  assignedTo: string | null;
  completed: boolean;
  completedAt: string | null;
  estimatedTime: number | null;
  phone: string | null;
  email: string | null;
  token: string;
}

const TaskUpdatePage = ({ params }: { params: Promise<{ token: string }> }) => {
  const { token } = use(params); // Unwrap params Promise

  const { isDarkMode } = useTheme();
  const router = useRouter();
  const [task, setTask] = useState<Task | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [updating, setUpdating] = useState(false);
  const [success, setSuccess] = useState(false);

  // New states for formatted dates
  const [formattedDueDate, setFormattedDueDate] = useState("");
  const [formattedCompletedAt, setFormattedCompletedAt] = useState("");

  useEffect(() => {
    if (task?.dueDate) {
      try {
        setFormattedDueDate(new Date(task.dueDate).toLocaleDateString());
      } catch {
        setFormattedDueDate("Invalid date");
      }
    }
    if (task?.completedAt) {
      try {
        setFormattedCompletedAt(
          new Date(task.completedAt).toLocaleDateString()
        );
      } catch {
        setFormattedCompletedAt("Invalid date");
      }
    }
  }, [task]);

  useEffect(() => {
    if (!token) {
      setError("Invalid task link");
      setLoading(false);
      return;
    }

    const fetchTask = async () => {
      try {
        const response = await fetch(`/api/tasks/${token}`);
        if (!response.ok) {
          const errorData = await response.json();
          throw new Error(errorData.error || "Failed to fetch task");
        }
        const data = await response.json();
        setTask(data);
      } catch (err) {
        setError(err instanceof Error ? err.message : "Failed to fetch task");
      } finally {
        setLoading(false);
      }
    };

    fetchTask();
  }, [token]);

  const toggleTask = async () => {
    if (!task) return;

    setUpdating(true);
    try {
      const updatedTask = {
        ...task,
        completed: !task.completed,
        completedAt: !task.completed ? new Date().toISOString() : null,
      };

      const response = await fetch(`/api/tasks/${token}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(updatedTask),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || "Failed to update task");
      }

      const data = await response.json();
      setTask(data);
      setSuccess(true);
      setTimeout(() => setSuccess(false), 3000);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to update task");
    } finally {
      setUpdating(false);
    }
  };

  const getPriorityColor = (priority: string) => {
    switch (priority.toLowerCase()) {
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

  const isOverdue = (dueDate: string, completed: boolean) => {
    if (!dueDate) return false;
    try {
      return !completed && new Date(dueDate) < new Date();
    } catch {
      return false;
    }
  };

  if (loading) {
    return (
      <AnimatedSection className="flex items-center justify-center h-64">
        <Loader2 className="h-12 w-12 animate-spin text-indigo-600" />
      </AnimatedSection>
    );
  }

  if (error) {
    return (
      <AnimatedSection className="flex flex-col items-center justify-center h-64 space-y-4">
        <AlertTriangle className="h-12 w-12 text-red-500" />
        <p className="text-lg text-center text-slate-800 dark:text-slate-200">
          {error}
        </p>
        <button
          onClick={() => router.push("/")}
          className="px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors"
        >
          Go to Home
        </button>
      </AnimatedSection>
    );
  }

  if (!task) {
    return (
      <AnimatedSection className="flex flex-col items-center justify-center h-64 space-y-4">
        <AlertTriangle className="h-12 w-12 text-amber-500" />
        <p className="text-lg text-center text-slate-800 dark:text-slate-200">
          Task not found
        </p>
        <button
          onClick={() => router.push("/")}
          className="px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors"
        >
          Go to Home
        </button>
      </AnimatedSection>
    );
  }

  const overdue = isOverdue(task.dueDate, task.completed);

  return (
    <AnimatedSection className="max-w-2xl mx-auto py-12 px-4 sm:px-6 lg:px-8">
      <div
        className={`p-8 rounded-3xl shadow-lg border ${
          isDarkMode
            ? "bg-slate-800 border-slate-700"
            : "bg-white border-slate-100"
        }`}
      >
        <h1
          className={`text-2xl sm:text-3xl font-light mb-6 text-center ${
            isDarkMode ? "text-white" : "text-slate-900"
          }`}
        >
          Task Update
        </h1>

        <div className="space-y-6">
          <div className="flex flex-col items-center">
            <button
              onClick={toggleTask}
              disabled={updating}
              className={`rounded-full border p-4 mb-4 ${
                task.completed
                  ? "bg-emerald-500 text-white border-emerald-600"
                  : "text-slate-700 border-slate-300"
              } ${updating ? "opacity-50 cursor-not-allowed" : "cursor-pointer"}`}
            >
              {updating ? (
                <Loader2 className="h-6 w-6 animate-spin" />
              ) : task.completed ? (
                <CheckSquare className="h-6 w-6" />
              ) : (
                <Square className="h-6 w-6" />
              )}
            </button>
            <p className="text-sm font-medium text-slate-600">
              {task.completed ? "Task completed!" : "Mark as completed"}
            </p>
            {success && (
              <p className="text-sm text-emerald-600 dark:text-emerald-400 mt-2">
                Status updated successfully!
              </p>
            )}
          </div>

          <div className="space-y-4">
            <div>
              <h2
                className={`text-xl font-medium mb-2 ${isDarkMode ? "text-white" : "text-slate-900"}`}
              >
                {task.title}
              </h2>
              <p
                className={`text-sm ${isDarkMode ? "text-slate-300" : "text-slate-600"}`}
              >
                {task.description}
              </p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <p className="text-sm font-medium text-slate-500 dark:text-slate-400 mb-1">
                  Assigned To
                </p>
                <p className={isDarkMode ? "text-white" : "text-slate-900"}>
                  {task.assignedTo || "Not assigned"}
                </p>
              </div>

              <div>
                <p className="text-sm font-medium text-slate-500 dark:text-slate-400 mb-1">
                  Due Date
                </p>
                <div className="flex items-center gap-2">
                  <Calendar className="h-4 w-4 text-slate-500 dark:text-slate-400" />
                  <p className={isDarkMode ? "text-white" : "text-slate-900"}>
                    {formattedDueDate || "Loading date..."}
                  </p>
                  {overdue && (
                    <span className="text-red-500 text-sm font-medium">
                      Overdue
                    </span>
                  )}
                </div>
              </div>

              <div>
                <p className="text-sm font-medium text-slate-500 dark:text-slate-400 mb-1">
                  Priority
                </p>
                <span
                  className={`${getPriorityColor(task.TaskPriority?.name || "low")} px-3 py-1 rounded-full text-sm`}
                >
                  {task.TaskPriority?.name || "No priority"}
                </span>
              </div>

              <div>
                <p className="text-sm font-medium text-slate-500 dark:text-slate-400 mb-1">
                  Category
                </p>
                <div className="flex items-center gap-2">
                  <span
                    className="w-3 h-3 rounded-full"
                    style={{ backgroundColor: task.TaskCategory.color }}
                  />
                  <p className={isDarkMode ? "text-white" : "text-slate-900"}>
                    {task.TaskCategory.name}
                  </p>
                </div>
              </div>

              {task.estimatedTime && (
                <div>
                  <p className="text-sm font-medium text-slate-500 dark:text-slate-400 mb-1">
                    Estimated Time
                  </p>
                  <p className={isDarkMode ? "text-white" : "text-slate-900"}>
                    {task.estimatedTime} hours
                  </p>
                </div>
              )}

              {task.email && (
                <div>
                  <p className="text-sm font-medium text-slate-500 dark:text-slate-400 mb-1">
                    Contact Email
                  </p>
                  <p className={isDarkMode ? "text-white" : "text-slate-900"}>
                    {task.email}
                  </p>
                </div>
              )}
            </div>

            {task.completed && task.completedAt && (
              <div>
                <p className="text-sm font-medium text-slate-500 dark:text-slate-400 mb-1">
                  Completed On
                </p>
                <div className="flex items-center gap-2">
                  <CheckSquare className="h-4 w-4 text-emerald-500" />
                  <p className={isDarkMode ? "text-white" : "text-slate-900"}>
                    {formattedCompletedAt || "Loading date..."}
                  </p>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </AnimatedSection>
  );
};

export default TaskUpdatePage;
