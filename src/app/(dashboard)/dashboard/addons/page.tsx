"use client";

import { useState, useEffect } from "react";
import { Header } from "@/components/layout/Header";
import { useAuthStore } from "@/lib/store";
import { apps, addons } from "@/lib/api";
import { emitWalletUpdate } from "@/lib/events";
import { Search, IndianRupee, Check, Loader2, Smartphone, ChevronDown, X, Puzzle, Wallet, ArrowRight } from "lucide-react";
import toast from "react-hot-toast";
import Link from "next/link";

const categories = [
  { slug: "all", label: "All" },
  { slug: "notifications", label: "Notifications" },
  { slug: "analytics", label: "Analytics" },
  { slug: "security", label: "Security" },
  { slug: "monetization", label: "Monetization" },
  { slug: "navigation", label: "Navigation & UI" },
  { slug: "device", label: "Device & Hardware" },
  { slug: "performance", label: "Performance" },
  { slug: "integrations", label: "Integrations" },
  { slug: "platform", label: "Platform-Specific" },
  { slug: "publishing", label: "Publishing" },
  { slug: "india-exclusive", label: "India-Exclusive" },
];

interface CatalogAddon {
  slug: string;
  name: string;
  description: string;
  price: number;
  category: string;
  platforms: string[];
  indiaExclusive?: boolean;
}

interface AppData {
  id: string;
  name: string;
  status: string;
}

interface PurchasedAddon {
  addonSlug: string;
  isActive: boolean;
  appId: string;
}

