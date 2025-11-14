"use client";

import React from "react";
import { useTranslation } from "react-i18next";
import { Shield, Lock, Eye, Database, UserCheck } from "lucide-react";

const PrivacyPage = () => {
  const { t } = useTranslation();

  const privacyPrinciples = [
    {
      icon: <Eye className="w-6 h-6" />,
      title: t("Transparency"),
      description: t("We clearly communicate how we collect, use, and protect your personal information.")
    },
    {
      icon: <Lock className="w-6 h-6" />,
      title: t("Security"),
      description: t("Your data is protected with industry-standard security measures and encryption.")
    },
    {
      icon: <UserCheck className="w-6 h-6" />,
      title: t("Control"),
      description: t("You have full control over your personal data and can manage your preferences at any time.")
    },
    {
      icon: <Database className="w-6 h-6" />,
      title: t("Minimal Data"),
      description: t("We only collect data that is necessary to provide and improve our services.")
    }
  ];

  return (
    <main className="min-h-screen bg-linear-to-br from-base-100 to-base-200 py-16">
      <div className="container mx-auto px-6 max-w-4xl">
        {/* Header */}
        <div className="text-center mb-12">
          <div className="flex justify-center mb-4">
            <div className="p-3 rounded-2xl bg-linear-to-br from-primary to-primary/80 text-primary-content shadow-lg">
              <Shield className="w-8 h-8" />
            </div>
          </div>
          <h1 className="text-4xl font-bold bg-linear-to-r from-base-content to-base-content/70 bg-clip-text text-transparent mb-4">
            {t("Privacy Policy")}
          </h1>
          <p className="text-base-content/70 text-lg leading-relaxed">
            {t("We respect your privacy and are committed to protecting your personal data. This policy explains how we collect, use, and safeguard your information when you use our services.")}
          </p>
        </div>

        {/* Privacy Principles */}
        <div className="grid md:grid-cols-2 gap-6 mb-12">
          {privacyPrinciples.map((principle, index) => (
            <div key={index} className="flex gap-4 p-6 bg-base-100 rounded-2xl border border-base-300/30 shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-105">
              <div className="p-3 rounded-xl bg-primary/10 text-primary shrink-0">
                {principle.icon}
              </div>
              <div>
                <h3 className="text-xl font-bold text-base-content mb-2">{principle.title}</h3>
                <p className="text-base-content/70 leading-relaxed">{principle.description}</p>
              </div>
            </div>
          ))}
        </div>

        {/* Policy Details */}
        <div className="bg-base-100 rounded-2xl border border-base-300/30 shadow-lg p-8 space-y-6">
          <h2 className="text-2xl font-bold text-base-content mb-4">
            {t("Information We Collect")}
          </h2>
          
          <div className="space-y-4 text-base-content/70">
            <p>
              {t("We collect information that you provide directly to us, such as when you create an account, contact us, or use our services. This may include:")}
            </p>
            <ul className="list-disc list-inside space-y-2 ml-4">
              <li>{t("Personal identification information (name, email address)")}</li>
              <li>{t("Account credentials and preferences")}</li>
              <li>{t("Communication history and support requests")}</li>
              <li>{t("Technical data and usage statistics")}</li>
            </ul>
          </div>

          <div className="pt-6 border-t border-base-300/30">
            <h3 className="text-xl font-bold text-base-content mb-3">
              {t("Your Rights")}
            </h3>
            <p className="text-base-content/70">
              {t("You have the right to access, correct, or delete your personal data. You can also object to or restrict certain processing activities. Contact us to exercise these rights.")}
            </p>
          </div>
        </div>
      </div>
    </main>
  );
};

export default PrivacyPage;