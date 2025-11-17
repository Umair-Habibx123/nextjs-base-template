"use client";

import React from "react";
import { Layout, Sparkles } from "lucide-react";
import ImageUploadField from "./ImageUploadField";
import ToggleSwitch from "./ToggleSwitch";

const GlobalSettings = ({ form, setForm, saving, saveSettings }) => {
  return (
    <div className="space-y-8 p-6 animate-fade-in">
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Top Left - Site Under Construction */}
        <div className="card bg-base-100 border border-base-300/30 rounded-2xl p-1 shadow-lg">
          <ToggleSwitch
            label="Site Under Construction Mode"
            description="When enabled, your site will display a maintenance page to visitors"
            checked={form.site_under_construction}
            onChange={(e) =>
              setForm({ ...form, site_under_construction: e.target.checked })
            }
          />
        </div>

        {/* Top Right - Enable Password Protection */}
        <div className="card bg-base-100 border border-base-300/30 rounded-2xl p-1 shadow-lg">
          <ToggleSwitch
            label="Enable Password Protection"
            description="Require visitors to enter a password to access your site"
            checked={form.site_password_enabled}
            onChange={(e) =>
              setForm({ ...form, site_password_enabled: e.target.checked })
            }
          />

          {form.site_password_enabled && (
            <div className="p-4 pt-2">
              <label className="font-medium text-base-content/80 mb-2 block">
                Site Password
              </label>
              <input
                type="password"
                className="input input-bordered w-full focus:input-primary"
                placeholder="Enter site password"
                value={form.site_password ?? ""}
                onChange={(e) =>
                  setForm({ ...form, site_password: e.target.value })
                }
              />
            </div>
          )}
        </div>

        {/* Bottom Left - Site Logo */}
        <div className="card bg-base-100 border border-base-300/30 rounded-2xl p-6 shadow-lg">
          <ImageUploadField
            label="Site Logo"
            value={form.site_logo}
            onChange={(url) => setForm({ ...form, site_logo: url })}
            previewClassName="h-16 w-48"
          />
        </div>

        {/* Bottom Right - Favicon */}
        <div className="card bg-base-100 border border-base-300/30 rounded-2xl p-6 shadow-lg">
          <ImageUploadField
            label="Favicon"
            value={form.site_favicon}
            onChange={(url) => setForm({ ...form, site_favicon: url })}
            previewClassName="h-16 w-16"
          />
          <p className="text-xs text-base-content/50 mt-2">
            Recommended: 32×32px or 64×64px PNG/ICO file
          </p>
        </div>
      </div>

      {/* Save Button */}
      <div className="flex justify-end pt-6">
        <button
          onClick={saveSettings}
          className="btn btn-primary btn-lg min-w-[140px] rounded-xl shadow-lg hover:shadow-xl transition-all duration-300"
          disabled={saving}
        >
          {saving ? (
            <>
              <span className="loading loading-spinner loading-sm"></span>
              Saving...
            </>
          ) : (
            <>
              <Sparkles className="w-5 h-5" />
              Save Settings
            </>
          )}
        </button>
      </div>
    </div>
  );
};

export default GlobalSettings;
