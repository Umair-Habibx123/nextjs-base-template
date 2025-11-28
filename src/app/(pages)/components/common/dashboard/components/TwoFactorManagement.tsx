"use client";
import React, { useState, useEffect } from "react";
import { useAuth } from "../../../../../context/auth/authContext";
import { useTranslation } from "react-i18next";
import ConfirmModal from "../../../../components/common/ConfirmModal";
import { authClient } from "@/lib/client";
import { getBackupCodes } from "@/lib/server";
import {
  Shield,
  QrCode,
  Key,
  Smartphone,
  Mail,
  Download,
  Eye,
  EyeOff,
  CheckCircle,
  XCircle,
  Loader2,
  RefreshCw,
  Copy,
  AlertTriangle,
} from "lucide-react";
import QRCode from "react-qr-code";
import { toast } from "react-toastify";

const TwoFactorManagement = () => {
  const { user } = useAuth();
  const { t } = useTranslation();

  // State management
  const [loading, setLoading] = useState(false);
  const [twoFactorData, setTwoFactorData] = useState<any>(null);
  const [password, setPassword] = useState("");
  const [verificationCode, setVerificationCode] = useState("");
  const [backupCodes, setBackupCodes] = useState<string[]>([]);
  const [showBackupCodes, setShowBackupCodes] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [confirmOpen, setConfirmOpen] = useState(false);
  const [confirmAction, setConfirmAction] = useState<
    "enable" | "disable" | "regenerate" | "view"
  >("enable");
  const [confirmLoading, setConfirmLoading] = useState(false);

  useEffect(() => {
    if (user?.twoFactorEnabled) {
      loadBackupCodes();
    }
  }, [user?.twoFactorEnabled]);

  const loadBackupCodes = async () => {
    if (!user?.id) return;

    const response = await getBackupCodes(user.id);

    if (!response.success) {
      toast.error(response.error || "Error Try Again Later");
      return;
    }

    setBackupCodes(response.data.backupCodes || []);
  };

  // Enable 2FA
  const enableTwoFactor = async () => {
    setLoading(true);

    try {
      const { data, error } = await authClient.twoFactor.enable({
        password,
        issuer: "Your App Name", // Replace with your app name
      });

      if (error) throw new Error(error.message);

      setTwoFactorData(data);
      setBackupCodes(data.backupCodes || []);
      toast.success("2FA setup initiated. Please verify your code.");
    } catch (err: any) {
      toast.error(err.message || "Error Try Again Later");
    } finally {
      setLoading(false);
      setConfirmOpen(false);
    }
  };

  // Verify TOTP code
  const verifyTwoFactor = async () => {
    if (!verificationCode) {
      toast.success("Please enter verification code");
      return;
    }

    setLoading(true);
    try {
      const { data, error } = await authClient.twoFactor.verifyTotp({
        code: verificationCode,
        trustDevice: true,
      });

      if (error) throw new Error(error.message);

      toast.success("Two-factor authentication enabled successfully!");
      setVerificationCode("");
      setPassword("");
      setTwoFactorData(null);
      window.location.reload();
    } catch (err: any) {
      toast.error(err.message || "Error Try Again Later");
    } finally {
      setLoading(false);
    }
  };

  // Disable 2FA
  const disableTwoFactor = async () => {
    setConfirmLoading(true);
    try {
      const { data, error } = await authClient.twoFactor.disable({
        password,
      });

      if (error) throw new Error(error.message);

      toast.success("Two-factor authentication disabled successfully!");
      setTwoFactorData(null);
      setBackupCodes([]);
      setPassword("");
      setShowBackupCodes(false);
      window.location.reload();
    } catch (err: any) {
      toast.error(err.message || "Error Try Again Later");
    } finally {
      setConfirmLoading(false);
      setConfirmOpen(false);
    }
  };

  // View backup codes (requires password)
  const viewBackupCodes = async () => {
    setConfirmLoading(true);
    try {
      // First verify password by trying to get TOTP URI
      const { error } = await authClient.twoFactor.getTotpUri({
        password,
      });

      if (error) throw new Error("Invalid password");

      // If password is valid, show backup codes
      setShowBackupCodes(true);
      toast.success("Backup codes are now visible.");
    } catch (err: any) {
      toast.error(err.message);
    } finally {
      setConfirmLoading(false);
      setConfirmOpen(false);
    }
  };

  // Regenerate backup codes
  const regenerateBackupCodes = async () => {
    setConfirmLoading(true);
    try {
      const { data, error } = await authClient.twoFactor.generateBackupCodes({
        password,
      });

      if (error) throw new Error(error.message);

      setBackupCodes(data.backupCodes || []);
      setShowBackupCodes(true);
      toast.success("Backup codes regenerated successfully!");
    } catch (err: any) {
      toast.error(err.message || "Error Try Again Later");
    } finally {
      setConfirmLoading(false);
      setConfirmOpen(false);
    }
  };

  // Copy backup codes to clipboard
  const copyBackupCodes = async () => {
    try {
      await navigator.clipboard.writeText(backupCodes.join("\n"));
      toast.success("Backup codes copied to clipboard!");
    } catch (err) {
      toast.error("Failed to copy backup codes");
    }
  };

  // Download backup codes
  const downloadBackupCodes = () => {
    const element = document.createElement("a");
    const file = new Blob([backupCodes.join("\n")], { type: "text/plain" });
    element.href = URL.createObjectURL(file);
    element.download = "backup-codes.txt";
    document.body.appendChild(element);
    element.click();
    document.body.removeChild(element);
  };

  // Handle confirmation modal
  const handleConfirmAction = () => {
    switch (confirmAction) {
      case "enable":
        enableTwoFactor();
        break;
      case "disable":
        disableTwoFactor();
        break;
      case "regenerate":
        regenerateBackupCodes();
        break;
      case "view":
        viewBackupCodes();
        break;
    }
  };

  const isEnableButtonDisabled = loading || !password || twoFactorData;

  return (
    <section className="max-w-full space-y-8 animate-fade-in">
      {/* 🌟 2FA Header */}
      <div className="flex items-center gap-4 p-6 bg-linear-to-r from-primary/5 via-warning/5 to-accent/5 rounded-3xl border border-base-300/20 backdrop-blur-lg">
        <div className="p-3 rounded-2xl bg-linear-to-br from-warning to-warning/80 text-warning-content shadow-lg">
          <Shield className="w-7 h-7" />
        </div>
        <div className="flex-1">
          <h1 className="text-3xl font-bold bg-linear-to-r from-base-content to-base-content/70 bg-clip-text text-transparent">
            {t("Two-Factor Authentication")}
          </h1>
          <p className="text-base-content/70 mt-2 text-lg leading-relaxed">
            {t("Add an extra layer of security to your account with 2FA.")}
          </p>
        </div>
        <div
          className={`px-4 py-2 rounded-full border font-semibold ${
            user?.twoFactorEnabled
              ? "bg-success/10 border-success/20 text-success"
              : "bg-base-200 border-base-300 text-base-content/60"
          }`}
        >
          {user?.twoFactorEnabled ? t("Enabled") : t("Disabled")}
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* 🔐 2FA Setup */}
        <div className="space-y-6">
          <div className="bg-linear-to-br from-base-100 to-base-200 border border-base-300/30 rounded-2xl shadow-2xl backdrop-blur-lg p-6">
            <div className="flex items-center gap-3 mb-6">
              <div className="p-2 rounded-xl bg-warning/10 text-warning">
                <Smartphone className="w-5 h-5" />
              </div>
              <h2 className="text-xl font-bold text-base-content">
                {user?.twoFactorEnabled ? t("2FA is Enabled") : t("Enable 2FA")}
              </h2>
            </div>

            {!user?.twoFactorEnabled ? (
              // 2FA Setup Form
              <div className="space-y-6">
                <div className="form-control">
                  <label className="label">
                    <span className="label-text font-semibold text-base-content">
                      {t("Current Password")}
                    </span>
                  </label>
                  <div className="relative">
                    <input
                      type={showPassword ? "text" : "password"}
                      value={password}
                      autoComplete="new-password"
                      onChange={(e) => setPassword(e.target.value)}
                      className="input input-bordered w-full rounded-xl pl-4 pr-12 focus:ring-2 focus:ring-warning/50 bg-base-200/50"
                      placeholder={t("Enter your password")}
                      required
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-3 top-1/2 transform -translate-y-1/2 text-base-content/40 hover:text-base-content/70"
                    >
                      {showPassword ? <EyeOff /> : <Eye />}
                    </button>
                  </div>
                </div>

                <button
                  onClick={() => {
                    if (!password) {
                      toast.error("Please enter your password");
                      return;
                    }
                    setConfirmAction("enable");
                    setConfirmOpen(true);
                  }}
                  disabled={isEnableButtonDisabled}
                  className="btn btn-warning btn-lg w-full rounded-xl shadow-lg hover:shadow-xl transition-all duration-300 flex items-center justify-center gap-2 font-semibold"
                >
                  {loading ? (
                    <Loader2 className="w-5 h-5 animate-spin" />
                  ) : (
                    <Shield className="w-5 h-5" />
                  )}
                  {t("Enable Two-Factor Authentication")}
                </button>
              </div>
            ) : (
              // 2FA Disable Section
              <div className="space-y-6">
                <div className="p-4 bg-success/10 rounded-xl border border-success/20">
                  <div className="flex items-center gap-3">
                    <CheckCircle className="w-5 h-5 text-success" />
                    <div>
                      <p className="font-semibold text-success">
                        {t("2FA is Active")}
                      </p>
                      <p className="text-sm text-success/80 mt-1">
                        {t(
                          "Your account is protected with two-factor authentication."
                        )}
                      </p>
                    </div>
                  </div>
                </div>

                <div className="form-control">
                  <label className="label">
                    <span className="label-text font-semibold text-base-content">
                      {t("Current Password")}
                    </span>
                  </label>
                  <div className="relative">
                    <input
                      type={showPassword ? "text" : "password"}
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      className="input input-bordered w-full rounded-xl pl-4 pr-12 focus:ring-2 focus:ring-error/50 bg-base-200/50"
                      placeholder={t("Enter your password to disable")}
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-3 top-1/2 transform -translate-y-1/2 text-base-content/40 hover:text-base-content/70"
                    >
                      {showPassword ? <EyeOff /> : <Eye />}
                    </button>
                  </div>
                </div>

                <button
                  onClick={() => {
                    if (!password) {
                      toast.error("Please enter your password");
                      return;
                    }
                    setConfirmAction("disable");
                    setConfirmOpen(true);
                  }}
                  disabled={!password}
                  className="btn btn-error btn-outline w-full rounded-xl flex items-center justify-center gap-2 font-semibold"
                >
                  <XCircle className="w-5 h-5" />
                  {t("Disable Two-Factor Authentication")}
                </button>
              </div>
            )}
          </div>

          {/* 🔢 Verification Code Input */}
          {twoFactorData && !user?.twoFactorEnabled && (
            <div className="bg-linear-to-br from-base-100 to-base-200 border border-base-300/30 rounded-2xl shadow-2xl backdrop-blur-lg p-6">
              <div className="flex items-center gap-3 mb-6">
                <div className="p-2 rounded-xl bg-info/10 text-info">
                  <Key className="w-5 h-5" />
                </div>
                <h3 className="text-lg font-bold text-base-content">
                  {t("Verify Authentication Code")}
                </h3>
              </div>

              <div className="space-y-4">
                <div className="form-control">
                  <label className="label">
                    <span className="label-text font-semibold text-base-content">
                      {t("Enter 6-digit code from your authenticator app")}
                    </span>
                  </label>
                  <input
                    type="text"
                    value={verificationCode}
                    onChange={(e) =>
                      setVerificationCode(
                        e.target.value.replace(/\D/g, "").slice(0, 6)
                      )
                    }
                    className="input input-bordered w-full rounded-xl text-center text-xl font-mono tracking-widest focus:ring-2 focus:ring-info/50 bg-base-200/50"
                    placeholder="123456"
                    maxLength={6}
                  />
                </div>

                <button
                  onClick={verifyTwoFactor}
                  disabled={loading || verificationCode.length !== 6}
                  className="btn btn-info btn-lg w-full rounded-xl shadow-lg hover:shadow-xl transition-all duration-300 flex items-center justify-center gap-2 font-semibold"
                >
                  {loading ? (
                    <Loader2 className="w-5 h-5 animate-spin" />
                  ) : (
                    <CheckCircle className="w-5 h-5" />
                  )}
                  {t("Verify and Enable")}
                </button>
              </div>
            </div>
          )}
        </div>

        {/* 📱 QR Code and Backup Codes */}
        <div className="space-y-6">
          {/* QR Code */}
          {twoFactorData?.totpURI && !user?.twoFactorEnabled && (
            <div className="bg-linear-to-br from-base-100 to-base-200 border border-base-300/30 rounded-2xl shadow-2xl backdrop-blur-lg p-6">
              <div className="flex items-center gap-3 mb-6">
                <div className="p-2 rounded-xl bg-primary/10 text-primary">
                  <QrCode className="w-5 h-5" />
                </div>
                <h3 className="text-lg font-bold text-base-content">
                  {t("Scan QR Code")}
                </h3>
              </div>

              <div className="space-y-4">
                <p className="text-base-content/70 text-sm">
                  {t(
                    "Scan this QR code with your authenticator app like Google Authenticator, Authy, or Microsoft Authenticator."
                  )}
                </p>

                <div className="flex justify-center p-4 bg-white rounded-xl border-2 border-dashed border-base-300">
                  <QRCode
                    value={twoFactorData.totpURI}
                    size={200}
                    className="rounded-lg"
                  />
                </div>

                <div className="form-control">
                  <label className="label">
                    <span className="label-text font-semibold text-base-content">
                      {t("Or enter this code manually")}
                    </span>
                  </label>
                  <div className="relative">
                    <input
                      type="text"
                      value={twoFactorData.secret}
                      readOnly
                      className="input input-bordered w-full rounded-xl font-mono text-center bg-base-200/50 pr-16"
                    />
                    <button
                      onClick={() => {
                        navigator.clipboard.writeText(twoFactorData.secret);
                        toast.success("Secret code copied!");
                      }}
                      className="absolute right-3 top-1/2 transform -translate-y-1/2 btn btn-ghost btn-sm"
                    >
                      <Copy className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Backup Codes */}
          {user?.twoFactorEnabled && (
            <div className="bg-linear-to-br from-base-100 to-base-200 border border-base-300/30 rounded-2xl shadow-2xl backdrop-blur-lg p-6">
              <div className="flex items-center gap-3 mb-6">
                <div className="p-2 rounded-xl bg-accent/10 text-accent">
                  <Key className="w-5 h-5" />
                </div>
                <div className="flex-1">
                  <h3 className="text-lg font-bold text-base-content">
                    {t("Backup Codes")}
                  </h3>
                  <p className="text-base-content/60 text-sm">
                    {t(
                      "Save these codes in a secure place. Each code can be used once."
                    )}
                  </p>
                </div>
              </div>

              <div className="space-y-4">
                {showBackupCodes ? (
                  <div className="space-y-3">
                    <div className="grid grid-cols-2 gap-2 p-4 bg-base-200 rounded-xl border border-base-300">
                      {backupCodes.map((code, index) => (
                        <div
                          key={index}
                          className="font-mono text-sm text-center p-2 bg-base-100 rounded border border-base-300"
                        >
                          {code}
                        </div>
                      ))}
                    </div>

                    <div className="flex gap-2">
                      <button
                        onClick={copyBackupCodes}
                        className="btn btn-accent btn-sm flex-1 gap-2"
                      >
                        <Copy className="w-4 h-4" />
                        {t("Copy")}
                      </button>
                      <button
                        onClick={downloadBackupCodes}
                        className="btn btn-accent btn-sm flex-1 gap-2"
                      >
                        <Download className="w-4 h-4" />
                        {t("Download")}
                      </button>
                    </div>

                    <button
                      onClick={() => {
                        if (!password) {
                          toast.error(
                            "Please enter your password to regenerate backup codes"
                          );
                          return;
                        }
                        setConfirmAction("regenerate");
                        setConfirmOpen(true);
                      }}
                      className="btn btn-warning btn-outline w-full gap-2"
                    >
                      <RefreshCw className="w-4 h-4" />
                      {t("Regenerate Backup Codes")}
                    </button>
                  </div>
                ) : (
                  <div className="text-center p-6 border-2 border-dashed border-base-300 rounded-xl">
                    <AlertTriangle className="w-8 h-8 text-warning mx-auto mb-2" />
                    <p className="text-base-content/70 text-sm mb-4">
                      {backupCodes.length > 0
                        ? t(
                            "Backup codes are available but hidden for security reasons."
                          )
                        : t(
                            "No backup codes available. Generate new backup codes."
                          )}
                    </p>

                    {backupCodes.length > 0 ? (
                      <button
                        onClick={() => {
                          if (!password) {
                            toast.error(
                              "Please enter your password to view backup codes"
                            );
                            return;
                          }
                          setConfirmAction("view");
                          setConfirmOpen(true);
                        }}
                        className="btn btn-warning gap-2"
                      >
                        <Eye className="w-4 h-4" />
                        {t("View Backup Codes")}
                      </button>
                    ) : (
                      <button
                        onClick={() => {
                          if (!password) {
                            toast.error(
                              "Please enter your password to generate backup codes"
                            );
                            return;
                          }
                          setConfirmAction("regenerate");
                          setConfirmOpen(true);
                        }}
                        className="btn btn-warning gap-2"
                      >
                        <RefreshCw className="w-4 h-4" />
                        {t("Generate Backup Codes")}
                      </button>
                    )}
                  </div>
                )}

                <div className="p-3 bg-warning/5 rounded-lg border border-warning/20">
                  <div className="flex items-start gap-2">
                    <AlertTriangle className="w-4 h-4 text-warning mt-0.5 shrink-0" />
                    <p className="text-xs text-warning">
                      {t(
                        "Keep your backup codes secure. Anyone with these codes can access your account."
                      )}
                    </p>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Confirmation Modal */}
      <ConfirmModal
        open={confirmOpen}
        title={
          confirmAction === "enable"
            ? t("Enable Two-Factor Authentication")
            : confirmAction === "disable"
            ? t("Disable Two-Factor Authentication")
            : confirmAction === "regenerate"
            ? t("Regenerate Backup Codes")
            : t("View Backup Codes")
        }
        message={
          confirmAction === "enable"
            ? t(
                "Are you sure you want to enable two-factor authentication? You'll need to verify with an authenticator app."
              )
            : confirmAction === "disable"
            ? t(
                "Are you sure you want to disable two-factor authentication? This will make your account less secure."
              )
            : confirmAction === "regenerate"
            ? t(
                "Are you sure you want to regenerate backup codes? Your old backup codes will no longer work."
              )
            : t(
                "Please enter your password to view your backup codes. This action requires verification."
              )
        }
        confirmText={
          confirmAction === "enable"
            ? t("Enable")
            : confirmAction === "disable"
            ? t("Disable")
            : confirmAction === "regenerate"
            ? t("Regenerate")
            : t("View Codes")
        }
        cancelText={t("Cancel")}
        onConfirm={handleConfirmAction}
        onCancel={() => setConfirmOpen(false)}
        loading={confirmLoading || loading}
      />
    </section>
  );
};

export default TwoFactorManagement;
