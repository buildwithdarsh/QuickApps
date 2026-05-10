export function UrlBarIllustration() {
  return (
    <svg viewBox="0 0 300 180" fill="none" xmlns="http://www.w3.org/2000/svg" className="w-full max-w-[360px]" aria-label="Enter URL step" role="img">
      {/* Browser outline */}
      <rect x="10" y="10" width="280" height="160" rx="12" fill="var(--bg-elevated)" stroke="var(--border-default)" strokeWidth="1.5" />
      {/* Title bar */}
      <rect x="10" y="10" width="280" height="32" rx="12" fill="var(--bg-secondary)" />
      <rect x="10" y="28" width="280" height="14" fill="var(--bg-secondary)" />
      {/* Dots */}
      <circle cx="28" cy="26" r="4" fill="#FF5F57" />
      <circle cx="42" cy="26" r="4" fill="#FFBD2E" />
      <circle cx="56" cy="26" r="4" fill="#28CA42" />
      {/* URL bar */}
      <rect x="72" y="18" width="180" height="16" rx="8" fill="white" />
      <text x="84" y="30" fontSize="9" fill="var(--brand-500)" fontFamily="var(--font-body)" fontWeight="500">yoursite.com</text>
      {/* Blinking cursor */}
      <rect x="148" y="21" width="1.5" height="10" fill="var(--brand-500)" opacity="0.8">
        <animate attributeName="opacity" values="1;0;1" dur="1.2s" repeatCount="indefinite" />
      </rect>
      {/* Enter key */}
      <rect x="224" y="54" width="50" height="20" rx="6" fill="var(--brand-50)" stroke="var(--brand-200)" strokeWidth="1" />
      <text x="234" y="68" fontSize="8" fill="var(--brand-600)" fontFamily="var(--font-body)" fontWeight="500">Enter ↵</text>
    </svg>
  );
}

export function DashboardIllustration() {
  return (
    <svg viewBox="0 0 300 200" fill="none" xmlns="http://www.w3.org/2000/svg" className="w-full max-w-[360px]" aria-label="Configure step" role="img">
      {/* Dashboard panel */}
      <rect x="10" y="10" width="280" height="180" rx="12" fill="var(--bg-elevated)" stroke="var(--border-default)" strokeWidth="1.5" />
      {/* Toggle rows */}
      {[50, 80, 110].map((y, i) => (
        <g key={i}>
          <rect x="30" y={y} width="100" height="8" rx="4" fill="var(--bg-tertiary)" />
          <rect x={220} y={y - 2} width="36" height="12" rx="6" fill={i < 2 ? "var(--brand-500)" : "var(--bg-tertiary)"} />
          {i < 2 && <circle cx={248} cy={y + 4} r="4" fill="white" />}
          {i >= 2 && <circle cx={228} cy={y + 4} r="4" fill="var(--text-tertiary)" />}
        </g>
      ))}
      {/* Color picker */}
      <rect x="30" y="140" width="80" height="8" rx="4" fill="var(--bg-tertiary)" />
      <circle cx="180" cy="144" r="10" fill="var(--brand-500)" stroke="white" strokeWidth="2" />
      <circle cx="204" cy="144" r="10" fill="var(--navy-600)" />
      <circle cx="228" cy="144" r="10" fill="var(--india-green)" />
      {/* Header */}
      <text x="30" y="32" fontSize="10" fontWeight="600" fill="var(--text-primary)" fontFamily="var(--font-display)">App Configuration</text>
    </svg>
  );
}

export function ProgressArcIllustration() {
  return (
    <svg viewBox="0 0 280 320" fill="none" xmlns="http://www.w3.org/2000/svg" className="w-full max-w-[260px]" aria-label="Build complete step" role="img">
      {/* Phone frame */}
      <rect x="50" y="10" width="180" height="300" rx="24" fill="var(--bg-elevated)" stroke="var(--border-default)" strokeWidth="1.5" />
      <rect x="58" y="44" width="164" height="240" rx="14" fill="var(--bg-secondary)" />
      {/* Dynamic island */}
      <rect x="115" y="20" width="50" height="12" rx="6" fill="var(--text-primary)" opacity="0.8" />

      {/* Download card */}
      <rect x="70" y="70" width="140" height="100" rx="12" fill="var(--bg-elevated)" style={{ filter: "drop-shadow(0 2px 8px rgba(0,0,0,0.06))" }} />

      {/* APK icon */}
      <rect x="90" y="84" width="32" height="32" rx="8" fill="var(--brand-500)" opacity="0.15" />
      <text x="98" y="106" fontSize="12" fontWeight="700" fill="var(--brand-500)" fontFamily="var(--font-display)">APK</text>

      {/* File info */}
      <text x="130" y="96" fontSize="9" fontWeight="600" fill="var(--text-primary)" fontFamily="var(--font-display)">MyApp.apk</text>
      <text x="130" y="110" fontSize="7" fill="var(--text-tertiary)" fontFamily="var(--font-body)">12.4 MB &middot; Ready</text>

      {/* Progress bar — complete */}
      <rect x="84" y="130" width="112" height="6" rx="3" fill="var(--bg-tertiary)" />
      <rect x="84" y="130" width="112" height="6" rx="3" fill="var(--brand-500)" />

      {/* Checkmark badge */}
      <circle cx="196" y="133" r="8" fill="var(--brand-500)" />
      <path d="M192 133L195 136L200 130" stroke="white" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" fill="none" />

      {/* 100% text */}
      <text x="88" y="150" fontSize="7" fontWeight="600" fill="var(--brand-500)" fontFamily="var(--font-body)">100% Complete</text>

      {/* Download button */}
      <rect x="84" y="186" width="112" height="30" rx="15" fill="var(--brand-500)" />
      <text x="113" y="205" fontSize="9" fontWeight="600" fill="white" fontFamily="var(--font-body)">Download</text>

      {/* IOS IPA card below */}
      <rect x="70" y="230" width="140" height="40" rx="10" fill="var(--bg-elevated)" style={{ filter: "drop-shadow(0 2px 8px rgba(0,0,0,0.06))" }} />
      <rect x="82" y="240" width="24" height="20" rx="5" fill="var(--navy-600)" opacity="0.15" />
      <text x="87" y="254" fontSize="8" fontWeight="700" fill="var(--navy-600)" fontFamily="var(--font-display)">IPA</text>
      <text x="114" y="250" fontSize="8" fontWeight="600" fill="var(--text-primary)" fontFamily="var(--font-display)">MyApp.ipa</text>
      <text x="114" y="261" fontSize="6" fill="var(--text-tertiary)" fontFamily="var(--font-body)">18.1 MB &middot; Ready</text>
    </svg>
  );
}
