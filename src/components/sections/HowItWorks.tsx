"use client";

import { SectionLabel } from "@/components/ui/SectionLabel";
import { GradientText } from "@/components/ui/GradientText";
import { useScrollReveal } from "@/hooks/useScrollReveal";
import {
  UrlBarIllustration,
  DashboardIllustration,
  ProgressArcIllustration,
} from "@/components/illustrations/StepIllustrations";

const steps = [
  {
    label: "01 — Paste URL",
    time: "2 min",
    illustration: <UrlBarIllustration />,
  },
  {
    label: "02 — Configure",
    time: "5 min",
    illustration: <DashboardIllustration />,
  },
  {
    label: "03 — Build",
    time: "15 min",
    illustration: <ProgressArcIllustration />,
  },
];

export function HowItWorks() {
  const { ref, isVisible } = useScrollReveal();

  return (
    <section
      id="how-it-works"
      className="bg-[var(--bg-secondary)]"
      style={{ padding: "var(--section-py) 0" }}
    >
      {/* Header */}
      <div
        ref={ref}
        className="container text-center mb-12"
        style={{
          opacity: isVisible ? 1 : 0,
          transform: isVisible ? "translateY(0)" : "translateY(24px)",
          transition:
            "opacity 0.6s var(--ease-out-expo), transform 0.6s var(--ease-out-expo)",
        }}
      >
        <SectionLabel>The Process</SectionLabel>
        <h2
          className="mt-4"
          style={{
            fontFamily: "var(--font-display)",
            fontSize: "clamp(32px, 5vw, 56px)",
            fontWeight: 700,
            lineHeight: 1.1,
          }}
        >
          <GradientText>Three</GradientText> steps.
          <br />
          One native app.
        </h2>
        <p
          className="mt-4 text-[var(--text-secondary)] text-lg"
          style={{ fontFamily: "var(--font-body)" }}
        >
          From URL to APK. No developer. No agency. No waiting.
        </p>
      </div>

      {/* Desktop: horizontal flow — illustration → wire → Q → wire → illustration, with third below */}
      <div className="container hidden md:block">
        <div className="relative flex flex-col items-center gap-0">
          {/* Top row: Step 1 — wire — Q — wire — Step 2 */}
          <div className="flex items-center justify-center gap-0 w-full" style={{ maxWidth: "900px" }}>
            {/* Step 1 */}
            <div className="flex flex-col items-center gap-3 flex-1">
              <div>
                {steps[0]!.illustration}
              </div>
              <p
                className="text-xs font-semibold text-brand-500 tracking-wide uppercase"
                style={{ fontFamily: "var(--font-body)" }}
              >
                {steps[0]!.label}
              </p>
              <p
                className="text-xs text-[var(--text-tertiary)]"
                style={{ fontFamily: "var(--font-body)" }}
              >
                {steps[0]!.time}
              </p>
            </div>

            {/* Wire left */}
            <div className="w-20 flex items-center shrink-0" style={{ marginLeft: "-8px", marginRight: "-8px" }}>
              <div
                className="w-full h-[2px]"
                style={{
                  background:
                    "repeating-linear-gradient(90deg, var(--brand-500) 0, var(--brand-500) 6px, transparent 6px, transparent 12px)",
                  opacity: 0.35,
                }}
              />
            </div>

            {/* Center Q hub */}
            <div className="shrink-0">
              <div
                className="w-20 h-20 rounded-full grid place-items-center"
                style={{
                  background: "var(--gradient-saffron)",
                  boxShadow:
                    "0 0 0 6px rgba(249,115,22,0.1), 0 0 0 12px rgba(249,115,22,0.05)",
                }}
              >
                <span
                  className="text-white text-2xl font-bold"
                  style={{ fontFamily: "var(--font-display)" }}
                >
                  Q
                </span>
              </div>
            </div>

            {/* Wire right */}
            <div className="w-20 flex items-center shrink-0" style={{ marginLeft: "-8px", marginRight: "-8px" }}>
              <div
                className="w-full h-[2px]"
                style={{
                  background:
                    "repeating-linear-gradient(90deg, var(--brand-500) 0, var(--brand-500) 6px, transparent 6px, transparent 12px)",
                  opacity: 0.35,
                }}
              />
            </div>

            {/* Step 2 */}
            <div className="flex flex-col items-center gap-3 flex-1">
              <div>
                {steps[1]!.illustration}
              </div>
              <p
                className="text-xs font-semibold text-brand-500 tracking-wide uppercase"
                style={{ fontFamily: "var(--font-body)" }}
              >
                {steps[1]!.label}
              </p>
              <p
                className="text-xs text-[var(--text-tertiary)]"
                style={{ fontFamily: "var(--font-body)" }}
              >
                {steps[1]!.time}
              </p>
            </div>
          </div>

          {/* Vertical wire from Q to Step 3 */}
          <div
            className="h-20 w-[2px]"
            style={{
              background:
                "repeating-linear-gradient(180deg, var(--brand-500) 0, var(--brand-500) 6px, transparent 6px, transparent 12px)",
              opacity: 0.35,
              marginTop: "-106px",
              marginBottom: "10px",
            }}
          />

          {/* Step 3 */}
          <div className="flex flex-col items-center gap-3">
            <div style={{ maxWidth: "260px" }}>
              {steps[2]!.illustration}
            </div>
            <p
              className="text-xs font-semibold text-brand-500 tracking-wide uppercase"
              style={{ fontFamily: "var(--font-body)" }}
            >
              {steps[2]!.label}
            </p>
            <p
              className="text-xs text-[var(--text-tertiary)]"
              style={{ fontFamily: "var(--font-body)" }}
            >
              {steps[2]!.time}
            </p>
          </div>
        </div>
      </div>

      {/* Mobile: simple horizontal scroll or vertical stack */}
      <div className="container md:hidden">
        <div className="flex flex-col items-center gap-6">
          {steps.map((step, i) => (
            <div key={i} className="flex flex-col items-center gap-3">
              <div>
                {step.illustration}
              </div>
              <p
                className="text-xs font-semibold text-brand-500 tracking-wide uppercase"
                style={{ fontFamily: "var(--font-body)" }}
              >
                {step.label}
              </p>
              {i < 2 && (
                <div
                  className="h-8 w-[2px]"
                  style={{
                    background:
                      "repeating-linear-gradient(180deg, var(--brand-500) 0, var(--brand-500) 6px, transparent 6px, transparent 12px)",
                    opacity: 0.3,
                  }}
                />
              )}
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
