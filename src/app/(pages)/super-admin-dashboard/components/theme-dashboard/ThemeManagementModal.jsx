"use client";
import React, { useState, useEffect } from "react";
import { useTheme } from "../../../../context/theme/themeContext";
import { useTranslation } from "react-i18next";
import { toast } from "react-toastify";
import { X, Wand2, Save, Trash2, Palette, Edit } from "lucide-react";

// Import existing components
import ThemeAdder from "./ThemeAdder";
import ThemeCustomizer from "./ThemeCustomizer/ThemeCustomizer";
import ThemePreviewPanel from "./ThemePreviewPanel";

const ThemeManagementModal = ({
  open,
  onClose,
  selectedTheme,
  onSave,
  onDelete,
}) => {
  const {
    customThemes,
    updateThemeVar,
    addTheme,
    previewTheme,
    setPreviewTheme,
    renameTheme,
  } = useTheme();

  const { t } = useTranslation();
  const [name, setName] = useState("");
  const [saving, setSaving] = useState(false);
  const [editingName, setEditingName] = useState(false);

  useEffect(() => {
    if (open) {
      if (selectedTheme) {
        // Editing existing theme
        setPreviewTheme(selectedTheme);
        setName(selectedTheme);
        setEditingName(false);
      } else {
        // Adding new theme
        setPreviewTheme(null);
        setName("");
        setEditingName(true);
      }
    }
  }, [open, selectedTheme, setPreviewTheme]);

  const handleAddTheme = () => {
    if (!name.trim()) {
      toast.error(t("Please enter a valid theme name"));
      return;
    }

    if (customThemes[name.trim()]) {
      toast.error(t("Theme name already exists"));
      return;
    }

    addTheme(name.trim());
    toast.success(t("New theme added successfully!"));
    setPreviewTheme(name.trim());
    setEditingName(false);
  };

  const handleSaveTheme = async () => {
    if (!previewTheme) return;

    try {
      setSaving(true);
      await onSave(previewTheme);
    } catch (error) {
      toast.error(t("Failed to save theme"));
    } finally {
      setSaving(false);
    }
  };

  const handleDeleteTheme = () => {
    if (previewTheme) {
      onDelete(previewTheme);
      onClose();
    }
  };

  const handleUpdateThemeName = async () => {
    if (!name.trim() || name.trim() === previewTheme) {
      setEditingName(false);
      return;
    }

    if (customThemes[name.trim()]) {
      toast.error(t("Theme name already exists"));
      return;
    }

    try {
      await renameTheme(previewTheme, name.trim());
      toast.success(t("Theme renamed successfully!"));
    } catch (err) {
      toast.error(t("Failed to rename theme"));
      console.error(err);
    } finally {
      setEditingName(false);
    }
  };

  const isEditing = !!selectedTheme;

  if (!open) return null;

  return (
    <div className="modal modal-open">
      <div className="modal-box max-w-full h-[95vh] w-11/12 p-0 overflow-hidden rounded-3xl">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-base-300/30 bg-base-100/80 backdrop-blur-sm">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-xl bg-primary/10 text-primary">
              {isEditing ? (
                <Edit className="w-6 h-6" />
              ) : (
                <Palette className="w-6 h-6" />
              )}
            </div>
            <div>
              <h2 className="text-2xl font-bold bg-linear-to-r from-base-content to-base-content/80 bg-clip-text text-transparent">
                {isEditing ? t("Edit Theme") : t("Create New Theme")}
              </h2>
              <p className="text-base-content/70">
                {isEditing
                  ? t("Customize your theme settings")
                  : t("Create and customize a new theme")}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            {/* Action Buttons */}
            {previewTheme && (
              <>
                <button
                  onClick={handleSaveTheme}
                  disabled={saving}
                  className="btn btn-success btn-sm rounded-lg flex items-center gap-2"
                >
                  <Save className="w-4 h-4" />
                  {saving ? t("Saving...") : t("Save")}
                </button>

                <button
                  onClick={handleDeleteTheme}
                  className="btn btn-error btn-sm rounded-lg flex items-center gap-2"
                >
                  <Trash2 className="w-4 h-4" />
                  {t("Delete")}
                </button>
              </>
            )}

            <button
              onClick={onClose}
              className="btn btn-ghost btn-circle hover:bg-base-300/50"
            >
              <X className="w-6 h-6" />
            </button>
          </div>
        </div>

        <div className="flex h-[calc(90vh-120px)]">
          {/* Left Panel - Theme Name & Customization */}
          <div className="flex-1 p-6 overflow-y-auto border-r border-base-300/30">
            {!isEditing && (
              <div className="space-y-6">
                <ThemeAdder
                  name={name}
                  setName={setName}
                  handleAdd={handleAddTheme}
                  t={t}
                />
              </div>
            )}

            {isEditing && (
              <div className="space-y-6">
                {/* Theme Name Editor */}
                <div className="bg-linear-to-br from-base-100 to-base-200 border border-base-300/30 rounded-2xl p-6 shadow-lg">
                  <div className="flex items-center gap-3 mb-4">
                    <Edit className="w-5 h-5 text-primary" />
                    <h3 className="text-xl font-bold text-base-content">
                      {t("Theme Name")}
                    </h3>
                  </div>

                  {editingName ? (
                    <div className="space-y-4">
                      <input
                        value={name}
                        onChange={(e) => setName(e.target.value)}
                        placeholder={t("Enter theme name")}
                        className="input input-bordered w-full rounded-xl h-12 focus:ring-2 focus:ring-primary/50 focus:border-primary/50 transition-all duration-200 bg-base-200/50"
                        onKeyPress={(e) =>
                          e.key === "Enter" && handleUpdateThemeName()
                        }
                        autoFocus
                      />
                      <div className="flex gap-2">
                        <button
                          onClick={handleUpdateThemeName}
                          className="btn btn-primary btn-sm"
                        >
                          {t("Update Name")}
                        </button>
                        <button
                          onClick={() => {
                            setName(selectedTheme);
                            setEditingName(false);
                          }}
                          className="btn btn-ghost btn-sm"
                        >
                          {t("Cancel")}
                        </button>
                      </div>
                    </div>
                  ) : (
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-2xl font-bold text-base-content capitalize">
                          {name}
                        </p>
                        <p className="text-base-content/70 text-sm">
                          {t("Current theme name")}
                        </p>
                      </div>
                      <button
                        onClick={() => setEditingName(true)}
                        className="btn btn-ghost btn-sm"
                      >
                        {t("Edit Name")}
                      </button>
                    </div>
                  )}
                </div>

                {/* Theme Customizer */}
                {previewTheme && customThemes[previewTheme] && (
                  <div className="space-y-6">
                    <div className="flex items-center gap-3">
                      <Wand2 className="w-5 h-5 text-primary" />
                      <h3 className="text-xl font-bold text-base-content">
                        {t("Customize Theme")}
                      </h3>
                    </div>

                    <ThemeCustomizer
                      themeVars={customThemes[previewTheme]}
                      handleVarChange={(key, value) =>
                        updateThemeVar(previewTheme, key, value)
                      }
                      selectedTheme={previewTheme}
                      t={t}
                    />
                  </div>
                )}
              </div>
            )}
          </div>

          {/* Right Panel - Live Preview */}
          <div className="w-[500px] p-6 overflow-y-auto bg-base-100/50">
            <ThemePreviewPanel
              previewTheme={previewTheme}
              selectedTheme={previewTheme}
              handleSave={handleSaveTheme}
              saving={saving}
              t={t}
            />
          </div>
        </div>
      </div>
      <div className="modal-backdrop" onClick={onClose}></div>
    </div>
  );
};

export default ThemeManagementModal;
