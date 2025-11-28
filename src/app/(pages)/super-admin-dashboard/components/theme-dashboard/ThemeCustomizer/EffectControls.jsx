"use client";
import React from "react";
import { Zap } from "lucide-react";

const EffectControls = ({ themeVars, handleVarChange, t }) => {
  return (
    <div className="collapse collapse-arrow bg-base-200 border border-base-300/30 rounded-xl shadow-sm">
      <input type="checkbox" />
      <div className="collapse-title font-semibold text-lg flex items-center gap-3">
        <Zap className="w-5 h-5 text-warning" />
        {t("Effects")}
      </div>
      <div className="collapse-content">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 pt-4">
          <div className="space-y-3">
            <div className="flex justify-between">
              <span className="label-text font-medium">{t("Depth Effect")}</span>
              <span className="text-sm text-base-content/60">
                {parseFloat(themeVars["--depth"]) || 1}
              </span>
            </div>
            <input
              type="range"
              min="0"
              max="5"
              step="1"
              value={parseFloat(themeVars["--depth"]) || 1}
              onChange={(e) => handleVarChange("--depth", e.target.value)}
              className="range range-secondary range-sm"
            />
          </div>
          
          <div className="space-y-3">
            <div className="flex justify-between">
              <span className="label-text font-medium">{t("Noise Effect")}</span>
              <span className="text-sm text-base-content/60">
                {parseFloat(themeVars["--noise"]) || 0}
              </span>
            </div>
            <input
              type="range"
              min="0"
              max="5"
              step="0.5"
              value={parseFloat(themeVars["--noise"]) || 0}
              onChange={(e) => handleVarChange("--noise", e.target.value)}
              className="range range-accent range-sm"
            />
          </div>
        </div>
      </div>
    </div>
  );
};

export default EffectControls;