// // src/app/(pages)/verify-2fa/page.jsx
// "use client";

// import React, { useState, useEffect, Suspense } from "react";
// import { useRouter, useSearchParams } from "next/navigation";
// import { useTranslation } from "react-i18next";
// import { authClient } from "@/lib/client";
// import {
//   Shield,
//   Key,
//   Smartphone,
//   Mail,
//   Loader2,
//   CheckCircle,
//   XCircle,
//   ArrowLeft,
//   AlertTriangle,
//   RefreshCw,
//   Send,
//   Sparkles,
// } from "lucide-react";
// import { toast } from "react-toastify";
// import Loading from "../../components/layout/Loading";

// // Tab components
// const AuthenticatorTab = ({ code, setCode, formatCode, loading }) => (
//   <div className="space-y-5">
//     <div className="form-control">
//       <label className="label">
//         <span className="label-text font-semibold text-base-content flex items-center gap-2">
//           <Smartphone className="w-4 h-4 text-warning" />
//           6-digit code from authenticator
//         </span>
//       </label>
//       <input
//         type="text"
//         value={code}
//         onChange={(e) => setCode(formatCode(e.target.value))}
//         className="input input-bordered w-full rounded-xl text-center text-xl font-mono tracking-widest bg-base-200/50 focus:ring-2 focus:ring-warning/50"
//         placeholder="123 456"
//         maxLength={7}
//         required
//         autoFocus
//         disabled={loading}
//       />
//     </div>
//   </div>
// );

// const EmailTab = ({ 
//   code, 
//   setCode, 
//   formatCode, 
//   loading, 
//   otpSent, 
//   otpCooldown, 
//   sendingOtp, 
//   onSendOtp 
// }) => (
//   <div className="space-y-5">
//     {/* Send Code Button */}
//     {!otpSent ? (
//       <div className="text-center">
//         <button
//           type="button"
//           onClick={onSendOtp}
//           disabled={sendingOtp || otpCooldown > 0}
//           className="btn btn-warning w-full rounded-xl gap-2"
//         >
//           {sendingOtp ? (
//             <Loader2 className="w-4 h-4 animate-spin" />
//           ) : (
//             <Send className="w-4 h-4" />
//           )}
//           {otpCooldown > 0 ? `Resend in ${otpCooldown}s` : "Send Verification Code"}
//         </button>
//       </div>
//     ) : (
//       <>
//         <div className="form-control">
//           <label className="label">
//             <span className="label-text font-semibold text-base-content flex items-center gap-2">
//               <Mail className="w-4 h-4 text-warning" />
//               6-digit code from email
//             </span>
//           </label>
//           <input
//             type="text"
//             value={code}
//             onChange={(e) => setCode(formatCode(e.target.value))}
//             className="input input-bordered w-full rounded-xl text-center text-xl font-mono tracking-widest bg-base-200/50 focus:ring-2 focus:ring-warning/50"
//             placeholder="123 456"
//             maxLength={7}
//             required
//             autoFocus
//             disabled={loading || !otpSent}
//           />
//           <label className="label">
//             <span className="label-text-alt text-success">
//               ✓ Code sent! Check your email
//             </span>
//           </label>
//         </div>

//         {/* Resend Option */}
//         <div className="text-center">
//           <button
//             type="button"
//             onClick={onSendOtp}
//             disabled={sendingOtp || otpCooldown > 0}
//             className="btn btn-ghost btn-sm gap-2"
//           >
//             <RefreshCw
//               className={`w-4 h-4 ${
//                 sendingOtp || otpCooldown > 0 ? "animate-spin" : ""
//               }`}
//             />
//             {otpCooldown > 0 ? `Resend in ${otpCooldown}s` : "Resend Code"}
//           </button>
//         </div>
//       </>
//     )}
//   </div>
// );

