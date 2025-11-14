// "use client";

// import { useEffect } from "react";
// import { useRouter, notFound } from "next/navigation";
// import { useAuth } from "../../context/auth/authContext";
// import Loading from "@/app/(pages)/components/layout/Loading";

// export default function ProtectedRoute({ children }) {
//   const { user, authLoading } = useAuth();
//   const router = useRouter();

//   const USE_404_FOR_NON_ADMIN = true;

//   useEffect(() => {
//     if (!authLoading && !user) {
//       const returnTo = encodeURIComponent(window.location.pathname);
//       router.replace(`/auth/login?callbackUrl=${returnTo}`);
//     }
//   }, [user, authLoading, router]);

//   useEffect(() => {
//     if (
//       !authLoading &&
//       user &&
//       user.role !== "admin" &&
//       !USE_404_FOR_NON_ADMIN
//     ) {
//       router.replace("/");
//     }
//   }, [user, authLoading, router, USE_404_FOR_NON_ADMIN]);

//   if (authLoading || !user) {
//     return <Loading fullscreen message="Authenticating..." />;
//   }

//   if (user.role !== "admin" && USE_404_FOR_NON_ADMIN) {
//     return notFound();
//   }

//   if (user.role !== "admin" && !USE_404_FOR_NON_ADMIN) {
//     return null;
//   }

//   return children;
// }
