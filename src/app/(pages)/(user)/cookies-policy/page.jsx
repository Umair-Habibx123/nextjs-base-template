"use client";

import React from "react";
import { useTranslation } from "react-i18next";
import { Shield, Cookie, CheckCircle, Info, Settings } from "lucide-react";

const CookiesPage = () => {
  const { t } = useTranslation();

  const cookieTypes = [
    {
      icon: <Shield className="w-6 h-6" />,
      title: t("Essential Cookies"),
      description: t("Required for the website to function properly. These cannot be disabled as they are necessary for basic functionality."),
      required: true
    },
    {
      icon: <Settings className="w-6 h-6" />,
      title: t("Preference Cookies"),
      description: t("Remember your settings and preferences to enhance your experience on our website."),
      required: false
    },
    {
      icon: <Info className="w-6 h-6" />,
      title: t("Analytics Cookies"),
      description: t("Help us understand how visitors interact with our website, allowing us to improve the user experience."),
      required: false
    },
    {
      icon: <Cookie className="w-6 h-6" />,
      title: t("Marketing Cookies"),
      description: t("Used to deliver relevant advertisements and track campaign performance across different platforms."),
      required: false
    }
  ];

  return (
    <main className="min-h-screen bg-linear-to-br from-base-100 to-base-200 py-16">
      <div className="container mx-auto px-6 max-w-4xl">
        {/* Header */}
        <div className="text-center mb-12">
          <div className="flex justify-center mb-4">
            <div className="p-3 rounded-2xl bg-linear-to-br from-primary to-primary/80 text-primary-content shadow-lg">
              <Cookie className="w-8 h-8" />
            </div>
          </div>
          <h1 className="text-4xl font-bold bg-linear-to-r from-base-content to-base-content/70 bg-clip-text text-transparent mb-4">
            {t("Cookies Policy")}
          </h1>
          <p className="text-base-content/70 text-lg leading-relaxed">
            {t("We respect your privacy and are committed to being transparent about how we use cookies. This policy explains what cookies are, how we use them, and how you can manage your preferences.")}
          </p>
        </div>

        {/* Main Content */}
        <div className="bg-base-100 rounded-2xl border border-base-300/30 shadow-lg p-8 mb-8">
          <h2 className="text-2xl font-bold text-base-content mb-6 flex items-center gap-3">
            <Shield className="w-6 h-6 text-primary" />
            {t("Understanding Cookies")}
          </h2>
          <div className="prose prose-lg max-w-none text-base-content/70 space-y-4">
            <p>
              {t("Cookies are small text files that are stored on your device when you visit our website. They help us provide you with a better experience by remembering your preferences and understanding how you use our site.")}
            </p>
            <p>
              {t("We use different types of cookies for various purposes, from essential functionality to analytics and marketing. You can control which cookies you accept through our cookie consent banner.")}
            </p>
          </div>
        </div>

        {/* Cookie Types */}
        <div className="space-y-6 mb-8">
          <h2 className="text-2xl font-bold text-base-content mb-6 text-center">
            {t("Types of Cookies We Use")}
          </h2>
          {cookieTypes.map((cookie, index) => (
            <div key={index} className="flex gap-6 p-6 bg-base-100 rounded-2xl border border-base-300/30 shadow-lg hover:shadow-xl transition-all duration-300">
              <div className="p-3 rounded-xl bg-primary/10 text-primary shrink-0">
                {cookie.icon}
              </div>
              <div className="flex-1">
                <div className="flex items-center gap-3 mb-2">
                  <h3 className="text-xl font-bold text-base-content">{cookie.title}</h3>
                  {cookie.required && (
                    <span className="badge badge-primary badge-sm text-primary-content">
                      {t("Required")}
                    </span>
                  )}
                </div>
                <p className="text-base-content/70 leading-relaxed">{cookie.description}</p>
              </div>
            </div>
          ))}
        </div>

        {/* Management Section */}
        <div className="bg-primary/5 rounded-2xl border border-primary/20 p-8 text-center">
          <CheckCircle className="w-12 h-12 text-primary mx-auto mb-4" />
          <h3 className="text-2xl font-bold text-base-content mb-3">
            {t("Manage Your Preferences")}
          </h3>
          <p className="text-base-content/70 mb-4">
            {t("You can update your cookie preferences at any time by clicking the cookie settings in the footer of our website.")}
          </p>
        </div>
      </div>
    </main>
  );
};

export default CookiesPage;