// const BackupTab = ({ code, setCode, loading }) => (
//   <div className="space-y-5">
//     <div className="form-control">
//       <label className="label">
//         <span className="label-text font-semibold text-base-content flex items-center gap-2">
//           <Key className="w-4 h-4 text-warning" />
//           8-digit backup code
//         </span>
//       </label>
//       <input
//         type="text"
//         value={code}
//         onChange={(e) => setCode(e.target.value)}
//         className="input input-bordered w-full rounded-xl text-center text-lg font-mono tracking-wider bg-base-200/50 focus:ring-2 focus:ring-warning/50"
//         placeholder="backup-code"
//         required
//         autoFocus
//         disabled={loading}
//       />
//     </div>
//   </div>
// );

// // Main component wrapped in Suspense for useSearchParams
// const VerifyTwoFactorContent = () => {
//   const router = useRouter();
//   const searchParams = useSearchParams();
//   const { t } = useTranslation();

//   const [code, setCode] = useState("");
//   const [activeTab, setActiveTab] = useState("authenticator");
//   const [loading, setLoading] = useState(false);
//   const [error, setError] = useState("");
//   const [success, setSuccess] = useState(false);
//   const [trustDevice, setTrustDevice] = useState(true);
//   const [otpSent, setOtpSent] = useState(false);
//   const [otpCooldown, setOtpCooldown] = useState(0);
//   const [sendingOtp, setSendingOtp] = useState(false);

//   const callbackURL = searchParams.get("callbackURL") || "/dashboard";
//   const email = searchParams.get("email") || "";

//   const tabs = [
//     { id: "authenticator", label: "Authenticator", icon: Smartphone },
//     { id: "email", label: "Email Code", icon: Mail },
//     { id: "backup", label: "Backup Code", icon: Key },
//   ];

//   // Handle OTP cooldown timer
//   useEffect(() => {
//     if (otpCooldown > 0) {
//       const timer = setTimeout(() => setOtpCooldown(otpCooldown - 1), 1000);
//       return () => clearTimeout(timer);
//     }
//   }, [otpCooldown]);

//   const handleVerify = async (e: React.FormEvent) => {
//     e.preventDefault();
    
//     if (!code) {
//       setError("Please enter verification code");
//       return;
//     }

//     // For email OTP, require code to be sent first
//     if (activeTab === "email" && !otpSent) {
//       setError("Please send the verification code first");
//       return;
//     }

//     setLoading(true);
//     setError("");

//     try {
//       let result;

//       switch (activeTab) {
//         case "authenticator":
//           result = await authClient.twoFactor.verifyTotp({
//             code: code.replace(/\s/g, ""),
//             trustDevice,
//           });
//           break;
//         case "backup":
//           result = await authClient.twoFactor.verifyBackupCode({
//             code: code.replace(/\s/g, ""),
//             trustDevice,
//           });
//           break;
//         case "email":
//           result = await authClient.twoFactor.verifyOtp({
//             code: code.replace(/\s/g, ""),
//             trustDevice,
//           });
//           break;
//       }

//       if (result.error) {
//         throw new Error(result.error.message);
//       }

//       setSuccess(true);
//       toast.success("Two-factor authentication verified successfully!");

//       // Redirect after short delay
//       setTimeout(() => {
//         if (callbackURL) {
//           router.push(callbackURL);
//         } else {
//           router.push("/dashboard");
//         }
//       }, 1500);
//     } catch (err: any) {
//       setError(err.message || "Verification failed. Please try again.");
//       // Clear code on error for security
//       setCode("");
//     } finally {
//       setLoading(false);
//     }
//   };

//   const handleSendOtp = async () => {
//     if (otpCooldown > 0) return;

//     setSendingOtp(true);
//     setError("");
//     try {
//       const result = await authClient.twoFactor.sendOtp({
//         trustDevice: true,
//       });

//       if (result.error) throw new Error(result.error.message);

//       setOtpSent(true);
//       setOtpCooldown(30); // 30 second cooldown
//       toast.info("Verification code sent to your email!");
//     } catch (err: any) {
//       setError(err.message || "Failed to send code. Please try again.");
//     } finally {
//       setSendingOtp(false);
//     }
//   };

//   const handleTabChange = (tabId: string) => {
//     setActiveTab(tabId);
//     setCode("");
//     setError("");
    
//     // Reset email state when switching away from email tab
//     if (tabId !== "email") {
//       setOtpSent(false);
//     }
//   };

