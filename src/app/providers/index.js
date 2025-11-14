"use client";
import { AuthProvider } from "../context/auth/authContext";
import { ThemeProvider } from "../context/theme/themeContext";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { useState, useEffect } from "react";
import AnalyticsPing from "../context/analytics/analyticsPing";
import { ToastContainer } from "react-toastify";
import CustomCursor from "../(pages)/components/common/CustomCursor";
import ModalProvider from "../context/ModalContext";
import "react-toastify/dist/ReactToastify.css";

export default function Providers({ children }) {
  const [queryClient] = useState(() => new QueryClient());

  return (
    <QueryClientProvider client={queryClient}>
      <AuthProvider>
        <ThemeProvider>
          <ModalProvider>
            <ToastContainer />
            {children}
            {/* <CustomCursor /> */}
            <AnalyticsPing />
          </ModalProvider>
        </ThemeProvider>
      </AuthProvider>
    </QueryClientProvider>
  );
}
