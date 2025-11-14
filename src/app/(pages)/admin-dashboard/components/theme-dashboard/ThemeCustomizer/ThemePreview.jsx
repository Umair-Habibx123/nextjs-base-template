"use client";
import React from "react";
import { Info, Sliders, Zap, CheckCircle } from "lucide-react";

const ThemePreview = ({ themeName }) => {
  return (
    <div
      data-theme={themeName}
      className="border border-base-300/40 rounded-2xl p-6 space-y-6 bg-base-100 shadow-lg"
    >
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="p-2 rounded-xl bg-primary/10 text-primary">
            <Sliders className="w-5 h-5" />
          </div>
          <div>
            <h3 className="text-lg font-bold capitalize">{themeName}</h3>
            <p className="text-base-content/60 text-sm">Theme Preview</p>
          </div>
        </div>
        <span className={`badge badge-lg ${themeName === "default" ? "badge-secondary" : "badge-primary"}`}>
          {themeName === "default" ? "DaisyUI" : "Custom"}
        </span>
      </div>

      {/* Buttons Grid */}
      <div className="grid grid-cols-2 gap-3">
        <button className="btn btn-primary btn-md rounded-lg shadow-sm">Primary</button>
        <button className="btn btn-secondary btn-md rounded-lg shadow-sm">Secondary</button>
        <button className="btn btn-accent btn-md rounded-lg shadow-sm">Accent</button>
        <button className="btn btn-neutral btn-md rounded-lg shadow-sm">Neutral</button>
      </div>

      {/* Inputs */}
      <div className="space-y-3">
        <input
          className="input input-bordered w-full rounded-lg"
          placeholder="Type something..."
        />
        <select className="select select-bordered w-full rounded-lg">
          <option>Choose an option</option>
          <option>Dark Theme</option>
          <option>Light Theme</option>
        </select>
      </div>

      {/* Alert */}
      <div className="alert alert-info rounded-lg flex items-center gap-3">
        <Info className="w-5 h-5" />
        <span>Informational alert preview</span>
      </div>

      {/* Progress & Toggle */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <span className="text-sm font-medium">Progress</span>
          <label className="toggle toggle-primary">
            <input type="checkbox" defaultChecked />
          </label>
        </div>
        <progress className="progress progress-primary w-full" value="60" max="100"></progress>
      </div>

      {/* Card */}
      <div className="card bg-base-200 border border-base-300/50 rounded-xl">
        <div className="card-body p-4">
          <div className="flex items-center gap-2 mb-2">
            <Zap className="w-4 h-4 text-success" />
            <h4 className="font-bold text-base-content">Card Example</h4>
          </div>
          <p className="text-base-content/70 text-sm">
            See how content and base colors interact in this theme.
          </p>
          <div className="mt-3 flex gap-2">
            <button className="btn btn-outline btn-primary btn-sm rounded-lg">Action</button>
            <button className="btn btn-outline btn-secondary btn-sm rounded-lg">Cancel</button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ThemePreview;