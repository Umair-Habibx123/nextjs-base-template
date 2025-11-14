"use client";
import React from "react";
import { Palette } from "lucide-react";

const ColorControls = ({ themeVars, handleVarChange, t }) => {
  const colorKeys = [
    ["--color-primary", "Primary", "text-primary"],
    ["--color-secondary", "Secondary", "text-secondary"],
    ["--color-accent", "Accent", "text-accent"],
    ["--color-neutral", "Neutral", "text-neutral"],
    ["--color-base-100", "Base 100", "text-base-content"],
    ["--color-base-200", "Base 200", "text-base-content"],
    ["--color-base-300", "Base 300", "text-base-content"],
  ];

  return (
    <div className="collapse collapse-arrow bg-base-200 border border-base-300/30 rounded-xl shadow-sm">
      <input type="checkbox" defaultChecked />
      <div className="collapse-title font-semibold text-lg flex items-center gap-3">
        <Palette className="w-5 h-5 text-primary" />
        {t("Colors")}
      </div>
      <div className="collapse-content">
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 pt-4">
          {colorKeys.map(([key, label, textColor]) => (
            <div key={key} className="flex flex-col items-center gap-3">
              <span className={`text-sm font-medium ${textColor}`}>
                {label}
              </span>
              <input
                type="color"
                value={themeVars[key] || "#000000"}
                onChange={(e) => handleVarChange(key, e.target.value)}
                className="w-16 h-16 rounded-2xl border-2 border-base-300 cursor-pointer shadow-lg hover:shadow-xl hover:scale-110 transition-all duration-300"
                title={label}
              />
              <span className="text-xs text-base-content/60 font-mono">
                {themeVars[key]?.substring(0, 7)}
              </span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default ColorControls;