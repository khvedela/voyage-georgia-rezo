"use client";

export function SideBrokenLines() {
  return (
    <div className="fixed inset-0 pointer-events-none z-[55] opacity-95">
      {/* Using SVG so lines are crisp across devices */}
      <svg
        className="w-full h-full"
        viewBox="0 0 1920 1080"
        preserveAspectRatio="none"
      >
        <g
          strokeWidth="1.8"
          stroke="#dbe7f0"
          strokeOpacity="0.38"
          fill="none"
          strokeLinecap="round"
        >
          {/* Left vertical with gaps */}
          <path d="M18,120 L18,240" />
          <path d="M18,280 L18,420" />
          <path d="M18,460 L18,600" />
          <path d="M18,680 L18,820" />

          {/* Right vertical with gaps */}
          <path d="M1902,120 L1902,240" />
          <path d="M1902,280 L1902,420" />
          <path d="M1902,460 L1902,600" />
          <path d="M1902,680 L1902,820" />

          {/* Broken top horizontal bars */}
          <path d="M80,24 L420,24" />
          <path d="M540,24 L880,24" />
          <path d="M1000,24 L1340,24" />
          <path d="M1460,24 L1800,24" />

          {/* Broken bottom horizontal bars */}
          <path d="M80,1056 L420,1056" />
          <path d="M540,1056 L880,1056" />
          <path d="M1000,1056 L1340,1056" />
          <path d="M1460,1056 L1800,1056" />
        </g>

        {/* Accent glows for hero area to guide the eye */}
        <defs>
          <linearGradient id="glow" x1="0" x2="1">
            <stop offset="0%" stopColor="#ffb86b" stopOpacity="0.08" />
            <stop offset="100%" stopColor="#38ef7d" stopOpacity="0.02" />
          </linearGradient>
        </defs>
        <rect x="0" y="0" width="100%" height="160" fill="url(#glow)" />
      </svg>
    </div>
  );
}
