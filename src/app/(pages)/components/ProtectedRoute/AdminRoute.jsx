// components/ProtectedRoute/AdminRoute.jsx
"use client";

import { useEffect } from "react";
import { useRouter, notFound, usePathname } from "next/navigation";
import { useAuth } from "../../../context/auth/authContext";
import { useSessionRedirect } from "../../../hooks/useSessionRedirect";
import Loading from "@/app/(pages)/components/layout/Loading";

export default function AdminRoute({ children }) {
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


 if (user.role !== "admin" && user.role !== "superadmin") {
  return notFound();
}


  return children;
}
