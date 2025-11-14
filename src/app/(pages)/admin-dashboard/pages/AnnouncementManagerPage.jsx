"use client";

import React, { useEffect, useState } from "react";
import {
  Megaphone,
  Sparkles,
  Settings,
  Palette,
  Eye,
  Edit,
  Trash2,
  Plus,
  X,
  Save,
  List,
  Play,
  Layout,
  Mail,
  Loader2,
} from "lucide-react";

import { toast } from "react-toastify";
import { useTranslation } from "react-i18next";
import AnnouncementList from "../components/announcement-dashboard/AnnouncementList";
import AnnouncementManagementModal from "../components/announcement-dashboard/AnnouncementManagementModal";
import PreviewModal from "../components/announcement-dashboard/PreviewModal";
import Loading from "../../components/layout/Loading";
import ConfirmModal from "../../components/common/ConfirmModal";

const AnnouncementManagerPage = () => {
  const { t } = useTranslation();

  const [list, setList] = useState([]);
  const [form, setForm] = useState("");
  const [editing, setEditing] = useState(null);
  const [loading, setLoading] = useState(true);
  const [statsLoading, setStatsLoading] = useState(true);
  const [settings, setSettings] = useState({
    theme: "scroll-left",
    bg_color: "#2563eb",
    text_color: "#ffffff",
    speed: 25,
    custom_html: "",
    custom_css: "",
  });
  const [templates, setTemplates] = useState([]);
  const [newTemplateName, setNewTemplateName] = useState("");
  const [confirmOpen, setConfirmOpen] = useState(false);
  const [confirmLoading, setConfirmLoading] = useState(false);
  const [deleteId, setDeleteId] = useState(null);

  // Modal states
  const [modals, setModals] = useState({
    announcementManagement: { open: false, selectedAnnouncement: null },
    preview: { open: false },
  });

  // Load data
  const loadAnnouncements = async () => {
    setLoading(true);
    setStatsLoading(true);
    const res = await fetch("/api/admin/announcements");
    const data = await res.json();
    if (data.success) setList(data.data);
    setLoading(false);
    setStatsLoading(false);
  };

  const loadSettings = async () => {
    const res = await fetch("/api/admin/announcements/announcement-settings");
    const data = await res.json();
    if (data.success) setSettings(data.data);
  };

  const loadTemplates = async () => {
    const res = await fetch("/api/admin/announcements/templates");
    const data = await res.json();
    if (data.success) setTemplates(data.data);
  };

  useEffect(() => {
    loadAnnouncements();
    loadSettings();
    loadTemplates();
  }, []);

  // Calculate stats
  const activeAnnouncements = list.filter((a) => a.is_active);
  const stats = {
    totalAnnouncements: list.length,
    activeNow: activeAnnouncements.length,
    savedTemplates: templates.length,
    currentTheme: settings.theme,
  };

  // Modal handlers
  const openModal = (modalName, data = {}) => {
    setModals((prev) => ({
      ...prev,
      [modalName]: { ...prev[modalName], open: true, ...data },
    }));
  };

  const closeModal = (modalName) => {
    setModals((prev) => ({
      ...prev,
      [modalName]: { ...prev[modalName], open: false },
    }));
  };

  const handleOpenManagement = (announcement = null) => {
    if (announcement) {
      setEditing(announcement);
      setForm(announcement.text);
    } else {
      setEditing(null);
      setForm("");
    }
    openModal("announcementManagement", { selectedAnnouncement: announcement });
  };

  const handleOpenPreview = () => {
    openModal("preview");
  };

  // CRUD Handlers
  const handleSaveAnnouncement = async () => {
    if (!form.trim()) return toast.warn(t("Please enter announcement text"));
    const method = editing ? "PUT" : "POST";
    const body = editing
      ? { id: editing.id, text: form, is_active: editing.is_active }
      : { text: form };

    const res = await fetch("/api/admin/announcements", {
      method,
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(body),
    });

    const data = await res.json();
    if (data.success) {
      toast.success(
        editing ? t("Announcement updated") : t("Announcement added")
      );
      setForm("");
      setEditing(null);
      closeModal("announcementManagement");
      loadAnnouncements();
    }
  };

  const handleDelete = async (id) => {
    await fetch("/api/admin/announcements", {
      method: "DELETE",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ id }),
    });
    toast.success(t("Deleted successfully"));
    loadAnnouncements();
  };

  const requestDelete = (id) => {
    setDeleteId(id);
    setConfirmOpen(true);
  };

  const confirmDelete = async () => {
    if (!deleteId) return;
    try {
      setConfirmLoading(true);
      await handleDelete(deleteId);
    } finally {
      setConfirmLoading(false);
      setConfirmOpen(false);
      setDeleteId(null);
    }
  };

  const toggleActive = async (item) => {
    await fetch("/api/admin/announcements", {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        id: item.id,
        text: item.text,
        is_active: !item.is_active,
      }),
    });
    loadAnnouncements();
  };

  const saveSettings = async () => {
    const res = await fetch("/api/admin/announcements/announcement-settings", {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(settings),
    });
    const data = await res.json();
    if (data.success) toast.success(t("Settings saved successfully"));
    loadSettings();
  };

  const handleSaveTemplate = async () => {
    if (!newTemplateName.trim())
      return toast.warn(t("Enter template name first"));
    const res = await fetch("/api/admin/announcements/templates", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        name: newTemplateName,
        html: settings.custom_html,
        css: settings.custom_css,
      }),
    });
    const data = await res.json();
    if (data.success) {
      toast.success(t("Template saved!"));
      setNewTemplateName("");
      loadTemplates();
    } else toast.error(data.error || t("Failed to save template"));
  };

  const handleLoadTemplate = (id) => {
    const selectedTemplate = templates.find((x) => x.id === Number(id));
    if (!selectedTemplate) return;
    setSettings({
      ...settings,
      custom_html: selectedTemplate.html,
      custom_css: selectedTemplate.css,
    });
    toast.info(t("Loaded template: {{name}}", { name: selectedTemplate.name }));
  };

  const previewText = activeAnnouncements.map((a) => a.text).join(" • ");

  return (
    <section className="max-w-full space-y-8 animate-fade-in">
      {/* 🌟 Modern Header */}
      <div className="flex items-center gap-4 p-6 bg-linear-to-r from-primary/5 via-secondary/5 to-accent/5 rounded-3xl border border-base-300/20 backdrop-blur-lg">
        <div className="p-3 rounded-2xl bg-linear-to-br from-primary to-primary/80 text-primary-content shadow-lg">
          <Megaphone className="w-7 h-7" />
        </div>
        <div className="flex-1">
          <h1 className="text-3xl font-bold bg-linear-to-r from-base-content to-base-content/70 bg-clip-text text-transparent">
            {t("Announcement Manager")}
          </h1>
          <p className="text-base-content/70 mt-2 text-lg leading-relaxed">
            {t(
              "Manage announcements and customize your site's announcement bar."
            )}
          </p>
        </div>
        <div className="hidden lg:flex items-center gap-2 px-4 py-2 bg-primary/10 rounded-full border border-primary/20 backdrop-blur-sm">
          <Sparkles className="w-4 h-4 text-primary" />
          <span className="text-sm font-medium text-primary">
            {statsLoading
              ? t("Loading...")
              : `${stats.activeNow} ${t("Active")}`}
          </span>
        </div>
      </div>

      {/* 📊 Stats Overview with Loading States */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        {/* Total Announcements */}
        <div className="bg-linear-to-br from-base-100 to-base-200 border border-base-300/30 rounded-2xl p-4 text-center shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-[1.02]">
          <div className="flex justify-center items-center gap-2 mb-2">
            <List className="w-5 h-5 text-primary" />
            <div className="text-2xl font-bold text-primary">
              {statsLoading ? "..." : stats.totalAnnouncements}
            </div>
          </div>
          <div className="text-sm text-base-content/70 font-medium">
            {t("Total Announcements")}
          </div>
        </div>

        {/* Active Now */}
        <div className="bg-linear-to-br from-base-100 to-base-200 border border-base-300/30 rounded-2xl p-4 text-center shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-[1.02]">
          <div className="flex justify-center items-center gap-2 mb-2">
            <Play className="w-5 h-5 text-secondary" />
            <div className="text-2xl font-bold text-secondary">
              {statsLoading ? "..." : stats.activeNow}
            </div>
          </div>
          <div className="text-sm text-base-content/70 font-medium">
            {t("Active Now")}
          </div>
        </div>

        {/* Saved Templates */}
        <div className="bg-linear-to-br from-base-100 to-base-200 border border-base-300/30 rounded-2xl p-4 text-center shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-[1.02]">
          <div className="flex justify-center items-center gap-2 mb-2">
            <Mail className="w-5 h-5 text-accent" />
            <div className="text-2xl font-bold text-accent">
              {statsLoading ? "..." : stats.savedTemplates}
            </div>
          </div>
          <div className="text-sm text-base-content/70 font-medium">
            {t("Saved Templates")}
          </div>
        </div>

        {/* Current Theme */}
        <div className="bg-linear-to-br from-base-100 to-base-200 border border-base-300/30 rounded-2xl p-4 text-center shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-[1.02]">
          <div className="flex justify-center items-center gap-2 mb-2">
            <Layout className="w-5 h-5 text-info" />
            <div className="text-2xl font-bold text-info">
              {statsLoading ? "..." : stats.currentTheme}
            </div>
          </div>
          <div className="text-sm text-base-content/70 font-medium">
            {t("Current Theme")}
          </div>
        </div>
      </div>

      {/* Action Buttons */}
      <div className="flex justify-end gap-4 pr-2">
        <button
          onClick={() => handleOpenManagement()}
          className="btn btn-primary rounded-xl flex items-center gap-2"
          disabled={loading}
        >
          {loading ? (
            <>
              <Loader2 className="w-5 h-5 animate-spin" />
              {t("Refreshing...")}
            </>
          ) : (
            <>
              <Plus className="w-5 h-5" />
              {t("Add Announcement")}
            </>
          )}
        </button>
        <button
          onClick={handleOpenPreview}
          className="btn btn-outline rounded-xl flex items-center gap-2"
          disabled={loading}
        >
          {loading ? (
            <>
              <Loader2 className="w-5 h-5 animate-spin" />
              {t("Refreshing...")}
            </>
          ) : (
            <>
              <Eye className="w-5 h-5" />
              {t("Preview Bar")}
            </>
          )}
        </button>
      </div>

      {/* Main Content - Table View */}
      <div className="bg-base-100/90 backdrop-blur-xl border border-base-300/30 rounded-3xl shadow-2xl shadow-base-300/10 hover:shadow-2xl hover:shadow-base-300/20 transition-all duration-500 overflow-hidden">
        <div className="p-6">
          <AnnouncementList
            list={list}
            loading={loading}
            onEdit={handleOpenManagement}
            onDelete={requestDelete}
            onToggleActive={toggleActive}
          />
        </div>
      </div>

      {/* Announcement Management Modal */}
      {modals.announcementManagement.open && (
        <AnnouncementManagementModal
          open={modals.announcementManagement.open}
          onClose={() => closeModal("announcementManagement")}
          selectedAnnouncement={
            modals.announcementManagement.selectedAnnouncement
          }
          form={form}
          setForm={setForm}
          onSave={handleSaveAnnouncement}
          onDelete={requestDelete}
          settings={settings}
          setSettings={setSettings}
          templates={templates}
          newTemplateName={newTemplateName}
          setNewTemplateName={setNewTemplateName}
          onSaveSettings={saveSettings}
          onSaveTemplate={handleSaveTemplate}
          onLoadTemplate={handleLoadTemplate}
          previewText={previewText}
        />
      )}

      {/* Preview Modal */}
      {modals.preview.open && (
        <PreviewModal
          open={modals.preview.open}
          onClose={() => closeModal("preview")}
          settings={settings}
          previewText={previewText}
        />
      )}

      <ConfirmModal
        open={confirmOpen}
        title={t("Confirm Deletion")}
        message={t("Are you sure you want to delete this announcement?")}
        confirmText={t("Delete")}
        cancelText={t("Cancel")}
        onConfirm={confirmDelete}
        onCancel={() => setConfirmOpen(false)}
        loading={confirmLoading}
      />
    </section>
  );
};

export default AnnouncementManagerPage;
