// "use client";

// import React, { useEffect, useState } from "react";
// import Link from "next/link";
// import { X, Cookie } from "lucide-react";
// import { useTranslation } from "react-i18next";

// const CookieConsent = () => {
//   const { t } = useTranslation();

//   const [visible, setVisible] = useState(false);
//   const [choiceMade, setChoiceMade] = useState(false);
//   const [animatingOut, setAnimatingOut] = useState(false);

//   useEffect(() => {
//     const consent = localStorage.getItem("cookie_consent");

//     if (!consent) {
//       const timer = setTimeout(() => setVisible(true), 1000);
//       return () => clearTimeout(timer);
//     } else {
//       setChoiceMade(true);
//     }
//   }, []);

//   const closeWithAnimation = (callback) => {
//     setAnimatingOut(true);
//     setTimeout(() => {
//       setVisible(false);
//       setChoiceMade(true);
//       callback?.();
//     }, 300);
//   };

//   const handleAccept = () =>
//     closeWithAnimation(() => {
//       localStorage.setItem("cookie_consent", "accepted");
//     });

//   const handleReject = () =>
//     closeWithAnimation(() => {
//       localStorage.setItem("cookie_consent", "rejected");
//     });

//   const handleClose = () =>
//     closeWithAnimation(() => {
//       localStorage.setItem("cookie_consent", "ignored");
//     });

//   if (!visible || choiceMade) return null;

//   return (
//     <div
//       className={`fixed inset-x-0 bottom-0 flex justify-center z-[9999] animate-slide-up transition-all duration-300 ${
//         animatingOut
//           ? "translate-y-full opacity-0"
//           : "translate-y-0 opacity-100"
//       }`}
//     >
//       <div className="card w-full max-w-xl bg-base-100 shadow-2xl border border-base-300 rounded-t-2xl md:rounded-2xl m-4 md:mb-8 px-6 py-5">
//         <div className="flex justify-between items-start gap-3">
//           <div className="flex items-start gap-3">
//             <div className="p-2 rounded-full bg-primary/10">
//               <Cookie className="w-6 h-6 text-primary" />
//             </div>
//             <div>
//               <h3 className="font-semibold text-base-content text-lg">
//                 {t("Cookies & Privacy")}
//               </h3>
//               <p className="text-sm text-base-content/70 mt-1">
//                 {t(
//                   "We use cookies to personalize content, improve performance, and analyze traffic. You can accept or reject cookies below."
//                 )}
//               </p>

//               <p className="text-xs text-base-content/60 mt-2">
//                 {t("Read our")}{" "}
//                 <Link
//                   href="/cookies-policy"
//                   className="link link-primary font-medium"
//                 >
//                   {t("Cookies Policy")}
//                 </Link>{" "}
//                 {t("for more details.")}{" "}
//               </p>
//             </div>
//           </div>

//           <button
//             onClick={handleClose}
//             className="btn btn-xs btn-circle btn-ghost"
//             aria-label={t("Close")}
//           >
//             <X className="w-4 h-4" />
//           </button>
//         </div>

//         <div className="flex flex-col sm:flex-row justify-end gap-3 mt-5">
//           <button
//             onClick={handleReject}
//             className="btn btn-outline btn-sm sm:w-auto w-full"
//           >
//             {t("Reject")}
//           </button>
//           <button
//             onClick={handleAccept}
//             className="btn btn-primary btn-sm sm:w-auto w-full"
//           >
//             {t("Accept")}
//           </button>
//         </div>
//       </div>
//     </div>
//   );
// };

// export default CookieConsent;


"use client";

import React, { useEffect, useState } from "react";
import Link from "next/link";
import { X, Cookie, Shield, Settings, Check, Sparkles } from "lucide-react";
import { useTranslation } from "react-i18next";

