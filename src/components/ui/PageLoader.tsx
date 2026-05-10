"use client";

import { useState, useEffect } from "react";

const LOADER_DURATION = 2000; // 3 seconds minimum

export function PageLoader({ onFinish }: { onFinish?: () => void }) {
  const [progress, setProgress] = useState(0);
  const [phase, setPhase] = useState(0); // 0, 1, 2 — three animation phases

  useEffect(() => {
    // Animate progress bar
    const start = Date.now();
    const interval = setInterval(() => {
      const elapsed = Date.now() - start;
      const pct = Math.min((elapsed / LOADER_DURATION) * 100, 100);
      setProgress(pct);

      if (pct >= 33 && phase < 1) setPhase(1);
      if (pct >= 66 && phase < 2) setPhase(2);

      if (pct >= 100) {
        clearInterval(interval);
        setTimeout(() => onFinish?.(), 300);
      }
    }, 30);

    return () => clearInterval(interval);
  }, [onFinish, phase]);

  return (
    <div className="fixed inset-0 z-[9999] flex items-center justify-center" style={{ background: "var(--bg-primary)" }}>
      <div className="flex flex-col items-center gap-8 px-6">

        {/* Animated Logo + SVG Illustrations */}
        <div className="relative w-40 h-40">
          {/* Outer rotating ring */}
          <svg className="absolute inset-0 w-full h-full animate-[spin_6s_linear_infinite]" viewBox="0 0 160 160">
            <defs>
              <linearGradient id="ring-grad" x1="0%" y1="0%" x2="100%" y2="100%">
                <stop offset="0%" stopColor="#F97316" stopOpacity="0.6" />
                <stop offset="50%" stopColor="#EA580C" stopOpacity="0.2" />
                <stop offset="100%" stopColor="#F97316" stopOpacity="0.6" />
              </linearGradient>
            </defs>
            <circle cx="80" cy="80" r="74" fill="none" stroke="url(#ring-grad)" strokeWidth="1.5" strokeDasharray="12 8" />
          </svg>

          {/* Middle pulsing ring */}
          <svg className="absolute inset-0 w-full h-full animate-[spin_4s_linear_infinite_reverse]" viewBox="0 0 160 160">
            <circle cx="80" cy="80" r="58" fill="none" stroke="#F97316" strokeWidth="0.75" strokeDasharray="6 14" opacity="0.3" />
          </svg>

          {/* Center icon — morphs through 3 phases */}
          <div className="absolute inset-0 flex items-center justify-center">
            <div className="w-20 h-20 rounded-2xl bg-brand-500/10 flex items-center justify-center transition-all duration-700" style={{ transform: `scale(${phase === 1 ? 1.1 : phase === 2 ? 1.05 : 1})` }}>
              {/* Phase 0: Globe/Website */}
              <svg
                className="absolute transition-all duration-500"
                style={{ opacity: phase === 0 ? 1 : 0, transform: phase === 0 ? "scale(1) rotate(0deg)" : "scale(0.5) rotate(90deg)" }}
                width="36" height="36" viewBox="0 0 24 24" fill="none" stroke="#F97316" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"
              >
                <circle cx="12" cy="12" r="10" />
                <path d="M12 2a14.5 14.5 0 0 0 0 20 14.5 14.5 0 0 0 0-20" />
                <path d="M2 12h20" />
              </svg>

              {/* Phase 1: Smartphone/App */}
              <svg
                className="absolute transition-all duration-500"
                style={{ opacity: phase === 1 ? 1 : 0, transform: phase === 1 ? "scale(1) rotate(0deg)" : phase < 1 ? "scale(0.5) rotate(-90deg)" : "scale(0.5) rotate(90deg)" }}
                width="36" height="36" viewBox="0 0 24 24" fill="none" stroke="#F97316" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"
              >
                <rect x="5" y="2" width="14" height="20" rx="2" ry="2" />
                <path d="M12 18h.01" />
              </svg>

              {/* Phase 2: Rocket/Launch */}
              <svg
                className="absolute transition-all duration-500"
                style={{ opacity: phase === 2 ? 1 : 0, transform: phase === 2 ? "scale(1) translateY(0)" : "scale(0.5) translateY(10px)" }}
                width="36" height="36" viewBox="0 0 24 24" fill="none" stroke="#F97316" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"
              >
                <path d="M4.5 16.5c-1.5 1.26-2 5-2 5s3.74-.5 5-2c.71-.84.7-2.13-.09-2.91a2.18 2.18 0 0 0-2.91-.09z" />
                <path d="m12 15-3-3a22 22 0 0 1 2-3.95A12.88 12.88 0 0 1 22 2c0 2.72-.78 7.5-6 11a22.35 22.35 0 0 1-4 2z" />
                <path d="M9 12H4s.55-3.03 2-4c1.62-1.08 5 0 5 0" />
                <path d="M12 15v5s3.03-.55 4-2c1.08-1.62 0-5 0-5" />
              </svg>
            </div>
          </div>

          {/* Orbiting dots */}
          {[0, 1, 2, 3].map((i) => (
            <div
              key={i}
              className="absolute w-2 h-2 rounded-full"
              style={{
                background: i % 2 === 0 ? "#F97316" : "#FB923C",
                opacity: 0.6,
                top: "50%",
                left: "50%",
                animation: `orbit ${3 + i * 0.5}s linear infinite`,
                animationDelay: `${i * 0.4}s`,
              }}
            />
          ))}
        </div>

        {/* Text */}
        <div className="text-center">
          <h2 className="font-display text-lg font-bold" style={{ color: "var(--text-primary)" }}>
            <span className="text-brand-500">Quick</span>Apps
          </h2>
          <p className="text-xs mt-2 transition-all duration-500" style={{ color: "var(--text-tertiary)" }}>
            {phase === 0 && "Loading your workspace..."}
            {phase === 1 && "Preparing your apps..."}
            {phase === 2 && "Almost ready..."}
          </p>
        </div>

        {/* Progress bar */}
        <div className="w-48 h-1 rounded-full overflow-hidden" style={{ background: "var(--bg-secondary)" }}>
          <div
            className="h-full rounded-full transition-all duration-200"
            style={{
              width: `${progress}%`,
              background: "linear-gradient(90deg, #F97316, #FB923C, #F97316)",
              backgroundSize: "200% 100%",
              animation: "shimmer 1.5s ease-in-out infinite",
            }}
          />
        </div>
      </div>

      {/* CSS for orbit animation + shimmer */}
      <style>{`
        @keyframes orbit {
          from {
            transform: rotate(0deg) translateX(52px) rotate(0deg) scale(1);
          }
          50% {
            transform: rotate(180deg) translateX(52px) rotate(-180deg) scale(0.6);
          }
          to {
            transform: rotate(360deg) translateX(52px) rotate(-360deg) scale(1);
          }
        }
        @keyframes shimmer {
          0% { background-position: 200% 0; }
          100% { background-position: -200% 0; }
        }
      `}</style>
    </div>
  );
}