//   const formatCode = (value: string) => {
//     if (activeTab === "authenticator" || activeTab === "email") {
//       return value
//         .replace(/\D/g, "")
//         .replace(/(\d{3})(\d{0,3})/, "$1 $2")
//         .slice(0, 7)
//         .trim();
//     }
//     return value;
//   };

//   return (
//     <main className="min-h-screen flex items-center justify-center bg-linear-to-br from-primary/5 via-secondary/5 to-accent/5 px-4 py-8">
//       {/* 🌟 Enhanced Background Effects */}
//       <div className="absolute inset-0 overflow-hidden">
//         <div className="absolute -top-40 -right-40 w-80 h-80 bg-warning/10 rounded-full blur-3xl"></div>
//         <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-primary/10 rounded-full blur-3xl"></div>
//         <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-accent/5 rounded-full blur-3xl"></div>
//       </div>

//       {/* 🎨 Enhanced Verification Card */}
//       <section className="card w-full max-w-md bg-linear-to-br from-base-100 to-base-200 border border-base-300/30 shadow-2xl backdrop-blur-lg rounded-3xl transition-all duration-500 hover:shadow-3xl z-10">
//         <div className="card-body p-8 space-y-8">
//           {/* 🌟 Enhanced Header */}
//           <div className="text-center space-y-4">
//             <div className="flex justify-center">
//               <div className="p-4 rounded-2xl bg-linear-to-br from-warning to-warning/80 text-warning-content shadow-lg">
//                 <Shield className="w-8 h-8" />
//               </div>
//             </div>
//             <div className="space-y-2">
//               <h1 className="text-3xl font-bold bg-linear-to-r from-base-content to-base-content/70 bg-clip-text text-transparent">
//                 {t("Two-Factor Verification")}
//               </h1>
//               <p className="text-base-content/70 text-lg">
//                 {t("Verify your identity to continue")}
//               </p>
//               {email && (
//                 <p className="text-sm text-primary mt-1 font-medium">{email}</p>
//               )}
//             </div>
//           </div>

//           {/* 🔥 Modern Tabbed Interface */}
//           <div className="w-full">
//             {/* Tabs */}
//             <div className="flex mb-6 border-b border-base-300/60">
//               {tabs.map((tab) => {
//                 const IconComponent = tab.icon;
//                 return (
//                   <button
//                     key={tab.id}
//                     onClick={() => handleTabChange(tab.id)}
//                     className={`flex-1 py-3 text-center font-semibold transition-all flex items-center justify-center gap-2
//                       ${
//                         activeTab === tab.id
//                           ? "border-b-2 border-warning text-warning"
//                           : "text-base-content/60 hover:text-base-content"
//                       }
//                     `}
//                   >
//                     <IconComponent className="w-4 h-4" />
//                     {t(tab.label)}
//                   </button>
//                 );
//               })}
//             </div>

//             {/* Tab Content */}
//             <form onSubmit={handleVerify} className="space-y-6">
//               {activeTab === "authenticator" && (
//                 <AuthenticatorTab
//                   code={code}
//                   setCode={setCode}
//                   formatCode={formatCode}
//                   loading={loading}
//                 />
//               )}

//               {activeTab === "email" && (
//                 <EmailTab
//                   code={code}
//                   setCode={setCode}
//                   formatCode={formatCode}
//                   loading={loading}
//                   otpSent={otpSent}
//                   otpCooldown={otpCooldown}
//                   sendingOtp={sendingOtp}
//                   onSendOtp={handleSendOtp}
//                 />
//               )}

//               {activeTab === "backup" && (
//                 <BackupTab
//                   code={code}
//                   setCode={setCode}
//                   loading={loading}
//                 />
//               )}

//               {/* Trust Device Option */}
//               <div className="form-control">
//                 <label className="label cursor-pointer justify-start gap-3">
//                   <input
//                     type="checkbox"
//                     checked={trustDevice}
//                     onChange={(e) => setTrustDevice(e.target.checked)}
//                     className="checkbox checkbox-warning"
//                   />
//                   <span className="label-text">
//                     {t("Trust this device for 30 days")}
//                   </span>
//                 </label>
//               </div>

