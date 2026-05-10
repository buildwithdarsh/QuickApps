"use client";

import { useState, useEffect, use } from "react";
import { Header } from "@/components/layout/Header";
import { useAuthStore } from "@/lib/store";
import { apps, addons } from "@/lib/api";
import { AddonConfigForm } from "@/components/ui/AddonConfigForm";
import {
  Save, Palette, Monitor, Link2, Shield, WifiOff, Wrench, Smartphone,
  Loader2, Hammer, Bell, BarChart3, DollarSign, LayoutGrid, Cpu,
  Zap, Plug, Monitor as PlatformIcon, Upload, Globe, Puzzle,
} from "lucide-react";
import toast from "react-hot-toast";
import Link from "next/link";

// ── Category config ─────────────────────────────────

const CATEGORY_META: Record<string, { label: string; icon: React.ElementType }> = {
  notifications:     { label: "Notifications", icon: Bell },
  analytics:         { label: "Analytics", icon: BarChart3 },
  security:          { label: "Auth & Security", icon: Shield },
  monetization:      { label: "Monetization", icon: DollarSign },
  navigation:        { label: "Navigation & UI", icon: LayoutGrid },
  device:            { label: "Device & Hardware", icon: Cpu },
  performance:       { label: "Performance", icon: Zap },
  integrations:      { label: "Integrations", icon: Plug },
  platform:          { label: "Platform", icon: PlatformIcon },
  publishing:        { label: "Publishing", icon: Upload },
  "india-exclusive": { label: "India", icon: Globe },
};

const CORE_SECTIONS = [
  { key: "identity", label: "Identity", icon: Smartphone },
  { key: "branding", label: "Branding", icon: Palette },
  { key: "display", label: "Display", icon: Monitor },
  { key: "links", label: "Links & Routing", icon: Link2 },
  { key: "security-core", label: "Security", icon: Shield },
  { key: "noInternet", label: "No Internet", icon: WifiOff },
  { key: "advanced", label: "Advanced", icon: Wrench },
];

// ── Types ───────────────────────────────────────────

interface FieldSchema {
  type: string;
  required: boolean;
  label: string;
  options?: string[];
}

interface CatalogAddon {
  slug: string;
  name: string;
  description: string;
  price: number;
  category: string;
  platforms: string[];
  configSchema: Record<string, FieldSchema>;
}

interface PurchasedAddon {
  addonSlug: string;
  isActive: boolean;
  configJson: Record<string, unknown> | null;
}

// ── Helpers ─────────────────────────────────────────

function SectionTab({ label, icon: Icon, active, onClick, badge }: { label: string; icon: React.ElementType; active: boolean; onClick: () => void; badge?: number | undefined }) {
  return (
    <button onClick={onClick} className={`flex items-center gap-2 px-4 py-2.5 rounded-lg text-sm font-medium transition-colors whitespace-nowrap ${active ? "bg-brand-500 text-white" : ""}`}
      style={!active ? { color: "var(--text-secondary)", background: "var(--bg-secondary)" } : undefined}>
      <Icon size={16} />
      {label}
      {badge !== undefined && badge > 0 && (
        <span className={`text-[10px] font-bold px-1.5 py-0.5 rounded-full ${active ? "bg-white/20" : "bg-brand-500/10 text-brand-500"}`}>
          {badge}
        </span>
      )}
    </button>
  );
}

function FormField({ label, hint, children }: { label: string; hint?: string; children: React.ReactNode }) {
  return (
    <div>
      <label className="block text-sm font-medium mb-1.5" style={{ color: "var(--text-secondary)" }}>{label}</label>
      {children}
      {hint && <p className="text-xs mt-1" style={{ color: "var(--text-tertiary)" }}>{hint}</p>}
    </div>
  );
}

function TextInput({ value, onChange, placeholder }: { value: string; onChange: (v: string) => void; placeholder?: string }) {
  return (
    <input type="text" value={value} onChange={(e) => onChange(e.target.value)} placeholder={placeholder}
      className="w-full px-3 py-2.5 rounded-lg text-sm outline-none qa-input"
      style={{ background: "var(--bg-elevated)", color: "var(--text-primary)" }} />
  );
}

