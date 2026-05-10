"use client";

import { Header } from "@/components/layout/Header";
import { useAuthStore } from "@/lib/store";
import { useApi } from "@/hooks/useApi";
import { apps, addons, wallet, orgs } from "@/lib/api";
import {
  Smartphone, Puzzle, Hammer, ArrowRight, Wallet, Plus,
  Globe, CheckCircle2, Clock, AlertTriangle, Zap, Crown,
  ChevronRight, Loader2,
  Package, CreditCard, Settings, ArrowUpRight,
} from "lucide-react";
import Link from "next/link";

// ── Types ───────────────────────────────────────────

interface BuildData {
  id: string;
  status: string;
  buildNumber: number;
  platform: string;
  createdAt: string;
}

interface RevisionData {
  usedCount: number;
  freeLimit: number;
  extraPurchased: number;
  cycleStart: string;
}

interface AppData {
  id: string;
  name: string;
  bundleId: string;
  url: string;
  status: string;
  shortDescription: string | null;
  iconUrl: string | null;
  configJson: { branding?: { themeColor?: string }; [key: string]: unknown };
  createdAt: string;
  updatedAt: string;
  builds: BuildData[];
  revision: RevisionData | null;
}

interface PurchasedAddon {
  addonSlug: string;
  isActive: boolean;
  purchasedAt: string;
  addonMeta: { name: string; category: string; price: number };
}

interface WalletData {
  balance: number;
  balanceFormatted: string;
  lastUpdated: string;
}

interface OrgData {
  id: string;
  name: string;
  slug: string;
  plan: string;
  status: string;
  billingEmail: string | null;
  gstNumber: string | null;
  planExpiresAt: string | null;
  createdAt: string;
  mintWallet: { balance: number } | null;
}

// ── Plan config (mirrors backend PLAN_LIMITS) ──────

interface PlanConfig { maxApps: number; freeRevisions: number; buildQueue: string; iosSupport: boolean; addonStore: boolean; color: string }

const PLAN_CONFIG: Record<string, PlanConfig> = {
  free:    { maxApps: 1, freeRevisions: 1, buildQueue: "Free (45-min wait)", iosSupport: false, addonStore: false, color: "#6B7280" },
  starter: { maxApps: 1, freeRevisions: 3, buildQueue: "Standard", iosSupport: false, addonStore: true, color: "#3B82F6" },
  pro:     { maxApps: 1, freeRevisions: 3, buildQueue: "Priority", iosSupport: true, addonStore: true, color: "#F97316" },
  premium: { maxApps: 1, freeRevisions: 5, buildQueue: "Immediate", iosSupport: true, addonStore: true, color: "#8B5CF6" },
};

const DEFAULT_PLAN: PlanConfig = PLAN_CONFIG["free"]!;

// ── Skeleton ────────────────────────────────────────

function Skeleton({ className = "" }: { className?: string }) {
  return <div className={`animate-pulse rounded-lg ${className}`} style={{ background: "var(--bg-secondary)" }} />;
}

function StatCardSkeleton() {
  return (
    <div className="rounded-xl p-5" style={{ background: "var(--bg-elevated)", border: "1px solid var(--border-default)" }}>
      <Skeleton className="h-4 w-20 mb-3" />
      <Skeleton className="h-8 w-16" />
    </div>
  );
}

// ── Status helpers ──────────────────────────────────

interface StatusCfg { icon: React.ElementType; color: string; bg: string; label: string }

const STATUS_DRAFT: StatusCfg = { icon: Clock, color: "#9CA3AF", bg: "rgba(156,163,175,0.1)", label: "Draft" };

const STATUS_CONFIG: Record<string, StatusCfg> = {
  draft:      STATUS_DRAFT,
  configured: { icon: CheckCircle2, color: "#3B82F6", bg: "rgba(59,130,246,0.1)", label: "Configured" },
  building:   { icon: Loader2, color: "#F97316", bg: "rgba(249,115,22,0.1)", label: "Building" },
  ready:      { icon: CheckCircle2, color: "#22C55E", bg: "rgba(34,197,94,0.1)", label: "Ready" },
  suspended:  { icon: AlertTriangle, color: "#EF4444", bg: "rgba(239,68,68,0.1)", label: "Suspended" },
};

