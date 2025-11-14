"use client";
import React from "react";
import { Settings2 } from "lucide-react";

const ThemeHeader = ({ t }) => {
  return (
    <div className="flex items-center gap-3 p-4 bg-linear-to-r from-base-100 to-base-200 rounded-2xl border border-base-300/30">
      <div className="p-2 rounded-xl bg-primary/10 text-primary">
        <Settings2 className="w-5 h-5" />
      </div>
      <div>
        <h2 className="text-2xl font-bold bg-linear-to-r from-base-content to-base-content/80 bg-clip-text text-transparent">
          {t("Theme Manager")}
        </h2>
        <p className="text-base-content/60 text-sm">
          {t("Create and manage your custom themes")}
        </p>
      </div>
    </div>
  );
};

export default ThemeHeader;