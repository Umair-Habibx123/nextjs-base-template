// src/app/(pages)/login/components/MagicLinkLogin.jsx
import React from "react";
import { useTranslation } from "react-i18next";
import { Mail, User, Wand2 } from "lucide-react";
import { toast } from "react-toastify";
import { authClient } from "@/lib/client";

const MagicLinkLogin = ({ email, setEmail, isSubmitting, setIsSubmitting }) => {
  const { t } = useTranslation();

  const handleMagicLink = async () => {
    if (!email || email.trim() === "") {
      toast.error("Please enter your email.");
      return;
    }

    setIsSubmitting(true);

    try {
      const { data, error } = await authClient.signIn.magicLink({
        email: email,
        callbackURL: "/magic-link/callback",
      });

      if (error) throw error;

      toast.success("Magic link sent! Check your email.");
    } catch (error) {
      toast.error(error.message || "Failed to send magic link.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="space-y-5">
      {/* Email */}
      <div className="form-control">
        <label className="label">
          <span className="label-text font-semibold text-base-content flex items-center gap-2">
            <Mail className="w-4 h-4 text-primary" />
            {t("Email Address")}
          </span>
        </label>
        <div className="relative">
          <input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="input input-bordered w-full rounded-xl pl-10 bg-base-200/50"
            placeholder="you@example.com"
            disabled={isSubmitting}
          />
          <User className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-base-content/40" />
        </div>
      </div>

      <div className="bg-primary/5 rounded-2xl p-4 border border-primary/20">
        <div className="flex items-start gap-3">
          <Wand2 className="w-4 h-4 text-primary mt-0.5 shrink-0" />
          <div>
            <p className="text-sm font-semibold text-primary mb-1">
              Password-free Login
            </p>
            <p className="text-xs text-base-content/70">
              We'll send you a secure login link to your email. No password
              needed!
            </p>
          </div>
        </div>
      </div>

      {/* Magic Link Button */}
      <button
        type="button"
        onClick={handleMagicLink}
        className="btn btn-primary w-full rounded-xl"
        disabled={isSubmitting}
      >
        {isSubmitting ? "Sending..." : "Send Magic Link"}
      </button>
    </div>
  );
};

export default MagicLinkLogin;
