import { useCallback, useEffect, useState } from "react";

export type ThemeChoice = "system" | "light" | "dark";
const STORAGE_KEY = "bia-theme";

export function useTheme() {
  const [choice, setChoice] = useState<ThemeChoice>(() => readStoredTheme());
  useEffect(() => subscribeToSystem(() => setChoice(readStoredTheme())), []);
  const setTheme = useCallback((next: ThemeChoice) => {
    try {
      localStorage.setItem(STORAGE_KEY, next);
    } catch {
      // storage unavailable (private mode): session-only choice
    }
    applyTheme(next);
    setChoice(next);
  }, []);
  return { choice, setTheme };
}

export function readStoredTheme(): ThemeChoice {
  try {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (stored === "light" || stored === "dark" || stored === "system") return stored;
  } catch {
    // storage unavailable: fall through to system default
  }
  return "system";
}

function systemPrefersDark() {
  return typeof matchMedia !== "undefined" && matchMedia("(prefers-color-scheme: dark)").matches;
}

export function applyTheme(choice: ThemeChoice) {
  const dark = choice === "dark" || (choice === "system" && systemPrefersDark());
  document.documentElement.classList.toggle("dark", dark);
}

function subscribeToSystem(onChange: () => void) {
  if (typeof matchMedia === "undefined") return () => undefined;
  const media = matchMedia("(prefers-color-scheme: dark)");
  const listener = () => {
    if (readStoredTheme() === "system") {
      applyTheme("system");
      onChange();
    }
  };
  media.addEventListener("change", listener);
  return () => media.removeEventListener("change", listener);
}
