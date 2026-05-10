"use client";

import { AshokaChakra } from "@/components/illustrations/AshokaChakra";
import { IndiaMap } from "@/components/illustrations/IndiaMap";
import { useScrollReveal } from "@/hooks/useScrollReveal";

export function MadeInIndia() {
  const { ref, isVisible } = useScrollReveal();

  return (
    <section
      id="made-in-india"
      ref={ref}
      className="relative overflow-hidden bg-navy-900 text-white"
      style={{ padding: "128px 0" }}
    >
      {/* Tricolor top bar */}
      <div
        className="absolute top-0 left-0 right-0 h-[4px]"
        style={{
          background:
            "linear-gradient(90deg, #FF9933 0% 33.33%, #FFFFFF 33.33% 66.66%, #138808 66.66% 100%)",
        }}
      />

      {/* Faint India map watermark */}
      <div
        className="absolute pointer-events-none"
        style={{
          right: "-60px",
          top: "50%",
          transform: "translateY(-50%)",
          width: "500px",
          height: "600px",
          opacity: 0.04,
        }}
      >
        <IndiaMap className="w-full h-full" />
      </div>

      <div
        className="container relative text-center"
        style={{
          opacity: isVisible ? 1 : 0,
          transform: isVisible ? "translateY(0)" : "translateY(32px)",
          transition: "opacity 0.8s var(--ease-out-expo), transform 0.8s var(--ease-out-expo)",
        }}
      >
        {/* Ashoka Chakra */}
        <div className="flex justify-center mb-10">
          <AshokaChakra size={120} />
        </div>

        {/* Headline */}
        <h2
          style={{
            fontFamily: "var(--font-display)",
            fontSize: "clamp(36px, 6vw, 64px)",
            fontWeight: 700,
            lineHeight: 1.05,
          }}
        >
          <span className="block">Made in India.</span>
          <span className="block text-brand-500">Made for India.</span>
        </h2>

        {/* Sub-headline */}
        <p
          className="mt-4 text-[rgba(255,255,255,0.6)] text-lg leading-relaxed mx-auto"
          style={{
            fontFamily: "var(--font-body)",
            maxWidth: "520px",
            whiteSpace: "pre-line",
          }}
        >
          And built specifically for the 6.3 crore Indian businesses{"\n"}that global platforms forgot.
        </p>

        {/* Body */}
        <div className="max-w-[600px] mx-auto mt-8 space-y-4">
          <p
            className="text-[rgba(255,255,255,0.7)] text-lg leading-relaxed"
            style={{ fontFamily: "var(--font-body)" }}
          >
            QuickApps is built in Indore, Madhya Pradesh, India. Designed, coded,
            and shipped by Darsh Gupta &mdash; a team that believes Indian businesses
            deserve the same tools as Silicon Valley startups, but built for Indian
            prices, Indian payment methods, and Indian ambitions.
          </p>
          <p
            className="text-[rgba(255,255,255,0.7)] text-lg leading-relaxed"
            style={{ fontFamily: "var(--font-body)" }}
          >
            Every rupee you pay stays in India. Every invoice includes proper GST.
            Every feature is designed with the Indian market in mind.
          </p>
        </div>

        {/* India map with pins */}
        <div className="flex justify-center mt-12">
          <IndiaMap className="w-[240px] md:w-[300px] h-auto" />
        </div>

        {/* Built with love */}
        <p className="mt-10 text-[rgba(255,255,255,0.4)] text-sm tracking-wider">
          &#9472;&#9472;&#9472;&#9472; Built with &#9829; in Indore, MP &#9472;&#9472;&#9472;&#9472;
        </p>

        {/* Closing blockquote */}
        <blockquote
          className="mt-10 mx-auto italic"
          style={{
            maxWidth: "480px",
            fontSize: "18px",
            lineHeight: 1.7,
            color: "rgba(255,255,255,0.6)",
            fontFamily: "var(--font-body)",
          }}
        >
          Every rupee you pay stays in India.
          <br />
          Every feature is built for India.
          <br />
          Every team member is from India.
        </blockquote>
      </div>
    </section>
  );
}
