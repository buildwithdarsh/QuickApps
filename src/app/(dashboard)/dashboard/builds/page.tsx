"use client";

import { useState, useEffect, useCallback } from "react";
import { Header } from "@/components/layout/Header";
import { useApi } from "@/hooks/useApi";
import { useAuthStore } from "@/lib/store";
import { apps, builds, revisions } from "@/lib/api";
import {
  Hammer,
  Loader2,
  CheckCircle2,
  XCircle,
  Clock,
  RefreshCw,
  Download,
  ChevronDown,
  Smartphone,
  AlertTriangle,
  Package,
} from "lucide-react";

interface AppSummary {
  id: string;
  name: string;
  bundleId: string;
  status: string;
}

interface Build {
  id: string;
  buildNumber: number;
  status: string;
  platform: string;
  queue: string;
  apkUrl: string | null;
  aabUrl: string | null;
  ipaUrl: string | null;
  errorMessage: string | null;
  buildDurationMs: number | null;
  startedAt: string | null;
  completedAt: string | null;
  createdAt: string;
  revisionUsed: boolean;
}

interface BuildsResponse {
  data: Build[];
  meta: { total: number; page: number; limit: number };
}

interface RevisionStatus {
  usedCount: number;
  freeLimit: number;
  extraPurchased: number;
  totalAvailable: number;
  remaining: number;
  cycleStart: string;
}

const STATUS_CONFIG: Record<string, { label: string; color: string; icon: React.ReactNode }> = {
  pending:   { label: "Pending",   color: "text-yellow-600 bg-yellow-50",  icon: <Clock size={12} /> },
  preparing: { label: "Preparing", color: "text-blue-600 bg-blue-50",     icon: <Loader2 size={12} className="animate-spin" /> },
  building:  { label: "Building",  color: "text-brand-600 bg-brand-50",   icon: <Loader2 size={12} className="animate-spin" /> },
  packaging: { label: "Packaging", color: "text-purple-600 bg-purple-50", icon: <Package size={12} /> },
  completed: { label: "Completed", color: "text-green-600 bg-green-50",   icon: <CheckCircle2 size={12} /> },
  failed:    { label: "Failed",    color: "text-red-600 bg-red-50",       icon: <XCircle size={12} /> },
};

const IN_PROGRESS = ["pending", "preparing", "building", "packaging"];

function formatDuration(ms: number | null) {
  if (!ms) return null;
  if (ms < 60000) return `${(ms / 1000).toFixed(0)}s`;
  return `${(ms / 60000).toFixed(1)}m`;
}

