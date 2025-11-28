"use client";
import React, { useState, useEffect } from "react";
import { useAuth } from "../../../../context/auth/authContext";
import { useTranslation } from "react-i18next";
import ConfirmModal from "../../../components/common/ConfirmModal";
import { authClient } from "@/lib/client";
import {
  Lock,
  Loader2,
  User,
  Mail,
  Shield,
  Key,
  Sparkles,
  Eye,
  EyeOff,
  CheckCircle,
  AlertTriangle,
} from "lucide-react";
import PasskeyManagement from "./components/PasskeyManagement";
import TwoFactorManagement from "./components/TwoFactorManagement";
import { toast } from "react-toastify";

const ProfilePage = () => {
  const { user } = useAuth();
  const { t } = useTranslation();

  // Password change states
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [showCurrentPassword, setShowCurrentPassword] = useState(false);
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [confirmOpen, setConfirmOpen] = useState(false);
  const [confirmLoading, setConfirmLoading] = useState(false);

  const submitPasswordChange = async () => {
    setConfirmLoading(true);

    try {
      const { data, error } = await authClient.changePassword({
        newPassword,
        currentPassword,
        revokeOtherSessions: true,
      });

      if (error) throw new Error(error.message);

      toast.success(t("Password updated successfully"));
      setCurrentPassword("");
      setNewPassword("");
    } catch (err: any) {
      toast.error(err.message || t("Failed to update password"));
    } finally {
      setConfirmLoading(false);
      setConfirmOpen(false);
    }
  };

  const handleChangePassword = (e: React.FormEvent) => {
    e.preventDefault();

    // Basic validation
    if (!currentPassword || !newPassword) {
      toast.error(t("Please fill in all password fields"));
      return;
    }

    if (newPassword.length < 8) {
      toast.error(t("Password must be at least 8 characters long"));
      return;
    }

    setConfirmOpen(true);
  };

  return (
    <section className="max-w-full space-y-8 animate-fade-in">
      {/* 🌟 Modern Header */}
      <div className="flex items-center gap-4 p-6 bg-linear-to-r from-primary/5 via-secondary/5 to-accent/5 rounded-3xl border border-base-300/20 backdrop-blur-lg">
        <div className="p-3 rounded-2xl bg-linear-to-br from-primary to-primary/80 text-primary-content shadow-lg">
          <User className="w-7 h-7" />
        </div>
        <div className="flex-1">
          <h1 className="text-3xl font-bold bg-linear-to-r from-base-content to-base-content/70 bg-clip-text text-transparent">
            {t("Profile Settings")}
          </h1>
          <p className="text-base-content/70 mt-2 text-lg leading-relaxed">
            {t("Manage your account security and authentication methods.")}
          </p>
        </div>
        <div className="hidden lg:flex items-center gap-2 px-4 py-2 bg-primary/10 rounded-full border border-primary/20">
          <Shield className="w-4 h-4 text-primary" />
          <span className="text-sm font-medium text-primary">{t("Secure")}</span>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* 👤 Profile Information */}
        <div className="lg:col-span-1">
          <div className="bg-linear-to-br from-base-100 to-base-200 border border-base-300/30 rounded-2xl shadow-2xl backdrop-blur-lg p-6 transition-all duration-500 h-fit">
            <div className="flex items-center gap-3 mb-6">
              <div className="p-2 rounded-xl bg-info/10 text-info">
                <User className="w-5 h-5" />
              </div>
              <h2 className="text-xl font-bold text-base-content">
                {t("Account Info")}
              </h2>
            </div>

            <div className="space-y-4">
              {/* Email Card */}
              <div className="flex items-center gap-4 p-4 bg-base-200/50 rounded-xl border border-base-300/20">
                <div className="p-2 rounded-lg bg-primary/10 text-primary">
                  <Mail className="w-4 h-4" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-semibold text-base-content/70">
                    {t("Email Address")}
                  </p>
                  <p className="font-medium text-base-content truncate">
                    {user?.email}
                  </p>
                </div>
              </div>

              {/* Status Card */}
              <div className="flex items-center gap-4 p-4 bg-base-200/50 rounded-xl border border-base-300/20">
                <div className="p-2 rounded-lg bg-success/10 text-success">
                  <CheckCircle className="w-4 h-4" />
                </div>
                <div className="flex-1">
                  <p className="text-sm font-semibold text-base-content/70">
                    {t("Account Status")}
                  </p>
                  <p className="font-medium text-base-content">{t("Active")}</p>
                </div>
              </div>

              {/* 2FA Status Card */}
              <div className="flex items-center gap-4 p-4 bg-base-200/50 rounded-xl border border-base-300/20">
                <div className="p-2 rounded-lg bg-warning/10 text-warning">
                  <Shield className="w-4 h-4" />
                </div>
                <div className="flex-1">
                  <p className="text-sm font-semibold text-base-content/70">
                    {t("2FA Status")}
                  </p>
                  <p className="font-medium text-base-content">
                    {user?.twoFactorEnabled ? t("Enabled") : t("Disabled")}
                  </p>
                </div>
              </div>
            </div>

            {/* Security Tip */}
            <div className="mt-6 p-4 bg-info/5 rounded-xl border border-info/20">
              <div className="flex items-start gap-3">
                <Sparkles className="w-4 h-4 text-info mt-0.5 shrink-0" />
                <div>
                  <p className="text-sm font-semibold text-info mb-1">
                    {t("Security Tip")}
                  </p>
                  <p className="text-xs text-base-content/70">
                    {t(
                      "Use a strong, unique password and enable two-factor authentication for maximum security."
                    )}
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* 🔑 Password Change Form */}
        <div className="lg:col-span-2 space-y-6">
          <div className="bg-linear-to-br from-base-100 to-base-200 border border-base-300/30 rounded-2xl shadow-2xl backdrop-blur-lg p-6 transition-all duration-500">
            <div className="flex items-center gap-3 mb-6">
              <div className="p-2 rounded-xl bg-warning/10 text-warning">
                <Key className="w-5 h-5" />
              </div>
              <div>
                <h2 className="text-xl font-bold text-base-content">
                  {t("Change Password")}
                </h2>
                <p className="text-base-content/60 text-sm">
                  {t("Update your password to keep your account secure")}
                </p>
              </div>
            </div>

            <form onSubmit={handleChangePassword} className="space-y-6">
              {/* Current Password */}
              <div className="form-control">
                <label className="label">
                  <span className="label-text font-semibold text-base-content flex items-center gap-2">
                    <Lock className="w-4 h-4" />
                    {t("Current Password")}
                  </span>
                </label>
                <div className="relative">
                  <input
                    type={showCurrentPassword ? "text" : "password"}
                    value={currentPassword}
                    onChange={(e) => setCurrentPassword(e.target.value)}
                    className="input input-bordered w-full rounded-xl pl-4 pr-12 focus:ring-2 focus:ring-warning/50 bg-base-200/50 transition-all duration-200"
                    required
                    placeholder={t("Enter your current password")}
                    autoComplete="current-password"
                  />
                  <button
                    type="button"
                    onClick={() => setShowCurrentPassword(!showCurrentPassword)}
                    className="absolute right-3 top-1/2 transform -translate-y-1/2 text-base-content/40 hover:text-base-content/70 transition-colors"
                  >
                    {showCurrentPassword ? <EyeOff  /> : <Eye  />}
                  </button>
                </div>
              </div>

              {/* New Password */}
              <div className="form-control">
                <label className="label">
                  <span className="label-text font-semibold text-base-content flex items-center gap-2">
                    <Key className="w-4 h-4" />
                    {t("New Password")}
                  </span>
                </label>
                <div className="relative">
                  <input
                    type={showNewPassword ? "text" : "password"}
                    value={newPassword}
                    onChange={(e) => setNewPassword(e.target.value)}
                    className="input input-bordered w-full rounded-xl pl-4 pr-12 focus:ring-2 focus:ring-warning/50 bg-base-200/50 transition-all duration-200"
                    required
                    placeholder={t("Enter your new password")}
                    autoComplete="new-password"
                  />
                  <button
                    type="button"
                    onClick={() => setShowNewPassword(!showNewPassword)}
                    className="absolute right-3 top-1/2 transform -translate-y-1/2 text-base-content/40 hover:text-base-content/70 transition-colors"
                  >
                    {showNewPassword ? <EyeOff  /> : <Eye  />}
                  </button>
                </div>
                <div className="label">
                  <span className="label-text-alt text-base-content/50">
                    {t("Password must be at least 8 characters long")}
                  </span>
                </div>
              </div>

              {/* Submit Button */}
              <button
                type="submit"
                disabled={loading || !currentPassword || !newPassword || newPassword.length < 8}
                className="btn btn-warning btn-lg w-full rounded-xl shadow-lg hover:shadow-xl transition-all duration-300 flex items-center justify-center gap-2 font-semibold"
              >
                {loading ? (
                  <>
                    <Loader2 className="w-5 h-5 animate-spin" />
                    {t("Updating Password...")}
                  </>
                ) : (
                  <>
                    <Lock className="w-5 h-5" />
                    {t("Change Password")}
                  </>
                )}
              </button>
            </form>
          </div>

          {/* 🔒 Security Best Practices */}
          <div className="bg-linear-to-br from-base-100 to-base-200 border border-base-300/30 rounded-2xl shadow-lg backdrop-blur-lg p-6 transition-all duration-500">
            <div className="flex items-center gap-3 mb-4">
              <Shield className="w-5 h-5 text-info" />
              <h3 className="text-lg font-semibold text-base-content">
                {t("Security Best Practices")}
              </h3>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-sm">
              {[
                t("Use a unique password not used elsewhere"),
                t("Change your password every 3-6 months"),
                t("Enable two-factor authentication"),
                t("Avoid using personal information in passwords"),
                t("Use a password manager for strong passwords"),
                t("Be cautious of phishing attempts"),
              ].map((practice, index) => (
                <div key={index} className="flex items-start gap-3 p-3 bg-base-200/50 rounded-lg">
                  <div className="w-2 h-2 bg-success rounded-full mt-2 shrink-0"></div>
                  <p className="text-base-content/70">{practice}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* 🔐 Security Components */}
      <div className="space-y-8">
        <PasskeyManagement />
        <TwoFactorManagement />
      </div>

      {/* ⚠️ Security Notice */}
      <div className="p-4 bg-warning/5 rounded-xl border border-warning/20">
        <div className="flex items-start gap-3">
          <AlertTriangle className="w-4 h-4 text-warning mt-0.5 shrink-0" />
          <div>
            <p className="text-sm font-semibold text-warning mb-1">
              {t("Important Security Notice")}
            </p>
            <p className="text-xs text-base-content/70">
              {t(
                "Always keep your authentication methods secure. Enable 2FA and use passkeys for the highest level of account protection. Never share your backup codes or passwords with anyone."
              )}
            </p>
          </div>
        </div>
      </div>

      {/* Confirmation Modal */}
      <ConfirmModal
        open={confirmOpen}
        title={t("Confirm Password Change")}
        message={t("Are you sure you want to change your password? This will log you out of all other devices.")}
        confirmText={t("Yes, Change Password")}
        cancelText={t("Cancel")}
        onConfirm={submitPasswordChange}
        onCancel={() => setConfirmOpen(false)}
        loading={confirmLoading}
      />
    </section>
  );
};

export default ProfilePage;