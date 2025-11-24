"use client";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";

export default function ConstructionPage() {
  const router = useRouter();
  const [allowed, setAllowed] = useState(false); // <– controls visibility
  const [loaded, setLoaded] = useState(false);   // <– prevents flash

  useEffect(() => {
    async function check() {
      const res = await fetch("/api/admin/settings/global", {
        cache: "no-store",
      });

      const json = await res.json();
      const settings = json.data;

      if (!settings.site_under_construction) {
        router.replace("/");
        return;
      }

      // allowed → now show UI
      setAllowed(true);
      setLoaded(true);
    }

    check();
  }, []);

  // ⭐ Prevent flash: return empty while checking.
  if (!loaded) return null;

  if (!allowed) return null;

  return (
    <div
      className="min-h-screen w-full bg-cover bg-center bg-no-repeat flex items-center justify-center relative px-4 sm:px-6"
      style={{
        backgroundImage: "url('/assets/images/constructionBg.jpg')",
      }}
    >
      <div className="absolute inset-0 bg-black/60 backdrop-blur-sm"></div>

      <div
        className="
          relative bg-white/10 backdrop-blur-2xl 
          p-8 sm:p-10 md:p-12 
          rounded-3xl shadow-xl max-w-lg w-full text-center 
          border border-white/20
          transition-all duration-300
          hover:bg-white/20 hover:border-white/30
        "
      >
        <div className="absolute -inset-3 rounded-3xl bg-yellow-500/10 blur-2xl -z-10"></div>

        <div className="flex justify-center mb-6 sm:mb-8">
          <div className="bg-yellow-400 text-black p-4 rounded-xl shadow-lg transform -rotate-2">
            <span className="text-5xl">🚧</span>
          </div>
        </div>

        <h1 className="text-4xl sm:text-5xl font-extrabold text-white tracking-tight mb-4">
          Under Construction
        </h1>

        <p className="text-white/80 text-base sm:text-lg font-light leading-relaxed mb-6 sm:mb-10">
          We're working hard to launch something amazing. Please check back soon.
        </p>

        <div className="flex justify-center">
          <div className="w-10 h-10 border-4 border-yellow-400 border-t-transparent rounded-full animate-spin"></div>
        </div>

        <div className="mt-8 text-white/60 text-xs flex items-center justify-center gap-2">
          <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
            <path d="M10 2a1 1 0 01.894.553l7 14A1 1 0 0117 18H3a1 1 0 01-.894-1.447l7-14A1 1 0 0110 2z" />
          </svg>
          High security • Maintenance mode active
        </div>
      </div>
    </div>
  );
}
