"use client";
import React, { useState } from "react";
import { useTheme } from "../../../context/theme/themeContext";
import { Palette, Check, ChevronDown, Sparkles, Brush } from "lucide-react";

const ThemeApplyButton = () => {
  const { theme, setTheme, availableThemes, visibleThemes } = useTheme();
  const [isOpen, setIsOpen] = useState(false);

  const visibleList = availableThemes.filter(
    (t) => visibleThemes?.[t] ?? true
  );

  const getThemeDisplayName = (themeName) => {
    const names = {
      light: "Light",
      dark: "Dark",
      cupcake: "Cupcake",
      bumblebee: "Bumblebee",
      emerald: "Emerald",
      corporate: "Corporate",
      synthwave: "Synthwave",
      retro: "Retro",
      cyberpunk: "Cyberpunk",
      valentine: "Valentine",
      halloween: "Halloween",
      garden: "Garden",
      forest: "Forest",
      aqua: "Aqua",
      lofi: "Lofi",
      pastel: "Pastel",
      fantasy: "Fantasy",
      wireframe: "Wireframe",
      black: "Black",
      luxury: "Luxury",
      dracula: "Dracula",
      cmyk: "CMYK",
      autumn: "Autumn",
      business: "Business",
      acid: "Acid",
      lemonade: "Lemonade",
      night: "Night",
      coffee: "Coffee",
      winter: "Winter"
    };
    return names[themeName] || themeName.charAt(0).toUpperCase() + themeName.slice(1);
  };

  const handleThemeChange = (themeName) => {
    setTheme(themeName);
    setIsOpen(false);
  };

  return (
    <div className="dropdown dropdown-end">
      {/* 🎨 Enhanced Trigger */}
      <label
        tabIndex={0}
        className="btn btn-ghost hover:bg-base-200/70 transition-all duration-200 
        flex items-center gap-2 rounded-xl px-3 py-2 border border-base-300/20 
        hover:border-base-300/40 hover:scale-105 group"
        onClick={() => setIsOpen(!isOpen)}
      >
        <div className="p-1.5 rounded-lg bg-secondary/10 text-secondary group-hover:bg-secondary/20 transition-colors">
          <Palette className="w-4 h-4" />
        </div>
        <div className="hidden sm:block text-left min-w-0">
          <p className="text-xs font-medium text-base-content/60 leading-none">
            Theme
          </p>
          <p className="text-sm font-semibold text-base-content truncate max-w-20">
            {getThemeDisplayName(theme)}
          </p>
        </div>
        <ChevronDown className="w-3 h-3 text-base-content/40 group-hover:text-base-content/60 transition-colors" />
      </label>

      {/* 🎯 Enhanced Dropdown */}
      <ul
        tabIndex={0}
        className="dropdown-content menu p-3 bg-base-100/95 backdrop-blur-xl 
        border border-base-300/30 rounded-2xl shadow-2xl w-64 z-50 
        transition-all duration-200"
      >
        {/* Header */}
        <div className="flex items-center gap-3 px-2 py-3 border-b border-base-300/20 mb-2">
          <div className="p-2 rounded-xl bg-secondary/10 text-secondary">
            <Brush className="w-4 h-4" />
          </div>
          <div>
            <h3 className="font-bold text-base-content text-sm">
              Select Theme
            </h3>
            <p className="text-xs text-base-content/60">
              {visibleList.length} themes available
            </p>
          </div>
        </div>

        {/* Theme Grid */}
        <div className="grid grid-cols-2 gap-2 max-h-64 overflow-y-auto">
          {visibleList.map((themeName) => {
            const isActive = theme === themeName;
            return (
              <li key={themeName} className="w-full">
                <button
                  onClick={() => handleThemeChange(themeName)}
                  className={`flex flex-col items-center w-full p-3 rounded-xl 
                  transition-all duration-200 group border-2
                  ${
                    isActive
                      ? "border-primary bg-primary/5 shadow-lg scale-105"
                      : "border-base-300/30 hover:border-base-300/50 hover:bg-base-200/50 hover:scale-105"
                  }`}
                >
                  {/* Theme Preview */}
                  <div 
                    className={`w-full h-8 rounded-lg mb-2 border border-base-300/50 
                    flex items-center justify-center relative
                    ${themeName === 'dark' || themeName === 'night' || themeName === 'dracula' ? 'bg-base-300' : 'bg-base-100'}`}
                    data-theme={themeName}
                  >
                    <div className="flex gap-1">
                      <div className="w-2 h-2 rounded-full bg-primary"></div>
                      <div className="w-2 h-2 rounded-full bg-secondary"></div>
                      <div className="w-2 h-2 rounded-full bg-accent"></div>
                    </div>
                    
                    {isActive && (
                      <div className="absolute -top-1 -right-1">
                        <div className="bg-primary text-primary-content rounded-full p-0.5 shadow-lg">
                          <Check className="w-3 h-3" />
                        </div>
                      </div>
                    )}
                  </div>
                  
                  {/* Theme Name */}
                  <span className={`text-xs font-medium text-center ${
                    isActive ? 'text-primary font-semibold' : 'text-base-content/80'
                  }`}>
                    {getThemeDisplayName(themeName)}
                  </span>
                </button>
              </li>
            );
          })}
        </div>

        {/* Footer */}
        <div className="pt-3 mt-2 border-t border-base-300/20">
          <div className="flex items-center gap-2 px-2 py-1 bg-success/5 rounded-lg">
            <Sparkles className="w-3 h-3 text-success" />
            <p className="text-xs text-base-content/60">
              Preview updates in real-time
            </p>
          </div>
        </div>
      </ul>
    </div>
  );
};

export default ThemeApplyButton;