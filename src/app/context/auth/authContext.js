"use client";

import React, { createContext, useContext, useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { authClient } from "@/lib/client";
import Loading from "@/app/(pages)/components/layout/Loading";
import { toast } from "react-toastify";
import { encrypt } from "@/utils/crypto";

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [loginLoading, setLoginLoading] = useState(false);
  const [socialLoading, setSocialLoading] = useState(false);
  const router = useRouter();

  const MAX_SESSIONS = 4;

  // 🔒 Reusable check for max sessions
  const ensureSessionLimit = async () => {
    const sessions = await listSessions();

    if (sessions.length >= MAX_SESSIONS) {
      toast.error(
        `You have reached the maximum limit of ${MAX_SESSIONS} accounts on this device.`
      );
      return false;
    }

    return true;
  };

  const checkSession = async (options = { redirectOnFail: false }) => {
    try {
      const { data } = await authClient.getSession();

      if (data?.user) {
        setUser(data.user);
        return data.user;
      } else {
        // session invalid
        setUser(null);
        if (options.redirectOnFail) {
          router.replace("/login");
        }
        return null;
      }
    } catch (err) {
      console.error("Session fetch error:", err);
      setUser(null);
      if (options.redirectOnFail) {
        router.replace("/login");
      }
      return null;
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    checkSession();
  }, []);

  useEffect(() => {
    if (!user) return;

    let isMounted = true;

    const verify = async () => {
      if (!isMounted) return;
      const currentUser = await checkSession({ redirectOnFail: true });
    };

    window.addEventListener("focus", verify);

    return () => {
      isMounted = false;
      window.removeEventListener("focus", verify);
    };
  }, [user]);

  const login = async (credentials) => {
    setLoginLoading(true);
    try {
      const sessions = await listSessions();

      const existing = sessions.find(
        (s) => s.userEmail.toLowerCase() === credentials.email.toLowerCase()
      );

      if (existing) {
        await setActiveSession(existing.sessionToken);
        toast.info("You are already logged in. Switching to that account...");
        return authClient.getSession();
      }

      // ❗ Check session limit BEFORE creating new login
      if (!(await ensureSessionLimit())) {
        return null;
      }

      // Proceed to normal login
      const { data, error } = await authClient.signIn.email(credentials);
      if (error) throw new Error(error.message);

      const session = await authClient.getSession();
      if (session?.data?.user) setUser(session.data.user);

      return session;
    } finally {
      setLoginLoading(false);
    }
  };

  const socialLogin = async (provider) => {
    setSocialLoading(true);
    try {
      // ❗ Check session limit
      if (!(await ensureSessionLimit())) return null;

      const { error } = await authClient.signIn.social({
        provider,
        requestSignUp: false,
        errorCallbackURL: "/login?social=callback",
      });

      if (error) throw new Error(error.message);
      return true;
    } finally {
      setSocialLoading(false);
    }
  };

  const listSessions = async () => {
    try {
      const { data, error } =
        await authClient.multiSession.listDeviceSessions();
      if (error) throw new Error(error.message);

      const current = await authClient.getSession();
      const currentToken = current?.data?.session?.token;

      return data.map((item) => ({
        sessionToken: item.session.token,
        sessionId: item.session.id,
        userEmail: item.user.email,
        userId: item.user.id,
        active: item.session.token === currentToken,
      }));
    } catch (err) {
      console.error("List sessions error:", err);
      return [];
    }
  };

  const setActiveSession = async (sessionToken) => {
    try {
      const { error } = await authClient.multiSession.setActive({
        sessionToken,
      });
      if (error) throw new Error(error.message);

      const newSession = await authClient.getSession();
      if (newSession?.data?.user) setUser(newSession.data.user);

      return true;
    } catch (err) {
      console.error("Failed to switch session", err);
      return false;
    }
  };

  const revokeSession = async (sessionToken) => {
    try {
      const { error } = await authClient.multiSession.revoke({
        sessionToken,
      });
      if (error) throw new Error(error.message);

      return true;
    } catch (err) {
      console.error("Failed to revoke session", err);
      return false;
    }
  };

  const socialSignUp = async (provider, app_role = null) => {
    setSocialLoading(true);
    try {
      // ❗ Check session limit
      if (!(await ensureSessionLimit())) return null;

      const opts = {
        provider,
        requestSignUp: true,
        newUserCallbackURL: "/signup?social_auth=complete",
        callbackURL: "/signup?social_auth=complete",
        additionalData: { app_role },
      };

      sessionStorage.setItem("signup_role", encrypt(app_role));

      const { error } = await authClient.signIn.social(opts);
      if (error) throw new Error(error.message);

      return true;
    } finally {
      setSocialLoading(false);
    }
  };

  // 🔐 2FA Verification Method
  const verifyTwoFactor = async (code, method = "totp", trustDevice = true) => {
    try {
      let result;

      switch (method) {
        case "totp":
          result = await authClient.twoFactor.verifyTotp({
            code: code.replace(/\s/g, ""),
            trustDevice,
          });
          break;
        case "backup":
          result = await authClient.twoFactor.verifyBackupCode({
            code: code.replace(/\s/g, ""),
            trustDevice,
          });
          break;
        case "otp":
          result = await authClient.twoFactor.verifyOtp({
            code: code.replace(/\s/g, ""),
            trustDevice,
          });
          break;
        default:
          throw new Error("Invalid verification method");
      }

      if (result.error) {
        throw new Error(result.error.message);
      }

      // Refresh session after successful 2FA verification
      const session = await authClient.getSession();
      if (session?.data?.user) {
        setUser(session.data.user);
      }

      return result.data;
    } catch (error) {
      console.error("2FA verification error:", error);
      throw error;
    }
  };

  // 📧 Send OTP for email verification
  const sendTwoFactorOtp = async (trustDevice = true) => {
    try {
      const result = await authClient.twoFactor.sendOtp({
        trustDevice,
      });

      if (result.error) {
        throw new Error(result.error.message);
      }

      return result.data;
    } catch (error) {
      console.error("Send OTP error:", error);
      throw error;
    }
  };

  const logout = async () => {
    setLoading(true);
    try {
      await authClient.signOut();
      // await authClient.multiSession.revoke();

      setUser(null);
      router.replace("/login");
    } finally {
      setLoading(false);
    }
  };

  const value = {
    user,
    setUser,
    login,
    logout,
    socialLogin,
    socialSignUp,
    ensureSessionLimit,
    verifyTwoFactor,
    sendTwoFactorOtp,
    loginLoading,
    socialLoading,
    authLoading: loading,

    // ⭐ New Multi-session APIs
    listSessions,
    setActiveSession,
    revokeSession,
  };

  return (
    <AuthContext.Provider value={value}>
      {loading ? <Loading fullscreen message="Loading ....." /> : children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);
