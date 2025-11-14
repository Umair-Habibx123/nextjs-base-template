"use client";
import React, { createContext, useContext, useEffect, useState } from "react";

const ThemeContext = createContext();

export const ThemeProvider = ({ children }) => {
  const [theme, setTheme] = useState("retro");
  const [previewTheme, setPreviewTheme] = useState(null);
  const [mounted, setMounted] = useState(false);
  const [availableThemes, setAvailableThemes] = useState(["light", "dark"]);
  const [customThemes, setCustomThemes] = useState({});
  const [visibleThemes, setVisibleThemes] = useState({});


  const defaultThemeSchema = {
    "--color-base-100": "#ffffff",
    "--color-base-200": "#f5f5f5",
    "--color-base-300": "#e5e5e5",
    "--color-base-content": "#1f2937",
    "--color-primary": "#4f46e5",
    "--color-secondary": "#22c55e",
    "--color-accent": "#f59e0b",
    "--color-neutral": "#3d4451",
    "--radius-box": "1rem",
    "--radius-field": "0.5rem",
    "--radius-selector": "0.25rem",
    "--border": "1px",
    "--depth": "1",
    "--noise": "0",
  };

  // ✅ NEW — Utility to apply vars live on <html> (global)
  const applyThemeVars = (vars) => {
    const root = document.documentElement;
    Object.entries(vars || {}).forEach(([key, value]) => {
      root.style.setProperty(key, value);
    });
  };

  async function fetchThemes() {
    const res = await fetch("/api/theme-settings", { cache: "no-store" });
    if (!res.ok) throw new Error("Failed to load themes");
    return res.json();
  }

  // ✅ Debounced DB save
  let saveTimer = null;
  const saveThemeToDbDebounced = (name, vars, visible = true) => {
    clearTimeout(saveTimer);
    saveTimer = setTimeout(() => {
      fetch("/api/theme-settings", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name, vars, visible }),
      }).catch((e) => console.error("Failed to save theme:", e));
    }, 600);
  };

  async function deleteThemeFromDb(name) {
    await fetch(`/api/theme-settings?name=${encodeURIComponent(name)}`, {
      method: "DELETE",
    });
  }

  useEffect(() => {
    if (typeof window === "undefined") return;
    if (mounted) return;

    let isLoading = false;
    const load = async () => {
      if (isLoading) return;
      isLoading = true;

      try {
        const savedTheme = localStorage.getItem("theme") || "light";
        const data = await fetchThemes();

        const dbThemes = {};
        const visibility = {};
        const allNames = ["light", "dark"];

        data.forEach((r) => {
          dbThemes[r.name] = JSON.parse(r.vars);
          visibility[r.name] = !!r.visible;
          injectCustomTheme(r.name, dbThemes[r.name]);
          allNames.push(r.name);
        });

        setCustomThemes(dbThemes);
        setVisibleThemes(visibility);
        setAvailableThemes(allNames);
        setTheme(savedTheme);
        if (!["light", "dark", ...Object.keys(dbThemes)].includes(savedTheme)) {
          setTheme("light");
        }

        setMounted(true);
      } catch (err) {
        console.error("Failed to load themes:", err);
      }
    };

    load();
  }, [mounted]);

  useEffect(() => {
    if (!mounted) return;
    localStorage.setItem("theme", theme);
    document.documentElement.setAttribute("data-theme", theme);
  }, [theme, mounted]);

  useEffect(() => {
  if (!mounted) return;

  // Always update the data-theme attr so DaisyUI built-ins apply instantly
  document.documentElement.setAttribute("data-theme", previewTheme || theme);

  // If it's a custom theme, apply vars
  const activeTheme = previewTheme || theme;
  if (customThemes[activeTheme]) {
    applyThemeVars(customThemes[activeTheme]);
  } else {
    // Reset inline vars so built-ins fully take over
    Object.keys(defaultThemeSchema).forEach((key) =>
      document.documentElement.style.removeProperty(key)
    );
  }
}, [previewTheme, theme, customThemes, mounted]);


  const addTheme = async (name, vars = {}) => {
    if (!name) return;
    const newVars = { ...defaultThemeSchema, ...vars };

    setCustomThemes((prev) => ({ ...prev, [name]: newVars }));
    setAvailableThemes((prev) => [...new Set([...prev, name])]);
    setVisibleThemes((prev) => ({ ...prev, [name]: true }));

    saveThemeToDbDebounced(name, newVars, true);
    injectCustomTheme(name, newVars);
  };

  const updateThemeVar = (name, key, value) => {
    setCustomThemes((prev) => {
      const updated = {
        ...prev,
        [name]: { ...prev[name], [key]: value },
      };
      injectCustomTheme(name, updated[name]);
      saveThemeToDbDebounced(name, updated[name], visibleThemes[name]);

      // ✅ NEW — Apply to root immediately if editing preview theme
      if (previewTheme === name) {
        applyThemeVars(updated[name]);
      }
      return updated;
    });
  };

  const toggleVisibility = (name) => {
    if (["light", "dark"].includes(name)) return;

    setVisibleThemes((prev) => {
      const newVal = !(prev[name] ?? true);
      saveThemeToDbDebounced(name, customThemes[name], newVal);

      if (!newVal && theme === name) {
        setTheme("light");
      }

      return { ...prev, [name]: newVal };
    });
  };

  const deleteTheme = async (name) => {
    if (["light", "dark"].includes(name)) return;

    setAvailableThemes((prev) => prev.filter((t) => t !== name));
    setCustomThemes((prev) => {
      const updated = { ...prev };
      delete updated[name];
      return updated;
    });
    setVisibleThemes((prev) => {
      const updated = { ...prev };
      delete updated[name];
      return updated;
    });

    const styleEl = document.getElementById(`theme-${name}`);
    if (styleEl) styleEl.remove();

    if (theme === name || previewTheme === name) {
      setTheme("light");
      setPreviewTheme(null);
      document.documentElement.setAttribute("data-theme", "light");
      localStorage.setItem("theme", "light");
    }

    await deleteThemeFromDb(name);
  };

  const saveTheme = (name) => {
    if (customThemes[name]) {
      saveThemeToDbDebounced(name, customThemes[name], visibleThemes[name]);
    }
  };

  const renameTheme = async (oldName, newName) => {
  if (!oldName || !newName || ["light", "dark"].includes(oldName)) return;

  // Prevent duplicate names
  if (customThemes[newName]) {
    throw new Error("Theme name already exists");
  }

  const themeVars = customThemes[oldName];
  if (!themeVars) return;

  // ✅ Update DB
  const res = await fetch("/api/theme-settings", {
    method: "PATCH",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ oldName, newName }),
  });

  if (!res.ok) {
    const err = await res.json();
    throw new Error(err.error || "Failed to rename theme in DB");
  }

  // ✅ Update local state (immutably)
  setCustomThemes((prev) => {
    const updated = { ...prev };
    delete updated[oldName];
    updated[newName] = themeVars;
    return updated;
  });

  setAvailableThemes((prev) => {
    const updated = prev.filter((t) => t !== oldName);
    return [...updated, newName];
  });

  setVisibleThemes((prev) => {
    const updated = { ...prev };
    updated[newName] = prev[oldName];
    delete updated[oldName];
    return updated;
  });

  // ✅ Update DOM <style> reference
  const styleEl = document.getElementById(`theme-${oldName}`);
  if (styleEl) styleEl.id = `theme-${newName}`;

  // ✅ Reapply the theme vars so preview stays correct
  injectCustomTheme(newName, themeVars);

  if (theme === oldName) setTheme(newName);
  if (previewTheme === oldName) setPreviewTheme(newName);
};


  const injectCustomTheme = (name, cssVars) => {
    if (typeof document === "undefined") return;
    let styleEl = document.getElementById(`theme-${name}`);

    if (!styleEl) {
      styleEl = document.createElement("style");
      styleEl.id = `theme-${name}`;
      document.head.appendChild(styleEl);
    }

    const cssText = `[data-theme='${name}'] {
      ${Object.entries(cssVars)
        .map(([k, v]) => `${k}: ${v};`)
        .join("\n")}
    }`;

    if (styleEl.textContent !== cssText) {
      styleEl.textContent = cssText;
    }
  };

  return (
    <ThemeContext.Provider
      value={{
        theme,
        previewTheme,
        setTheme,
        setPreviewTheme,
        availableThemes,
        customThemes,
        visibleThemes,
        addTheme,
        deleteTheme,
        updateThemeVar,
        toggleVisibility,
        saveTheme,
        mounted,
        applyThemeVars, 
         renameTheme,
      }}
    >
      {children}
    </ThemeContext.Provider>
  );
};

export const useTheme = () => useContext(ThemeContext);
