import React from "react";

export default function Logo({ size = "md" }) {
  const sizes = {
    sm: { box: "h-9 w-9", glyph: "text-lg", title: "text-base", sub: "text-[8px]" },
    md: { box: "h-12 w-12", glyph: "text-2xl", title: "text-xl", sub: "text-[9px]" },
    lg: { box: "h-16 w-16", glyph: "text-3xl", title: "text-3xl", sub: "text-[11px]" },
    xl: { box: "h-20 w-20", glyph: "text-4xl", title: "text-4xl", sub: "text-xs" }
  };
  const s = sizes[size];

  return (
    <div className="flex select-none items-center gap-3">
      <div
        className={`${s.box} relative rounded-2xl flex items-center justify-center overflow-hidden shrink-0`}
        style={{
          background: "linear-gradient(135deg, #00E5FF 0%, #8A2BE2 55%, #FF00FF 100%)",
          boxShadow: "0 0 24px rgba(138,43,226,0.55), inset 0 0 12px rgba(0,229,255,0.35)"
        }}
      >
        <span className={`${s.glyph} font-black text-white`} style={{ textShadow: "0 0 10px rgba(255,255,255,0.8)" }}>
          M
        </span>
      </div>
      <div className="flex flex-col leading-none">
        <span
          className={`${s.title} font-black tracking-[0.18em] text-white`}
          style={{ textShadow: "0 0 18px rgba(138,43,226,0.65)" }}
        >
          MASTERPIECE
        </span>
        <span className={`${s.sub} tracking-[0.55em] text-cyan-300/80 font-medium mt-1`}>
          WALLPAPER AI
        </span>
      </div>
    </div>
  );
}