"use client";

import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { toast } from "react-toastify";
import OTPVerificationStep from "@/app/(pages)/(auth)/signup/components/OTPVerificationStep";
import { authClient } from "@/lib/client";

export default function VerifyEmailPage() {
  const router = useRouter();

  const [email, setEmail] = useState(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [otpVerified, setOtpVerified] = useState(false);
  const [otpSent, setOtpSent] = useState(false); 

  useEffect(() => {
    const savedEmail = sessionStorage.getItem("pendingEmailVerification");

    if (!savedEmail) {
      toast.error("Verification session expired. Please login again.");
      router.replace("/login");
      return;
    }

    setEmail(savedEmail);
    sendVerificationOtp(savedEmail); 
  }, []);

  const sendVerificationOtp = async (emailToVerify) => {
    setIsSubmitting(true);
    try {
      const r = await authClient.emailOtp.sendVerificationOtp({
        email: emailToVerify,
        type: "email-verification",
      });

      if (r.error) {
        toast.error(r.error.message);
      } else {
        toast.success("Verification code sent to your email");
        setOtpSent(true);
      }
    } catch (err) {
      console.error(err);
      toast.error("Failed to send verification code");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleOtpVerify = async (otp) => {
    setIsSubmitting(true);

    try {
      const { error } = await authClient.emailOtp.verifyEmail({
        email,
        otp,
      });

      if (error) {
        toast.error(error.message);
        return;
      }

      toast.success("Email verified!");
      setOtpVerified(true);

      sessionStorage.removeItem("pendingEmailVerification");

      router.replace("/login");
    } catch (err) {
      console.error(err);
      toast.error("Verification failed");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleResendOtp = async () => {
    await sendVerificationOtp(email);
  };

  if (!email) return null; 

  return (
    <main className="min-h-screen flex items-center justify-center px-4 bg-base-200/40">
      <div className="card w-full max-w-md bg-base-100 shadow-xl p-8 border border-base-300">
        <OTPVerificationStep
          email={email}
          onOtpVerify={handleOtpVerify}
          onResendOtp={handleResendOtp}
          isSubmitting={isSubmitting}
          otpVerified={otpVerified}
          otpSent={otpSent}
        />
      </div>
    </main>
  );
}
