export function PhoneMockup({ className = "" }: { className?: string }) {
  return (
    <div className={`flex items-center justify-center gap-4 md:gap-8 ${className}`}>
      {/* Browser frame */}
      <div className="animate-float">
        <svg
          viewBox="0 0 220 160"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
          className="w-[180px] md:w-[220px] h-auto"
          style={{ transform: "rotate(-2deg)" }}
          aria-label="Website browser window"
          role="img"
        >
          {/* Browser chrome */}
          <rect x="1" y="1" width="218" height="158" rx="12" fill="white" stroke="var(--bg-tertiary)" strokeWidth="1.5" />
          {/* Title bar */}
          <rect x="1" y="1" width="218" height="28" rx="12" fill="var(--bg-secondary)" />
          <rect x="1" y="16" width="218" height="13" fill="var(--bg-secondary)" />
          {/* Traffic lights */}
          <circle cx="16" cy="15" r="4" fill="#FF5F57" />
          <circle cx="28" cy="15" r="4" fill="#FFBD2E" />
          <circle cx="40" cy="15" r="4" fill="#28CA42" />
          {/* URL bar */}
          <rect x="56" y="8" width="108" height="14" rx="7" fill="white" opacity="0.8" />
          <text x="78" y="18" fontSize="7" fill="var(--text-tertiary)" fontFamily="var(--font-body)">yoursite.com</text>
          {/* Content blocks */}
          <rect x="16" y="40" width="80" height="8" rx="4" fill="var(--bg-tertiary)" />
          <rect x="16" y="54" width="188" height="6" rx="3" fill="var(--bg-secondary)" />
          <rect x="16" y="64" width="160" height="6" rx="3" fill="var(--bg-secondary)" />
          <rect x="16" y="80" width="88" height="40" rx="6" fill="var(--bg-secondary)" />
          <rect x="112" y="80" width="92" height="40" rx="6" fill="var(--bg-secondary)" />
          <rect x="16" y="130" width="188" height="6" rx="3" fill="var(--bg-secondary)" />
          <rect x="16" y="140" width="140" height="6" rx="3" fill="var(--bg-secondary)" />
        </svg>
      </div>

      {/* Arrow */}
      <div className="flex flex-col items-center gap-1">
        <svg width="40" height="20" viewBox="0 0 40 20" fill="none" className="animate-pulse">
          <path d="M0 10H32M32 10L24 4M32 10L24 16" stroke="var(--brand-500)" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
      </div>

      {/* Native app frame */}
      <div className="animate-float-delayed">
        <svg
          viewBox="0 0 200 400"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
          className="w-[120px] md:w-[150px] h-auto"
          style={{ transform: "rotate(2deg)" }}
          aria-label="Native mobile app"
          role="img"
        >
          {/* Phone body */}
          <rect x="1" y="1" width="198" height="398" rx="28" fill="white" stroke="var(--bg-tertiary)" strokeWidth="1.5" />
          {/* Dynamic Island */}
          <rect x="70" y="12" width="60" height="16" rx="8" fill="#1C1B19" />
          {/* Side buttons */}
          <rect x="197" y="80" width="3" height="30" rx="1.5" fill="var(--bg-tertiary)" />
          <rect x="197" y="120" width="3" height="50" rx="1.5" fill="var(--bg-tertiary)" />
          {/* Screen area */}
          <rect x="8" y="36" width="184" height="326" rx="20" fill="var(--bg-secondary)" />
          {/* Status bar */}
          <text x="20" y="52" fontSize="8" fill="var(--text-tertiary)" fontFamily="var(--font-body)">9:41</text>
          <rect x="148" y="44" width="30" height="8" rx="2" fill="var(--text-tertiary)" opacity="0.3" />
          {/* App header */}
          <rect x="16" y="60" width="168" height="28" rx="6" fill="var(--brand-500)" opacity="0.15" />
          <text x="24" y="78" fontSize="10" fontWeight="600" fill="var(--brand-600)" fontFamily="var(--font-display)">Your App</text>
          {/* Content */}
          <rect x="16" y="96" width="80" height="8" rx="4" fill="var(--bg-tertiary)" />
          <rect x="16" y="110" width="168" height="6" rx="3" fill="var(--bg-tertiary)" opacity="0.5" />
          <rect x="16" y="120" width="140" height="6" rx="3" fill="var(--bg-tertiary)" opacity="0.5" />
          {/* Cards */}
          <rect x="16" y="138" width="78" height="60" rx="8" fill="white" />
          <rect x="102" y="138" width="82" height="60" rx="8" fill="white" />
          <rect x="16" y="206" width="78" height="60" rx="8" fill="white" />
          <rect x="102" y="206" width="82" height="60" rx="8" fill="white" />
          {/* Bottom nav */}
          <rect x="8" y="330" width="184" height="32" rx="8" fill="white" />
          <circle cx="40" cy="346" r="4" fill="var(--brand-500)" />
          <circle cx="80" cy="346" r="4" fill="var(--bg-tertiary)" />
          <circle cx="120" cy="346" r="4" fill="var(--bg-tertiary)" />
          <circle cx="160" cy="346" r="4" fill="var(--bg-tertiary)" />
          {/* QuickApps badge */}
          <rect x="130" y="276" width="58" height="16" rx="8" fill="var(--brand-500)" opacity="0.12" />
          <text x="138" y="287" fontSize="6" fill="var(--brand-600)" fontFamily="var(--font-body)">QuickApps</text>
        </svg>
      </div>
    </div>
  );
}
