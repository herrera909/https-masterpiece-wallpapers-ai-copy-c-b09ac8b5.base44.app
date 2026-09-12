import { useEffect } from "react";

// Syncs the app theme with the system dark-mode setting (auto-switches on Android/iOS
// when the device toggles Dark Mode), keeping the `dark` class on <html> in sync.
export default function ThemeSync() {
  useEffect(() => {
    const media = window.matchMedia("(prefers-color-scheme: dark)");

    const apply = (dark) => {
      document.documentElement.classList.toggle("dark", dark);
      document.documentElement.style.colorScheme = dark ? "dark" : "light";
    };

    apply(media.matches);
    const onChange = (e) => apply(e.matches);
    media.addEventListener("change", onChange);
    return () => media.removeEventListener("change", onChange);
  }, []);

  return null;
}