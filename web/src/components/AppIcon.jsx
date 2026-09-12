import React from "react";

const STARS = [
  { x: 70, y: 80, r: 2.4, o: 0.9 },
  { x: 140, y: 52, r: 1.6, o: 0.6 },
  { x: 430, y: 70, r: 2, o: 0.8 },
  { x: 470, y: 150, r: 1.4, o: 0.5 },
  { x: 60, y: 200, r: 1.5, o: 0.6 },
  { x: 452, y: 262, r: 1.7, o: 0.7 },
  { x: 90, y: 420, r: 2, o: 0.8 },
  { x: 420, y: 440, r: 1.5, o: 0.6 },
  { x: 200, y: 464, r: 1.3, o: 0.5 },
  { x: 330, y: 40, r: 1.5, o: 0.7 }
];

export default function AppIcon({ id = "ai", svgRef }) {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 512 512" ref={svgRef}>
      <defs>
        <linearGradient id={`${id}-bg`} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor="#0B0B2E" />
          <stop offset="1" stopColor="#170B3E" />
        </linearGradient>
        <linearGradient id={`${id}-letter`} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor="#00E5FF" />
          <stop offset="0.5" stopColor="#8A2BE2" />
          <stop offset="1" stopColor="#FF00FF" />
        </linearGradient>
        <radialGradient id={`${id}-glow`} cx="0.5" cy="0.42" r="0.6">
          <stop offset="0" stopColor="#8A2BE2" stopOpacity="0.55" />
          <stop offset="1" stopColor="#8A2BE2" stopOpacity="0" />
        </radialGradient>
        <filter id={`${id}-soft`} x="-60%" y="-60%" width="220%" height="220%">
          <feGaussianBlur stdDeviation="16" />
        </filter>
      </defs>

      {/* space background */}
      <rect width="512" height="512" fill={`url(#${id}-bg)`} />
      <rect width="512" height="512" fill={`url(#${id}-glow)`} />
      {STARS.map((s, i) => (
        <circle key={i} cx={s.x} cy={s.y} r={s.r} fill="#FFFFFF" opacity={s.o} />
      ))}

      {/* neon glow behind the M */}
      <text
        x="256" y="174" textAnchor="middle" dominantBaseline="central"
        fontFamily="'Arial Black', 'Arial Bold', Gadget, sans-serif"
        fontWeight="900" fontSize="130"
        fill="#00E5FF" opacity="0.65" filter={`url(#${id}-soft)`}
      >
        M
      </text>

      {/* gradient M */}
      <text
        x="256" y="174" textAnchor="middle" dominantBaseline="central"
        fontFamily="'Arial Black', 'Arial Bold', Gadget, sans-serif"
        fontWeight="900" fontSize="130"
        fill={`url(#${id}-letter)`}
      >
        M
      </text>

      {/* wordmark */}
      <text
        x="256" y="306" textAnchor="middle"
        fontFamily="'Arial Black', 'Arial Bold', Gadget, sans-serif"
        fontWeight="700" fontSize="30" letterSpacing="2"
        fill="#FFFFFF" opacity="0.95"
      >
        MASTERPIECE
      </text>
      <text
        x="256" y="350" textAnchor="middle"
        fontFamily="'Arial Black', 'Arial Bold', Gadget, sans-serif"
        fontWeight="700" fontSize="21" letterSpacing="2"
        fill="#00E5FF" opacity="0.9"
      >
        WALLPAPERS AI
      </text>

      {/* sparkle accents */}
      <path
        d="M0 -12 C1.6 -3.5 3.5 -1.6 12 0 C3.5 1.6 1.6 3.5 0 12 C-1.6 3.5 -3.5 1.6 -12 0 C-3.5 -1.6 -1.6 -3.5 0 -12 Z"
        transform="translate(150 132)"
        fill="#FFFFFF" opacity="0.9"
      />
      <path
        d="M0 -9 C1.2 -2.6 2.6 -1.2 9 0 C2.6 1.2 1.2 2.6 0 9 C-1.2 2.6 -2.6 1.2 -9 0 C-2.6 -1.2 -1.2 -2.6 0 -9 Z"
        transform="translate(384 124)"
        fill="#FF00FF" opacity="0.85"
      />
    </svg>
  );
}