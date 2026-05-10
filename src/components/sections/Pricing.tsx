"use client";

import { useState } from "react";
import { SectionLabel } from "@/components/ui/SectionLabel";
import { GradientText } from "@/components/ui/GradientText";
import { PlanCard } from "@/components/ui/PlanCard";
import { PLANS } from "@/lib/constants";
import { useScrollReveal } from "@/hooks/useScrollReveal";
import { Shield, CreditCard, ChevronDown } from "lucide-react";

const FAQ_ITEMS = [
  {
    q: "Is this really one-time? No hidden monthly fees?",
    a: "Yes. Starter, Pro, and Premium are one-time payments. You pay once, you own your app builds forever. Addons are also one-time. The only recurring plan is Agency, which is monthly because it includes unlimited client apps and white-labeling infrastructure.",
  },
  {
    q: "What if I need to rebuild my app after updating my website?",
    a: "Every plan includes free revisions (the number varies by plan). After that, rebuilds are available at a nominal cost. Your addons carry over to every rebuild \u2014 you never re-buy them.",
  },
  {
    q: "Do I need a developer to use QuickApps?",
    a: "No. QuickApps is designed for non-technical business owners. If your website loads in a browser, you can convert it into an app. The dashboard explains everything in plain English.",
  },
  {
    q: "Can I pay with UPI?",
    a: "Yes. We accept UPI, credit cards, debit cards, net banking, wallets, EMI, and Pay Later \u2014 all via Razorpay. Every payment generates a GST invoice automatically.",
  },
  {
    q: "What\u2019s the difference between Pro and Premium?",
    a: "Pro gives you Android + iOS builds, full addon store access, priority builds, and the JS Bridge SDK. Premium includes every addon unlocked (you don\u2019t buy them separately), immediate build queue, more free revisions, and priority support.",
  },
];

export function Pricing() {
  const { ref, isVisible } = useScrollReveal();
  const [openFaq, setOpenFaq] = useState<number | null>(null);

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
          transition: "opacity 0.6s var(--ease-out-expo), transform 0.6s var(--ease-out-expo)",
        }}
      >
        {/* Header */}
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

        {/* Plan cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8 items-start max-w-[960px] mx-auto">
          {PLANS.map((plan) => (
            <PlanCard key={plan.name} plan={plan} />
          ))}
        </div>

        {/* Pricing comparison block */}
        <div
          className="mt-12 mx-auto max-w-[640px] p-8 text-center"
          style={{
            background: "rgba(249,115,22,0.05)",
            borderRadius: "var(--radius-lg)",
            border: "1px solid rgba(249,115,22,0.15)",
          }}
        >
          <p
            className="text-[var(--text-secondary)] leading-relaxed"
            style={{ fontFamily: "var(--font-body)", fontSize: "16px" }}
          >
            Competitors charge $49\u2013$399/month = ₹4,100\u2013₹33,000/month
          </p>
          <p
            className="mt-3 text-2xl font-bold text-brand-500"
            style={{ fontFamily: "var(--font-display)" }}
          >
            QuickApps: ₹1,999 one-time.
          </p>
          <p
            className="mt-2 text-[var(--text-secondary)] font-medium"
            style={{ fontFamily: "var(--font-body)" }}
          >
            You do the maths.
          </p>
        </div>

        {/* Reassurance strip */}
        <div className="mt-12 text-center">
          <div className="flex flex-wrap items-center justify-center gap-6 text-sm text-[var(--text-tertiary)]">
            <span className="flex items-center gap-2">
              <CreditCard size={16} className="text-brand-500" />
              All prices in Indian Rupees (₹)
            </span>
            <span className="flex items-center gap-2">
              <Shield size={16} className="text-brand-500" />
              Secure payments via Razorpay
            </span>
            <span>UPI &middot; Cards &middot; Net Banking &middot; Wallets &middot; EMI &middot; Pay Later</span>
            <span>GST invoice included &middot; No hidden fees</span>
          </div>
        </div>

        {/* FAQ Section */}
        <div className="mt-20 max-w-[720px] mx-auto">
          <h3
            className="text-center mb-8"
            style={{
              fontFamily: "var(--font-display)",
              fontSize: "clamp(24px, 3vw, 32px)",
              fontWeight: 700,
              color: "var(--text-primary)",
            }}
          >
            Frequently asked questions
          </h3>

          <div className="space-y-0 divide-y divide-[var(--border-subtle)]">
            {FAQ_ITEMS.map((item, i) => (
              <div key={i}>
                <button
                  onClick={() => setOpenFaq(openFaq === i ? null : i)}
                  className="w-full flex items-center justify-between py-5 text-left cursor-pointer group"
                >
                  <span
                    className="text-[var(--text-primary)] font-medium pr-4"
                    style={{ fontFamily: "var(--font-body)", fontSize: "16px" }}
                  >
                    {item.q}
                  </span>
                  <ChevronDown
                    size={18}
                    className="text-[var(--text-tertiary)] shrink-0 transition-transform duration-200"
                    style={{
                      transform: openFaq === i ? "rotate(180deg)" : "rotate(0deg)",
                    }}
                  />
                </button>
                <div
                  className="overflow-hidden transition-all duration-300"
                  style={{
                    maxHeight: openFaq === i ? "300px" : "0",
                    opacity: openFaq === i ? 1 : 0,
                  }}
                >
                  <p
                    className="pb-5 text-[var(--text-secondary)] leading-relaxed"
                    style={{ fontFamily: "var(--font-body)", fontSize: "15px" }}
                  >
                    {item.a}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
