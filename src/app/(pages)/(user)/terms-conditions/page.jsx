"use client";

import React from "react";
import { useTranslation } from "react-i18next";
import { FileText, Scale, BookOpen, AlertTriangle } from "lucide-react";

const TermsPage = () => {
  const { t } = useTranslation();

  const termsSections = [
    {
      icon: <BookOpen className="w-6 h-6" />,
      title: t("Acceptance of Terms"),
      content: t("By accessing and using our services, you agree to be bound by these terms and conditions. If you disagree with any part, you may not access our services.")
    },
    {
      icon: <Scale className="w-6 h-6" />,
      title: t("User Responsibilities"),
      content: t("You are responsible for maintaining the confidentiality of your account and password. You agree to accept responsibility for all activities that occur under your account.")
    },
    {
      icon: <FileText className="w-6 h-6" />,
      title: t("Intellectual Property"),
      content: t("All content included on this site, such as text, graphics, logos, and software, is the property of our company and protected by intellectual property laws.")
    },
    {
      icon: <AlertTriangle className="w-6 h-6" />,
      title: t("Limitation of Liability"),
      content: t("We shall not be held liable for any indirect, incidental, special, consequential or punitive damages resulting from your use or inability to use the service.")
    }
  ];

  return (
    <main className="min-h-screen bg-linear-to-br from-base-100 to-base-200 py-16">
      <div className="container mx-auto px-6 max-w-4xl">
        {/* Header */}
        <div className="text-center mb-12">
          <div className="flex justify-center mb-4">
            <div className="p-3 rounded-2xl bg-linear-to-br from-primary to-primary/80 text-primary-content shadow-lg">
              <Scale className="w-8 h-8" />
            </div>
          </div>
          <h1 className="text-4xl font-bold bg-linear-to-r from-base-content to-base-content/70 bg-clip-text text-transparent mb-4">
            {t("Terms & Conditions")}
          </h1>
          <p className="text-base-content/70 text-lg leading-relaxed">
            {t("These terms govern your use of our website and services. Please read them carefully before using our platform. By using our services, you agree to these terms.")}
          </p>
        </div>

        {/* Last Updated */}
        <div className="bg-warning/10 rounded-2xl border border-warning/20 p-6 mb-8">
          <div className="flex items-center gap-3">
            <AlertTriangle className="w-5 h-5 text-warning" />
            <div>
              <h3 className="font-semibold text-warning mb-1">{t("Last Updated")}</h3>
              <p className="text-base-content/70 text-sm">
                {t("These terms were last updated on")} {new Date().toLocaleDateString()}. {t("We may update these terms periodically.")}
              </p>
            </div>
          </div>
        </div>

        {/* Terms Sections */}
        <div className="space-y-6">
          {termsSections.map((section, index) => (
            <div key={index} className="flex gap-6 p-6 bg-base-100 rounded-2xl border border-base-300/30 shadow-lg hover:shadow-xl transition-all duration-300">
              <div className="p-3 rounded-xl bg-primary/10 text-primary shrink-0">
                {section.icon}
              </div>
              <div className="flex-1">
                <h2 className="text-2xl font-bold text-base-content mb-3">{section.title}</h2>
                <p className="text-base-content/70 leading-relaxed">{section.content}</p>
              </div>
            </div>
          ))}
        </div>

        {/* Contact Section */}
        <div className="bg-primary/5 rounded-2xl border border-primary/20 p-8 text-center mt-8">
          <h3 className="text-2xl font-bold text-base-content mb-3">
            {t("Questions?")}
          </h3>
          <p className="text-base-content/70 mb-4">
            {t("If you have any questions about these terms, please contact us through our support channels.")}
          </p>
        </div>
      </div>
    </main>
  );
};

export default TermsPage;