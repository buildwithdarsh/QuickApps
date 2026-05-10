"use client";

import { SectionLabel } from "@/components/ui/SectionLabel";
import { GradientText } from "@/components/ui/GradientText";
import { useScrollReveal } from "@/hooks/useScrollReveal";
import {
  PushNotificationIllustration,
  PaymentIllustration,
  BiometricIllustration,
  DashboardFeatureIllustration,
} from "@/components/illustrations/FeatureIllustrations";

/* ── Types ───────────────────────────────────────── */

interface Feature {
  label: string;
  title: string;
  sub: string;
  body: string;
  cta?: string;
  proofLine?: string;
  callout?: string;
  statLine?: string;
  illustration: React.ReactNode;
}

/* ── Data ────────────────────────────────────────── */

const features: Feature[] = [
  {
    label: "NOTIFICATIONS",
    title: "Bring users back.",
    sub: "Push notifications that actually get opened.",
    body: "OneSignal-powered push with segmentation, automation, and rich media. Set it up by pasting one key in your dashboard.\n\nNo developer. No backend integration. No API documentation to read at midnight. Paste your key. Send your first notification. Done.",
    proofLine:
      "\u201COur open rate went from 8% to 34% after switching to app push.\u201D \u2014 Meera S., EdTech founder, Lucknow",
    cta: "See OneSignal Addon \u2014 \u20B9699 \u2192",
    illustration: <PushNotificationIllustration />,
  },
  {
    label: "INDIA-EXCLUSIVE \uD83C\uDDEE\uD83C\uDDF3",
    title: "Razorpay. Inside your app.",
    sub: "The only platform in the world offering this.",
    body: "Native Razorpay payment sheet inside your app. No browser redirect.\n\nUPI (GPay, PhonePe, Paytm), credit cards, debit cards, net banking, wallets, EMI, and Pay Later.\n\nYour customer taps \u201CPay.\u201D Razorpay opens natively. They pay. They return to your app. Instantly.\n\nNo other website-to-app platform \u2014 anywhere in the world \u2014 offers this. This exists only on QuickApps.",
    callout:
      "\uD83C\uDDEE\uD83C\uDDF3 India-exclusive\n\nEvery competitor charges in USD.\nNo competitor offers Razorpay in-app checkout.\nNo competitor supports UPI deep link payments.\n\nThese exist only on QuickApps.",
    cta: "See Razorpay Checkout Addon \u2014 \u20B9999 \u2192",
    illustration: <PaymentIllustration />,
  },
  {
    label: "SECURITY",
    title: "Make your app feel native.",
    sub: "Fingerprint. Face ID. Device PIN. In your web app.",
    body: "Lock your app with biometrics on open or after inactivity. Works with your existing web session \u2014 biometric success automatically logs the user in. No re-entering passwords.\n\nThe feature users expect in every native app. The feature your developer said would \u201Ctake two weeks minimum.\u201D\n\nOn QuickApps: two minutes.",
    cta: "See Biometric Auth Addon \u2014 \u20B9499 \u2192",
    illustration: <BiometricIllustration />,
  },
  {
    label: "THE DASHBOARD",
    title: "Zero developer. Ever.",
    sub: "Every feature. Every build. Every addon. One dashboard.",
    body: "Upload your icon.\nSet your splash screen.\nPaste your OneSignal key.\nEnable biometrics.\nAdd a bottom navigation bar.\nBuy Razorpay checkout.\nTrigger your build.\nDownload your APK.\n\nNo tickets to raise. No Slack messages to a developer. No \u201Cit\u2019ll be ready by Friday\u201D \u2014 which means Monday.",
    statLine: "Average time from signup to APK download: 23 minutes.",
    cta: "See all dashboard features \u2192",
    illustration: <DashboardFeatureIllustration />,
  },
  {
    label: "INDIA-EXCLUSIVE \uD83C\uDDEE\uD83C\uDDF3",
    title: "WhatsApp. Right inside your app.",
    sub: "The most-used app in India. Now part of yours.",
    body: "A floating WhatsApp button with your business number pre-configured. One tap \u2014 WhatsApp opens \u2014 your customer messages you directly.\n\nFor Indian service businesses, this is the difference between a customer who enquires and a customer who disappears.\n\n\u20B9299. Permanently yours after one purchase.",
    cta: "See WhatsApp Bridge Addon \u2014 \u20B9299 \u2192",
    illustration: null,
  },
  {
    label: "INDIA-EXCLUSIVE \uD83C\uDDEE\uD83C\uDDF3",
    title: "GPay. PhonePe. Paytm. All of them.",
    sub: "Every UPI app. One tap. Inside your app.",
    body: "Direct UPI payment via deep link \u2014 opens whichever UPI app your customer prefers. GPay, PhonePe, Paytm, or any UPI app.\n\nPayment confirmation returns to your app automatically. No redirect. No confusion. No drop-off.\n\nThis is how 80 crore Indians pay. This is how your app should work.",
    cta: "See UPI Deep Link Addon \u2014 \u20B9499 \u2192",
    illustration: null,
  },
];

