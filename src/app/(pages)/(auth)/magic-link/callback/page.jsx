// src/app/(pages)/auth-callback/page.jsx
"use client";

import { useEffect } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { useSessionRedirect } from "@/app/hooks/useSessionRedirect";
import { useAuth } from "@/app/context/auth/authContext";
import { toast } from "react-toastify";
import Loading from "@/app/(pages)/components/layout/Loading";

export default function AuthCallbackPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { user, authLoading } = useAuth();
  const { getRedirectUrl, clearRedirectUrl } = useSessionRedirect();

  useEffect(() => {
    if (authLoading) return;

    const error = searchParams.get("error");
    const success = searchParams.get("success");

    if (error) {
      switch (error) {
        case "signup_disabled":
          toast.error("No account found. Please sign up first.");
          break;
        case "access_denied":
          toast.info("Login cancelled. You can try again anytime.");
          break;
        case "INVALID_TOKEN":
          toast.error("Invalid magic link. Please try again.");
          break;
        case "expired_magic_link":
          toast.error("Magic link has expired. Please request a new one.");
          break;
        default:
          toast.error("Login failed. Please try again or use another method.");
      }

      router.replace("/");
      return;
    }

    if (success || user) {
      if (success === "true") {
        toast.success("Successfully logged in!");
      }

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
      return;
    }

    if (!user) {
      router.replace("/login");
    }
  }, [
    authLoading,
    user,
    router,
    searchParams,
    getRedirectUrl,
    clearRedirectUrl,
  ]);

  if (authLoading) {
    return <Loading fullscreen message="Completing login..." />;
  }

  return <Loading fullscreen message="Completing login..." />;
}
