"use client";

import { useState, useEffect } from "react";
import EditorSidebar from "../../components/editor/sidebar/EditorSidebar";
import EditorCanvas from "../../components/editor/canvas/EditorCanvas";
import EditorSettings from "../../components/editor/settings/EditorSettings";
import TemplateManager from "../../components/editor/manager/TemplateManager";
import {
  X,
  Save,
  Send,
  Download,
  Smartphone,
  Layout,
  Eye,
  LayoutTemplate,
  Sparkles,
  Settings2,
  Palette,
  ArrowLeft,
} from "lucide-react";
import { toast } from "react-toastify";
import { convertToHTML } from "../../../../utils/convertToHTML";

// Update the EmailEditor to accept template prop
export default function EmailEditor({ template: initialTemplate, onClose }) {
  const [selectedDevice, setSelectedDevice] = useState("Desktop");
  const [selectedLayout, setSelectedLayout] = useState("Column");
  const [selectedTemplate, setSelectedTemplate] = useState(initialTemplate || null);
  const [canvasItems, setCanvasItems] = useState([]);
  const [layoutRows, setLayoutRows] = useState([]);
  const [nextId, setNextId] = useState(1);
  const [lastSaved, setLastSaved] = useState(null);
  const [selectedElement, setSelectedElement] = useState(null);
  const [saving, setSaving] = useState(false);
  
  // Hide template sidebar when editing a specific template
  const [showTemplateSidebar, setShowTemplateSidebar] = useState(!initialTemplate);

  useEffect(() => {
    // If initialTemplate is provided, load it immediately
    if (initialTemplate?.json) {
      try {
        const parsed = JSON.parse(initialTemplate.json);
        setCanvasItems(parsed.canvasItems || []);
        setLayoutRows(parsed.layoutRows || []);
        setNextId(parsed.nextId || 1);
        setLastSaved(initialTemplate.updatedAt);
        toast.success("Template loaded successfully");
      } catch (err) {
        console.error("Error parsing template JSON:", err);
        toast.error("Failed to load template");
      }
    } else if (selectedTemplate?.json) {
      try {
        const parsed = JSON.parse(selectedTemplate.json);
        setCanvasItems(parsed.canvasItems || []);
        setLayoutRows(parsed.layoutRows || []);
        setNextId(parsed.nextId || 1);
        setLastSaved(selectedTemplate.updatedAt);
        toast.success("Template loaded successfully");
      } catch (err) {
        console.error("Error parsing template JSON:", err);
        toast.error("Failed to load template");
      }
    } else {
      setCanvasItems([]);
      setLayoutRows([]);
      setNextId(1);
    }
  }, [selectedTemplate, initialTemplate]);

  
  // In the EmailEditor component, update the handleSave function:
const handleSave = async () => {
  const templateToSave = selectedTemplate || initialTemplate;
  
  if (!templateToSave) {
    toast.error("Please select a template first!");
    return;
  }

  setSaving(true);
  try {
    const jsonData = JSON.stringify({ canvasItems, layoutRows, nextId });
    const html = convertToHTML({
      canvasItems,
      layoutRows,
      mode: "email",
    });

    const response = await fetch("/api/email-templates", {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        id: templateToSave.id,
        name: templateToSave.name,
        html,
        json: jsonData,
      }),
    });

    if (!response.ok) throw new Error("Failed to save template");

    const result = await response.json();
    
    setLastSaved(new Date().toISOString());
    toast.success("Template saved successfully!");
    
    // If this is a modal editor, close it and trigger refresh
    if (onClose) {
      // Pass true to indicate refresh is needed
      setTimeout(() => onClose(true), 1000);
    }
    
    return result; // Return the result for potential use
  } catch (err) {
    console.error("Error saving template:", err);
    toast.error("Failed to save template");
    throw err; // Re-throw to handle in caller if needed
  } finally {
    setSaving(false);
  }
};


  const handleLayoutSelect = (layout) => {
    setSelectedLayout(layout);
  };

  const handleDeviceSelect = (device) => {
    setSelectedDevice(device);
  };

  const handleDragOver = (e) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = "copy";
  };

  const handleDrop = (e, targetIndex = null, position = "end") => {
    e.preventDefault();

    try {
      if (e.target.closest("[data-column-dropzone]")) {
        return;
      }

      const data = JSON.parse(e.dataTransfer.getData("application/json"));

      if (data.type === "layout") {
        const columns = parseInt(data.name.split(" ")[0]) || 1;
        addLayoutRow(columns, targetIndex, position);
      } else if (data.type && data.name) {
        const newItem = {
          id: nextId,
          name: data.name,
          type: data.type,
          content: getDefaultContent(data.name),
          fontSize: "16px",
          color: "#000000",
          backgroundColor: "#ffffff",
          buttonColor: "#8B5CF6",
          buttonShape: "rounded-lg",
          buttonUrl: "",
          alignment: "left",
          dividerStyle: data.name === "Divider" ? "single" : undefined,
          fontStyles: [],
          fontFamily: "",
        };

        if (position === "left" || position === "right") {
          const newRow = {
            id: nextId + 1,
            columns: 2,
            elements: {},
          };

          const columnId1 = `${newRow.id}-col-1`;
          const columnId2 = `${newRow.id}-col-2`;

          if (position === "left") {
            newRow.elements[columnId1] = [newItem];
            newRow.elements[columnId2] = [canvasItems[targetIndex]];
          } else {
            newRow.elements[columnId1] = [canvasItems[targetIndex]];
            newRow.elements[columnId2] = [newItem];
          }

          setCanvasItems((prev) =>
            prev.filter((_, index) => index !== targetIndex)
          );
          setLayoutRows((prev) => [...prev, newRow]);
          setNextId((prev) => prev + 2);
        } else {
          setCanvasItems((prev) => {
            const newItems = [...prev];
            if (targetIndex !== null && position === "above") {
              newItems.splice(targetIndex, 0, newItem);
            } else if (targetIndex !== null && position === "below") {
              newItems.splice(targetIndex + 1, 0, newItem);
            } else {
              newItems.push(newItem);
            }
            return newItems;
          });
          setNextId((prev) => prev + 1);
        }
      }
    } catch (error) {
      console.error("Error processing dropped item:", error);
      toast.error("Failed to add element");
    }
  };

  const addLayoutRow = (columns, targetIndex = null, position = "end") => {
    const newRow = {
      id: nextId,
      columns: columns,
      elements: {},
    };

    setLayoutRows((prev) => {
      const newRows = [...prev];
      if (targetIndex !== null && position === "above") {
        newRows.splice(targetIndex, 0, newRow);
      } else if (targetIndex !== null && position === "below") {
        newRows.splice(targetIndex + 1, 0, newRow);
      } else {
        newRows.push(newRow);
      }
      return newRows;
    });
    setNextId((prev) => prev + 1);
  };

  const handleColumnDrop = (rowId, columnId, event) => {
    try {
      const dataString = event.dataTransfer.getData("application/json");
      if (dataString) {
        const data = JSON.parse(dataString);

        if (data.type && data.name) {
          const newElement = {
            id: nextId,
            name: data.name,
            type: data.type,
            content: getDefaultContent(data.name),
            fontSize: "16px",
            color: "#000000",
            backgroundColor: "#ffffff",
            buttonColor: "#8B5CF6",
            buttonShape: "rounded-lg",
            buttonUrl: "",
            alignment: "left",
            dividerStyle: data.name === "Divider" ? "single" : undefined,
            fontStyles: [],
            fontFamily: "",
          };

          setLayoutRows((prev) =>
            prev.map((row) => {
              if (row.id === rowId) {
                return {
                  ...row,
                  elements: {
                    ...row.elements,
                    [columnId]: [...(row.elements[columnId] || []), newElement],
                  },
                };
              }
              return row;
            })
          );

          setNextId((prev) => prev + 1);
        }
      } else if (
        event.dataTransfer.files &&
        event.dataTransfer.files.length > 0
      ) {
        const file = event.dataTransfer.files[0];
        if (file.type.startsWith("image/")) {
          const reader = new FileReader();
          reader.onload = (e) => {
            const imageDataUrl = e.target.result;
            const newElement = {
              id: nextId,
              name: "Image",
              type: "element",
              content: imageDataUrl,
              fontSize: "16px",
              color: "#000000",
              backgroundColor: "#ffffff",
              buttonColor: "#8B5CF6",
              buttonShape: "rounded-lg",
              buttonUrl: "",
              alignment: "left",
              dividerStyle: undefined,
              fontStyles: [],
              fontFamily: "",
            };
            setLayoutRows((prev) =>
              prev.map((row) => {
                if (row.id === rowId) {
                  return {
                    ...row,
                    elements: {
                      ...row.elements,
                      [columnId]: [
                        ...(row.elements[columnId] || []),
                        newElement,
                      ],
                    },
                  };
                }
                return row;
              })
            );
            setNextId((prev) => prev + 1);
          };
          reader.readAsDataURL(file);
        }
      }
    } catch (error) {
      console.error("Error processing column drop:", error);
      toast.error("Failed to add element to column");
    }
  };

  const handleElementUpdate = (rowId, columnId, elementId, content) => {
    setLayoutRows((prev) => {
      const updated = prev.map((row) => {
        if (row.id === rowId) {
          return {
            ...row,
            elements: {
              ...row.elements,
              [columnId]: (row.elements[columnId] || []).map((element) =>
                element.id === elementId ? { ...element, content } : element
              ),
            },
          };
        }
        return row;
      });
      return updated;
    });
  };

  const handleElementDelete = (rowId, elementId) => {
    setLayoutRows((prev) =>
      prev.map((row) => {
        if (row.id === rowId) {
          const updatedElements = {};
          Object.keys(row.elements).forEach((columnId) => {
            updatedElements[columnId] = row.elements[columnId].filter(
              (element) => element.id !== elementId
            );
          });
          return { ...row, elements: updatedElements };
        }
        return row;
      })
    );

    if (selectedElement && selectedElement.id === elementId) {
      setSelectedElement(null);
    }
  };

  const handleColumnDelete = (rowId, columnId) => {
    setLayoutRows((prev) => {
      const updatedRows = prev
        .map((row) => {
          if (row.id === rowId) {
            const updatedElements = { ...row.elements };
            delete updatedElements[columnId];

            if (Object.keys(updatedElements).length === 0) {
              return null;
            }

            return { ...row, elements: updatedElements };
          }
          return row;
        })
        .filter((row) => row !== null);

      return updatedRows;
    });
  };

  const handleItemUpdate = (id, updatedContent) => {
    setCanvasItems((prev) => {
      const updated = prev.map((item) =>
        item.id === id ? { ...item, content: updatedContent } : item
      );
      return updated;
    });
  };

  const handleItemDelete = (id) => {
    setCanvasItems((prev) => {
      const filtered = prev.filter((item) => item.id !== id);
      return filtered;
    });
    if (selectedElement && selectedElement.id === id) {
      setSelectedElement(null);
    }
  };

  const handleElementSelect = (element, location = "canvas") => {
    setSelectedElement({ ...element, location });
  };

  const handleTextPropertyUpdate = (property, value) => {
    if (!selectedElement) return;

    setSelectedElement((prev) => ({
      ...prev,
      [property]: value,
    }));

    if (selectedElement.location === "canvas") {
      setCanvasItems((prev) =>
        prev.map((item) =>
          item.id === selectedElement.id ? { ...item, [property]: value } : item
        )
      );
    } else if (selectedElement.location === "column") {
      setLayoutRows((prev) =>
        prev.map((row) => {
          if (row.id === selectedElement.rowId) {
            return {
              ...row,
              elements: {
                ...row.elements,
                [selectedElement.columnId]: (
                  row.elements[selectedElement.columnId] || []
                ).map((element) =>
                  element.id === selectedElement.id
                    ? { ...element, [property]: value }
                    : element
                ),
              },
            };
          }
          return row;
        })
      );
    }
  };

  function getDefaultContent(type) {
    switch (type) {
      case "Button":
        return "Click Here";
      case "Text":
        return "Enter your text here...";
      case "Image":
        return "";
      case "Logo":
        return "Logo";
      case "Divider":
        return "";
      case "Social Icon":
        return "Social Media";
      default:
        return "Content";
    }
  }

  const totalElements =
    canvasItems.length +
    layoutRows.reduce(
      (acc, row) => acc + Object.values(row.elements).flat().length,
      0
    );

  return (
    <div className="flex flex-col h-screen bg-linear-to-br from-base-100 to-base-200">
      {/* 🎨 Main Editor Area */}
      <main className="flex flex-1 overflow-hidden">
        {/* 📚 Templates Sidebar - Conditionally rendered */}
        {showTemplateSidebar && (
          <aside className="w-72 border-r border-base-300/30 bg-base-100 overflow-y-auto shadow-inner">
            <TemplateManager onSelectTemplate={setSelectedTemplate} />
          </aside>
        )}

        {/* 🧩 Components Sidebar */}
        <aside className="w-80 border-r border-base-300/30 bg-base-100 overflow-y-auto shadow-inner">
          <div className="p-4 border-b border-base-300/30 bg-base-200/30">
            <div className="flex items-center gap-3 mb-4">
              <div className="p-2 rounded-xl bg-secondary/10 text-secondary">
                <Palette className="w-5 h-5" />
              </div>
              <div>
                <h4 className="font-bold text-base-content text-lg">
                  Components
                </h4>
                <p className="text-sm text-base-content/60">
                  Drag and drop elements
                </p>
              </div>
            </div>
          </div>
          <EditorSidebar
            selectedLayout={selectedLayout}
            onLayoutSelect={handleLayoutSelect}
            selectedDevice={selectedDevice}
            onDeviceSelect={handleDeviceSelect}
          />
        </aside>

        {/* 🎯 Canvas Area */}
        <section className="relative flex-1 bg-base-200/20 overflow-hidden flex flex-col">
          {/* Header with template info and back button */}
          <div className="flex items-center justify-between p-4 border-b border-base-300/30 bg-base-200/50">
            <div className="flex items-center gap-3">
              {initialTemplate && onClose && (
                <button
                  onClick={onClose}
                  className="btn btn-ghost btn-sm btn-circle"
                  title="Back to templates"
                >
                  <ArrowLeft className="w-4 h-4" />
                </button>
              )}
              <div>
                <h3 className="font-bold text-base-content">
                  {initialTemplate?.name || selectedTemplate?.name || "New Template"}
                </h3>
                <p className="text-sm text-base-content/60">
                  {initialTemplate ? "Editing template" : "Select a template to edit"}
                </p>
              </div>
            </div>
            
            {/* <div className="flex items-center gap-2">
              {lastSaved && (
                <span className="text-xs text-base-content/60">
                  Last saved: {new Date(lastSaved).toLocaleTimeString()}
                </span>
              )}
              <button
                onClick={handleSave}
                disabled={saving}
                className="btn btn-primary btn-sm flex items-center gap-2"
              >
                {saving ? (
                  <div className="loading loading-spinner loading-xs"></div>
                ) : (
                  <Save className="w-4 h-4" />
                )}
                Save
              </button>
            </div> */}
          </div>

          {/* 🧱 Canvas body */}
          <EditorCanvas
            selectedTemplate={selectedTemplate || initialTemplate}
            canvasItems={canvasItems}
            layoutRows={layoutRows}
            onDragOver={handleDragOver}
            onDrop={handleDrop}
            onColumnDrop={handleColumnDrop}
            onElementDelete={handleElementDelete}
            onElementUpdate={handleElementUpdate}
            onColumnDelete={handleColumnDelete}
            onItemUpdate={handleItemUpdate}
            onItemDelete={handleItemDelete}
            onElementSelect={handleElementSelect}
            selectedDevice={selectedDevice}
            onSaveTemplate={handleSave}
            lastSaved={lastSaved}
          />
        </section>

        {/* ⚙️ Settings Panel */}
        <aside className="w-96 border-l border-base-300/30 bg-base-100 overflow-y-auto shadow-inner">
          <div className="p-4 border-b border-base-300/30 bg-base-200/30">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-xl bg-accent/10 text-accent">
                <Settings2 className="w-5 h-5" />
              </div>
              <div>
                <h4 className="font-bold text-base-content text-lg">
                  Properties
                </h4>
                <p className="text-sm text-base-content/60">
                  {selectedElement
                    ? "Editing selected element"
                    : "Select an element to edit"}
                </p>
              </div>
            </div>
          </div>
          <div className="p-4">
            <EditorSettings
              selectedElement={selectedElement}
              onTextPropertyUpdate={handleTextPropertyUpdate}
            />
          </div>
        </aside>
      </main>

      {/* 📱 Device & Layout Indicator */}
      <div className="flex items-center justify-between px-6 py-3 border-t border-base-300/30 bg-base-200/40 backdrop-blur-lg">
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-2 text-sm text-base-content/70">
            <span>Device:</span>
            <span className="font-semibold text-base-content">
              {selectedDevice}
            </span>
          </div>
          <div className="flex items-center gap-2 text-sm text-base-content/70">
            <span>Layout:</span>
            <span className="font-semibold text-base-content">
              {selectedLayout}
            </span>
          </div>
          {totalElements > 0 && (
            <div className="flex items-center gap-2 text-sm text-base-content/70">
              <span>Elements:</span>
              <span className="font-semibold text-base-content">
                {totalElements}
              </span>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}