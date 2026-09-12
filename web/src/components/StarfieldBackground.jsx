import React, { useMemo } from "react";

export default function StarfieldBackground() {
  const stars = useMemo(() => {
    return Array.from({ length: 70 }).map(() => ({
      top: Math.random() * 100,
      left: Math.random() * 100,
      size: Math.random() * 2 + 0.5,
      delay: Math.random() * 4,
      duration: Math.random() * 3 + 2,
      opacity: Math.random() * 0.6 + 0.2
    }));
  }, []);

  return (
    <div className="fixed inset-0 -z-10 overflow-hidden bg-[#050510]">
      {/* nebula glows */}
      <div
        className="absolute -top-40 -left-40 h-[40rem] w-[40rem] rounded-full blur-[120px] opacity-40"
        style={{ background: "radial-gradient(circle, #8A2BE2, transparent 70%)" }}
      />
      <div
        className="absolute top-1/3 -right-40 h-[36rem] w-[36rem] rounded-full blur-[120px] opacity-30"
        style={{ background: "radial-gradient(circle, #00E5FF, transparent 70%)" }}
      />
      <div
        className="absolute bottom-0 left-1/4 h-[32rem] w-[32rem] rounded-full blur-[120px] opacity-25"
        style={{ background: "radial-gradient(circle, #FF00FF, transparent 70%)" }}
      />
      {/* stars */}
      {stars.map((st, i) => (
        <span
          key={i}
          className="absolute rounded-full bg-white"
          style={{
            top: `${st.top}%`,
            left: `${st.left}%`,
            width: `${st.size}px`,
            height: `${st.size}px`,
            opacity: st.opacity,
            animation: `twinkle ${st.duration}s ease-in-out ${st.delay}s infinite`
          }}
        />
      ))}
      <style>{`
        @keyframes twinkle {
          0%, 100% { opacity: 0.15; transform: scale(1); }
          50% { opacity: 0.9; transform: scale(1.4); }
        }
      `}</style>
    </div>
  );
}