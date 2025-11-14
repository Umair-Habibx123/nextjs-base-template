"use client";

import React, { Suspense, useEffect, useState } from "react";
import dynamic from "next/dynamic";
import { useTranslation } from "react-i18next";
import {
  Mail,
  AlertTriangle,
  Sparkles,
  LayoutTemplate,
  Code2,
  Clock,
  Calendar,
  Plus,
  Edit3,
  Trash2,
  Eye,
  FileText,
  X,
} from "lucide-react";
import { toast } from "react-toastify";
import ConfirmModal from "../../components/common/ConfirmModal"; // adjust the path as needed

const EmailEditor = dynamic(
  () =>
    import("../../(email-template-builder)/editor/[templateid]/page").then(
      (mod) => {
        // Ensure we can pass props to the page component
        return mod.default || mod;
      }
    ),
  {
    ssr: false,
    loading: () => (
      <div className="flex flex-col items-center justify-center h-[60vh] text-center p-10">
        <div className="space-y-4">
          <div className="flex justify-center">
            <div className="loading loading-spinner loading-lg text-primary"></div>
          </div>
          <div className="space-y-2">
            <p className="text-lg font-semibold text-base-content">
              Loading Email Editor
            </p>
            <p className="text-base-content/60 text-sm">
              Preparing the visual template builder...
            </p>
          </div>
        </div>
      </div>
    ),
  }
);

class BuilderErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null };
  }
  static getDerivedStateFromError(error) {
    return { hasError: true, error };
  }
  componentDidCatch(error, info) {
    console.error("Email editor error:", error, info);
  }
  render() {
    if (this.state.hasError) {
      return (
        <div className="flex flex-col items-center justify-center h-[60vh] text-center p-10">
          <div className="space-y-4 max-w-md">
            <div className="flex justify-center">
              <div className="p-3 rounded-2xl bg-error/10 text-error">
                <AlertTriangle className="w-8 h-8" />
              </div>
            </div>
            <div className="space-y-2">
              <h3 className="text-xl font-bold text-error">
                Failed to load the Email Editor
              </h3>
              <p className="text-base-content/70 text-sm leading-relaxed">
                {this.state.error?.message ||
                  "An unexpected error occurred while loading the email template builder."}
              </p>
            </div>
            <button
              className="btn btn-primary btn-sm rounded-lg mt-2"
              onClick={() => window.location.reload()}
            >
              Try Again
            </button>
          </div>
        </div>
      );
    }
    return this.props.children;
  }
}
// Template Manager Component
function TemplateManager({
  onEditTemplate,
  onCreateTemplate,
  refreshTrigger,
  onTemplatesChange,
}) {
  const { t } = useTranslation();
  const [templates, setTemplates] = useState([]);
  const [loading, setLoading] = useState(true);
  const [newTemplateName, setNewTemplateName] = useState("");
  const [creating, setCreating] = useState(false);

  const [confirmOpen, setConfirmOpen] = useState(false);
  const [deletingId, setDeletingId] = useState(null);
  const [confirmLoading, setConfirmLoading] = useState(false);

  useEffect(() => {
    loadTemplates();
  }, [refreshTrigger]); // Refresh when trigger changes

  const loadTemplates = async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/email-templates");
      const data = await res.json();
      if (data.success) {
        setTemplates(data.templates);
        // Notify parent about templates change for stats update
        if (onTemplatesChange) {
          onTemplatesChange(data.templates);
        }
      }
    } catch (err) {
      console.error("Failed to load templates:", err);
    } finally {
      setLoading(false);
    }
  };

  const handleCreateTemplate = async () => {
    if (!newTemplateName.trim()) return;

    setCreating(true);
    try {
      const res = await fetch("/api/email-templates", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: newTemplateName,
          html: "",
          json: JSON.stringify({ canvasItems: [], layoutRows: [], nextId: 1 }),
        }),
      });

      const data = await res.json();
      if (data.success) {
        setNewTemplateName("");
        await loadTemplates(); // This will trigger onTemplatesChange
        if (onCreateTemplate && data.template) {
          onCreateTemplate(data.template);
        }
        toast.success("Template created successfully!");
      }
    } catch (err) {
      console.error("Failed to create template:", err);
      toast.error("Failed to create template");
    } finally {
      setCreating(false);
    }
  };

  const handleDeleteTemplate = (templateId) => {
    setDeletingId(templateId);
    setConfirmOpen(true);
  };

  const confirmDelete = async () => {
    if (!deletingId) return;
    setConfirmLoading(true);
    try {
      const res = await fetch("/api/email-templates", {
        method: "DELETE",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id: deletingId }),
      });

      const data = await res.json();
      if (data.success) {
        await loadTemplates(); // refresh list
        toast.success("Template deleted successfully!");
      } else {
        toast.error("Failed to delete template");
      }
    } catch (err) {
      console.error("Failed to delete template:", err);
      toast.error("Failed to delete template");
    } finally {
      setConfirmLoading(false);
      setConfirmOpen(false);
      setDeletingId(null);
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-32">
        <div className="loading loading-spinner loading-lg text-primary"></div>
      </div>
    );
  }

  return (
    <div className="bg-base-100 rounded-2xl border border-base-300/30 shadow-lg">
      {/* Header */}
      <div className="flex items-center justify-between p-6 border-b border-base-300/30">
        <div className="flex items-center gap-3">
          <div className="p-2 rounded-xl bg-primary/10 text-primary">
            <FileText className="w-5 h-5" />
          </div>
          <div>
            <h2 className="text-xl font-bold text-base-content">
              {t("Template Manager")}
            </h2>
            <p className="text-base-content/60 text-sm">
              {t("Create and manage your email templates")}
            </p>
          </div>
        </div>

        {/* Create Template Input */}
        <div className="flex gap-2">
          <input
            type="text"
            placeholder={t("New template name...")}
            value={newTemplateName}
            onChange={(e) => setNewTemplateName(e.target.value)}
            onKeyPress={(e) => e.key === "Enter" && handleCreateTemplate()}
            className="input input-bordered input-sm"
          />
          <button
            onClick={handleCreateTemplate}
            disabled={!newTemplateName.trim() || creating}
            className="btn btn-primary btn-sm flex items-center gap-2"
          >
            {creating ? (
              <div className="loading loading-spinner loading-xs"></div>
            ) : (
              <Plus className="w-4 h-4" />
            )}
            {t("Create")}
          </button>
        </div>
      </div>

      {/* Templates Table */}
      <div className="overflow-x-auto">
        <table className="table table-zebra w-full">
          <thead>
            <tr>
              <th>{t("Name")}</th>
              <th>{t("Created")}</th>
              <th>{t("Updated")}</th>
              <th>{t("Actions")}</th>
            </tr>
          </thead>
          <tbody>
            {templates.length === 0 ? (
              <tr>
                <td
                  colSpan="4"
                  className="text-center py-8 text-base-content/60"
                >
                  {t("No templates found. Create your first template!")}
                </td>
              </tr>
            ) : (
              templates.map((template) => (
                <tr key={template.id} className="hover:bg-base-200/50">
                  <td>
                    <div className="flex items-center gap-3">
                      <FileText className="w-4 h-4 text-primary" />
                      <span className="font-medium">{template.name}</span>
                    </div>
                  </td>
                  <td>{new Date(template.createdAt).toLocaleDateString()}</td>
                  <td>{new Date(template.updatedAt).toLocaleDateString()}</td>
                  <td>
                    <div className="flex gap-2">
                      <button
                        onClick={() => onEditTemplate(template)}
                        className="btn btn-outline btn-sm btn-primary flex items-center gap-1"
                      >
                        <Edit3 className="w-3 h-3" />
                        {t("Edit")}
                      </button>
                      <button
                        onClick={() => handleDeleteTemplate(template.id)}
                        className="btn btn-outline btn-sm btn-error flex items-center gap-1"
                      >
                        <Trash2 className="w-3 h-3" />
                        {t("Delete")}
                      </button>
                    </div>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
       <ConfirmModal
        open={confirmOpen}
        title="Delete Template?"
        message="Are you sure you want to delete this email template? This action cannot be undone."
        confirmText="Delete"
        cancelText="Cancel"
        loading={confirmLoading}
        onConfirm={confirmDelete}
        onCancel={() => {
          setConfirmOpen(false);
          setDeletingId(null);
        }}
      />
    </div>
  );
}

export default function TemplatePage() {
  const { t } = useTranslation();
  const [stats, setStats] = useState({
    templates: 0,
    latestUpdated: null,
    averageUpdateInterval: 0,
  });
  const [statsLoading, setStatsLoading] = useState(true);
  const [editorModalOpen, setEditorModalOpen] = useState(false);
  const [selectedTemplate, setSelectedTemplate] = useState(null);
  const [templatesRefreshKey, setTemplatesRefreshKey] = useState(0);

  // Function to calculate stats from templates data
  const calculateStats = (templates) => {
    const total = templates.length;
    let latestUpdated = null;
    let avgUpdateInterval = 0;

    if (total > 0) {
      latestUpdated = new Date(
        Math.max(...templates.map((t) => new Date(t.updatedAt).getTime()))
      ).toLocaleString();

      avgUpdateInterval =
        templates.reduce(
          (sum, t) =>
            sum +
            (new Date(t.updatedAt).getTime() -
              new Date(t.createdAt).getTime()),
          0
        ) /
        total /
        1000 /
        60;
    }

    return {
      templates: total,
      latestUpdated,
      averageUpdateInterval: avgUpdateInterval.toFixed(1),
    };
  };

  // Load stats from API
  const loadStats = async () => {
    setStatsLoading(true);
    try {
      const res = await fetch("/api/email-templates");
      const data = await res.json();

      if (data.success) {
        const newStats = calculateStats(data.templates);
        setStats(newStats);
      }
    } catch (e) {
      console.error("Failed to fetch stats", e);
    } finally {
      setStatsLoading(false);
    }
  };

  // Update stats when templates data changes
  const handleTemplatesChange = (templates) => {
    const newStats = calculateStats(templates);
    setStats(newStats);
  };

  useEffect(() => {
    loadStats();
  }, [templatesRefreshKey]);

  const handleEditTemplate = (template) => {
    setSelectedTemplate(template);
    setEditorModalOpen(true);
  };

  const handleCreateTemplate = (template) => {
    setSelectedTemplate(template);
    setEditorModalOpen(true);
    // Refresh everything
    setTemplatesRefreshKey((prev) => prev + 1);
  };

  const handleCloseEditor = (shouldRefresh = true) => {
    setEditorModalOpen(false);
    setSelectedTemplate(null);

    if (shouldRefresh) {
      // Refresh everything
      setTemplatesRefreshKey((prev) => prev + 1);
    }
  };

  return (
    <section className="max-w-full space-y-8 animate-fade-in">
      {/* 🌟 Modern Header */}
      <div className="flex items-center gap-4 p-6 bg-linear-to-r from-primary/5 via-secondary/5 to-accent/5 rounded-3xl border border-base-300/20 backdrop-blur-lg">
        <div className="p-3 rounded-2xl bg-linear-to-br from-primary to-primary/80 text-primary-content shadow-lg">
          <LayoutTemplate className="w-7 h-7" />
        </div>
        <div className="flex-1">
          <h1 className="text-3xl font-bold bg-linear-to-r from-base-content to-base-content/70 bg-clip-text text-transparent">
            {t("Email Template Builder")}
          </h1>
          <p className="text-base-content/70 mt-2 text-lg leading-relaxed">
            {t(
              "Design and manage your email templates with our visual builder."
            )}
          </p>
        </div>
        <div className="hidden lg:flex items-center gap-2 px-4 py-2 bg-primary/10 rounded-full border border-primary/20 backdrop-blur-sm">
          <Sparkles className="w-4 h-4 text-primary" />
          <span className="text-sm font-medium text-primary">
            {statsLoading
              ? t("Loading...")
              : `${stats.templates} ${t("Templates")}`}
          </span>
        </div>
      </div>

      {/* 📊 Stats Overview with Loading States */}
      <div className="max-w-6xl mx-auto grid grid-cols-1 md:grid-cols-2 gap-4 px-4 sm:px-8 md:px-12 lg:px-20">
        {/* Total Templates */}
        <div className="bg-linear-to-br from-base-100 to-base-200 border border-base-300/30 rounded-2xl p-4 text-center shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-[1.02]">
          <div className="flex justify-center items-center gap-2 mb-2">
            <LayoutTemplate className="w-5 h-5 text-primary" />
            <div className="text-2xl font-bold text-primary">
              {statsLoading ? "..." : stats.templates}
            </div>
          </div>
          <div className="text-sm text-base-content/70 font-medium">
            {t("Templates")}
          </div>
        </div>

        {/* Last Updated */}
        <div className="bg-linear-to-br from-base-100 to-base-200 border border-base-300/30 rounded-2xl p-4 text-center shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-[1.02]">
          <div className="flex justify-center items-center gap-2 mb-2">
            <Calendar className="w-5 h-5 text-secondary" />
            <div className="text-2xl font-bold text-secondary">
              {statsLoading ? "..." : stats.latestUpdated ? "Recent" : "-"}
            </div>
          </div>
          <div className="text-sm text-base-content/70 font-medium">
            {t("Last Updated")}
          </div>
          {!statsLoading && stats.latestUpdated && (
            <div className="text-xs text-base-content/50 mt-1">
              {stats.latestUpdated}
            </div>
          )}
        </div>
      </div>

      {/* 📋 Template Manager Table */}
      <TemplateManager
        onEditTemplate={handleEditTemplate}
        onCreateTemplate={handleCreateTemplate}
        refreshTrigger={templatesRefreshKey}
        onTemplatesChange={handleTemplatesChange} // Add this prop
      />

      {/* 💫 Footer */}
      <footer className="flex items-center justify-between p-6 bg-linear-to-br from-base-100 to-base-200 border border-base-300/30 rounded-2xl shadow-lg backdrop-blur-lg hover:shadow-xl transition-all duration-300">
        <div className="flex items-center gap-3">
          <div className="p-2 rounded-lg bg-primary/10 text-primary">
            <Mail className="w-4 h-4" />
          </div>
          <div>
            <p className="text-sm font-semibold text-base-content">
              Powered by <span className="text-primary">Email Builder Pro</span>
            </p>
            <p className="text-xs text-base-content/60">
              {t("Professional email template design platform")}
            </p>
          </div>
        </div>
        <div className="flex gap-4 text-xs text-base-content/60">
          <span>Drag & Drop</span>
          <span>•</span>
          <span>Mobile Preview</span>
          <span>•</span>
          <span>Code Export</span>
        </div>
      </footer>

      {/* Modal */}
      {editorModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm">
          {/* Modal Content */}
          <div className="relative w-[95vw] h-[95vh] bg-base-100 rounded-2xl shadow-2xl overflow-hidden flex flex-col">
            {/* Header */}
            <div className="flex items-center justify-between p-4 border-b border-base-300/30 bg-base-200/50">
              <div className="flex items-center gap-3">
                <div className="p-2 rounded-xl bg-primary/10 text-primary">
                  <Code2 className="w-5 h-5" />
                </div>
                <div>
                  <h2 className="text-xl font-bold text-base-content">
                    {selectedTemplate
                      ? `Editing: ${selectedTemplate.name}`
                      : "Create New Template"}
                  </h2>
                  <p className="text-base-content/60 text-sm">
                    {t("Drag, drop, and design beautiful email templates")}
                  </p>
                </div>
              </div>
              <button
                onClick={() => handleCloseEditor(true)}
                className="btn btn-ghost btn-sm btn-circle"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Body */}
            <div className="flex-1 overflow-auto">
              <BuilderErrorBoundary>
                <Suspense
                  fallback={
                    <div className="flex flex-col items-center justify-center h-full text-center p-10">
                      <div className="space-y-6">
                        <div className="flex justify-center">
                          <div className="loading loading-spinner loading-lg text-primary"></div>
                        </div>
                        <p className="text-xl font-semibold text-base-content">
                          {t("Loading Email Editor")}
                        </p>
                      </div>
                    </div>
                  }
                >
                  {selectedTemplate && (
                    <EmailEditorWrapper
                      template={selectedTemplate}
                      onClose={handleCloseEditor}
                    />
                  )}
                </Suspense>
              </BuilderErrorBoundary>
            </div>
          </div>
        </div>
      )}

     
    </section>
  );
}

function EmailEditorWrapper({ template, onClose }) {
  const handleCloseWithRefresh = (shouldRefresh) => {
    onClose(shouldRefresh);
  };

  return <EmailEditor template={template} onClose={handleCloseWithRefresh} />;
}
