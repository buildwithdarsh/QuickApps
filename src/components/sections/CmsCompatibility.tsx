"use client";

import { SectionLabel } from "@/components/ui/SectionLabel";
import { CMS_PLATFORMS } from "@/lib/constants";
import { useScrollReveal } from "@/hooks/useScrollReveal";

// 18 items organized into 3 rows of 6
const ROW_LABELS = [
  "CMS / No-Code",
  "Builders / Tools",
  "Custom Dev",
];

export function CmsCompatibility() {
  const { ref, isVisible } = useScrollReveal();

  const rows = [
    CMS_PLATFORMS.slice(0, 6),
    CMS_PLATFORMS.slice(6, 12),
    CMS_PLATFORMS.slice(12, 18),
  ];

  return (
    <section
      id="compatibility"
      ref={ref}
      className="bg-[var(--bg-secondary)]"
      style={{ padding: "var(--section-py) 0" }}
    >
      <div
        className="container text-center"
        style={{
          opacity: isVisible ? 1 : 0,
          transform: isVisible ? "translateY(0)" : "translateY(32px)",
          transition: "opacity 0.6s var(--ease-out-expo), transform 0.6s var(--ease-out-expo)",
        }}
      >
        <SectionLabel>Works With Everything</SectionLabel>
        <h2
          className="mt-4"
          style={{
            fontFamily: "var(--font-display)",
            fontSize: "clamp(28px, 4vw, 40px)",
            fontWeight: 700,
            lineHeight: 1.1,
          }}
        >
          If it loads in a browser, QuickApps converts it.
        </h2>
        <p
          className="mt-4 mx-auto text-[var(--text-secondary)] text-lg leading-relaxed mb-12"
          style={{ fontFamily: "var(--font-body)", maxWidth: "560px" }}
        >
          No migration. No rebuilding. No code changes.
          <br />
          Your existing website &mdash; exactly as it is &mdash; becomes a native app.
        </p>

        {/* Platform grid — 3 labeled rows */}
        <div className="max-w-[800px] mx-auto space-y-8">
          {rows.map((row, ri) => (
            <div key={ri}>
              <p
                className="text-[10px] uppercase tracking-wider text-[var(--text-tertiary)] mb-3 font-semibold"
                style={{ fontFamily: "var(--font-body)" }}
              >
                {ROW_LABELS[ri]}
              </p>
              <div className="grid grid-cols-3 sm:grid-cols-6 gap-4">
                {row.map((platform, pi) => (
                  <div
                    key={platform}
                    className="group flex items-center justify-center py-3 cursor-default"
                    style={{
                      opacity: isVisible ? 1 : 0,
                      transition: `opacity 0.4s var(--ease-out-expo) ${(ri * 6 + pi) * 40}ms`,
                    }}
                  >
                    <span
                      className="text-sm font-medium text-[var(--text-tertiary)] opacity-50 transition-all duration-200 group-hover:opacity-100 group-hover:text-brand-500 group-hover:scale-105"
                      style={{ fontFamily: "var(--font-body)" }}
                    >
                      {platform}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>

        <p className="mt-12 text-sm text-[var(--text-tertiary)]">
          Don&apos;t see your platform? Everything that opens in a browser works.{" "}
          <a
            href="/contact"
            className="text-brand-500 hover:text-brand-600 transition-colors"
          >
            Contact us to confirm →
          </a>
        </p>
      </div>
    </section>
  );
}
