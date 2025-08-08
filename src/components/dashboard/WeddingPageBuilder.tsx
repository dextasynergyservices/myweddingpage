"use client";

import { useState, useCallback, useRef, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { DndProvider, useDrag, useDrop } from "react-dnd";
import { HTML5Backend } from "react-dnd-html5-backend";
import { useTheme } from "@/contexts/ThemeContext";
import Image from "next/image";
import {
  Layout,
  Image as ImageIcon,
  Calendar,
  Gift,
  MessageSquare,
  MapPin,
  Clock,
  Users,
  FileText,
  Plus,
  Trash2,
  Edit,
  Eye,
  Save,
  Smartphone,
  Monitor,
  Tablet,
  Copy,
  Download,
} from "lucide-react";

interface Component {
  id: string;
  type: string;
  name: string;
  icon: React.ComponentType<{ className?: string }>;
  content?: Record<string, unknown>;
  styles?: Record<string, string>;
}

interface DroppedComponent extends Component {
  position: number;
}

interface Template {
  id: string;
  name: string;
  preview: string;
  components: DroppedComponent[];
}

const ItemTypes = {
  COMPONENT: "component",
};

const DraggableComponent = ({
  component,
  onDragStart,
  onDragEnd,
}: {
  component: Component;
  onDragStart: () => void;
  onDragEnd: () => void;
}) => {
  const { isDarkMode } = useTheme();
  const ref = useRef<HTMLDivElement>(null);

  const [{ isDragging }, drag] = useDrag(() => ({
    type: ItemTypes.COMPONENT,
    item: () => {
      onDragStart();
      return component;
    },
    end: (_, monitor) => {
      if (monitor.didDrop()) {
        onDragEnd();
      }
    },
    collect: (monitor) => ({
      isDragging: monitor.isDragging(),
    }),
  }));

  useEffect(() => {
    if (ref.current) {
      drag(ref);
    }
  }, [ref, drag]);

  return (
    <motion.div
      ref={ref}
      whileHover={{ scale: 1.02 }}
      whileTap={{ scale: 0.98 }}
      className={`p-4 rounded-2xl border-2 border-dashed cursor-move transition-all duration-300 ${
        isDragging ? "opacity-50" : ""
      } ${
        isDarkMode
          ? "border-slate-600 hover:border-slate-500 bg-slate-700/30 hover:bg-slate-700/50"
          : "border-slate-300 hover:border-slate-400 bg-slate-50 hover:bg-slate-100"
      }`}
    >
      <div className="flex items-center gap-3">
        <div className="p-2 bg-gradient-to-r from-indigo-600 to-purple-600 rounded-lg">
          <component.icon className="h-5 w-5 text-white" />
        </div>
        <div>
          <h3 className={`font-medium ${isDarkMode ? "text-white" : "text-slate-900"}`}>
            {component.name}
          </h3>
          <p className={`text-xs ${isDarkMode ? "text-slate-400" : "text-slate-600"}`}>
            Drag to canvas
          </p>
        </div>
      </div>
    </motion.div>
  );
};

const DropZone = ({
  onDrop,
  isDragging,
  children,
}: {
  onDrop: (item: Component) => void;
  isDragging: boolean;
  children: React.ReactNode;
}) => {
  const { isDarkMode } = useTheme();

  const dropRef = useRef<HTMLDivElement | null>(null);

  const [{ isOver }, drop] = useDrop(() => ({
    accept: ItemTypes.COMPONENT,
    drop: (item: Component) => onDrop(item),
    collect: (monitor) => ({
      isOver: monitor.isOver(),
    }),
  }));

  useEffect(() => {
    if (dropRef.current) {
      drop(dropRef.current);
    }
  }, [drop]);

  return (
    <div
      ref={dropRef}
      className={`min-h-96 rounded-3xl border-2 border-dashed transition-all duration-300 ${
        isOver || isDragging
          ? "border-indigo-500 bg-indigo-50 dark:bg-indigo-900/20"
          : isDarkMode
            ? "border-slate-600 bg-slate-800/50"
            : "border-slate-300 bg-slate-50"
      }`}
    >
      {children}
    </div>
  );
};

const WeddingPageBuilder = () => {
  const { isDarkMode } = useTheme();
  const [droppedComponents, setDroppedComponents] = useState<DroppedComponent[]>([]);
  const [selectedComponent, setSelectedComponent] = useState<DroppedComponent | null>(null);
  const [previewMode, setPreviewMode] = useState<"desktop" | "tablet" | "mobile">("desktop");
  const [isDragging, setIsDragging] = useState(false);
  const [templates, setTemplates] = useState<Template[]>([
    {
      id: "classic",
      name: "Classic Wedding",
      preview:
        "https://images.pexels.com/photos/1024993/pexels-photo-1024993.jpeg?auto=compress&cs=tinysrgb&w=300",
      components: [],
    },
    {
      id: "modern",
      name: "Modern Elegance",
      preview:
        "https://images.pexels.com/photos/1444442/pexels-photo-1444442.jpeg?auto=compress&cs=tinysrgb&w=300",
      components: [],
    },
  ]);
  const [showTemplates, setShowTemplates] = useState(false);

  const availableComponents: Component[] = [
    { id: "hero", type: "hero", name: "Hero Section", icon: Layout },
    { id: "gallery", type: "gallery", name: "Photo Gallery", icon: ImageIcon },
    { id: "story", type: "story", name: "Love Story", icon: FileText },
    { id: "timeline", type: "timeline", name: "Event Timeline", icon: Calendar },
    { id: "rsvp", type: "rsvp", name: "RSVP Form", icon: Users },
    { id: "gifts", type: "gifts", name: "Gift Registry", icon: Gift },
    { id: "wishes", type: "wishes", name: "Guest Wishes", icon: MessageSquare },
    { id: "location", type: "location", name: "Location Map", icon: MapPin },
    { id: "countdown", type: "countdown", name: "Countdown", icon: Clock },
  ];

  const handleDrop = useCallback(
    (item: Component) => {
      const newComponent: DroppedComponent = {
        ...item,
        id: `${item.type}-${Date.now()}`,
        position: droppedComponents.length,
        content: getDefaultContent(item.type),
        styles: getDefaultStyles(),
      };
      setDroppedComponents((prev) => [...prev, newComponent]);
      setIsDragging(false);
    },
    [droppedComponents.length]
  );

  const getDefaultContent = (type: string): Record<string, unknown> => {
    switch (type) {
      case "hero":
        return { title: "John & Jane", subtitle: "June 15, 2024", venue: "Garden Valley Estate" };
      case "story":
        return { title: "Our Love Story", content: "Tell your beautiful love story here..." };
      case "countdown":
        return { targetDate: "2024-06-15T16:00:00" };
      default:
        return {};
    }
  };

  const getDefaultStyles = () => {
    return {
      backgroundColor: "#ffffff",
      textColor: "#1e293b",
      padding: "2rem",
      borderRadius: "1rem",
    };
  };

  const removeComponent = (id: string) => {
    setDroppedComponents((prev) => prev.filter((comp) => comp.id !== id));
    if (selectedComponent?.id === id) {
      setSelectedComponent(null);
    }
  };

  const duplicateComponent = (component: DroppedComponent) => {
    const newComponent: DroppedComponent = {
      ...component,
      id: `${component.type}-${Date.now()}`,
      position: droppedComponents.length,
    };
    setDroppedComponents((prev) => [...prev, newComponent]);
  };

  const saveAsTemplate = () => {
    const templateName = prompt("Enter template name:");
    if (templateName) {
      const newTemplate: Template = {
        id: `template-${Date.now()}`,
        name: templateName,
        preview:
          "https://images.pexels.com/photos/1024866/pexels-photo-1024866.jpeg?auto=compress&cs=tinysrgb&w=300",
        components: droppedComponents,
      };
      setTemplates((prev) => [...prev, newTemplate]);
    }
  };

  const loadTemplate = (template: Template) => {
    setDroppedComponents(template.components);
    setShowTemplates(false);
  };

  const updateComponentContent = (id: string, content: Record<string, unknown>) => {
    setDroppedComponents((prev) =>
      prev.map((comp) =>
        comp.id === id ? { ...comp, content: { ...comp.content, ...content } } : comp
      )
    );
  };

  const updateComponentStyles = (id: string, styles: Record<string, string>) => {
    setDroppedComponents((prev) =>
      prev.map((comp) =>
        comp.id === id ? { ...comp, styles: { ...comp.styles, ...styles } } : comp
      )
    );
  };

  const renderComponentPreview = (component: DroppedComponent) => {
    const baseClasses = `relative p-6 rounded-2xl border-2 border-dashed transition-all duration-300 cursor-pointer ${
      selectedComponent?.id === component.id
        ? "border-indigo-500 bg-indigo-50 dark:bg-indigo-900/20"
        : isDarkMode
          ? "border-slate-600 hover:border-slate-500 bg-slate-700/30"
          : "border-slate-300 hover:border-slate-400 bg-slate-50"
    }`;

    return (
      <motion.div
        key={component.id}
        layout
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: -20 }}
        className={baseClasses}
        onClick={() => setSelectedComponent(component)}
        style={{
          backgroundColor: component.styles?.backgroundColor,
          color: component.styles?.textColor,
          padding: component.styles?.padding,
          borderRadius: component.styles?.borderRadius,
        }}
      >
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-gradient-to-r from-indigo-600 to-purple-600 rounded-lg">
              <component.icon className="h-5 w-5 text-white" />
            </div>
            <h3 className={`font-medium ${isDarkMode ? "text-white" : "text-slate-900"}`}>
              {component.name}
            </h3>
          </div>
          <div className="flex gap-2">
            <button
              onClick={(e) => {
                e.stopPropagation();
                duplicateComponent(component);
              }}
              className="p-2 rounded-lg bg-green-600 text-white hover:bg-green-700 transition-colors"
            >
              <Copy className="h-4 w-4" />
            </button>
            <button
              onClick={(e) => {
                e.stopPropagation();
                setSelectedComponent(component);
              }}
              className="p-2 rounded-lg bg-blue-600 text-white hover:bg-blue-700 transition-colors"
            >
              <Edit className="h-4 w-4" />
            </button>
            <button
              onClick={(e) => {
                e.stopPropagation();
                removeComponent(component.id);
              }}
              className="p-2 rounded-lg bg-red-600 text-white hover:bg-red-700 transition-colors"
            >
              <Trash2 className="h-4 w-4" />
            </button>
          </div>
        </div>

        <div className={`text-sm ${isDarkMode ? "text-slate-400" : "text-slate-600"}`}>
          {renderComponentContent(component)}
        </div>
      </motion.div>
    );
  };

  const renderComponentContent = (component: DroppedComponent) => {
    switch (component.type) {
      case "hero":
        return (
          <div className="text-center">
            <h1 className="text-2xl font-bold mb-2">{"Wedding Title"}</h1>
            <p className="text-lg">{"Wedding Date"}</p>
            <p className="text-sm mt-2">{"Venue Location"}</p>
          </div>
        );
      case "story":
        return (
          <div>
            <h2 className="text-xl font-semibold mb-2">{"Our Story"}</h2>
            <p>{"Your love story goes here..."}</p>
          </div>
        );
      case "gallery":
        return (
          <div>
            <h2 className="text-xl font-semibold mb-2">Photo Gallery</h2>
            <div className="grid grid-cols-3 gap-2">
              {[1, 2, 3, 4, 5, 6].map((i) => (
                <div key={i} className="aspect-square bg-slate-200 dark:bg-slate-600 rounded"></div>
              ))}
            </div>
          </div>
        );
      case "countdown":
        return (
          <div className="text-center">
            <h2 className="text-xl font-semibold mb-4">Countdown to Our Wedding</h2>
            <div className="grid grid-cols-4 gap-4">
              {["Days", "Hours", "Minutes", "Seconds"].map((unit) => (
                <div key={unit} className="text-center">
                  <div className="text-2xl font-bold">00</div>
                  <div className="text-xs">{unit}</div>
                </div>
              ))}
            </div>
          </div>
        );
      default:
        return `${component.name} component preview`;
    }
  };

  const getPreviewWidth = () => {
    switch (previewMode) {
      case "mobile":
        return "max-w-sm";
      case "tablet":
        return "max-w-2xl";
      default:
        return "max-w-full";
    }
  };

  return (
    <DndProvider backend={HTML5Backend}>
      <div className="h-full flex flex-col">
        <div className="mb-6">
          <h1
            className={`text-3xl font-light mb-2 ${isDarkMode ? "text-white" : "text-slate-900"}`}
          >
            Wedding Page Builder
          </h1>
          <p className={`${isDarkMode ? "text-slate-400" : "text-slate-600"}`}>
            Create your perfect wedding page with drag & drop components
          </p>
        </div>

        <div className="flex-1 flex gap-8">
          <div
            className={`w-80 rounded-3xl p-6 shadow-lg border h-fit ${
              isDarkMode ? "bg-slate-800 border-slate-700" : "bg-white border-slate-100"
            }`}
          >
            <div className="flex items-center justify-between mb-6">
              <h2
                className={`text-xl font-semibold ${isDarkMode ? "text-white" : "text-slate-900"}`}
              >
                Components
              </h2>
              <button
                onClick={() => setShowTemplates(!showTemplates)}
                className="px-4 py-2 bg-indigo-600 text-white rounded-xl hover:bg-indigo-700 transition-colors text-sm"
              >
                Templates
              </button>
            </div>

            {showTemplates ? (
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <h3 className={`font-medium ${isDarkMode ? "text-white" : "text-slate-900"}`}>
                    Saved Templates
                  </h3>
                  <button
                    onClick={() => setShowTemplates(false)}
                    className="text-sm text-slate-500 hover:text-slate-700"
                  >
                    Back
                  </button>
                </div>
                {templates.map((template) => (
                  <div
                    key={template.id}
                    onClick={() => loadTemplate(template)}
                    className={`p-4 rounded-2xl border cursor-pointer transition-all duration-300 ${
                      isDarkMode
                        ? "border-slate-600 hover:border-slate-500 bg-slate-700/30"
                        : "border-slate-200 hover:border-slate-300 bg-slate-50"
                    }`}
                  >
                    <Image
                      src={template.preview}
                      alt={template.name}
                      width={300}
                      height={96}
                      className="w-full h-24 object-cover rounded-lg mb-3"
                    />
                    <h4 className={`font-medium ${isDarkMode ? "text-white" : "text-slate-900"}`}>
                      {template.name}
                    </h4>
                    <p className={`text-xs ${isDarkMode ? "text-slate-400" : "text-slate-600"}`}>
                      {template.components.length} components
                    </p>
                  </div>
                ))}
              </div>
            ) : (
              <div className="space-y-3">
                {availableComponents.map((component) => (
                  <DraggableComponent
                    key={component.id}
                    component={component}
                    onDragStart={() => setIsDragging(true)}
                    onDragEnd={() => setIsDragging(false)}
                  />
                ))}
              </div>
            )}
          </div>

          <div className="flex-1 flex flex-col">
            <div
              className={`flex items-center justify-between p-4 rounded-2xl mb-6 ${
                isDarkMode ? "bg-slate-800 border-slate-700" : "bg-white border-slate-200"
              } border shadow-lg`}
            >
              <div className="flex items-center gap-4">
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => setPreviewMode("desktop")}
                    className={`p-2 rounded-lg transition-colors hover:cursor-pointer ${
                      previewMode === "desktop"
                        ? "bg-indigo-600 text-white"
                        : isDarkMode
                          ? "text-slate-400 hover:text-white hover:bg-slate-700"
                          : "text-slate-600 hover:text-slate-900 hover:bg-slate-100"
                    }`}
                  >
                    <Monitor className="h-5 w-5" />
                  </button>
                  <button
                    onClick={() => setPreviewMode("tablet")}
                    className={`p-2 rounded-lg transition-colors hover:cursor-pointer ${
                      previewMode === "tablet"
                        ? "bg-indigo-600 text-white"
                        : isDarkMode
                          ? "text-slate-400 hover:text-white hover:bg-slate-700"
                          : "text-slate-600 hover:text-slate-900 hover:bg-slate-100"
                    }`}
                  >
                    <Tablet className="h-5 w-5" />
                  </button>
                  <button
                    onClick={() => setPreviewMode("mobile")}
                    className={`p-2 rounded-lg transition-colors hover:cursor-pointer ${
                      previewMode === "mobile"
                        ? "bg-indigo-600 text-white"
                        : isDarkMode
                          ? "text-slate-400 hover:text-white hover:bg-slate-700"
                          : "text-slate-600 hover:text-slate-900 hover:bg-slate-100"
                    }`}
                  >
                    <Smartphone className="h-5 w-5" />
                  </button>
                </div>
              </div>

              <div className="flex items-center gap-3">
                <button
                  onClick={saveAsTemplate}
                  className={`flex items-center gap-2 px-4 py-2 rounded-xl transition-colors hover:cursor-pointer ${
                    isDarkMode
                      ? "text-slate-400 hover:text-white hover:bg-slate-700"
                      : "text-slate-600 hover:text-slate-900 hover:bg-slate-100"
                  }`}
                >
                  <Download className="h-4 w-4" />
                  Save Template
                </button>
                <button className="flex items-center gap-2 px-4 py-2 bg-emerald-600 hover:cursor-pointer text-white rounded-xl hover:bg-emerald-700 transition-colors">
                  <Eye className="h-4 w-4" />
                  Preview
                </button>
                <button className="flex items-center gap-2 px-4 py-2 bg-indigo-600 hover:cursor-pointer text-white rounded-xl hover:bg-indigo-700 transition-colors">
                  <Save className="h-4 w-4" />
                  Save Page
                </button>
              </div>
            </div>

            <div className="flex-1">
              <div className={`mx-auto transition-all duration-300 ${getPreviewWidth()}`}>
                <DropZone onDrop={handleDrop} isDragging={isDragging}>
                  {droppedComponents.length === 0 ? (
                    <div className="flex flex-col items-center justify-center h-96 text-center">
                      <div
                        className={`p-6 rounded-full mb-4 ${
                          isDarkMode ? "bg-slate-700" : "bg-slate-200"
                        }`}
                      >
                        <Plus
                          className={`h-12 w-12 ${
                            isDarkMode ? "text-slate-400" : "text-slate-500"
                          }`}
                        />
                      </div>
                      <h3
                        className={`text-xl font-semibold mb-2 ${
                          isDarkMode ? "text-white" : "text-slate-900"
                        }`}
                      >
                        Start Building Your Wedding Page
                      </h3>
                      <p className={`${isDarkMode ? "text-slate-400" : "text-slate-600"}`}>
                        Drag components from the left panel to start building
                      </p>
                    </div>
                  ) : (
                    <div className="p-6 space-y-6">
                      <AnimatePresence>
                        {droppedComponents
                          .sort((a, b) => a.position - b.position)
                          .map((component) => renderComponentPreview(component))}
                      </AnimatePresence>
                    </div>
                  )}
                </DropZone>
              </div>
            </div>
          </div>

          <AnimatePresence>
            {selectedComponent && (
              <motion.div
                initial={{ width: 0, opacity: 0 }}
                animate={{ width: 320, opacity: 1 }}
                exit={{ width: 0, opacity: 0 }}
                className={`rounded-3xl p-6 shadow-lg border h-fit ${
                  isDarkMode ? "bg-slate-800 border-slate-700" : "bg-white border-slate-100"
                }`}
              >
                <div className="mb-6">
                  <h2
                    className={`text-xl font-semibold mb-2 ${
                      isDarkMode ? "text-white" : "text-slate-900"
                    }`}
                  >
                    Properties
                  </h2>
                  <p className={`text-sm ${isDarkMode ? "text-slate-400" : "text-slate-600"}`}>
                    Customize {selectedComponent.name}
                  </p>
                </div>

                <div className="space-y-6">
                  {selectedComponent.type === "hero" && (
                    <div>
                      <h3
                        className={`text-sm font-medium mb-3 ${
                          isDarkMode ? "text-slate-300" : "text-slate-700"
                        }`}
                      >
                        Content
                      </h3>
                      <div className="space-y-3">
                        <div>
                          <label
                            className={`block text-xs mb-1 ${
                              isDarkMode ? "text-slate-400" : "text-slate-600"
                            }`}
                          >
                            Couple Names
                          </label>
                          <input
                            type="text"
                            value={(selectedComponent.content?.title as string) || ""}
                            onChange={(e) =>
                              updateComponentContent(selectedComponent.id, {
                                title: e.target.value,
                              })
                            }
                            className={`w-full px-3 py-2 rounded-xl border transition-colors ${
                              isDarkMode
                                ? "bg-slate-700 border-slate-600 text-white"
                                : "bg-white border-slate-300 text-slate-900"
                            } focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500`}
                          />
                        </div>
                        <div>
                          <label
                            className={`block text-xs mb-1 ${
                              isDarkMode ? "text-slate-400" : "text-slate-600"
                            }`}
                          >
                            Wedding Date
                          </label>
                          <input
                            type="text"
                            value={(selectedComponent.content?.subtitle as string) || ""}
                            onChange={(e) =>
                              updateComponentContent(selectedComponent.id, {
                                subtitle: e.target.value,
                              })
                            }
                            className={`w-full px-3 py-2 rounded-xl border transition-colors ${
                              isDarkMode
                                ? "bg-slate-700 border-slate-600 text-white"
                                : "bg-white border-slate-300 text-slate-900"
                            } focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500`}
                          />
                        </div>
                        <div>
                          <label
                            className={`block text-xs mb-1 ${
                              isDarkMode ? "text-slate-400" : "text-slate-600"
                            }`}
                          >
                            Venue
                          </label>
                          <input
                            type="text"
                            value={(selectedComponent.content?.venue as string) || ""}
                            onChange={(e) =>
                              updateComponentContent(selectedComponent.id, {
                                venue: e.target.value,
                              })
                            }
                            className={`w-full px-3 py-2 rounded-xl border transition-colors ${
                              isDarkMode
                                ? "bg-slate-700 border-slate-600 text-white"
                                : "bg-white border-slate-300 text-slate-900"
                            } focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500`}
                          />
                        </div>
                      </div>
                    </div>
                  )}

                  <div>
                    <h3
                      className={`text-sm font-medium mb-3 ${
                        isDarkMode ? "text-slate-300" : "text-slate-700"
                      }`}
                    >
                      Styling
                    </h3>
                    <div className="space-y-3">
                      <div>
                        <label
                          className={`block text-xs mb-1 ${
                            isDarkMode ? "text-slate-400" : "text-slate-600"
                          }`}
                        >
                          Background Color
                        </label>
                        <div className="flex gap-2">
                          <input
                            type="color"
                            value={selectedComponent.styles?.backgroundColor || "#ffffff"}
                            onChange={(e) =>
                              updateComponentStyles(selectedComponent.id, {
                                backgroundColor: e.target.value,
                              })
                            }
                            className="w-12 h-8 rounded border"
                          />
                          <input
                            type="text"
                            value={selectedComponent.styles?.backgroundColor || "#ffffff"}
                            onChange={(e) =>
                              updateComponentStyles(selectedComponent.id, {
                                backgroundColor: e.target.value,
                              })
                            }
                            className={`flex-1 px-3 py-1 text-sm rounded border ${
                              isDarkMode
                                ? "bg-slate-700 border-slate-600 text-white"
                                : "bg-white border-slate-300 text-slate-900"
                            }`}
                          />
                        </div>
                      </div>
                      <div>
                        <label
                          className={`block text-xs mb-1 ${
                            isDarkMode ? "text-slate-400" : "text-slate-600"
                          }`}
                        >
                          Text Color
                        </label>
                        <div className="flex gap-2">
                          <input
                            type="color"
                            value={selectedComponent.styles?.textColor || "#1e293b"}
                            onChange={(e) =>
                              updateComponentStyles(selectedComponent.id, {
                                textColor: e.target.value,
                              })
                            }
                            className="w-12 h-8 rounded border"
                          />
                          <input
                            type="text"
                            value={selectedComponent.styles?.textColor || "#1e293b"}
                            onChange={(e) =>
                              updateComponentStyles(selectedComponent.id, {
                                textColor: e.target.value,
                              })
                            }
                            className={`flex-1 px-3 py-1 text-sm rounded border ${
                              isDarkMode
                                ? "bg-slate-700 border-slate-600 text-white"
                                : "bg-white border-slate-300 text-slate-900"
                            }`}
                          />
                        </div>
                      </div>
                    </div>
                  </div>

                  <div className="pt-4 border-t border-slate-200 dark:border-slate-700">
                    <div className="flex gap-2">
                      <button
                        onClick={() => duplicateComponent(selectedComponent)}
                        className="flex-1 flex items-center justify-center gap-2 px-4 py-2 bg-green-600 text-white rounded-xl hover:bg-green-700 transition-colors"
                      >
                        <Copy className="h-4 w-4" />
                        Duplicate
                      </button>
                      <button
                        onClick={() => removeComponent(selectedComponent.id)}
                        className="flex-1 flex items-center justify-center gap-2 px-4 py-2 bg-red-600 text-white rounded-xl hover:bg-red-700 transition-colors"
                      >
                        <Trash2 className="h-4 w-4" />
                        Remove
                      </button>
                    </div>
                  </div>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>
    </DndProvider>
  );
};

export default WeddingPageBuilder;
