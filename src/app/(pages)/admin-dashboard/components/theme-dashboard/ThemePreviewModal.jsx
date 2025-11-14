"use client";
import React from "react";
import { useTranslation } from "react-i18next";
import { X, Eye } from "lucide-react";
import ThemePreviewPanel from "./ThemePreviewPanel";

const ThemePreviewModal = ({ open, onClose, selectedTheme }) => {
  const { t } = useTranslation();

  if (!open) return null;

  return (
    <div className="modal modal-open">
      {/* 
        Use flex layout to make header fixed and content scrollable 
      */}
      <div className="modal-box max-w-4xl w-11/12 h-[95vh] p-0 flex flex-col rounded-3xl overflow-hidden">
        
        {/* Header */}
        <div className="flex-shrink-0 flex items-center justify-between p-6 border-b border-base-300/30 bg-base-100/90 backdrop-blur-sm">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-xl bg-info/10 text-info">
              <Eye className="w-6 h-6" />
            </div>
            <div>
              <h2 className="text-2xl font-bold bg-linear-to-r from-base-content to-base-content/80 bg-clip-text text-transparent">
                {t("Theme Preview")}
              </h2>
              <p className="text-base-content/70 capitalize">
                {selectedTheme} {t("Theme")}
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="btn btn-ghost btn-circle hover:bg-base-300/50"
          >
            <X className="w-6 h-6" />
          </button>
        </div>

        {/* Scrollable Preview Content */}
        <div className="flex-1 overflow-y-auto p-6 bg-base-100">
          <ThemePreviewPanel
            previewTheme={selectedTheme}
            selectedTheme={selectedTheme}
            t={t}
            compact={true}
          />
        </div>
      </div>

      {/* Clickable backdrop */}
      <div className="modal-backdrop bg-black/40" onClick={onClose}></div>
    </div>
  );
};

export default ThemePreviewModal;
