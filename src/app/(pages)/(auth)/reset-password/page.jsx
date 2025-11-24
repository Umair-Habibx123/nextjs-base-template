// src/app/(pages)/reset-password/page.jsx
"use client";

import React, { useState, useEffect } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { useTranslation } from "react-i18next";
import { authClient } from "@/lib/client";
import {
  Lock,
  Eye,
  EyeOff,
  CheckCircle,
  XCircle,
  Loader2,
  Shield,
  Key,
  AlertTriangle,
  ArrowLeft,
} from "lucide-react";
import { toast, ToastContainer } from "react-toastify";
import Link from "next/link";

// Token management utilities
const TOKEN_KEY = "reset_token";
const TOKEN_TIMESTAMP_KEY = "reset_token_timestamp";
const TOKEN_EXPIRY_MS = 60 * 60 * 1000;

const tokenManager = {
  // Store token with timestamp
  setToken: (token) => {
    if (typeof window !== "undefined") {
      sessionStorage.setItem(TOKEN_KEY, token);
      sessionStorage.setItem(TOKEN_TIMESTAMP_KEY, Date.now().toString());
    }
  },

  // Get token if valid
  getToken: () => {
    if (typeof window !== "undefined") {
      const token = sessionStorage.getItem(TOKEN_KEY);
      const timestamp = sessionStorage.getItem(TOKEN_TIMESTAMP_KEY);

      if (!token || !timestamp) return null;

      // Check if token is expired (1 hour)
      const age = Date.now() - parseInt(timestamp);
      if (age > TOKEN_EXPIRY_MS) {
        tokenManager.clearToken();
        return null;
      }

      return token;
    }
    return null;
  },

  // Clear token
  clearToken: () => {
    if (typeof window !== "undefined") {
      sessionStorage.removeItem(TOKEN_KEY);
      sessionStorage.removeItem(TOKEN_TIMESTAMP_KEY);
    }
  },

  // Check if token exists and is valid
  hasValidToken: () => {
    return !!tokenManager.getToken();
  },

  // Initialize token from URL if present
  initializeFromURL: (searchParams, router, t) => {
    return new Promise((resolve) => {
      try {
        // Check if we already have a valid token
        const existingToken = tokenManager.getToken();
        if (existingToken) {
          resolve(true);
          return;
        }

        // Get token from URL parameters
        const tokenParam = searchParams.get("token");
        const errorParam = searchParams.get("error");

        // Handle errors from URL
        if (errorParam === "INVALID_TOKEN") {
          toast.error(t("Reset link is invalid or has expired"));
          router.push("/request-password-reset");
          resolve(false);
          return;
        }

        // Validate token presence
        if (!tokenParam) {
          resolve(false);
          return;
        }

        // Validate token format (basic check)
        if (tokenParam.length < 10) {
          toast.error(t("Invalid token format"));
          router.push("/request-password-reset");
          resolve(false);
          return;
        }

        // Store the token securely
        tokenManager.setToken(tokenParam);

        // Remove token from URL for security
        const newUrl = window.location.pathname;
        window.history.replaceState({}, document.title, newUrl);

        resolve(true);
      } catch (error) {
        console.error("Token initialization error:", error);
        resolve(false);
      }
    });
  },
};

