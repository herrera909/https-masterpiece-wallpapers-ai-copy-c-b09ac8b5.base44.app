import React, { useEffect, useState } from "react";
import { Crown } from "lucide-react";

const AD_TEXT = {
  rewarded: {
    label: "Rewarded Ad",
    title: "Watch a short ad to generate your wallpaper",
    done: "Generate now"
  },
  video: {
    label: "Video Ad",
    title: "Watch a short video to download",
    done: "Download now"
  }
};

export default function AdOverlay({ variant = "rewarded", onDone, onUpgrade }) {
  const [secondsLeft, setSecondsLeft] = useState(5);
  const t = AD_TEXT[variant] || AD_TEXT.rewarded;

  useEffect(() => {
    if (secondsLeft <= 0) return;
    const timer = setTimeout(() => setSecondsLeft((s) => s - 1), 1000);
    return () => clearTimeout(timer);
  }, [secondsLeft]);

  const ready = secondsLeft <= 0;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 p-4 backdrop-blur-sm">
      <div
        className="w-full max-w-sm overflow-hidden rounded-3xl border border-white/10 bg-[#0B0B2E] shadow-[0_0_60px_rgba(138,43,226,0.5)]"
      >
        {/* Ad placeholder — real ad creative is served by the ad network once connected */}
        <div
          className="relative flex aspect-video items-center justify-center overflow-hidden"
          style={{ background: "linear-gradient(135deg, #170B3E, #0B0B2E)" }}
        >
          <div
            className="absolute inset-0 opacity-40"
            style={{ background: "radial-gradient(circle at 30% 30%, #8A2BE2, transparent 70%)" }}
          />
          <div className="relative flex flex-col items-center gap-2">
            <span
              className="bg-clip-text text-2xl font-black tracking-[0.2em] text-transparent"
              style={{ backgroundImage: "linear-gradient(135deg, #00E5FF, #FF00FF)" }}
            >
              YOUR AD HERE
            </span>
            <span className="text-xs text-white/40">Sponsored</span>
          </div>
          <div className="absolute top-3 left-3 rounded-full border border-white/15 bg-black/50 px-3 py-1 text-[10px] font-semibold uppercase tracking-wider text-white/80">
            {t.label}
          </div>
          <div className="absolute top-3 right-3 rounded-full border border-white/15 bg-black/50 px-3 py-1 text-xs font-semibold text-white/80">
            {ready ? "0:00" : `0:0${secondsLeft}`}
          </div>
        </div>

        <div className="p-5">
          <p className="text-sm font-bold text-white">{t.title}</p>

          <button
            onClick={onDone}
            disabled={!ready}
            className="mt-4 w-full rounded-2xl py-3.5 text-sm font-bold text-white transition-all disabled:cursor-not-allowed disabled:opacity-50"
            style={{
              background: ready
                ? "linear-gradient(135deg, #00E5FF, #8A2BE2, #FF00FF)"
                : "rgba(255,255,255,0.08)",
              boxShadow: ready ? "0 0 24px rgba(138,43,226,0.5)" : "none"
            }}
          >
            {ready ? t.done : `Please wait ${secondsLeft}s`}
          </button>

          <button
            onClick={onUpgrade}
            className="mt-4 flex w-full items-center justify-center gap-1.5 text-xs font-semibold text-cyan-300 transition-colors hover:text-cyan-200"
          >
            <Crown className="h-3.5 w-3.5" />
            Remove ads with Premium — $9.99/mo
          </button>
        </div>
      </div>
    </div>
  );
}