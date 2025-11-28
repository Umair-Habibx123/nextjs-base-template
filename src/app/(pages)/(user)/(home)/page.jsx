"use client";

import React, { useState } from "react";
import Link from "next/link";
import { useAuth } from "../../../context/auth/authContext";
import { useTranslation } from "react-i18next";
import {
  Smile,
  Info,
  X,
  Sparkles,
  Rocket,
  Shield,
  Users,
  Zap,
  ArrowRight,
  Star,
  CheckCircle,
} from "lucide-react";
import Loading from "../../components/layout/Loading";

const HomePage = () => {
  const { user, isLoading } = useAuth();
  const { t } = useTranslation();
  const [showModal, setShowModal] = useState(false);

  const handleModalOpen = () => setShowModal(true);
  const handleModalClose = () => setShowModal(false);

  const getDashboardLink = () => {
    if (!user) return null;

    if (user.role === "superadmin" && user.app_role === "superadmin") {
      return "/super-admin-dashboard";
    } else {
      return `/dashboard/${user.app_role}`;
    }
  };

  const dashboardLink = getDashboardLink();

  if (isLoading) {
    return <Loading fullscreen message="Loading..." />;
  }

  const features = [
    {
      icon: <Shield className="w-6 h-6" />,
      title: t("Secure & Reliable"),
      description: t("Enterprise-grade security for your data"),
    },
    {
      icon: <Zap className="w-6 h-6" />,
      title: t("Lightning Fast"),
      description: t("Optimized for performance and speed"),
    },
    {
      icon: <Users className="w-6 h-6" />,
      title: t("User Friendly"),
      description: t("Intuitive interface for all users"),
    },
  ];

  return (
    <main className="min-h-screen flex flex-col items-center justify-center bg-linear-to-br from-primary/5 via-secondary/5 to-accent/5 px-6 py-12">
      {/* 🌟 Background Effects */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute -top-20 -right-20 w-60 h-60 bg-primary/10 rounded-full blur-3xl"></div>
        <div className="absolute -bottom-20 -left-20 w-60 h-60 bg-secondary/10 rounded-full blur-3xl"></div>
        <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-80 h-80 bg-accent/5 rounded-full blur-3xl"></div>
      </div>

      {/* 🎨 Hero Section */}
      <section className="card w-full max-w-4xl bg-linear-to-br from-base-100 to-base-200 border border-base-300/30 shadow-2xl backdrop-blur-lg rounded-3xl transition-all duration-500 hover:shadow-3xl z-10">
        <div className="card-body p-12 text-center space-y-8">
          {/* Header */}
          <div className="space-y-4">
            <div className="flex justify-center">
              <div className="p-4 rounded-2xl bg-linear-to-br from-primary to-primary/80 text-primary-content shadow-lg">
                <Rocket className="w-8 h-8" />
              </div>
            </div>

            <div className="space-y-3">
              <h1 className="text-4xl md:text-5xl font-bold bg-linear-to-r from-base-content to-base-content/70 bg-clip-text text-transparent">
                {user
                  ? `${t("Welcome back,")} ${user.email}!`
                  : t("Welcome to Our Platform")}
              </h1>
              <p className="text-base-content/70 text-lg max-w-2xl mx-auto leading-relaxed">
                {user
                  ? t(
                      "You're successfully logged in and ready to manage your dashboard."
                    )
                  : t(
                      "Start your seamless experience with our modern, feature-rich platform."
                    )}
              </p>
            </div>
          </div>

          {/* 🌟 Features Grid */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 py-6">
            {features.map((feature, index) => (
              <div
                key={index}
                className="flex flex-col items-center text-center p-6 bg-base-200/50 rounded-2xl border border-base-300/20 hover:border-primary/30 transition-all duration-300 hover:scale-105 group"
              >
                <div className="p-3 rounded-xl bg-primary/10 text-primary group-hover:bg-primary/20 transition-colors mb-4">
                  {feature.icon}
                </div>
                <h3 className="font-semibold text-base-content text-lg mb-2">
                  {feature.title}
                </h3>
                <p className="text-base-content/60 text-sm leading-relaxed">
                  {feature.description}
                </p>
              </div>
            ))}
          </div>

          {/* 🚀 Action Buttons */}
          <div className="space-y-4 pt-4">
            {user ? (
              <Link
                href={dashboardLink}
                className="btn btn-primary btn-lg rounded-xl shadow-lg hover:shadow-xl transition-all duration-300 transform hover:scale-105 font-semibold w-full max-w-xs mx-auto flex items-center justify-center gap-3"
              >
                <Sparkles className="w-5 h-5" />
                {t("Go to Dashboard")}
                <ArrowRight className="w-4 h-4" />
              </Link>
            ) : (
              <Link
                href="/login"
                className="btn btn-primary btn-lg rounded-xl shadow-lg hover:shadow-xl transition-all duration-300 transform hover:scale-105 font-semibold w-full max-w-xs mx-auto flex items-center justify-center gap-3"
              >
                <Rocket className="w-5 h-5" />
                {t("Get Started")}
                <ArrowRight className="w-4 h-4" />
              </Link>
            )}

            <button
              onClick={handleModalOpen}
              className="btn btn-outline btn-lg rounded-xl hover:bg-base-200/70 transition-all duration-300 transform hover:scale-105 w-full max-w-xs mx-auto flex items-center justify-center gap-3"
            >
              <Info className="w-5 h-5" />
              {t("Learn More")}
            </button>
          </div>
        </div>
      </section>

      {/* 🎯 Enhanced Modal */}
      {showModal && (
        <dialog open className="modal modal-open">
          <div className="modal-box rounded-3xl bg-linear-to-br from-base-100 to-base-200 border border-base-300/30 shadow-2xl backdrop-blur-lg max-w-2xl transition-all duration-300">
            {/* Header */}
            <div className="flex items-center gap-4 mb-6">
              <div className="p-3 rounded-2xl bg-info/10 text-info">
                <Info className="w-6 h-6" />
              </div>
              <div className="flex-1">
                <h3 className="text-2xl font-bold text-base-content">
                  {t("About This Platform")}
                </h3>
                <p className="text-base-content/60 text-sm">
                  {t("Modern, feature-rich admin dashboard")}
                </p>
              </div>
              <button
                className="btn btn-ghost btn-circle hover:bg-base-200/70 transition-all duration-200 hover:scale-110"
                onClick={handleModalClose}
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Content */}
            <div className="space-y-6">
              <div className="bg-base-200/50 rounded-2xl p-6 border border-base-300/20">
                <h4 className="font-semibold text-base-content text-lg mb-3 flex items-center gap-2">
                  <Star className="w-5 h-5 text-warning" />
                  {t("Platform Features")}
                </h4>
                <ul className="space-y-3 text-base-content/80">
                  <li className="flex items-center gap-3">
                    <CheckCircle className="w-5 h-5 text-success shrink-0" />
                    <span>{t("Modern React.js with Next.js 14")}</span>
                  </li>
                  <li className="flex items-center gap-3">
                    <CheckCircle className="w-5 h-5 text-success shrink-0" />
                    <span>{t("Tailwind CSS & DaisyUI Components")}</span>
                  </li>
                  <li className="flex items-center gap-3">
                    <CheckCircle className="w-5 h-5 text-success shrink-0" />
                    <span>{t("Real-time Analytics & Monitoring")}</span>
                  </li>
                  <li className="flex items-center gap-3">
                    <CheckCircle className="w-5 h-5 text-success shrink-0" />
                    <span>{t("Multi-language Support")}</span>
                  </li>
                  <li className="flex items-center gap-3">
                    <CheckCircle className="w-5 h-5 text-success shrink-0" />
                    <span>{t("Theme Customization")}</span>
                  </li>
                </ul>
              </div>

              <div className="flex items-center gap-4 p-4 bg-primary/5 rounded-2xl border border-primary/20">
                <Sparkles className="w-6 h-6 text-primary shrink-0" />
                <p className="text-sm text-base-content/70">
                  {t(
                    "This platform is built with modern technologies to provide the best user experience."
                  )}
                </p>
              </div>
            </div>

            {/* Actions */}
            <div className="modal-action pt-6">
              <button
                onClick={handleModalClose}
                className="btn btn-primary btn-lg rounded-xl flex-1 shadow-lg hover:shadow-xl transition-all duration-300 transform hover:scale-105"
              >
                {t("Got it!")}
              </button>
            </div>
          </div>

          <form
            method="dialog"
            className="modal-backdrop bg-base-content/50 backdrop-blur-sm transition-all"
          >
            <button onClick={handleModalClose}>close</button>
          </form>
        </dialog>
      )}
    </main>
  );
};

export default HomePage;
