"use client";
import React from "react";
import { PlusCircle, Wand2 } from "lucide-react";

const ThemeAdder = ({ name, setName, handleAdd, t }) => {
  return (
    <div className="bg-linear-to-br from-base-100 to-base-200 border border-base-300/30 rounded-2xl p-6 shadow-lg hover:shadow-xl backdrop-blur-lg transition-all duration-300">
      <div className="flex flex-col gap-4">
        <div className="flex items-center gap-3">
          <PlusCircle className="w-6 h-6 text-primary" />
          <h3 className="text-xl font-bold text-base-content">
            {t("Create New Theme")}
          </h3>
        </div>
        
        <div className="space-y-4">
          <div>
            <label className="label">
              <span className="label-text font-semibold text-base-content/80">
                {t("Theme Name")}
              </span>
            </label>
            <input
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder={t("Enter theme name (e.g. retro, forest, valentine)")}
              className="input input-bordered w-full rounded-xl h-12 focus:ring-2 focus:ring-primary/50 focus:border-primary/50 transition-all duration-200 bg-base-200/50"
              onKeyPress={(e) => e.key === 'Enter' && handleAdd()}
            />
          </div>
          
          <button
            onClick={handleAdd}
            className="btn btn-primary btn-lg rounded-xl shadow-lg hover:shadow-xl transition-all duration-300 transform hover:scale-105 flex items-center gap-2 min-h-12 w-full"
          >
            <Wand2 className="w-5 h-5" />
            {t("Create Theme")}
          </button>
        </div>
      </div>
    </div>
  );
};

export default ThemeAdder;