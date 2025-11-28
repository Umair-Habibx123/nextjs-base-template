"use client";

import React, { useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { Shield, Smartphone, Mail, Key } from "lucide-react";
import { useTranslation } from "react-i18next";

import MethodTabs from "./MethodTabs";
import TotpVerification from "./TotpVerification";
import EmailOtpVerification from "./EmailOtpVerification";
import BackupCodeVerification from "./BackupCodeVerification";

const Verify2FAContent = () => {
  const { t } = useTranslation();
  const searchParams = useSearchParams();
  const router = useRouter();

  const email = searchParams.get("email") || "";
  const callbackURL = searchParams.get("callbackURL") || "/dashboard";

  const [activeTab, setActiveTab] = useState("totp");

  const tabs = [
    { id: "totp", label: "Authenticator", icon: Smartphone },
    { id: "otp", label: "Email Code", icon: Mail },
    { id: "backup", label: "Backup Code", icon: Key },
  ];

  return (
    <main className="min-h-screen flex items-center justify-center bg-linear-to-br from-primary/5 via-secondary/5 to-accent/5 px-4 py-8 relative">
      {/* Floating Background Effects */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute -top-40 -right-40 w-80 h-80 bg-primary/10 rounded-full blur-3xl"></div>
        <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-secondary/10 rounded-full blur-3xl"></div>
      </div>

      {/* Card */}
      <section className="card w-full max-w-xl bg-linear-to-br from-base-100 to-base-200 border border-base-300/30 shadow-2xl backdrop-blur-lg rounded-3xl p-8 z-10">
        {/* HEADER */}
        <div className="text-center space-y-3 mb-8">
          <div className="flex justify-center">
            <div className="p-4 rounded-2xl bg-linear-to-br from-warning to-warning/80 text-warning-content shadow-lg">
              <Shield className="w-8 h-8" />
            </div>
          </div>

          <h1 className="text-3xl font-bold bg-linear-to-r from-base-content to-base-content/60 bg-clip-text text-transparent">
            {t("Two-Factor Authentication")}
          </h1>

          <p className="text-base-content/70">
            {t("Secure your login with a verification method")}
          </p>

          {email && <p className="text-primary font-semibold">{email}</p>}
        </div>

        {/* Tabs */}
        <MethodTabs
          tabs={tabs}
          activeTab={activeTab}
          setActiveTab={setActiveTab}
        />

        {/* Content */}
        <div className="pt-6">
          {activeTab === "totp" && (
            <TotpVerification callbackURL={callbackURL} />
          )}

          {activeTab === "otp" && (
            <EmailOtpVerification callbackURL={callbackURL} email={email} />
          )}

          {activeTab === "backup" && (
            <BackupCodeVerification callbackURL={callbackURL} />
          )}
        </div>

        {/* Help */}
        <div className="text-center pt-6">
          <p className="text-base-content/60 text-sm">{t("Need help?")}</p>
          <button
            onClick={() => router.push("/help/2fa")}
            className="text-primary font-semibold hover:underline text-sm"
          >
            {t("Get help")}
          </button>
        </div>
      </section>
    </main>
  );
};

export default Verify2FAContent;
