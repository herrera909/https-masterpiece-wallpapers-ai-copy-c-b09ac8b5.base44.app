import React, { useEffect } from "react";
import { Link } from "react-router-dom";
import { Loader2, CheckCircle2, Crown } from "lucide-react";
import StarfieldBackground from "@/components/StarfieldBackground";
import Logo from "@/components/Logo";
import usePremium from "@/hooks/usePremium";

export default function ThankYou() {
  const { premium, loggedIn, refresh } = usePremium();

  // Poll until the payment webhook confirms the subscription.
  useEffect(() => {
    if (premium) return;
    const interval = setInterval(refresh, 3000);
    const stop = setTimeout(() => clearInterval(interval), 60000);
    return () => {
      clearInterval(interval);
      clearTimeout(stop);
    };
  }, [premium, refresh]);

  return (
    <div className="flex min-h-screen flex-col items-center justify-center px-4 text-white">
      <StarfieldBackground />
      <div className="w-full max-w-md rounded-3xl border border-white/10 bg-white/5 p-8 text-center backdrop-blur-xl">
        <div className="flex justify-center">
          <Logo size="md" />
        </div>

        {premium ? (
          <>
            <CheckCircle2 className="mx-auto mt-6 h-12 w-12 text-cyan-300" />
            <h1 className="mt-4 text-2xl font-black">You're Premium!</h1>
            <p className="mt-2 text-sm text-white/60">
              Enjoy unlimited downloads and zero ads. Thank you for supporting Masterpiece!
            </p>
            <Link
              to="/"
              className="mt-6 inline-block rounded-full px-6 py-3 text-sm font-bold text-white transition-all hover:scale-[1.02]"
              style={{ background: "linear-gradient(135deg, #00E5FF, #8A2BE2, #FF00FF)" }}
            >
              Start Creating
            </Link>
          </>
        ) : !loggedIn ? (
          <>
            <Crown className="mx-auto mt-6 h-12 w-12 text-fuchsia-300" />
            <h1 className="mt-4 text-2xl font-black">Almost there</h1>
            <p className="mt-2 text-sm text-white/60">
              Log in with the email you paid with to activate your Premium benefits.
            </p>
            <Link
              to="/login"
              className="mt-6 inline-block rounded-full border border-white/15 bg-white/5 px-6 py-3 text-sm font-semibold text-white/80 transition-colors hover:bg-white/10"
            >
              Log In
            </Link>
          </>
        ) : (
          <>
            <Loader2 className="mx-auto mt-6 h-12 w-12 animate-spin text-cyan-300" />
            <h1 className="mt-4 text-2xl font-black">Confirming your payment…</h1>
            <p className="mt-2 text-sm text-white/60">
              This usually takes a few seconds. This page updates automatically — no need to refresh.
            </p>
          </>
        )}
      </div>
    </div>
  );
}