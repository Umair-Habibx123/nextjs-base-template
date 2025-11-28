// src/app/(pages)/login/components/EmailPasswordLogin.jsx
import React, { useState } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "../../../../context/auth/authContext";
import { useTranslation } from "react-i18next";
import { Mail, Lock, Eye, EyeOff, Key, User } from "lucide-react";
import { toast } from "react-toastify";

const EmailPasswordLogin = ({
  email,
  setEmail,
  isSubmitting,
  setIsSubmitting,
  isMultiAccount,
}) => {
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const { login, loginLoading } = useAuth();
  const router = useRouter();
  const { t } = useTranslation();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      const result = await login({ email, password });

      if (isMultiAccount) {
        sessionStorage.removeItem("multiAccountLogin");
      }
    } catch (error) {
      if (
        /verify/i.test(error.message) ||
        error.code === "EMAIL_NOT_VERIFIED" ||
        /email.*not.*verified/i.test(error.message)
      ) {
        toast.info("Please verify your email before logging in.");
        sessionStorage.setItem("pendingEmailVerification", email);
        router.push("/verify-email");
        setIsSubmitting(false);
        return;
      }

      toast.error(error.message || "Login failed");
      setIsSubmitting(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-5">
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
            id="email"
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="input input-bordered w-full rounded-xl pl-10 bg-base-200/50"
            placeholder="admin@example.com"
            required
            disabled={isSubmitting || loginLoading}
          />
          <User className="w-4 h-4 text-base-content/40 absolute left-3 top-1/2 -translate-y-1/2" />
        </div>
      </div>

      {/* Password */}
      <div className="form-control">
        <label className="label">
          <span className="label-text font-semibold text-base-content flex items-center gap-2">
            <Lock className="w-4 h-4 text-primary" />
            {t("Password")}
          </span>
        </label>
        <div className="relative">
          <input
            id="password"
            type={showPassword ? "text" : "password"}
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="input input-bordered w-full rounded-xl pl-10 pr-10 bg-base-200/50"
            placeholder={t("Enter your password")}
            required
            name="password"
            autoComplete="current-password webauthn"
          />
          <Key className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-base-content/40" />
          <button
            type="button"
            onClick={() => setShowPassword(!showPassword)}
            className="absolute right-3 top-1/2 -translate-y-1/2 text-base-content/40"
          >
            {showPassword ? <EyeOff /> : <Eye />}
          </button>
        </div>
      </div>

      {/* Submit */}
      <button
        type="submit"
        className="btn btn-primary w-full rounded-xl"
        disabled={isSubmitting || loginLoading}
      >
        {isSubmitting ? "Signing in..." : "Sign In"}
      </button>
    </form>
  );
};

export default EmailPasswordLogin;
