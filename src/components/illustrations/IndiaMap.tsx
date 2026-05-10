export function IndiaMap({ className = "" }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 300 380"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={className}
      aria-label="Map of India with tech hub markers"
      role="img"
    >
      {/* Simplified India outline */}
      <path
        d="M150 20 C120 25, 80 40, 60 70 C45 95, 35 120, 40 150 C42 165, 50 180, 55 200 C58 215, 55 235, 65 255 C75 275, 95 290, 110 310 C120 325, 135 340, 150 360 C165 340, 180 325, 190 310 C205 290, 225 275, 235 255 C245 235, 242 215, 245 200 C250 180, 258 165, 260 150 C265 120, 255 95, 240 70 C220 40, 180 25, 150 20 Z"
        stroke="rgba(255,255,255,0.15)"
        strokeWidth="1.5"
        fill="none"
      />

      {/* Dot pattern inside */}
      {Array.from({ length: 8 }).map((_, row) =>
        Array.from({ length: 5 }).map((_, col) => (
          <circle
            key={`${row}-${col}`}
            cx={100 + col * 25}
            cy={60 + row * 35}
            r="1"
            fill="rgba(255,255,255,0.06)"
          />
        )),
      )}

      {/* Tech hub pins */}
      {/* Bengaluru */}
      <circle cx="155" cy="280" r="4" fill="rgba(255,255,255,0.4)" />
      <text x="165" y="284" fontSize="7" fill="rgba(255,255,255,0.4)" fontFamily="var(--font-body)">Bengaluru</text>

      {/* Mumbai */}
      <circle cx="95" cy="210" r="4" fill="rgba(255,255,255,0.4)" />
      <text x="65" y="205" fontSize="7" fill="rgba(255,255,255,0.4)" fontFamily="var(--font-body)">Mumbai</text>

      {/* Hyderabad */}
      <circle cx="160" cy="240" r="4" fill="rgba(255,255,255,0.4)" />
      <text x="170" y="244" fontSize="7" fill="rgba(255,255,255,0.4)" fontFamily="var(--font-body)">Hyderabad</text>

      {/* Indore — glowing saffron pin */}
      <circle cx="130" cy="185" r="5" fill="#F97316">
        <animate
          attributeName="r"
          values="5;9;5"
          dur="2.5s"
          repeatCount="indefinite"
        />
        <animate
          attributeName="opacity"
          values="1;0.5;1"
          dur="2.5s"
          repeatCount="indefinite"
        />
      </circle>
      <circle cx="130" cy="185" r="3" fill="#F97316" />
      <text x="105" y="175" fontSize="8" fontWeight="600" fill="#F97316" fontFamily="var(--font-body)">Indore</text>
    </svg>
  );
}
