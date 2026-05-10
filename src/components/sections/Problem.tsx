"use client";

import { SectionLabel } from "@/components/ui/SectionLabel";
import { GradientText } from "@/components/ui/GradientText";
import { useScrollReveal } from "@/hooks/useScrollReveal";
import { cn } from "@/lib/utils";
import { TrendingUp, CalendarX, Globe } from "lucide-react";

const painCards = [
  {
    icon: <TrendingUp size={24} />,
    number: "\u20B950,000\u2013\u20B92,00,000",
    label: "What a developer charges",
    body: "For an app that QuickApps generates in 15 minutes. Agencies quote \u20B92 lakh. Freelancers quote \u20B950K. The app you\u2019re imagining costs less than their retainer fee.",
    badge: "COST",
    badgeColor: "#DC2626",
    accentColor: "#DC2626",
  },
  {
    icon: <CalendarX size={24} />,
    number: "3\u20136 months",
    label: "Average agency delivery time",
    body: "Requirements. Revisions. App store rejection. Re-submission. By the time it\u2019s live, your competitor has already acquired the customers you were targeting.",
    badge: "TIME",
    badgeColor: "#D97706",
    accentColor: "#D97706",
  },
  {
    icon: <Globe size={24} />,
    number: "USD only",
    label: "Every major competitor",
    body: "No UPI. No Razorpay. No Indian net banking. International card required to use tools that claim to be \u2018built for everyone.\u2019 They were never built for India.",
    badge: "ACCESS",
    badgeColor: "var(--text-tertiary)",
    accentColor: "var(--text-tertiary)",
  },
];

export function Problem() {
  const { ref: headRef, isVisible: headVisible } = useScrollReveal();
  const { ref: cardsRef, isVisible: cardsVisible } = useScrollReveal();
  const { ref: resolveRef, isVisible: resolveVisible } = useScrollReveal();

  return (
    <section
      id="problem"
      className="bg-[var(--bg-primary)]"
      style={{ padding: "var(--section-py) 0" }}
    >
      <div className="container">
        {/* Headline */}
        <div
          ref={headRef}
          className="max-w-[720px]"
          style={{
            opacity: headVisible ? 1 : 0,
            transform: headVisible ? "translateY(0)" : "translateY(24px)",
            transition: "opacity 0.6s var(--ease-out-expo), transform 0.6s var(--ease-out-expo)",
          }}
        >
          <SectionLabel>The Reality</SectionLabel>
          <h2
            className="mt-4"
            style={{
              fontFamily: "var(--font-display)",
              fontSize: "clamp(32px, 5vw, 48px)",
              fontWeight: 700,
              lineHeight: 1.1,
              color: "var(--text-primary)",
            }}
          >
            Every Indian business deserves a mobile app.
            <br />
            <GradientText>Almost none can afford one.</GradientText>
          </h2>

          {/* Body copy */}
          <div
            className="mt-6 space-y-4 text-[var(--text-secondary)] leading-relaxed"
            style={{ fontFamily: "var(--font-body)", fontSize: "17px" }}
          >
            <p>
              India has 6.3 crore registered businesses.
              <br />
              Less than 2% have a mobile app.
            </p>
            <p>
              Not because they don&apos;t want one.
              <br />
              Because the system was never built for them.
            </p>
          </div>
        </div>

        {/* Pain cards */}
        <div
          ref={cardsRef}
          className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-12"
        >
          {painCards.map((card, i) => (
            <div
              key={card.label}
              className={cn(
                "bg-bg-secondary border border-[var(--border-subtle)] p-8 relative",
              )}
              style={{
                borderRadius: "var(--radius-lg)",
                opacity: cardsVisible ? 1 : 0,
                transform: cardsVisible ? "translateY(0)" : "translateY(24px)",
                transition: `opacity 0.5s var(--ease-out-expo) ${i * 80}ms, transform 0.5s var(--ease-out-expo) ${i * 80}ms`,
              }}
            >
              {/* Badge */}
              <span
                className="absolute top-4 right-4 text-[10px] font-bold uppercase tracking-wider px-2 py-0.5"
                style={{
                  borderRadius: "var(--radius-pill)",
                  backgroundColor: `${card.badgeColor}15`,
                  color: card.badgeColor,
                  fontFamily: "var(--font-body)",
                }}
              >
                {card.badge}
              </span>

              <div
                className="w-10 h-10 rounded-lg grid place-items-center mb-4"
                style={{
                  backgroundColor: `${card.accentColor}15`,
                  color: card.accentColor,
                }}
              >
                {card.icon}
              </div>
              <p
                className="text-2xl font-bold mb-1"
                style={{
                  fontFamily: "var(--font-display)",
                  color: card.accentColor,
                }}
              >
                {card.number}
              </p>
              <p
                className="text-sm font-semibold text-[var(--text-primary)] mb-2"
                style={{ fontFamily: "var(--font-display)" }}
              >
                {card.label}
              </p>
              <p className="text-sm text-[var(--text-tertiary)] leading-relaxed">
                {card.body}
              </p>
            </div>
          ))}
        </div>

        {/* Resolution */}
        <div
          ref={resolveRef}
          className="text-center mt-20"
          style={{
            opacity: resolveVisible ? 1 : 0,
            transform: resolveVisible ? "translateY(0) scale(1)" : "translateY(16px) scale(0.97)",
            transition: "opacity 0.6s var(--ease-out-expo), transform 0.6s var(--ease-out-expo)",
          }}
        >
          <h3
            style={{
              fontFamily: "var(--font-display)",
              fontSize: "clamp(32px, 5vw, 56px)",
              fontWeight: 700,
              color: "var(--text-primary)",
            }}
          >
            Then <GradientText>QuickApps</GradientText> was built.
          </h3>

          {/* Tricolor line */}
          <div
            className="mx-auto mt-4 h-[3px]"
            style={{
              width: "120px",
              background: "linear-gradient(90deg, #FF9933 0% 33.33%, #FFFFFF 33.33% 66.66%, #138808 66.66% 100%)",
              borderRadius: "2px",
              transform: resolveVisible ? "scaleX(1)" : "scaleX(0)",
              transition: "transform 0.8s var(--ease-out-expo) 0.3s",
            }}
          />

          {/* Sub-copy */}
          <p
            className="mt-6 mx-auto text-[var(--text-secondary)] leading-relaxed"
            style={{
              fontFamily: "var(--font-body)",
              fontSize: "17px",
              maxWidth: "560px",
            }}
          >
            India&apos;s first website-to-app platform built for Indian businesses, Indian prices, and Indian payment methods.
          </p>
        </div>
      </div>
    </section>
  );
}
