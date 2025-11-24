// src/app/(pages)/signup/components/BasicInfoStep.jsx
import React, { useState } from "react";
import {
  User,
  Mail,
  Lock,
  Eye,
  EyeOff,
  Camera,
  ArrowRight,
  Loader2,
  Sparkles,
  Shield,
} from "lucide-react";
import { toast } from "react-toastify";

const BasicInfoStep = ({
  formData,
  onInputChange,
  onProfilePicChange,
  profilePreview,
  onNextStep,
  isSubmitting,
  t,
  onSocialSignup,
}) => {
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [socialLoading, setSocialLoading] = useState(null);

  const socialConfig = JSON.parse(
    process.env.NEXT_PUBLIC_SOCIAL_AUTH_CONFIG || "{}"
  );

  const googleEnabled = socialConfig.google?.enabled === true;
  const githubEnabled = socialConfig.github?.enabled === true;

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      if (file.size > 5 * 1024 * 1024) {
        toast.error("Profile picture must be less than 5MB");
        return;
      }

      if (!file.type.startsWith("image/")) {
        toast.error("Please select a valid image file");
        return;
      }

      onProfilePicChange(file);
    }
  };

  const handleSocialSignup = async (provider) => {
    setSocialLoading(provider);
    try {
      await onSocialSignup(provider);
    } finally {
      setSocialLoading(null);
    }
  };

  return (
    <div className="space-y-6 animate-fadeIn">
      {/* Profile Picture Upload */}
      <div className="form-control">
        <label className="label">
          <span className="label-text font-semibold text-base-content flex items-center gap-2">
            <Camera className="w-4 h-4 text-primary" />
            {t("Profile Picture")}{" "}
            <span className="text-base-content/40 text-sm">(Optional)</span>
          </span>
        </label>
        <div className="flex items-center gap-4">
          <div className="w-20 h-20 rounded-full bg-base-200 border-2 border-dashed border-base-300 flex items-center justify-center overflow-hidden">
            {profilePreview ? (
              <img
                src={profilePreview}
                alt="Profile preview"
                className="w-full h-full object-cover"
              />
            ) : (
              <User className="w-8 h-8 text-base-content/40" />
            )}
          </div>
          <label className="btn btn-outline btn-sm cursor-pointer">
            <Camera className="w-4 h-4" />
            {t("Upload Photo")}
            <input
              type="file"
              className="hidden"
              accept="image/*"
              onChange={handleFileChange}
            />
          </label>
        </div>
      </div>

      {/* Social Auth Buttons */}
      {(googleEnabled || githubEnabled) && (
        <div className="space-y-3">
          <div className="relative">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-base-300"></div>
            </div>
            <div className="relative flex justify-center text-sm">
              <span className="px-2 bg-base-100 text-base-content/60">
                Or continue with
              </span>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            {googleEnabled && (
              <button
                type="button"
                onClick={() => handleSocialSignup("google")}
                disabled={isSubmitting || socialLoading}
                className="btn btn-outline rounded-xl flex items-center gap-2 disabled:opacity-50"
              >
                {socialLoading === "google" ? (
                  <Loader2 className="w-4 h-4 animate-spin" />
                ) : (
                  <svg className="w-4 h-4" viewBox="0 0 24 24">
                    {" "}
                    <path
                      fill="currentColor"
                      d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                    />{" "}
                    <path
                      fill="currentColor"
                      d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                    />{" "}
                    <path
                      fill="currentColor"
                      d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
                    />{" "}
                    <path
                      fill="currentColor"
                      d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
                    />{" "}
                  </svg>
                )}
                Google
              </button>
            )}

            {githubEnabled && (
              <button
                type="button"
                onClick={() => handleSocialSignup("github")}
                disabled={isSubmitting || socialLoading}
                className="btn btn-outline rounded-xl flex items-center gap-2 disabled:opacity-50"
              >
                {socialLoading === "github" ? (
                  <Loader2 className="w-4 h-4 animate-spin" />
                ) : (
                  <svg
                    className="w-4 h-4"
                    viewBox="0 0 24 24"
                    fill="currentColor"
                  >
                    {" "}
                    <path d="M12 0c-6.626 0-12 5.373-12 12 0 5.302 3.438 9.8 8.207 11.387.599.111.793-.261.793-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23.957-.266 1.983-.399 3.003-.404 1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v3.293c0 .319.192.694.801.576 4.765-1.589 8.199-6.086 8.199-11.386 0-6.627-5.373-12-12-12z" />{" "}
                  </svg>
                )}
                GitHub
              </button>
            )}
          </div>
        </div>
      )}

      {/* Divider */}
      <div className="relative">
        <div className="absolute inset-0 flex items-center">
          <div className="w-full border-t border-base-300"></div>
        </div>
        <div className="relative flex justify-center text-sm">
          <span className="px-2 bg-base-100 text-base-content/60">
            Or with email
          </span>
        </div>
      </div>

      {/* Name Field */}
      <div className="form-control">
        <label className="label">
          <span className="label-text font-semibold text-base-content flex items-center gap-2">
            <User className="w-4 h-4 text-primary" />
            {t("Full Name")}
          </span>
        </label>
        <input
          type="text"
          value={formData.name}
          onChange={(e) => onInputChange("name", e.target.value)}
          className="input input-bordered w-full rounded-xl focus:ring-2 focus:ring-primary/50 bg-base-200/50 transition-all duration-200"
          placeholder="John Doe"
          required
        />
      </div>

      {/* Email Field */}
      <div className="form-control">
        <label className="label">
          <span className="label-text font-semibold text-base-content flex items-center gap-2">
            <Mail className="w-4 h-4 text-primary" />
            {t("Email Address")}
          </span>
        </label>
        <input
          type="email"
          value={formData.email}
          onChange={(e) => onInputChange("email", e.target.value)}
          className="input input-bordered w-full rounded-xl focus:ring-2 focus:ring-primary/50 bg-base-200/50 transition-all duration-200"
          placeholder="john@example.com"
          required
        />
      </div>

      {/* Password Field */}
      <div className="form-control">
        <label className="label">
          <span className="label-text font-semibold text-base-content flex items-center gap-2">
            <Lock className="w-4 h-4 text-primary" />
            {t("Password")}
          </span>
        </label>
        <div className="relative">
          <input
            type={showPassword ? "text" : "password"}
            value={formData.password}
            onChange={(e) => onInputChange("password", e.target.value)}
            className="input input-bordered w-full rounded-xl pr-10 focus:ring-2 focus:ring-primary/50 bg-base-200/50 transition-all duration-200"
            placeholder={t("Enter your password")}
            required
          />
          <button
            type="button"
            onClick={() => setShowPassword(!showPassword)}
            className="absolute right-3 top-1/2 transform -translate-y-1/2 text-base-content/40 hover:text-base-content/70 transition-colors"
          >
            {showPassword ? (
              <EyeOff className="w-4 h-4" />
            ) : (
              <Eye className="w-4 h-4" />
            )}
          </button>
        </div>
        <label className="label">
          <span className="label-text-alt text-base-content/60">
            Password must be at least 8 characters long
          </span>
        </label>
      </div>

      {/* Confirm Password Field */}
      <div className="form-control">
        <label className="label">
          <span className="label-text font-semibold text-base-content">
            {t("Confirm Password")}
          </span>
        </label>
        <div className="relative">
          <input
            type={showConfirmPassword ? "text" : "password"}
            value={formData.confirmPassword}
            onChange={(e) => onInputChange("confirmPassword", e.target.value)}
            className="input input-bordered w-full rounded-xl pr-10 focus:ring-2 focus:ring-primary/50 bg-base-200/50 transition-all duration-200"
            placeholder={t("Confirm your password")}
            required
          />
          <button
            type="button"
            onClick={() => setShowConfirmPassword(!showConfirmPassword)}
            className="absolute right-3 top-1/2 transform -translate-y-1/2 text-base-content/40 hover:text-base-content/70 transition-colors"
          >
            {showConfirmPassword ? (
              <EyeOff className="w-4 h-4" />
            ) : (
              <Eye className="w-4 h-4" />
            )}
          </button>
        </div>
      </div>

      {/* Security Features */}
      <div className="space-y-4 pt-4 border-t border-base-300/30">
        <div className="bg-warning/5 rounded-2xl p-4 border border-warning/20">
          <div className="flex items-start gap-3">
            <Sparkles className="w-4 h-4 text-warning mt-0.5 shrink-0" />
            <div>
              <p className="text-sm font-semibold text-warning mb-1">
                {t("Security Best Practices")}
              </p>
              <p className="text-xs text-base-content/70">
                {t(
                  "We never share your personal information. All data is encrypted and securely stored."
                )}
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Next Button */}
      <div className="flex justify-end pt-4">
        <button
          type="button"
          onClick={onNextStep}
          disabled={isSubmitting}
          className="btn btn-primary rounded-xl flex items-center gap-2"
        >
          {isSubmitting ? (
            <Loader2 className="w-4 h-4 animate-spin" />
          ) : (
            <ArrowRight className="w-4 h-4" />
          )}
          {isSubmitting ? "Sending OTP..." : "Continue"}
        </button>
      </div>
    </div>
  );
};

export default BasicInfoStep;
