"use client";

import { useState } from "react";
import { Header } from "@/components/layout/Header";
import { Users, Smartphone, Hammer, Send, Trash2, Globe } from "lucide-react";
import toast from "react-hot-toast";

function AgencyStat({ label, value, max, icon: Icon }: { label: string; value: string; max?: string; icon: React.ElementType }) {
  return (
    <div className="rounded-xl p-5" style={{ background: "var(--bg-elevated)", border: "1px solid var(--border-default)" }}>
      <div className="flex items-center justify-between mb-2">
        <p className="text-xs" style={{ color: "var(--text-tertiary)" }}>{label}</p>
        <Icon size={16} className="text-brand-500" />
      </div>
      <p className="text-2xl font-display font-bold" style={{ color: "var(--text-primary)" }}>
        {value}{max && <span className="text-sm font-normal" style={{ color: "var(--text-tertiary)" }}> / {max}</span>}
      </p>
    </div>
  );
}

export default function AgencyPage() {
  const [tab, setTab] = useState<"overview" | "clients" | "settings">("overview");
  const [inviteEmail, setInviteEmail] = useState("");
  const [clients, setClients] = useState<{ id: string; name: string; email: string; apps: number; status: string }[]>([]);

  const handleInvite = () => {
    if (!inviteEmail) return;
    setClients([...clients, { id: Date.now().toString(), name: inviteEmail.split("@")[0] || inviteEmail, email: inviteEmail, apps: 0, status: "invited" }]);
    setInviteEmail("");
    toast.success(`Invitation sent to ${inviteEmail}`);
  };

  const inputStyle = { background: "var(--bg-secondary)", border: "1px solid var(--border-default)", color: "var(--text-primary)" };

  return (
    <>
      <Header title="Agency Dashboard" />
      <div className="p-6 space-y-6">
        {/* Tabs */}
        <div className="flex gap-2">
          {(["overview", "clients", "settings"] as const).map((t) => (
            <button key={t} onClick={() => setTab(t)}
              className={`px-4 py-2 rounded-lg text-sm font-medium capitalize transition-colors ${tab === t ? "bg-brand-500 text-white" : ""}`}
              style={tab !== t ? { background: "var(--bg-secondary)", color: "var(--text-secondary)" } : undefined}>
              {t}
            </button>
          ))}
        </div>

        {tab === "overview" && (
          <>
            {/* Brand Header */}
            <div className="rounded-xl p-6" style={{ background: "linear-gradient(135deg, #1E3A5F 0%, #0A1628 100%)" }}>
              <h2 className="font-display text-xl font-bold text-white">Your White-Label Dashboard</h2>
              <p className="text-white/60 text-sm mt-1">Manage all client apps from one place. Your brand. Your pricing.</p>
            </div>

            {/* Stats */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <AgencyStat label="Active Clients" value={clients.filter((c) => c.status !== "removed").length.toString()} max="10" icon={Users} />
              <AgencyStat label="Total Client Apps" value="0" max="15" icon={Smartphone} />
              <AgencyStat label="Builds This Month" value="0" icon={Hammer} />
              <AgencyStat label="Est. Revenue" value="₹0" icon={Globe} />
            </div>
          </>
        )}

        {tab === "clients" && (
          <>
            {/* Invite */}
            <div className="flex gap-3">
              <input type="email" value={inviteEmail} onChange={(e) => setInviteEmail(e.target.value)} placeholder="client@example.com"
                className="flex-1 px-4 py-2.5 rounded-lg text-sm outline-none" style={inputStyle} />
              <button onClick={handleInvite} disabled={!inviteEmail}
                className="flex items-center gap-2 px-5 py-2.5 rounded-lg font-medium text-sm text-white bg-brand-500 hover:bg-brand-600 disabled:opacity-50 transition-colors">
                <Send size={16} /> Invite Client
              </button>
            </div>

            {/* Client list */}
            {clients.length === 0 ? (
              <div className="text-center py-16 rounded-xl" style={{ background: "var(--bg-elevated)", border: "1px solid var(--border-default)" }}>
                <Users size={32} className="mx-auto mb-3 opacity-30" style={{ color: "var(--text-tertiary)" }} />
                <h3 className="font-display font-semibold mb-2" style={{ color: "var(--text-primary)" }}>No clients yet</h3>
                <p className="text-sm" style={{ color: "var(--text-tertiary)" }}>Invite your first client by email. They&apos;ll see your branded dashboard.</p>
              </div>
            ) : (
              <div className="rounded-xl overflow-hidden" style={{ border: "1px solid var(--border-default)" }}>
                <table className="w-full text-sm">
                  <thead>
                    <tr style={{ background: "var(--bg-secondary)" }}>
                      <th className="text-left px-4 py-3 font-medium" style={{ color: "var(--text-tertiary)" }}>Client</th>
                      <th className="text-left px-4 py-3 font-medium" style={{ color: "var(--text-tertiary)" }}>Email</th>
                      <th className="text-left px-4 py-3 font-medium" style={{ color: "var(--text-tertiary)" }}>Apps</th>
                      <th className="text-left px-4 py-3 font-medium" style={{ color: "var(--text-tertiary)" }}>Status</th>
                      <th className="text-right px-4 py-3 font-medium" style={{ color: "var(--text-tertiary)" }}>Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {clients.map((client) => (
                      <tr key={client.id} style={{ borderTop: "1px solid var(--border-subtle)" }}>
                        <td className="px-4 py-3 font-medium" style={{ color: "var(--text-primary)" }}>{client.name}</td>
                        <td className="px-4 py-3" style={{ color: "var(--text-secondary)" }}>{client.email}</td>
                        <td className="px-4 py-3" style={{ color: "var(--text-secondary)" }}>{client.apps}</td>
                        <td className="px-4 py-3">
                          <span className={`text-xs px-2 py-1 rounded-full font-medium ${client.status === "active" ? "bg-green-100 text-green-700" : "bg-yellow-100 text-yellow-700"}`}>
                            {client.status}
                          </span>
                        </td>
                        <td className="px-4 py-3 text-right">
                          <button className="p-1.5 rounded hover:bg-red-50 text-red-500" onClick={() => setClients(clients.filter((c) => c.id !== client.id))}>
                            <Trash2 size={14} />
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </>
        )}

        {tab === "settings" && (
          <div className="space-y-6 max-w-2xl">
            <div className="rounded-xl p-6" style={{ background: "var(--bg-elevated)", border: "1px solid var(--border-default)" }}>
              <h3 className="font-display font-semibold mb-4" style={{ color: "var(--text-primary)" }}>Brand Identity</h3>
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium mb-1.5" style={{ color: "var(--text-secondary)" }}>Brand Name</label>
                  <input type="text" className="w-full px-3 py-2.5 rounded-lg text-sm outline-none" style={inputStyle} placeholder="Your Agency Name" />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1.5" style={{ color: "var(--text-secondary)" }}>Brand Color</label>
                  <input type="color" defaultValue="#F97316" className="w-10 h-10 rounded cursor-pointer" />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1.5" style={{ color: "var(--text-secondary)" }}>Subdomain</label>
                  <div className="flex items-center gap-2">
                    <input type="text" className="flex-1 px-3 py-2.5 rounded-lg text-sm outline-none" style={inputStyle} placeholder="your-agency" />
                    <span className="text-sm" style={{ color: "var(--text-tertiary)" }}>.quickapps.in</span>
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1.5" style={{ color: "var(--text-secondary)" }}>Custom Domain</label>
                  <input type="text" className="w-full px-3 py-2.5 rounded-lg text-sm outline-none" style={inputStyle} placeholder="apps.youragency.com" />
                  <p className="text-xs mt-1" style={{ color: "var(--text-tertiary)" }}>Agency Pro and Scale plans only. Point CNAME to quickapps.in.</p>
                </div>
                <button className="px-4 py-2 rounded-lg text-sm font-medium bg-brand-500 text-white hover:bg-brand-600 transition-colors">
                  Save Brand Settings
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </>
  );
}
