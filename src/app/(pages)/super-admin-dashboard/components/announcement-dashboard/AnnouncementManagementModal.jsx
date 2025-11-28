"use client";

import React, { useEffect, useState } from "react";
import { Megaphone, Sparkles, Settings, Palette, Eye, Edit, Trash2, Plus, X, Save, List, Play, Template, Layout } from "lucide-react";

import { useTranslation } from "react-i18next";
import BarSettingsPanel from "../../components/announcement-dashboard/BarSettingsPanel";
import AnnouncementPreview from "../../components/announcement-dashboard/AnnouncementPreview";


const AnnouncementManagementModal = ({
  open,
  onClose,
  selectedAnnouncement,
  form,
  setForm,
  onSave,
  onDelete,
  settings,
  setSettings,
  templates,
  newTemplateName,
  setNewTemplateName,
  onSaveSettings,
  onSaveTemplate,
  onLoadTemplate,
  previewText
}) => {
  const { t } = useTranslation();
  const isEditing = !!selectedAnnouncement;

  if (!open) return null;

  return (
    <div className="modal modal-open">
      <div className="modal-box max-w-full h-[95vh] w-11/12 p-0 overflow-hidden rounded-3xl">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-base-300/30 bg-base-100/80 backdrop-blur-sm">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-xl bg-primary/10 text-primary">
              {isEditing ? <Edit className="w-6 h-6" /> : <Plus className="w-6 h-6" />}
            </div>
            <div>
              <h2 className="text-2xl font-bold bg-linear-to-r from-base-content to-base-content/80 bg-clip-text text-transparent">
                {isEditing ? t("Edit Announcement") : t("Create New Announcement")}
              </h2>
              <p className="text-base-content/70">
                {isEditing ? t("Update announcement content and settings") : t("Create new announcement and customize settings")}
              </p>
            </div>
          </div>
          
          <div className="flex items-center gap-2">
            <button
              onClick={onClose}
              className="btn btn-ghost btn-circle hover:bg-base-300/50"
            >
              <X className="w-6 h-6" />
            </button>
          </div>
        </div>

        <div className="flex h-[calc(90vh-120px)]">
          {/* Left Panel - Announcement Form & Settings */}
          <div className="flex-1 p-6 overflow-y-auto border-r border-base-300/30">
            <div className="space-y-6">
              {/* Announcement Form */}
              <div className="bg-linear-to-br from-base-100 to-base-200 border border-base-300/30 rounded-2xl p-6 shadow-lg">
                <div className="flex items-center gap-3 mb-4">
                  <Megaphone className="w-5 h-5 text-primary" />
                  <h3 className="text-xl font-bold text-base-content">
                    {t("Announcement Content")}
                  </h3>
                </div>
                
                <textarea
                  value={form}
                  onChange={(e) => setForm(e.target.value)}
                  placeholder={t("Enter announcement text...")}
                  className="textarea textarea-bordered w-full rounded-xl h-32 focus:ring-2 focus:ring-primary/50 focus:border-primary/50 transition-all duration-200 bg-base-200/50"
                  rows={4}
                />
                
                <div className="flex gap-2 mt-4">
                  <button
                    onClick={onSave}
                    className="btn btn-primary rounded-lg flex items-center gap-2"
                  >
                    <Save className="w-4 h-4" />
                    {isEditing ? t("Update Announcement") : t("Create Announcement")}
                  </button>
                  
                  {isEditing && (
                    <button
                      onClick={() => onDelete(selectedAnnouncement.id)}
                      className="btn btn-error rounded-lg flex items-center gap-2"
                    >
                      <Trash2 className="w-4 h-4" />
                      {t("Delete")}
                    </button>
                  )}
                </div>
              </div>

              {/* Settings Panel */}
              <BarSettingsPanel
                settings={settings}
                setSettings={setSettings}
                templates={templates}
                newTemplateName={newTemplateName}
                setNewTemplateName={setNewTemplateName}
                onSave={onSaveSettings}
                onSaveTemplate={onSaveTemplate}
                onLoadTemplate={onLoadTemplate}
                compact={true}
              />
            </div>
          </div>

          {/* Right Panel - Live Preview */}
          <div className="w-[500px] p-6 overflow-y-auto bg-base-100/50">
            <div className="sticky top-0">
              <h3 className="text-lg font-bold mb-4 flex items-center gap-2">
                <Eye className="w-5 h-5" />
                {t("Live Preview")}
              </h3>
              <AnnouncementPreview
                theme={settings.theme}
                bg_color={settings.bg_color}
                text_color={settings.text_color}
                speed={settings.speed}
                html={settings.custom_html}
                css={settings.custom_css}
                previewText={previewText || form || t("Preview announcement will appear here...")}
              />
            </div>
          </div>
        </div>
      </div>
      <div className="modal-backdrop" onClick={onClose}></div>
    </div>
  );
};

export default AnnouncementManagementModal;
