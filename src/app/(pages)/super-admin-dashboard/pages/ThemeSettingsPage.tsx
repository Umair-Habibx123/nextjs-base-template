"use client";
import React, { useState, useEffect } from "react";
import { useTranslation } from "react-i18next";
import ThemeDashboard from "../components/theme-dashboard/ThemeDashboard";
import ThemeManagementModal from "../components/theme-dashboard/ThemeManagementModal";
import ThemePreviewModal from "../components/theme-dashboard/ThemePreviewModal";
import ConfirmModal from "@/app/(pages)/components/common/ConfirmModal";
import {
  Palette,
  Sparkles,
  Grid3X3,
  Layers,
  Brush,
  Eye,
  EyeOff,
} from "lucide-react";
import { useTheme } from "../../../context/theme/themeContext";
import { toast } from "react-toastify";

interface Theme {
  name: string;
  vars: string; // JSON string of theme variables
  visible: number; // 0 or 1
  createdAt: number;
  updatedAt: number;
}

interface ThemeStats {
  totalThemes: number;
  visibleThemes: number;
  hiddenThemes: number;
  recentlyCreated: number; // Themes created in the last 30 days
  customThemes: number; // Themes that are not default/system themes
}

const ThemeSettingsPage = () => {
  const { t } = useTranslation();
  const {
    deleteTheme,
    saveTheme,
    setPreviewTheme,
    themes: contextThemes,
  } = useTheme();

  const [modals, setModals] = useState({
    themeManagement: { open: false, selectedTheme: null },
    themePreview: { open: false, selectedTheme: null },
    confirmDelete: { open: false, themeToDelete: null },
  });
  const [confirmLoading, setConfirmLoading] = useState(false);
  const [themeStats, setThemeStats] = useState<ThemeStats>({
    totalThemes: 0,
    visibleThemes: 0,
    hiddenThemes: 0,
    recentlyCreated: 0,
    customThemes: 0,
  });
  const [loading, setLoading] = useState(true);

  // Fetch theme statistics
  const fetchThemeStats = async () => {
    try {
      setLoading(true);
      const response = await fetch("/api/super-admin/theme-settings");

      if (!response.ok) {
        throw new Error("Failed to fetch themes");
      }

      const themes: Theme[] = await response.json();

      // Calculate statistics
      const now = Date.now();
      const thirtyDaysAgo = now - 30 * 24 * 60 * 60 * 1000; // 30 days in milliseconds

      const stats: ThemeStats = {
        totalThemes: themes.length,
        visibleThemes: themes.filter((theme) => theme.visible === 1).length,
        hiddenThemes: themes.filter((theme) => theme.visible === 0).length,
        recentlyCreated: themes.filter(
          (theme) => theme.createdAt >= thirtyDaysAgo
        ).length,
        customThemes: themes.filter(
          (theme) =>
            !["default", "light", "dark", "system"].includes(
              theme.name.toLowerCase()
            )
        ).length,
      };

      setThemeStats(stats);
    } catch (error) {
      console.error("Error fetching theme stats:", error);
      toast.error(t("Failed to load theme statistics"));
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchThemeStats();
  }, []);

  // Refresh stats when themes change (after save/delete operations)
  useEffect(() => {
    if (contextThemes && contextThemes.length > 0) {
      // If contextThemes is available, use it to calculate stats
      const now = Date.now();
      const thirtyDaysAgo = now - 30 * 24 * 60 * 60 * 1000;

      const stats: ThemeStats = {
        totalThemes: contextThemes.length,
        visibleThemes: contextThemes.filter((theme) => theme.visible).length,
        hiddenThemes: contextThemes.filter((theme) => !theme.visible).length,
        recentlyCreated: contextThemes.filter(
          (theme) =>
            theme.createdAt &&
            new Date(theme.createdAt).getTime() >= thirtyDaysAgo
        ).length,
        customThemes: contextThemes.filter(
          (theme) =>
            !["default", "light", "dark", "system"].includes(
              theme.name.toLowerCase()
            )
        ).length,
      };

      setThemeStats(stats);
    }
  }, [contextThemes]);

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

  const handleOpenSettings = (themeName) => {
    setPreviewTheme(themeName);
    openModal("themeManagement", { selectedTheme: themeName });
  };

  const handleOpenPreview = (themeName) => {
    setPreviewTheme(themeName);
    openModal("themePreview", { selectedTheme: themeName });
  };

  const handleAddTheme = () => {
    setPreviewTheme(null);
    openModal("themeManagement", { selectedTheme: null });
  };

  const handleSave = async (themeName) => {
    try {
      await saveTheme(themeName);
      toast.success(t("Theme updated successfully!"));
      closeModal("themeManagement");
      // Refresh stats after saving
      fetchThemeStats();
    } catch {
      toast.error(t("Failed to save theme"));
    }
  };

  const confirmDelete = async () => {
    if (!modals.confirmDelete.themeToDelete) return;
    try {
      setConfirmLoading(true);
      await deleteTheme(modals.confirmDelete.themeToDelete);
      toast.success(t("Theme deleted successfully!"));
      closeModal("confirmDelete");
      // Refresh stats after deletion
      fetchThemeStats();
    } catch {
      toast.error(t("Failed to delete theme"));
    } finally {
      setConfirmLoading(false);
    }
  };

  const requestDelete = (themeName) => {
    openModal("confirmDelete", { themeToDelete: themeName });
  };

  return (
    <>
      <section className="max-w-full space-y-8 animate-fade-in">
        {/* 🟣 Modern Header with Gradient Background */}
        <div className="relative overflow-hidden p-8 bg-linear-to-br from-primary/10 via-secondary/5 to-accent/5 rounded-3xl border border-base-300/20 backdrop-blur-xl">
          {/* Background Pattern */}
          <div className="absolute inset-0 opacity-5">
            <div className="absolute inset-0 bg-[radial-gradient(circle_at_1px_1px,oklch(var(--bc))_1px,transparent_0)] bg-size-[24px_24px]"></div>
          </div>

          <div className="relative flex items-center gap-4">
            <div className="p-3 rounded-2xl bg-linear-to-br from-primary to-primary/80 text-primary-content shadow-lg shadow-primary/25">
              <Palette className="w-7 h-7" />
            </div>
            <div className="flex-1">
              <h2 className="text-3xl font-bold bg-linear-to-r from-base-content to-base-content/70 bg-clip-text text-transparent">
                {t("Theme Settings")}
              </h2>
              <p className="text-base-content/70 mt-2 text-lg leading-relaxed">
                {t(
                  "Customize your application experience with themes and color presets."
                )}
              </p>
            </div>
            <div className="hidden lg:flex items-center gap-2 px-4 py-2 bg-primary/10 rounded-full border border-primary/20 backdrop-blur-sm">
              <Sparkles className="w-4 h-4 text-primary" />
              <span className="text-sm font-medium text-primary">
                {loading
                  ? t("Loading...")
                  : `${themeStats.totalThemes} ${t("Themes")}`}
              </span>
            </div>
          </div>
        </div>

        {/* 📊 Accurate Theme Stats Overview */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          {/* Total Themes */}
          <div className="bg-linear-to-br from-base-100 to-base-200 border border-base-300/30 rounded-2xl p-4 text-center shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-[1.02]">
            <div className="flex justify-center items-center gap-2 mb-2">
              <Palette className="w-5 h-5 text-primary" />
              <div className="text-2xl font-bold text-primary">
                {loading ? "..." : themeStats.totalThemes + 2}
              </div>
            </div>
            <div className="text-sm text-base-content/70 font-medium">
              {t("Total Themes")}
            </div>
          </div>

          {/* Visible Themes */}
          <div className="bg-linear-to-br from-base-100 to-base-200 border border-base-300/30 rounded-2xl p-4 text-center shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-[1.02]">
            <div className="flex justify-center items-center gap-2 mb-2">
              <Eye className="w-5 h-5 text-secondary" />
              <div className="text-2xl font-bold text-secondary">
                {loading ? "..." : themeStats.visibleThemes + 2}
              </div>
            </div>
            <div className="text-sm text-base-content/70 font-medium">
              {t("Visible Themes")}
            </div>
          </div>

          {/* Custom Themes */}
          <div className="bg-linear-to-br from-base-100 to-base-200 border border-base-300/30 rounded-2xl p-4 text-center shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-[1.02]">
            <div className="flex justify-center items-center gap-2 mb-2">
              <Brush className="w-5 h-5 text-accent" />
              <div className="text-2xl font-bold text-accent">
                {loading ? "..." : themeStats.customThemes}
              </div>
            </div>
            <div className="text-sm text-base-content/70 font-medium">
              {t("Custom Themes")}
            </div>
          </div>

          {/* Recent Themes */}
          <div className="bg-linear-to-br from-base-100 to-base-200 border border-base-300/30 rounded-2xl p-4 text-center shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-[1.02]">
            <div className="flex justify-center items-center gap-2 mb-2">
              <Sparkles className="w-5 h-5 text-info" />
              <div className="text-2xl font-bold text-info">
                {loading ? "..." : themeStats.recentlyCreated}
              </div>
            </div>
            <div className="text-sm text-base-content/70 font-medium">
              {t("New This Month")}
            </div>
          </div>
        </div>

        {/* 🎨 Main Content with Enhanced Visual Design */}
        <div className="bg-base-100/90 backdrop-blur-xl border border-base-300/30 rounded-3xl shadow-2xl shadow-base-300/10 hover:shadow-2xl hover:shadow-base-300/20 transition-all duration-500 overflow-hidden">
          {/* 🔹 Enhanced Theme Dashboard */}
          <div className="p-2">
            <ThemeDashboard
              onOpenSettings={handleOpenSettings}
              onOpenPreview={handleOpenPreview}
              onAddTheme={handleAddTheme}
              onRequestDelete={requestDelete}
            />
          </div>
        </div>
      </section>

      {/* Global Modals */}
      <ThemeManagementModal
        open={modals.themeManagement.open}
        onClose={() => closeModal("themeManagement")}
        selectedTheme={modals.themeManagement.selectedTheme}
        onSave={handleSave}
        onDelete={requestDelete}
      />

      <ThemePreviewModal
        open={modals.themePreview.open}
        onClose={() => closeModal("themePreview")}
        selectedTheme={modals.themePreview.selectedTheme}
      />

      <ConfirmModal
        open={modals.confirmDelete.open}
        title={t("Confirm Theme Deletion")}
        message={t(
          `Are you sure you want to delete the theme "${modals.confirmDelete.themeToDelete}"? This action cannot be undone.`
        )}
        confirmText={t("Delete")}
        cancelText={t("Cancel")}
        onConfirm={confirmDelete}
        onCancel={() => closeModal("confirmDelete")}
        loading={confirmLoading}
      />
    </>
  );
};

export default ThemeSettingsPage;
