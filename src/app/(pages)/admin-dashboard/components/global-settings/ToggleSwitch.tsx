"use client";

import React from "react";

const ToggleSwitch = ({ 
  label, 
  description, 
  checked, 
  onChange 
}) => (
  <div className="flex items-start gap-4 p-4 rounded-2xl border border-base-300/30 bg-base-100 hover:bg-base-200/50 transition-colors">
    <div className="flex items-center h-6">
      <input
        type="checkbox"
        checked={checked}
        onChange={onChange}
        className="toggle toggle-primary"
      />
    </div>
    <div className="flex-1">
      <label className="font-semibold text-base-content/90 cursor-pointer">
        {label}
      </label>
      {description && (
        <p className="text-sm text-base-content/60 mt-1">
          {description}
        </p>
      )}
    </div>
  </div>
);

export default ToggleSwitch;