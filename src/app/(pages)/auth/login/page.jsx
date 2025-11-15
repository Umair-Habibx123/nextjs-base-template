// src/app/(pages)/auth/login/page.jsx
"use client";

import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "../../../context/auth/authContext";
import { useSessionRedirect } from "../../../hooks/useSessionRedirect";
import { useTranslation } from "react-i18next";
import {
  Mail,
  Lock,
  Loader2,
  LogIn,
  Eye,
  EyeOff,
  Shield,
  Sparkles,
  User,
  Key,
} from "lucide-react";
import { toast , ToastContainer } from "react-toastify";
import Loading from "../../components/layout/Loading";

const LoginPage = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { login, user, loginLoading, authLoading } = useAuth();
  const router = useRouter();
  const { t } = useTranslation();
  const { getRedirectUrl, clearRedirectUrl } = useSessionRedirect();

  // Auto redirect if already logged in
  useEffect(() => {
    if (!authLoading && user) {
      handlePostLoginRedirect();
    }
  }, [user, authLoading]);

  const handlePostLoginRedirect = () => {
    const redirectUrl = getRedirectUrl();
    
    if (redirectUrl) {
      // Clear the stored URL before redirecting
      clearRedirectUrl();
      router.replace(redirectUrl);
    } else {
      // Default redirect based on user role
      router.replace(user.role === "admin" ? "/admin-dashboard" : "/");
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      await login({ email, password });
      // The redirect will be handled by the useEffect above
      // once the user state is updated
    } catch (error) {
      toast.error(error.message || "Login failed");
      setIsSubmitting(false);
    }
  };

  if (authLoading) {
    return <Loading fullscreen message="Loading ....." />;
  }

  if (user) {
    return <Loading fullscreen message="Redirecting..." />;
  }

  return (
    <main className="min-h-screen flex items-center justify-center bg-linear-to-br from-primary/5 via-secondary/5 to-accent/5 px-4 py-8">
      {/* 🌟 Enhanced Background Effects */}
      <ToastContainer />
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute -top-40 -right-40 w-80 h-80 bg-primary/10 rounded-full blur-3xl"></div>
        <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-secondary/10 rounded-full blur-3xl"></div>
        <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-accent/5 rounded-full blur-3xl"></div>
      </div>

      {/* 🎨 Enhanced Login Card */}
      <section className="card w-full max-w-lg bg-linear-to-br from-base-100 to-base-200 border border-base-300/30 shadow-2xl backdrop-blur-lg rounded-3xl transition-all duration-500 hover:shadow-3xl z-10">
        <div className="card-body p-8 space-y-8">
          {/* 🌟 Enhanced Header */}
          <div className="text-center space-y-4">
            <div className="flex justify-center">
              <div className="p-4 rounded-2xl bg-linear-to-br from-primary to-primary/80 text-primary-content shadow-lg">
                <Shield className="w-8 h-8" />
              </div>
            </div>
            <div className="space-y-2">
              <h1 className="text-3xl font-bold bg-linear-to-r from-base-content to-base-content/70 bg-clip-text text-transparent">
                {t("Welcome Back")}
              </h1>
              <p className="text-base-content/70 text-lg">
                {t("Sign in to your account")}
              </p>
            </div>
          </div>

          {/* 📝 Enhanced Login Form */}
          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Email Field */}
            <div className="form-control">
              <label className="label">
                <span className="label-text font-semibold text-base-content flex items-center gap-2">
                  <Mail className="w-4 h-4 text-primary" />
                  {t("Email Address")}
                </span>
              </label>
              <div className="relative">
                <input
                  id="email"
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="input input-bordered w-full rounded-xl pl-10 focus:ring-2 focus:ring-primary/50 bg-base-200/50 transition-all duration-200"
                  placeholder="admin@example.com"
                  required
                  disabled={isSubmitting || loginLoading}
                />
                <User className="w-4 h-4 text-base-content/40 absolute left-3 top-1/2 transform -translate-y-1/2" />
              </div>
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
                  id="password"
                  type={showPassword ? "text" : "password"}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="input input-bordered w-full rounded-xl pl-10 pr-10 focus:ring-2 focus:ring-primary/50 bg-base-200/50 transition-all duration-200"
                  placeholder={t("Enter your password")}
                  required
                  disabled={isSubmitting || loginLoading}
                />
                <Key className="w-4 h-4 text-base-content/40 absolute left-3 top-1/2 transform -translate-y-1/2" />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 transform -translate-y-1/2 text-base-content/40 hover:text-base-content/70 transition-colors"
                  disabled={isSubmitting || loginLoading}
                >
                  {showPassword ? (
                    <EyeOff className="w-4 h-4" />
                  ) : (
                    <Eye className="w-4 h-4" />
                  )}
                </button>
              </div>
            </div>

            {/* Enhanced Submit Button */}
            <button
              type="submit"
              disabled={isSubmitting || loginLoading}
              className="btn btn-primary btn-lg w-full rounded-xl shadow-lg hover:shadow-xl transition-all duration-300 transform hover:scale-105 font-semibold disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none"
            >
              {isSubmitting || loginLoading ? (
                <span className="flex items-center justify-center gap-3">
                  <Loader2 className="w-5 h-5 animate-spin" />
                  {t("Signing in...")}
                </span>
              ) : (
                <span className="flex items-center justify-center gap-3">
                  <LogIn className="w-5 h-5" />
                  {t("Sign In")}
                </span>
              )}
            </button>
          </form>

          {/* 🔒 Security Features */}
          <div className="space-y-4 pt-4 border-t border-base-300/30">
            {/* Security Tips */}
            <div className="bg-warning/5 rounded-2xl p-4 border border-warning/20">
              <div className="flex items-start gap-3">
                <Sparkles className="w-4 h-4 text-warning mt-0.5 shrink-0" />
                <div>
                  <p className="text-sm font-semibold text-warning mb-1">
                    {t("Security Best Practices")}
                  </p>
                  <p className="text-xs text-base-content/70">
                    {t(
                      "Ensure you're using a secure network and keep your login credentials confidential."
                    )}
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>
    </main>
  );
};

export default LoginPage;