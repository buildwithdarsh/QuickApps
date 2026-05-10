"use client";

import { Header } from "@/components/layout/Header";
import { useApi } from "@/hooks/useApi";
import { apps } from "@/lib/api";
import { Smartphone, Plus, Loader2 } from "lucide-react";
import Link from "next/link";

interface AppData {
  id: string;
  name: string;
  bundleId: string;
  url: string;
  status: string;
  revision: { usedCount: number; freeLimit: number } | null;
  builds: { id: string; status: string; createdAt: string }[];
}

export default function AppsPage() {
  const { data: appList, loading } = useApi<AppData[]>((t) => apps.list(t));

  return (
    <>
      <Header title="My Apps" />
      <div className="p-6">
        {loading ? (
          <div className="flex items-center justify-center py-20">
            <Loader2 size={24} className="animate-spin text-brand-500" />
          </div>
        ) : appList && appList.length > 0 ? (
          <div className="space-y-4">
            <div className="flex justify-end">
              <Link href="/dashboard/app/new" className="flex items-center gap-2 px-4 py-2.5 rounded-lg font-medium text-sm text-white bg-brand-500 hover:bg-brand-600 transition-colors">
                <Plus size={16} /> Create New App
              </Link>
            </div>
            {appList.map((app) => (
              <Link key={app.id} href={`/dashboard/app/${app.id}`} className="block rounded-xl p-5 transition-all hover:shadow-md" style={{ background: "var(--bg-elevated)", border: "1px solid var(--border-default)" }}>
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-4">
                    <div className="w-12 h-12 rounded-xl bg-brand-500/10 flex items-center justify-center">
                      <Smartphone size={22} className="text-brand-500" />
                    </div>
                    <div>
                      <h3 className="font-display font-semibold" style={{ color: "var(--text-primary)" }}>{app.name}</h3>
                      <p className="text-xs mt-0.5" style={{ color: "var(--text-tertiary)" }}>{app.bundleId}</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <span className={`text-xs px-2 py-1 rounded-full font-medium ${app.status === "ready" ? "bg-green-100 text-green-700" : app.status === "configured" ? "bg-blue-100 text-blue-700" : "bg-gray-100 text-gray-600"}`}>
                      {app.status}
                    </span>
                    <p className="text-xs mt-1" style={{ color: "var(--text-tertiary)" }}>
                      Revisions: {app.revision?.usedCount ?? 0}/{app.revision?.freeLimit ?? 3}
                    </p>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        ) : (
          <div className="text-center py-16 rounded-xl" style={{ background: "var(--bg-elevated)", border: "1px solid var(--border-default)" }}>
            <div className="w-16 h-16 rounded-2xl bg-brand-500/10 flex items-center justify-center mx-auto mb-4">
              <Smartphone size={32} className="text-brand-500" />
            </div>
            <h3 className="font-display text-lg font-semibold mb-2" style={{ color: "var(--text-primary)" }}>No apps yet</h3>
            <p className="text-sm mb-6 max-w-sm mx-auto" style={{ color: "var(--text-tertiary)" }}>
              Create your first app by pasting your website URL. Takes 2 minutes.
            </p>
            <Link href="/dashboard/app/new" className="inline-flex items-center gap-2 px-5 py-2.5 rounded-lg font-medium text-sm text-white bg-brand-500 hover:bg-brand-600 transition-colors">
              <Plus size={16} /> Create App
            </Link>
          </div>
        )}
      </div>
    </>
  );
}
