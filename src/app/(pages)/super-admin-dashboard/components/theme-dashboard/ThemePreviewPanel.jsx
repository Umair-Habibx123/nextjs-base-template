"use client";
import React from "react";
import ThemePreview from "./ThemeCustomizer/ThemePreview";
import { Save, Eye } from "lucide-react";

const ThemePreviewPanel = ({ previewTheme, selectedTheme, handleSave, saving, t }) => {
  return (
    <>
     {/* <div className="bg-linear-to-br from-base-100 to-base-200 border border-base-300/30 rounded-2xl shadow-2xl backdrop-blur-lg p-6 transition-all duration-500"> */}
      {/* <div className="flex items-center justify-between mb-6"> */}
        {/* <div className="flex items-center gap-3">
          <div className="p-2 rounded-lg bg-info/10 text-info">
            <Eye className="w-5 h-5" />
          </div>
          <div>
            <h3 className="text-xl font-bold bg-linear-to-r from-base-content to-base-content/80 bg-clip-text text-transparent">
              {t("Live Preview")}
            </h3>
            <p className="text-base-content/60 text-sm">
              {t("Real-time theme preview")}
            </p>
          </div>
        </div> */}
        
        {/* {previewTheme && !["light", "dark"].includes(previewTheme) && (
          <button
            onClick={() => handleSave(previewTheme)}
            disabled={saving}
            className="btn btn-success btn-sm rounded-lg flex items-center gap-2"
          >
            <Save className="w-4 h-4" />
            {saving ? t("Saving...") : t("Save")}
          </button>
        )} */}
      {/* </div> */}

      <ThemePreview themeName={previewTheme || selectedTheme} />
    {/* </div> */}
    </>
  );
};

export default ThemePreviewPanel;