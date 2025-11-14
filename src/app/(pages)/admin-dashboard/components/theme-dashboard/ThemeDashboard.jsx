"use client";
import React, { useState } from "react";
import { useTheme } from "../../../../context/theme/themeContext";
import { useTranslation } from "react-i18next";
import { toast } from "react-toastify";
import { Plus, Settings, Palette, Eye } from "lucide-react";

// Child components
import ThemeManagementModal from "./ThemeManagementModal";
import ThemePreviewModal from "./ThemePreviewModal.jsx";
import ConfirmModal from "@/app/(pages)/components/common/ConfirmModal";

const ThemeDashboard = ({
  onOpenSettings,
  onOpenPreview,
  onAddTheme,
  onRequestDelete,
}) => {
  const {
    theme,
    deleteTheme,
    availableThemes,
    visibleThemes,
    toggleVisibility,
    saveTheme,
    setPreviewTheme,
  } = useTheme();

  const { t } = useTranslation();

  const [modalOpen, setModalOpen] = useState(false);
  const [previewModalOpen, setPreviewModalOpen] = useState(false);
  const [selectedTheme, setSelectedTheme] = useState(null);
  const [confirmOpen, setConfirmOpen] = useState(false);
  const [themeToDelete, setThemeToDelete] = useState(null);
  const [confirmLoading, setConfirmLoading] = useState(false);


  // Update the handlers to use props
  const handleOpenSettings = (themeName) => {
    onOpenSettings(themeName);
  };

  const handleOpenPreview = (themeName) => {
    onOpenPreview(themeName);
  };

  const handleAddTheme = () => {
    onAddTheme();
  };

  const requestDelete = (themeName) => {
    onRequestDelete(themeName);
  };

  const handleSave = async (themeName) => {
    try {
      await saveTheme(themeName);
      toast.success(t("Theme updated successfully!"));
    } catch {
      toast.error(t("Failed to save theme"));
    }
  };

  const confirmDelete = async () => {
    if (!themeToDelete) return;
    try {
      setConfirmLoading(true);
      deleteTheme(themeToDelete);
      toast.success(t("Theme deleted successfully!"));
    } catch {
      toast.error(t("Failed to delete theme"));
    } finally {
      setConfirmLoading(false);
      setConfirmOpen(false);
      setThemeToDelete(null);
    }
  };


  const getThemeType = (themeName) => {
    return ["light", "dark"].includes(themeName) ? "System" : "Custom";
  };

  const isSystemTheme = (themeName) => {
    return ["light", "dark"].includes(themeName);
  };

  return (
    <>
      <div className="p-2 transition-all duration-500">
        {/* Header with Add Button */}
        <div className="flex justify-between items-center mb-6">
          <div className="flex items-center gap-3">
            <Palette className="w-8 h-8 text-primary" />
            <div>
              <h2 className="text-2xl font-bold bg-linear-to-r from-base-content to-base-content/80 bg-clip-text text-transparent">
                {t("Theme Management")}
              </h2>
              <p className="text-base-content/70">
                {t("Manage and customize your application themes")}
              </p>
            </div>
          </div>
          <button
            onClick={handleAddTheme}
            className="btn btn-primary rounded-xl flex items-center gap-2"
          >
            <Plus className="w-5 h-5" />
            {t("Add Theme")}
          </button>
        </div>

        {/* Themes Table */}
        <div className="bg-base-100/90 backdrop-blur-xl border border-base-300/30 rounded-2xl shadow-xl overflow-hidden">
          <div className="overflow-x-auto">
            <table className="table table-zebra w-full">
              <thead className="bg-base-200/50">
                <tr>
                  <th className="font-bold text-base-content">
                    {t("Theme Name")}
                  </th>
                  <th className="font-bold text-base-content">{t("Type")}</th>
                  <th className="font-bold text-base-content">{t("Status")}</th>
                  <th className="font-bold text-base-content">
                    {t("Actions")}
                  </th>
                </tr>
              </thead>
              <tbody>
                {availableThemes.map((themeName) => (
                  <tr
                    key={themeName}
                    className="hover:bg-base-200/30 transition-colors"
                  >
                    <td className="font-medium capitalize">{themeName}</td>
                    <td>
                      <span
                        className={`badge ${
                          getThemeType(themeName) === "System"
                            ? "badge-secondary"
                            : "badge-primary"
                        }`}
                      >
                        {getThemeType(themeName)}
                      </span>
                    </td>
                    <td>
                      {!isSystemTheme(themeName) ? (
                        <label className="cursor-pointer">
                          <input
                            type="checkbox"
                            checked={visibleThemes[themeName] ?? true}
                            onChange={() => toggleVisibility(themeName)}
                            className="toggle toggle-primary toggle-sm"
                          />
                        </label>
                      ) : (
                        <span className="text-base-content/50 text-sm">
                          {t("Always visible")}
                        </span>
                      )}
                    </td>
                    <td className="text-right">
                      {isSystemTheme(themeName) ? (
                        <button
                          onClick={() => handleOpenPreview(themeName)}
                          className="btn btn-ghost btn-sm hover:btn-info hover:text-info-content flex items-center gap-2"
                          title={t("Preview Theme")}
                        >
                          <Eye className="w-4 h-4" />
                          {t("Preview")}
                        </button>
                      ) : (
                        <button
                          onClick={() => handleOpenSettings(themeName)}
                          className="btn btn-ghost btn-sm hover:btn-primary hover:text-primary-content flex items-center gap-2"
                          title={t("Theme Settings")}
                        >
                          <Settings className="w-4 h-4" />
                          {t("Settings")}
                        </button>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Empty State */}
        {availableThemes.length === 0 && (
          <div className="text-center py-12">
            <Palette className="w-16 h-16 text-base-content/20 mx-auto mb-4" />
            <h3 className="text-lg font-semibold text-base-content/70 mb-2">
              {t("No themes found")}
            </h3>
            <p className="text-base-content/50 mb-4">
              {t("Get started by creating your first custom theme")}
            </p>
            <button
              onClick={handleAddTheme}
              className="btn btn-primary rounded-xl"
            >
              <Plus className="w-5 h-5" />
              {t("Create Your First Theme")}
            </button>
          </div>
        )}
      </div>

      {/* Theme Management Modal (for custom themes) */}
      <ThemeManagementModal
        open={modalOpen}
        onClose={() => setModalOpen(false)}
        selectedTheme={selectedTheme}
        onSave={handleSave}
        onDelete={requestDelete}
      />

      {/* Theme Preview Modal (for system themes) */}
      <ThemePreviewModal
        open={previewModalOpen}
        onClose={() => setPreviewModalOpen(false)}
        selectedTheme={selectedTheme}
      />

      {/* Delete Confirmation Modal */}
      <ConfirmModal
        open={confirmOpen}
        title={t("Confirm Theme Deletion")}
        message={t(
          `Are you sure you want to delete the theme "${themeToDelete}"? This action cannot be undone.`
        )}
        confirmText={t("Delete")}
        cancelText={t("Cancel")}
        onConfirm={confirmDelete}
        onCancel={() => setConfirmOpen(false)}
        loading={confirmLoading}
      />
    </>
  );
};

export default ThemeDashboard;
