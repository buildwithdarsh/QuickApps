"use client";

import { SectionLabel } from "@/components/ui/SectionLabel";
import { GradientText } from "@/components/ui/GradientText";
import { AddonCard } from "@/components/ui/AddonCard";
import { Button } from "@/components/ui/Button";
import { ADDONS } from "@/lib/constants";
import { useScrollReveal } from "@/hooks/useScrollReveal";

export function AddonsPreview() {
  const { ref, isVisible } = useScrollReveal();
  const previewAddons = ADDONS.slice(0, 8);

  return (
    <section
      id="addons"
      className="bg-[var(--bg-secondary)]"
      style={{ padding: "var(--section-py) 0" }}
    >
      <div
        className="container"
        ref={ref}
        style={{
          opacity: isVisible ? 1 : 0,
          transform: isVisible ? "translateY(0)" : "translateY(32px)",
          transition:
            "opacity 0.6s var(--ease-out-expo), transform 0.6s var(--ease-out-expo)",
        }}
      >
        <div className="text-center mb-12">
          <SectionLabel>Addon Marketplace</SectionLabel>
          <h2
            className="mt-4"
            style={{
              fontFamily: "var(--font-display)",
              fontSize: "clamp(32px, 5vw, 48px)",
              fontWeight: 700,
              lineHeight: 1.1,
            }}
          >
            50+ addons.{" "}
            <GradientText>Buy once. Keep forever.</GradientText>
          </h2>
          <p
            className="mt-4 mx-auto text-[var(--text-secondary)] text-lg leading-relaxed"
            style={{ fontFamily: "var(--font-body)", maxWidth: "600px" }}
          >
            No subscriptions for addons. Buy what you need. It&apos;s yours in
            every build. Forever.
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-5">
          {previewAddons.map((addon) => (
            <AddonCard key={addon.name} addon={addon} />
          ))}
        </div>

        <div className="text-center mt-10">
          <Button variant="secondary" href="/addons">
            Explore all 50+ addons →
          </Button>
        </div>
      </div>
    </section>
  );
}
