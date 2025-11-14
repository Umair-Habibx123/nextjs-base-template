"use client";
import React from "react";
import ColorControls from "./ColorControls";
import RadiusControls from "./RadiusControls";
import EffectControls from "./EffectControls";
import BorderSizeControls from "./BorderSizeControls";
import { Brush } from "lucide-react";

const ThemeCustomizer = ({ themeVars, handleVarChange, selectedTheme, t }) => {
  return (
    <div className="bg-linear-to-br from-base-100 to-base-200 border border-base-300/30 rounded-2xl p-6 shadow-2xl backdrop-blur-lg transition-all duration-500">
      <div className="flex items-center gap-3 mb-6">
        <div className="p-2 rounded-lg bg-linear-to-br from-primary to-primary/80 text-primary-content">
          <Brush className="w-5 h-5" />
        </div>
        <div>
          <h3 className="text-xl font-bold bg-linear-to-r from-base-content to-base-content/80 bg-clip-text text-transparent">
            {t("Customize Theme")}
          </h3>
          <p className="text-base-content/60 text-sm capitalize">
            {selectedTheme}
          </p>
        </div>
      </div>

      <div className="space-y-4">
        <ColorControls themeVars={themeVars} handleVarChange={handleVarChange} t={t} />
        <RadiusControls themeVars={themeVars} handleVarChange={handleVarChange} t={t} />
        <EffectControls themeVars={themeVars} handleVarChange={handleVarChange} t={t} />
        <BorderSizeControls themeVars={themeVars} handleVarChange={handleVarChange} t={t} />
      </div>
    </div>
  );
};

export default ThemeCustomizer;