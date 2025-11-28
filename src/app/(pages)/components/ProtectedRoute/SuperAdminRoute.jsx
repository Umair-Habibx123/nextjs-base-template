// components/ProtectedRoute/SuperAdminRoute.jsx
"use client";

import { useEffect } from "react";
import { notFound } from "next/navigation";
import { useAuth } from "../../../context/auth/authContext";
import Loading from "@/app/(pages)/components/layout/Loading";

export default function SuperAdminRoute({ children }) {
  const { user, authLoading } = useAuth();

  useEffect(() => {
    if (!authLoading && !user) {
      return notFound();
    }
  }, [authLoading, user]);

  if (authLoading || !user) {
    return <Loading fullscreen message="Loading ....." />;
  }

  if (user.role !== "admin" && user.role !== "superadmin") {
    return notFound();
  }

  return children;
}
