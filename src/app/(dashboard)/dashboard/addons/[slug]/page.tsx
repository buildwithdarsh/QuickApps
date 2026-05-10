"use client";

import { useState, use } from "react";
import { Header } from "@/components/layout/Header";

import { Save, ArrowLeft, Eye, CheckCircle } from "lucide-react";
import Link from "next/link";
import toast from "react-hot-toast";

// Config schemas for each addon — mirrors backend addon-catalog.ts
const addonConfigs: Record<string, { name: string; fields: { key: string; type: string; label: string; required: boolean; placeholder?: string; options?: string[]; hint?: string }[] }> = {
  "onesignal-push": {
    name: "OneSignal Push Notifications",
    fields: [
      { key: "appId", type: "text", label: "OneSignal App ID", required: true, placeholder: "xxxxxxxx-xxxx-xxxx-xxxx-xxxxxxxxxxxx" },
      { key: "restApiKey", type: "password", label: "REST API Key", required: true, placeholder: "Your OneSignal REST API Key" },
      { key: "appGroupId", type: "text", label: "App Group ID (iOS)", required: false, placeholder: "group.com.yourapp", hint: "Required for iOS notification grouping" },
    ],
  },
  "firebase-notifications": {
    name: "Firebase Cloud Messaging",
    fields: [
      { key: "googleServicesJson", type: "file", label: "google-services.json (Android)", required: true, hint: "Download from Firebase Console → Project Settings" },
      { key: "googleServiceInfoPlist", type: "file", label: "GoogleService-Info.plist (iOS)", required: true, hint: "Download from Firebase Console → iOS app" },
    ],
  },
  "firebase-analytics": {
    name: "Firebase Analytics",
    fields: [
      { key: "googleServicesJson", type: "file", label: "google-services.json", required: true },
      { key: "googleServiceInfoPlist", type: "file", label: "GoogleService-Info.plist (iOS)", required: false },
    ],
  },
  "biometric-auth": {
    name: "Biometric Auth",
    fields: [
      { key: "triggerMode", type: "select", label: "Trigger", required: true, options: ["on_open", "after_background", "both"] },
      { key: "backgroundTimeoutMin", type: "number", label: "Background timeout (minutes)", required: false, placeholder: "5" },
      { key: "fallback", type: "select", label: "Fallback method", required: true, options: ["passcode", "none"] },
      { key: "promptMessage", type: "text", label: "Prompt message", required: false, placeholder: "Authenticate to continue" },
    ],
  },
  "social-login": {
    name: "Social Login",
    fields: [
      { key: "googleClientId", type: "text", label: "Google Sign-In Client ID", required: false, placeholder: "xxxx.apps.googleusercontent.com" },
      { key: "googleEnabled", type: "toggle", label: "Enable Google", required: false },
      { key: "facebookAppId", type: "text", label: "Facebook App ID", required: false, placeholder: "1234567890" },
      { key: "facebookEnabled", type: "toggle", label: "Enable Facebook", required: false },
      { key: "appleServiceId", type: "text", label: "Apple Service ID (iOS)", required: false },
      { key: "appleEnabled", type: "toggle", label: "Enable Apple Sign-In", required: false },
      { key: "callbackFunctionName", type: "text", label: "JS Bridge callback", required: false, placeholder: "onSocialLogin" },
    ],
  },
  "google-admob": {
    name: "Google AdMob",
    fields: [
      { key: "admobAppIdAndroid", type: "text", label: "AdMob App ID (Android)", required: true, placeholder: "ca-app-pub-xxxx~xxxx" },
      { key: "admobAppIdIos", type: "text", label: "AdMob App ID (iOS)", required: false, placeholder: "ca-app-pub-xxxx~xxxx" },
      { key: "bannerAdUnitId", type: "text", label: "Banner Ad Unit ID", required: false },
      { key: "bannerPosition", type: "select", label: "Banner Position", required: false, options: ["top", "bottom"] },
      { key: "interstitialAdUnitId", type: "text", label: "Interstitial Ad Unit ID", required: false },
      { key: "interstitialFrequency", type: "number", label: "Show every N page loads", required: false, placeholder: "5" },
      { key: "rewardedAdUnitId", type: "text", label: "Rewarded Ad Unit ID", required: false },
      { key: "testMode", type: "toggle", label: "Test Mode", required: false },
    ],
  },
  "razorpay-checkout": {
    name: "Razorpay In-App Checkout",
    fields: [
      { key: "razorpayKeyId", type: "text", label: "Razorpay Key ID", required: true, placeholder: "rzp_live_xxxx" },
      { key: "razorpayKeySecret", type: "password", label: "Razorpay Key Secret", required: true, hint: "Encrypted — never shown after save" },
      { key: "businessName", type: "text", label: "Business Name", required: true, placeholder: "Ravi Stores" },
      { key: "defaultCurrency", type: "text", label: "Currency", required: false, placeholder: "INR" },
      { key: "callbackFunctionName", type: "text", label: "JS Bridge callback", required: false, placeholder: "onRazorpaySuccess" },
    ],
  },
  "bottom-navigation": {
    name: "Bottom Navigation Tab",
    fields: [
      { key: "tab1_label", type: "text", label: "Tab 1 — Label", required: true, placeholder: "Home" },
      { key: "tab1_url", type: "text", label: "Tab 1 — URL", required: true, placeholder: "/home" },
      { key: "tab2_label", type: "text", label: "Tab 2 — Label", required: false, placeholder: "Orders" },
      { key: "tab2_url", type: "text", label: "Tab 2 — URL", required: false, placeholder: "/orders" },
      { key: "tab3_label", type: "text", label: "Tab 3 — Label", required: false, placeholder: "Cart" },
      { key: "tab3_url", type: "text", label: "Tab 3 — URL", required: false, placeholder: "/cart" },
      { key: "tab4_label", type: "text", label: "Tab 4 — Label", required: false, placeholder: "Profile" },
      { key: "tab4_url", type: "text", label: "Tab 4 — URL", required: false, placeholder: "/profile" },
      { key: "activeColor", type: "text", label: "Active tab color", required: false, placeholder: "#F97316" },
      { key: "inactiveColor", type: "text", label: "Inactive tab color", required: false, placeholder: "#8A8780" },
      { key: "backgroundColor", type: "text", label: "Background color", required: false, placeholder: "#FFFFFF" },
    ],
  },
  "whatsapp-bridge": {
    name: "WhatsApp Business Bridge",
    fields: [
      { key: "phoneNumber", type: "text", label: "WhatsApp phone number", required: true, placeholder: "+919876543210", hint: "Include country code" },
      { key: "defaultMessage", type: "text", label: "Default opening message", required: false, placeholder: "Hi! I need help with..." },
      { key: "buttonPosition", type: "select", label: "Button position", required: false, options: ["bottom-right", "bottom-left"] },
      { key: "buttonColor", type: "text", label: "Button color", required: false, placeholder: "#25D366" },
    ],
  },
  "intercom": {
    name: "Intercom Customer Support",
    fields: [
      { key: "appId", type: "text", label: "Intercom App ID", required: true },
      { key: "androidApiKey", type: "text", label: "Android API Key", required: true },
      { key: "iosApiKey", type: "text", label: "iOS API Key", required: false },
    ],
  },
  "publish-google-play": {
    name: "Google Play Store Publishing",
    fields: [
      { key: "developerAccountEmail", type: "text", label: "Google Play Developer Account Email", required: true },
      { key: "appCategory", type: "text", label: "App Category", required: true, placeholder: "Shopping" },
      { key: "contentRating", type: "select", label: "Content Rating", required: true, options: ["everyone", "teen", "mature"] },
      { key: "contactEmail", type: "text", label: "Contact Email (public)", required: true },
      { key: "privacyPolicyUrl", type: "text", label: "Privacy Policy URL", required: true, placeholder: "https://yoursite.com/privacy" },
    ],
  },
  "publish-app-store": {
    name: "Apple App Store Publishing",
    fields: [
      { key: "appleDeveloperEmail", type: "text", label: "Apple Developer Account Email", required: true },
      { key: "appCategory", type: "text", label: "App Category", required: true },
      { key: "ageRating", type: "select", label: "Age Rating", required: true, options: ["4+", "9+", "12+", "17+"] },
      { key: "privacyPolicyUrl", type: "text", label: "Privacy Policy URL", required: true },
      { key: "supportUrl", type: "text", label: "Support URL", required: true },
    ],
  },
};

