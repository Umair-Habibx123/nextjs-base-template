"use client";
import React, { useState, useEffect } from "react";
import { useAuth } from "../../../context/auth/authContext";
import { useTranslation } from "react-i18next";
import ConfirmModal from "../../components/common/ConfirmModal";
import { authClient } from "@/lib/client";
import {
  Lock,
  Loader2,
  CheckCircle,
  XCircle,
  User,
  Mail,
  Shield,
  Key,
  Sparkles,
  Eye,
  EyeOff,
} from "lucide-react";

const ProfilePage = () => {
  const { user } = useAuth();
  const { t } = useTranslation();
  const [currentPassword, setOldPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [status, setStatus] = useState(null);
  const [showOldPassword, setShowOldPassword] = useState(false);
  const [showNewPassword, setShowNewPassword] = useState(false);

  const [confirmOpen, setConfirmOpen] = useState(false);
  const [confirmLoading, setConfirmLoading] = useState(false);

  // Auto-dismiss status message after 5 seconds
  useEffect(() => {
    if (status) {
      const timer = setTimeout(() => {
        setStatus(null);
      }, 5000);

      // Cleanup timer on component unmount or when status changes
      return () => clearTimeout(timer);
    }
  }, [status]);

  const submitPasswordChange = async () => {
    setConfirmLoading(true);
    setStatus(null);

    try {
      const { data, error } = await authClient.changePassword({
        newPassword,
        currentPassword,
        revokeOtherSessions: true,   // When set to true, all other active sessions for this user will be invalidated
      });

      if (error) throw new Error(error.message);

      setStatus({ success: true, message: "Password updated successfully" });
      setOldPassword("");
      setNewPassword("");
    } catch (err: any) {
      setStatus({ success: false, message: err.message });
    } finally {
      setConfirmLoading(false);
      setConfirmOpen(false);
    }
  };

  const handleChangePassword = (e: React.FormEvent) => {
    e.preventDefault();
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
            {t("Manage your account and update your password securely.")}
          </p>
        </div>
        <div className="hidden lg:flex items-center gap-2 px-4 py-2 bg-primary/10 rounded-full border border-primary/20">
          <Shield className="w-4 h-4 text-primary" />
          <span className="text-sm font-medium text-primary">Secure</span>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* 👤 Profile Information */}
        <div className="lg:col-span-1">
          <div className="bg-linear-to-br from-base-100 to-base-200 border border-base-300/30 rounded-2xl shadow-2xl backdrop-blur-lg p-6 transition-all duration-500">
            <div className="flex items-center gap-3 mb-6">
              <div className="p-2 rounded-xl bg-info/10 text-info">
                <User className="w-5 h-5" />
              </div>
              <h2 className="text-xl font-bold text-base-content">
                {t("Account Info")}
              </h2>
            </div>

            <div className="space-y-6">
              <div className="flex items-center gap-4 p-4 bg-base-200/50 rounded-xl border border-base-300/20">
                <div className="p-2 rounded-lg bg-primary/10 text-primary">
                  <Mail className="w-4 h-4" />
                </div>
                <div className="flex-1">
                  <p className="text-sm font-semibold text-base-content/70">
                    {t("Email Address")}
                  </p>
                  <p className="font-medium text-base-content truncate">
                    {user?.email}
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-4 p-4 bg-base-200/50 rounded-xl border border-base-300/20">
                <div className="p-2 rounded-lg bg-success/10 text-success">
                  <Shield className="w-4 h-4" />
                </div>
                <div className="flex-1">
                  <p className="text-sm font-semibold text-base-content/70">
                    {t("Account Status")}
                  </p>
                  <p className="font-medium text-base-content">Active</p>
                </div>
              </div>

              <div className="p-4 bg-warning/5 rounded-xl border border-warning/20">
                <div className="flex items-start gap-3">
                  <Sparkles className="w-4 h-4 text-warning mt-0.5 shrink-0" />
                  <div>
                    <p className="text-sm font-semibold text-warning mb-1">
                      {t("Security Tip")}
                    </p>
                    <p className="text-xs text-base-content/70">
                      {t(
                        "Use a strong, unique password and change it regularly for maximum security."
                      )}
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* 🔑 Password Change Form */}
        <div className="lg:col-span-2">
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
              {/* Old Password */}
              <div className="form-control">
                <label className="label">
                  <span className="label-text font-semibold text-base-content flex items-center gap-2">
                    <Lock className="w-4 h-4" />
                    {t("Current Password")}
                  </span>
                </label>
                <div className="relative">
                  <input
                    type={showOldPassword ? "text" : "password"}
                    value={currentPassword}
                    onChange={(e) => setOldPassword(e.target.value)}
                    className="input input-bordered w-full rounded-xl pl-4 pr-12 focus:ring-2 focus:ring-primary/50 bg-base-200/50 transition-all duration-200"
                    required
                    placeholder={t("Enter your current password")}
                  />
                  <button
                    type="button"
                    onClick={() => setShowOldPassword(!showOldPassword)}
                    className="absolute right-3 top-1/2 transform -translate-y-1/2 text-base-content/40 hover:text-base-content/70 transition-colors"
                  >
                    {showOldPassword ? (
                      <EyeOff className="w-4 h-4" />
                    ) : (
                      <Eye className="w-4 h-4" />
                    )}
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
                    className="input input-bordered w-full rounded-xl pl-4 pr-12 focus:ring-2 focus:ring-primary/50 bg-base-200/50 transition-all duration-200"
                    required
                    placeholder={t("Enter your new password")}
                  />
                  <button
                    type="button"
                    onClick={() => setShowNewPassword(!showNewPassword)}
                    className="absolute right-3 top-1/2 transform -translate-y-1/2 text-base-content/40 hover:text-base-content/70 transition-colors"
                  >
                    {showNewPassword ? (
                      <EyeOff className="w-4 h-4" />
                    ) : (
                      <Eye className="w-4 h-4" />
                    )}
                  </button>
                </div>
                <div className="label">
                  <span className="label-text-alt text-base-content/50">
                    {t(
                      "Use at least 8 characters with mix of letters, numbers & symbols"
                    )}
                  </span>
                </div>
              </div>

              {/* Submit Button */}
              <button
                type="submit"
                disabled={loading || !currentPassword || !newPassword}
                className="btn btn-primary btn-lg w-full rounded-xl shadow-lg hover:shadow-xl transition-all duration-300 transform hover:scale-105 flex items-center justify-center gap-2 font-semibold"
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

              {/* Status Message with auto-dismiss */}
              {status && (
                <div
                  className={`p-4 rounded-xl border transition-all duration-300 ${
                    status.success
                      ? "bg-success/10 border-success/20 text-success"
                      : "bg-error/10 border-error/20 text-error"
                  }`}
                >
                  <div className="flex items-center gap-3">
                    {status.success ? (
                      <CheckCircle className="w-5 h-5 shrink-0" />
                    ) : (
                      <XCircle className="w-5 h-5 shrink-0" />
                    )}
                    <div className="flex-1">
                      <p className="font-semibold">
                        {status.success ? t("Success!") : t("Error!")}
                      </p>
                      <p className="text-sm mt-1">{status.message}</p>
                    </div>
                    <button
                      onClick={() => setStatus(null)}
                      className="text-base-content/40 hover:text-base-content/70 transition-colors shrink-0"
                    >
                      <XCircle className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              )}
            </form>
          </div>
        </div>
      </div>

      {/* 🔒 Security Notes */}
      <div className="bg-linear-to-br from-base-100 to-base-200 border border-base-300/30 rounded-2xl shadow-lg backdrop-blur-lg p-6 transition-all duration-500">
        <div className="flex items-center gap-3 mb-4">
          <Shield className="w-5 h-5 text-info" />
          <h3 className="text-lg font-semibold text-base-content">
            {t("Security Best Practices")}
          </h3>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
          <div className="flex items-start gap-3 p-3 bg-base-200/50 rounded-lg">
            <div className="w-2 h-2 bg-success rounded-full mt-2 shrink-0"></div>
            <p className="text-base-content/70">
              {t("Use a unique password not used elsewhere")}
            </p>
          </div>
          <div className="flex items-start gap-3 p-3 bg-base-200/50 rounded-lg">
            <div className="w-2 h-2 bg-success rounded-full mt-2 shrink-0"></div>
            <p className="text-base-content/70">
              {t("Change your password every 3-6 months")}
            </p>
          </div>
          <div className="flex items-start gap-3 p-3 bg-base-200/50 rounded-lg">
            <div className="w-2 h-2 bg-success rounded-full mt-2 shrink-0"></div>
            <p className="text-base-content/70">
              {t("Enable two-factor authentication if available")}
            </p>
          </div>
          <div className="flex items-start gap-3 p-3 bg-base-200/50 rounded-lg">
            <div className="w-2 h-2 bg-success rounded-full mt-2 shrink-0"></div>
            <p className="text-base-content/70">
              {t("Avoid using personal information in passwords")}
            </p>
          </div>
        </div>
      </div>

      <ConfirmModal
        open={confirmOpen}
        title={t("Confirm Password Change")}
        message={t("Are you sure you want to change your password?")}
        confirmText={t("Yes, Change")}
        cancelText={t("Cancel")}
        onConfirm={submitPasswordChange}
        onCancel={() => setConfirmOpen(false)}
        loading={confirmLoading}
      />
    </section>
  );
};

export default ProfilePage;