"use client";

import { useEffect, useState, useCallback } from "react";
import { SectionLabel } from "@/components/ui/SectionLabel";
import { TestimonialCard } from "@/components/ui/TestimonialCard";
import { TESTIMONIALS } from "@/lib/constants";
import { useScrollReveal } from "@/hooks/useScrollReveal";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { cn } from "@/lib/utils";

export function Testimonials() {
  const { ref, isVisible } = useScrollReveal();
  const [activeIndex, setActiveIndex] = useState(0);

  const next = useCallback(() => {
    setActiveIndex((i) => (i + 1) % TESTIMONIALS.length);
  }, []);

  const prev = useCallback(() => {
    setActiveIndex((i) => (i - 1 + TESTIMONIALS.length) % TESTIMONIALS.length);
  }, []);

  // Auto-play
  useEffect(() => {
    const timer = setInterval(next, 5000);
    return () => clearInterval(timer);
  }, [next]);

  return (
    <section
      id="testimonials"
      ref={ref}
      className="bg-[var(--bg-primary)]"
      style={{ padding: "var(--section-py) 0" }}
    >
      <div
        className="container"
        style={{
          opacity: isVisible ? 1 : 0,
          transform: isVisible ? "translateY(0)" : "translateY(32px)",
          transition: "opacity 0.6s var(--ease-out-expo), transform 0.6s var(--ease-out-expo)",
        }}
      >
        <div className="text-center mb-12">
          <SectionLabel>Real Stories</SectionLabel>
          <h2
            className="mt-4"
            style={{
              fontFamily: "var(--font-display)",
              fontSize: "clamp(28px, 4vw, 40px)",
              fontWeight: 700,
              lineHeight: 1.1,
            }}
          >
            Their words. Our work.
          </h2>
        </div>

        {/* Desktop: show all 5 — first row of 3, second row of 2 centered */}
        <div className="hidden md:block">
          <div className="grid grid-cols-3 gap-6 mb-6">
            {TESTIMONIALS.slice(0, 3).map((t) => (
              <TestimonialCard key={t.name} testimonial={t} />
            ))}
          </div>
          <div className="grid grid-cols-3 gap-6">
            <div className="col-start-1">
              {TESTIMONIALS[3] && (
                <TestimonialCard testimonial={TESTIMONIALS[3]} />
              )}
            </div>
            <div className="col-start-2">
              {TESTIMONIALS[4] && (
                <TestimonialCard testimonial={TESTIMONIALS[4]} />
              )}
            </div>
          </div>
        </div>

        {/* Mobile: carousel */}
        <div className="md:hidden">
          <div className="overflow-hidden">
            <div
              className="flex transition-transform duration-500"
              style={{
                transform: `translateX(-${activeIndex * 100}%)`,
              }}
            >
              {TESTIMONIALS.map((t) => (
                <div key={t.name} className="w-full shrink-0 px-1">
                  <TestimonialCard testimonial={t} />
                </div>
              ))}
            </div>
          </div>

          {/* Controls */}
          <div className="flex items-center justify-center gap-4 mt-6">
            <button
              onClick={prev}
              className="p-2 rounded-full border border-[var(--border-default)] text-[var(--text-tertiary)] hover:text-[var(--text-primary)] transition-colors cursor-pointer"
              aria-label="Previous testimonial"
            >
              <ChevronLeft size={18} />
            </button>

            <div className="flex gap-2">
              {TESTIMONIALS.map((_, i) => (
                <button
                  key={i}
                  onClick={() => setActiveIndex(i)}
                  className={cn(
                    "w-2 h-2 rounded-full transition-colors cursor-pointer",
                    activeIndex === i ? "bg-brand-500" : "bg-[var(--text-tertiary)]",
                  )}
                  aria-label={`Go to testimonial ${i + 1}`}
                />
              ))}
            </div>

            <button
              onClick={next}
              className="p-2 rounded-full border border-[var(--border-default)] text-[var(--text-tertiary)] hover:text-[var(--text-primary)] transition-colors cursor-pointer"
              aria-label="Next testimonial"
            >
              <ChevronRight size={18} />
            </button>
          </div>
        </div>
      </div>
    </section>
  );
}
