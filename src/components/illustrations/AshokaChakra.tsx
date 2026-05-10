export function AshokaChakra({
  size = 120,
  className = "",
}: {
  size?: number;
  className?: string;
}) {
  const spokes = Array.from({ length: 24 }, (_, i) => i * 15);

  return (
    <svg
      viewBox="0 0 120 120"
      width={size}
      height={size}
      xmlns="http://www.w3.org/2000/svg"
      className={`animate-chakra ${className}`}
      aria-label="Ashoka Chakra"
      role="img"
    >
      {/* Outer circle */}
      <circle
        cx="60"
        cy="60"
        r="56"
        fill="none"
        stroke="white"
        strokeWidth="3"
        opacity="0.85"
      />
      {/* Inner hub */}
      <circle cx="60" cy="60" r="8" fill="white" opacity="0.85" />
      {/* 24 spokes */}
      {spokes.map((angle) => (
        <line
          key={angle}
          x1="60"
          y1="52"
          x2="60"
          y2="8"
          stroke="white"
          strokeWidth="1.5"
          strokeLinecap="round"
          opacity="0.85"
          transform={`rotate(${angle} 60 60)`}
        />
      ))}
    </svg>
  );
}
