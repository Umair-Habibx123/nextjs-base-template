"use client";
import React from "react";
import { Circle } from "lucide-react";

const RadiusControls = ({ themeVars, handleVarChange, t }) => {
  const radiusKeys = [
    ["--radius-box", "Box Radius", "range-primary"],
    ["--radius-field", "Field Radius", "range-success"],
    ["--radius-selector", "Selector Radius", "range-warning"],
  ];

  return (
    <div className="collapse collapse-arrow bg-base-200 border border-base-300/30 rounded-xl shadow-sm">
      <input type="checkbox" />
      <div className="collapse-title font-semibold text-lg flex items-center gap-3">
        <Circle className="w-5 h-5 text-success" />
        {t("Radius")}
      </div>
      <div className="collapse-content">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 pt-4">
          {radiusKeys.map(([key, label, rangeClass]) => (
            <div key={key} className="space-y-3">
              <div className="flex justify-between">
                <span className="label-text font-medium">{t(label)}</span>
                <span className="text-sm text-base-content/60">
                  {parseFloat(themeVars[key]) || 1}rem
                </span>
              </div>
              <input
                type="range"
                min="0"
                max="2"
                step="0.25"
                value={parseFloat(themeVars[key]) || 1}
                onChange={(e) => handleVarChange(key, `${e.target.value}rem`)}
                className={`range range-sm ${rangeClass}`}
              />
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default RadiusControls;