//               {/* Security Note */}
//               <div className="bg-warning/5 rounded-2xl p-4 border border-warning/20">
//                 <div className="flex items-start gap-3">
//                   <AlertTriangle className="w-4 h-4 text-warning mt-0.5 shrink-0" />
//                   <div>
//                     <p className="text-sm font-semibold text-warning mb-1">
//                       Security Notice
//                     </p>
//                     <p className="text-xs text-base-content/70">
//                       Keep your verification codes secure and never share them with anyone.
//                     </p>
//                   </div>
//                 </div>
//               </div>

//               {/* Error Message */}
//               {error && (
//                 <div className="p-4 bg-error/10 border border-error/20 rounded-xl text-error flex items-center gap-2">
//                   <XCircle className="w-4 h-4 shrink-0" />
//                   <span className="text-sm">{error}</span>
//                 </div>
//               )}

//               {/* Success Message */}
//               {success && (
//                 <div className="p-4 bg-success/10 border border-success/20 rounded-xl text-success flex items-center gap-2">
//                   <CheckCircle className="w-4 h-4 shrink-0" />
//                   <span className="text-sm">
//                     {t("Verification successful! Redirecting...")}
//                   </span>
//                 </div>
//               )}

//               {/* Submit Button */}
//               <button
//                 type="submit"
//                 disabled={loading || !code || success || (activeTab === "email" && !otpSent)}
//                 className="btn btn-warning btn-lg w-full rounded-xl shadow-lg hover:shadow-xl transition-all duration-300 flex items-center justify-center gap-2 font-semibold"
//               >
//                 {loading ? (
//                   <Loader2 className="w-5 h-5 animate-spin" />
//                 ) : (
//                   <Shield className="w-5 h-5" />
//                 )}
//                 {t("Verify & Continue")}
//               </button>

//               {/* Back to Login */}
//               <div className="text-center">
//                 <button
//                   type="button"
//                   onClick={() => {
//                     authClient.signOut();
//                     router.push("/login");
//                   }}
//                   className="btn btn-ghost btn-sm gap-2"
//                 >
//                   <ArrowLeft className="w-4 h-4" />
//                   {t("Back to login")}
//                 </button>
//               </div>
//             </form>
//           </div>

//           {/* 🔒 Security Features */}
//           <div className="space-y-4 pt-4 border-t border-base-300/30">
//             <div className="bg-warning/5 rounded-2xl p-4 border border-warning/20">
//               <div className="flex items-start gap-3">
//                 <Sparkles className="w-4 h-4 text-warning mt-0.5 shrink-0" />
//                 <div>
//                   <p className="text-sm font-semibold text-warning mb-1">
//                     Enhanced Security
//                   </p>
//                   <p className="text-xs text-base-content/70">
//                     Two-factor authentication adds an extra layer of security to your account.
//                   </p>
//                 </div>
//               </div>
//             </div>
//           </div>

//           {/* Help Section */}
//           <div className="text-center space-y-2">
//             <p className="text-base-content/50 text-sm">
//               {t("Need help with two-factor authentication?")}
//             </p>
//             <button
//               onClick={() => router.push("/help/2fa")}
//               className="text-primary font-semibold hover:underline cursor-pointer text-sm transition-colors duration-200"
//             >
//               {t("Get help")}
//             </button>
//           </div>
//         </div>
//       </section>
//     </main>
//   );
// };

// // Main page component with Suspense
// const VerifyTwoFactorPage = () => {
//   return (
//     <Suspense
//       fallback={<Loading fullscreen message="Loading verification..." />}
//     >
//       <VerifyTwoFactorContent />
//     </Suspense>
//   );
// };

// export default VerifyTwoFactorPage;


"use client";

import React, { Suspense, useState } from "react";
import Loading from "../../components/layout/Loading";
import Verify2FAContent from "./components/Verify2FAContent";

const VerifyTwoFactorPage = () => {
  return (
    <Suspense fallback={<Loading fullscreen message="Loading verification..." />}>
      <Verify2FAContent />
    </Suspense>
  );
};

export default VerifyTwoFactorPage;