export default function AddonConfigPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = use(params);
  const [config, setConfig] = useState<Record<string, unknown>>({});
  const [saved, setSaved] = useState(false);
  const addonDef = addonConfigs[slug];

  const handleSave = () => {
    setSaved(true);
    toast.success("Addon configuration saved and encrypted");
  };

  const inputStyle = { background: "var(--bg-secondary)", border: "1px solid var(--border-default)", color: "var(--text-primary)" };

  if (!addonDef) {
    return (
      <>
        <Header title="Addon Configuration" />
        <div className="p-6">
          <div className="text-center py-16 rounded-xl" style={{ background: "var(--bg-elevated)", border: "1px solid var(--border-default)" }}>
            <CheckCircle size={48} className="mx-auto mb-4 text-green-500" />
            <h3 className="font-display text-lg font-semibold mb-2" style={{ color: "var(--text-primary)" }}>No configuration needed</h3>
            <p className="text-sm mb-4" style={{ color: "var(--text-tertiary)" }}>This addon works out of the box. Just trigger a new build to include it.</p>
            <Link href="/dashboard/addons" className="text-sm text-brand-500 hover:text-brand-600 font-medium">Back to Addon Store</Link>
          </div>
        </div>
      </>
    );
  }

  return (
    <>
      <Header title={addonDef.name} />
      <div className="p-6 max-w-2xl">
        <Link href="/dashboard/addons" className="flex items-center gap-2 text-sm mb-6 hover:text-brand-500 transition-colors" style={{ color: "var(--text-tertiary)" }}>
          <ArrowLeft size={16} /> Back to Addon Store
        </Link>

        <div className="rounded-xl p-6 space-y-5" style={{ background: "var(--bg-elevated)", border: "1px solid var(--border-default)" }}>
          <h2 className="font-display text-lg font-semibold" style={{ color: "var(--text-primary)" }}>
            Configure {addonDef.name}
          </h2>

          {addonDef.fields.map((field) => (
            <div key={field.key}>
              <label className="block text-sm font-medium mb-1.5" style={{ color: "var(--text-secondary)" }}>
                {field.label}
                {field.required && <span className="text-red-500 ml-1">*</span>}
              </label>

              {field.type === "select" ? (
                <select value={(config[field.key] as string) || ""} onChange={(e) => setConfig({ ...config, [field.key]: e.target.value })}
                  className="w-full px-3 py-2.5 rounded-lg text-sm outline-none" style={inputStyle}>
                  <option value="">Select...</option>
                  {field.options?.map((opt) => <option key={opt} value={opt}>{opt}</option>)}
                </select>
              ) : field.type === "toggle" ? (
                <label className="flex items-center gap-3 cursor-pointer">
                  <button type="button" onClick={() => setConfig({ ...config, [field.key]: !config[field.key] })}
                    className={`w-10 h-6 rounded-full transition-colors relative ${config[field.key] ? "bg-brand-500" : ""}`}
                    style={!config[field.key] ? { background: "var(--bg-secondary)", border: "1px solid var(--border-default)" } : undefined}>
                    <div className={`absolute top-0.5 w-5 h-5 rounded-full bg-white shadow transition-transform ${config[field.key] ? "translate-x-4" : "translate-x-0.5"}`} />
                  </button>
                  <span className="text-sm" style={{ color: "var(--text-secondary)" }}>{config[field.key] ? "Enabled" : "Disabled"}</span>
                </label>
              ) : field.type === "file" ? (
                <div className="flex items-center gap-3">
                  <input type="file" className="text-sm" onChange={(e) => setConfig({ ...config, [field.key]: e.target.files?.[0]?.name })} />
                  {config[field.key] ? <CheckCircle size={16} className="text-green-500" /> : null}
                </div>
              ) : (
                <input
                  type={field.type === "password" ? "password" : field.type === "number" ? "number" : "text"}
                  value={(config[field.key] as string) || ""}
                  onChange={(e) => setConfig({ ...config, [field.key]: e.target.value })}
                  placeholder={field.placeholder}
                  className="w-full px-3 py-2.5 rounded-lg text-sm outline-none" style={inputStyle}
                />
              )}

              {field.hint && <p className="text-xs mt-1" style={{ color: "var(--text-tertiary)" }}>{field.hint}</p>}
            </div>
          ))}

          <div className="flex gap-3 pt-4">
            <button onClick={handleSave} className="flex items-center gap-2 px-6 py-2.5 rounded-lg font-medium text-sm text-white bg-brand-500 hover:bg-brand-600 transition-colors">
              <Save size={16} /> {saved ? "Saved ✓" : "Save & Encrypt"}
            </button>
            <button className="flex items-center gap-2 px-4 py-2.5 rounded-lg font-medium text-sm transition-colors"
              style={{ background: "var(--bg-secondary)", color: "var(--text-secondary)" }}>
              <Eye size={16} /> Validate
            </button>
          </div>
        </div>
      </div>
    </>
  );
}
