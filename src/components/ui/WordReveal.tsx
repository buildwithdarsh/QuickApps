"use client";

import { useScrollReveal } from "@/hooks/useScrollReveal";

interface WordRevealProps {
  text: string;
  className?: string;
  staggerMs?: number;
  renderWord?: (word: string, index: number) => React.ReactNode;
}

export function WordReveal({
  text,
  className = "",
  staggerMs = 55,
  renderWord,
}: WordRevealProps) {
  const { ref, isVisible } = useScrollReveal({ threshold: 0.2 });
  const words = text.split(" ");

  return (
    <span ref={ref} className={className}>
      {words.map((word, i) => (
        <span
          key={i}
          style={{
            display: "inline-block",
            opacity: isVisible ? 1 : 0,
            transform: isVisible
              ? "translateY(0) rotateX(0)"
              : "translateY(16px) rotateX(-12deg)",
            transformOrigin: "top center",
            transition: `opacity 0.5s var(--ease-out-expo), transform 0.5s var(--ease-out-expo)`,
            transitionDelay: `${i * staggerMs}ms`,
          }}
        >
          {renderWord ? renderWord(word, i) : word}
          {i < words.length - 1 ? "\u00A0" : ""}
        </span>
      ))}
    </span>
  );
}
