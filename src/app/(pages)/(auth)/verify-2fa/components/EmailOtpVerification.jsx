"use client";

import React, { useState, useEffect } from "react";
import { Send, Loader2, RefreshCw, Shield, AlertTriangle } from "lucide-react";
import { authClient } from "@/lib/client";
import { toast } from "react-toastify";
import { useRouter } from "next/navigation";

const EmailOtpVerification = ({ email, callbackURL }) => {
  const router = useRouter();

  const [code, setCode] = useState("");
  const [otpSent, setOtpSent] = useState(false);
  const [trustDevice, setTrustDevice] = useState(true);
  const [cooldown, setCooldown] = useState(0);
  const [sending, setSending] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState(false);

  useEffect(() => {
    if (cooldown > 0) {
      const timer = setTimeout(() => setCooldown((c) => c - 1), 1000);
      return () => clearTimeout(timer);
    }
  }, [cooldown]);

  const sendCode = async () => {
    if (cooldown > 0) return;
    setSending(true);
    setError("");

    try {
      const res = await authClient.twoFactor.sendOtp({ trustDevice: true });
      if (res.error) throw new Error(res.error.message);

      toast.info("Verification code sent to your email!");
      setOtpSent(true);
      setCooldown(30);
    } catch (err) {
      setError(err.message || "Unable to send verification code");
    } finally {
      setSending(false);
    }
  };

  const verifyOtp = async (e) => {
    e.preventDefault();
    if (!otpSent) return setError("Please send the code first.");
    if (!code) return setError("Please enter the verification code.");

    setLoading(true);
    setError("");

    try {
      const res = await authClient.twoFactor.verifyOtp({
        code: code.replace(/\s/g, ""),
        trustDevice,
      });

      if (res.error) throw new Error(res.error.message);

      toast.success("Email verification successful!");
      setSuccess(true);

      setTimeout(() => router.replace(callbackURL), 1200);
    } catch (err) {
      setError(err.message || "Invalid code.");
      setCode("");
    } finally {
      setLoading(false);
    }
  };

  const format = (value) =>
    value
      .replace(/\D/g, "")
      .replace(/(\d{3})(\d{0,3})/, "$1 $2")
      .slice(0, 7)
      .trim();

  return (
    <form onSubmit={verifyOtp} className="space-y-6">
      {/* Email OTP Button */}
      <div className="flex gap-2">
        <button
          type="button"
          onClick={sendCode}
          disabled={sending || cooldown > 0}
          className="btn btn-warning flex-1 rounded-xl flex items-center justify-center gap-2"
        >
          {sending ? (
            <Loader2 className="w-4 h-4 animate-spin" />
          ) : (
            <Send className="w-4 h-4" />
          )}
          {cooldown > 0 ? `${cooldown}s` : "Send Code"}
        </button>
      </div>

      {/* Input */}
      <div className="form-control">
        <label className="label font-semibold">Enter 6-digit Email Code</label>
        <input
          type="text"
          disabled={!otpSent}
          value={code}
          onChange={(e) => setCode(format(e.target.value))}
          placeholder="123 456"
          maxLength={7}
          className="input input-bordered w-full text-center text-xl font-mono rounded-xl bg-base-200/50"
        />

        {!otpSent ? (
          <span className="text-warning text-xs mt-1">
            Click SEND to receive your code.
          </span>
        ) : (
          <span className="text-success text-xs mt-1">
            Code sent! Check your inbox.
          </span>
        )}
      </div>

      {/* Resend */}
      {otpSent && (
        <div className="text-center">
          <button
            type="button"
            onClick={sendCode}
            disabled={cooldown > 0}
            className="btn btn-ghost btn-sm gap-2"
          >
            <RefreshCw
              className={cooldown > 0 ? "animate-spin w-4 h-4" : "w-4 h-4"}
            />
            {cooldown > 0 ? `Resend in ${cooldown}s` : "Resend Code"}
          </button>
        </div>
      )}

      {/* Trust Device */}
      <label className="flex items-center gap-3 cursor-pointer">
        <input
          type="checkbox"
          className="checkbox checkbox-warning"
          checked={trustDevice}
          onChange={(e) => setTrustDevice(e.target.checked)}
        />
        <span className="text-sm text-base-content/70">
          Trust this device for 30 days
        </span>
      </label>

      {/* Info */}
      <div className="p-3 bg-warning/10 border border-warning/20 rounded-xl flex gap-3">
        <AlertTriangle className="text-warning w-4 h-4 mt-1" />
        <p className="text-xs text-warning">
          Keep your verification codes private and secure.
        </p>
      </div>

      {/* Error */}
      {error && (
        <div className="p-3 bg-error/10 border border-error/20 rounded-xl text-error text-sm">
          {error}
        </div>
      )}

      {/* Success */}
      {success && (
        <div className="p-3 bg-success/10 border border-success/20 rounded-xl text-success text-sm">
          Verification successful! Redirecting…
        </div>
      )}

      {/* Submit */}
      <button
        type="submit"
        disabled={!otpSent || !code || loading}
        className="btn btn-warning w-full rounded-xl font-semibold flex items-center justify-center gap-2"
      >
        {loading ? (
          <Loader2 className="w-5 h-5 animate-spin" />
        ) : (
          <Shield className="w-5 h-5" />
        )}
        Verify & Continue
      </button>
    </form>
  );
};

export default EmailOtpVerification;