export default function BuildsPage() {
  const token = useAuthStore((s) => s.accessToken);
  const [selectedAppId, setSelectedAppId] = useState<string>("");
  const [triggering, setTriggering] = useState(false);
  const [triggerError, setTriggerError] = useState<string | null>(null);
  const [retrying, setRetrying] = useState<string | null>(null);
  const [downloading, setDownloading] = useState<string | null>(null);

  const { data: appList } = useApi<AppSummary[]>((t) => apps.list(t));

  // Auto-select first app
  useEffect(() => {
    if (appList && appList.length > 0 && !selectedAppId) {
      setSelectedAppId(appList[0]?.id ?? "");
    }
  }, [appList, selectedAppId]);

  const {
    data: buildsData,
    loading: buildsLoading,
    refetch: refetchBuilds,
  } = useApi<BuildsResponse>(
    (t) => (selectedAppId ? builds.list(selectedAppId, t) : Promise.resolve(null as unknown as BuildsResponse)),
    [selectedAppId],
  );

  const { data: revStatus, refetch: refetchRevisions } = useApi<RevisionStatus>(
    (t) => (selectedAppId ? revisions.status(selectedAppId, t) : Promise.resolve(null as unknown as RevisionStatus)),
    [selectedAppId],
  );

  // Poll while any build is in-progress
  const hasActive = buildsData?.data?.some((b) => IN_PROGRESS.includes(b.status));

  useEffect(() => {
    if (!hasActive) return;
    const interval = setInterval(() => refetchBuilds(), 4000);
    return () => clearInterval(interval);
  }, [hasActive, refetchBuilds]);

  const triggerBuild = useCallback(async () => {
    if (!selectedAppId || !token) return;
    setTriggering(true);
    setTriggerError(null);
    try {
      await builds.trigger(selectedAppId, token);
      await refetchBuilds();
      await refetchRevisions();
    } catch (e: unknown) {
      setTriggerError(e instanceof Error ? e.message : "Failed to trigger build");
    } finally {
      setTriggering(false);
    }
  }, [selectedAppId, token, refetchBuilds, refetchRevisions]);

  const retryBuild = useCallback(async (buildId: string) => {
    if (!selectedAppId || !token) return;
    setRetrying(buildId);
    try {
      await builds.retry(selectedAppId, buildId, token);
      await refetchBuilds();
    } finally {
      setRetrying(null);
    }
  }, [selectedAppId, token, refetchBuilds]);

  const downloadArtifact = useCallback(async (buildId: string, artifact: string) => {
    if (!selectedAppId || !token) return;
    const key = `${buildId}-${artifact}`;
    setDownloading(key);
    try {
      const result = await builds.download(selectedAppId, buildId, artifact, token) as { url: string };
      window.open(result.url, "_blank");
    } finally {
      setDownloading(null);
    }
  }, [selectedAppId, token]);

  const downloadSource = useCallback(async (buildId: string, buildNumber: number) => {
    if (!token) return;
    const key = `${buildId}-source`;
    setDownloading(key);
    try {
      const apiUrl = process.env["NEXT_PUBLIC_API_URL"] || "http://localhost:3001/api/v1";
      const res = await fetch(`${apiUrl}/apps/${selectedAppId}/builds/${buildId}/download-source`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (!res.ok) throw new Error(await res.text());
      const blob = await res.blob();
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `quickapps-source-build${buildNumber}.zip`;
      a.click();
      URL.revokeObjectURL(url);
    } catch (e) {
      console.error("Source download failed:", e);
    } finally {
      setDownloading(null);
    }
  }, [selectedAppId, token]);

  void appList; // used via selectedAppId filter in select element
  const buildList = buildsData?.data ?? [];
  const remaining = revStatus?.remaining ?? 0;

  return (
    <>
      <Header title="Builds" />
      <div className="p-6 space-y-6">

        {/* App selector + trigger */}
        <div className="flex flex-col sm:flex-row items-start sm:items-center gap-3">
          {/* App dropdown */}
          <div className="relative flex-1">
            <select
              value={selectedAppId}
              onChange={(e) => setSelectedAppId(e.target.value)}
              className="w-full appearance-none pl-4 pr-10 py-2.5 rounded-lg text-sm font-medium focus:outline-none focus:ring-2 focus:ring-brand-500"
              style={{ background: "var(--bg-elevated)", border: "1px solid var(--border-default)", color: "var(--text-primary)" }}
            >
              {!appList && <option value="">Loading apps...</option>}
              {appList?.map((app) => (
                <option key={app.id} value={app.id}>{app.name} — {app.bundleId}</option>
              ))}
            </select>
            <ChevronDown size={16} className="absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none" style={{ color: "var(--text-tertiary)" }} />
          </div>

          <button
            onClick={triggerBuild}
            disabled={triggering || !selectedAppId || remaining <= 0}
            className="flex items-center gap-2 px-4 py-2.5 rounded-lg font-medium text-sm text-white bg-brand-500 hover:bg-brand-600 disabled:opacity-50 disabled:cursor-not-allowed transition-colors whitespace-nowrap"
          >
            {triggering ? <Loader2 size={16} className="animate-spin" /> : <Hammer size={16} />}
            {triggering ? "Triggering..." : "Trigger Build"}
          </button>
        </div>

        {triggerError && (
          <div className="flex items-center gap-2 p-3 rounded-lg bg-red-50 text-red-700 text-sm">
            <AlertTriangle size={14} /> {triggerError}
          </div>
        )}

        {/* Stats row */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <div className="rounded-xl p-4" style={{ background: "var(--bg-elevated)", border: "1px solid var(--border-default)" }}>
            <p className="text-xs" style={{ color: "var(--text-tertiary)" }}>Revisions Used</p>
            <p className="text-2xl font-display font-bold mt-1" style={{ color: "var(--text-primary)" }}>
              {revStatus ? `${revStatus.usedCount} / ${revStatus.totalAvailable}` : "—"}
            </p>
          </div>
          <div className="rounded-xl p-4" style={{ background: "var(--bg-elevated)", border: "1px solid var(--border-default)" }}>
            <p className="text-xs" style={{ color: "var(--text-tertiary)" }}>Credits Remaining</p>
            <p className={`text-2xl font-display font-bold mt-1 ${remaining > 0 ? "text-brand-500" : "text-red-500"}`}>
              {revStatus ? remaining : "—"}
            </p>
          </div>
          <div className="rounded-xl p-4" style={{ background: "var(--bg-elevated)", border: "1px solid var(--border-default)" }}>
            <p className="text-xs" style={{ color: "var(--text-tertiary)" }}>Total Builds</p>
            <p className="text-2xl font-display font-bold mt-1" style={{ color: "var(--text-primary)" }}>
              {buildsData ? buildsData.meta.total : "—"}
            </p>
          </div>
        </div>

        {/* Build history */}
        <div>
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-display font-semibold" style={{ color: "var(--text-primary)" }}>Build History</h3>
            {hasActive && (
              <span className="text-xs text-brand-500 flex items-center gap-1">
                <Loader2 size={12} className="animate-spin" /> Auto-refreshing
              </span>
            )}
          </div>

          {buildsLoading && !buildList.length ? (
            <div className="flex items-center justify-center py-16">
              <Loader2 size={24} className="animate-spin text-brand-500" />
            </div>
          ) : buildList.length > 0 ? (
            <div className="space-y-3">
              {buildList.map((build) => {
                const FALLBACK_STATUS = { label: "Unknown", color: "text-gray-600 bg-gray-50", icon: null };
                const cfg = STATUS_CONFIG[build.status] ?? FALLBACK_STATUS;
                const isActive = IN_PROGRESS.includes(build.status);
                return (
                  <div
                    key={build.id}
                    className="rounded-xl p-4"
                    style={{ background: "var(--bg-elevated)", border: "1px solid var(--border-default)" }}
                  >
                    <div className="flex items-start justify-between gap-4">
                      <div className="flex items-center gap-3">
                        {/* Status icon */}
                        <div className={`w-9 h-9 rounded-lg flex items-center justify-center ${cfg.color}`}>
                          {isActive ? <Loader2 size={16} className="animate-spin" /> : cfg.icon}
                        </div>
                        <div>
                          <div className="flex items-center gap-2">
                            <span className="font-medium text-sm" style={{ color: "var(--text-primary)" }}>
                              Build #{build.buildNumber}
                            </span>
                            <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${cfg.color}`}>
                              {cfg.label}
                            </span>
                            <span className="text-xs px-2 py-0.5 rounded-full font-medium bg-gray-100 text-gray-600">
                              {build.platform}
                            </span>
                          </div>
                          <div className="flex items-center gap-3 mt-1">
                            <span className="text-xs" style={{ color: "var(--text-tertiary)" }}>
                              {new Date(build.createdAt).toLocaleString("en-IN")}
                            </span>
                            {build.buildDurationMs && (
                              <span className="text-xs" style={{ color: "var(--text-tertiary)" }}>
                                ⏱ {formatDuration(build.buildDurationMs)}
                              </span>
                            )}
                            <span className="text-xs" style={{ color: "var(--text-tertiary)" }}>
                              Queue: {build.queue}
                            </span>
                          </div>
                        </div>
                      </div>

                      {/* Actions */}
                      <div className="flex items-center gap-2 shrink-0">
                        {/* Download artifacts */}
                        {build.status === "completed" && (
                          <>
                            {build.apkUrl && (
                              <button
                                onClick={() => downloadArtifact(build.id, "apk")}
                                disabled={downloading === `${build.id}-apk`}
                                className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium text-white bg-green-600 hover:bg-green-700 disabled:opacity-50 transition-colors"
                              >
                                <Download size={12} />
                                {downloading === `${build.id}-apk` ? "..." : "APK"}
                              </button>
                            )}
                            {build.aabUrl && (
                              <button
                                onClick={() => downloadArtifact(build.id, "aab")}
                                disabled={downloading === `${build.id}-aab`}
                                className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium text-white bg-blue-600 hover:bg-blue-700 disabled:opacity-50 transition-colors"
                              >
                                <Download size={12} />
                                {downloading === `${build.id}-aab` ? "..." : "AAB"}
                              </button>
                            )}
                            {build.ipaUrl && (
                              <button
                                onClick={() => downloadArtifact(build.id, "ipa")}
                                disabled={downloading === `${build.id}-ipa`}
                                className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium text-white bg-purple-600 hover:bg-purple-700 disabled:opacity-50 transition-colors"
                              >
                                <Download size={12} />
                                {downloading === `${build.id}-ipa` ? "..." : "IPA"}
                              </button>
                            )}
                          </>
                        )}

                        {/* Source download (dev) */}
                        <button
                          onClick={() => downloadSource(build.id, build.buildNumber)}
                          disabled={downloading === `${build.id}-source`}
                          title="Download Capacitor source zip (dev only)"
                          className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium disabled:opacity-50 transition-colors"
                          style={{ background: "var(--bg-secondary)", color: "var(--text-secondary)", border: "1px solid var(--border-default)" }}
                        >
                          {downloading === `${build.id}-source`
                            ? <Loader2 size={12} className="animate-spin" />
                            : <Download size={12} />}
                          Source
                        </button>

                        {/* Retry failed */}
                        {build.status === "failed" && (
                          <button
                            onClick={() => retryBuild(build.id)}
                            disabled={retrying === build.id}
                            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium text-white bg-orange-500 hover:bg-orange-600 disabled:opacity-50 transition-colors"
                          >
                            <RefreshCw size={12} className={retrying === build.id ? "animate-spin" : ""} />
                            {retrying === build.id ? "..." : "Retry"}
                          </button>
                        )}
                      </div>
                    </div>

                    {/* Error message */}
                    {build.errorMessage && (
                      <div className="mt-3 p-3 rounded-lg bg-red-50 text-red-700 text-xs font-mono break-all">
                        {build.errorMessage}
                      </div>
                    )}

                    {/* Progress bar for active builds */}
                    {isActive && (
                      <div className="mt-3 h-1 rounded-full overflow-hidden" style={{ background: "var(--border-default)" }}>
                        <div className="h-full bg-brand-500 rounded-full animate-pulse" style={{ width: "60%" }} />
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          ) : selectedAppId ? (
            <div className="text-center py-16 rounded-xl" style={{ background: "var(--bg-elevated)", border: "1px solid var(--border-default)" }}>
              <div className="w-16 h-16 rounded-2xl bg-brand-500/10 flex items-center justify-center mx-auto mb-4">
                <Hammer size={28} className="text-brand-500" />
              </div>
              <h3 className="font-display text-lg font-semibold mb-2" style={{ color: "var(--text-primary)" }}>No builds yet</h3>
              <p className="text-sm mb-6" style={{ color: "var(--text-tertiary)" }}>
                Configure your app and trigger your first build.
              </p>
              <button
                onClick={triggerBuild}
                disabled={triggering || remaining <= 0}
                className="inline-flex items-center gap-2 px-5 py-2.5 rounded-lg font-medium text-sm text-white bg-brand-500 hover:bg-brand-600 disabled:opacity-50 transition-colors"
              >
                <Hammer size={16} /> Trigger First Build
              </button>
            </div>
          ) : (
            <div className="text-center py-12 rounded-xl" style={{ background: "var(--bg-elevated)", border: "1px solid var(--border-default)" }}>
              <Smartphone size={28} className="mx-auto mb-3 opacity-30" style={{ color: "var(--text-tertiary)" }} />
              <p className="text-sm" style={{ color: "var(--text-tertiary)" }}>Select an app to see build history</p>
            </div>
          )}
        </div>
      </div>
    </>
  );
}
