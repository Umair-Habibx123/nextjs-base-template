"use client";

import React, { useState } from "react";
import { Key, Shield, Loader2, AlertTriangle } from "lucide-react";
import { authClient } from "@/lib/client";
import { toast } from "react-toastify";
import { useRouter } from "next/navigation";

const BackupCodeVerification = ({ callbackURL }) => {
  const router = useRouter();

  const [code, setCode] = useState("");
  const [trustDevice, setTrustDevice] = useState(true);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState(false);

  const verifyBackup = async (e) => {
    e.preventDefault();
    if (!code) return setError("Please enter your backup code.");

    setLoading(true);
    setError("");

    try {
      const res = await authClient.twoFactor.verifyBackupCode({
        code: code.trim(),
        trustDevice,
      });

      if (res.error) throw new Error(res.error.message);

      toast.success("Backup code accepted!");
      setSuccess(true);

      setTimeout(() => router.replace(callbackURL), 1200);
    } catch (err) {
      setError(err.message || "Invalid backup code.");
      setCode("");
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={verifyBackup} className="space-y-6">

      {/* Input */}
      <div className="form-control">
        <label className="label font-semibold">Enter Backup Code</label>

        <div className="relative">
          <Key className="absolute left-3 top-1/2 -translate-y-1/2 text-base-content/40 w-4 h-4" />

          <input
            type="text"
            value={code}
            onChange={(e) => setCode(e.target.value)}
            placeholder="example-backup-code"
            className="input input-bordered w-full rounded-xl pl-10 bg-base-200/50"
          />
        </div>
      </div>

      {/* Trust Device */}
      <label className="flex items-center gap-3 cursor-pointer">
        <input
          type="checkbox"
          className="checkbox checkbox-warning"
          checked={trustDevice}
          onChange={(e) => setTrustDevice(e.target.checked)}
        />
        <span className="text-sm text-base-content/70">Trust this device for 30 days</span>
      </label>

      {/* Info */}
      <div className="p-3 bg-warning/10 border border-warning/20 rounded-xl flex gap-3">
        <AlertTriangle className="text-warning w-4 h-4 mt-1" />
        <p className="text-xs text-warning">
          Backup codes are one-time use. Generate new ones after using them.
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
        disabled={!code || loading}
        className="btn btn-warning w-full rounded-xl font-semibold flex items-center justify-center gap-2"
      >
        {loading ? <Loader2 className="w-5 h-5 animate-spin" /> : <Shield className="w-5 h-5" />}
        Verify & Continue
      </button>
    </form>
  );
};

export default BackupCodeVerification;
