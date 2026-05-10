"use client";

import { useEffect, useState } from "react";

export function ScrollProgress() {
  const [progress, setProgress] = useState(0);

  useEffect(() => {
    function handleScroll() {
      const total =
        document.documentElement.scrollHeight - window.innerHeight;
      if (total <= 0) return;
      setProgress((window.scrollY / total) * 100);
    }

    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  return (
    <div className="fixed top-0 left-0 right-0 h-[2px] z-[9999]">
      <div
        className="h-full bg-brand-500 transition-[width] duration-100"
        style={{ width: `${progress}%` }}
      />
    </div>
  );
}
