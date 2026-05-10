"use client";

import { useState, useEffect, useCallback, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import toast from "react-hot-toast";
import { Header } from "@/components/layout/Header";
import { useAuthStore } from "@/lib/store";
import { apps, siteMeta, addons } from "@/lib/api";
import {
  Globe, ArrowRight, ArrowLeft, Smartphone, Loader2,
  CheckCircle2, AlertCircle, Link2, Type, Package,
  Sparkles, Shield, Info, Puzzle, IndianRupee, Check, SkipForward,
} from "lucide-react";

// ── Types ────────────────────────────────────────────

interface SiteInfo {
  title: string | null;
  favicon: string | null;
  description: string | null;
  ogImage: string | null;
  themeColor: string | null;
  generator: string | null;
  language: string | null;
  valid: boolean;
  error?: string | undefined;
}

// ── URL Validator ────────────────────────────────────

function normalizeUrl(raw: string): string {
  let u = raw.trim();
  if (!u) return "";
  if (!u.startsWith("http://") && !u.startsWith("https://")) {
    u = "https://" + u;
  }
  try {
    const parsed = new URL(u);
    return parsed.toString();
  } catch {
    return "";
  }
}

function extractDomain(url: string): string {
  try {
    return new URL(url).hostname.replace(/^www\./, "");
  } catch {
    return "";
  }
}

function generateBundleId(domain: string): string {
  const parts = domain.split(".").reverse();
  return parts.map((p) => p.replace(/[^a-zA-Z0-9]/g, "").toLowerCase()).join(".");
}

function titleFromDomain(domain: string): string {
  const name = domain.split(".")[0] ?? domain;
  return name.charAt(0).toUpperCase() + name.slice(1);
}

// ── Main Component (wrapped with Suspense) ───────────

function NewAppContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const token = useAuthStore((s) => s.accessToken);
  const org = useAuthStore((s) => s.org);

  const [step, setStep] = useState(1);
  const [loading, setLoading] = useState(false);
  const [createdAppId, setCreatedAppId] = useState<string | null>(null);
  const [selectedAddons, setSelectedAddons] = useState<Set<string>>(new Set());
  const [catalog, setCatalog] = useState<{ slug: string; name: string; description: string; price: number; category: string; platforms: string[]; indiaExclusive?: boolean }[]>([]);
  const [addonsLoading, setAddonsLoading] = useState(false);

  // Form state
  const [url, setUrl] = useState(searchParams.get("url") ?? "");
  const [name, setName] = useState("");
  const [bundleId, setBundleId] = useState("");
  const [shortDesc, setShortDesc] = useState("");

  // Validation state
  const [validating, setValidating] = useState(false);
  const [siteInfo, setSiteInfo] = useState<SiteInfo | null>(null);
  const [urlTouched, setUrlTouched] = useState(false);

  const normalizedUrl = normalizeUrl(url);
  const domain = extractDomain(normalizedUrl);
  const isValidUrl = normalizedUrl.length > 0;

  // Auto-validate URL via backend API (debounced)
  const validateUrl = useCallback(async (targetUrl: string) => {
    if (!targetUrl) { setSiteInfo(null); return; }
    setValidating(true);
    try {
      const meta = await siteMeta.fetch(targetUrl);
      setSiteInfo({
        title: meta.title,
        favicon: meta.favicon,
        description: meta.description,
        ogImage: meta.ogImage,
        themeColor: meta.themeColor,
        generator: meta.generator,
        language: meta.language,
        valid: meta.isReachable,
        error: meta.isReachable ? undefined : "Site is not reachable",
      });
    } catch {
      // Fallback to domain-based info
      const d = extractDomain(targetUrl);
      setSiteInfo({
        title: d ? titleFromDomain(d) : null,
        favicon: d ? `https://www.google.com/s2/favicons?domain=${d}&sz=128` : null,
        description: null, ogImage: null, themeColor: null, generator: null, language: null,
        valid: !!d,
      });
    } finally {
      setValidating(false);
    }
  }, []);

  useEffect(() => {
    if (!urlTouched && !url) return;
    const timer = setTimeout(() => {
      if (normalizedUrl) validateUrl(normalizedUrl);
      else setSiteInfo(null);
    }, 500);
    return () => clearTimeout(timer);
  }, [normalizedUrl, urlTouched, validateUrl, url]);

  // Auto-fill name, description, and bundleId when moving to step 2
  const goToStep2 = () => {
    if (!isValidUrl) return;
    if (!name && siteInfo?.title) {
      // Clean up HTML entities and truncate to 30 chars
      const clean = siteInfo.title.replace(/&[^;]+;/g, " ").replace(/\s+/g, " ").trim();
      // Use first meaningful part (before | or - or –)
      const short = clean.split(/\s*[|–—-]\s*/)[0]?.trim() ?? clean;
      setName(short.slice(0, 30));
    }
    if (!shortDesc && siteInfo?.description) {
      const clean = siteInfo.description.replace(/&[^;]+;/g, " ").replace(/\s+/g, " ").trim();
      setShortDesc(clean.slice(0, 80));
    }
    if (!bundleId && domain) setBundleId(generateBundleId(domain));
    setStep(2);
  };

  // Auto-validate from landing page URL
  useEffect(() => {
    if (searchParams.get("url")) {
      setUrlTouched(true);
    }
  }, [searchParams]);

  const handleCreateApp = async () => {
    if (!token || !name || !normalizedUrl) return;
    setLoading(true);
    try {
      const app = await apps.create(
        { name, url: normalizedUrl, ...(bundleId ? { bundleId } : {}), ...(shortDesc ? { shortDescription: shortDesc } : {}) },
        token,
      ) as { id: string };
      setCreatedAppId(app.id);
      toast.success("App created! Choose addons for your app.");

      // Load addon catalog for step 3
      const catalogData = await addons.catalog() as typeof catalog;
      setCatalog(catalogData);
      setStep(3);
    } catch (err: unknown) {
      toast.error(err instanceof Error ? err.message : "Failed to create app");
    } finally {
      setLoading(false);
    }
  };

  const handleAddAddons = async () => {
    if (!token || !createdAppId) return;
    if (selectedAddons.size === 0) {
      router.push(`/dashboard/app/${createdAppId}`);
      return;
    }
    setAddonsLoading(true);
    try {
      await addons.purchaseBulk(createdAppId, Array.from(selectedAddons), token);
      toast.success(`${selectedAddons.size} addon${selectedAddons.size > 1 ? "s" : ""} added!`);
      router.push(`/dashboard/app/${createdAppId}`);
    } catch (err: unknown) {
      toast.error(err instanceof Error ? err.message : "Failed to add addons");
    } finally {
      setAddonsLoading(false);
    }
  };

  const toggleAddon = (slug: string) => {
    setSelectedAddons((prev) => {
      const next = new Set(prev);
      if (next.has(slug)) next.delete(slug);
      else next.add(slug);
      return next;
    });
  };

  const inputCls = "w-full px-4 py-3 rounded-xl text-sm outline-none transition-all qa-input";
  const inputStyle = { background: "var(--bg-elevated)", color: "var(--text-primary)" };

  return (
    <>
      <Header title="Create New App" />
      <div className="p-6 max-w-2xl mx-auto">

        {/* ── Step indicator ──────────────────────── */}
        <div className="flex items-center justify-center gap-0 mb-10">
          {[
            { num: 1, label: "Website URL" },
            { num: 2, label: "App Details" },
            { num: 3, label: "Addons" },
          ].map((s, i) => (
            <div key={s.num} className="flex items-center">
              <button
                onClick={() => s.num < step && s.num !== 3 && setStep(s.num)}
                disabled={s.num > step}
                className="flex items-center gap-2.5 group disabled:cursor-default"
              >
                <div className={`w-9 h-9 rounded-full flex items-center justify-center text-sm font-bold transition-all ${
                  step > s.num ? "bg-green-500 text-white" : step === s.num ? "bg-brand-500 text-white" : ""
                }`} style={step < s.num ? { background: "var(--bg-secondary)", color: "var(--text-tertiary)" } : undefined}>
                  {step > s.num ? <CheckCircle2 size={18} /> : s.num}
                </div>
                <span className={`text-sm font-medium hidden sm:block ${step === s.num ? "text-brand-500" : ""}`}
                  style={step !== s.num ? { color: step > s.num ? "var(--text-secondary)" : "var(--text-tertiary)" } : undefined}>
                  {s.label}
                </span>
              </button>
              {i < 2 && (
                <div className="w-12 sm:w-20 h-[2px] mx-3 rounded-full transition-all" style={{ background: step > s.num ? "#22C55E" : "var(--border-default)" }} />
              )}
            </div>
          ))}
        </div>

        {/* ── Step 1: URL ─────────────────────────── */}
        {step === 1 && (
          <div className="space-y-6">
            {/* Header */}
            <div className="text-center mb-2">
              <div className="w-16 h-16 rounded-2xl bg-brand-500/10 flex items-center justify-center mx-auto mb-4 relative">
                <Globe size={28} className="text-brand-500" />
                <Sparkles size={14} className="text-brand-400 absolute -top-1 -right-1" />
              </div>
              <h2 className="font-display text-2xl font-bold" style={{ color: "var(--text-primary)" }}>
                Paste your website URL
              </h2>
              <p className="text-sm mt-2 max-w-sm mx-auto" style={{ color: "var(--text-tertiary)" }}>
                We&apos;ll convert it into a native Android &amp; iOS app. Works with any website, CMS, or web app.
              </p>
            </div>

            {/* URL Input */}
            <div>
              <label className="flex items-center gap-1.5 text-sm font-medium mb-2" style={{ color: "var(--text-secondary)" }}>
                <Link2 size={14} /> Website URL
              </label>
              <div className="relative">
                <input
                  type="text"
                  value={url}
                  onChange={(e) => { setUrl(e.target.value); setUrlTouched(true); }}
                  onKeyDown={(e) => e.key === "Enter" && isValidUrl && goToStep2()}
                  className={inputCls}
                  style={{
                    ...inputStyle,
                    paddingRight: "48px",
                    borderColor: urlTouched && url && !isValidUrl ? "#EF4444" : siteInfo?.valid ? "#22C55E" : "var(--border-default)",
                  }}
                  placeholder="yourwebsite.com"
                  autoFocus
                />
                <div className="absolute right-3 top-1/2 -translate-y-1/2">
                  {validating ? (
                    <Loader2 size={18} className="animate-spin" style={{ color: "var(--text-tertiary)" }} />
                  ) : siteInfo?.valid ? (
                    <CheckCircle2 size={18} className="text-green-500" />
                  ) : urlTouched && url && !isValidUrl ? (
                    <AlertCircle size={18} className="text-red-500" />
                  ) : null}
                </div>
              </div>
              {urlTouched && url && !isValidUrl && (
                <p className="text-xs mt-1.5 text-red-500">Please enter a valid URL (e.g. yourwebsite.com)</p>
              )}
            </div>

            {/* Site Preview Card */}
            {siteInfo?.valid && domain && (
              <div className="rounded-xl p-4 transition-all"
                style={{ background: "var(--bg-elevated)", border: "1.5px solid var(--border-strong, var(--border-default))" }}>
                <div className="flex items-center gap-4">
                  {siteInfo.favicon ? (
                    <img src={siteInfo.favicon} alt="" className="w-11 h-11 rounded-xl object-contain shrink-0" style={{ background: "white", padding: "4px" }} />
                  ) : (
                    <div className="w-11 h-11 rounded-xl bg-brand-500/10 flex items-center justify-center shrink-0">
                      <Globe size={20} className="text-brand-500" />
                    </div>
                  )}
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-semibold truncate" style={{ color: "var(--text-primary)" }}>
                      {siteInfo.title?.replace(/&[^;]+;/g, " ").split(/\s*[|–—-]\s*/)[0]?.trim() || domain}
                    </p>
                    <p className="text-xs truncate mt-0.5" style={{ color: "var(--text-tertiary)" }}>{domain}</p>
                  </div>
                  <span className="text-[10px] font-bold px-2.5 py-1 rounded-full bg-green-500/10 text-green-500 shrink-0">
                    Reachable
                  </span>
                </div>
                {/* Meta details row */}
                <div className="flex flex-wrap items-center gap-2 mt-3 pt-3 border-t" style={{ borderColor: "var(--border-default)" }}>
                  {siteInfo.generator && (
                    <span className="text-[10px] font-medium px-2 py-0.5 rounded-md" style={{ background: "rgba(59,130,246,0.1)", color: "#3B82F6" }}>
                      {siteInfo.generator.split(/\s+/).slice(0, 2).join(" ")}
                    </span>
                  )}
                  {siteInfo.themeColor && (
                    <span className="flex items-center gap-1 text-[10px] px-2 py-0.5 rounded-md" style={{ background: "var(--bg-secondary)", color: "var(--text-tertiary)" }}>
                      <span className="w-2.5 h-2.5 rounded-full shrink-0" style={{ background: siteInfo.themeColor }} />
                      {siteInfo.themeColor}
                    </span>
                  )}
                  {siteInfo.language && (
                    <span className="text-[10px] px-2 py-0.5 rounded-md" style={{ background: "var(--bg-secondary)", color: "var(--text-tertiary)" }}>
                      {siteInfo.language.toUpperCase()}
                    </span>
                  )}
                  {siteInfo.description && (
                    <p className="w-full text-[11px] mt-1 line-clamp-2" style={{ color: "var(--text-tertiary)" }}>
                      {siteInfo.description.replace(/&[^;]+;/g, " ").slice(0, 120)}
                    </p>
                  )}
                </div>
              </div>
            )}

            {/* What happens next */}
            <div className="rounded-xl p-4 space-y-3" style={{ background: "var(--bg-secondary)", border: "1px solid var(--border-default)" }}>
              <p className="text-xs font-semibold uppercase tracking-wider" style={{ color: "var(--text-tertiary)" }}>What happens next</p>
              <div className="space-y-2.5">
                {[
                  { icon: Type, text: "We auto-detect your app name & icon" },
                  { icon: Smartphone, text: "You configure look & feel (colors, splash, orientation)" },
                  { icon: Package, text: "Add addons — push notifications, payments, analytics" },
                  { icon: Shield, text: "We build & sign your APK/IPA in minutes" },
                ].map((item) => (
                  <div key={item.text} className="flex items-center gap-2.5">
                    <item.icon size={14} className="text-brand-500 shrink-0" />
                    <span className="text-xs" style={{ color: "var(--text-secondary)" }}>{item.text}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Continue button */}
            <button
              onClick={goToStep2}
              disabled={!isValidUrl || validating}
              className="w-full py-3.5 rounded-xl font-semibold text-sm text-white bg-brand-500 hover:bg-brand-600 disabled:opacity-40 disabled:hover:bg-brand-500 transition-all flex items-center justify-center gap-2 hover:-translate-y-0.5 active:translate-y-0"
            >
              {validating ? (
                <><Loader2 size={16} className="animate-spin" /> Checking site...</>
              ) : (
                <>Continue <ArrowRight size={16} /></>
              )}
            </button>

            {/* Hint */}
            <p className="text-center text-[11px] flex items-center justify-center gap-1" style={{ color: "var(--text-tertiary)" }}>
              <Info size={11} /> Works with WordPress, Shopify, Wix, custom sites — any URL
            </p>
          </div>
        )}

        {/* ── Step 2: App Details ─────────────────── */}
        {step === 2 && (
          <div className="space-y-6">
            {/* Header */}
            <div className="text-center mb-2">
              <div className="w-16 h-16 rounded-2xl bg-brand-500/10 flex items-center justify-center mx-auto mb-4 relative">
                <Smartphone size={28} className="text-brand-500" />
              </div>
              <h2 className="font-display text-2xl font-bold" style={{ color: "var(--text-primary)" }}>
                Name your app
              </h2>
              <p className="text-sm mt-2 max-w-sm mx-auto" style={{ color: "var(--text-tertiary)" }}>
                This appears on the home screen and in app stores.
              </p>
            </div>

            {/* URL summary chip */}
            <div className="flex items-center gap-2.5 px-4 py-2.5 rounded-xl" style={{ background: "var(--bg-secondary)", border: "1px solid var(--border-default)" }}>
              {siteInfo?.favicon ? (
                <img src={siteInfo.favicon} alt="" className="w-5 h-5 rounded object-contain" style={{ background: "white", padding: "2px" }} />
              ) : (
                <Globe size={14} className="text-brand-500" />
              )}
              <span className="text-xs truncate flex-1" style={{ color: "var(--text-secondary)" }}>{normalizedUrl}</span>
              <button onClick={() => setStep(1)} className="text-[10px] font-medium text-brand-500 hover:text-brand-600 shrink-0">
                Change
              </button>
            </div>

            {/* App Name */}
            <div>
              <label className="flex items-center gap-1.5 text-sm font-medium mb-2" style={{ color: "var(--text-secondary)" }}>
                <Type size={14} /> App Name <span className="text-red-400">*</span>
              </label>
              <input
                type="text"
                maxLength={30}
                value={name}
                onChange={(e) => setName(e.target.value)}
                className={inputCls}
                style={inputStyle}
                placeholder="My Store"
                autoFocus
              />
              <div className="flex justify-between mt-1.5">
                <p className="text-[11px]" style={{ color: "var(--text-tertiary)" }}>Shown under the app icon on phone</p>
                <p className="text-[11px] font-medium" style={{ color: name.length > 25 ? "#F59E0B" : "var(--text-tertiary)" }}>
                  {name.length}/30
                </p>
              </div>
            </div>

            {/* Short Description */}
            <div>
              <label className="flex items-center gap-1.5 text-sm font-medium mb-2" style={{ color: "var(--text-secondary)" }}>
                <Info size={14} /> Short Description <span style={{ color: "var(--text-tertiary)" }}>(optional)</span>
              </label>
              <input
                type="text"
                maxLength={80}
                value={shortDesc}
                onChange={(e) => setShortDesc(e.target.value)}
                className={inputCls}
                style={inputStyle}
                placeholder="Order groceries, track deliveries & more"
              />
              <p className="text-[11px] mt-1.5" style={{ color: "var(--text-tertiary)" }}>
                Used in app store listings ({shortDesc.length}/80)
              </p>
            </div>

            {/* Bundle ID */}
            <div>
              <label className="flex items-center gap-1.5 text-sm font-medium mb-2" style={{ color: "var(--text-secondary)" }}>
                <Package size={14} /> Bundle ID <span style={{ color: "var(--text-tertiary)" }}>(auto-generated)</span>
              </label>
              <input
                type="text"
                value={bundleId}
                onChange={(e) => setBundleId(e.target.value.toLowerCase().replace(/[^a-z0-9.]/g, ""))}
                className={`${inputCls} font-mono text-xs`}
                style={inputStyle}
                placeholder="com.yourcompany.appname"
              />
              <p className="text-[11px] mt-1.5" style={{ color: "var(--text-tertiary)" }}>
                Unique identifier for app stores. Change only if you know what this is.
              </p>
            </div>

            {/* App Preview Mini */}
            <div className="rounded-xl p-5 flex items-center gap-4" style={{ background: "var(--bg-secondary)", border: "1px solid var(--border-default)" }}>
              <div className="w-14 h-14 rounded-2xl bg-brand-500/10 flex items-center justify-center shrink-0 shadow-sm" style={{ border: "1.5px solid rgba(249,115,22,0.2)" }}>
                {siteInfo?.favicon ? (
                  <img src={siteInfo.favicon} alt="" className="w-8 h-8 rounded-lg object-contain" />
                ) : (
                  <Smartphone size={24} className="text-brand-500" />
                )}
              </div>
              <div className="flex-1 min-w-0">
                <p className="font-display font-semibold text-sm truncate" style={{ color: "var(--text-primary)" }}>
                  {name || "App Name"}
                </p>
                <p className="text-[11px] truncate" style={{ color: "var(--text-tertiary)" }}>
                  {shortDesc || domain || "Your app description"}
                </p>
                <p className="text-[10px] font-mono mt-0.5 truncate" style={{ color: "var(--text-tertiary)" }}>
                  {bundleId || "com.example.app"}
                </p>
              </div>
              <span className="text-[10px] font-semibold uppercase tracking-wider px-2 py-1 rounded-md shrink-0" style={{ background: "rgba(249,115,22,0.1)", color: "#F97316" }}>
                Preview
              </span>
            </div>

            {/* Buttons */}
            <div className="flex gap-3">
              <button
                onClick={() => setStep(1)}
                className="flex items-center justify-center gap-2 flex-1 py-3.5 rounded-xl font-medium text-sm transition-all hover:-translate-y-0.5"
                style={{ background: "var(--bg-secondary)", color: "var(--text-secondary)", border: "1px solid var(--border-default)" }}
              >
                <ArrowLeft size={16} /> Back
              </button>
              <button
                onClick={handleCreateApp}
                disabled={loading || !name.trim()}
                className="flex-[2] py-3.5 rounded-xl font-semibold text-sm text-white bg-brand-500 hover:bg-brand-600 disabled:opacity-40 transition-all flex items-center justify-center gap-2 hover:-translate-y-0.5 active:translate-y-0"
              >
                {loading ? (
                  <><Loader2 size={16} className="animate-spin" /> Creating app...</>
                ) : (
                  <>Create App &amp; Choose Addons <ArrowRight size={16} /></>
                )}
              </button>
            </div>

            {/* Plan note */}
            <p className="text-center text-[11px]" style={{ color: "var(--text-tertiary)" }}>
              You&apos;re on the <span className="font-semibold text-brand-500 uppercase">{org?.plan ?? "free"}</span> plan.
              {org?.plan === "free" ? " Upgrade to unlock addons and faster builds." : " Next: pick addons for push, payments, analytics & more."}
            </p>
          </div>
        )}

        {/* ── Step 3: Choose Addons ──────────────── */}
        {step === 3 && (
          <div className="space-y-5">
            <div className="text-center mb-2">
              <div className="w-16 h-16 rounded-2xl bg-brand-500/10 flex items-center justify-center mx-auto mb-4">
                <Puzzle size={28} className="text-brand-500" />
              </div>
              <h2 className="font-display text-2xl font-bold" style={{ color: "var(--text-primary)" }}>
                Choose addons for {name || "your app"}
              </h2>
              <p className="text-sm mt-2 max-w-md mx-auto" style={{ color: "var(--text-tertiary)" }}>
                Select the addons you need. You can always add or remove them later from the Addon Store.
              </p>
            </div>

            {/* Selected count */}
            {selectedAddons.size > 0 && (
              <div className="flex items-center justify-center gap-2 py-2 px-4 rounded-lg bg-brand-500/10 text-brand-500 text-sm font-medium">
                <Check size={16} />
                {selectedAddons.size} addon{selectedAddons.size > 1 ? "s" : ""} selected
              </div>
            )}

            {/* Popular / Recommended */}
            {(() => {
              const popular = ["onesignal-push", "firebase-analytics", "biometric-auth", "razorpay-checkout", "bottom-navigation", "whatsapp-bridge"];
              const popularAddons = catalog.filter((a) => popular.includes(a.slug));
              const otherAddons = catalog.filter((a) => !popular.includes(a.slug));

              return (
                <>
                  {/* Recommended section */}
                  <div>
                    <p className="text-xs font-semibold uppercase tracking-wider mb-3" style={{ color: "var(--text-tertiary)" }}>
                      Recommended
                    </p>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                      {popularAddons.map((addon) => {
                        const selected = selectedAddons.has(addon.slug);
                        const platformStr = Array.isArray(addon.platforms) ? addon.platforms.join(" + ") : addon.platforms;
                        return (
                          <button
                            key={addon.slug}
                            onClick={() => toggleAddon(addon.slug)}
                            className="flex items-start gap-3 p-3.5 rounded-xl text-left transition-all"
                            style={{
                              background: selected ? "rgba(249,115,22,0.06)" : "var(--bg-elevated)",
                              border: selected ? "1.5px solid rgba(249,115,22,0.4)" : "1.5px solid var(--border-default)",
                            }}
                          >
                            <div className={`w-5 h-5 rounded-md flex items-center justify-center shrink-0 mt-0.5 ${selected ? "bg-brand-500" : ""}`}
                              style={!selected ? { border: "1.5px solid var(--border-strong, var(--border-default))" } : undefined}>
                              {selected && <Check size={12} className="text-white" />}
                            </div>
                            <div className="flex-1 min-w-0">
                              <div className="flex items-center justify-between gap-2">
                                <p className="text-sm font-medium truncate" style={{ color: "var(--text-primary)" }}>{addon.name}</p>
                                <span className="text-xs font-semibold flex items-center shrink-0" style={{ color: "var(--text-secondary)" }}>
                                  <IndianRupee size={11} />{(addon.price / 100).toLocaleString("en-IN")}
                                </span>
                              </div>
                              <p className="text-[11px] mt-0.5 line-clamp-1" style={{ color: "var(--text-tertiary)" }}>{addon.description}</p>
                              <div className="flex items-center gap-2 mt-1.5">
                                <span className="text-[9px] px-1.5 py-0.5 rounded font-medium" style={{ background: "var(--bg-secondary)", color: "var(--text-tertiary)" }}>
                                  {platformStr}
                                </span>
                                {addon.indiaExclusive && (
                                  <span className="text-[9px] px-1.5 py-0.5 rounded bg-brand-500/10 text-brand-500 font-semibold">INDIA</span>
                                )}
                              </div>
                            </div>
                          </button>
                        );
                      })}
                    </div>
                  </div>

                  {/* All addons section */}
                  <details className="group">
                    <summary className="flex items-center justify-between cursor-pointer text-xs font-semibold uppercase tracking-wider py-2" style={{ color: "var(--text-tertiary)" }}>
                      <span>All {otherAddons.length} addons</span>
                      <span className="text-brand-500 group-open:hidden">Show all ↓</span>
                      <span className="text-brand-500 hidden group-open:block">Hide ↑</span>
                    </summary>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 mt-3">
                      {otherAddons.map((addon) => {
                        const selected = selectedAddons.has(addon.slug);
                        return (
                          <button
                            key={addon.slug}
                            onClick={() => toggleAddon(addon.slug)}
                            className="flex items-start gap-3 p-3 rounded-xl text-left transition-all"
                            style={{
                              background: selected ? "rgba(249,115,22,0.06)" : "var(--bg-elevated)",
                              border: selected ? "1.5px solid rgba(249,115,22,0.4)" : "1.5px solid var(--border-default)",
                            }}
                          >
                            <div className={`w-5 h-5 rounded-md flex items-center justify-center shrink-0 mt-0.5 ${selected ? "bg-brand-500" : ""}`}
                              style={!selected ? { border: "1.5px solid var(--border-strong, var(--border-default))" } : undefined}>
                              {selected && <Check size={12} className="text-white" />}
                            </div>
                            <div className="flex-1 min-w-0">
                              <div className="flex items-center justify-between gap-2">
                                <p className="text-xs font-medium truncate" style={{ color: "var(--text-primary)" }}>{addon.name}</p>
                                <span className="text-[11px] font-semibold flex items-center shrink-0" style={{ color: "var(--text-secondary)" }}>
                                  <IndianRupee size={10} />{(addon.price / 100).toLocaleString("en-IN")}
                                </span>
                              </div>
                              <p className="text-[10px] mt-0.5 line-clamp-1" style={{ color: "var(--text-tertiary)" }}>{addon.description}</p>
                            </div>
                          </button>
                        );
                      })}
                    </div>
                  </details>
                </>
              );
            })()}

            {/* Buttons */}
            <div className="flex gap-3 pt-2">
              <button
                onClick={() => router.push(`/dashboard/app/${createdAppId}`)}
                className="flex items-center justify-center gap-2 flex-1 py-3.5 rounded-xl font-medium text-sm transition-all"
                style={{ background: "var(--bg-secondary)", color: "var(--text-secondary)", border: "1px solid var(--border-default)" }}
              >
                <SkipForward size={16} /> Skip for now
              </button>
              <button
                onClick={handleAddAddons}
                disabled={addonsLoading || selectedAddons.size === 0}
                className="flex-[2] py-3.5 rounded-xl font-semibold text-sm text-white bg-brand-500 hover:bg-brand-600 disabled:opacity-40 transition-all flex items-center justify-center gap-2"
              >
                {addonsLoading ? (
                  <><Loader2 size={16} className="animate-spin" /> Adding addons...</>
                ) : selectedAddons.size > 0 ? (
                  <>Add {selectedAddons.size} Addon{selectedAddons.size > 1 ? "s" : ""} &amp; Continue <ArrowRight size={16} /></>
                ) : (
                  <>Select addons above</>
                )}
              </button>
            </div>
          </div>
        )}
      </div>
    </>
  );
}

export default function NewAppPage() {
  return (
    <Suspense fallback={
      <div className="flex items-center justify-center h-screen">
        <Loader2 size={24} className="animate-spin text-brand-500" />
      </div>
    }>
      <NewAppContent />
    </Suspense>
  );
}
