"use client";

import { useState } from "react";
import { Header } from "@/components/layout/Header";
import { useAuthStore } from "@/lib/store";
import toast from "react-hot-toast";

export default function SettingsPage() {
  const { user, org } = useAuthStore();
  const [name, setName] = useState(user?.name || "");
  const [orgName, setOrgName] = useState(org?.name || "");

  const inputStyle = { background: "var(--bg-secondary)", border: "1px solid var(--border-default)", color: "var(--text-primary)" };

  return (
    <>
      <Header title="Settings" />
      <div className="p-6 space-y-6 max-w-2xl">
        {/* Profile */}
        <div className="rounded-xl p-6" style={{ background: "var(--bg-elevated)", border: "1px solid var(--border-default)" }}>
          <h3 className="font-display font-semibold mb-4" style={{ color: "var(--text-primary)" }}>Profile</h3>
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium mb-1.5" style={{ color: "var(--text-secondary)" }}>Name</label>
              <input type="text" value={name} onChange={(e) => setName(e.target.value)} className="w-full px-3 py-2.5 rounded-lg text-sm outline-none" style={inputStyle} />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1.5" style={{ color: "var(--text-secondary)" }}>Email</label>
              <input type="email" value={user?.email || ""} disabled className="w-full px-3 py-2.5 rounded-lg text-sm outline-none opacity-60" style={inputStyle} />
              <p className="text-xs mt-1" style={{ color: "var(--text-tertiary)" }}>
                {user?.emailVerified ? "✓ Verified" : "Not verified"}
              </p>
            </div>
            <button onClick={() => toast.success("Profile updated")} className="px-4 py-2 rounded-lg text-sm font-medium bg-brand-500 text-white hover:bg-brand-600 transition-colors">
              Save Changes
            </button>
          </div>
        </div>

        {/* Organisation */}
        <div className="rounded-xl p-6" style={{ background: "var(--bg-elevated)", border: "1px solid var(--border-default)" }}>
          <h3 className="font-display font-semibold mb-4" style={{ color: "var(--text-primary)" }}>Organisation</h3>
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium mb-1.5" style={{ color: "var(--text-secondary)" }}>Organisation Name</label>
              <input type="text" value={orgName} onChange={(e) => setOrgName(e.target.value)} className="w-full px-3 py-2.5 rounded-lg text-sm outline-none" style={inputStyle} />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1.5" style={{ color: "var(--text-secondary)" }}>Slug</label>
              <input type="text" value={org?.slug || ""} disabled className="w-full px-3 py-2.5 rounded-lg text-sm outline-none opacity-60" style={inputStyle} />
            </div>
            <button onClick={() => toast.success("Organisation updated")} className="px-4 py-2 rounded-lg text-sm font-medium bg-brand-500 text-white hover:bg-brand-600 transition-colors">
              Save Changes
            </button>
          </div>
        </div>

        {/* Danger zone */}
        <div className="rounded-xl p-6 border-red-200" style={{ background: "var(--bg-elevated)", borderColor: "#fca5a5", borderWidth: 1 }}>
          <h3 className="font-display font-semibold mb-2 text-red-600">Danger Zone</h3>
          <p className="text-sm mb-4" style={{ color: "var(--text-tertiary)" }}>Permanently delete your account and all data.</p>
          <button className="px-4 py-2 rounded-lg text-sm font-medium bg-red-600 text-white hover:bg-red-700 transition-colors">
            Delete Account
          </button>
        </div>
      </div>
    </>
  );
}