const BUILD_STATUS_CONFIG: Record<string, { color: string; label: string }> = {
  pending:    { color: "#9CA3AF", label: "Pending" },
  queued:     { color: "#F59E0B", label: "Queued" },
  preparing:  { color: "#3B82F6", label: "Preparing" },
  building:   { color: "#F97316", label: "Building" },
  packaging:  { color: "#8B5CF6", label: "Packaging" },
  completed:  { color: "#22C55E", label: "Completed" },
  failed:     { color: "#EF4444", label: "Failed" },
  cancelled:  { color: "#6B7280", label: "Cancelled" },
};

function getConfigCompleteness(config: Record<string, unknown>): number {
  if (!config) return 0;
  const sections = ["identity", "branding", "display", "links", "security", "noInternet", "advanced"];
  const filled = sections.filter((s) => {
    const val = config[s];
    return val && typeof val === "object" && Object.keys(val as object).length > 0;
  }).length;
  return Math.round((filled / sections.length) * 100);
}

function timeAgo(dateStr: string): string {
  const diff = Date.now() - new Date(dateStr).getTime();
  const mins = Math.floor(diff / 60000);
  if (mins < 1) return "just now";
  if (mins < 60) return `${mins}m ago`;
  const hours = Math.floor(mins / 60);
  if (hours < 24) return `${hours}h ago`;
  const days = Math.floor(hours / 24);
  if (days < 30) return `${days}d ago`;
  return new Date(dateStr).toLocaleDateString("en-IN", { day: "numeric", month: "short" });
}

// ── Main Component ──────────────────────────────────

