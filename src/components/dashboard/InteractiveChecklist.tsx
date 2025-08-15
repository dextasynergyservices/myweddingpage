"use client";

import React, { useState, useEffect } from "react";
import { motion } from "framer-motion";
import {
  CheckSquare,
  Square,
  Calendar,
  User,
  AlertTriangle,
  CheckCircle,
  Users,
  Plus,
  Boxes,
  X,
  Edit,
  Trash2,
} from "lucide-react";
import { useTheme } from "@/contexts/ThemeContext";
import AnimatedSection from "@/components/AnimatedSection";
import { useSession } from "next-auth/react";
import toast from "react-hot-toast";

interface ChecklistItem {
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
  };
  dueDate: string;
  assignedTo: string | null;
  completed: boolean;
  completedAt: string | null;
  estimatedTime: number | null;
  phone: string | null;
  email: string | null;
  token: string;
}

interface TaskCategory {
  id: string;
  name: string;
  color: string;
  icon: string;
}

interface TaskPriority {
  id: string;
  name: string;
  level: number;
  color?: string;
}

interface NotificationPayload {
  to: string;
  subject?: string;
  html?: string;
  body?: string;
}

const InteractiveChecklist = () => {
  const { isDarkMode } = useTheme();
  const { data: session } = useSession();

  const [tasks, setTasks] = useState<ChecklistItem[]>([]);
  const [categories, setCategories] = useState<TaskCategory[]>([]);
  const [priorities, setPriorities] = useState<TaskPriority[]>([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editingTask, setEditingTask] = useState<ChecklistItem | null>(null);
  const [taskLoading, setTaskLoading] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const [newTask, setNewTask] = useState({
    title: "",
    description: "",
    TaskCategoryId: categories[0]?.id || "",
    TaskPriorityId: priorities.find((p) => p.name === "Medium")?.id || "",
    dueDate: "",
    assignedTo: "",
    phone: "",
    email: "",
    estimatedTime: 1,
  });

  // Fetch data from API
  useEffect(() => {
    const fetchData = async () => {
      try {
        const [tasksRes, categoriesRes, prioritiesRes] = await Promise.all([
          fetch("/api/tasks").then((res) => {
            if (!res.ok) throw new Error(`Tasks API failed with status ${res.status}`);
            return res.json();
          }),
          fetch("/api/task-categories").then((res) => {
            if (!res.ok) throw new Error(`Categories API failed with status ${res.status}`);
            return res.json();
          }),
          fetch("/api/task-priorities").then((res) => {
            if (!res.ok) throw new Error(`Priorities API failed with status ${res.status}`);
            return res.json();
          }),
        ]);

        setTasks(tasksRes);
        setCategories(categoriesRes);
        setPriorities(prioritiesRes);

        if (categoriesRes.length > 0 && prioritiesRes.length > 0) {
          setNewTask((prev) => ({
            ...prev,
            TaskCategoryId: categoriesRes[0].id,
            TaskPriorityId:
              prioritiesRes.find((p: TaskPriority) => p.name === "Medium")?.id ||
              prioritiesRes[0].id,
          }));
        }
      } catch (error) {
        console.error("Failed to fetch data:", error);
        setError(error instanceof Error ? error.message : "Failed to fetch data");
        toast.error("Failed to load tasks");
        setTasks([]);
        setCategories([]);
        setPriorities([]);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  const [selectedCategory, setSelectedCategory] = useState("all");
  const [selectedPriority, setSelectedPriority] = useState("all");
  const [searchQuery, setSearchQuery] = useState("");
  const [showCompleted, setShowCompleted] = useState(true);

  const toggleTask = async (taskIdOrToken: string) => {
    setTaskLoading(taskIdOrToken);
    setError(null);

    try {
      const taskToUpdate = tasks.find(
        (task) => task.id === taskIdOrToken || task.token === taskIdOrToken
      );
      if (!taskToUpdate) {
        setError("Task not found");
        toast.error("Task not found");
        return;
      }

      const updatedTask = {
        ...taskToUpdate,
        completed: !taskToUpdate.completed,
        completedAt: !taskToUpdate.completed ? new Date().toISOString() : null,
      };

      // Use the token in the API call if available, otherwise fall back to ID
      const identifier = taskToUpdate.token || taskToUpdate.id;

      const response = await fetch(`/api/tasks/${identifier}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          completed: updatedTask.completed,
          completedAt: updatedTask.completedAt,
        }),
      });

      if (!response.ok) {
        throw new Error(`Failed to update task: ${response.status}`);
      }

      const updatedTaskData = await response.json();
      setTasks(
        tasks.map((task) =>
          task.id === updatedTaskData.id || task.token === updatedTaskData.token
            ? updatedTaskData
            : task
        )
      );

      toast.success(`Task marked as ${updatedTask.completed ? "completed" : "incomplete"}!`, {
        icon: updatedTask.completed ? (
          <CheckCircle className="text-green-500" />
        ) : (
          <Square className="text-blue-500" />
        ),
      });
    } catch (error) {
      console.error("Failed to update task:", error);
      setError(error instanceof Error ? error.message : "Failed to update task");
      toast.error("Failed to update task status");
    } finally {
      setTaskLoading(null);
    }
  };

  const deleteTask = async (taskIdOrToken: string) => {
    setTaskLoading(`delete-${taskIdOrToken}`);
    try {
      const taskToDelete = tasks.find(
        (task) => task.id === taskIdOrToken || task.token === taskIdOrToken
      );
      if (!taskToDelete) {
        throw new Error("Task not found");
      }

      // Use the token in the API call if available, otherwise fall back to ID
      const identifier = taskToDelete.token || taskToDelete.id;

      const response = await fetch(`/api/tasks/${identifier}`, {
        method: "DELETE",
      });

      if (!response.ok) {
        throw new Error(`Failed to delete task: ${response.status}`);
      }

      setTasks(tasks.filter((task) => task.id !== taskIdOrToken && task.token !== taskIdOrToken));
      toast.success("Task deleted successfully!", {
        icon: <CheckCircle className="text-green-500" />,
      });
    } catch (error) {
      console.error("Failed to delete task:", error);
      toast.error("Failed to delete task");
    } finally {
      setTaskLoading(null);
    }
  };

  const sendTaskNotification = async (task: ChecklistItem, isUpdate = false) => {
    const sendNotification = async (
      endpoint: string,
      payload: NotificationPayload,
      serviceName: string
    ) => {
      try {
        const response = await fetch(endpoint, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(payload),
        });

        if (!response.ok) {
          const errorData = await response.json().catch(() => ({}));
          throw new Error(
            errorData.error || response.statusText || `Failed to send ${serviceName}`
          );
        }

        return await response.json();
      } catch (error) {
        console.error(`${serviceName} error:`, error);
        throw error;
      }
    };

    try {
      // Email Notification
      if (task.email && /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(task.email)) {
        await sendNotification(
          "/api/send-task-email",
          {
            to: task.email,
            subject: `${isUpdate ? "Updated" : "New"} Task: ${task.title}`,
            html: `
            <h1>${isUpdate ? "Task Updated" : "New Task Assigned"}</h1>
            <p><strong>Title:</strong> ${task.title}</p>
            <p><strong>Description:</strong> ${task.description || "No description"}</p>
            <p><strong>Due Date:</strong> ${new Date(task.dueDate).toLocaleDateString()}</p>
            <p><strong>Priority:</strong> ${task.TaskPriority?.name || "Not specified"}</p>
            <p>Click <a href="${process.env.NEXT_PUBLIC_APP_URL}/task/${task.token}">here</a> to view the task.</p>
          `,
          },
          "email"
        );
      }

      // WhatsApp Notification
      if (task.phone && /^\+?[1-9]\d{1,14}$/.test(task.phone)) {
        await sendNotification(
          "/api/send-task-whatsapp",
          {
            to: task.phone,
            body:
              `${isUpdate ? "Updated" : "New"} Task: ${task.title}\n\n` +
              `Description: ${task.description || "None"}\n` +
              `Due: ${new Date(task.dueDate).toLocaleDateString()}\n` +
              `Priority: ${task.TaskPriority?.name || "Not specified"}\n\n` +
              `View: ${process.env.NEXT_PUBLIC_APP_URL}/task/${task.token}`,
          },
          "WhatsApp"
        );
      }
    } catch (error) {
      console.error("Notification error:", error);
      toast.error(
        `Task ${isUpdate ? "updated" : "created"} successfully, but notifications failed.\n` +
          (error instanceof Error ? error.message : "Notification service error"),
        {
          icon: <AlertTriangle className="text-yellow-500" />,
        }
      );
    }
  };

  const createTask = async () => {
    setTaskLoading("new");
    setError(null);

    try {
      const response = await fetch("/api/tasks", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          ...newTask,
          userId: session?.user?.id,
        }),
      });

      if (!response.ok) {
        throw new Error(`Failed to create task: ${response.status}`);
      }

      const createdTask = await response.json();
      setTasks([...tasks, createdTask]);
      setShowModal(false);
      resetNewTask();

      // Send notifications in background without waiting
      sendTaskNotification(createdTask).catch((e) => {
        console.error("Background notification error:", e);
      });

      toast.success("Task created successfully!", {
        icon: <CheckCircle className="text-green-500" />,
      });
    } catch (error) {
      console.error("Failed to create task:", error);
      setError(error instanceof Error ? error.message : "Failed to create task");
      toast.error("Failed to create task");
    } finally {
      setTaskLoading(null);
    }
  };

  const updateTask = async () => {
    if (!editingTask) return;

    setTaskLoading(editingTask.id);
    setError(null);

    try {
      const response = await fetch(`/api/tasks/${editingTask.id}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          title: editingTask.title,
          description: editingTask.description,
          TaskCategoryId: editingTask.TaskCategory.id,
          TaskPriorityId: editingTask.TaskPriority.id,
          dueDate: editingTask.dueDate,
          assignedTo: editingTask.assignedTo,
          phone: editingTask.phone,
          email: editingTask.email,
          estimatedTime: editingTask.estimatedTime,
          completed: editingTask.completed,
        }),
      });

      if (!response.ok) {
        throw new Error(`Failed to update task: ${response.status}`);
      }

      const updatedTask = await response.json();
      setTasks(tasks.map((task) => (task.id === updatedTask.id ? updatedTask : task)));
      setEditingTask(null);
      setShowModal(false);

      // Send notifications after successful update
      await sendTaskNotification(updatedTask, true);

      toast.success("Task updated successfully!", {
        icon: <CheckCircle className="text-green-500" />,
      });
    } catch (error) {
      console.error("Failed to update task:", error);
      setError(error instanceof Error ? error.message : "Failed to update task");
      toast.error("Failed to update task");
    } finally {
      setTaskLoading(null);
    }
  };

  const resetNewTask = () => {
    setNewTask({
      title: "",
      description: "",
      TaskCategoryId: categories[0]?.id || "",
      TaskPriorityId: priorities.find((p) => p.name === "Medium")?.id || "",
      dueDate: "",
      assignedTo: "",
      phone: "",
      email: "",
      estimatedTime: 1,
    });
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

  const getCategoryIcon = (categoryId: string) => {
    const category = categories.find((c) => c.id === categoryId);
    if (!category) return Boxes;

    const iconMap: Record<string, React.ComponentType> = {
      calendar: Calendar,
      user: User,
      users: Users,
      boxes: Boxes,
      checkSquare: CheckSquare,
      alertTriangle: AlertTriangle,
      checkCircle: CheckCircle,
    };

    return iconMap[category.icon] || Boxes;
  };

  const isOverdue = (dueDate: string, completed: boolean) =>
    !completed && new Date(dueDate) < new Date();

  const filteredTasks = tasks.filter((task) => {
    const matchesCategory = selectedCategory === "all" || task.TaskCategory.id === selectedCategory;
    const matchesPriority = selectedPriority === "all" || task.TaskPriority.id === selectedPriority;
    const matchesSearch =
      task.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (task.description && task.description.toLowerCase().includes(searchQuery.toLowerCase()));
    const matchesCompletion = showCompleted || !task.completed;

    return matchesCategory && matchesPriority && matchesSearch && matchesCompletion;
  });

  const completedTasks = tasks.filter((t) => t.completed).length;
  const overdueTasks = tasks.filter((t) => isOverdue(t.dueDate, t.completed)).length;
  const totalTasks = tasks.length;

  if (loading) {
    return (
      <AnimatedSection className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-indigo-500"></div>
      </AnimatedSection>
    );
  }

  return (
    <AnimatedSection className="space-y-12">
      {/* Header with Add Task button */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 sm:gap-6">
        <div>
          <h1
            className={`text-2xl sm:text-3xl font-light mb-1 sm:mb-2 ${isDarkMode ? "text-white" : "text-slate-900"}`}
          >
            Wedding Checklist
          </h1>
          <p className={`text-sm sm:text-base ${isDarkMode ? "text-slate-400" : "text-slate-600"}`}>
            Track tasks, mark progress, and keep your big day stress-free.
          </p>
        </div>
        <div className="flex justify-end">
          <button
            onClick={() => {
              setEditingTask(null);
              setShowModal(true);
            }}
            className="w-full sm:w-auto flex items-center justify-center gap-2 px-4 py-2 sm:px-6 sm:py-3 bg-gradient-to-r from-indigo-600 to-purple-600 text-white rounded-xl sm:rounded-2xl hover:shadow-lg transition-all duration-300 hover:opacity-90 cursor-pointer"
          >
            <Plus className="h-4 sm:h-5 w-4 sm:w-5" />
            <span>Add New Task</span>
          </button>
        </div>
      </div>

      {/* Stats Cards */}
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
          {priorities.map((p) => (
            <option key={p.id} value={p.id}>
              {p.name}
            </option>
          ))}
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

      {/* Tasks List */}
      <div className="space-y-6">
        {filteredTasks.map((task) => {
          const overdue = isOverdue(task.dueDate, task.completed);
          const CategoryIcon = getCategoryIcon(task.TaskCategory.id);
          const isTaskLoading = taskLoading === task.id;
          const isDeleting = taskLoading === `delete-${task.id}`;

          return (
            <motion.div
              key={task.id}
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 }}
              className={`p-5 rounded-2xl shadow-md border flex justify-between items-start ${
                isDarkMode ? "bg-slate-800 border-slate-700" : "bg-white border-slate-100"
              } ${isTaskLoading ? "opacity-70" : ""}`}
            >
              <div className="flex items-start gap-4 w-full">
                <button
                  onClick={() => !isTaskLoading && toggleTask(task.id)}
                  disabled={isTaskLoading}
                  className={`rounded-full border p-2 ${
                    task.completed
                      ? "bg-emerald-500 text-white border-emerald-600"
                      : "text-slate-400 border-slate-300"
                  } ${isTaskLoading ? "cursor-not-allowed" : "cursor-pointer"}`}
                >
                  {isTaskLoading ? (
                    <div className="animate-spin h-4 w-4 border-t-2 border-b-2 border-white rounded-full" />
                  ) : task.completed ? (
                    <CheckSquare />
                  ) : (
                    <Square />
                  )}
                </button>
                <div className="flex-1">
                  <div className="flex justify-between items-start">
                    <h3
                      className={`text-lg font-medium ${isDarkMode ? "text-white" : "text-slate-900"}`}
                    >
                      {task.title}
                    </h3>
                    <div className="flex gap-2">
                      <button
                        onClick={() => {
                          setEditingTask(task);
                          setShowModal(true);
                        }}
                        disabled={isDeleting}
                        className="text-slate-500 hover:text-indigo-600 dark:hover:text-indigo-400 disabled:opacity-50"
                      >
                        <Edit className="h-4 w-4" />
                      </button>
                      <button
                        onClick={() => !isDeleting && deleteTask(task.id)}
                        disabled={isDeleting}
                        className="text-red-500 hover:text-red-700 dark:hover:text-red-400 disabled:opacity-50"
                      >
                        {isDeleting ? (
                          <div className="animate-spin h-4 w-4 border-t-2 border-b-2 border-red-500 rounded-full" />
                        ) : (
                          <Trash2 className="h-4 w-4" />
                        )}
                      </button>
                    </div>
                  </div>
                  {task.description && (
                    <p className="text-sm text-muted-foreground mb-2">{task.description}</p>
                  )}
                  <div className="flex flex-wrap gap-2 text-xs items-center">
                    <span
                      className={`${getPriorityColor(task.TaskPriority.name)} px-2 py-1 rounded-full`}
                    >
                      Priority: {task.TaskPriority.name}
                    </span>
                    <span className="text-muted-foreground">
                      Due: {new Date(task.dueDate).toLocaleDateString()}
                    </span>
                    {overdue && !task.completed && (
                      <span className="text-red-500 font-medium">Overdue</span>
                    )}
                    <span className="text-muted-foreground">
                      Assigned: {task.assignedTo || "Unassigned"}
                    </span>
                    {task.estimatedTime && (
                      <span className="text-muted-foreground">Est: {task.estimatedTime}h</span>
                    )}
                  </div>
                </div>
              </div>

              <div className="flex items-center gap-2 text-xs text-muted-foreground">
                <CategoryIcon className="w-4 h-4" />
                <span>{task.TaskCategory.name}</span>
              </div>
            </motion.div>
          );
        })}
        {filteredTasks.length === 0 && (
          <p className="text-center text-sm text-muted-foreground">No tasks found.</p>
        )}
      </div>

      {/* Task Modal */}
      {(showModal || editingTask) && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4 overflow-y-auto">
          <div
            className={`bg-white dark:bg-slate-800 p-6 rounded-2xl w-full max-w-md max-h-[90vh] overflow-y-auto ${
              isDarkMode ? "dark-scrollbar" : "light-scrollbar"
            }`}
          >
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-lg font-semibold text-slate-800 dark:text-white">
                {editingTask ? "Edit Task" : "Add New Task"}
              </h2>
              <button
                onClick={() => {
                  setShowModal(false);
                  setEditingTask(null);
                }}
                className="text-slate-500 hover:text-slate-700 dark:hover:text-slate-300"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium mb-1 dark:text-slate-300">
                  Task Title*
                </label>
                <input
                  type="text"
                  placeholder="Task Title"
                  value={editingTask ? editingTask.title : newTask.title}
                  onChange={(e) =>
                    editingTask
                      ? setEditingTask({ ...editingTask, title: e.target.value })
                      : setNewTask({ ...newTask, title: e.target.value })
                  }
                  className="w-full rounded-md border px-3 py-2 text-sm dark:bg-slate-700 dark:border-slate-600 dark:text-white"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium mb-1 dark:text-slate-300">
                  Description
                </label>
                <textarea
                  placeholder="Task Description"
                  value={editingTask ? editingTask.description || "" : newTask.description}
                  onChange={(e) =>
                    editingTask
                      ? setEditingTask({ ...editingTask, description: e.target.value })
                      : setNewTask({ ...newTask, description: e.target.value })
                  }
                  className="w-full h-24 resize-none rounded-md border px-3 py-2 text-sm dark:bg-slate-700 dark:border-slate-600 dark:text-white"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium mb-1 dark:text-slate-300">
                    Category*
                  </label>
                  <select
                    value={editingTask ? editingTask.TaskCategory.id : newTask.TaskCategoryId}
                    onChange={(e) =>
                      editingTask
                        ? setEditingTask({
                            ...editingTask,
                            TaskCategory:
                              categories.find((c) => c.id === e.target.value) ||
                              editingTask.TaskCategory,
                          })
                        : setNewTask({ ...newTask, TaskCategoryId: e.target.value })
                    }
                    className="w-full rounded-md border px-3 py-2 text-sm dark:bg-slate-700 dark:border-slate-600 dark:text-white"
                    required
                  >
                    {categories.map((cat) => (
                      <option key={cat.id} value={cat.id}>
                        {cat.name}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium mb-1 dark:text-slate-300">
                    Priority*
                  </label>
                  <select
                    value={editingTask ? editingTask.TaskPriority.id : newTask.TaskPriorityId}
                    onChange={(e) =>
                      editingTask
                        ? setEditingTask({
                            ...editingTask,
                            TaskPriority:
                              priorities.find((p) => p.id === e.target.value) ||
                              editingTask.TaskPriority,
                          })
                        : setNewTask({ ...newTask, TaskPriorityId: e.target.value })
                    }
                    className="w-full rounded-md border px-3 py-2 text-sm dark:bg-slate-700 dark:border-slate-600 dark:text-white"
                    required
                  >
                    {priorities.map((p) => (
                      <option key={p.id} value={p.id}>
                        {p.name}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium mb-1 dark:text-slate-300">
                  Due Date*
                </label>
                <input
                  type="date"
                  value={editingTask ? editingTask.dueDate.split("T")[0] : newTask.dueDate}
                  onChange={(e) =>
                    editingTask
                      ? setEditingTask({ ...editingTask, dueDate: e.target.value })
                      : setNewTask({ ...newTask, dueDate: e.target.value })
                  }
                  className="w-full rounded-md border px-3 py-2 text-sm dark:bg-slate-700 dark:border-slate-600 dark:text-white"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium mb-1 dark:text-slate-300">
                  Assigned To
                </label>
                <input
                  type="text"
                  placeholder="Name"
                  value={editingTask ? editingTask.assignedTo || "" : newTask.assignedTo}
                  onChange={(e) =>
                    editingTask
                      ? setEditingTask({ ...editingTask, assignedTo: e.target.value || null })
                      : setNewTask({ ...newTask, assignedTo: e.target.value })
                  }
                  className="w-full rounded-md border px-3 py-2 text-sm dark:bg-slate-700 dark:border-slate-600 dark:text-white"
                />
              </div>

              <div>
                <label className="block text-sm font-medium mb-1 dark:text-slate-300">
                  Phone (for WhatsApp)
                </label>
                <input
                  type="tel"
                  placeholder="Phone Number"
                  value={editingTask ? editingTask.phone || "" : newTask.phone}
                  onChange={(e) =>
                    editingTask
                      ? setEditingTask({ ...editingTask, phone: e.target.value || null })
                      : setNewTask({ ...newTask, phone: e.target.value })
                  }
                  className="w-full rounded-md border px-3 py-2 text-sm dark:bg-slate-700 dark:border-slate-600 dark:text-white"
                />
              </div>

              <div>
                <label className="block text-sm font-medium mb-1 dark:text-slate-300">
                  Email (for notifications)
                </label>
                <input
                  type="email"
                  placeholder="Email"
                  value={editingTask ? editingTask.email || "" : newTask.email}
                  onChange={(e) =>
                    editingTask
                      ? setEditingTask({ ...editingTask, email: e.target.value || null })
                      : setNewTask({ ...newTask, email: e.target.value })
                  }
                  className="w-full rounded-md border px-3 py-2 text-sm dark:bg-slate-700 dark:border-slate-600 dark:text-white"
                />
              </div>

              <div>
                <label className="block text-sm font-medium mb-1 dark:text-slate-300">
                  Estimated Time (hours)
                </label>
                <input
                  type="number"
                  min="1"
                  value={editingTask ? editingTask.estimatedTime || "" : newTask.estimatedTime}
                  onChange={(e) =>
                    editingTask
                      ? setEditingTask({
                          ...editingTask,
                          estimatedTime: parseInt(e.target.value) || null,
                        })
                      : setNewTask({ ...newTask, estimatedTime: parseInt(e.target.value) || 1 })
                  }
                  className="w-full rounded-md border px-3 py-2 text-sm dark:bg-slate-700 dark:border-slate-600 dark:text-white"
                />
              </div>
            </div>

            {error && (
              <div className="mt-4 p-3 bg-red-100 dark:bg-red-900/30 text-red-600 dark:text-red-400 rounded-md">
                {error}
              </div>
            )}

            <div className="flex justify-end gap-3 mt-6">
              <button
                onClick={() => {
                  setShowModal(false);
                  setEditingTask(null);
                }}
                disabled={!!taskLoading}
                className={`text-sm px-4 py-2 rounded-xl border ${
                  isDarkMode ? "border-slate-600" : "border-slate-300"
                } ${taskLoading ? "opacity-50 cursor-not-allowed" : ""}`}
              >
                Cancel
              </button>
              <button
                onClick={editingTask ? updateTask : createTask}
                disabled={!!taskLoading}
                className={`bg-gradient-to-r from-indigo-600 to-purple-600 text-white px-4 py-2 rounded-xl text-sm transition duration-300 ${
                  taskLoading ? "opacity-70 cursor-not-allowed" : "hover:opacity-90 cursor-pointer"
                }`}
              >
                {taskLoading ? (
                  <div className="flex items-center gap-2">
                    <div className="animate-spin rounded-full h-4 w-4 border-t-2 border-b-2 border-white"></div>
                    {editingTask ? "Updating..." : "Creating..."}
                  </div>
                ) : editingTask ? (
                  "Update Task"
                ) : (
                  "Assign Task"
                )}
              </button>
            </div>
          </div>
        </div>
      )}
    </AnimatedSection>
  );
};

export default InteractiveChecklist;
