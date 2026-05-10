interface LogoProps {
  variant?: "default" | "white";
  className?: string;
}

export function Logo({ variant = "default", className = "" }: LogoProps) {
  const textFill = variant === "white" ? "#FFFFFF" : "#111010";

  return (
    <svg
      viewBox="0 0 160 36"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={className}
      aria-label="QuickApps"
      role="img"
    >
      <rect x="0" y="0" width="36" height="36" rx="8" fill="#F97316" />
      <text
        x="18"
        y="26"
        textAnchor="middle"
        fontFamily="var(--font-display), system-ui"
        fontSize="22"
        fontWeight="700"
        fill="white"
      >
        Q
      </text>
      <text
        x="48"
        y="25"
        fontFamily="var(--font-display), system-ui"
        fontSize="18"
        fontWeight="600"
        fill={textFill}
      >
        uickApps
      </text>
    </svg>
  );
}
