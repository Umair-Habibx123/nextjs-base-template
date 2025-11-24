"use client";
import { useState, useEffect } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import { useSessionRedirect } from "../../../hooks/useSessionRedirect";

export default function PasswordPage() {
  // -----------------------
  // HOOKS MUST ALWAYS RUN
  // -----------------------
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  const [allowed, setAllowed] = useState(false);
  const [loaded, setLoaded] = useState(false);

  const search = useSearchParams();
  const router = useRouter();
  const { setRedirectUrl, getRedirectUrl, clearRedirectUrl } =
    useSessionRedirect();

  // 1) Check password protection status
  useEffect(() => {
    async function check() {
      const res = await fetch("/api/admin/settings/global", {
        cache: "no-store",
      });

      const json = await res.json();
      const settings = json.data;

      if (!settings.site_password_enabled) {
        router.replace("/");
        return;
      }

      setAllowed(true);
      setLoaded(true);
    }

    check();
  }, []);

  // 2) Save redirect URL (this must always run, even if hidden)
  useEffect(() => {
    const encoded = search.get("return");
    if (encoded) {
      const decoded = Buffer.from(encoded, "base64").toString("utf8");
      setRedirectUrl(decoded);
    }
  }, []);

  // 3) Submit handler
  const submit = async (e) => {
    e.preventDefault();
    setIsLoading(true);

    const res = await fetch("/api/password", {
      method: "POST",
      body: JSON.stringify({ password }),
    });

    if (res.ok) {
      const url = getRedirectUrl();
      clearRedirectUrl();
      window.location.replace(url || "/");
    } else {
      setError("Incorrect password");
    }

    setIsLoading(false);
  };

  // -----------------------
  // PREVENT FLICKER
  // -----------------------
  if (!loaded || !allowed) return null;

  return (
    <div
      className="min-h-screen w-full bg-cover bg-center bg-no-repeat flex items-center justify-center relative px-4 sm:px-6"
      style={{
        backgroundImage: "url('/assets/images/passwordBg.webp')",
      }}
    >
      {/* Background Overlay */}
      <div className="absolute inset-0 bg-black/40 backdrop-blur-sm"></div>

      {/* Responsive Panel */}
      <div
        className="
          relative
          bg-white/10 backdrop-blur-3xl 
          p-8 sm:p-10 md:p-12 
          rounded-3xl shadow-xl 
          w-full 
          max-w-sm sm:max-w-md md:max-w-lg lg:max-w-xl 
          text-center border border-white/15 
          transition-all duration-300 
          hover:bg-white/20 hover:border-white/25
        "
      >
        <div className="absolute -inset-3 rounded-3xl bg-blue-500/10 blur-2xl -z-10"></div>

        <h1
          className="
            text-4xl sm:text-5xl md:text-6xl 
            font-bold bg-linear-to-r 
            from-white to-gray-300 bg-clip-text text-transparent 
            mb-4 sm:mb-6 
            tracking-tight 
          "
        >
          Enter Password
        </h1>

        <p className="text-white/90 text-base sm:text-lg mb-6 sm:mb-10 font-light tracking-wide">
          Unlock exclusive content with your secure password
        </p>

        {/* Form */}
        <form onSubmit={submit} className="flex flex-col gap-3 sm:gap-4 w-full">
          <div className="flex flex-col sm:flex-row gap-3 justify-center w-full">
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Enter your password"
              className="
                input input-bordered 
                w-full bg-white/80 border-white/30 
                focus:border-cyan-400 focus:ring-2 
                focus:ring-cyan-400/40 
                transition-all duration-300 
                rounded-xl py-3 px-4 text-gray-800
              "
            />

            <button
              className={`
                btn 
                bg-linear-to-r from-blue-500 to-purple-500 
                border-0 rounded-xl px-8 font-semibold 
                transition-all duration-300 
                hover:scale-105 active:scale-95 
                text-white 
                ${isLoading ? "loading" : ""}
              `}
              disabled={isLoading}
            >
              {!isLoading ? "Enter" : ""}
            </button>
          </div>

          {error && (
            <div className="flex items-center justify-center gap-2 text-red-400 text-sm mt-1 animate-pulse">
              <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                <path
                  fillRule="evenodd"
                  d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z"
                  clipRule="evenodd"
                />
              </svg>
              {error}
            </div>
          )}
        </form>

        <button
          className="
            btn btn-outline btn-info 
            mt-8 sm:mt-10 
            rounded-xl border-2 
            border-cyan-400/50 text-cyan-300 
            hover:bg-cyan-400/20 hover:border-cyan-400 hover:text-white 
            duration-300 w-full sm:w-auto mx-auto
          "
        >
          Contact Us
        </button>

        <div className="mt-6 flex items-center justify-center gap-2 text-white/60 text-xs">
          <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
            <path
              fillRule="evenodd"
              d="M5 9V7a5 5 0 0110 0v2a2 2 0 012 2v5a2 2 0 01-2 2H5a2 2 0 01-2-2v-5a2 2 0 012-2zm8-2v2H7V7a3 3 0 016 0z"
              clipRule="evenodd"
            />
          </svg>
          Secure Access • Encrypted Connection
        </div>
      </div>
    </div>
  );
}
