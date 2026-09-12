import React, { useRef, useState } from "react";
import { Link } from "react-router-dom";
import { Download, ArrowLeft, Loader2, CheckCircle2 } from "lucide-react";
import AppIcon from "@/components/AppIcon";
import StarfieldBackground from "@/components/StarfieldBackground";
import Logo from "@/components/Logo";
import { useToast } from "@/components/ui/use-toast";

export default function AppIconPage() {
  const svgRef = useRef(null);
  const [busy, setBusy] = useState(null);
  const { toast } = useToast();

  const exportPng = async (size) => {
    setBusy(size);
    try {
      const serialized = new XMLSerializer().serializeToString(svgRef.current);
      const svgBlob = new Blob([serialized], { type: "image/svg+xml;charset=utf-8" });
      const url = URL.createObjectURL(svgBlob);
      const img = new Image();
      await new Promise((resolve, reject) => {
        img.onload = resolve;
        img.onerror = reject;
        img.src = url;
      });
      const canvas = document.createElement("canvas");
      canvas.width = size;
      canvas.height = size;
      canvas.getContext("2d").drawImage(img, 0, 0, size, size);
      URL.revokeObjectURL(url);
      const pngUrl = canvas.toDataURL("image/png");
      const a = document.createElement("a");
      a.href = pngUrl;
      a.download = `masterpiece-app-icon-${size}.png`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      toast({ title: `Downloaded ${size}×${size} PNG` });
    } catch (e) {
      console.error(e);
      toast({ title: "Export failed. Try again.", variant: "destructive" });
    } finally {
      setBusy(null);
    }
  };

  return (
    <div className="min-h-screen text-white">
      <StarfieldBackground />

      <header className="sticky top-0 z-30 border-b border-white/5 bg-[#050510]/70 backdrop-blur-xl">
        <div className="mx-auto flex max-w-6xl items-center justify-between px-4 py-3 sm:px-6">
          <Logo size="sm" />
          <Link
            to="/"
            className="flex items-center gap-1.5 rounded-full border border-white/15 bg-white/5 px-4 py-2 text-xs font-semibold text-white/80 transition-colors hover:bg-white/10"
          >
            <ArrowLeft className="h-3.5 w-3.5" /> Back
          </Link>
        </div>
      </header>

      <main className="mx-auto max-w-6xl px-4 py-10 sm:px-6 sm:py-14">
        <div className="grid items-center gap-10 lg:grid-cols-2">
          {/* Large preview */}
          <div className="mx-auto w-full max-w-[300px]">
            <div className="relative">
              <div
                className="absolute -inset-5 rounded-[2.5rem] opacity-50 blur-2xl"
                style={{ background: "linear-gradient(135deg, #8A2BE2, #00F0FF, #FF00FF)" }}
              />
              <div className="relative overflow-hidden rounded-[2rem] border border-white/15 shadow-[0_0_50px_rgba(138,43,226,0.4)]">
                <AppIcon svgRef={svgRef} />
              </div>
            </div>

            {/* Launcher mask previews */}
            <div className="mt-6 flex items-end justify-center gap-5">
              <div className="text-center">
                <div className="h-16 w-16 overflow-hidden rounded-[1.15rem] border border-white/10">
                  <AppIcon id="mask-sq" />
                </div>
                <p className="mt-2 text-[10px] text-white/40">Squircle</p>
              </div>
              <div className="text-center">
                <div className="h-16 w-16 overflow-hidden rounded-full border border-white/10">
                  <AppIcon id="mask-ci" />
                </div>
                <p className="mt-2 text-[10px] text-white/40">Circle</p>
              </div>
              <div className="text-center">
                <div className="h-16 w-16 overflow-hidden rounded-lg border border-white/10">
                  <AppIcon id="mask-rd" />
                </div>
                <p className="mt-2 text-[10px] text-white/40">Rounded</p>
              </div>
            </div>
          </div>

          {/* Info + downloads */}
          <div>
            <h1
              className="text-3xl font-black tracking-tight sm:text-4xl"
              style={{ textShadow: "0 0 30px rgba(138,43,226,0.5)" }}
            >
              App <span
                className="bg-clip-text text-transparent"
                style={{ backgroundImage: "linear-gradient(135deg, #00F0FF, #8A2BE2, #FF00FF)" }}
              >
                Icon
              </span>
            </h1>
            <p className="mt-3 text-sm text-white/60">
              A neon-space emblem with the gradient Masterpiece "M" — designed
              to Google's specs so you won't hit issues at publish time.
            </p>

            <ul className="mt-5 space-y-2.5">
              {[
                "512×512 PNG — the exact size Google Play requires for the store listing",
                "Letter sits inside the adaptive-icon safe zone — circle and squircle launcher masks won't clip it",
                "Full-bleed square — the store applies its own corner rounding",
                "Also includes a 1024×1024 export for retina and future use"
              ].map((t) => (
                <li key={t} className="flex items-start gap-2 text-sm text-white/70">
                  <CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0 text-cyan-300" />
                  {t}
                </li>
              ))}
            </ul>

            <div className="mt-7 flex flex-col gap-3 sm:flex-row">
              <button
                onClick={() => exportPng(512)}
                disabled={busy !== null}
                className="flex items-center justify-center gap-2 rounded-2xl px-6 py-4 text-sm font-bold text-white transition-all hover:scale-[1.02] disabled:opacity-70"
                style={{
                  background: "linear-gradient(135deg, #00F0FF, #8A2BE2, #FF00FF)",
                  boxShadow: "0 0 24px rgba(138,43,226,0.5)"
                }}
              >
                {busy === 512 ? (
                  <Loader2 className="h-5 w-5 animate-spin" />
                ) : (
                  <Download className="h-5 w-5" />
                )}
                Download 512×512 PNG
              </button>
              <button
                onClick={() => exportPng(1024)}
                disabled={busy !== null}
                className="flex items-center justify-center gap-2 rounded-2xl border border-white/15 bg-white/5 px-6 py-4 text-sm font-semibold text-white/80 transition-colors hover:bg-white/10 disabled:opacity-70"
              >
                {busy === 1024 ? (
                  <Loader2 className="h-5 w-5 animate-spin" />
                ) : (
                  <Download className="h-5 w-5" />
                )}
                1024×1024
              </button>
            </div>

            <p className="mt-5 text-xs text-white/40">
              Upload the 512×512 file as your app icon in App Settings before
              publishing to the app stores.
            </p>
          </div>
        </div>
      </main>
    </div>
  );
}