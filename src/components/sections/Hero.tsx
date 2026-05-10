"use client";

import { useEffect, useState } from "react";
import { GradientText } from "@/components/ui/GradientText";
import { Button } from "@/components/ui/Button";
import { AnimatedCounter } from "@/components/ui/AnimatedCounter";
import { PhoneMockup } from "@/components/illustrations/PhoneMockup";


const HERO_STATS = [
  { value: 200000, prefix: "", suffix: "+", label: "Apps converted worldwide" },
  { value: 1999, prefix: "\u20B9", suffix: "", label: "Starting price" },
  { value: 15, prefix: "", suffix: " min", label: "Guaranteed build time" },
  { value: 50, prefix: "", suffix: "+", label: "Addons" },
];

const TRUST_SIGNALS = [
  "No credit card needed",
  "Pay with UPI or Razorpay",
  "GST invoice on every purchase",
  "15-minute build. Guaranteed.",
  "Made in India",
  "Free demo \u2014 always",
];

export function Hero() {
  const [loaded, setLoaded] = useState(false);
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const timer = setTimeout(() => setLoaded(true), 100);
    return () => clearTimeout(timer);
  }, []);

  useEffect(() => {
    function onScroll() {
      setScrolled(window.scrollY > 80);
    }
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  return (
    <section
      id="hero"
      className="relative overflow-hidden"
      style={{
        background: "var(--gradient-hero)",
        paddingTop: "calc(var(--navbar-height) + var(--section-py))",
        paddingBottom: "var(--section-py)",
      }}
    >
      {/* Subtle radial glow */}
      <div
        className="absolute pointer-events-none"
        style={{
          top: "20%",
          left: "50%",
          transform: "translateX(-50%)",
          width: "800px",
          height: "600px",
          background: "radial-gradient(ellipse, rgba(249,115,22,0.06) 0%, transparent 70%)",
        }}
      />

      {/* Blinking dot keyframes */}
      <style>{`
        @keyframes blink-dot {
          0%, 100% { opacity: 1; }
          50% { opacity: 0.3; }
        }
      `}</style>

      <div className="container text-center">
        {/* Pill badge */}
        <div
          style={{
            opacity: loaded ? 1 : 0,
            transform: loaded ? "translateY(0)" : "translateY(8px)",
            transition: "opacity 0.5s var(--ease-out-expo) 300ms, transform 0.5s var(--ease-out-expo) 300ms",
          }}
        >
          <span
            className="inline-flex items-center gap-2 text-xs font-semibold uppercase tracking-wider"
            style={{
              background: "var(--brand-500)",
              color: "#fff",
              padding: "8px 20px",
              borderRadius: "var(--radius-pill)",
              fontFamily: "var(--font-body)",
            }}
          >
            <span
              style={{
                display: "inline-block",
                width: "8px",
                height: "8px",
                borderRadius: "50%",
                backgroundColor: "#fff",
                animation: "blink-dot 1.4s ease-in-out infinite",
              }}
            />
            India&apos;s first website to native app platform
          </span>
        </div>

        {/* Headline */}
        <h1
          className="mt-6 mx-auto"
          style={{
            fontFamily: "var(--font-display)",
            fontSize: "clamp(40px, 8vw, 72px)",
            fontWeight: 700,
            lineHeight: 1.05,
            color: "var(--text-primary)",
          }}
        >
          {["Your website.", "Native app.", "15 minutes. Guaranteed."].map((line, i) => (
            <span
              key={i}
              className="block"
              style={{
                opacity: loaded ? 1 : 0,
                transform: loaded ? "translateY(0)" : "translateY(16px)",
                transition: `opacity 0.5s var(--ease-out-expo) ${400 + i * 120}ms, transform 0.5s var(--ease-out-expo) ${400 + i * 120}ms`,
              }}
            >
              {i === 1 ? (
                <>
                  <GradientText>Native</GradientText> app.
                </>
              ) : i === 2 ? (
                <>
                  15 minutes.{" "}
                  <span
                    style={{
                      borderBottom: "3px solid var(--brand-500)",
                      paddingBottom: "2px",
                    }}
                  >
                    Guaranteed.
                  </span>
                </>
              ) : (
                line
              )}
            </span>
          ))}
        </h1>

        {/* Subtext */}
        <p
          className="mt-6 mx-auto text-[var(--text-secondary)]"
          style={{
            fontFamily: "var(--font-body)",
            fontSize: "18px",
            maxWidth: "620px",
            lineHeight: 1.65,
            opacity: loaded ? 1 : 0,
            transition: "opacity 0.5s var(--ease-out-expo) 900ms",
          }}
        >
          India&apos;s first self-serve platform that converts any website into a Play Store and
          App Store-ready native app &mdash; with Razorpay checkout, UPI payments, push
          notifications, biometrics, and 50+ addons.
        </p>

        {/* Pricing paragraph */}
        <p
          className="mt-4 mx-auto text-[var(--text-tertiary)]"
          style={{
            fontFamily: "var(--font-body)",
            fontSize: "15px",
            maxWidth: "500px",
            lineHeight: 1.7,
            opacity: loaded ? 1 : 0,
            transition: "opacity 0.5s var(--ease-out-expo) 950ms",
          }}
        >
          Starting at ₹1,999 one-time.
          <br />
          <span className="text-brand-500 font-medium">Not</span> ₹50,000.{" "}
          <span className="text-brand-500 font-medium">Not</span> 6 months.{" "}
          <span className="text-brand-500 font-medium">Not</span> a developer.
        </p>

        {/* Social proof line */}
        <p
          className="mt-6 text-sm text-[var(--text-tertiary)]"
          style={{
            fontFamily: "var(--font-body)",
            opacity: loaded ? 1 : 0,
            transition: "opacity 0.5s var(--ease-out-expo) 1000ms",
          }}
        >
          Trusted by 500+ Indian businesses &nbsp;&middot;&nbsp; Built in Indore &nbsp;&middot;&nbsp; Backed by Darsh Gupta
        </p>

        {/* CTA buttons */}
        <div
          className="mt-8 flex flex-col sm:flex-row items-center justify-center gap-4"
          style={{
            opacity: loaded ? 1 : 0,
            transform: loaded ? "translateY(0) scale(1)" : "translateY(8px) scale(0.95)",
            transition: "opacity 0.5s var(--ease-out-expo) 1100ms, transform 0.5s var(--ease-out-expo) 1100ms",
          }}
        >
          <Button variant="primary" href="#demo">
            Build your app &mdash; free demo →
          </Button>
          <Button variant="secondary" href="/login">
            Sign in &amp; go to dashboard →
          </Button>
        </div>

        {/* Trust signals row */}
        <div
          className="mt-10 flex flex-wrap items-center justify-center gap-x-6 gap-y-2"
          style={{
            opacity: loaded ? 1 : 0,
            transition: "opacity 0.5s var(--ease-out-expo) 1300ms",
          }}
        >
          {TRUST_SIGNALS.map((item) => (
            <span
              key={item}
              className="text-xs text-[var(--text-tertiary)] flex items-center gap-1.5 whitespace-nowrap"
              style={{ fontFamily: "var(--font-body)" }}
            >
              <span className="text-brand-500">&#10003;</span> {item}
            </span>
          ))}
        </div>

        {/* Phone mockup */}
        <div
          className="mt-16"
          style={{
            opacity: loaded ? 1 : 0,
            transform: loaded ? "translateY(0) scale(1)" : "translateY(40px) scale(0.95)",
            transition: "opacity 0.6s var(--ease-out-expo) 1400ms, transform 0.6s var(--ease-out-expo) 1400ms",
          }}
        >
          <PhoneMockup />
        </div>

        {/* Stats row */}
        <div
          className="mt-16 flex flex-col sm:flex-row items-center justify-center gap-8 sm:gap-0 sm:divide-x sm:divide-[var(--border-subtle)]"
          style={{
            opacity: loaded ? 1 : 0,
            transition: "opacity 0.5s var(--ease-out-expo) 1800ms",
          }}
        >
          {HERO_STATS.map((stat) => (
            <div key={stat.label} className="sm:px-12 text-center">
              <p
                className="text-[36px] font-bold text-[var(--text-primary)]"
                style={{ fontFamily: "var(--font-display)" }}
              >
                <AnimatedCounter
                  target={stat.value}
                  prefix={stat.prefix}
                  suffix={stat.suffix}
                />
              </p>
              <p
                className="text-[13px] uppercase tracking-wider text-[var(--text-tertiary)] mt-1"
                style={{ fontFamily: "var(--font-body)" }}
              >
                {stat.label}
              </p>
            </div>
          ))}
        </div>

        {/* Hero bottom whisper */}
        <p
          className="mt-12 mx-auto text-sm italic text-[var(--text-tertiary)]"
          style={{
            maxWidth: "560px",
            fontFamily: "var(--font-body)",
            lineHeight: 1.6,
            opacity: scrolled ? 0.7 : 0,
            transform: scrolled ? "translateY(0)" : "translateY(8px)",
            transition: "opacity 0.6s ease, transform 0.6s ease",
          }}
        >
          The only website-to-app platform in India with Razorpay, UPI, and WhatsApp &mdash; built in. No other platform offers this.
        </p>
      </div>
    </section>
  );
}
