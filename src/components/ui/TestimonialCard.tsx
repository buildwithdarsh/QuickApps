import type { Testimonial } from "@/lib/constants";
import { Star } from "lucide-react";

interface TestimonialCardProps {
  testimonial: Testimonial;
}

export function TestimonialCard({ testimonial }: TestimonialCardProps) {
  return (
    <div
      className="bg-bg-elevated border border-[var(--border-subtle)] p-8 pb-6 flex flex-col"
      style={{ borderRadius: "var(--radius-xl)" }}
    >
      <span
        className="text-brand-200 text-[72px] font-bold leading-[0.5] mb-4"
        style={{ fontFamily: "var(--font-display)" }}
        aria-hidden="true"
      >
        &ldquo;
      </span>

      <p
        className="text-[var(--text-secondary)] text-base leading-relaxed flex-1 mb-6"
        style={{ fontFamily: "var(--font-body)" }}
      >
        {testimonial.quote}
      </p>

      <div className="flex gap-0.5 mb-3">
        {Array.from({ length: testimonial.stars }).map((_, i) => (
          <Star
            key={i}
            size={16}
            fill="var(--brand-500)"
            stroke="var(--brand-500)"
          />
        ))}
      </div>

      <p
        className="text-sm font-semibold text-[var(--text-primary)]"
        style={{ fontFamily: "var(--font-display)" }}
      >
        {testimonial.name}
      </p>
      <p className="text-xs text-[var(--text-tertiary)]">
        {testimonial.role}, {testimonial.city}
      </p>
    </div>
  );
}
