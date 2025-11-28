"use client";

import { useState } from "react";
import { Layout, Sparkles } from "lucide-react";
import ImageUploadField from "./ImageUploadField";
import ToggleSwitch from "./ToggleSwitch";

const GlobalSettings = ({ form, setForm, saving, saveSettings }) => {
  const [showPassword, setShowPassword] = useState(false);

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
              <div className="relative">
                <input
                  type={showPassword ? "text" : "password"}
                  className="input input-bordered w-full focus:input-primary pr-12"
                  placeholder="Enter site password"
                  value={form.site_password ?? ""}
                  onChange={(e) =>
                    setForm({ ...form, site_password: e.target.value })
                  }
                />
                <button
                  type="button"
                  className="absolute right-3 top-1/2 transform -translate-y-1/2 text-base-content/60 hover:text-base-content"
                  onClick={() => setShowPassword(!showPassword)}
                >
                  {showPassword ? (
                    // Eye open icon (show password)
                    <svg
                      className="w-5 h-5"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"
                      />
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z"
                      />
                    </svg>
                  ) : (
                    // Eye closed icon (hide password)
                    <svg
                      className="w-5 h-5"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.88 9.88l-3.29-3.29m7.532 7.532l3.29 3.29M3 3l3.59 3.59m0 0A9.953 9.953 0 0112 5c4.478 0 8.268 2.943 9.543 7a10.025 10.025 0 01-4.132 5.411m0 0L21 21"
                      />
                    </svg>
                  )}
                </button>
              </div>
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
