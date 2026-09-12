import React, { useEffect, useState } from "react";
import { PlayCircle, Crown, X, Loader2, Tv } from "lucide-react";
import nativeAds from "@/lib/nativeAds";

const AD_SECONDS = 5;

// Ad gate for free users. On native Android a REAL AdMob rewarded ad plays and
// the gated action is granted ONLY from the earned-reward callback. On the
// website a short simulated placeholder plays (no AdMob SDK calls in browser).
export default function AdGateModal({ open, title, description, onComplete, onClose, onUpgrade }) {
  const isNative = nativeAds.isNativeAndroid();
  const [seconds, setSeconds] = useState(AD_SECONDS);
  const [watching, setWatching] = useState(false);
  const [noReward, setNoReward] = useState(false);
  const done = seconds === 0;

  // Website fallback: simulated placeholder countdown (native bypasses this)
  useEffect(() => {
    if (!open || isNative) return;
    setSeconds(AD_SECONDS);
    const timer = setInterval(() => {
      setSeconds((s) => {
        if (s <= 1) {
          clearInterval(timer);
          return 0;
        }
        return s - 1;
      });
    }, 1000);
    return () => clearInterval(timer);
  }, [open, isNative]);

  useEffect(() => {
    if (open) {
      setWatching(false);
      setNoReward(false);
    }
  }, [open]);

  const watchAd = () => {
    setWatching(true);
    setNoReward(false);
    nativeAds.showRewarded({
      // Granted only when AdMob fires the earned-reward callback
      onRewarded: onComplete,
      onDismissed: () => {
        setWatching(false);
        setNoReward(true);
      }
    });
  };

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 p-4 backdrop-blur-sm">
      <div className="relative w-full max-w-sm rounded-3xl border border-white/10 bg-[#0B0B2E] p-6 text-center shadow-[0_0_60px_rgba(138,43,226,0.4)]">
        <button
          onClick={onClose}
          disabled={watching}
          className="absolute right-4 top-4 grid h-8 w-8 select-none place-items-center rounded-full border border-white/10 bg-white/5 text-white/60 transition-colors hover:text-white disabled:opacity-40"
        >
          <X className="h-4 w-4" />
        </button>

        <p className="text-[10px] font-semibold tracking-[0.35em] text-white/40">ADVERTISEMENT</p>

        {isNative ? (
          <>
            <div className="mx-auto mt-4 flex aspect-video w-full items-center justify-center rounded-2xl border border-white/10 bg-black/40">
              {watching ? (
                <Loader2 className="h-10 w-10 animate-spin text-cyan-300" />
              ) : (
                <Tv className="h-12 w-12 text-white/70" />
              )}
            </div>

            <h3 className="mt-4 text-base font-bold text-white">{title}</h3>
            <p className="mt-1 text-xs text-white/50">{description}</p>

            {noReward && !watching && (
              <p className="mt-2 text-xs text-rose-300">
                The ad wasn't completed — watch it fully to unlock.
              </p>
            )}

            <button
              onClick={watchAd}
              disabled={watching}
              className="mt-5 w-full rounded-2xl py-3 text-sm font-bold text-white transition-all hover:scale-[1.02] disabled:cursor-not-allowed disabled:opacity-70"
              style={{ background: "linear-gradient(135deg, #00E5FF, #8A2BE2, #FF00FF)" }}
            >
              {watching ? (
                <span className="flex select-none items-center justify-center gap-2">
                  <Loader2 className="h-4 w-4 animate-spin" /> Ad playing…
                </span>
              ) : (
                "Watch ad to continue"
              )}
            </button>
          </>
        ) : (
          <>
            <div
              className="mx-auto mt-4 flex aspect-video w-full items-center justify-center rounded-2xl"
              style={{ background: "linear-gradient(135deg, #8A2BE2, #00E5FF)" }}
            >
              <PlayCircle className="h-12 w-12 text-white/90" />
            </div>

            <h3 className="mt-4 text-base font-bold text-white">{title}</h3>
            <p className="mt-1 text-xs text-white/50">{description}</p>

            {done ? (
              <button
                onClick={onComplete}
                className="mt-5 w-full rounded-2xl py-3 text-sm font-bold text-white transition-all hover:scale-[1.02]"
                style={{ background: "linear-gradient(135deg, #00E5FF, #8A2BE2, #FF00FF)" }}
              >
                Continue
              </button>
            ) : (
              <div className="mt-5 rounded-2xl border border-white/10 bg-black/40 py-3 text-sm text-white/60">
                Unlocks in {seconds}s…
              </div>
            )}
          </>
        )}

        <button
          onClick={onUpgrade}
          className="mt-3 flex w-full select-none items-center justify-center gap-2 rounded-2xl border border-fuchsia-400/40 bg-fuchsia-500/10 py-3 text-sm font-semibold text-fuchsia-200 transition-colors hover:bg-fuchsia-500/20"
        >
          <Crown className="h-4 w-4" /> Go Premium — no ads, $9.99/mo
        </button>
      </div>
    </div>
  );
}