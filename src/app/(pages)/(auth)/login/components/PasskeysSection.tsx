// src/app/(pages)/login/components/PasskeyLogin.jsx
import React from "react";
import { useTranslation } from "react-i18next";
import { Key, Loader2 } from "lucide-react";
import { toast } from "react-toastify";
import { authClient } from "@/lib/client";

const PasskeyLogin = ({
  isSubmitting,
  setIsSubmitting,
  isMultiAccount,
  setUser,
  onSuccess,
}) => {
  const { t } = useTranslation();

  const handlePasskeyLogin = async () => {
    setIsSubmitting(true);

    try {
      const { data, error } = await authClient.signIn.passkey({
        autoFill: false,
      });


      if (error) throw new Error(error.message);

      if (data && (data.user || data.session)) {
        if (isMultiAccount) {
          sessionStorage.removeItem("multiAccountLogin");
        }

        setUser(data.user);
        onSuccess();
      } else {
        throw new Error("Invalid response from passkey authentication");
      }
    } catch (error) {
      console.error("Passkey login error:", error);
      toast.error(error.message || "Passkey authentication failed");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="space-y-5">
      <div className="bg-success/5 rounded-2xl p-4 border border-success/20">
        <div className="flex items-start gap-3">
          <Key className="w-4 h-4 text-success mt-0.5 shrink-0" />
          <div>
            <p className="text-sm font-semibold text-success mb-1">
              Passwordless Login
            </p>
            <p className="text-xs text-base-content/70">
              Use your device's biometrics or security key for secure,
              password-free access.
            </p>
          </div>
        </div>
      </div>

      {/* Sign in with Passkey */}
      <button
        type="button"
        onClick={handlePasskeyLogin}
        disabled={isSubmitting}
        className="btn btn-success w-full rounded-xl flex items-center justify-center gap-2"
      >
        {isSubmitting ? (
          <Loader2 className="w-4 h-4 animate-spin" />
        ) : (
          <Key className="w-4 h-4" />
        )}
        Sign In with Passkey
      </button>
    </div>
  );
};

export default PasskeyLogin;