function Toggle({ checked, onChange, label }: { checked: boolean; onChange: (v: boolean) => void; label: string }) {
  return (
    <label className="flex items-center justify-between cursor-pointer">
      <span className="text-sm" style={{ color: "var(--text-secondary)" }}>{label}</span>
      <button type="button" onClick={() => onChange(!checked)}
        className={`w-10 h-6 rounded-full transition-colors relative ${checked ? "bg-brand-500" : ""}`}
        style={!checked ? { background: "var(--bg-secondary)", border: "1px solid var(--border-default)" } : undefined}>
        <div className={`absolute top-0.5 w-5 h-5 rounded-full bg-white shadow transition-transform ${checked ? "translate-x-4" : "translate-x-0.5"}`} />
      </button>
    </label>
  );
}

// ── Main Component ──────────────────────────────────

export default function AppConfigPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  const token = useAuthStore((s) => s.accessToken);
  const [activeSection, setActiveSection] = useState("identity");
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  // Core config
  const [config, setConfig] = useState({
    identity: { appName: "", bundleId: "", url: "", shortDescription: "", longDescription: "" },
    branding: { themeColor: "#F97316", splashBgColor: "#FFFFFF", splashDuration: 2, splashAnimation: "fade" },
    display: { orientation: "portrait", statusBarStyle: "dark", statusBarColor: "#FFFFFF", pullToRefresh: true, pinchToZoom: false, navigationProgressBar: true },
    links: { customUrlScheme: "" },
    security: { sslEnforcement: true, disableScreenshots: false, clipboardControl: true, customUserAgent: "", disableCaching: false },
    noInternet: { headingText: "No Internet Connection", bodyText: "Please check your connection and try again.", retryButtonLabel: "Try Again", retryButtonColor: "#F97316" },
    advanced: { jsBridgeEnabled: true, appVersionName: "1.0.0", appVersionCode: 1 },
  });

  // Addon data
  const [catalog, setCatalog] = useState<CatalogAddon[]>([]);
  const [purchasedAddons, setPurchasedAddons] = useState<PurchasedAddon[]>([]);
  const [addonConfigs, setAddonConfigs] = useState<Record<string, Record<string, unknown> | null>>({});

  // Load everything
  useEffect(() => {
    if (!token) return;
    Promise.all([
      apps.get(id, token),
      addons.catalog(true),
      addons.forApp(id, token),
    ]).then(([appData, catalogData, purchasedData]) => {
      const a = appData as { configJson?: Record<string, unknown> };
      if (a.configJson) {
        setConfig((prev) => ({ ...prev, ...(a.configJson as typeof prev) }));
      }
      setCatalog(catalogData as CatalogAddon[]);
      const purchased = purchasedData as PurchasedAddon[];
      setPurchasedAddons(purchased);
      const configs: Record<string, Record<string, unknown> | null> = {};
      for (const p of purchased) {
        configs[p.addonSlug] = p.configJson;
      }
      setAddonConfigs(configs);
      setLoading(false);
    }).catch(() => setLoading(false));
  }, [id, token]);

  // Group purchased addons by category
  const purchasedSlugs = new Set(purchasedAddons.map((p) => p.addonSlug));
  const addonsByCategory: Record<string, CatalogAddon[]> = {};
  for (const addon of catalog) {
    if (purchasedSlugs.has(addon.slug)) {
      const cat = addon.category;
      if (!addonsByCategory[cat]) addonsByCategory[cat] = [];
      addonsByCategory[cat]!.push(addon);
    }
  }
  const addonCategoryKeys = Object.keys(addonsByCategory);

  const updateSection = (section: string, field: string, value: unknown) => {
    setConfig((prev) => ({
      ...prev,
      [section]: { ...(prev as Record<string, Record<string, unknown>>)[section], [field]: value },
    }));
  };

  const handleSave = async () => {
    if (!token) return;
    setSaving(true);
    try {
      await apps.updateConfig(id, config, token);
      toast.success("Configuration saved");
    } catch (err: unknown) {
      toast.error(err instanceof Error ? err.message : "Failed to save");
    } finally {
      setSaving(false);
    }
  };

  const handleAddonConfigSave = async (slug: string, addonConfig: Record<string, unknown>) => {
    if (!token) return;
    await addons.saveConfig(id, slug, addonConfig, token);
    setAddonConfigs((prev) => ({ ...prev, [slug]: addonConfig }));
    toast.success("Addon config saved");
  };

  if (loading) {
    return (
      <>
        <Header title="App Configuration" />
        <div className="flex items-center justify-center py-20"><Loader2 size={24} className="animate-spin text-brand-500" /></div>
      </>
    );
  }

  const isCoreSection = CORE_SECTIONS.some((s) => s.key === activeSection);
  const isAddonCategory = addonCategoryKeys.includes(activeSection);

  return (
    <>
      <Header title="App Configuration" />
      <div className="p-6">
        {/* Section tabs */}
        <div className="flex flex-wrap gap-2 pb-4 mb-6">
          {/* Core tabs */}
          {CORE_SECTIONS.map((s) => (
            <SectionTab key={s.key} label={s.label} icon={s.icon} active={activeSection === s.key} onClick={() => setActiveSection(s.key)} />
          ))}

          {/* Divider if there are addon tabs */}
          {addonCategoryKeys.length > 0 && (
            <div className="w-px shrink-0 mx-1" style={{ background: "var(--border-default)" }} />
          )}

          {/* Addon category tabs */}
          {addonCategoryKeys.map((cat) => {
            const meta = CATEGORY_META[cat];
            if (!meta) return null;
            return (
              <SectionTab
                key={cat}
                label={meta.label}
                icon={meta.icon}
                active={activeSection === cat}
                onClick={() => setActiveSection(cat)}
                badge={addonsByCategory[cat]?.length}
              />
            );
          })}
        </div>

        {/* Config form */}
        <div className="rounded-xl p-6 space-y-5" style={{ background: "var(--bg-elevated)", border: "1px solid var(--border-default)" }}>

          {/* ── Core sections ────────────────────── */}

          {activeSection === "identity" && (
            <>
              <FormField label="App Name" hint="Shown on home screen and app stores (max 30 chars)">
                <TextInput value={config.identity.appName} onChange={(v) => updateSection("identity", "appName", v)} placeholder="My Store" />
              </FormField>
              <FormField label="Bundle ID" hint="Reverse domain format (e.g., com.yourcompany.app)">
                <TextInput value={config.identity.bundleId} onChange={(v) => updateSection("identity", "bundleId", v)} placeholder="com.quickapps.mystore" />
              </FormField>
              <FormField label="Website URL">
                <TextInput value={config.identity.url} onChange={(v) => updateSection("identity", "url", v)} placeholder="https://mystore.com" />
              </FormField>
              <FormField label="Short Description" hint="Max 80 characters — for store listing">
                <TextInput value={config.identity.shortDescription} onChange={(v) => updateSection("identity", "shortDescription", v)} placeholder="Order groceries from My Store" />
              </FormField>
            </>
          )}

          {activeSection === "branding" && (
            <>
              <FormField label="Theme Color">
                <div className="flex items-center gap-3">
                  <input type="color" value={config.branding.themeColor} onChange={(e) => updateSection("branding", "themeColor", e.target.value)} className="w-10 h-10 rounded cursor-pointer" />
                  <TextInput value={config.branding.themeColor} onChange={(v) => updateSection("branding", "themeColor", v)} placeholder="#F97316" />
                </div>
              </FormField>
              <FormField label="Splash Duration" hint="Seconds (1-5)">
                <input type="range" min={1} max={5} value={config.branding.splashDuration} onChange={(e) => updateSection("branding", "splashDuration", +e.target.value)} className="w-full" />
                <p className="text-sm font-medium mt-1" style={{ color: "var(--text-primary)" }}>{config.branding.splashDuration}s</p>
              </FormField>
              <FormField label="Splash Animation">
                <select value={config.branding.splashAnimation} onChange={(e) => updateSection("branding", "splashAnimation", e.target.value)}
                  className="w-full px-3 py-2.5 rounded-lg text-sm outline-none qa-input" style={{ background: "var(--bg-elevated)", color: "var(--text-primary)" }}>
                  <option value="fade">Fade</option>
                  <option value="slide-up">Slide Up</option>
                  <option value="zoom">Zoom</option>
                  <option value="none">None</option>
                </select>
              </FormField>
            </>
          )}

          {activeSection === "display" && (
            <>
              <FormField label="Screen Orientation">
                <select value={config.display.orientation} onChange={(e) => updateSection("display", "orientation", e.target.value)}
                  className="w-full px-3 py-2.5 rounded-lg text-sm outline-none qa-input" style={{ background: "var(--bg-elevated)", color: "var(--text-primary)" }}>
                  <option value="portrait">Portrait</option>
                  <option value="landscape">Landscape</option>
                  <option value="auto">Auto-rotate</option>
                </select>
              </FormField>
              <Toggle checked={config.display.pullToRefresh} onChange={(v) => updateSection("display", "pullToRefresh", v)} label="Pull to Refresh" />
              <Toggle checked={config.display.pinchToZoom} onChange={(v) => updateSection("display", "pinchToZoom", v)} label="Pinch to Zoom" />
              <Toggle checked={config.display.navigationProgressBar} onChange={(v) => updateSection("display", "navigationProgressBar", v)} label="Navigation Progress Bar" />
            </>
          )}

          {activeSection === "security-core" && (
            <>
              <Toggle checked={config.security.sslEnforcement} onChange={(v) => updateSection("security", "sslEnforcement", v)} label="SSL Enforcement" />
              <Toggle checked={config.security.disableScreenshots} onChange={(v) => updateSection("security", "disableScreenshots", v)} label="Disable Screenshots" />
              <Toggle checked={config.security.clipboardControl} onChange={(v) => updateSection("security", "clipboardControl", v)} label="Clipboard Control" />
              <Toggle checked={config.security.disableCaching} onChange={(v) => updateSection("security", "disableCaching", v)} label="Disable Caching" />
              <FormField label="Custom User Agent" hint="Appended to default UA string">
                <TextInput value={config.security.customUserAgent} onChange={(v) => updateSection("security", "customUserAgent", v)} placeholder="QuickApps/1.0" />
              </FormField>
            </>
          )}

          {activeSection === "noInternet" && (
            <>
              <FormField label="Heading Text">
                <TextInput value={config.noInternet.headingText} onChange={(v) => updateSection("noInternet", "headingText", v)} />
              </FormField>
              <FormField label="Body Text">
                <TextInput value={config.noInternet.bodyText} onChange={(v) => updateSection("noInternet", "bodyText", v)} />
              </FormField>
              <FormField label="Retry Button Label">
                <TextInput value={config.noInternet.retryButtonLabel} onChange={(v) => updateSection("noInternet", "retryButtonLabel", v)} />
              </FormField>
              <FormField label="Retry Button Color">
                <div className="flex items-center gap-3">
                  <input type="color" value={config.noInternet.retryButtonColor} onChange={(e) => updateSection("noInternet", "retryButtonColor", e.target.value)} className="w-10 h-10 rounded cursor-pointer" />
                  <TextInput value={config.noInternet.retryButtonColor} onChange={(v) => updateSection("noInternet", "retryButtonColor", v)} />
                </div>
              </FormField>
            </>
          )}

          {activeSection === "advanced" && (
            <>
              <Toggle checked={config.advanced.jsBridgeEnabled} onChange={(v) => updateSection("advanced", "jsBridgeEnabled", v)} label="QuickApps JS Bridge" />
              <FormField label="App Version Name">
                <TextInput value={config.advanced.appVersionName} onChange={(v) => updateSection("advanced", "appVersionName", v)} placeholder="1.0.0" />
              </FormField>
              <FormField label="App Version Code" hint="Integer — increment for each new build">
                <input type="number" min={1} value={config.advanced.appVersionCode} onChange={(e) => updateSection("advanced", "appVersionCode", +e.target.value)}
                  className="w-full px-3 py-2.5 rounded-lg text-sm outline-none qa-input" style={{ background: "var(--bg-elevated)", color: "var(--text-primary)" }} />
              </FormField>
            </>
          )}

          {activeSection === "links" && (
            <FormField label="Custom URL Scheme" hint='e.g., "myapp" → scheme: myapp://'>
              <TextInput value={config.links.customUrlScheme} onChange={(v) => updateSection("links", "customUrlScheme", v)} placeholder="myapp" />
            </FormField>
          )}

          {/* ── Addon category sections ──────────── */}

          {isAddonCategory && addonsByCategory[activeSection] && (
            <div className="space-y-8">
              {addonsByCategory[activeSection]!.map((addon) => {
                const hasConfig = Object.keys(addon.configSchema).length > 0;
                return (
                  <div key={addon.slug}>
                    {/* Addon header */}
                    <div className="flex items-start justify-between mb-4">
                      <div>
                        <div className="flex items-center gap-2">
                          <h3 className="font-display font-semibold text-sm" style={{ color: "var(--text-primary)" }}>{addon.name}</h3>
                          <span className="text-[9px] font-bold px-1.5 py-0.5 rounded-full bg-green-500/10 text-green-600">ACTIVE</span>
                        </div>
                        <p className="text-xs mt-0.5" style={{ color: "var(--text-tertiary)" }}>{addon.description}</p>
                      </div>
                      <span className="text-[10px] px-2 py-0.5 rounded-md shrink-0" style={{ background: "var(--bg-secondary)", color: "var(--text-tertiary)" }}>
                        {Array.isArray(addon.platforms) ? addon.platforms.join(" + ") : addon.platforms}
                      </span>
                    </div>

                    {/* Config form */}
                    {hasConfig ? (
                      <AddonConfigForm
                        addonSlug={addon.slug}
                        addonName={addon.name}
                        configSchema={addon.configSchema}
                        savedConfig={addonConfigs[addon.slug] ?? null}
                        onSave={(cfg) => handleAddonConfigSave(addon.slug, cfg)}
                      />
                    ) : (
                      <div className="py-3 px-4 rounded-lg text-xs flex items-center gap-2" style={{ background: "var(--bg-secondary)", color: "var(--text-tertiary)" }}>
                        <Puzzle size={14} />
                        No configuration needed — this addon works automatically once added.
                      </div>
                    )}

                    {/* Divider between addons in same category */}
                    {addonsByCategory[activeSection]!.indexOf(addon) < addonsByCategory[activeSection]!.length - 1 && (
                      <div className="mt-6 border-t" style={{ borderColor: "var(--border-default)" }} />
                    )}
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* Save (core sections only) */}
        {isCoreSection && (
          <div className="mt-6 flex justify-end gap-3">
            <Link href="/dashboard/builds" className="flex items-center gap-2 px-5 py-2.5 rounded-lg font-medium text-sm transition-colors" style={{ background: "var(--bg-secondary)", color: "var(--text-secondary)" }}>
              <Hammer size={16} /> Trigger Build
            </Link>
            <button onClick={handleSave} disabled={saving} className="flex items-center gap-2 px-6 py-2.5 rounded-lg font-medium text-sm text-white bg-brand-500 hover:bg-brand-600 disabled:opacity-50 transition-colors">
              {saving ? <Loader2 size={16} className="animate-spin" /> : <Save size={16} />}
              {saving ? "Saving..." : "Save Configuration"}
            </button>
          </div>
        )}
      </div>
    </>
  );
}
