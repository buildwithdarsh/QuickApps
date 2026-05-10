import type { Plan } from "@/lib/constants";
import { formatINR } from "@/lib/utils";
import { Button } from "./Button";
import { cn } from "@/lib/utils";
import { Check } from "lucide-react";

interface PlanCardProps {
  plan: Plan;
}

export function PlanCard({ plan }: PlanCardProps) {
  return (
    <div
      className={cn(
        "relative p-10 flex flex-col",
        plan.featured
          ? "bg-navy-900 text-white border-[1.5px] border-[rgba(249,115,22,0.4)] shadow-[0_0_0_4px_rgba(249,115,22,0.08),var(--shadow-xl)] scale-[1.03]"
          : "bg-bg-elevated border border-[var(--border-subtle)]",
      )}
      style={{ borderRadius: "var(--radius-xl)" }}
    >
      {plan.featured && (
        <span
          className="absolute -top-4 left-1/2 -translate-x-1/2 bg-[var(--gradient-saffron)] text-white text-xs font-semibold px-4 py-1.5 rounded-full"
          style={{
            fontFamily: "var(--font-display)",
            background: "var(--gradient-saffron)",
          }}
        >
          Most Popular
        </span>
      )}

      <p
        className={cn(
          "text-sm font-semibold uppercase tracking-wide mb-4",
          plan.featured ? "text-[rgba(255,255,255,0.6)]" : "text-[var(--text-tertiary)]",
        )}
        style={{ fontFamily: "var(--font-display)" }}
      >
        {plan.name}
      </p>

      <div className="mb-1">
        <span
          className={cn(
            "text-[40px] font-bold",
            plan.featured ? "text-white" : "text-[var(--text-primary)]",
          )}
          style={{ fontFamily: "var(--font-display)", lineHeight: 1.1 }}
        >
          {plan.price === 0 ? "Free" : formatINR(plan.price)}
        </span>
      </div>
      {plan.price > 0 && (
        <p
          className={cn(
            "text-sm mb-6",
            plan.featured ? "text-[rgba(255,255,255,0.5)]" : "text-[var(--text-tertiary)]",
          )}
        >
          {plan.billing}
        </p>
      )}
      {plan.price === 0 && <div className="mb-6" />}

      <ul className="flex-1 space-y-3 mb-8">
        {plan.features.map((feature) => (
          <li key={feature} className="flex items-start gap-2 text-sm">
            <Check
              size={16}
              className={cn(
                "mt-0.5 shrink-0",
                plan.featured ? "text-[#FB923C]" : "text-brand-500",
              )}
            />
            <span
              className={
                plan.featured ? "text-[rgba(255,255,255,0.8)]" : "text-[var(--text-secondary)]"
              }
            >
              {feature}
            </span>
          </li>
        ))}
      </ul>

      <Button
        variant={plan.featured ? "primary" : "secondary"}
        size="default"
        className="w-full"
        href={plan.price === 0 ? "/dashboard/app/new" : `/login?plan=${plan.name.toLowerCase()}`}
      >
        {plan.cta} →
      </Button>
    </div>
  );
}
