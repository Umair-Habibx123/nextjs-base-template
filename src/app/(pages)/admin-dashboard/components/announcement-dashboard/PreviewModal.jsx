"use client";

import React, { useEffect, useState } from "react";
import { Megaphone, Sparkles, Settings, Palette, Eye, Edit, Trash2, Plus, X, Save, List, Play, Template, Layout } from "lucide-react";

import { useTranslation } from "react-i18next";
import AnnouncementPreview from "../../components/announcement-dashboard/AnnouncementPreview";

const PreviewModal = ({ open, onClose, settings, previewText }) => {
  const { t } = useTranslation();

  if (!open) return null;

  return (
    <div className="modal modal-open">
      <div className="modal-box max-w-4xl w-11/12 p-0 overflow-hidden rounded-3xl">
        <div className="flex items-center justify-between p-6 border-b border-base-300/30">
          <div className="flex items-center gap-3">
            <Eye className="w-6 h-6 text-primary" />
            <h2 className="text-2xl font-bold">{t("Announcement Bar Preview")}</h2>
          </div>
          <button onClick={onClose} className="btn btn-ghost btn-circle">
            <X className="w-6 h-6" />
          </button>
        </div>
        
        <div className="p-6">
          <AnnouncementPreview
            theme={settings.theme}
            bg_color={settings.bg_color}
            text_color={settings.text_color}
            speed={settings.speed}
            html={settings.custom_html}
            css={settings.custom_css}
            previewText={previewText || t("No active announcements to preview")}
            fullWidth={true}
          />
        </div>
      </div>
      <div className="modal-backdrop" onClick={onClose}></div>
    </div>
  );
};


export default  PreviewModal;