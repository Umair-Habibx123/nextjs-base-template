import i18n from "i18next";
import { initReactI18next } from "react-i18next";

let translationsLoaded = false;
let translationsReadyPromiseResolve;
export const translationsReadyPromise = new Promise((resolve) => {
  translationsReadyPromiseResolve = resolve;
});

i18n.use(initReactI18next).init({
  resources: {},
  lng:
    typeof window !== "undefined" && localStorage.getItem("lang")
      ? localStorage.getItem("lang")
      : "english",
  fallbackLng: "english",
  interpolation: {
    escapeValue: false,
    prefix: "{{",
    suffix: "}}",
  },
});

async function loadTranslations() {
  if (typeof window === "undefined") return;

  try {
    const res = await fetch("/api/super-admin/languages");
    const data = await res.json();

    if (data.success && data.data) {
      for (const [lang, values] of Object.entries(data.data)) {
        i18n.addResourceBundle(lang, "translation", values, true, true);
      }

      const savedLang = localStorage.getItem("lang") || "english";
      i18n.changeLanguage(savedLang);
      translationsLoaded = true;
      translationsReadyPromiseResolve(true);
      console.log("✅ Translations loaded dynamically:", Object.keys(data.data));
    }
  } catch (err) {
    console.error("❌ Failed to load dynamic translations", err);
  }
}

loadTranslations();

if (typeof window !== "undefined") {
  window.addEventListener("translationsUpdated", loadTranslations);
}

export { translationsLoaded };
export default i18n;
