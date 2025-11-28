"use client";

import { useState, useEffect } from "react";
import { Plus, Trash2, Loader2, FileText } from "lucide-react";
import { toast } from "react-toastify";
import ConfirmModal from "@/app/(pages)/components/common/ConfirmModal";
import { useTranslation } from "react-i18next";

export default function TemplateManager({
  onSelectTemplate,
  allowCreate = false,
  allowDelete = false,
}) {
  const [templates, setTemplates] = useState([]);
  const [newTemplateName, setNewTemplateName] = useState("");
  const [loading, setLoading] = useState(false);
  const [selectedId, setSelectedId] = useState(null);
  const [creating, setCreating] = useState(false);
  const { t } = useTranslation();

  const [confirmOpen, setConfirmOpen] = useState(false);
  const [confirmLoading, setConfirmLoading] = useState(false);
  const [templateToDelete, setTemplateToDelete] = useState(null);

  useEffect(() => {
    loadTemplates();
  }, []);

  const loadTemplates = async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/public/email-templates");
      const data = await res.json();
      if (data.success) setTemplates(data.templates);
    } catch (err) {
      toast.error("Failed to load templates");
    } finally {
      setLoading(false);
    }
  };

  const handleCreate = async () => {
    if (!newTemplateName.trim()) return toast.warning("Enter a template name");
    try {
      setCreating(true);
      const res = await fetch("/api/super-admin/email-templates", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name: newTemplateName, html: "", json: "{}" }),
      });
      const data = await res.json();
      if (data.success) {
        toast.success("Template created!");
        setNewTemplateName("");
        await loadTemplates();
      } else throw new Error(data.error);
    } catch (err) {
      toast.error("Error creating template");
    } finally {
      setCreating(false);
    }
  };

  const requestDelete = (id) => {
    setTemplateToDelete(id);
    setConfirmOpen(true);
  };

  const confirmDelete = async () => {
    if (!templateToDelete) return;
    try {
      setConfirmLoading(true);
      await handleDelete(templateToDelete);
      toast.success(t("Template deleted successfully!"));
    } catch {
      toast.error(t("Failed to delete template"));
    } finally {
      setConfirmLoading(false);
      setConfirmOpen(false);
      setTemplateToDelete(null);
    }
  };

  const handleDelete = async (id) => {
    try {
      await fetch("/api/super-admin/email-templates", {
        method: "DELETE",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id }),
      });
      if (id === selectedId) onSelectTemplate(null);
      await loadTemplates();
      toast.success("Template deleted");
    } catch {
      toast.error("Failed to delete template");
    }
  };

  return (
    <aside className="w-full md:w-auto bg-base-100 border-r border-base-300 flex flex-col shadow-inner">
      {/* Header */}
      <div className="flex items-center justify-between px-4 py-3 border-b border-base-300 bg-base-200/60 backdrop-blur-sm">
        <h2 className="font-semibold text-base-content text-lg flex items-center gap-2">
          <FileText className="w-5 h-5 text-primary" /> Templates
        </h2>

        {!allowCreate && (
          <button
            onClick={handleCreate}
            disabled={creating || !newTemplateName.trim()}
            className="btn btn-sm btn-primary flex items-center gap-1"
            title="Create new template"
          >
            {creating ? (
              <Loader2 className="w-4 h-4 animate-spin shrink-0" />
            ) : (
              <Plus className="w-4 h-4 shrink-0" />
            )}
            <span className="hidden sm:inline">Add</span>
          </button>
        )}
      </div>

      {/* Create Input (optional) */}
      {!allowCreate && (
        <div className="px-4 py-3 border-b border-base-200 flex items-center gap-2 bg-base-100/80">
          <input
            value={newTemplateName}
            onChange={(e) => setNewTemplateName(e.target.value)}
            className="input input-sm input-bordered flex-1"
            placeholder="New template name"
          />
        </div>
      )}

      {/* Template List */}
      <div className="flex-1 overflow-y-auto p-2 bg-base-100">
        {loading ? (
          <div className="flex justify-center py-8 text-base-content/60">
            <Loader2 className="w-6 h-6 animate-spin" />
          </div>
        ) : templates.length === 0 ? (
          <p className="text-sm text-center text-base-content/60 py-10">
            No templates yet
          </p>
        ) : (
          <ul className="space-y-1">
            {templates.map((tpl) => (
              <li
                key={tpl.id}
                onClick={() => {
                  setSelectedId(tpl.id);
                  onSelectTemplate(tpl);
                }}
                className={`group cursor-pointer flex items-center justify-between px-3 py-2 rounded-lg transition-all ${
                  tpl.id === selectedId
                    ? "bg-primary/10 text-primary border border-primary/20"
                    : "hover:bg-base-200"
                }`}
              >
                <div className="flex items-center gap-2 min-w-0 flex-1">
                  <FileText className="w-4 h-4 opacity-70 shrink-0" />
                  <span className="truncate">{tpl.name}</span>
                </div>

                {!allowDelete && (
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      requestDelete(tpl.id);
                    }}
                    className="opacity-0 group-hover:opacity-100 text-error hover:text-red-700 transition-all ml-2 shrink-0"
                    title="Delete template"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                )}
              </li>
            ))}
          </ul>
        )}
      </div>

      {/* Footer */}
      <div className="px-4 py-2 border-t border-base-300 bg-base-200/40 text-xs text-base-content/60 text-center">
        {templates.length > 0
          ? `${templates.length} template${templates.length !== 1 ? "s" : ""}`
          : "No templates found"}
      </div>

      <ConfirmModal
        open={confirmOpen}
        title={t("Confirm Deletion")}
        message={t("Are you sure you want to delete this Template?")}
        confirmText={t("Delete")}
        cancelText={t("Cancel")}
        onConfirm={confirmDelete}
        onCancel={() => setConfirmOpen(false)}
        loading={confirmLoading}
      />
    </aside>
  );
}
