"use client";

import React from "react";
import { Save, Download, Upload, Loader2, Zap, Settings } from "lucide-react";
import { useTranslation } from "react-i18next";
import { useState } from "react";

const BarSettingsPanel = ({
  settings,
  setSettings,
  templates,
  onSave,
  onSaveTemplate,
  onLoadTemplate,
  newTemplateName,
  setNewTemplateName,
  compact = false,
}) => {
  const { t } = useTranslation();

  const [saving, setSaving] = useState(false);

  const handleSaveClick = async () => {
    try {
      setSaving(true);
      await onSave(); // wait for parent save handler
    } catch (err) {
      console.error(err);
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className={`bg-linear-to-br from-base-100 to-base-200 border border-base-300/30 rounded-2xl shadow-2xl backdrop-blur-lg transition-all duration-500 ${
      compact ? "p-4" : "p-6"
    }`}>
      {!compact && (
        <div className="flex items-center gap-3 mb-6">
          <div className="p-2 rounded-xl bg-primary/10 text-primary">
            <Settings className="w-5 h-5" />
          </div>
          <div>
            <h2 className="text-xl font-bold bg-linear-to-r from-base-content to-base-content/80 bg-clip-text text-transparent">
              {t("Announcement Bar Settings")}
            </h2>
            <p className="text-base-content/60 text-sm">
              {t("Customize the appearance and behavior")}
            </p>
          </div>
        </div>
      )}

      {/* Controls Grid */}
      <div className={`grid grid-cols-1 ${compact ? 'gap-4' : 'md:grid-cols-2 gap-6 mb-6'}`}>
        <label className="form-control">
          {!compact && (
            <span className="label-text font-semibold text-base-content mb-2">
              {t("Theme")}
            </span>
          )}
          <select
            className="select select-bordered rounded-xl focus:ring-2 focus:ring-primary/50 bg-base-200/50 w-full"
            value={settings.theme}
            onChange={(e) =>
              setSettings({ ...settings, theme: e.target.value })
            }
          >
            <option value="scroll-left">{t("Scroll Left")}</option>
            <option value="scroll-right">{t("Scroll Right")}</option>
            <option value="static">{t("Static")}</option>
            <option value="custom">{t("Custom HTML")}</option>
          </select>
        </label>

        <label className="form-control">
          {!compact && (
            <span className="label-text font-semibold text-base-content mb-2">
              {t("Speed")} ({t("seconds")})
            </span>
          )}
          <div className={compact ? "space-y-2" : ""}>
            <input
              type="range"
              min="10"
              max="60"
              step="5"
              className="range range-primary range-sm w-full"
              value={settings.speed}
              onChange={(e) =>
                setSettings({ ...settings, speed: +e.target.value })
              }
            />
            <div className="flex justify-between text-xs text-base-content/60 px-1">
              <span>10s</span>
              <span className="font-semibold">{settings.speed}s</span>
              <span>60s</span>
            </div>
          </div>
        </label>

        <label className="form-control">
          {!compact && (
            <span className="label-text font-semibold text-base-content mb-2">
              {t("Background Color")}
            </span>
          )}
          <div className="flex gap-3 items-center">
            <input
              type="color"
              className="w-10 h-10 rounded-xl border-2 border-base-300 cursor-pointer hover:scale-105 transition-transform"
              value={settings.bg_color}
              onChange={(e) =>
                setSettings({ ...settings, bg_color: e.target.value })
              }
            />
            {!compact && (
              <span className="text-sm font-mono text-base-content/70">
                {settings.bg_color}
              </span>
            )}
          </div>
        </label>

        <label className="form-control">
          {!compact && (
            <span className="label-text font-semibold text-base-content mb-2">
              {t("Text Color")}
            </span>
          )}
          <div className="flex gap-3 items-center">
            <input
              type="color"
              className="w-10 h-10 rounded-xl border-2 border-base-300 cursor-pointer hover:scale-105 transition-transform"
              value={settings.text_color}
              onChange={(e) =>
                setSettings({ ...settings, text_color: e.target.value })
              }
            />
            {!compact && (
              <span className="text-sm font-mono text-base-content/70">
                {settings.text_color}
              </span>
            )}
          </div>
        </label>
      </div>

      {/* Custom Template Section */}
      {settings.theme === "custom" && (
        <div className={`space-y-4 mt-4 p-4 bg-base-200/50 rounded-xl border border-base-300/20 ${
          compact ? 'text-sm' : ''
        }`}>
          <div className="flex items-center gap-3">
            <Zap className="w-4 h-4 text-warning" />
            <h3 className="font-semibold text-base-content">
              {t("Custom HTML & CSS")}
            </h3>
          </div>

          <div className="space-y-3">
            <label className="form-control">
              <span className="label-text font-semibold text-base-content mb-2">
                {t("Custom HTML")}
              </span>
              <textarea
                rows={compact ? 3 : 4}
                className="textarea textarea-bordered rounded-xl font-mono text-sm focus:ring-2 focus:ring-primary/50 bg-base-100 w-full"
                value={settings.custom_html || ""}
                onChange={(e) =>
                  setSettings({ ...settings, custom_html: e.target.value })
                }
                placeholder={t("Enter your custom HTML here...")}
              />
            </label>

            <label className="form-control">
              <span className="label-text font-semibold text-base-content mb-2">
                {t("Custom CSS")}
              </span>
              <textarea
                rows={compact ? 3 : 4}
                className="textarea textarea-bordered rounded-xl font-mono text-sm focus:ring-2 focus:ring-primary/50 bg-base-100 w-full"
                value={settings.custom_css || ""}
                onChange={(e) =>
                  setSettings({ ...settings, custom_css: e.target.value })
                }
                placeholder={t("Enter your custom CSS here...")}
              />
            </label>
          </div>

          <div className="space-y-3 pt-3 border-t border-base-300/30">
            <div className="flex items-center gap-3">
              <Download className="w-4 h-4 text-success" />
              <h4 className="font-semibold text-base-content">
                {t("Template Management")}
              </h4>
            </div>

            <div className="flex gap-2 mb-2">
              <input
                type="text"
                placeholder={t("Template Name")}
                className="input input-bordered flex-1 rounded-xl focus:ring-2 focus:ring-success/50 bg-base-200/50 text-sm"
                value={newTemplateName}
                onChange={(e) => setNewTemplateName(e.target.value)}
              />
              <button
                className="btn btn-success rounded-xl flex items-center gap-2 hover:scale-105 transition-transform btn-sm"
                onClick={onSaveTemplate}
              >
                <Save className="w-3 h-3" />
                {t("Save")}
              </button>
            </div>

            <select
              className="select select-bordered w-full rounded-xl focus:ring-2 focus:ring-primary/50 bg-base-200/50 text-sm"
              value={""} // default to empty
              onChange={(e) => onLoadTemplate(e.target.value)}
            >
              <option value="" disabled>
                {t("Select Saved Template")}
              </option>
              {templates.map((tItem) => (
                <option key={tItem.id} value={tItem.id}>
                  {tItem.name}
                </option>
              ))}
            </select>
          </div>
        </div>
      )}

      {/* Save Button - Only show in non-compact mode */}
      {!compact && (
        <div className="flex gap-3 mt-6 pt-6 border-t border-base-300/30">
          <button
            onClick={handleSaveClick}
            disabled={saving}
            className={`btn btn-primary btn-lg rounded-xl flex-1 shadow-lg hover:shadow-xl transition-all duration-300 transform flex items-center gap-2 font-semibold ${
              saving ? "opacity-70 cursor-not-allowed" : "hover:scale-105"
            }`}
          >
            {saving ? (
              <>
                <Loader2 className="w-5 h-5 animate-spin" />
                {t("Saving...")}
              </>
            ) : (
              <>
                <Save className="w-5 h-5" />
                {t("Save Settings")}
              </>
            )}
          </button>
        </div>
      )}
    </div>
  );
};

export default BarSettingsPanel;