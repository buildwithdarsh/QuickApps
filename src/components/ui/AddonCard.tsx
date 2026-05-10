import type { Addon } from "@/lib/constants";
import { formatINR } from "@/lib/utils";

interface AddonCardProps {
  addon: Addon;
}

export function AddonCard({ addon }: AddonCardProps) {
  return (
    <div
      className="relative bg-bg-elevated border border-[var(--border-subtle)] p-7 cursor-pointer transition-all duration-250 hover:-translate-y-0.5 hover:shadow-[var(--shadow-md)]"
      style={{ borderRadius: "var(--radius-lg)" }}
    >
      {addon.india && (
        <span className="absolute top-3 right-3 text-base" aria-label="India-exclusive">
          🇮🇳
        </span>
      )}
      <div
        className="w-10 h-10 bg-brand-50 grid place-items-center mb-4"
        style={{ borderRadius: "var(--radius-md)" }}
      >
        <span className="text-brand-500 text-lg font-semibold">
          {addon.name.charAt(0)}
        </span>
      </div>
      <p
        className="text-[15px] font-semibold text-[var(--text-primary)] mb-1.5"
        style={{ fontFamily: "var(--font-display)" }}
      >
        {addon.name}
      </p>
      <p
        className="text-sm text-[var(--text-tertiary)] mb-5"
        style={{ lineHeight: 1.5 }}
      >
        {addon.description}
      </p>
      <p
        className="text-base font-semibold text-brand-600"
        style={{ fontFamily: "var(--font-display)" }}
      >
        {formatINR(addon.price)}
      </p>
    </div>
  );
}
