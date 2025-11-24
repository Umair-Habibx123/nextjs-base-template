// src/app/(pages)/request-password-reset/page.jsx
"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import { authClient } from "@/lib/client";
import { useTranslation } from "react-i18next";
import {
  Mail,
  ArrowLeft,
  Loader2,
  CheckCircle,
  Shield,
  Send,
} from "lucide-react";
import { toast, ToastContainer } from "react-toastify";
import Link from "next/link";

const RequestPasswordResetPage = () => {
  const [email, setEmail] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  const router = useRouter();
  const { t } = useTranslation();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      const redirectTo = `${window.location.origin}/reset-password`;

      const { data, error } = await authClient.requestPasswordReset({
        email: email,
        redirectTo: redirectTo,
      });

      if (error) {
        toast.error(error.message || t("Failed to send reset email"));
        return false;
      }

      setIsSuccess(true);
      toast.success(t(data.message));
    } catch (error) {
      toast.error(error.message || t("Failed to send reset email"));
    } finally {
      setIsSubmitting(false);
    }
  };

  if (isSuccess) {
    return (
      <main className="min-h-screen flex items-center justify-center bg-linear-to-br from-primary/5 via-secondary/5 to-accent/5 px-4 py-8">
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
                {t("Check Your Email")}
              </h1>
              <p className="text-base-content/70">
                {t("We've sent a password reset link to")}
              </p>
              <p className="font-semibold text-primary">{email}</p>
              <p className="text-sm text-base-content/60">
                {t("Click the link in the email to reset your password.")}
              </p>
            </div>

            <div className="space-y-4 pt-4">
              <button
                onClick={() => router.push("/login")}
                className="btn btn-primary w-full rounded-xl"
              >
                {t("Back to Login")}
              </button>

              <div className="text-sm text-base-content/60">
                {t("Didn't receive the email?")}{" "}
                <button
                  onClick={() => setIsSuccess(false)}
                  className="text-primary font-semibold hover:underline cursor-pointer"
                >
                  {t("Try again")}
                </button>
              </div>
            </div>
          </div>
        </section>
      </main>
    );
  }

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
                <Shield className="w-8 h-8" />
              </div>
            </div>
            <div className="space-y-2">
              <h1 className="text-2xl font-bold text-base-content">
                {t("Reset Your Password")}
              </h1>
              <p className="text-base-content/70">
                {t("Enter your email to receive a reset link")}
              </p>
            </div>
          </div>

          {/* Back to Login */}
          <Link
            href="/login"
            className="btn btn-ghost btn-sm -mt-2 self-start text-base-content/70 hover:text-base-content"
          >
            <ArrowLeft className="w-4 h-4" />
            {t("Back to Login")}
          </Link>

          {/* Reset Form */}
          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="form-control">
              <label className="label">
                <span className="label-text font-semibold text-base-content flex items-center gap-2">
                  <Mail className="w-4 h-4 text-primary" />
                  {t("Email Address")}
                </span>
              </label>
              <div className="relative">
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="input input-bordered w-full rounded-xl pl-10 focus:ring-2 focus:ring-primary/50 bg-base-200/50"
                  placeholder="your@email.com"
                  required
                  disabled={isSubmitting}
                />
                <Mail className="w-4 h-4 text-base-content/40 absolute left-3 top-1/2 transform -translate-y-1/2" />
              </div>
            </div>

            <button
              type="submit"
              disabled={isSubmitting}
              className="btn btn-primary w-full rounded-xl shadow-lg hover:shadow-xl transition-all duration-300 font-semibold disabled:opacity-50"
            >
              {isSubmitting ? (
                <span className="flex items-center justify-center gap-3">
                  <Loader2 className="w-5 h-5 animate-spin" />
                  {t("Sending...")}
                </span>
              ) : (
                <span className="flex items-center justify-center gap-3">
                  <Send className="w-5 h-5" />
                  {t("Send Reset Link")}
                </span>
              )}
            </button>
          </form>

          {/* Security Note */}

          <div className="bg-info/5 rounded-2xl p-4 border border-info/20">
            <div className="flex items-start gap-3">
              <Shield className="w-4 h-4 text-info mt-0.5 shrink-0" />
              <div>
                <p className="text-sm font-semibold text-info mb-1">
                  {t("Security Note")}
                </p>
                <p className="text-xs text-base-content/70">
                  {t(
                    "The reset link will expire in 1 hour for security reasons."
                  )}
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>
    </main>
  );
};

export default RequestPasswordResetPage;
