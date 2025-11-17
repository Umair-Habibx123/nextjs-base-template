"use client";

import React, { useEffect, useState } from "react";
import {
  Megaphone,
  Sparkles,
  List,
  Play,
  Mail,
  Layout,
  Settings,
} from "lucide-react";
import { toast } from "react-toastify";
import { useTranslation } from "react-i18next";
import Loading from "../../components/layout/Loading";
import ConfirmModal from "../../components/common/ConfirmModal";
import GlobalSettings from "../components/global-settings/GlobalSettings";

const SettingsPage = () => {
  const { t } = useTranslation();

  const [statsLoading, setStatsLoading] = useState(true);
  const [confirmOpen, setConfirmOpen] = useState(false);
  const [confirmLoading, setConfirmLoading] = useState(false);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

 const [form, setForm] = useState({
  site_name: "",
  site_logo: "",
  site_favicon: "",
  og_image: "",
  footer_links: [],
  footer_socials: [],
  site_password_enabled: false,
  site_password: "", // Ensure this starts as empty string
  site_under_construction: false,
});

  useEffect(() => {
    loadSettings();
  }, []);

 const loadSettings = async () => {
  try {
    const res = await fetch("/api/admin/settings/global");
    const json = await res.json();
    
    // Ensure site_password is never null or undefined
    const data = {
      ...json.data,
      site_password: json.data.site_password ?? "",
      site_password_enabled: Boolean(json.data.site_password_enabled)
    };
    
    setForm(data);
    setLoading(false);
  } catch (err) {
    toast.error("Failed to load settings.");
  }
};

  const saveSettings = async () => {
    setSaving(true);
    try {
      const res = await fetch("/api/admin/settings/global", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(form),
      });

      const json = await res.json();
      if (res.ok) {
        toast.success("Settings updated successfully!");
      } else {
        throw new Error(json.error || "Failed to save settings");
      }
    } catch (err) {
      toast.error("Error saving settings");
      console.error("Save error:", err);
    }
    setSaving(false);
  };

  const confirmDelete = async () => {};

  if (loading) return <Loading />;

  return (
    <section className="max-w-full space-y-8 animate-fade-in">
      {/* 🌟 Modern Header */}
      <div className="flex items-center gap-4 p-6 bg-linear-to-r from-primary/5 via-secondary/5 to-accent/5 rounded-3xl border border-base-300/20 backdrop-blur-lg">
        <div className="p-3 rounded-2xl bg-linear-to-br from-primary to-primary/80 text-primary-content shadow-lg">
          <Layout className="w-7 h-7" />
        </div>
        <div className="flex-1">
          <h1 className="text-3xl font-bold bg-linear-to-r from-base-content to-base-content/70 bg-clip-text text-transparent">
            {t("Global Settings")}
          </h1>
          <p className="text-base-content/70 mt-2 text-lg leading-relaxed">
            {t("Configure your website's global appearance and behavior")}
          </p>
        </div>
        <div className="hidden lg:flex items-center gap-2 px-4 py-2 bg-primary/10 rounded-full border border-primary/20 backdrop-blur-sm">
          <Settings className="w-4 h-4 text-primary" />
        </div>
      </div>

      {/* Global Settings Component */}
      <GlobalSettings
        form={form}
        setForm={setForm}
        saving={saving}
        saveSettings={saveSettings}
      />

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

export default SettingsPage;
