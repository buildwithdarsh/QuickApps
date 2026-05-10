export function PushNotificationIllustration() {
  return (
    <svg viewBox="0 0 280 360" fill="none" xmlns="http://www.w3.org/2000/svg" className="w-full max-w-[240px]" aria-label="Push notification" role="img">
      {/* Phone frame */}
      <rect x="40" y="20" width="200" height="320" rx="28" fill="var(--bg-elevated)" stroke="var(--border-default)" strokeWidth="1.5" />
      <rect x="48" y="56" width="184" height="260" rx="16" fill="var(--bg-secondary)" />
      {/* Dynamic Island */}
      <rect x="110" y="30" width="60" height="14" rx="7" fill="var(--text-primary)" opacity="0.8" />
      {/* Notification card */}
      <rect x="56" y="70" width="168" height="56" rx="12" fill="var(--bg-elevated)" style={{ filter: "drop-shadow(0 4px 12px rgba(0,0,0,0.08))" }} />
      {/* App icon */}
      <rect x="66" y="80" width="28" height="28" rx="6" fill="var(--brand-500)" opacity="0.2" />
      <text x="72" y="100" fontSize="14" fontWeight="700" fill="var(--brand-500)" fontFamily="var(--font-display)">Q</text>
      {/* Notification text */}
      <text x="102" y="90" fontSize="8" fontWeight="600" fill="var(--text-primary)" fontFamily="var(--font-display)">New Order Received!</text>
      <text x="102" y="104" fontSize="7" fill="var(--text-tertiary)" fontFamily="var(--font-body)">Ravi&apos;s Stores &middot; ₹1,249</text>
      <text x="102" y="116" fontSize="6" fill="var(--brand-500)" fontFamily="var(--font-body)">Tap to view</text>
    </svg>
  );
}

export function PaymentIllustration() {
  return (
    <svg viewBox="0 0 280 360" fill="none" xmlns="http://www.w3.org/2000/svg" className="w-full max-w-[240px]" aria-label="Razorpay checkout" role="img">
      {/* Phone frame */}
      <rect x="40" y="20" width="200" height="320" rx="28" fill="var(--bg-elevated)" stroke="var(--border-default)" strokeWidth="1.5" />
      <rect x="48" y="56" width="184" height="260" rx="16" fill="var(--bg-secondary)" />
      {/* Checkout sheet */}
      <rect x="48" y="140" width="184" height="176" rx="16" fill="var(--bg-elevated)" />
      {/* Order total */}
      <text x="68" y="166" fontSize="8" fill="var(--text-tertiary)" fontFamily="var(--font-body)">Order Total</text>
      <text x="68" y="184" fontSize="16" fontWeight="700" fill="var(--text-primary)" fontFamily="var(--font-display)">₹1,499</text>
      {/* Divider */}
      <line x1="68" y1="194" x2="212" y2="194" stroke="var(--border-subtle)" strokeWidth="1" />
      {/* Payment options */}
      <rect x="68" y="204" width="144" height="28" rx="8" fill="var(--brand-50)" stroke="var(--brand-200)" strokeWidth="1" />
      <text x="82" y="222" fontSize="9" fontWeight="600" fill="var(--brand-600)" fontFamily="var(--font-body)">UPI</text>
      <circle cx="196" cy="218" r="6" fill="var(--brand-500)" />
      <circle cx="196" cy="218" r="3" fill="white" />

      <rect x="68" y="238" width="144" height="24" rx="8" fill="var(--bg-secondary)" />
      <text x="82" y="254" fontSize="8" fill="var(--text-secondary)" fontFamily="var(--font-body)">Cards</text>

      <rect x="68" y="266" width="144" height="24" rx="8" fill="var(--bg-secondary)" />
      <text x="82" y="282" fontSize="8" fill="var(--text-secondary)" fontFamily="var(--font-body)">Net Banking</text>

      {/* Pay button */}
      <rect x="68" y="298" width="144" height="32" rx="16" fill="var(--brand-500)" />
      <text x="115" y="318" fontSize="10" fontWeight="600" fill="white" fontFamily="var(--font-body)">Pay Now</text>
    </svg>
  );
}

