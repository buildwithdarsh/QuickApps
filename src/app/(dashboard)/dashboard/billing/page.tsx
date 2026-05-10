"use client";

import { Header } from "@/components/layout/Header";
import { useAuthStore } from "@/lib/store";
import { Check, IndianRupee } from "lucide-react";

const plans = [
  { name: "Free", price: 0, billing: "forever", features: ["Watermarked demo APK", "25 core features", "1 revision", "Standard queue"], current: false },
  { name: "Starter", price: 1999, billing: "one-time", features: ["Full Android APK", "25 core features", "3 free revisions", "Addon store access"], current: false },
  { name: "Pro", price: 3999, billing: "one-time", features: ["Android + iOS", "Full addon store", "Priority builds", "Full JS Bridge SDK"], current: false, recommended: true },
  { name: "Premium", price: 7999, billing: "one-time", features: ["Every addon unlocked", "Immediate builds", "5 free revisions", "Priority support"], current: false },
];

export default function BillingPage() {
  const org = useAuthStore((s) => s.org);
  const currentPlan = org?.plan || "free";

  return (
    <>
      <Header title="Billing & Plan" />
      <div className="p-6 space-y-8">
        {/* Current plan */}
        <div className="rounded-xl p-6" style={{ background: "var(--bg-elevated)", border: "1px solid var(--border-default)" }}>
          <p className="text-sm" style={{ color: "var(--text-tertiary)" }}>Current Plan</p>
          <p className="text-2xl font-display font-bold mt-1 capitalize text-brand-500">{currentPlan}</p>
        </div>

        {/* Plans */}
        <div>
          <h3 className="font-display font-semibold mb-4" style={{ color: "var(--text-primary)" }}>Upgrade Plan</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            {plans.map((plan) => {
              const isCurrent = plan.name.toLowerCase() === currentPlan;
              return (
                <div key={plan.name} className={`rounded-xl p-5 flex flex-col relative ${plan.recommended ? "ring-2 ring-brand-500" : ""}`}
                  style={{ background: "var(--bg-elevated)", border: "1px solid var(--border-default)" }}>
                  {plan.recommended && (
                    <span className="absolute -top-3 left-1/2 -translate-x-1/2 px-3 py-0.5 bg-brand-500 text-white text-[10px] font-bold rounded-full uppercase">Most Popular</span>
                  )}
                  <h4 className="font-display font-semibold" style={{ color: "var(--text-primary)" }}>{plan.name}</h4>
                  <div className="flex items-baseline gap-1 mt-2">
                    {plan.price > 0 && <IndianRupee size={16} style={{ color: "var(--text-primary)" }} />}
                    <span className="text-3xl font-display font-bold" style={{ color: "var(--text-primary)" }}>
                      {plan.price === 0 ? "Free" : plan.price.toLocaleString("en-IN")}
                    </span>
                    {plan.price > 0 && <span className="text-xs" style={{ color: "var(--text-tertiary)" }}>{plan.billing}</span>}
                  </div>
                  <ul className="mt-4 space-y-2 flex-1">
                    {plan.features.map((f) => (
                      <li key={f} className="flex items-center gap-2 text-xs" style={{ color: "var(--text-secondary)" }}>
                        <Check size={14} className="text-brand-500 flex-shrink-0" /> {f}
                      </li>
                    ))}
                  </ul>
                  <button disabled={isCurrent}
                    className={`mt-4 w-full py-2.5 rounded-lg text-sm font-medium transition-colors ${isCurrent ? "opacity-50 cursor-not-allowed" : plan.recommended ? "bg-brand-500 text-white hover:bg-brand-600" : "hover:bg-brand-50"}`}
                    style={!plan.recommended && !isCurrent ? { background: "var(--bg-secondary)", color: "var(--text-primary)" } : undefined}>
                    {isCurrent ? "Current Plan" : "Upgrade"}
                  </button>
                </div>
              );
            })}
          </div>
        </div>

        {/* GST */}
        <div className="rounded-xl p-6" style={{ background: "var(--bg-elevated)", border: "1px solid var(--border-default)" }}>
          <h3 className="font-display font-semibold mb-4" style={{ color: "var(--text-primary)" }}>GST Details</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium mb-1.5" style={{ color: "var(--text-secondary)" }}>GSTIN</label>
              <input type="text" className="w-full px-3 py-2.5 rounded-lg text-sm outline-none" style={{ background: "var(--bg-secondary)", border: "1px solid var(--border-default)", color: "var(--text-primary)" }}
                placeholder="22AAAAA0000A1Z5" maxLength={15} />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1.5" style={{ color: "var(--text-secondary)" }}>Company Name</label>
              <input type="text" className="w-full px-3 py-2.5 rounded-lg text-sm outline-none" style={{ background: "var(--bg-secondary)", border: "1px solid var(--border-default)", color: "var(--text-primary)" }}
                placeholder="Your Company Pvt. Ltd." />
            </div>
          </div>
          <button className="mt-4 px-4 py-2 rounded-lg text-sm font-medium bg-brand-500 text-white hover:bg-brand-600 transition-colors">
            Save GST Details
          </button>
        </div>
      </div>
    </>
  );
}
