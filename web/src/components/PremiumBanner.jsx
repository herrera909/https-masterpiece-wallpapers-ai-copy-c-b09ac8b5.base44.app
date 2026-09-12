import React from "react";
import { Crown, Infinity as InfinityIcon, ShieldCheck } from "lucide-react";

export default function PremiumBanner({ onUpgrade }) {
  return (
    <div
      className="relative overflow-hidden rounded-3xl border border-fuchsia-400/30 p-6 backdrop-blur-xl sm:p-7"
      style={{
        background:
          "linear-gradient(135deg, rgba(138,43,226,0.15), rgba(0,229,255,0.08) 60%, rgba(255,0,255,0.12))"
      }}
    >
      <div className="flex flex-col gap-5 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <div className="flex items-center gap-2">
            <Crown className="h-5 w-5 text-fuchsia-300" />
            <h3 className="text-lg font-black tracking-wide text-white">Go Premium</h3>
          </div>
          <div className="mt-3 space-y-1.5">
            <p className="flex items-center gap-2 text-sm text-white/70">
              <InfinityIcon className="h-4 w-4 shrink-0 text-cyan-300" />
              Unlimited wallpaper downloads
            </p>
            <p className="flex items-center gap-2 text-sm text-white/70">
              <ShieldCheck className="h-4 w-4 shrink-0 text-cyan-300" />
              No ads — ever
            </p>
          </div>
        </div>

        <div className="flex flex-col items-start gap-2 sm:items-end">
          <div className="flex items-baseline gap-1">
            <span className="text-3xl font-black text-white">$9.99</span>
            <span className="text-sm text-white/50">/month</span>
          </div>
          <button
            onClick={onUpgrade}
            className="rounded-full px-6 py-3 text-sm font-bold text-white transition-all hover:scale-[1.03]"
            style={{
              background: "linear-gradient(135deg, #00E5FF, #8A2BE2, #FF00FF)",
              boxShadow: "0 0 24px rgba(138,43,226,0.5)"
            }}
          >
            Upgrade Now
          </button>
        </div>
      </div>
    </div>
  );
}