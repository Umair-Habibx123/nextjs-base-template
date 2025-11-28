"use client";
import React from "react";
import { Square } from "lucide-react";

const BorderSizeControls = ({ themeVars, handleVarChange, t }) => {
  const fieldKeys = [
    ["--size-button", "Button"],
    ["--size-input", "Input"],
    ["--size-select", "Select"],
    ["--size-tab", "Tab"],
  ];

  const selectorKeys = [
    ["--size-checkbox", "Checkbox"],
    ["--size-toggle", "Toggle"],
    ["--size-badge", "Badge"],
  ];

  return (
    <div className="collapse collapse-arrow bg-base-200 border border-base-300/30 rounded-xl shadow-sm">
      <input type="checkbox" />
      <div className="collapse-title font-semibold text-lg flex items-center gap-3">
        <Square className="w-5 h-5 text-info" />
        {t("Borders & Sizes")}
      </div>
      <div className="collapse-content space-y-6">
        <div>
          <h4 className="text-sm font-semibold text-base-content/70 mb-2">
            {t("Border Width")}
          </h4>
          <input
            type="range"
            min="0"
            max="4"
            step="0.25"
            value={parseFloat(themeVars["--border-width"]) || 1}
            onChange={(e) =>
              handleVarChange("--border-width", `${e.target.value}px`)
            }
            className="range range-info range-sm"
          />
          <p className="text-xs text-base-content/60">
            {parseFloat(themeVars["--border-width"]) || 1}px
          </p>
        </div>

        <div>
          <h4 className="text-sm font-semibold text-base-content/70 mb-2">
            {t("Fields")}
          </h4>
          <div className="grid grid-cols-2 gap-4">
            {fieldKeys.map(([key, label]) => (
              <div key={key}>
                <span className="block text-xs mb-1">{t(label)}</span>
                <input
                  type="range"
                  min="1"
                  max="3"
                  step="0.25"
                  value={parseFloat(themeVars[key]) || 1.5}
                  onChange={(e) =>
                    handleVarChange(key, `${e.target.value}rem`)
                  }
                  className="range range-success range-sm"
                />
              </div>
            ))}
          </div>
        </div>

        <div>
          <h4 className="text-sm font-semibold text-base-content/70 mb-2">
            {t("Selectors")}
          </h4>
          <div className="grid grid-cols-2 gap-4">
            {selectorKeys.map(([key, label]) => (
              <div key={key}>
                <span className="block text-xs mb-1">{t(label)}</span>
                <input
                  type="range"
                  min="0.5"
                  max="2"
                  step="0.25"
                  value={parseFloat(themeVars[key]) || 1}
                  onChange={(e) =>
                    handleVarChange(key, `${e.target.value}rem`)
                  }
                  className="range range-warning range-sm"
                />
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default BorderSizeControls;
