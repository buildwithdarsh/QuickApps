"use client";

import { useState } from "react";
import { SectionLabel } from "@/components/ui/SectionLabel";
import { GradientText } from "@/components/ui/GradientText";
import { AddonCard } from "@/components/ui/AddonCard";
import { Button } from "@/components/ui/Button";
import { ADDONS, ADDON_CATEGORIES } from "@/lib/constants";
import { cn } from "@/lib/utils";

export function AddonMarketplace() {
  const [activeCategory, setActiveCategory] = useState("All");

  const filtered =
    activeCategory === "All"
      ? ADDONS
      : activeCategory === "India-exclusive"
        ? ADDONS.filter((a) => a.india)
        : ADDONS.filter((a) => a.category === activeCategory);

  return (
    <section
      id="addons"
      className="bg-[var(--bg-secondary)]"
      style={{ padding: "var(--section-py) 0" }}
    >
      <div className="container">
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
            50+ addons.
            <br />
            <GradientText>Buy once. Keep forever.</GradientText>
          </h2>
          <p
            className="mt-4 mx-auto text-[var(--text-secondary)] text-lg leading-relaxed"
            style={{ fontFamily: "var(--font-body)", maxWidth: "600px" }}
          >
            No subscriptions for addons. No plan upgrades to unlock features. Buy what you need. It&apos;s yours in every build. Forever.
          </p>
        </div>

        {/* Filter tabs */}
        <div
          className="flex gap-2 mb-8 overflow-x-auto pb-2"
          style={{ scrollbarWidth: "none" }}
        >
          {ADDON_CATEGORIES.map((cat) => (
            <button
              key={cat}
              onClick={() => setActiveCategory(cat)}
              className={cn(
                "px-4 py-2 text-sm font-medium whitespace-nowrap transition-all cursor-pointer",
                activeCategory === cat
                  ? "bg-brand-500 text-white border-brand-500"
                  : "bg-transparent text-[var(--text-secondary)] border-[var(--border-default)] hover:bg-brand-500 hover:text-white hover:border-brand-500",
              )}
              style={{
                borderRadius: "var(--radius-pill)",
                border: "1px solid",
                fontFamily: "var(--font-body)",
              }}
            >
              {cat}
            </button>
          ))}
        </div>

        {/* Addon grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-5">
          {filtered.map((addon) => (
            <AddonCard key={addon.name} addon={addon} />
          ))}
        </div>

        {/* Closing copy */}
        <div
          className="mt-12 mx-auto max-w-[640px] p-6 text-center"
          style={{
            borderLeft: "3px solid var(--brand-500)",
            background: "rgba(249,115,22,0.04)",
            borderRadius: "0 var(--radius-md) var(--radius-md) 0",
          }}
        >
          <p
            className="text-[var(--text-secondary)] text-sm leading-relaxed"
            style={{ fontFamily: "var(--font-body)" }}
          >
            Every addon is permanently yours after purchase. No monthly fee. No plan tier to upgrade. Buy what you need. Use it in every build. Forever.
          </p>
        </div>

        {/* CTA */}
        <div className="text-center mt-8">
          <Button variant="secondary" href="/addons">
            Explore all 82 addons →
          </Button>
        </div>
      </div>
    </section>
  );
}
