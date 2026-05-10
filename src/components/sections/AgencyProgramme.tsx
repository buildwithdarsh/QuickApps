"use client";

import { SectionLabel } from "@/components/ui/SectionLabel";
import { GradientText } from "@/components/ui/GradientText";
import { Button } from "@/components/ui/Button";
import { useScrollReveal } from "@/hooks/useScrollReveal";
import { Check } from "lucide-react";

const benefits = [
  "Your logo. Your domain. Your brand. Not ours.",
  "Every client\u2019s app managed from your single dashboard",
  "You set the addon prices \u2014 we bill you at wholesale",
  "GST invoices in your company name, not QuickApps",
  "API access for programmatic builds and automations",
  "We stay invisible to your clients. Completely. Always.",
];

const agencyTiers = [
  {
    name: "Agency Starter",
    price: "\u20B94,999/mo",
    details: "Up to 10 clients, 15 apps",
  },
  {
    name: "Agency Pro",
    price: "\u20B99,999/mo",
    details: "Up to 30 clients, 60 apps",
  },
  {
    name: "Agency Scale",
    price: "\u20B919,999/mo",
    details: "Unlimited",
  },
];

export function AgencyProgramme() {
  const { ref, isVisible } = useScrollReveal();

  return (
    <section
      id="agency"
      ref={ref}
      style={{
        background: "rgba(249,115,22,0.04)",
        padding: "var(--section-py) 0",
      }}
    >
      <div
        className="container"
        style={{
          opacity: isVisible ? 1 : 0,
          transform: isVisible ? "translateY(0)" : "translateY(32px)",
          transition: "opacity 0.6s var(--ease-out-expo), transform 0.6s var(--ease-out-expo)",
        }}
      >
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 lg:gap-16 items-start">
          {/* Text side */}
          <div>
            <SectionLabel>For Agencies</SectionLabel>
            <h2
              className="mt-4"
              style={{
                fontFamily: "var(--font-display)",
                fontSize: "clamp(28px, 4vw, 40px)",
                fontWeight: 700,
                lineHeight: 1.15,
                color: "var(--text-primary)",
              }}
            >
              Turn your agency into
              <br />
              an <GradientText>app factory</GradientText>.
            </h2>
            <p
              className="mt-4 text-[var(--text-secondary)] text-lg leading-relaxed"
              style={{ fontFamily: "var(--font-body)", whiteSpace: "pre-line" }}
            >
              White-label the dashboard. Brand it as your own.{"\n"}Charge your clients whatever you want.{"\n"}We&apos;ll never know.
            </p>

            {/* Body with math */}
            <div
              className="mt-6 space-y-4 text-[var(--text-secondary)] leading-relaxed"
              style={{ fontFamily: "var(--font-body)", fontSize: "16px" }}
            >
              <p>
                ₹4,999/month for unlimited client apps, white-labeled under your brand.
              </p>
              <p>
                Your clients log into your branded dashboard. They see your logo, your colors,
                your domain name. They never see the word QuickApps. They never know your margins.
              </p>
              <p className="font-medium text-[var(--text-primary)]">
                30 clients at ₹5,000 per app = ₹1.5 lakh revenue.
                <br />
                Your QuickApps cost: ₹60,000/year.
                <br />
                <span className="text-brand-500">Calculate it yourself.</span>
              </p>
            </div>

            <ul className="mt-8 space-y-4">
              {benefits.map((b, i) => (
                <li
                  key={b}
                  className="flex items-start gap-3"
                  style={{
                    opacity: isVisible ? 1 : 0,
                    transform: isVisible ? "translateY(0)" : "translateY(12px)",
                    transition: `opacity 0.4s var(--ease-out-expo) ${i * 80}ms, transform 0.4s var(--ease-out-expo) ${i * 80}ms`,
                  }}
                >
                  <Check size={18} className="text-brand-500 mt-0.5 shrink-0" />
                  <span className="text-[var(--text-secondary)]">{b}</span>
                </li>
              ))}
            </ul>

            <div className="mt-10 flex flex-col sm:flex-row gap-4">
              <Button variant="primary" href="/login?plan=agency">
                Start agency account →
              </Button>
              <Button variant="secondary" href="/agency">
                Learn more about Agency →
              </Button>
            </div>
          </div>

          {/* Right side: tiers table + dashboard preview */}
          <div>
            {/* Agency pricing tiers */}
            <div
              className="mb-8 overflow-hidden"
              style={{
                borderRadius: "var(--radius-lg)",
                border: "1px solid var(--border-subtle)",
              }}
            >
              <div
                className="px-6 py-4"
                style={{ background: "var(--bg-secondary)" }}
              >
                <p
                  className="text-sm font-semibold text-[var(--text-primary)]"
                  style={{ fontFamily: "var(--font-display)" }}
                >
                  Agency Pricing
                </p>
              </div>
              <div className="divide-y divide-[var(--border-subtle)]">
                {agencyTiers.map((tier) => (
                  <div
                    key={tier.name}
                    className="px-6 py-4 flex items-center justify-between"
                    style={{ background: "var(--bg-primary)" }}
                  >
                    <div>
                      <p
                        className="text-sm font-semibold text-[var(--text-primary)]"
                        style={{ fontFamily: "var(--font-display)" }}
                      >
                        {tier.name}
                      </p>
                      <p className="text-xs text-[var(--text-tertiary)] mt-0.5">
                        {tier.details}
                      </p>
                    </div>
                    <p
                      className="text-sm font-bold text-brand-500"
                      style={{ fontFamily: "var(--font-display)" }}
                    >
                      {tier.price}
                    </p>
                  </div>
                ))}
              </div>
              <div
                className="px-6 py-3 text-xs text-[var(--text-tertiary)] text-center"
                style={{ background: "var(--bg-secondary)" }}
              >
                Annual billing: 20% off all plans
              </div>
            </div>

            {/* Dashboard preview SVG */}
            <svg
              viewBox="0 0 360 260"
              fill="none"
              xmlns="http://www.w3.org/2000/svg"
              className="w-full max-w-[360px] mx-auto"
              aria-label="Agency dashboard preview"
              role="img"
            >
              {/* Browser chrome */}
              <rect x="5" y="5" width="350" height="250" rx="12" fill="var(--bg-elevated)" stroke="var(--border-default)" strokeWidth="1.5" />
              <rect x="5" y="5" width="350" height="30" rx="12" fill="var(--bg-secondary)" />
              <rect x="5" y="22" width="350" height="13" fill="var(--bg-secondary)" />
              <circle cx="24" cy="20" r="4" fill="#FF5F57" />
              <circle cx="38" cy="20" r="4" fill="#FFBD2E" />
              <circle cx="52" cy="20" r="4" fill="#28CA42" />

              {/* Agency branding */}
              <text x="24" y="54" fontSize="11" fontWeight="600" fill="var(--text-primary)" fontFamily="var(--font-display)">Sanjay Digital Solutions</text>
              <text x="24" y="68" fontSize="7" fill="var(--text-tertiary)" fontFamily="var(--font-body)">Dashboard &middot; Clients &middot; Apps &middot; Billing</text>

              {/* Stats row */}
              <text x="24" y="90" fontSize="18" fontWeight="700" fill="var(--text-primary)" fontFamily="var(--font-display)">28</text>
              <text x="54" y="90" fontSize="8" fill="var(--text-tertiary)" fontFamily="var(--font-body)">clients</text>
              <text x="110" y="90" fontSize="18" fontWeight="700" fill="var(--text-primary)" fontFamily="var(--font-display)">42</text>
              <text x="136" y="90" fontSize="8" fill="var(--text-tertiary)" fontFamily="var(--font-body)">apps</text>

              {/* Client table header */}
              <rect x="24" y="104" width="310" height="20" rx="4" fill="var(--bg-secondary)" />
              <text x="36" y="118" fontSize="7" fontWeight="600" fill="var(--text-tertiary)" fontFamily="var(--font-body)">Client</text>
              <text x="160" y="118" fontSize="7" fontWeight="600" fill="var(--text-tertiary)" fontFamily="var(--font-body)">Apps</text>
              <text x="240" y="118" fontSize="7" fontWeight="600" fill="var(--text-tertiary)" fontFamily="var(--font-body)">Status</text>

              {/* Client rows */}
              {[
                { name: "Priya Skincare", apps: "2", status: "Active", color: "var(--india-green)" },
                { name: "Ravi Grocery", apps: "1", status: "Building...", color: "var(--warning)" },
                { name: "Meera Yoga", apps: "3", status: "Active", color: "var(--india-green)" },
              ].map((client, i) => (
                <g key={i}>
                  <line x1="24" y1={128 + i * 32} x2="334" y2={128 + i * 32} stroke="var(--border-subtle)" strokeWidth="1" />
                  <text x="36" y={146 + i * 32} fontSize="8" fill="var(--text-primary)" fontFamily="var(--font-body)">{client.name}</text>
                  <text x="168" y={146 + i * 32} fontSize="8" fill="var(--text-secondary)" fontFamily="var(--font-body)">{client.apps}</text>
                  <rect x="236" y={136 + i * 32} width={client.status === "Building..." ? 52 : 36} height="16" rx="8" fill={`${client.color}20`} />
                  <text x="244" y={148 + i * 32} fontSize="7" fill={client.color} fontFamily="var(--font-body)" fontWeight="500">{client.status}</text>
                </g>
              ))}
            </svg>
          </div>
        </div>
      </div>
    </section>
  );
}
