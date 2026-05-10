"use client";

import { useEffect, useState, type RefObject } from "react";

export function useStickyScroll(
  containerRef: RefObject<HTMLDivElement | null>,
  stepCount: number = 3,
) {
  const [activeStep, setActiveStep] = useState(0);
  const [progress, setProgress] = useState(0);

  useEffect(() => {
    function handleScroll() {
      const container = containerRef.current;
      if (!container) return;

      const rect = container.getBoundingClientRect();
      const containerHeight = container.offsetHeight;
      const scrolled = -rect.top;
      const totalScrollable = containerHeight - window.innerHeight;

      if (totalScrollable <= 0) return;

      const rawProgress = Math.max(0, Math.min(1, scrolled / totalScrollable));
      setProgress(rawProgress);

      const step = Math.min(
        stepCount - 1,
        Math.floor(rawProgress * stepCount),
      );
      setActiveStep(step);
    }

    window.addEventListener("scroll", handleScroll, { passive: true });
    handleScroll();
    return () => window.removeEventListener("scroll", handleScroll);
  }, [containerRef, stepCount]);

  return { activeStep, progress };
}
