// src/context/auth/authContext.jsx
"use client";

import React, { createContext, useContext, useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { authClient } from "@/lib/client";
import Loading from "@/app/(pages)/components/layout/Loading";

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [loginLoading, setLoginLoading] = useState(false);
  const router = useRouter();

  useEffect(() => {
    checkSession();
  }, []);

  const checkSession = async () => {
    try {
      const { data } = await authClient.getSession();
      if (data?.user) setUser(data.user);
    } catch (err) {
      console.error("Session fetch error:", err);
    } finally {
      setLoading(false);
    }
  };

  const login = async (credentials) => {
    setLoginLoading(true);
    try {
      const { data, error } = await authClient.signIn.email(
        credentials
      );

      if (error) {
        let msg = error.message || "Login failed";
        if (msg.includes("User not found")) msg = "No account found";
        if (msg.includes("Invalid password")) msg = "Invalid password";
        if (msg.includes("Email not verified"))
          msg = "Please verify your email";
        throw new Error(msg);
      }

      // ⬇ Fetch updated session immediately
      const session = await authClient.getSession();
      if (session?.data?.user) {
        setUser(session.data.user);
      }

      return session;
    } finally {
      setLoginLoading(false);
    }
  };

  const logout = async () => {
    setLoading(true);
    try {
      await authClient.signOut();
      setUser(null);
      router.replace("/auth/login");
    } finally {
      setLoading(false);
    }
  };

  const value = { user, login, logout, loginLoading, authLoading: loading };

  return (
    <AuthContext.Provider value={value}>
      {loading ? <Loading fullscreen message="Loading ....." /> : children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);
