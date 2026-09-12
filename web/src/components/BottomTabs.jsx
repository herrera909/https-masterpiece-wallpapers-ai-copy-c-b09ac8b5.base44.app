import React from "react";
import { Wand2, Images, Settings } from "lucide-react";

const TABS = [
  { id: "create", label: "Create", icon: Wand2 },
  { id: "gallery", label: "Gallery", icon: Images },
  { id: "settings", label: "Settings", icon: Settings }
];

export default function BottomTabs({ active, onChange }) {
  return (
    <nav className="fixed bottom-0 left-0 right-0 z-40 border-t border-white/10 bg-[#050510]/85 pb-[env(safe-area-inset-bottom)] backdrop-blur-xl">
      <div className="mx-auto flex max-w-md items-stretch justify-around px-2 py-1.5">
        {TABS.map(({ id, label, icon: Icon }) => (
          <button
            key={id}
            onClick={() => onChange(id)}
            aria-label={label}
            className={`flex select-none flex-1 flex-col items-center gap-1 rounded-xl px-2 py-1.5 text-[10px] font-semibold tracking-wide transition-colors ${
              active === id ? "text-white" : "text-white/40 hover:text-white/70"
            }`}
          >
            <span
              className={`grid h-7 w-14 place-items-center rounded-full transition-all ${
                active === id ? "bg-fuchsia-500/25 shadow-[0_0_16px_rgba(138,43,226,0.5)]" : ""
              }`}
            >
              <Icon className={`h-5 w-5 ${active === id ? "text-fuchsia-300" : ""}`} />
            </span>
            {label}
          </button>
        ))}
      </div>
    </nav>
  );
}