const CookieConsent = () => {
  const { t } = useTranslation();

  const [visible, setVisible] = useState(false);
  const [choiceMade, setChoiceMade] = useState(false);
  const [animatingOut, setAnimatingOut] = useState(false);
  const [showSettings, setShowSettings] = useState(false);
  const [cookiePreferences, setCookiePreferences] = useState({
    necessary: true,
    analytics: false,
    marketing: false,
    preferences: false
  });

  useEffect(() => {
    const consent = localStorage.getItem("cookie_consent");

    if (!consent) {
      const timer = setTimeout(() => setVisible(true), 1500);
      return () => clearTimeout(timer);
    } else {
      setChoiceMade(true);
      // Load saved preferences if they exist
      const savedPrefs = localStorage.getItem("cookie_preferences");
      if (savedPrefs) {
        setCookiePreferences(JSON.parse(savedPrefs));
      }
    }
  }, []);

  const closeWithAnimation = (callback) => {
    setAnimatingOut(true);
    setTimeout(() => {
      setVisible(false);
      setChoiceMade(true);
      callback?.();
    }, 300);
  };

  const handleAcceptAll = () => {
    const allAccepted = {
      necessary: true,
      analytics: true,
      marketing: true,
      preferences: true
    };
    setCookiePreferences(allAccepted);
    closeWithAnimation(() => {
      localStorage.setItem("cookie_consent", "accepted");
      localStorage.setItem("cookie_preferences", JSON.stringify(allAccepted));
    });
  };

  const handleAcceptSelected = () => {
    closeWithAnimation(() => {
      localStorage.setItem("cookie_consent", "custom");
      localStorage.setItem("cookie_preferences", JSON.stringify(cookiePreferences));
    });
  };

  const handleRejectAll = () => {
    const onlyNecessary = {
      necessary: true, // Necessary cookies cannot be rejected
      analytics: false,
      marketing: false,
      preferences: false
    };
    setCookiePreferences(onlyNecessary);
    closeWithAnimation(() => {
      localStorage.setItem("cookie_consent", "rejected");
      localStorage.setItem("cookie_preferences", JSON.stringify(onlyNecessary));
    });
  };

  const handleClose = () =>
    closeWithAnimation(() => {
      localStorage.setItem("cookie_consent", "ignored");
    });

  const toggleCookiePreference = (type) => {
    if (type === 'necessary') return; // Necessary cookies cannot be toggled
    setCookiePreferences(prev => ({
      ...prev,
      [type]: !prev[type]
    }));
  };

  const cookieTypes = [
    {
      id: 'necessary',
      title: t("Necessary Cookies"),
      description: t("Essential for the website to function properly. Cannot be disabled."),
      required: true
    },
    {
      id: 'analytics',
      title: t("Analytics Cookies"),
      description: t("Help us understand how visitors interact with our website."),
      required: false
    },
    {
      id: 'preferences',
      title: t("Preference Cookies"),
      description: t("Remember your settings and preferences for a better experience."),
      required: false
    },
    {
      id: 'marketing',
      title: t("Marketing Cookies"),
      description: t("Used to deliver relevant ads and track campaign performance."),
      required: false
    }
  ];

  if (!visible || choiceMade) return null;

  return (
    <>
      {/* Backdrop */}
      {visible && (
        <div 
          className={`fixed inset-0 bg-black/50 backdrop-blur-sm z-9998 transition-opacity duration-300 ${
            animatingOut ? "opacity-0" : "opacity-100"
          }`}
          onClick={handleClose}
        />
      )}

      {/* Cookie Consent */}
      <div
        className={`fixed inset-x-0 bottom-0 flex justify-center z-9999 transition-all duration-300 ${
          animatingOut
            ? "translate-y-full opacity-0"
            : "translate-y-0 opacity-100"
        }`}
      >
        <div className="card w-full max-w-4xl bg-linear-to-br from-base-100 to-base-200 shadow-2xl border border-base-300/30 rounded-t-2xl md:rounded-2xl m-4 md:mb-8 backdrop-blur-lg">
          <div className="card-body p-6 md:p-8">
            {/* Header */}
            <div className="flex justify-between items-start gap-4 mb-6">
              <div className="flex items-start gap-4 flex-1">
                <div className="p-3 rounded-2xl bg-primary/10 text-primary shadow-lg">
                  <Shield className="w-6 h-6" />
                </div>
                <div className="flex-1">
                  <h3 className="text-2xl font-bold bg-linear-to-r from-base-content to-base-content/70 bg-clip-text text-transparent">
                    {t("Your Privacy Matters")}
                  </h3>
                  <p className="text-base-content/70 text-lg mt-2 leading-relaxed">
                    {t(
                      "We use cookies to enhance your browsing experience, analyze site traffic, and personalize content. Choose your preferences below."
                    )}
                  </p>
                </div>
              </div>

              <button
                onClick={handleClose}
                className="btn btn-ghost btn-circle hover:bg-base-200/70 transition-all duration-200 hover:scale-110"
                aria-label={t("Close")}
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Cookie Settings Toggle */}
            {!showSettings && (
              <div className="bg-base-200/50 rounded-2xl p-4 border border-base-300/20 mb-6">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <Settings className="w-5 h-5 text-info" />
                    <span className="font-semibold text-base-content">
                      {t("Customize your cookie preferences")}
                    </span>
                  </div>
                  <button
                    onClick={() => setShowSettings(true)}
                    className="btn btn-outline btn-sm rounded-lg hover:scale-105 transition-transform"
                  >
                    {t("Customize")}
                  </button>
                </div>
              </div>
            )}

            {/* Detailed Cookie Settings */}
            {showSettings && (
              <div className="space-y-4 mb-6 animate-fade-in">
                <div className="flex items-center gap-3 mb-4">
                  <Cookie className="w-5 h-5 text-primary" />
                  <h4 className="font-bold text-lg text-base-content">
                    {t("Cookie Preferences")}
                  </h4>
                </div>
                
                <div className="grid gap-4">
                  {cookieTypes.map((cookie) => (
                    <div 
                      key={cookie.id}
                      className={`flex items-start gap-4 p-4 rounded-xl border-2 transition-all duration-200 ${
                        cookiePreferences[cookie.id] 
                          ? "border-primary/30 bg-primary/5" 
                          : "border-base-300/30 bg-base-200/30"
                      }`}
                    >
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-1">
                          <h5 className="font-semibold text-base-content">
                            {cookie.title}
                          </h5>
                          {cookie.required && (
                            <span className="badge badge-sm badge-ghost text-xs">
                              {t("Required")}
                            </span>
                          )}
                        </div>
                        <p className="text-sm text-base-content/60 leading-relaxed">
                          {cookie.description}
                        </p>
                      </div>
                      
                      {!cookie.required ? (
                        <label className="cursor-pointer">
                          <input
                            type="checkbox"
                            checked={cookiePreferences[cookie.id]}
                            onChange={() => toggleCookiePreference(cookie.id)}
                            className="sr-only"
                          />
                          <div className={`w-12 h-6 rounded-full transition-all duration-200 ${
                            cookiePreferences[cookie.id] 
                              ? 'bg-primary' 
                              : 'bg-base-300'
                          }`}>
                            <div className={`w-5 h-5 bg-white rounded-full transition-transform duration-200 transform ${
                              cookiePreferences[cookie.id] 
                                ? 'translate-x-7' 
                                : 'translate-x-1'
                            } mt-0.5`} />
                          </div>
                        </label>
                      ) : (
                        <div className="p-2 rounded-lg bg-primary/10 text-primary">
                          <Check className="w-4 h-4" />
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Links */}
            <div className="flex flex-wrap items-center gap-4 text-sm text-base-content/60 mb-6">
              <Link
                href="/cookies-policy"
                className="link link-primary font-medium hover:scale-105 transition-transform flex items-center gap-1"
              >
                <Sparkles className="w-4 h-4" />
                {t("Cookies Policy")}
              </Link>
              <span className="hidden sm:inline">•</span>
              <Link
                href="/privacy-policy"
                className="link link-primary font-medium hover:scale-105 transition-transform"
              >
                {t("Privacy Policy")}
              </Link>
              <span className="hidden sm:inline">•</span>
              <Link
                href="/terms-conditions"
                className="link link-primary font-medium hover:scale-105 transition-transform"
              >
                {t("Terms & Conditions")}
              </Link>
            </div>

            {/* Action Buttons */}
            <div className="flex flex-col sm:flex-row gap-3 justify-end">
              <button
                onClick={handleRejectAll}
                className="btn btn-outline btn-lg rounded-xl hover:scale-105 transition-transform flex-1 sm:flex-none"
              >
                {t("Reject All")}
              </button>
              
              {showSettings ? (
                <button
                  onClick={handleAcceptSelected}
                  className="btn btn-primary btn-lg rounded-xl shadow-lg hover:shadow-xl transition-all duration-300 transform hover:scale-105 flex-1 sm:flex-none"
                >
                  {t("Accept Selected")}
                </button>
              ) : (
                <button
                  onClick={handleAcceptAll}
                  className="btn btn-primary btn-lg rounded-xl shadow-lg hover:shadow-xl transition-all duration-300 transform hover:scale-105 flex-1 sm:flex-none"
                >
                  {t("Accept All")}
                </button>
              )}
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

export default CookieConsent;