export default function DashboardPage() {
  const { user, org } = useAuthStore();
  const plan = org?.plan ?? "free";
  const planConfig = PLAN_CONFIG[plan] ?? DEFAULT_PLAN;

  const { data: appList, loading: appsLoading } = useApi<AppData[]>((t) => apps.list(t));
  const { data: purchasedAddons, loading: addonsLoading } = useApi<PurchasedAddon[]>((t) => addons.purchased(t));
  const { data: walletData, loading: walletLoading } = useApi<WalletData>((t) => wallet.balance(t));
  const { data: orgData } = useApi<OrgData>((t) => orgs.me(t));

  const totalBuilds = appList?.reduce((sum, app) => sum + (app.builds?.length ?? 0), 0) ?? 0;
  const totalRevisions = appList?.reduce((sum, app) => sum + (app.revision?.usedCount ?? 0), 0) ?? 0;
  const totalRevisionLimit = appList?.reduce((sum, app) => sum + (app.revision?.freeLimit ?? 0) + (app.revision?.extraPurchased ?? 0), 0) ?? 0;
  const lastBuild = appList?.flatMap((a) => a.builds).sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())[0];

  const isLoading = appsLoading || addonsLoading || walletLoading;

  return (
    <>
      <Header title="Dashboard" />
      <div className="p-6 space-y-6 max-w-[1400px]">

        {/* ── Welcome Banner ────────────────────────── */}
        <div className="rounded-2xl p-6 relative overflow-hidden" style={{ background: "linear-gradient(135deg, #F97316 0%, #EA580C 50%, #DC2626 100%)" }}>
          <div className="absolute top-0 right-0 w-48 h-48 rounded-full opacity-10" style={{ background: "white", transform: "translate(30%, -30%)" }} />
          <div className="absolute bottom-0 left-1/2 w-32 h-32 rounded-full opacity-5" style={{ background: "white", transform: "translate(-50%, 50%)" }} />
          <div className="relative">
            <div className="flex items-start justify-between">
              <div>
                <h2 className="font-display text-xl font-bold text-white">
                  Welcome back, {user?.name?.split(" ")[0] ?? "there"} 👋
                </h2>
                <p className="text-white/70 text-sm mt-1.5 max-w-md">
                  {plan === "free"
                    ? "You're on the Free plan. Upgrade to unlock addons, faster builds, and iOS support."
                    : appList?.length === 0
                      ? "Your dashboard is empty — create your first app to get started."
                      : lastBuild
                        ? `Last build was ${timeAgo(lastBuild.createdAt)}. Keep building!`
                        : "Your app is configured. Trigger your first build when ready."}
                </p>
              </div>
              <div className="hidden sm:flex items-center gap-2 px-3 py-1.5 rounded-full bg-white/15 backdrop-blur-sm">
                <Crown size={14} className="text-white" />
                <span className="text-xs font-semibold text-white uppercase tracking-wide">{plan} plan</span>
              </div>
            </div>
            <div className="flex flex-wrap gap-3 mt-5">
              {plan === "free" ? (
                <Link href="/dashboard/billing" className="inline-flex items-center gap-2 px-4 py-2 bg-white text-brand-600 rounded-lg text-sm font-semibold hover:bg-white/90 transition-colors">
                  Upgrade now <ArrowRight size={14} />
                </Link>
              ) : (
                <Link href="/dashboard/app/new" className="inline-flex items-center gap-2 px-4 py-2 bg-white/15 hover:bg-white/25 text-white rounded-lg text-sm font-medium backdrop-blur-sm transition-colors">
                  <Plus size={14} /> Create App
                </Link>
              )}
              <Link href="/dashboard/builds" className="inline-flex items-center gap-2 px-4 py-2 bg-white/10 hover:bg-white/20 text-white/90 rounded-lg text-sm font-medium backdrop-blur-sm transition-colors">
                <Hammer size={14} /> Build History
              </Link>
            </div>
          </div>
        </div>

        {/* ── Stats Grid ────────────────────────────── */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          {isLoading ? (
            <>
              <StatCardSkeleton />
              <StatCardSkeleton />
              <StatCardSkeleton />
              <StatCardSkeleton />
            </>
          ) : (
            <>
              {/* Apps */}
              <Link href="/dashboard/app" className="rounded-xl p-5 flex flex-col justify-between group transition-all hover:shadow-lg hover:-translate-y-0.5" style={{ background: "var(--bg-elevated)", border: "1px solid var(--border-default)" }}>
                <div className="flex items-center justify-between mb-3">
                  <p className="text-xs font-medium uppercase tracking-wider" style={{ color: "var(--text-tertiary)" }}>My Apps</p>
                  <div className="p-2 rounded-lg" style={{ background: "rgba(59,130,246,0.1)" }}>
                    <Smartphone size={16} style={{ color: "#3B82F6" }} />
                  </div>
                </div>
                <div className="flex items-baseline gap-1.5">
                  <span className="text-3xl font-display font-bold" style={{ color: "var(--text-primary)" }}>{appList?.length ?? 0}</span>
                  <span className="text-sm" style={{ color: "var(--text-tertiary)" }}>/ {planConfig.maxApps}</span>
                </div>
                <div className="mt-2 h-1.5 rounded-full overflow-hidden" style={{ background: "var(--bg-secondary)" }}>
                  <div className="h-full rounded-full transition-all" style={{ width: `${Math.min(((appList?.length ?? 0) / planConfig.maxApps) * 100, 100)}%`, background: "#3B82F6" }} />
                </div>
              </Link>

              {/* Addons */}
              <Link href="/dashboard/addons" className="rounded-xl p-5 flex flex-col justify-between group transition-all hover:shadow-lg hover:-translate-y-0.5" style={{ background: "var(--bg-elevated)", border: "1px solid var(--border-default)" }}>
                <div className="flex items-center justify-between mb-3">
                  <p className="text-xs font-medium uppercase tracking-wider" style={{ color: "var(--text-tertiary)" }}>Active Addons</p>
                  <div className="p-2 rounded-lg" style={{ background: "rgba(139,92,246,0.1)" }}>
                    <Puzzle size={16} style={{ color: "#8B5CF6" }} />
                  </div>
                </div>
                <span className="text-3xl font-display font-bold" style={{ color: "var(--text-primary)" }}>
                  {purchasedAddons?.filter((a) => a.isActive).length ?? 0}
                </span>
                <p className="text-xs mt-1" style={{ color: "var(--text-tertiary)" }}>
                  {purchasedAddons && purchasedAddons.length > 0
                    ? `${purchasedAddons.length} purchased`
                    : plan === "free" ? "Upgrade to unlock" : "Browse 82 available"}
                </p>
              </Link>

              {/* Builds */}
              <Link href="/dashboard/builds" className="rounded-xl p-5 flex flex-col justify-between group transition-all hover:shadow-lg hover:-translate-y-0.5" style={{ background: "var(--bg-elevated)", border: "1px solid var(--border-default)" }}>
                <div className="flex items-center justify-between mb-3">
                  <p className="text-xs font-medium uppercase tracking-wider" style={{ color: "var(--text-tertiary)" }}>Total Builds</p>
                  <div className="p-2 rounded-lg" style={{ background: "rgba(249,115,22,0.1)" }}>
                    <Hammer size={16} style={{ color: "#F97316" }} />
                  </div>
                </div>
                <span className="text-3xl font-display font-bold" style={{ color: "var(--text-primary)" }}>{totalBuilds}</span>
                <p className="text-xs mt-1" style={{ color: "var(--text-tertiary)" }}>
                  {lastBuild ? `Last: ${timeAgo(lastBuild.createdAt)}` : "No builds yet"}
                </p>
              </Link>

              {/* Wallet */}
              <Link href="/dashboard/wallet" className="rounded-xl p-5 flex flex-col justify-between group transition-all hover:shadow-lg hover:-translate-y-0.5" style={{ background: "var(--bg-elevated)", border: "1px solid var(--border-default)" }}>
                <div className="flex items-center justify-between mb-3">
                  <p className="text-xs font-medium uppercase tracking-wider" style={{ color: "var(--text-tertiary)" }}>MintWallet</p>
                  <div className="p-2 rounded-lg" style={{ background: "rgba(34,197,94,0.1)" }}>
                    <Wallet size={16} style={{ color: "#22C55E" }} />
                  </div>
                </div>
                <span className="text-3xl font-display font-bold" style={{ color: "var(--text-primary)" }}>
                  {walletData?.balanceFormatted ?? "₹0"}
                </span>
                <p className="text-xs mt-1" style={{ color: "var(--text-tertiary)" }}>
                  Across all Darsh Gupta products
                </p>
              </Link>
            </>
          )}
        </div>

        {/* ── Two-column layout ─────────────────────── */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">

          {/* Left column (2/3) */}
          <div className="lg:col-span-2 space-y-6">

            {/* Your Apps */}
            <div className="rounded-xl overflow-hidden" style={{ background: "var(--bg-elevated)", border: "1px solid var(--border-default)" }}>
              <div className="flex items-center justify-between px-5 py-4 border-b" style={{ borderColor: "var(--border-default)" }}>
                <h3 className="font-display font-semibold text-sm" style={{ color: "var(--text-primary)" }}>Your Apps</h3>
                <Link href="/dashboard/app/new" className="flex items-center gap-1.5 text-xs font-medium text-brand-500 hover:text-brand-600 transition-colors">
                  <Plus size={14} /> New App
                </Link>
              </div>
              {appsLoading ? (
                <div className="p-5 space-y-3">
                  <Skeleton className="h-20 w-full" />
                  <Skeleton className="h-20 w-full" />
                </div>
              ) : appList && appList.length > 0 ? (
                <div className="divide-y" style={{ borderColor: "var(--border-default)" }}>
                  {appList.map((app) => {
                    const statusCfg = STATUS_CONFIG[app.status] ?? STATUS_DRAFT;
                    const StatusIcon = statusCfg.icon;
                    const configPct = getConfigCompleteness(app.configJson);
                    const themeColor = app.configJson?.branding?.themeColor ?? "#F97316";
                    const latestBuild = app.builds?.[0];

                    return (
                      <Link key={app.id} href={`/dashboard/app/${app.id}`} className="flex items-center gap-4 p-5 hover:bg-[var(--bg-secondary)] transition-colors group">
                        {/* App icon or color swatch */}
                        <div className="w-12 h-12 rounded-xl flex items-center justify-center shrink-0 relative overflow-hidden" style={{ background: `${themeColor}15`, border: `1.5px solid ${themeColor}30` }}>
                          {app.iconUrl ? (
                            <img src={app.iconUrl} alt={app.name} className="w-full h-full rounded-xl object-cover" />
                          ) : (
                            <Smartphone size={20} style={{ color: themeColor }} />
                          )}
                        </div>

                        {/* Info */}
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2">
                            <p className="font-medium text-sm truncate" style={{ color: "var(--text-primary)" }}>{app.name}</p>
                            <span className="flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-semibold" style={{ background: statusCfg.bg, color: statusCfg.color }}>
                              <StatusIcon size={10} className={app.status === "building" ? "animate-spin" : ""} />
                              {statusCfg.label}
                            </span>
                          </div>
                          <div className="flex items-center gap-3 mt-1.5">
                            <span className="flex items-center gap-1 text-xs" style={{ color: "var(--text-tertiary)" }}>
                              <Globe size={11} /> {new URL(app.url).hostname}
                            </span>
                            <span className="text-xs" style={{ color: "var(--text-tertiary)" }}>
                              {app.bundleId}
                            </span>
                          </div>

                          {/* Progress bar for config completeness */}
                          <div className="flex items-center gap-2 mt-2">
                            <div className="flex-1 h-1 rounded-full max-w-[120px]" style={{ background: "var(--bg-secondary)" }}>
                              <div className="h-full rounded-full transition-all" style={{ width: `${configPct}%`, background: configPct === 100 ? "#22C55E" : "#F97316" }} />
                            </div>
                            <span className="text-[10px] font-medium" style={{ color: configPct === 100 ? "#22C55E" : "var(--text-tertiary)" }}>
                              {configPct}% configured
                            </span>
                          </div>
                        </div>

                        {/* Right side: build + revision info */}
                        <div className="hidden sm:flex flex-col items-end gap-1.5 shrink-0">
                          {latestBuild ? (
                            <span className="flex items-center gap-1 text-xs font-medium" style={{ color: BUILD_STATUS_CONFIG[latestBuild.status]?.color ?? "#6B7280" }}>
                              Build #{latestBuild.buildNumber} — {BUILD_STATUS_CONFIG[latestBuild.status]?.label ?? latestBuild.status}
                            </span>
                          ) : (
                            <span className="text-xs" style={{ color: "var(--text-tertiary)" }}>No builds</span>
                          )}
                          <span className="text-xs" style={{ color: "var(--text-tertiary)" }}>
                            Revisions: {app.revision?.usedCount ?? 0}/{(app.revision?.freeLimit ?? 0) + (app.revision?.extraPurchased ?? 0)}
                          </span>
                          <span className="text-[10px]" style={{ color: "var(--text-tertiary)" }}>
                            Updated {timeAgo(app.updatedAt)}
                          </span>
                        </div>

                        <ChevronRight size={16} className="shrink-0 opacity-0 group-hover:opacity-100 transition-opacity" style={{ color: "var(--text-tertiary)" }} />
                      </Link>
                    );
                  })}
                </div>
              ) : (
                <div className="p-8 text-center">
                  <div className="w-14 h-14 rounded-2xl bg-brand-500/10 flex items-center justify-center mx-auto mb-3">
                    <Smartphone size={28} className="text-brand-500" />
                  </div>
                  <h4 className="font-display font-semibold text-sm mb-1" style={{ color: "var(--text-primary)" }}>No apps yet</h4>
                  <p className="text-xs mb-4 max-w-xs mx-auto" style={{ color: "var(--text-tertiary)" }}>
                    Paste your website URL to create your first app. Takes 2 minutes.
                  </p>
                  <Link href="/dashboard/app/new" className="inline-flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium text-white bg-brand-500 hover:bg-brand-600 transition-colors">
                    <Plus size={14} /> Create App
                  </Link>
                </div>
              )}
            </div>

            {/* Quick Actions */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <Link href="/dashboard/app/new" className="flex items-center gap-3 p-4 rounded-xl transition-all hover:shadow-md hover:-translate-y-0.5" style={{ background: "var(--bg-elevated)", border: "1px solid var(--border-default)" }}>
                <div className="w-10 h-10 rounded-lg flex items-center justify-center" style={{ background: "rgba(59,130,246,0.1)" }}>
                  <Plus size={18} style={{ color: "#3B82F6" }} />
                </div>
                <div>
                  <p className="font-medium text-sm" style={{ color: "var(--text-primary)" }}>Create App</p>
                  <p className="text-[11px]" style={{ color: "var(--text-tertiary)" }}>From any URL</p>
                </div>
              </Link>
              <Link href="/dashboard/addons" className="flex items-center gap-3 p-4 rounded-xl transition-all hover:shadow-md hover:-translate-y-0.5" style={{ background: "var(--bg-elevated)", border: "1px solid var(--border-default)" }}>
                <div className="w-10 h-10 rounded-lg flex items-center justify-center" style={{ background: "rgba(139,92,246,0.1)" }}>
                  <Package size={18} style={{ color: "#8B5CF6" }} />
                </div>
                <div>
                  <p className="font-medium text-sm" style={{ color: "var(--text-primary)" }}>Browse Addons</p>
                  <p className="text-[11px]" style={{ color: "var(--text-tertiary)" }}>82 addons available</p>
                </div>
              </Link>
              <Link href="/dashboard/billing" className="flex items-center gap-3 p-4 rounded-xl transition-all hover:shadow-md hover:-translate-y-0.5" style={{ background: "var(--bg-elevated)", border: "1px solid var(--border-default)" }}>
                <div className="w-10 h-10 rounded-lg flex items-center justify-center" style={{ background: "rgba(34,197,94,0.1)" }}>
                  <CreditCard size={18} style={{ color: "#22C55E" }} />
                </div>
                <div>
                  <p className="font-medium text-sm" style={{ color: "var(--text-primary)" }}>Billing</p>
                  <p className="text-[11px]" style={{ color: "var(--text-tertiary)" }}>Invoices & plan</p>
                </div>
              </Link>
            </div>

            {/* Getting Started Checklist */}
            {appList && appList.length > 0 && (() => {
              const app = appList[0]!;
              const configPct = getConfigCompleteness(app.configJson);
              const hasIcon = !!app.iconUrl;
              const hasBuilt = (app.builds?.length ?? 0) > 0;
              const hasAddons = (purchasedAddons?.length ?? 0) > 0;
              const allDone = configPct === 100 && hasIcon && hasBuilt;

              if (allDone) return null;

              const steps = [
                { done: true, label: "Create your app", desc: "App created and URL set", href: `/dashboard/app/${app.id}` },
                { done: configPct === 100, label: "Complete app configuration", desc: `${configPct}% done — configure all 7 sections`, href: `/dashboard/app/${app.id}` },
                { done: hasIcon, label: "Upload app icon & splash screen", desc: "1024x1024 PNG for app stores", href: `/dashboard/app/${app.id}` },
                { done: hasAddons, label: "Add your first addon", desc: "Push notifications, analytics, payments...", href: "/dashboard/addons" },
                { done: hasBuilt, label: "Trigger your first build", desc: "Generate APK/IPA from your config", href: "/dashboard/builds" },
              ];
              const completed = steps.filter((s) => s.done).length;

              return (
                <div className="rounded-xl overflow-hidden" style={{ background: "var(--bg-elevated)", border: "1px solid var(--border-default)" }}>
                  <div className="flex items-center justify-between px-5 py-4 border-b" style={{ borderColor: "var(--border-default)" }}>
                    <h3 className="font-display font-semibold text-sm" style={{ color: "var(--text-primary)" }}>Getting Started</h3>
                    <span className="text-xs font-medium" style={{ color: "var(--text-tertiary)" }}>{completed}/{steps.length} complete</span>
                  </div>
                  <div className="p-5">
                    {/* Progress bar */}
                    <div className="h-2 rounded-full mb-5 overflow-hidden" style={{ background: "var(--bg-secondary)" }}>
                      <div className="h-full rounded-full transition-all duration-500" style={{ width: `${(completed / steps.length) * 100}%`, background: "linear-gradient(90deg, #F97316, #22C55E)" }} />
                    </div>
                    <div className="space-y-1">
                      {steps.map((step, i) => (
                        <Link key={i} href={step.href} className="flex items-start gap-3 p-3 rounded-lg transition-colors hover:bg-[var(--bg-secondary)] group">
                          <div className={`w-6 h-6 rounded-full flex items-center justify-center shrink-0 mt-0.5 ${step.done ? "bg-green-500" : ""}`}
                            style={!step.done ? { background: "var(--bg-secondary)", border: "1.5px solid var(--border-default)" } : undefined}>
                            {step.done ? (
                              <CheckCircle2 size={14} className="text-white" />
                            ) : (
                              <span className="text-[10px] font-bold" style={{ color: "var(--text-tertiary)" }}>{i + 1}</span>
                            )}
                          </div>
                          <div className="flex-1 min-w-0">
                            <p className={`text-sm font-medium ${step.done ? "line-through opacity-50" : ""}`} style={{ color: "var(--text-primary)" }}>
                              {step.label}
                            </p>
                            <p className="text-[11px] mt-0.5" style={{ color: "var(--text-tertiary)" }}>{step.desc}</p>
                          </div>
                          {!step.done && (
                            <ArrowRight size={14} className="shrink-0 mt-1 opacity-0 group-hover:opacity-100 transition-opacity text-brand-500" />
                          )}
                        </Link>
                      ))}
                    </div>
                  </div>
                </div>
              );
            })()}

          </div>

          {/* Right column (1/3) */}
          <div className="space-y-6">

            {/* Plan Card */}
            <div className="rounded-xl overflow-hidden" style={{ background: "var(--bg-elevated)", border: "1px solid var(--border-default)" }}>
              <div className="px-5 py-4 border-b" style={{ borderColor: "var(--border-default)" }}>
                <h3 className="font-display font-semibold text-sm" style={{ color: "var(--text-primary)" }}>Plan & Usage</h3>
              </div>
              <div className="p-5 space-y-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <div className="w-8 h-8 rounded-lg flex items-center justify-center" style={{ background: `${planConfig.color}15` }}>
                      <Crown size={16} style={{ color: planConfig.color }} />
                    </div>
                    <div>
                      <p className="text-sm font-semibold uppercase" style={{ color: planConfig.color }}>{plan}</p>
                      <p className="text-[10px]" style={{ color: "var(--text-tertiary)" }}>
                        {orgData?.planExpiresAt
                          ? `Expires ${new Date(orgData.planExpiresAt).toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" })}`
                          : plan === "free" ? "No expiry" : "Active"}
                      </p>
                    </div>
                  </div>
                  {plan !== "premium" && (
                    <Link href="/dashboard/billing" className="text-xs font-medium text-brand-500 hover:text-brand-600 flex items-center gap-1">
                      Upgrade <ArrowUpRight size={12} />
                    </Link>
                  )}
                </div>

                <div className="space-y-3">
                  <div>
                    <div className="flex justify-between text-xs mb-1">
                      <span style={{ color: "var(--text-tertiary)" }}>Apps</span>
                      <span style={{ color: "var(--text-secondary)" }}>{appList?.length ?? 0} / {planConfig.maxApps}</span>
                    </div>
                    <div className="h-1.5 rounded-full" style={{ background: "var(--bg-secondary)" }}>
                      <div className="h-full rounded-full" style={{ width: `${Math.min(((appList?.length ?? 0) / planConfig.maxApps) * 100, 100)}%`, background: planConfig.color }} />
                    </div>
                  </div>
                  <div>
                    <div className="flex justify-between text-xs mb-1">
                      <span style={{ color: "var(--text-tertiary)" }}>Revisions Used</span>
                      <span style={{ color: "var(--text-secondary)" }}>{totalRevisions} / {totalRevisionLimit || planConfig.freeRevisions}</span>
                    </div>
                    <div className="h-1.5 rounded-full" style={{ background: "var(--bg-secondary)" }}>
                      <div className="h-full rounded-full" style={{ width: `${totalRevisionLimit > 0 ? Math.min((totalRevisions / totalRevisionLimit) * 100, 100) : 0}%`, background: totalRevisions >= totalRevisionLimit ? "#EF4444" : planConfig.color }} />
                    </div>
                  </div>
                </div>

                <div className="space-y-2 pt-2">
                  <div className="flex items-center justify-between text-xs">
                    <span className="flex items-center gap-1.5" style={{ color: "var(--text-tertiary)" }}>
                      <Zap size={12} /> Build Queue
                    </span>
                    <span className="font-medium" style={{ color: "var(--text-secondary)" }}>{planConfig.buildQueue}</span>
                  </div>
                  <div className="flex items-center justify-between text-xs">
                    <span className="flex items-center gap-1.5" style={{ color: "var(--text-tertiary)" }}>
                      <Smartphone size={12} /> iOS Support
                    </span>
                    <span className="font-medium" style={{ color: planConfig.iosSupport ? "#22C55E" : "var(--text-tertiary)" }}>
                      {planConfig.iosSupport ? "Enabled" : "Pro+"}
                    </span>
                  </div>
                  <div className="flex items-center justify-between text-xs">
                    <span className="flex items-center gap-1.5" style={{ color: "var(--text-tertiary)" }}>
                      <Package size={12} /> Addon Store
                    </span>
                    <span className="font-medium" style={{ color: planConfig.addonStore ? "#22C55E" : "var(--text-tertiary)" }}>
                      {planConfig.addonStore ? "Unlocked" : "Starter+"}
                    </span>
                  </div>
                </div>
              </div>
            </div>

            {/* Active Addons */}
            <div className="rounded-xl overflow-hidden" style={{ background: "var(--bg-elevated)", border: "1px solid var(--border-default)" }}>
              <div className="flex items-center justify-between px-5 py-4 border-b" style={{ borderColor: "var(--border-default)" }}>
                <h3 className="font-display font-semibold text-sm" style={{ color: "var(--text-primary)" }}>Active Addons</h3>
                <Link href="/dashboard/addons" className="text-xs font-medium text-brand-500 hover:text-brand-600">
                  View all
                </Link>
              </div>
              {addonsLoading ? (
                <div className="p-5 space-y-2">
                  <Skeleton className="h-10 w-full" />
                  <Skeleton className="h-10 w-full" />
                </div>
              ) : purchasedAddons && purchasedAddons.length > 0 ? (
                <div className="divide-y" style={{ borderColor: "var(--border-default)" }}>
                  {purchasedAddons.slice(0, 5).map((addon) => (
                    <Link key={addon.addonSlug} href={`/dashboard/addons?slug=${addon.addonSlug}`} className="flex items-center justify-between px-5 py-3 hover:bg-[var(--bg-secondary)] transition-colors">
                      <div className="flex items-center gap-2.5">
                        <div className="w-7 h-7 rounded-md flex items-center justify-center" style={{ background: "rgba(139,92,246,0.1)" }}>
                          <Puzzle size={13} style={{ color: "#8B5CF6" }} />
                        </div>
                        <div>
                          <p className="text-xs font-medium" style={{ color: "var(--text-primary)" }}>{addon.addonMeta.name}</p>
                          <p className="text-[10px] capitalize" style={{ color: "var(--text-tertiary)" }}>{addon.addonMeta.category}</p>
                        </div>
                      </div>
                      <span className={`text-[10px] px-1.5 py-0.5 rounded font-medium ${addon.isActive ? "bg-green-500/10 text-green-600" : "bg-gray-500/10 text-gray-500"}`}>
                        {addon.isActive ? "Active" : "Paused"}
                      </span>
                    </Link>
                  ))}
                </div>
              ) : (
                <div className="p-5 text-center">
                  <Puzzle size={24} className="mx-auto mb-2 opacity-20" style={{ color: "var(--text-tertiary)" }} />
                  <p className="text-xs" style={{ color: "var(--text-tertiary)" }}>
                    {plan === "free" ? "Upgrade to access addons" : "No addons purchased yet"}
                  </p>
                </div>
              )}
            </div>

            {/* Organisation Info */}
            <div className="rounded-xl overflow-hidden" style={{ background: "var(--bg-elevated)", border: "1px solid var(--border-default)" }}>
              <div className="flex items-center justify-between px-5 py-4 border-b" style={{ borderColor: "var(--border-default)" }}>
                <h3 className="font-display font-semibold text-sm" style={{ color: "var(--text-primary)" }}>Organisation</h3>
                <Link href="/dashboard/settings" className="text-xs font-medium" style={{ color: "var(--text-tertiary)" }}>
                  <Settings size={14} />
                </Link>
              </div>
              <div className="p-5 space-y-3">
                <div className="flex items-center justify-between text-xs">
                  <span style={{ color: "var(--text-tertiary)" }}>Name</span>
                  <span className="font-medium" style={{ color: "var(--text-secondary)" }}>{org?.name ?? "—"}</span>
                </div>
                <div className="flex items-center justify-between text-xs">
                  <span style={{ color: "var(--text-tertiary)" }}>Slug</span>
                  <span className="font-mono text-[10px]" style={{ color: "var(--text-tertiary)" }}>{orgData?.slug ?? "—"}</span>
                </div>
                <div className="flex items-center justify-between text-xs">
                  <span style={{ color: "var(--text-tertiary)" }}>Billing Email</span>
                  <span className="font-medium truncate max-w-[140px]" style={{ color: "var(--text-secondary)" }}>{orgData?.billingEmail ?? "—"}</span>
                </div>
                <div className="flex items-center justify-between text-xs">
                  <span style={{ color: "var(--text-tertiary)" }}>GSTIN</span>
                  <span className="font-mono text-[10px]" style={{ color: orgData?.gstNumber ? "var(--text-secondary)" : "var(--text-tertiary)" }}>
                    {orgData?.gstNumber ?? "Not set"}
                  </span>
                </div>
                <div className="flex items-center justify-between text-xs">
                  <span style={{ color: "var(--text-tertiary)" }}>Member since</span>
                  <span style={{ color: "var(--text-secondary)" }}>
                    {orgData ? new Date(orgData.createdAt).toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" }) : "—"}
                  </span>
                </div>
              </div>
            </div>

          </div>
        </div>
      </div>
    </>
  );
}
