"use client";
import { useState, useEffect } from "react";
import {
  Loader2,
  X,
  Send,
  Users,
  Mail,
  Palette,
  Layout,
  Smartphone,
  Sparkles,
  Settings2,
  Eye,
  Save,
} from "lucide-react";
import { toast } from "react-toastify";
import { useTranslation } from "react-i18next";

import TemplateDropdown from "../../../(email-template-builder)/components/editor/manager/TemplateDropdown";
import EditorSidebar from "@/app/(pages)/(email-template-builder)/components/editor/sidebar/EditorSidebar";
import EditorCanvas from "../../../(email-template-builder)/components/editor/canvas/EditorCanvas";
import EditorSettings from "../../../(email-template-builder)/components/editor/settings/EditorSettings";
import { convertToHTML } from "../../../../utils/convertToHTML";

export default function ReplyEditorModal({
  selectedMsg,
  onClose,
  isNewsletter = false,
  selectedCount = 0,
  selectedEmails = [],
  onReplySuccess,
}) {
  const { t } = useTranslation();
  const [selectedTemplate, setSelectedTemplate] = useState(null);
  const [canvasItems, setCanvasItems] = useState([]);
  const [layoutRows, setLayoutRows] = useState([]);
  const [selectedElement, setSelectedElement] = useState(null);
  const [replySubject, setReplySubject] = useState("");
  const [nextId, setNextId] = useState(1);
  const [sending, setSending] = useState(false);
  const [selectedLayout, setSelectedLayout] = useState("Column");
  const [selectedDevice, setSelectedDevice] = useState("Desktop");

  // 🔄 Load Template JSON
  useEffect(() => {
    if (selectedTemplate?.json) {
      try {
        const parsed = JSON.parse(selectedTemplate.json);
        setCanvasItems(parsed.canvasItems || []);
        setLayoutRows(parsed.layoutRows || []);
        toast.success(t("Template loaded successfully"));
      } catch (err) {
        console.error("Error parsing template JSON:", err);
        toast.error(t("Failed to load template"));
      }
    } else {
      setCanvasItems([]);
      setLayoutRows([]);
    }
  }, [selectedTemplate]);

  // 🎨 Update element styles/text
  const handleTextPropertyUpdate = (property, value) => {
    if (!selectedElement) return;
    setSelectedElement((prev) => ({ ...prev, [property]: value }));

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

  // 🧱 Delete Column / Row logic
  const handleColumnDelete = (rowId, columnId) => {
    setLayoutRows((prev) =>
      prev
        .map((row) => {
          if (row.id === rowId) {
            const newElements = { ...row.elements };
            delete newElements[columnId];
            if (Object.keys(newElements).length === 0) return null;
            return { ...row, elements: newElements };
          }
          return row;
        })
        .filter(Boolean)
    );
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
    }
  };

  // 📤 Send reply or newsletter
  const handleSend = async () => {
    if (!replySubject.trim()) return toast.error(t("Subject cannot be empty."));
    if (!selectedTemplate) return toast.error(t("Select a template first."));

    setSending(true);
    try {
      const finalHTML = convertToHTML({ canvasItems, layoutRows });
      const apiUrl = isNewsletter
        ? "/api/newsletter/email-sending"
        : "/api/contact-us/reply";

      const payload = isNewsletter
        ? {
            subject: replySubject,
            template_name: selectedTemplate.name,
            html: finalHTML,
             emails: selectedEmails.length > 0 ? selectedEmails : null,
          }
        : {
            contact_id: selectedMsg?.id,
            subject: replySubject,
            template_name: selectedTemplate.name,
            html: finalHTML,
          };

      const res = await fetch(apiUrl, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      const data = await res.json();
      if (!data.success) throw new Error(data.message);

      toast.success(
        isNewsletter
          ? t("newsletter sent successfully", { count: selectedCount || "all" })
          : t("Reply sent successfully!")
      );

      // ✅ Trigger immediate UI update
      if (!isNewsletter && typeof onReplySuccess === "function") {
        onReplySuccess(selectedMsg.id);
      }

      onClose();
    } catch (err) {
      console.error(err);
      toast.error(
        isNewsletter
          ? t("Failed to send newsletter.")
          : t("Failed to send reply.")
      );
    } finally {
      setSending(false);
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
    <dialog open className="modal modal-open">
      <div className="modal-box w-full max-w-7xl h-[95vh] bg-linear-to-br from-base-100 to-base-200 rounded-3xl shadow-2xl flex flex-col overflow-hidden border border-base-300/30 backdrop-blur-lg">
        {/* 🌟 Enhanced Header */}
        <div className="flex items-center justify-between p-6 border-b border-base-300/30 bg-base-200/50 shrink-0">
          <div className="flex items-center gap-4">
            <div className="p-3 rounded-2xl bg-linear-to-br from-primary to-primary/80 text-primary-content shadow-lg">
              {isNewsletter ? (
                <Send className="w-6 h-6" />
              ) : (
                <Mail className="w-6 h-6" />
              )}
            </div>
            <div>
              <h3 className="text-2xl font-bold bg-linear-to-r from-base-content to-base-content/70 bg-clip-text text-transparent">
                {isNewsletter ? t("Send Newsletter") : t("Reply to Message")}
              </h3>
              <p className="text-base-content/70 text-lg mt-1">
                {isNewsletter
                  ? t("Sending to {{count}} subscribers", {
                      count: selectedCount || "all",
                    })
                  : `${selectedMsg?.name} • ${selectedMsg?.email}`}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <TemplateDropdown
              selectedTemplate={selectedTemplate}
              onSelectTemplate={setSelectedTemplate}
            />
            <button
              onClick={onClose}
              className="btn btn-ghost btn-circle text-base-content/60 hover:text-error hover:bg-error/10 transition-all duration-200 hover:scale-110"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* 📝 Enhanced Subject Line */}
        <div className="p-4 border-b border-base-300/30 bg-base-200/30 shrink-0">
          <div className="flex items-center gap-4 max-w-4xl mx-auto">
            <div className="flex items-center gap-3 text-base-content/80 bg-base-200/70 px-4 py-2 rounded-xl border border-base-300/20">
              <Mail className="w-5 h-5 text-primary" />
              <span className="font-semibold text-base-content">
                {t("Subject")}
              </span>
            </div>
            <input
              type="text"
              required
              placeholder={t("Enter your email subject line...")}
              className="input input-bordered flex-1 input-lg font-medium rounded-xl focus:ring-2 focus:ring-primary/50 bg-base-100"
              value={replySubject}
              onChange={(e) => setReplySubject(e.target.value)}
            />
          </div>
        </div>

        {/* 🎨 Enhanced Editor Area */}
        <div className="flex-1 overflow-hidden flex flex-col lg:flex-row bg-base-100">
          {/* 📚 Left Sidebar */}
          <aside className="w-72 border-r border-base-300/30 bg-base-100 overflow-y-auto shadow-inner">
            <div className="p-4 border-b border-base-300/30 bg-base-200/30">
              <div className="flex items-center gap-3 mb-4">
                <div className="p-2 rounded-xl bg-primary/10 text-primary">
                  <Layout className="w-5 h-5" />
                </div>
                <div>
                  <h4 className="font-bold text-base-content text-lg">
                    {t("Components")}
                  </h4>
                  <p className="text-sm text-base-content/60">
                    {t("Drag and drop elements")}
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

          {/* 🎯 Main Canvas Area */}
          <main className="flex-1 bg-base-200/20 overflow-y-auto relative">
            {/* Device & Layout Indicator */}
            <div className="absolute top-4 right-4 z-10 flex gap-3">
              <div className="badge badge-primary badge-lg gap-2 px-3 py-2 shadow-lg">
                <Smartphone className="w-4 h-4" />
                {selectedDevice}
              </div>
              <div className="badge badge-outline badge-lg gap-2 px-3 py-2">
                <Layout className="w-4 h-4" />
                {selectedLayout} {t("Layout")}
              </div>
            </div>

            {/* Canvas Stats */}
            {selectedTemplate && (
              <div className="absolute top-4 left-4 z-10">
                <div className="badge badge-ghost badge-lg gap-2 px-3 py-2 bg-base-100/80 backdrop-blur-sm">
                  <Sparkles className="w-4 h-4 text-primary" />
                  {totalElements} {t("elements")}
                </div>
              </div>
            )}

            <div className="p-6">
              <EditorCanvas
                hideSaveButton={true}
                hideTestButton={true}
                selectedTemplate={selectedTemplate}
                canvasItems={canvasItems}
                layoutRows={layoutRows}
                onDragOver={handleDragOver}
                onDrop={handleDrop}
                onColumnDelete={handleColumnDelete}
                onColumnDrop={handleColumnDrop}
                selectedElement={selectedElement}
                onElementSelect={(element, location) =>
                  setSelectedElement({ ...element, location })
                }
                onItemUpdate={(id, content) =>
                  setCanvasItems((prev) =>
                    prev.map((item) =>
                      item.id === id ? { ...item, content } : item
                    )
                  )
                }
                onItemDelete={(id) =>
                  setCanvasItems((prev) => prev.filter((i) => i.id !== id))
                }
                onElementUpdate={(rowId, colId, elementId, content) =>
                  setLayoutRows((prev) =>
                    prev.map((row) =>
                      row.id === rowId
                        ? {
                            ...row,
                            elements: {
                              ...row.elements,
                              [colId]: row.elements[colId].map((el) =>
                                el.id === elementId ? { ...el, content } : el
                              ),
                            },
                          }
                        : row
                    )
                  )
                }
                onElementDelete={(rowId, elementId) =>
                  setLayoutRows((prev) =>
                    prev.map((row) => ({
                      ...row,
                      elements: Object.fromEntries(
                        Object.entries(row.elements).map(([col, els]) => [
                          col,
                          els.filter((el) => el.id !== elementId),
                        ])
                      ),
                    }))
                  )
                }
                selectedDevice={selectedDevice}
              />
            </div>
          </main>

          {/* ⚙️ Right Settings Panel */}
          <aside className="w-80 border-l border-base-300/30 bg-base-100 overflow-y-auto shadow-inner">
            <div className="p-4 border-b border-base-300/30 bg-base-200/30">
              <div className="flex items-center gap-3">
                <div className="p-2 rounded-xl bg-primary/10 text-primary">
                  <Settings2 className="w-5 h-5" />
                </div>
                <div>
                  <h4 className="font-bold text-base-content text-lg">
                    {t("Properties")}
                  </h4>
                  <p className="text-sm text-base-content/60">
                    {selectedElement
                      ? t("Editing selected element")
                      : t("Select an element to edit")}
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
        </div>

        {/* 🚀 Enhanced Footer */}
        <div className="flex justify-between items-center p-6 border-t border-base-300/30 bg-base-200/40 shrink-0">
          <div className="flex items-center gap-4">
            {selectedTemplate && (
              <>
                <div className="flex items-center gap-3 bg-base-200/70 px-4 py-2 rounded-xl border border-base-300/20">
                  <div className="p-1 rounded-lg bg-success/10 text-success">
                    <Save className="w-4 h-4" />
                  </div>
                  <div>
                    <p className="text-sm font-semibold text-base-content">
                      {t("Template")}
                    </p>
                    <p className="text-xs text-base-content/60">
                      {selectedTemplate.name}
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-3 bg-base-200/70 px-4 py-2 rounded-xl border border-base-300/20">
                  <div className="p-1 rounded-lg bg-info/10 text-info">
                    <Eye className="w-4 h-4" />
                  </div>
                  <div>
                    <p className="text-sm font-semibold text-base-content">
                      {t("Elements")}
                    </p>
                    <p className="text-xs text-base-content/60">
                      {totalElements} {t("items")}
                    </p>
                  </div>
                </div>
              </>
            )}
          </div>

          <div className="flex gap-3">
            <button
              onClick={onClose}
              className="btn btn-outline btn-lg rounded-xl hover:scale-105 transition-all duration-200"
            >
              {t("Cancel")}
            </button>
            <button
              onClick={handleSend}
              disabled={sending || !replySubject.trim() || !selectedTemplate}
              className="btn btn-primary btn-lg rounded-xl shadow-lg hover:shadow-xl transition-all duration-300 transform hover:scale-105 flex items-center gap-2 font-semibold"
            >
              {sending ? (
                <>
                  <Loader2 className="w-5 h-5 animate-spin" />
                  {isNewsletter ? t("Sending...") : t("Sending...")}
                </>
              ) : (
                <>
                  <Send className="w-5 h-5" />
                  {isNewsletter ? t("Send Newsletter") : t("Send Reply")}
                </>
              )}
            </button>
          </div>
        </div>
      </div>

      {/* ✨ Enhanced Backdrop */}
      <form
        method="dialog"
        className="modal-backdrop bg-base-content/50 backdrop-blur-sm transition-all"
        onClick={onClose}
      >
        <button className="cursor-default">{t("close")}</button>
      </form>
    </dialog>
  );
}