export function BiometricIllustration() {
  return (
    <svg viewBox="0 0 200 200" fill="none" xmlns="http://www.w3.org/2000/svg" className="w-full max-w-[200px]" aria-label="Biometric authentication" role="img">
      {/* Outer arcs */}
      {[0, 1, 2, 3].map((i) => (
        <circle
          key={i}
          cx="100"
          cy="100"
          r={40 + i * 16}
          stroke="var(--brand-500)"
          strokeWidth="1.5"
          fill="none"
          opacity={0.15 + i * 0.1}
          strokeDasharray={i % 2 === 0 ? "8 6" : "none"}
        />
      ))}
      {/* Fingerprint-like center */}
      <path
        d="M80 120C80 100 85 80 100 75C115 80 120 100 120 120"
        stroke="var(--brand-500)"
        strokeWidth="2"
        fill="none"
        strokeLinecap="round"
      />
      <path
        d="M86 118C86 102 90 86 100 82C110 86 114 102 114 118"
        stroke="var(--brand-500)"
        strokeWidth="2"
        fill="none"
        strokeLinecap="round"
      />
      <path
        d="M92 116C92 104 95 92 100 89C105 92 108 104 108 116"
        stroke="var(--brand-500)"
        strokeWidth="2"
        fill="none"
        strokeLinecap="round"
      />
      {/* Verified badge */}
      <rect x="66" y="150" width="68" height="22" rx="11" fill="var(--india-green-light)" />
      <text x="84" y="165" fontSize="9" fontWeight="600" fill="var(--india-green)" fontFamily="var(--font-body)">Verified</text>
    </svg>
  );
}

export function DashboardFeatureIllustration() {
  return (
    <svg viewBox="0 0 320 220" fill="none" xmlns="http://www.w3.org/2000/svg" className="w-full max-w-[300px]" aria-label="QuickApps dashboard" role="img">
      {/* Browser chrome */}
      <rect x="10" y="10" width="300" height="200" rx="12" fill="var(--bg-elevated)" stroke="var(--border-default)" strokeWidth="1.5" />
      <rect x="10" y="10" width="300" height="28" rx="12" fill="var(--bg-secondary)" />
      <rect x="10" y="24" width="300" height="14" fill="var(--bg-secondary)" />
      <circle cx="28" cy="24" r="4" fill="#FF5F57" />
      <circle cx="42" cy="24" r="4" fill="#FFBD2E" />
      <circle cx="56" cy="24" r="4" fill="#28CA42" />
      {/* Sidebar */}
      <rect x="10" y="38" width="70" height="172" fill="var(--bg-secondary)" />
      <rect x="10" y="192" width="70" height="18" rx="0" fill="var(--bg-secondary)" />
      <rect x="22" y="52" width="46" height="6" rx="3" fill="var(--bg-tertiary)" />
      <rect x="22" y="66" width="40" height="6" rx="3" fill="var(--bg-tertiary)" />
      <rect x="22" y="80" width="50" height="6" rx="3" fill="var(--brand-500)" opacity="0.3" />
      <rect x="22" y="94" width="36" height="6" rx="3" fill="var(--bg-tertiary)" />
      {/* Main panel */}
      <text x="92" y="60" fontSize="10" fontWeight="600" fill="var(--text-primary)" fontFamily="var(--font-display)">App Configuration</text>
      {/* Build button */}
      <rect x="92" y="72" width="100" height="26" rx="13" fill="var(--brand-500)" />
      <text x="110" y="89" fontSize="9" fontWeight="600" fill="white" fontFamily="var(--font-body)">Trigger Build</text>
      {/* Progress bar */}
      <text x="92" y="116" fontSize="8" fill="var(--text-secondary)" fontFamily="var(--font-body)">Building... 80%</text>
      <rect x="92" y="122" width="200" height="8" rx="4" fill="var(--bg-tertiary)" />
      <rect x="92" y="122" width="160" height="8" rx="4" fill="var(--brand-500)" />
      {/* Config rows */}
      <rect x="92" y="142" width="200" height="20" rx="4" fill="var(--bg-secondary)" />
      <rect x="92" y="168" width="200" height="20" rx="4" fill="var(--bg-secondary)" />
    </svg>
  );
}
