// src/app/(pages)/login/page.jsx
"use client";

import React, { useState, useEffect } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { useAuth } from "../../../context/auth/authContext";
import { useSessionRedirect } from "../../../hooks/useSessionRedirect";
import { useTranslation } from "react-i18next";
import { Shield, Sparkles, UserPlus, AlertCircle } from "lucide-react";
import { toast } from "react-toastify";
import Loading from "../../components/layout/Loading";
import EmailPasswordLogin from "./components/EmailPasswordSection";
import MagicLinkLogin from "./components/MagicLinkSection";
import PasskeyLogin from "./components/PasskeysSection";
import SocialLogin from "./components/SocialLogin";

const LoginPage = () => {
  const tabs = [
    { id: "password", label: "Email & Password" },
    { id: "magic", label: "Magic Link" },
    { id: "passkey", label: "Passkey" },
  ];

  const [activeTab, setActiveTab] = useState("password");
  const [email, setEmail] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isMultiAccount, setIsMultiAccount] = useState(false);

  const { user, authLoading, setUser } = useAuth();
  const router = useRouter();
  const searchParams = useSearchParams();
  const { t } = useTranslation();
  const { getRedirectUrl, clearRedirectUrl } = useSessionRedirect();

  useEffect(() => {
    return () => {
      sessionStorage.removeItem("multiAccountLogin");
    };
  }, []);

  // useEffect(() => {
  //   if (!PublicKeyCredential.isConditionalMediationAvailable ||
  //       !PublicKeyCredential.isConditionalMediationAvailable()) {
  //     return;
  //   }
  //   void authClient.signIn.passkey({ autoFill: true });
  // }, []);

  useEffect(() => {
    const multiAccountFlag = sessionStorage.getItem("multiAccountLogin");
    const isMulti = multiAccountFlag === "true";
    setIsMultiAccount(isMulti);

    if (!authLoading && user && !isMulti) {
      handlePostLoginRedirect();
    }
  }, [user, authLoading]);

  useEffect(() => {
    const error = searchParams.get("error");
    const socialCallback = searchParams.get("social");

    if (socialCallback === "callback" && error) {
      const cleanUrl = window.location.pathname;
      window.history.replaceState(null, "", cleanUrl);

      switch (error) {
        case "signup_disabled":
          toast.error("No account found. Please sign up first.");
          break;
        case "access_denied":
          toast.info("Login cancelled. You can try again anytime.");
          break;
        default:
          toast.error("Login failed. Please try again or use another method.");
      }
    }
  }, [searchParams]);

  const reloading = () => {
    window.location.reload();
  };

  const handlePostLoginRedirect = () => {
    const redirectUrl = getRedirectUrl();

    if (redirectUrl) {
      clearRedirectUrl();
      router.replace(redirectUrl);
    } else {
      let targetRoute = "/dashboard";

      if (user.role === "superadmin" && user.app_role === "superadmin") {
        targetRoute = "/super-admin-dashboard";
      } else if (user.role === "admin") {
        targetRoute = `/dashboard/${user.app_role}`;
      } else if (user.role === "user") {
        targetRoute = `/dashboard/${user.app_role}`;
      }

      router.replace(targetRoute);
    }
  };

  if (authLoading) {
    return <Loading fullscreen message="Loading ....." />;
  }

  if (user && !isMultiAccount) {
    return <Loading fullscreen message="Redirecting..." />;
  }

  return (
    <main className="min-h-screen flex items-center justify-center bg-linear-to-br from-primary/5 via-secondary/5 to-accent/5 px-4 py-8">
      {/* 🌟 Enhanced Background Effects */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute -top-40 -right-40 w-80 h-80 bg-primary/10 rounded-full blur-3xl"></div>
        <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-secondary/10 rounded-full blur-3xl"></div>
        <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-accent/5 rounded-full blur-3xl"></div>
      </div>

      {/* 🎨 Enhanced Login Card */}
      <section className="card w-full max-w-2xl bg-linear-to-br from-base-100 to-base-200 border border-base-300/30 shadow-2xl backdrop-blur-lg rounded-3xl transition-all duration-500 hover:shadow-3xl z-10">
        <div className="card-body p-8 space-y-8">
          {/* 🌟 Enhanced Header */}
          <div className="text-center space-y-4">
            <div className="flex justify-center">
              <div className="p-4 rounded-2xl bg-linear-to-br from-primary to-primary/80 text-primary-content shadow-lg">
                {isMultiAccount ? (
                  <UserPlus className="w-8 h-8" />
                ) : (
                  <Shield className="w-8 h-8" />
                )}
              </div>
            </div>
            <div className="space-y-2">
              <h1 className="text-3xl font-bold bg-linear-to-r from-base-content to-base-content/70 bg-clip-text text-transparent">
                {isMultiAccount ? t("Add Another Account") : t("Welcome Back")}
              </h1>
              <p className="text-base-content/70 text-lg">
                {isMultiAccount
                  ? t("Sign in with a different account")
                  : t("Sign in to your account")}
              </p>
            </div>
          </div>

          {/* Social Login Section */}
          <SocialLogin
            isMultiAccount={isMultiAccount}
            isSubmitting={isSubmitting}
          />

          {/* Divider */}
          <div className="relative">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-base-300/60"></div>
            </div>
            <div className="relative flex justify-center text-sm">
              <span className="px-4 bg-base-100 text-base-content/50 text-sm font-medium">
                Or continue with email
              </span>
            </div>
          </div>

          {/* 🔥 Modern Tabbed Login Interface */}
          <div className="w-full">
            {/* Tabs */}
            <div className="flex mb-6 border-b border-base-300/60">
              {tabs.map((tab) => (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`flex-1 py-3 text-center font-semibold transition-all 
                    ${
                      activeTab === tab.id
                        ? "border-b-2 border-primary text-primary"
                        : "text-base-content/60 hover:text-base-content"
                    }
                  `}
                >
                  {t(tab.label)}
                </button>
              ))}
            </div>

            {/* Tab Content */}
            {activeTab === "password" && (
              <EmailPasswordLogin
                email={email}
                setEmail={setEmail}
                isSubmitting={isSubmitting}
                setIsSubmitting={setIsSubmitting}
                isMultiAccount={isMultiAccount}
              />
            )}

            {activeTab === "magic" && (
              <MagicLinkLogin
                email={email}
                setEmail={setEmail}
                isSubmitting={isSubmitting}
                setIsSubmitting={setIsSubmitting}
              />
            )}

            {activeTab === "passkey" && (
              <PasskeyLogin
                isSubmitting={isSubmitting}
                setIsSubmitting={setIsSubmitting}
                isMultiAccount={isMultiAccount}
                setUser={setUser}
                onSuccess={reloading}
              />
            )}
          </div>

          {/* Enhanced Footer Links */}
          <div className="space-y-4 text-center">
            <div className="flex flex-col justify-center items-center gap-2 text-sm">
              <p className="text-base-content/70">
                {t("Don't have an account?")}
              </p>
              <button
                type="button"
                onClick={() => router.replace("/signup")}
                className="text-primary font-semibold hover:underline cursor-pointer transition-colors duration-200"
              >
                {t("Create account")}
              </button>
            </div>

            <div className="pt-2 border-t border-base-300/30">
              <button
                type="button"
                onClick={() => router.replace("/request-password-reset")}
                className="text-primary font-semibold hover:underline cursor-pointer text-sm transition-colors duration-200"
              >
                {t("Forgot your password?")}
              </button>
            </div>
          </div>

          {/* 🔒 Security Features */}
          <div className="space-y-4 pt-4 border-t border-base-300/30">
            <div className="bg-primary/5 rounded-2xl p-4 border border-primary/20">
              <div className="flex items-start gap-3">
                <Sparkles className="w-4 h-4 text-primary mt-0.5 shrink-0" />
                <div>
                  <p className="text-sm font-semibold text-primary mb-1">
                    {isMultiAccount
                      ? t("Multi-Account Login")
                      : t("Secure Login")}
                  </p>
                  <p className="text-xs text-base-content/70">
                    {isMultiAccount
                      ? t(
                          "You can switch between multiple accounts without logging out."
                        )
                      : t(
                          "Your security is our priority. All data is encrypted and protected."
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