const ResetPasswordPage = () => {
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  const [isValidatingToken, setIsValidatingToken] = useState(true);
  const [hasValidToken, setHasValidToken] = useState(false);
  const [passwordStrength, setPasswordStrength] = useState({
    score: 0,
    feedback: [],
  });

  const router = useRouter();
  const searchParams = useSearchParams();
  const { t } = useTranslation();

  useEffect(() => {
    const initializeToken = async () => {
      setIsValidatingToken(true);

      try {
        const tokenValid = await tokenManager.initializeFromURL(
          searchParams,
          router,
          t
        );

        setHasValidToken(tokenValid);

        // If no valid token and no token in URL, redirect immediately
        if (!tokenValid && !searchParams.get("token")) {
          toast.error(t("Reset token required to access this page"));
          router.push("/request-password-reset");
          return;
        }
      } catch (error) {
        console.error("Token initialization failed:", error);
        setHasValidToken(false);
        toast.error(t("Failed to initialize reset token"));
        router.push("/request-password-reset");
      } finally {
        setIsValidatingToken(false);
      }
    };

    initializeToken();
  }, [searchParams, router, t]);

  useEffect(() => {
    // Enhanced password strength checker
    const checkPasswordStrength = (password) => {
      const feedback = [];
      let score = 0;

      // Length check
      if (password.length >= 12) {
        score += 2;
      } else if (password.length >= 8) {
        score += 1;
        feedback.push(t("Use 12+ characters for better security"));
      } else {
        feedback.push(t("At least 8 characters"));
      }

      // Upper case check
      if (/[A-Z]/.test(password)) {
        score++;
      } else {
        feedback.push(t("One uppercase letter"));
      }

      // Lower case check
      if (/[a-z]/.test(password)) {
        score++;
      } else {
        feedback.push(t("One lowercase letter"));
      }

      // Number check
      if (/[0-9]/.test(password)) {
        score++;
      } else {
        feedback.push(t("One number"));
      }

      // Special character check
      if (/[^A-Za-z0-9]/.test(password)) {
        score++;
      } else {
        feedback.push(t("One special character"));
      }

      // Sequential character check
      if (
        !/(.)\1{2,}/.test(password) &&
        !/(abc|123|qwe|asd|zxc)/i.test(password)
      ) {
        score++;
      } else {
        feedback.push(t("Avoid sequential characters"));
      }

      // Common password check (extended list)
      const commonPasswords = [
        "password",
        "123456",
        "12345678",
        "123456789",
        "qwerty",
        "letmein",
        "welcome",
        "admin",
        "password1",
        "123123",
      ];
      if (!commonPasswords.includes(password.toLowerCase())) {
        score++;
      } else {
        feedback.push(t("Avoid common passwords"));
      }

      return { score, feedback };
    };

    setPasswordStrength(checkPasswordStrength(newPassword));
  }, [newPassword, t]);

  const passwordsMatch =
    newPassword === confirmPassword && confirmPassword.length > 0;
  const isPasswordStrong = passwordStrength.score >= 5;
  const canSubmit =
    passwordsMatch && isPasswordStrong && hasValidToken && !isSubmitting;

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!canSubmit) return;

    setIsSubmitting(true);

    try {
      const token = tokenManager.getToken();
      if (!token) {
        toast.error(
          t("Reset token has expired. Please request a new reset link.")
        );
        setHasValidToken(false);
        router.push("/request-password-reset");
        return;
      }

      const { data, error } = await authClient.resetPassword({
        newPassword: newPassword,
        token,
      });

      if (error) {
        if (
          error.message?.includes("token") ||
          error.message?.includes("expired")
        ) {
          toast.error(t("Reset token is invalid or has expired"));
          tokenManager.clearToken();
          setHasValidToken(false);
          router.push("/request-password-reset");
          return;
        }
        toast.error(error.message || t("Failed to reset password"));
        return;
      }

      // Clear token immediately after successful reset
      tokenManager.clearToken();
      setHasValidToken(false);

      // Clear password fields
      setNewPassword("");
      setConfirmPassword("");

      setIsSuccess(true);
      toast.success(t("Password reset successfully!"));

      // Redirect to login after 3 seconds
      setTimeout(() => {
        router.push("/login");
      }, 3000);
    } catch (error) {
      console.error("Password reset error:", error);
      toast.error(error.message || t("Failed to reset password"));
    } finally {
      setIsSubmitting(false);
    }
  };

  // Show loading state while validating token
  if (isValidatingToken) {
    return (
      <main className="min-h-screen flex items-center justify-center bg-linear-to-br from-primary/5 via-secondary/5 to-accent/5 px-4 py-8">
        <ToastContainer />
        <div className="absolute inset-0 overflow-hidden">
          <div className="absolute -top-40 -right-40 w-80 h-80 bg-primary/10 rounded-full blur-3xl"></div>
          <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-secondary/10 rounded-full blur-3xl"></div>
        </div>

        <section className="card w-full max-w-md bg-linear-to-br from-base-100 to-base-200 border border-base-300/30 shadow-2xl backdrop-blur-lg rounded-3xl z-10">
          <div className="card-body p-8 text-center space-y-6">
            <div className="flex justify-center">
              <div className="p-4 rounded-2xl bg-primary text-primary-content shadow-lg">
                <Loader2 className="w-8 h-8 animate-spin" />
              </div>
            </div>
            <div className="space-y-3">
              <h1 className="text-2xl font-bold text-base-content">
                {t("Verifying Reset Link")}
              </h1>
              <p className="text-base-content/70">
                {t("Please wait while we validate your reset link...")}
              </p>
            </div>
          </div>
        </section>
      </main>
    );
  }

  // Show error if no valid token and not in success state
  if (!hasValidToken && !isSuccess) {
    return (
      <main className="min-h-screen flex items-center justify-center bg-linear-to-br from-primary/5 via-error/5 to-accent/5 px-4 py-8">
        <ToastContainer />
        <div className="absolute inset-0 overflow-hidden">
          <div className="absolute -top-40 -right-40 w-80 h-80 bg-error/10 rounded-full blur-3xl"></div>
          <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-primary/10 rounded-full blur-3xl"></div>
        </div>

        <section className="card w-full max-w-md bg-linear-to-br from-base-100 to-base-200 border border-base-300/30 shadow-2xl backdrop-blur-lg rounded-3xl z-10">
          <div className="card-body p-8 text-center space-y-6">
            <div className="flex justify-center">
              <div className="p-4 rounded-2xl bg-error text-error-content shadow-lg">
                <AlertTriangle className="w-8 h-8" />
              </div>
            </div>
            <div className="space-y-4">
              <h1 className="text-2xl font-bold text-base-content">
                {t("Access Denied")}
              </h1>
              <p className="text-base-content/70">
                {t("A valid reset token is required to access this page.")}
              </p>
              <p className="text-sm text-base-content/60">
                {t("Please request a new password reset link.")}
              </p>
            </div>
            <div className="space-y-3 pt-4">
              <Link
                href="/request-password-reset"
                className="btn btn-primary w-full rounded-xl"
              >
                {t("Get Reset Link")}
              </Link>
              <Link
                href="/login"
                className="btn btn-ghost w-full rounded-xl flex items-center justify-center gap-2"
              >
                <ArrowLeft className="w-4 h-4" />
                {t("Back to Login")}
              </Link>
            </div>
          </div>
        </section>
      </main>
    );
  }

  if (isSuccess) {
    return (
      <main className="min-h-screen flex items-center justify-center bg-linear-to-br from-primary/5 via-success/5 to-accent/5 px-4 py-8">
        <ToastContainer />
        <div className="absolute inset-0 overflow-hidden">
          <div className="absolute -top-40 -right-40 w-80 h-80 bg-success/10 rounded-full blur-3xl"></div>
          <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-primary/10 rounded-full blur-3xl"></div>
        </div>

        <section className="card w-full max-w-md bg-linear-to-br from-base-100 to-base-200 border border-base-300/30 shadow-2xl backdrop-blur-lg rounded-3xl z-10">
          <div className="card-body p-8 text-center space-y-6">
            <div className="flex justify-center">
              <div className="p-4 rounded-2xl bg-success text-success-content shadow-lg">
                <CheckCircle className="w-8 h-8" />
              </div>
            </div>

            <div className="space-y-3">
              <h1 className="text-2xl font-bold text-base-content">
                {t("Password Reset!")}
              </h1>
              <p className="text-base-content/70">
                {t("Your password has been successfully reset.")}
              </p>
              <p className="text-sm text-base-content/60">
                {t("Redirecting to login page...")}
              </p>
            </div>

            <div className="pt-4">
              <Link href="/login" className="btn btn-primary w-full rounded-xl">
                {t("Go to Login")}
              </Link>
            </div>
          </div>
        </section>
      </main>
    );
  }

  // Only render the reset form if we have a valid token
  return (
    <main className="min-h-screen flex items-center justify-center bg-linear-to-br from-primary/5 via-secondary/5 to-accent/5 px-4 py-8">
      <ToastContainer />
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute -top-40 -right-40 w-80 h-80 bg-primary/10 rounded-full blur-3xl"></div>
        <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-secondary/10 rounded-full blur-3xl"></div>
        <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-accent/5 rounded-full blur-3xl"></div>
      </div>

      <section className="card w-full max-w-md bg-linear-to-br from-base-100 to-base-200 border border-base-300/30 shadow-2xl backdrop-blur-lg rounded-3xl z-10">
        <div className="card-body p-8 space-y-6">
          {/* Header */}
          <div className="text-center space-y-4">
            <div className="flex justify-center">
              <div className="p-4 rounded-2xl bg-linear-to-br from-primary to-primary/80 text-primary-content shadow-lg">
                <Key className="w-8 h-8" />
              </div>
            </div>
            <div className="space-y-2">
              <h1 className="text-2xl font-bold text-base-content">
                {t("Create New Password")}
              </h1>
              <p className="text-base-content/70">
                {t("Enter your new secure password below")}
              </p>
            </div>
          </div>

          {/* Security Status */}
          <div className="bg-success/5 rounded-2xl p-4 border border-success/20">
            <div className="flex items-center gap-3">
              <Shield className="w-4 h-4 text-success shrink-0" />
              <div>
                <p className="text-sm font-semibold text-success">
                  {t("Secure Session Active")}
                </p>
                <p className="text-xs text-base-content/70">
                  {t(
                    "Valid reset token detected. You can now set your new password."
                  )}
                </p>
              </div>
            </div>
          </div>

          {/* Reset Form */}
          <form onSubmit={handleSubmit} className="space-y-6">
            {/* New Password */}
            <div className="form-control">
              <label className="label">
                <span className="label-text font-semibold text-base-content flex items-center gap-2">
                  <Lock className="w-4 h-4 text-primary" />
                  {t("New Password")}
                </span>
              </label>
              <div className="relative">
                <input
                  type={showNewPassword ? "text" : "password"}
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  className="input input-bordered w-full rounded-xl pl-10 pr-10 focus:ring-2 focus:ring-primary/50 bg-base-200/50"
                  placeholder={t("Enter secure password")}
                  required
                  disabled={isSubmitting}
                  minLength={8}
                  autoComplete="new-password"
                />
                <Lock className="w-4 h-4 text-base-content/40 absolute left-3 top-1/2 transform -translate-y-1/2" />
                <button
                  type="button"
                  onClick={() => setShowNewPassword(!showNewPassword)}
                  className="absolute right-3 top-1/2 transform -translate-y-1/2 text-base-content/40 hover:text-base-content/70 transition-colors"
                  disabled={isSubmitting}
                >
                  {showNewPassword ? (
                    <EyeOff className="w-4 h-4" />
                  ) : (
                    <Eye className="w-4 h-4" />
                  )}
                </button>
              </div>

              {/* Password Strength Indicator */}
              {newPassword && (
                <div className="mt-3 space-y-2">
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-base-content/70">
                      {t("Password strength")}:
                    </span>
                    <span
                      className={`font-semibold ${
                        passwordStrength.score >= 5
                          ? "text-success"
                          : passwordStrength.score >= 3
                          ? "text-warning"
                          : "text-error"
                      }`}
                    >
                      {passwordStrength.score >= 5
                        ? t("Strong")
                        : passwordStrength.score >= 3
                        ? t("Medium")
                        : t("Weak")}
                    </span>
                  </div>
                  <div className="w-full bg-base-300 rounded-full h-2">
                    <div
                      className={`h-2 rounded-full transition-all duration-300 ${
                        passwordStrength.score >= 5
                          ? "bg-success"
                          : passwordStrength.score >= 3
                          ? "bg-warning"
                          : "bg-error"
                      }`}
                      style={{
                        width: `${(passwordStrength.score / 7) * 100}%`,
                      }}
                    ></div>
                  </div>
                  {passwordStrength.feedback.length > 0 && (
                    <div className="text-xs text-base-content/60 space-y-1">
                      {passwordStrength.feedback.map((item, index) => (
                        <div key={index} className="flex items-center gap-2">
                          <XCircle className="w-3 h-3 text-error" />
                          {item}
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              )}
            </div>

            {/* Confirm Password */}
            <div className="form-control">
              <label className="label">
                <span className="label-text font-semibold text-base-content flex items-center gap-2">
                  <Lock className="w-4 h-4 text-primary" />
                  {t("Confirm Password")}
                </span>
              </label>
              <div className="relative">
                <input
                  type={showConfirmPassword ? "text" : "password"}
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  className="input input-bordered w-full rounded-xl pl-10 pr-10 focus:ring-2 focus:ring-primary/50 bg-base-200/50"
                  placeholder={t("Confirm new password")}
                  required
                  disabled={isSubmitting}
                  minLength={8}
                  autoComplete="new-password"
                />
                <Lock className="w-4 h-4 text-base-content/40 absolute left-3 top-1/2 transform -translate-y-1/2" />
                <button
                  type="button"
                  onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                  className="absolute right-3 top-1/2 transform -translate-y-1/2 text-base-content/40 hover:text-base-content/70 transition-colors"
                  disabled={isSubmitting}
                >
                  {showConfirmPassword ? (
                    <EyeOff className="w-4 h-4" />
                  ) : (
                    <Eye className="w-4 h-4" />
                  )}
                </button>
              </div>
              {confirmPassword && (
                <div className="mt-2">
                  {passwordsMatch ? (
                    <div className="flex items-center gap-2 text-success text-sm">
                      <CheckCircle className="w-4 h-4" />
                      {t("Passwords match")}
                    </div>
                  ) : (
                    <div className="flex items-center gap-2 text-error text-sm">
                      <XCircle className="w-4 h-4" />
                      {t("Passwords do not match")}
                    </div>
                  )}
                </div>
              )}
            </div>

            <button
              type="submit"
              disabled={!canSubmit}
              className="btn btn-primary w-full rounded-xl shadow-lg hover:shadow-xl transition-all duration-300 font-semibold disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isSubmitting ? (
                <span className="flex items-center justify-center gap-3">
                  <Loader2 className="w-5 h-5 animate-spin" />
                  {t("Resetting...")}
                </span>
              ) : (
                <span className="flex items-center justify-center gap-3">
                  <Key className="w-5 h-5" />
                  {t("Reset Password")}
                </span>
              )}
            </button>
          </form>

          {/* Enhanced Security Info */}
          <div className="bg-info/5 rounded-2xl p-4 border border-info/20">
            <div className="flex items-start gap-3">
              <Shield className="w-4 h-4 text-info mt-0.5 shrink-0" />
              <div className="space-y-2">
                <p className="text-sm font-semibold text-info">
                  {t("Enhanced Security Requirements")}
                </p>
                <ul className="text-xs text-base-content/70 list-disc list-inside space-y-1">
                  <li>{t("Minimum 8 characters, 12+ recommended")}</li>
                  <li>{t("Uppercase & lowercase letters")}</li>
                  <li>{t("Numbers and special characters")}</li>
                  <li>{t("No sequential or repeated characters")}</li>
                  <li>{t("Not a commonly used password")}</li>
                </ul>
              </div>
            </div>
          </div>
        </div>
      </section>
    </main>
  );
};

export default ResetPasswordPage;
