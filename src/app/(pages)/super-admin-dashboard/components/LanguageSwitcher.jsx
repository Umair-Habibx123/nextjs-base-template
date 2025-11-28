"use client";
import React, { useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
import i18n from "../../../../i18n";
import { Globe, ChevronDown, Check, Sparkles, Languages } from "lucide-react";

const LanguageSwitcher = () => {
  const { t } = useTranslation();
  const [availableLangs, setAvailableLangs] = useState(["english"]);
  const [currentLang, setCurrentLang] = useState("english");
  const [isOpen, setIsOpen] = useState(false);

  useEffect(() => {
    const loadDynamicLanguages = async () => {
      try {
        const res = await fetch("/api/super-admin/languages");
        const data = await res.json();
        if (data.success && data.data) {
          Object.entries(data.data).forEach(([lang, values]) => {
            i18n.addResourceBundle(lang, "translation", values, true, true);
          });

          const uniqueLangs = Array.from(
            new Set(["english", ...Object.keys(data.data)])
          );
          setAvailableLangs(uniqueLangs);
        }
      } catch (e) {
        console.error("Error loading dynamic translations:", e);
      }
    };

    loadDynamicLanguages().then(() => {
      const savedLang = localStorage.getItem("lang");
      const initialLang = savedLang || "english";
      setCurrentLang(initialLang);
      i18n.changeLanguage(initialLang);
    });

    window.addEventListener("translationsUpdated", loadDynamicLanguages);
    return () =>
      window.removeEventListener("translationsUpdated", loadDynamicLanguages);
  }, []);

  const changeLanguage = (lang) => {
    setCurrentLang(lang);
    i18n.changeLanguage(lang);
    localStorage.setItem("lang", lang);
    setIsOpen(false);
  };

  const getLanguageDisplayName = (lang) => {
    const names = {
      english: "English",
      spanish: "Español",
      french: "Français",
      german: "Deutsch",
      italian: "Italiano",
      portuguese: "Português",
      chinese: "中文",
      japanese: "日本語",
      korean: "한국어",
      arabic: "العربية",
      hindi: "हिन्दी",
      russian: "Русский"
    };
    return names[lang] || lang.charAt(0).toUpperCase() + lang.slice(1);
  };

  return (
    <div className="dropdown dropdown-end">
      {/* 🌟 Enhanced Trigger */}
      <label
        tabIndex={0}
        className="btn btn-ghost hover:bg-base-200/70 transition-all duration-200 
        flex items-center gap-2 rounded-xl px-3 py-2 border border-base-300/20 
        hover:border-base-300/40 hover:scale-105 group"
        onClick={() => setIsOpen(!isOpen)}
      >
        <div className="p-1.5 rounded-lg bg-primary/10 text-primary group-hover:bg-primary/20 transition-colors">
          <Globe className="w-4 h-4" />
        </div>
        <div className="hidden sm:block text-left min-w-0">
          <p className="text-xs font-medium text-base-content/60 leading-none">
            {t("Language")}
          </p>
          <p className="text-sm font-semibold text-base-content truncate max-w-20">
            {getLanguageDisplayName(currentLang)}
          </p>
        </div>
        <ChevronDown className="w-3 h-3 text-base-content/40 group-hover:text-base-content/60 transition-colors" />
      </label>

      {/* 🎨 Enhanced Dropdown */}
      <ul
        tabIndex={0}
        className="dropdown-content menu p-3 bg-base-100/95 backdrop-blur-xl 
        border border-base-300/30 rounded-2xl shadow-2xl w-56 z-50 
        transition-all duration-200"
      >
        {/* Header */}
        <div className="flex items-center gap-3 px-2 py-3 border-b border-base-300/20 mb-2">
          <div className="p-2 rounded-xl bg-primary/10 text-primary">
            <Languages className="w-4 h-4" />
          </div>
          <div>
            <h3 className="font-bold text-base-content text-sm">
              {t("Select Language")}
            </h3>
            <p className="text-xs text-base-content/60">
              {availableLangs.length} {t("languages available")}
            </p>
          </div>
        </div>

        {/* Language List */}
        <div className="max-h-64 overflow-y-auto space-y-1">
          {availableLangs.map((lang) => {
            const isActive = currentLang === lang;
            return (
              <li key={lang}>
                <button
                  onClick={() => changeLanguage(lang)}
                  className={`flex items-center justify-between w-full px-3 py-3 rounded-xl 
                  transition-all duration-200 group
                  ${
                    isActive
                      ? "bg-linear-to-r from-primary to-primary/80 text-primary-content shadow-lg"
                      : "hover:bg-base-200/70 text-base-content/90 hover:scale-105"
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <div className={`w-2 h-2 rounded-full ${isActive ? 'bg-primary-content' : 'bg-base-300'}`} />
                    <span className="font-medium text-sm">
                      {getLanguageDisplayName(lang)}
                    </span>
                  </div>
                  
                  {isActive && (
                    <div className="flex items-center gap-1">
                      <Check className="w-4 h-4" />
                      <span className="text-xs opacity-90">{t("Active")}</span>
                    </div>
                  )}
                </button>
              </li>
            );
          })}
        </div>

        {/* Footer */}
        <div className="pt-3 mt-2 border-t border-base-300/20">
          <div className="flex items-center gap-2 px-2 py-1 bg-info/5 rounded-lg">
            <Sparkles className="w-3 h-3 text-info" />
            <p className="text-xs text-base-content/60">
              {t("Changes apply instantly")}
            </p>
          </div>
        </div>
      </ul>
    </div>
  );
};

export default LanguageSwitcher;