export default function AddonsPage() {
  const token = useAuthStore((s) => s.accessToken);
  const [search, setSearch] = useState("");
  const [category, setCategory] = useState("all");
  const [loading, setLoading] = useState(true);
  const [buying, setBuying] = useState<string | null>(null);

  // Insufficient balance modal
  const [showTopup, setShowTopup] = useState<{ needed: string; have: string; topup: string } | null>(null);

  // Data
  const [catalog, setCatalog] = useState<CatalogAddon[]>([]);
  const [appList, setAppList] = useState<AppData[]>([]);
  const [selectedApp, setSelectedApp] = useState<string>("");
  const [purchasedSlugs, setPurchasedSlugs] = useState<Set<string>>(new Set());
  const [showAppPicker, setShowAppPicker] = useState(false);

  // Load catalog + apps + purchased addons together to avoid flicker
  useEffect(() => {
    if (!token) return;
    setLoading(true);
    Promise.all([
      addons.catalog(),
      apps.list(token),
    ]).then(async ([catalogData, appData]) => {
      const c = catalogData as CatalogAddon[];
      const a = appData as AppData[];
      setCatalog(c);
      setAppList(a);
      const appId = selectedApp || a[0]?.id;
      if (appId) {
        if (!selectedApp) setSelectedApp(appId);
        const purchased = await addons.forApp(appId, token) as PurchasedAddon[];
        setPurchasedSlugs(new Set(purchased.map((p) => p.addonSlug)));
      }
      setLoading(false);
    }).catch(() => setLoading(false));
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [token]);

  // Reload purchased addons when switching apps (not on first load)
  const [appSwitched, setAppSwitched] = useState(false);
  useEffect(() => {
    if (!token || !selectedApp || !appSwitched) return;
    addons.forApp(selectedApp, token).then((data) => {
      const purchased = data as PurchasedAddon[];
      setPurchasedSlugs(new Set(purchased.map((p) => p.addonSlug)));
    }).catch(() => {});
  }, [token, selectedApp, appSwitched]);

  const selectedAppName = appList.find((a) => a.id === selectedApp)?.name ?? "Select App";

  const filtered = catalog.filter((a) => {
    const catMatch = category === "all"
      || a.category === category
      || (category === "india-exclusive" && a.indiaExclusive);
    if (!catMatch) return false;
    if (search && !a.name.toLowerCase().includes(search.toLowerCase()) && !a.description.toLowerCase().includes(search.toLowerCase())) return false;
    return true;
  });

  const indiaCount = catalog.filter((a) => a.indiaExclusive).length;

  const handlePurchase = async (slug: string) => {
    if (!token || !selectedApp) return;
    setBuying(slug);
    try {
      const result = await addons.purchase(selectedApp, slug, token) as { chargedFormatted?: string; newBalanceFormatted?: string };
      setPurchasedSlugs((prev) => new Set([...prev, slug]));
      toast.success(`Added! Charged ${result.chargedFormatted ?? ""}. Balance: ${result.newBalanceFormatted ?? ""}`);
      emitWalletUpdate();
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : "Failed to add addon";
      if (msg.includes("Insufficient balance")) {
        // Parse amounts from error message
        const needMatch = msg.match(/Need (₹[\d,]+)/);
        const haveMatch = msg.match(/have (₹[\d,]+)/);
        const topupMatch = msg.match(/Top up (₹[\d,]+)/);
        setShowTopup({
          needed: needMatch?.[1] ?? "",
          have: haveMatch?.[1] ?? "",
          topup: topupMatch?.[1] ?? "",
        });
      } else {
        toast.error(msg);
      }
    } finally {
      setBuying(null);
    }
  };

  const handleRemove = async (slug: string) => {
    if (!token || !selectedApp) return;
    setBuying(slug);
    try {
      const result = await addons.remove(selectedApp, slug, token) as { refundedFormatted?: string };
      setPurchasedSlugs((prev) => {
        const next = new Set(prev);
        next.delete(slug);
        return next;
      });
      toast.success(`Removed. ${result.refundedFormatted ?? ""} refunded to wallet.`);
      emitWalletUpdate();
    } catch (err: unknown) {
      toast.error(err instanceof Error ? err.message : "Failed to remove");
    } finally {
      setBuying(null);
    }
  };

  if (loading) {
    return (
      <>
        <Header title="Addon Store" />
        <div className="flex items-center justify-center py-20">
          <Loader2 size={24} className="animate-spin text-brand-500" />
        </div>
      </>
    );
  }

  // No apps yet
  if (appList.length === 0) {
    return (
      <>
        <Header title="Addon Store" />
        <div className="p-6">
          <div className="text-center py-16 rounded-xl" style={{ background: "var(--bg-elevated)", border: "1px solid var(--border-default)" }}>
            <Smartphone size={32} className="mx-auto mb-3 opacity-30" style={{ color: "var(--text-tertiary)" }} />
            <h3 className="font-display font-semibold text-lg mb-2" style={{ color: "var(--text-primary)" }}>Create an app first</h3>
            <p className="text-sm mb-4" style={{ color: "var(--text-tertiary)" }}>Addons are added per-app. Create your first app to start browsing.</p>
            <Link href="/dashboard/app/new" className="inline-flex items-center gap-2 px-5 py-2.5 rounded-lg text-sm font-medium text-white bg-brand-500 hover:bg-brand-600 transition-colors">
              Create App
            </Link>
          </div>
        </div>
      </>
    );
  }

  return (
    <>
      <Header title="Addon Store" />
      <div className="p-6 space-y-5">

        {/* App Selector Bar */}
        <div className="flex items-center justify-between rounded-xl p-4" style={{ background: "var(--bg-elevated)", border: "1px solid var(--border-default)" }}>
          <div className="flex items-center gap-3">
            <p className="text-xs font-medium uppercase tracking-wider" style={{ color: "var(--text-tertiary)" }}>Adding addons to:</p>
            <div className="relative">
              <button
                onClick={() => setShowAppPicker(!showAppPicker)}
                className="flex items-center gap-2 px-3 py-2 rounded-lg text-sm font-semibold transition-colors hover:bg-[var(--bg-secondary)]"
                style={{ color: "var(--text-primary)", border: "1px solid var(--border-default)" }}
              >
                <Smartphone size={14} className="text-brand-500" />
                {selectedAppName}
                <ChevronDown size={14} style={{ color: "var(--text-tertiary)" }} />
              </button>
              {showAppPicker && (
                <div className="absolute top-full left-0 mt-1 w-56 rounded-xl py-1 z-50 shadow-lg" style={{ background: "var(--bg-elevated)", border: "1px solid var(--border-default)" }}>
                  {appList.map((app) => (
                    <button
                      key={app.id}
                      onClick={() => { setSelectedApp(app.id); setShowAppPicker(false); setAppSwitched(true); }}
                      className={`w-full text-left px-4 py-2.5 text-sm flex items-center gap-2 transition-colors hover:bg-[var(--bg-secondary)] ${app.id === selectedApp ? "font-semibold" : ""}`}
                      style={{ color: "var(--text-primary)" }}
                    >
                      <Smartphone size={14} className={app.id === selectedApp ? "text-brand-500" : ""} style={app.id !== selectedApp ? { color: "var(--text-tertiary)" } : undefined} />
                      {app.name}
                      {app.id === selectedApp && <Check size={14} className="ml-auto text-brand-500" />}
                    </button>
                  ))}
                </div>
              )}
            </div>
          </div>
          <div className="flex items-center gap-4 text-xs" style={{ color: "var(--text-tertiary)" }}>
            <span><span className="font-bold text-brand-500">{purchasedSlugs.size}</span> addons active</span>
            <span>{catalog.length} available</span>
          </div>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
          <div className="rounded-xl p-4" style={{ background: "var(--bg-elevated)", border: "1px solid var(--border-default)" }}>
            <p className="text-[10px] font-medium uppercase tracking-wider" style={{ color: "var(--text-tertiary)" }}>Total Addons</p>
            <p className="text-2xl font-display font-bold mt-1" style={{ color: "var(--text-primary)" }}>{catalog.length}</p>
          </div>
          <div className="rounded-xl p-4" style={{ background: "var(--bg-elevated)", border: "1px solid var(--border-default)" }}>
            <p className="text-[10px] font-medium uppercase tracking-wider" style={{ color: "var(--text-tertiary)" }}>Added to App</p>
            <p className="text-2xl font-display font-bold mt-1 text-brand-500">{purchasedSlugs.size}</p>
          </div>
          <div className="rounded-xl p-4" style={{ background: "var(--bg-elevated)", border: "1px solid var(--border-default)" }}>
            <p className="text-[10px] font-medium uppercase tracking-wider" style={{ color: "var(--text-tertiary)" }}>India-Exclusive</p>
            <p className="text-2xl font-display font-bold mt-1" style={{ color: "var(--text-primary)" }}>{indiaCount}</p>
          </div>
          <div className="rounded-xl p-4" style={{ background: "var(--bg-elevated)", border: "1px solid var(--border-default)" }}>
            <p className="text-[10px] font-medium uppercase tracking-wider" style={{ color: "var(--text-tertiary)" }}>Categories</p>
            <p className="text-2xl font-display font-bold mt-1" style={{ color: "var(--text-primary)" }}>{categories.length - 1}</p>
          </div>
        </div>

        {/* Search */}
        <div className="relative">
          <Search size={16} className="absolute left-4 top-1/2 -translate-y-1/2" style={{ color: "var(--text-tertiary)" }} />
          <input
            type="text" value={search} onChange={(e) => setSearch(e.target.value)}
            placeholder={`Search ${catalog.length} addons...`}
            className="w-full pl-11 pr-4 py-3 rounded-xl text-sm outline-none qa-input"
            style={{ background: "var(--bg-elevated)", color: "var(--text-primary)" }}
          />
        </div>

        {/* Categories */}
        <div className="flex gap-2 overflow-x-auto pb-1 scrollbar-hide">
          {categories.map((c) => (
            <button key={c.slug} onClick={() => setCategory(c.slug)}
              className={`px-3 py-2 rounded-lg text-xs font-medium whitespace-nowrap transition-colors ${category === c.slug ? "bg-brand-500 text-white" : ""}`}
              style={category !== c.slug ? { background: "var(--bg-elevated)", color: "var(--text-secondary)", border: "1px solid var(--border-default)" } : undefined}>
              {c.label}
            </button>
          ))}
        </div>

        {/* Results count */}
        <p className="text-xs" style={{ color: "var(--text-tertiary)" }}>
          Showing {filtered.length} addon{filtered.length !== 1 ? "s" : ""}
          {category !== "all" ? ` in ${categories.find((c) => c.slug === category)?.label}` : ""}
        </p>

        {/* Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filtered.map((addon) => {
            const isAdded = purchasedSlugs.has(addon.slug);
            const isBuying = buying === addon.slug;
            const platformStr = Array.isArray(addon.platforms) ? addon.platforms.join(" + ") : addon.platforms;

            return (
              <div key={addon.slug} className="rounded-xl p-5 flex flex-col transition-all hover:shadow-md" style={{ background: "var(--bg-elevated)", border: isAdded ? "1.5px solid rgba(249,115,22,0.3)" : "1px solid var(--border-default)" }}>
                <div className="flex items-start justify-between mb-3">
                  <div className="flex-1 mr-3">
                    <h3 className="font-medium text-sm" style={{ color: "var(--text-primary)" }}>{addon.name}</h3>
                    <div className="flex items-center gap-2 mt-1">
                      {addon.indiaExclusive && (
                        <span className="text-[10px] px-1.5 py-0.5 rounded bg-brand-500/10 text-brand-500 font-semibold">INDIA</span>
                      )}
                      <span className="text-[10px] px-1.5 py-0.5 rounded font-medium" style={{ background: "var(--bg-secondary)", color: "var(--text-tertiary)" }}>
                        {platformStr}
                      </span>
                    </div>
                  </div>
                  <span className="text-sm font-bold flex items-center whitespace-nowrap" style={{ color: "var(--text-primary)" }}>
                    <IndianRupee size={14} />{(addon.price / 100).toLocaleString("en-IN")}
                  </span>
                </div>
                <p className="text-xs flex-1 mb-4 leading-relaxed" style={{ color: "var(--text-tertiary)" }}>{addon.description}</p>
                {isAdded ? (
                  <div className="flex gap-2">
                    <button
                      onClick={() => handleRemove(addon.slug)}
                      disabled={isBuying}
                      className="flex-1 py-2 rounded-lg text-xs font-medium bg-green-500/10 text-green-600 flex items-center justify-center gap-1 hover:bg-red-500/10 hover:text-red-500 transition-colors group"
                    >
                      {isBuying ? <Loader2 size={14} className="animate-spin" /> : (
                        <>
                          <Check size={14} className="group-hover:hidden" />
                          <X size={14} className="hidden group-hover:block" />
                          <span className="group-hover:hidden">Added</span>
                          <span className="hidden group-hover:block">Remove</span>
                        </>
                      )}
                    </button>
                    <Link href={`/dashboard/addons/${addon.slug}?app=${selectedApp}`} className="px-4 py-2 rounded-lg text-xs font-medium bg-brand-500 text-white hover:bg-brand-600 transition-colors">
                      Configure
                    </Link>
                  </div>
                ) : (
                  <button
                    onClick={() => handlePurchase(addon.slug)}
                    disabled={isBuying}
                    className="w-full py-2 rounded-lg text-xs font-medium bg-brand-500 text-white hover:bg-brand-600 disabled:opacity-50 transition-colors flex items-center justify-center gap-1"
                  >
                    {isBuying ? <Loader2 size={14} className="animate-spin" /> : <Puzzle size={14} />}
                    {isBuying ? "Adding..." : "Add to App"}
                  </button>
                )}
              </div>
            );
          })}
        </div>
      </div>

      {/* Insufficient Balance Modal */}
      {showTopup && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4" style={{ background: "rgba(0,0,0,0.6)", backdropFilter: "blur(4px)" }}>
          <div className="w-full max-w-sm rounded-2xl p-6 space-y-5" style={{ background: "var(--bg-elevated)", border: "1px solid var(--border-default)" }}>
            {/* Icon */}
            <div className="w-14 h-14 rounded-2xl bg-red-500/10 flex items-center justify-center mx-auto">
              <Wallet size={28} className="text-red-500" />
            </div>

            {/* Title */}
            <div className="text-center">
              <h3 className="font-display text-lg font-bold" style={{ color: "var(--text-primary)" }}>Insufficient Balance</h3>
              <p className="text-sm mt-1" style={{ color: "var(--text-tertiary)" }}>Your MintWallet doesn&apos;t have enough funds.</p>
            </div>

            {/* Amount breakdown */}
            <div className="rounded-xl p-4 space-y-2.5" style={{ background: "var(--bg-secondary)" }}>
              <div className="flex justify-between text-sm">
                <span style={{ color: "var(--text-tertiary)" }}>Addon cost</span>
                <span className="font-semibold" style={{ color: "var(--text-primary)" }}>{showTopup.needed}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span style={{ color: "var(--text-tertiary)" }}>Your balance</span>
                <span className="font-semibold text-red-500">{showTopup.have}</span>
              </div>
              <div className="border-t pt-2.5" style={{ borderColor: "var(--border-default)" }}>
                <div className="flex justify-between text-sm">
                  <span className="font-medium" style={{ color: "var(--text-primary)" }}>Top up needed</span>
                  <span className="font-bold text-brand-500">{showTopup.topup}</span>
                </div>
              </div>
            </div>

            {/* Buttons */}
            <div className="flex gap-3">
              <button
                onClick={() => setShowTopup(null)}
                className="flex-1 py-3 rounded-xl text-sm font-medium transition-colors"
                style={{ background: "var(--bg-secondary)", color: "var(--text-secondary)", border: "1px solid var(--border-default)" }}
              >
                Cancel
              </button>
              <Link
                href="/dashboard/wallet"
                onClick={() => setShowTopup(null)}
                className="flex-[2] py-3 rounded-xl text-sm font-semibold text-white bg-brand-500 hover:bg-brand-600 transition-colors flex items-center justify-center gap-2"
              >
                <Wallet size={16} /> Top Up Wallet <ArrowRight size={14} />
              </Link>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
