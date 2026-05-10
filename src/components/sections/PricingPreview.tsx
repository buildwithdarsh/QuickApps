"use client";

import { SectionLabel } from "@/components/ui/SectionLabel";
import { GradientText } from "@/components/ui/GradientText";
import { PlanCard } from "@/components/ui/PlanCard";
import { Button } from "@/components/ui/Button";
import { PLANS } from "@/lib/constants";
import { useScrollReveal } from "@/hooks/useScrollReveal";

export function PricingPreview() {
  const { ref, isVisible } = useScrollReveal();

  return (
    <section
      id="pricing"
      ref={ref}
      className="bg-[var(--bg-primary)]"
      style={{ padding: "var(--section-py) 0" }}
    >
      <div
        className="container"
        style={{
          opacity: isVisible ? 1 : 0,
          transform: isVisible ? "translateY(0)" : "translateY(32px)",
          transition:
            "opacity 0.6s var(--ease-out-expo), transform 0.6s var(--ease-out-expo)",
        }}
      >
        <div className="text-center mb-16">
          <SectionLabel>Pricing</SectionLabel>
          <h2
            className="mt-4"
            style={{
              fontFamily: "var(--font-display)",
              fontSize: "clamp(32px, 5vw, 48px)",
              fontWeight: 700,
              lineHeight: 1.1,
            }}
          >
            Simple, honest, <GradientText>Indian</GradientText>.
          </h2>
          <p
            className="mt-4 mx-auto text-[var(--text-secondary)] text-lg leading-relaxed"
            style={{ fontFamily: "var(--font-body)", maxWidth: "480px" }}
          >
            Every price in Indian Rupees.
            <br />
            Pay with UPI, Razorpay, or card.
            <br />
            GST invoice on every purchase. Always.
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8 items-start max-w-[960px] mx-auto">
          {PLANS.slice(0, 3).map((plan) => (
            <PlanCard key={plan.name} plan={plan} />
          ))}
        </div>

        <div className="text-center mt-10">
          <Button variant="secondary" href="/pricing">
            See all plans & FAQ →
          </Button>
        </div>
      </div>
    </section>
  );
}
