"use client";
import React from "react";
import {
  User,
  Mail,
  Calendar,
  Shield,
  CheckCircle,
  XCircle,
} from "lucide-react";
import { useTranslation } from "react-i18next";
import { useAuth } from "../../../../context/auth/authContext";
import Loading from "../../../components/layout/Loading";

const OverviewPage = () => {
  const { user } = useAuth();
  const { t } = useTranslation();

  if (!user) {
    return <Loading message="Loading your dashboard..." />;
  }

  const capitalize = (str) => str.charAt(0).toUpperCase() + str.slice(1);

  const userInfo = [
    {
      label: t("Full Name"),
      value: user.name,
      icon: <User className="w-5 h-5" />,
      color: "primary",
    },
    {
      label: t("Email Address"),
      value: user.email,
      icon: <Mail className="w-5 h-5" />,
      color: "secondary",
    },
    {
      label: t("Account Created"),
      value: new Date(user.createdAt).toLocaleDateString(),
      icon: <Calendar className="w-5 h-5" />,
      color: "accent",
    },
    {
      label: t("Role"),
      value: capitalize(user.app_role),
      icon: <Shield className="w-5 h-5" />,
      color: "info",
    },
  ];

  return (
    <section className="max-w-full space-y-8 animate-fade-in">
      {/* 🌟 Welcome Header */}
      <div className="flex items-center gap-4 p-6 bg-linear-to-r from-primary/5 via-secondary/5 to-accent/5 rounded-3xl border border-base-300/20 backdrop-blur-lg">
        <div className="p-3 rounded-2xl bg-linear-to-br from-primary to-primary/80 text-primary-content shadow-lg">
          <User className="w-7 h-7" />
        </div>
        <div className="flex-1">
          <h1 className="text-3xl font-bold bg-linear-to-r from-base-content to-base-content/70 bg-clip-text text-transparent">
            {t("Welcome back")}, {user.name}!
          </h1>
          <p className="text-base-content/70 mt-2 text-lg leading-relaxed">
            {t(
              "Here's your personalized dashboard overview and account information."
            )}
          </p>
        </div>
        <div className="flex flex-col items-end gap-2">
          <p className="text-sm text-base-content/60">
            {t(`${capitalize(user.app_role)} Dashboard`)}
          </p>
        </div>
      </div>

      {/* 📊 User Information */}
      <div className="grid grid-cols-1 gap-6">
        {/* Personal Information */}
        <div className="bg-linear-to-br from-base-100 to-base-200 border border-base-300/30 rounded-2xl shadow-2xl backdrop-blur-lg p-6 transition-all duration-500">
          <div className="flex items-center gap-3 mb-6">
            <div className="p-2 rounded-xl bg-primary/10 text-primary">
              <User className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-xl font-bold text-base-content">
                {t("Personal Information")}
              </h2>
              <p className="text-base-content/60 text-sm">
                {t("Your account details and profile information")}
              </p>
            </div>
          </div>

          <div className="space-y-4">
            {userInfo.map((info, idx) => (
              <div
                key={idx}
                className="flex items-center justify-between p-4 bg-base-200/50 rounded-xl border border-base-300/20 hover:bg-base-200/70 transition-colors"
              >
                <div className="flex items-center gap-3">
                  <div
                    className={`p-2 rounded-lg bg-${info.color}/10 text-${info.color}`}
                  >
                    {info.icon}
                  </div>
                  <div>
                    <p className="font-semibold text-base-content">
                      {info.label}
                    </p>
                  </div>
                </div>
                <span className="font-medium text-base-content/80">
                  {info.value}
                </span>
              </div>
            ))}

            {/* Account Status */}
            <div className="p-4 bg-base-200/50 rounded-xl border border-base-300/20">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div
                    className={`p-2 rounded-lg ${
                      user.emailVerified
                        ? "bg-success/10 text-success"
                        : "bg-error/10 text-error"
                    }`}
                  >
                    {user.emailVerified ? (
                      <CheckCircle className="w-5 h-5" />
                    ) : (
                      <XCircle className="w-5 h-5" />
                    )}
                  </div>
                  <div>
                    <p className="font-semibold text-base-content">
                      {t("Email Verification")}
                    </p>
                    <p className="text-sm text-base-content/60">
                      {user.emailVerified
                        ? t("Verified")
                        : t("Pending verification")}
                    </p>
                  </div>
                </div>
                <span
                  className={`badge badge-lg ${
                    user.emailVerified ? "badge-success" : "badge-error"
                  }`}
                >
                  {user.emailVerified ? t("Verified") : t("Pending")}
                </span>
              </div>
            </div>

            {/* Account Status */}
            <div className="p-4 bg-base-200/50 rounded-xl border border-base-300/20">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div
                    className={`p-2 rounded-lg ${
                      user.banned
                        ? "bg-error/10 text-error"
                        : "bg-success/10 text-success"
                    }`}
                  >
                    {user.banned ? (
                      <XCircle className="w-5 h-5" />
                    ) : (
                      <CheckCircle className="w-5 h-5" />
                    )}
                  </div>
                  <div>
                    <p className="font-semibold text-base-content">
                      {t("Account Status")}
                    </p>
                    <p className="text-sm text-base-content/60">
                      {user.banned
                        ? t("Account suspended")
                        : t("Active and in good standing")}
                    </p>
                  </div>
                </div>
                <span
                  className={`badge badge-lg ${
                    user.banned ? "badge-error" : "badge-success"
                  }`}
                >
                  {user.banned ? t("Banned") : t("Active")}
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default OverviewPage;
