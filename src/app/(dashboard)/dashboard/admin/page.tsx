"use client";

import { useState } from "react";
import { Header } from "@/components/layout/Header";
import { Users, Smartphone, Hammer, IndianRupee } from "lucide-react";

function AdminStat({ label, value, icon: Icon }: { label: string; value: string; icon: React.ElementType }) {
  return (
    <div className="rounded-xl p-5" style={{ background: "var(--bg-elevated)", border: "1px solid var(--border-default)" }}>
      <div className="flex items-center justify-between mb-2">
        <p className="text-xs" style={{ color: "var(--text-tertiary)" }}>{label}</p>
        <Icon size={16} className="text-brand-500" />
      </div>
      <p className="text-2xl font-display font-bold" style={{ color: "var(--text-primary)" }}>{value}</p>
    </div>
  );
}

type Tab = "overview" | "organisations" | "builds";

export default function AdminPage() {
  const [tab, setTab] = useState<Tab>("overview");

  return (
    <>
      <Header title="Admin Panel" />
      <div className="p-6 space-y-6">
        {/* Tabs */}
        <div className="flex gap-2">
          {(["overview", "organisations", "builds"] as Tab[]).map((t) => (
            <button key={t} onClick={() => setTab(t)}
              className={`px-4 py-2 rounded-lg text-sm font-medium capitalize transition-colors ${tab === t ? "bg-brand-500 text-white" : ""}`}
              style={tab !== t ? { background: "var(--bg-secondary)", color: "var(--text-secondary)" } : undefined}>
              {t}
            </button>
          ))}
        </div>

        {tab === "overview" && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <AdminStat label="Total Organisations" value="0" icon={Users} />
            <AdminStat label="Total Apps" value="0" icon={Smartphone} />
            <AdminStat label="Total Builds" value="0" icon={Hammer} />
            <AdminStat label="Total Revenue" value="₹0" icon={IndianRupee} />
          </div>
        )}

        {tab === "organisations" && (
          <div className="rounded-xl overflow-hidden" style={{ border: "1px solid var(--border-default)" }}>
            <table className="w-full text-sm">
              <thead>
                <tr style={{ background: "var(--bg-secondary)" }}>
                  <th className="text-left px-4 py-3 font-medium" style={{ color: "var(--text-tertiary)" }}>Name</th>
                  <th className="text-left px-4 py-3 font-medium" style={{ color: "var(--text-tertiary)" }}>Plan</th>
                  <th className="text-left px-4 py-3 font-medium" style={{ color: "var(--text-tertiary)" }}>Apps</th>
                  <th className="text-left px-4 py-3 font-medium" style={{ color: "var(--text-tertiary)" }}>Status</th>
                  <th className="text-right px-4 py-3 font-medium" style={{ color: "var(--text-tertiary)" }}>Actions</th>
                </tr>
              </thead>
              <tbody>
                <tr>
                  <td colSpan={5} className="px-4 py-12 text-center" style={{ color: "var(--text-tertiary)" }}>
                    No organisations yet
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
        )}

        {tab === "builds" && (
          <div className="rounded-xl overflow-hidden" style={{ border: "1px solid var(--border-default)" }}>
            <table className="w-full text-sm">
              <thead>
                <tr style={{ background: "var(--bg-secondary)" }}>
                  <th className="text-left px-4 py-3 font-medium" style={{ color: "var(--text-tertiary)" }}>Build #</th>
                  <th className="text-left px-4 py-3 font-medium" style={{ color: "var(--text-tertiary)" }}>App</th>
                  <th className="text-left px-4 py-3 font-medium" style={{ color: "var(--text-tertiary)" }}>Org</th>
                  <th className="text-left px-4 py-3 font-medium" style={{ color: "var(--text-tertiary)" }}>Status</th>
                  <th className="text-left px-4 py-3 font-medium" style={{ color: "var(--text-tertiary)" }}>Created</th>
                </tr>
              </thead>
              <tbody>
                <tr>
                  <td colSpan={5} className="px-4 py-12 text-center" style={{ color: "var(--text-tertiary)" }}>
                    No builds yet
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
        )}
      </div>
    </>
  );
}
