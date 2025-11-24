// components/ProtectedRoute/AuthenticatedRoute.jsx
"use client";

import { useEffect } from "react";
import { useRouter, usePathname } from "next/navigation";
import { useAuth } from "../../../context/auth/authContext";
import { useSessionRedirect } from "../../../hooks/useSessionRedirect";
import Loading from "@/app/(pages)/components/layout/Loading";

export default function AuthenticatedRoute({ children }) {
  const { user, authLoading } = useAuth();
  const router = useRouter();
  const pathname = usePathname();
  const { setRedirectUrl } = useSessionRedirect();

  useEffect(() => {
    if (!authLoading && !user) {
      // Store current path for redirect after login
      setRedirectUrl(pathname);
      router.replace("/login");
    }
  }, [authLoading, user, pathname, router, setRedirectUrl]);

  if (authLoading || !user) {
    return <Loading fullscreen message="Loading ....." />;
  }

  return children;
}