// src/app/(pages)/signup/components/OTPVerificationStep.jsx
import React, { useState, useRef, useEffect } from "react";
import { ShieldCheck, CheckCircle2, Loader2 } from "lucide-react";

const OTPVerificationStep = ({
  email,
  onOtpVerify,
  onResendOtp,
  isSubmitting,
  otpVerified,
}) => {
  const [otp, setOtp] = useState(["", "", "", "", "", ""]);
  const inputRefs = useRef([]);

  useEffect(() => {
    if (inputRefs.current[0]) {
      inputRefs.current[0].focus();
    }
  }, []);

  const handleChange = (index, value) => {
    // Allow only numbers
    if (value && !/^\d+$/.test(value)) return;

    const newOtp = [...otp];
    newOtp[index] = value;
    setOtp(newOtp);

    // Auto-focus next input
    if (value && index < 5) {
      inputRefs.current[index + 1].focus();
    }

    // Auto-submit when all fields are filled
    if (newOtp.every((digit) => digit !== "") && index === 5) {
      handleSubmit(newOtp.join(""));
    }
  };

  const handleKeyDown = (index, e) => {
    if (e.key === "Backspace" && !otp[index] && index > 0) {
      inputRefs.current[index - 1].focus();
    }
  };

  const handlePaste = (e) => {
    e.preventDefault();
    const pastedData = e.clipboardData.getData("text");
    const pastedNumbers = pastedData.replace(/\D/g, "").slice(0, 6);

    if (pastedNumbers.length === 6) {
      const newOtp = pastedNumbers.split("");
      setOtp(newOtp);
      
      // Focus the last input
      inputRefs.current[5].focus();
      
      // Auto-submit
      setTimeout(() => handleSubmit(pastedNumbers), 100);
    }
  };

  const handleSubmit = async (submittedOtp = otp.join("")) => {
    if (submittedOtp.length !== 6) {
      toast.error("Please enter a valid 6-digit OTP");
      return;
    }

    await onOtpVerify(submittedOtp);
  };

  return (
    <div className="space-y-6 animate-fadeIn text-center">
      <div className="flex justify-center">
        <div className="p-3 rounded-2xl bg-primary/10 text-primary">
          <ShieldCheck className="w-8 h-8" />
        </div>
      </div>

      <h3 className="text-2xl font-bold text-base-content">Verify Your Email</h3>

      <p className="text-base-content/70 mb-2">
        We've sent a 6-digit verification code to
      </p>
      <p className="text-lg font-semibold text-primary mb-6">{email}</p>

      {/* OTP Input Boxes */}
      <div className="flex justify-center gap-3 mb-6">
        {otp.map((digit, index) => (
          <input
            key={index}
            ref={(el) => (inputRefs.current[index] = el)}
            type="text"
            inputMode="numeric"
            maxLength="1"
            value={digit}
            onChange={(e) => handleChange(index, e.target.value)}
            onKeyDown={(e) => handleKeyDown(index, e)}
            onPaste={index === 0 ? handlePaste : undefined}
            className="w-14 h-14 text-center text-2xl font-bold border-2 border-base-300 rounded-xl focus:border-primary focus:ring-2 focus:ring-primary/20 bg-base-200/50 transition-all duration-200"
            disabled={isSubmitting || otpVerified}
          />
        ))}
      </div>

      {/* Verify Button */}
      <button
        type="button"
        onClick={() => handleSubmit()}
        disabled={isSubmitting || otpVerified || otp.some(digit => digit === "")}
        className="btn btn-primary w-full max-w-xs rounded-xl flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
      >
        {isSubmitting ? (
          <Loader2 className="w-5 h-5 animate-spin" />
        ) : otpVerified ? (
          <CheckCircle2 className="w-5 h-5" />
        ) : (
          <ShieldCheck className="w-5 h-5" />
        )}
        {otpVerified
          ? "Verified"
          : isSubmitting
          ? "Verifying..."
          : "Verify OTP"}
      </button>

      {/* Resend OTP */}
      <div className="text-center">
        <p className="text-base-content/60 mb-2">
          Didn't receive the code?
        </p>
        <button
          type="button"
          onClick={onResendOtp}
          disabled={isSubmitting}
          className="btn btn-link text-primary hover:no-underline"
        >
          Resend OTP
        </button>
      </div>
    </div>
  );
};

export default OTPVerificationStep;