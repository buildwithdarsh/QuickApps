"use client";

import { SectionLabel } from "@/components/ui/SectionLabel";
import { GradientText } from "@/components/ui/GradientText";
import { Button } from "@/components/ui/Button";
import { useScrollReveal } from "@/hooks/useScrollReveal";
import {
  PushNotificationIllustration,
  PaymentIllustration,
  BiometricIllustration,
} from "@/components/illustrations/FeatureIllustrations";

/* ── Shared card shell ───────────────────────────── */

function CardShell({
  children,
  className,
}: {
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <div
      className={`relative overflow-hidden h-full ${className ?? ""}`}
      style={{
        background: "var(--bg-elevated)",
        border: "1px solid var(--border-subtle)",
        borderRadius: "var(--radius-xl)",
        boxShadow: "var(--shadow-sm)",
        padding: "clamp(28px, 4vw, 40px)",
        transition:
          "box-shadow 0.3s var(--ease-smooth), border-color 0.3s var(--ease-smooth)",
      }}
      onMouseEnter={(e) => {
        e.currentTarget.style.boxShadow = "var(--shadow-md)";
        e.currentTarget.style.borderColor = "var(--border-default)";
      }}
      onMouseLeave={(e) => {
        e.currentTarget.style.boxShadow = "var(--shadow-sm)";
        e.currentTarget.style.borderColor = "var(--border-subtle)";
      }}
    >
      {children}
    </div>
  );
}

/* ── Main section ────────────────────────────────── */

export function FeaturesPreview() {
  const { ref: headRef, isVisible: headVisible } = useScrollReveal();
  const { ref: gridRef, isVisible: gridVisible } = useScrollReveal({
    threshold: 0.08,
  });

  return (
    <section id="features" className="bg-[var(--bg-primary)]">
      <div className="container">
        {/* Header */}
        <div
          ref={headRef}
          className="text-center"
          style={{
            paddingTop: "var(--section-py)",
            opacity: headVisible ? 1 : 0,
            transform: headVisible ? "translateY(0)" : "translateY(24px)",
            transition:
              "opacity 0.6s var(--ease-out-expo), transform 0.6s var(--ease-out-expo)",
          }}
        >
          <SectionLabel>Features</SectionLabel>
          <h2
            className="mt-4"
            style={{
              fontFamily: "var(--font-display)",
              fontSize: "clamp(32px, 5vw, 48px)",
              fontWeight: 700,
              lineHeight: 1.1,
            }}
          >
            Everything an <GradientText>Indian</GradientText> app needs.
          </h2>
          <p
            className="mt-4 mx-auto text-[var(--text-secondary)] text-lg"
            style={{ fontFamily: "var(--font-body)", maxWidth: "600px" }}
          >
            Every feature is self-serve. Every addon is one-time. Every build is
            guaranteed in 15 minutes.
          </p>
        </div>

        {/* L-shaped grid: Razorpay tall left, Notifications + Biometrics stacked right */}
        <div
          ref={gridRef}
          className="grid grid-cols-1 md:grid-cols-2 gap-6"
          style={{
            paddingTop: "48px",
            opacity: gridVisible ? 1 : 0,
            transform: gridVisible ? "translateY(0)" : "translateY(32px)",
            transition:
              "opacity 0.6s var(--ease-out-expo), transform 0.6s var(--ease-out-expo)",
          }}
        >
          {/* Left: Razorpay — spans full height of both right cards */}
          <div className="md:row-span-2">
            <CardShell>
              <div className="flex justify-center mb-6">
                <PaymentIllustration />
              </div>

              <SectionLabel>
                INDIA-EXCLUSIVE {"\uD83C\uDDEE\uD83C\uDDF3"}
              </SectionLabel>
              <h3
                className="mt-3"
                style={{
                  fontFamily: "var(--font-display)",
                  fontSize: "clamp(24px, 3.5vw, 34px)",
                  fontWeight: 600,
                  lineHeight: 1.15,
                  color: "var(--text-primary)",
                }}
              >
                Razorpay. Inside your app.
              </h3>
              <p
                className="mt-2 text-[var(--text-secondary)] leading-relaxed"
                style={{ fontFamily: "var(--font-body)", fontSize: "16px" }}
              >
                Native Razorpay payment sheet inside your app. No browser
                redirect. UPI (GPay, PhonePe, Paytm), credit cards, debit
                cards, net banking, wallets, EMI, and Pay Later.
              </p>
              <p
                className="mt-3 text-[var(--text-secondary)] leading-relaxed"
                style={{ fontFamily: "var(--font-body)", fontSize: "16px" }}
              >
                Your customer taps &ldquo;Pay.&rdquo; Razorpay opens natively.
                They pay. They return to your app. Instantly.
              </p>

              {/* Callout */}
              <div
                className="mt-6 p-4"
                style={{
                  borderLeft: "3px solid var(--brand-500)",
                  background: "rgba(249,115,22,0.04)",
                  borderRadius: "0 var(--radius-md) var(--radius-md) 0",
                }}
              >
                <p className="text-sm text-[var(--text-secondary)] leading-relaxed">
                  Every competitor charges in USD.
                  <br />
                  No competitor offers Razorpay in-app checkout.
                  <br />
                  No competitor supports UPI deep link payments.
                  <br />
                  <strong className="text-[var(--text-primary)]">
                    These exist only on QuickApps.
                  </strong>
                </p>
              </div>

              <a
                href="/features"
                className="mt-5 inline-block text-brand-500 font-semibold text-sm hover:text-brand-600 transition-colors"
                style={{ fontFamily: "var(--font-body)" }}
              >
                See Razorpay Checkout Addon — ₹999 →
              </a>
            </CardShell>
          </div>

          {/* Top right: Notifications */}
          <div>
            <CardShell>
              <div className="flex justify-center mb-5">
                <PushNotificationIllustration />
              </div>

              <SectionLabel>NOTIFICATIONS</SectionLabel>
              <h3
                className="mt-3"
                style={{
                  fontFamily: "var(--font-display)",
                  fontSize: "clamp(20px, 3vw, 28px)",
                  fontWeight: 600,
                  lineHeight: 1.2,
                  color: "var(--text-primary)",
                }}
              >
                Bring users back.
              </h3>
              <p
                className="mt-2 text-[var(--text-secondary)] leading-relaxed text-[15px]"
                style={{ fontFamily: "var(--font-body)" }}
              >
                OneSignal-powered push with segmentation, automation, and rich
                media. Paste one key. Done.
              </p>
            </CardShell>
          </div>

          {/* Bottom right: Biometrics */}
          <div>
            <CardShell>
              <div className="flex justify-center mb-5">
                <BiometricIllustration />
              </div>

              <SectionLabel>SECURITY</SectionLabel>
              <h3
                className="mt-3"
                style={{
                  fontFamily: "var(--font-display)",
                  fontSize: "clamp(20px, 3vw, 28px)",
                  fontWeight: 600,
                  lineHeight: 1.2,
                  color: "var(--text-primary)",
                }}
              >
                Make your app feel native.
              </h3>
              <p
                className="mt-2 text-[var(--text-secondary)] leading-relaxed text-[15px]"
                style={{ fontFamily: "var(--font-body)" }}
              >
                Fingerprint. Face ID. Device PIN. Works with your existing web
                session. Two minutes to set up.
              </p>
            </CardShell>
          </div>
        </div>

        {/* CTA */}
        <div
          className="text-center"
          style={{ paddingTop: "24px", paddingBottom: "var(--section-py)" }}
        >
          <Button variant="secondary" href="/features">
            View all features →
          </Button>
        </div>
      </div>
    </section>
  );
}