/* ── Feature card — illustration on top, text below ─ */

function FeatureCard({
  feature,
  index,
}: {
  feature: Feature;
  index: number;
}) {
  const { ref, isVisible } = useScrollReveal({ threshold: 0.1 });

  return (
    <div
      ref={ref}
      style={{
        opacity: isVisible ? 1 : 0,
        transform: isVisible ? "translateY(0)" : "translateY(32px)",
        transition:
          "opacity 0.6s var(--ease-out-expo), transform 0.6s var(--ease-out-expo)",
        transitionDelay: `${index * 80}ms`,
      }}
    >
      <div
        className="relative overflow-hidden"
        style={{
          background: "var(--bg-elevated)",
          border: "1px solid var(--border-subtle)",
          borderRadius: "var(--radius-xl)",
          boxShadow: "var(--shadow-sm)",
          padding: "clamp(32px, 5vw, 56px)",
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
        {/* Illustration — centered above text */}
        {feature.illustration && (
          <div className="flex justify-center mb-8">
            {feature.illustration}
          </div>
        )}

        {/* Text content */}
        <SectionLabel>{feature.label}</SectionLabel>
        <h3
          className="mt-3"
          style={{
            fontFamily: "var(--font-display)",
            fontSize: "clamp(24px, 3.5vw, 36px)",
            fontWeight: 600,
            lineHeight: 1.15,
            color: "var(--text-primary)",
          }}
        >
          {feature.title}
        </h3>
        <p
          className="mt-2 text-[var(--text-tertiary)] text-base"
          style={{ fontFamily: "var(--font-body)" }}
        >
          {feature.sub}
        </p>
        <div className="mt-5 space-y-3">
          {feature.body.split("\n\n").map((para, i) => (
            <p
              key={i}
              className="text-[var(--text-secondary)] leading-relaxed"
              style={{ fontSize: "16px", whiteSpace: "pre-line" }}
            >
              {para}
            </p>
          ))}
        </div>

        {feature.callout && (
          <div
            className="mt-6 p-5"
            style={{
              borderLeft: "3px solid var(--brand-500)",
              background: "rgba(249,115,22,0.04)",
              borderRadius: "0 var(--radius-md) var(--radius-md) 0",
              whiteSpace: "pre-line",
            }}
          >
            <p className="text-sm text-[var(--text-secondary)] leading-relaxed">
              {feature.callout}
            </p>
          </div>
        )}

        {feature.proofLine && (
          <p
            className="mt-5 text-sm italic text-[var(--text-tertiary)] leading-relaxed"
            style={{ fontFamily: "var(--font-body)" }}
          >
            {feature.proofLine}
          </p>
        )}

        {feature.statLine && (
          <p
            className="mt-5 text-lg font-bold text-brand-500"
            style={{ fontFamily: "var(--font-display)" }}
          >
            {feature.statLine}
          </p>
        )}

        {feature.cta && (
          <a
            href="#addons"
            className="mt-5 inline-block text-brand-500 font-semibold text-sm hover:text-brand-600 transition-colors"
            style={{ fontFamily: "var(--font-body)" }}
          >
            {feature.cta}
          </a>
        )}
      </div>
    </div>
  );
}

/* ── Main section ────────────────────────────────── */

export function FeatureShowcase() {
  const { ref: headRef, isVisible: headVisible } = useScrollReveal();

  return (
    <section id="features" className="bg-[var(--bg-primary)]">
      <div className="container">
        {/* Section headline */}
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
            <br />
            And then some.
          </h2>
          <p
            className="mt-4 mx-auto text-[var(--text-secondary)] text-lg"
            style={{ fontFamily: "var(--font-body)", maxWidth: "600px" }}
          >
            Every feature is self-serve. Every addon is one-time. Every build is
            guaranteed in 15 minutes.
          </p>
        </div>

        {/* Feature cards — masonry layout */}
        <div
          style={{
            paddingTop: "64px",
            paddingBottom: "var(--section-py)",
            columns: "1",
            columnGap: "24px",
          }}
          className="md:[columns:2]"
        >
          {features.map((feature, i) => (
            <div key={feature.title} className="mb-6" style={{ breakInside: "avoid" }}>
              <FeatureCard feature={feature} index={i} />
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
