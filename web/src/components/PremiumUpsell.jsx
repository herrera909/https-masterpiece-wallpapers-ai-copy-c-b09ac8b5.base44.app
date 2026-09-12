import React, { useState } from "react";
import { Crown, Check, Loader2 } from "lucide-react";
import { useToast } from "@/components/ui/use-toast";
import { startPremiumCheckout } from "@/lib/premiumCheckout";

const BENEFITS = [
  "Unlimited wallpaper downloads",
  "No ads — generate and download instantly",
  "Support the app's development"
];

export default function PremiumUpsell({ premium, onSubscribed }) {
  const [busy, setBusy] = useState(false);
  const { toast } = useToast();

  const subscribe = async () => {
    setBusy(true);
    try {
      const result = await startPremiumCheckout();
      // Web checkout redirects and never resolves — busy stays true while navigating.
      // Google Play resolves in-app: confirm the purchase, refresh premium, celebrate.
      if (result?.premium) {
        await onSubscribed?.();
        toast({ title: "Premium activated 👑" });
        setBusy(false);
      }
    } catch (e) {
      // A cancelled Google Play purchase isn't an error — just reset quietly.
      const cancelled = /cancelled/i.test(e?.message || "");
      if (!cancelled) {
        console.error(e);
        toast({ title: "Could not start checkout. Try again.", variant: "destructive" });
      }
      setBusy(false);
    }
  };

  if (premium) {
    return (
      <div className="mx-auto flex max-w-xl items-center justify-center gap-3 rounded-3xl border border-fuchsia-400/30 bg-fuchsia-500/10 px-6 py-5">
        <Crown className="h-5 w-5 shrink-0 text-fuchsia-300" />
        <p className="text-sm font-semibold text-white">
          Premium is active — unlimited downloads, zero ads.
        </p>
      </div>
    );
  }

  return (
    <div className="relative mx-auto max-w-xl overflow-hidden rounded-3xl border border-white/10 bg-white/5 p-6 backdrop-blur-xl sm:p-8">
      <div
        className="pointer-events-none absolute -top-20 -right-20 h-48 w-48 rounded-full opacity-40 blur-3xl"
        style={{ background: "radial-gradient(circle, #FF00FF, transparent 70%)" }}
      />
      <div className="relative">
        <div className="flex items-center gap-3">
          <div
            className="grid h-11 w-11 place-items-center rounded-2xl"
            style={{ background: "linear-gradient(135deg, #00E5FF, #8A2BE2, #FF00FF)" }}
          >
            <Crown className="h-5 w-5 text-white" />
          </div>
          <div>
            <h2 className="text-lg font-bold tracking-wide text-white">Masterpiece Premium</h2>
            <p className="text-xs text-white/50">The full experience, ad-free</p>
          </div>
          <span className="ml-auto rounded-full bg-fuchsia-500/20 px-3 py-1 text-sm font-black text-fuchsia-200">
            $9.99<span className="text-xs font-medium text-white/50">/mo</span>
          </span>
        </div>

        <ul className="mt-5 space-y-2.5">
          {BENEFITS.map((b) => (
            <li key={b} className="flex items-center gap-2 text-sm text-white/70">
              <Check className="h-4 w-4 shrink-0 text-cyan-300" />
              {b}
            </li>
          ))}
        </ul>

        <button
          onClick={subscribe}
          disabled={busy}
          className="mt-6 flex w-full select-none items-center justify-center gap-2 rounded-2xl py-4 text-sm font-bold text-white transition-all hover:scale-[1.01] disabled:opacity-70"
          style={{ background: "linear-gradient(135deg, #00E5FF, #8A2BE2, #FF00FF)" }}
        >
          {busy ? (
            <>
              <Loader2 className="h-5 w-5 animate-spin" /> Opening checkout…
            </>
          ) : (
            <>
              <Crown className="h-5 w-5" /> Subscribe — $9.99/month
            </>
          )}
        </button>
        <p className="mt-3 text-center text-xs text-white/40">
          Cancel anytime. Secure checkout by Base44 Payments.
        </p>
      </div>
    </div>
  );
}