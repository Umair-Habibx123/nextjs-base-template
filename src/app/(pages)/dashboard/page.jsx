"use client";

import { useAuth } from "../../context/auth/authContext";
import { useRouter } from "next/navigation";
import { useEffect } from "react";
import Loading from "../components/layout/Loading";

export default function DashboardRedirect() {
  const { user } = useAuth();
  const router = useRouter();

  useEffect(() => {
      if (!user) {
        router.replace("/login");
      } else {
        if (user.role === "superadmin" && user.app_role === "superadmin") {
          router.replace("/super-admin-dashboard");
        } else {
          router.replace(`/dashboard/${user.app_role}`);
        }
      }
  }, [user, router]);

  return <Loading fullscreen message="Redirecting to your dashboard..." />;
}
