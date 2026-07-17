import React, { useEffect, useState } from "react";
import { Sun, Moon, Laptop } from "lucide-react";

export default function ThemeSwitcher() {
  const [theme, setTheme] = useState<"light" | "dark" | "system">(() => {
    return (localStorage.getItem("nammapro_theme") as "light" | "dark" | "system") || "system";
  });

  useEffect(() => {
    const root = window.document.documentElement;
    const systemTheme = window.matchMedia("(prefers-color-scheme: dark)").matches ? "dark" : "light";
    const activeTheme = theme === "system" ? systemTheme : theme;

    root.classList.remove("light", "dark");
    root.classList.add(activeTheme);
    localStorage.setItem("nammapro_theme", theme);
  }, [theme]);

  // Sync theme changes with system changes if "system" is active
  useEffect(() => {
    if (theme !== "system") return;

    const mediaQuery = window.matchMedia("(prefers-color-scheme: dark)");
    const handleChange = (e: MediaQueryListEvent) => {
      const root = window.document.documentElement;
      root.classList.remove("light", "dark");
      root.classList.add(e.matches ? "dark" : "light");
    };

    mediaQuery.addEventListener("change", handleChange);
    return () => mediaQuery.removeEventListener("change", handleChange);
  }, [theme]);

  return (
    <div className="flex items-center gap-1 bg-slate-100 dark:bg-slate-800 p-1 rounded-full border border-slate-200 dark:border-slate-700/60 shadow-inner">
      <button
        id="theme-light-btn"
        onClick={() => setTheme("light")}
        className={`p-1.5 rounded-full transition-all duration-300 ${
          theme === "light"
            ? "bg-white text-yellow-500 shadow-sm scale-110"
            : "text-slate-400 dark:text-slate-500 hover:text-slate-600 dark:hover:text-slate-300"
        }`}
        title="Light Mode"
      >
        <Sun className="w-4 h-4" />
      </button>

      <button
        id="theme-dark-btn"
        onClick={() => setTheme("dark")}
        className={`p-1.5 rounded-full transition-all duration-300 ${
          theme === "dark"
            ? "bg-slate-900 text-indigo-400 shadow-sm scale-110"
            : "text-slate-400 dark:text-slate-500 hover:text-slate-600 dark:hover:text-slate-300"
        }`}
        title="Dark Mode"
      >
        <Moon className="w-4 h-4" />
      </button>

      <button
        id="theme-system-btn"
        onClick={() => setTheme("system")}
        className={`p-1.5 rounded-full transition-all duration-300 ${
          theme === "system"
            ? "bg-white dark:bg-slate-900 text-teal-500 shadow-sm scale-110"
            : "text-slate-400 dark:text-slate-500 hover:text-slate-600 dark:hover:text-slate-300"
        }`}
        title="System Preference"
      >
        <Laptop className="w-4 h-4" />
      </button>
    </div>
  );
}
