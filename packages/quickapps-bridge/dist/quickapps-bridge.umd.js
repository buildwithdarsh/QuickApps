"use strict";
var __defProp = Object.defineProperty;
var __defProps = Object.defineProperties;
var __getOwnPropDesc = Object.getOwnPropertyDescriptor;
var __getOwnPropDescs = Object.getOwnPropertyDescriptors;
var __getOwnPropNames = Object.getOwnPropertyNames;
var __getOwnPropSymbols = Object.getOwnPropertySymbols;
var __hasOwnProp = Object.prototype.hasOwnProperty;
var __propIsEnum = Object.prototype.propertyIsEnumerable;
var __defNormalProp = (obj, key, value) => key in obj ? __defProp(obj, key, { enumerable: true, configurable: true, writable: true, value }) : obj[key] = value;
var __spreadValues = (a, b) => {
  for (var prop in b || (b = {}))
    if (__hasOwnProp.call(b, prop))
      __defNormalProp(a, prop, b[prop]);
  if (__getOwnPropSymbols)
    for (var prop of __getOwnPropSymbols(b)) {
      if (__propIsEnum.call(b, prop))
        __defNormalProp(a, prop, b[prop]);
    }
  return a;
};
var __spreadProps = (a, b) => __defProps(a, __getOwnPropDescs(b));
var __export = (target, all) => {
  for (var name in all)
    __defProp(target, name, { get: all[name], enumerable: true });
};
var __copyProps = (to, from, except, desc) => {
  if (from && typeof from === "object" || typeof from === "function") {
    for (let key of __getOwnPropNames(from))
      if (!__hasOwnProp.call(to, key) && key !== except)
        __defProp(to, key, { get: () => from[key], enumerable: !(desc = __getOwnPropDesc(from, key)) || desc.enumerable });
  }
  return to;
};
var __toCommonJS = (mod) => __copyProps(__defProp({}, "__esModule", { value: true }), mod);

// src/index.ts
var index_exports = {};
__export(index_exports, {
  QuickApps: () => bridge
});
module.exports = __toCommonJS(index_exports);

// src/events.ts
var EventBus = class {
  constructor() {
    this.listeners = /* @__PURE__ */ new Map();
  }
  on(event, handler) {
    if (!this.listeners.has(event)) {
      this.listeners.set(event, /* @__PURE__ */ new Set());
    }
    this.listeners.get(event).add(handler);
    return () => this.off(event, handler);
  }
  off(event, handler) {
    var _a2;
    (_a2 = this.listeners.get(event)) == null ? void 0 : _a2.delete(handler);
  }
  emit(event, data) {
    var _a2;
    (_a2 = this.listeners.get(event)) == null ? void 0 : _a2.forEach((handler) => {
      try {
        handler(data);
      } catch (e) {
        console.error(`[QuickApps] Event handler error (${event}):`, e);
      }
    });
  }
  clear() {
    this.listeners.clear();
  }
};

// src/capacitor.ts
var isNative = () => typeof window !== "undefined" && typeof window.Capacitor !== "undefined" && window.Capacitor.isNativePlatform();
function plugin(name) {
  var _a2, _b, _c;
  try {
    const cap = window.Capacitor;
    if (!cap) return null;
    const Plugins = (_b = (_a2 = window.CapacitorPlugins) != null ? _a2 : cap.Plugins) != null ? _b : {};
    return (_c = Plugins[name]) != null ? _c : null;
  } catch (e) {
    return null;
  }
}
async function getDeviceInfo() {
  const p = plugin("Device");
  if (p == null ? void 0 : p.getInfo) {
    const info = await p.getInfo();
    return info;
  }
  return {
    platform: "web",
    model: navigator.userAgent,
    osVersion: navigator.appVersion,
    appVersion: "1.0.0",
    appBuild: "1",
    isVirtual: false
  };
}
async function getNetworkStatus() {
  const p = plugin("Network");
  if (p == null ? void 0 : p.getStatus) {
    return p.getStatus();
  }
  return { connected: navigator.onLine, connectionType: navigator.onLine ? "wifi" : "none" };
}
async function openAppSettings() {
  const p = plugin("NativeSettings");
  if (p == null ? void 0 : p.open) await p.open({ option: "application_details" });
}
async function shareContent(options) {
  const p = plugin("Share");
  if (p == null ? void 0 : p.share) {
    await p.share(options);
    return;
  }
  if (navigator.share) await navigator.share(options);
}
async function vibrate(duration = 300) {
  const p = plugin("Haptics");
  if (p == null ? void 0 : p.vibrate) {
    await p.vibrate({ duration });
    return;
  }
  if (navigator.vibrate) navigator.vibrate(duration);
}
async function keepScreenOn(enabled) {
  const p = plugin("KeepAwake");
  if (enabled && (p == null ? void 0 : p.keepAwake)) await p.keepAwake();
  if (!enabled && (p == null ? void 0 : p.allowSleep)) await p.allowSleep();
}
async function setStatusBarStyle(style, color) {
  const p = plugin("StatusBar");
  if (!p) return;
  if (p.setStyle) await p.setStyle({ style: style.toUpperCase() });
  if (color && p.setBackgroundColor) await p.setBackgroundColor({ color });
}
async function hideStatusBar() {
  const p = plugin("StatusBar");
  if (p == null ? void 0 : p.hide) await p.hide();
}
async function showStatusBar() {
  const p = plugin("StatusBar");
  if (p == null ? void 0 : p.show) await p.show();
}
async function requestNotificationPermission() {
  const p = plugin("LocalNotifications");
  if (p == null ? void 0 : p.requestPermissions) {
    return p.requestPermissions();
  }
  if ("Notification" in window) {
    const result = await Notification.requestPermission();
    return { granted: result === "granted" };
  }
  return { granted: false };
}
async function hasNotificationPermission() {
  const p = plugin("LocalNotifications");
  if (p == null ? void 0 : p.checkPermissions) {
    return p.checkPermissions();
  }
  return { granted: (Notification == null ? void 0 : Notification.permission) === "granted" };
}
async function scheduleNotification(notification) {
  var _a2;
  const p = plugin("LocalNotifications");
  const id = (_a2 = notification.id) != null ? _a2 : Math.floor(Math.random() * 1e5);
  if (p == null ? void 0 : p.schedule) {
    await p.schedule({
      notifications: [{
        id,
        title: notification.title,
        body: notification.body,
        schedule: notification.at ? { at: new Date(notification.at) } : notification.every ? { every: notification.every } : void 0,
        extra: notification.data,
        iconColor: notification.iconColor,
        sound: notification.sound
      }]
    });
  }
  return { id };
}
async function cancelNotifications(ids) {
  const p = plugin("LocalNotifications");
  if (p == null ? void 0 : p.cancel) await p.cancel({ notifications: ids.map((id) => ({ id })) });
}
async function getPendingNotifications() {
  const p = plugin("LocalNotifications");
  if (p == null ? void 0 : p.getPending) {
    const result = await p.getPending();
    return result.notifications;
  }
  return [];
}
async function setBadgeCount(count) {
  var _a2;
  const p = (_a2 = plugin("Badge")) != null ? _a2 : plugin("App");
  if (p == null ? void 0 : p.set) await p.set({ count });
}
async function takePhoto(options = {}) {
  var _a2, _b;
  const p = plugin("Camera");
  if (p == null ? void 0 : p.getPhoto) {
    const result = await p.getPhoto({
      resultType: "dataUrl",
      quality: (_a2 = options.quality) != null ? _a2 : 90,
      saveToGallery: (_b = options.saveToGallery) != null ? _b : false,
      source: "CAMERA"
    });
    return result;
  }
  throw new Error("Camera not available");
}
async function pickFromGallery(options = {}) {
  var _a2;
  const p = plugin("Camera");
  if (p == null ? void 0 : p.getPhoto) {
    const result = await p.getPhoto({
      resultType: "dataUrl",
      quality: (_a2 = options.quality) != null ? _a2 : 90,
      source: "PHOTOS"
    });
    return result;
  }
  throw new Error("Gallery not available");
}
async function scanBarcode(options = {}) {
  var _a2;
  const p = (_a2 = plugin("BarcodeScanner")) != null ? _a2 : plugin("MLKitBarcodeScanning");
  if (p == null ? void 0 : p.scan) {
    const result = await p.scan(options);
    return result;
  }
  throw new Error("Barcode scanner not available");
}
async function isBiometricAvailable() {
  var _a2;
  const p = (_a2 = plugin("BiometricAuth")) != null ? _a2 : plugin("FingerprintAIO");
  if (!(p == null ? void 0 : p.isAvailable)) return false;
  try {
    await p.isAvailable();
    return true;
  } catch (e) {
    return false;
  }
}
async function authenticateBiometric(options = {}) {
  var _a2;
  const p = (_a2 = plugin("BiometricAuth")) != null ? _a2 : plugin("FingerprintAIO");
  if (!p) return { verified: false, error: "Biometric auth not available" };
  try {
    await p.verify(options);
    return { verified: true };
  } catch (e) {
    return { verified: false, error: e.message };
  }
}
async function readClipboard() {
  var _a2;
  const p = plugin("Clipboard");
  if (p == null ? void 0 : p.read) {
    return p.read();
  }
  if ((_a2 = navigator.clipboard) == null ? void 0 : _a2.readText) {
    const text = await navigator.clipboard.readText();
    return { value: text, type: "text/plain" };
  }
  return { value: "", type: "text/plain" };
}
async function writeClipboard(text) {
  var _a2;
  const p = plugin("Clipboard");
  if (p == null ? void 0 : p.write) {
    await p.write({ string: text });
    return;
  }
  if ((_a2 = navigator.clipboard) == null ? void 0 : _a2.writeText) {
    await navigator.clipboard.writeText(text);
  }
}
async function storageGet(key) {
  var _a2;
  const p = (_a2 = plugin("Preferences")) != null ? _a2 : plugin("Storage");
  if (p == null ? void 0 : p.get) {
    return p.get({ key });
  }
  return { value: localStorage.getItem(key) };
}
async function storageSet(key, value) {
  var _a2;
  const p = (_a2 = plugin("Preferences")) != null ? _a2 : plugin("Storage");
  if (p == null ? void 0 : p.set) {
    await p.set({ key, value });
    return;
  }
  localStorage.setItem(key, value);
}
async function storageRemove(key) {
  var _a2;
  const p = (_a2 = plugin("Preferences")) != null ? _a2 : plugin("Storage");
  if (p == null ? void 0 : p.remove) {
    await p.remove({ key });
    return;
  }
  localStorage.removeItem(key);
}
async function storageClear() {
  var _a2;
  const p = (_a2 = plugin("Preferences")) != null ? _a2 : plugin("Storage");
  if (p == null ? void 0 : p.clear) {
    await p.clear();
    return;
  }
  localStorage.clear();
}
async function storageKeys() {
  var _a2;
  const p = (_a2 = plugin("Preferences")) != null ? _a2 : plugin("Storage");
  if (p == null ? void 0 : p.keys) {
    const result = await p.keys();
    return result.keys;
  }
  return Object.keys(localStorage);
}
async function openUrl(url) {
  const p = plugin("Browser");
  if (p == null ? void 0 : p.open) {
    await p.open({ url });
    return;
  }
  window.open(url, "_blank");
}
async function getLaunchOptions() {
  const p = plugin("App");
  if (p == null ? void 0 : p.getLaunchUrl) {
    const result = await p.getLaunchUrl();
    return { url: result == null ? void 0 : result.url };
  }
  return { url: void 0 };
}
function openWhatsApp(phone, message) {
  const cleaned = phone.replace(/[^0-9+]/g, "");
  const base = `https://wa.me/${cleaned}`;
  const url = message ? `${base}?text=${encodeURIComponent(message)}` : base;
  window.open(url, "_blank");
}
async function isWhatsAppInstalled() {
  if (!isNative()) return false;
  const p = plugin("App");
  if (p == null ? void 0 : p.canOpenUrl) {
    const result = await p.canOpenUrl({ url: "whatsapp://" });
    return result.value;
  }
  return false;
}
async function openRazorpay(options) {
  const p = plugin("Razorpay");
  if (p == null ? void 0 : p.open) {
    return p.open(options);
  }
  return new Promise((resolve, reject) => {
    const script = document.createElement("script");
    script.src = "https://checkout.razorpay.com/v1/checkout.js";
    script.onload = () => {
      const rzp = new window.Razorpay(__spreadProps(__spreadValues({}, options), {
        handler: (response) => resolve(response),
        modal: { ondismiss: () => reject(new Error("Payment dismissed")) }
      }));
      rzp.open();
    };
    script.onerror = () => reject(new Error("Failed to load Razorpay"));
    document.head.appendChild(script);
  });
}

// src/addons.ts
async function loadConfig(slug) {
  try {
    const res = await fetch(`/addon-configs/${slug}.json`);
    if (!res.ok) return {};
    return await res.json();
  } catch (e) {
    return {};
  }
}
function onDOMReady(fn) {
  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", fn, { once: true });
  } else {
    fn();
  }
}
async function initWhatsAppBridge(bus2) {
  const cfg = await loadConfig("whatsapp-bridge");
  if (!cfg["phoneNumber"]) return;
  onDOMReady(() => {
    var _a2, _b;
    const phone = String(cfg["phoneNumber"]).replace(/[^0-9]/g, "");
    const message = cfg["defaultMessage"] ? `?text=${encodeURIComponent(String(cfg["defaultMessage"]))}` : "";
    const href = `https://wa.me/${phone}${message}`;
    const pos = String((_a2 = cfg["buttonPosition"]) != null ? _a2 : "bottom-right");
    const color = String((_b = cfg["buttonColor"]) != null ? _b : "#25D366");
    const posStyle = pos === "bottom-left" ? "bottom:20px;left:20px" : "bottom:20px;right:20px";
    const btn = document.createElement("a");
    btn.id = "qa-whatsapp-btn";
    btn.href = href;
    btn.target = "_blank";
    btn.rel = "noopener noreferrer";
    btn.setAttribute("aria-label", "Chat on WhatsApp");
    btn.style.cssText = `position:fixed;${posStyle};z-index:9999;width:56px;height:56px;border-radius:50%;background:${color};display:flex;align-items:center;justify-content:center;box-shadow:0 4px 16px rgba(0,0,0,0.25);text-decoration:none;transition:transform 0.2s,box-shadow 0.2s;`;
    btn.innerHTML = `<svg width="28" height="28" viewBox="0 0 24 24" fill="white" xmlns="http://www.w3.org/2000/svg">
      <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347z"/>
      <path d="M12 2C6.477 2 2 6.477 2 12c0 1.89.525 3.66 1.438 5.168L2 22l4.832-1.438A9.955 9.955 0 0012 22c5.523 0 10-4.477 10-10S17.523 2 12 2zm0 18a8 8 0 01-4.16-1.163l-.29-.175-3.012.79.803-2.934-.192-.305A8 8 0 1112 20z"/>
    </svg>`;
    btn.addEventListener("mouseenter", () => {
      btn.style.transform = "scale(1.1)";
      btn.style.boxShadow = "0 6px 20px rgba(0,0,0,0.3)";
    });
    btn.addEventListener("mouseleave", () => {
      btn.style.transform = "scale(1)";
      btn.style.boxShadow = "0 4px 16px rgba(0,0,0,0.25)";
    });
    document.body.appendChild(btn);
    bus2.emit("ready", void 0);
  });
}
async function initBottomNavigation(bus2) {
  var _a2;
  const cfg = await loadConfig("bottom-navigation");
  const tabs = (_a2 = cfg["tabs"]) != null ? _a2 : [];
  if (!tabs.length) return;
  onDOMReady(() => {
    var _a3, _b, _c;
    const activeColor = String((_a3 = cfg["activeColor"]) != null ? _a3 : "#F97316");
    const inactiveColor = String((_b = cfg["inactiveColor"]) != null ? _b : "#9CA3AF");
    const bgColor = String((_c = cfg["backgroundColor"]) != null ? _c : "#FFFFFF");
    const nav = document.createElement("nav");
    nav.id = "qa-bottom-nav";
    nav.setAttribute("role", "navigation");
    nav.setAttribute("aria-label", "Bottom navigation");
    nav.style.cssText = `position:fixed;bottom:0;left:0;right:0;z-index:1000;display:flex;height:56px;background:${bgColor};box-shadow:0 -1px 8px rgba(0,0,0,0.12);safe-area-inset-bottom:env(safe-area-inset-bottom);padding-bottom:env(safe-area-inset-bottom);`;
    const currentPath = window.location.pathname;
    tabs.forEach((tab) => {
      const isActive = tab.url && (currentPath === tab.url || currentPath.startsWith(tab.url + "/"));
      const btn = document.createElement("button");
      btn.id = `qa-tab-${tab.id}`;
      btn.setAttribute("aria-label", tab.label);
      btn.style.cssText = `flex:1;display:flex;flex-direction:column;align-items:center;justify-content:center;gap:2px;border:none;background:none;cursor:pointer;color:${isActive ? activeColor : inactiveColor};position:relative;`;
      const badgeHtml = tab.badge && tab.badge > 0 ? `<span style="position:absolute;top:4px;right:calc(50% - 18px);min-width:16px;height:16px;background:#EF4444;color:#fff;border-radius:8px;font-size:10px;font-weight:700;display:flex;align-items:center;justify-content:center;padding:0 3px;">${tab.badge > 99 ? "99+" : tab.badge}</span>` : "";
      btn.innerHTML = `
        ${badgeHtml}
        <span style="font-size:22px;line-height:1;">${tab.icon}</span>
        <span style="font-size:10px;font-weight:500;">${tab.label}</span>
      `;
      btn.addEventListener("click", () => {
        bus2.emit("bottomTabSelect", { id: tab.id });
        if (tab.url) window.location.href = tab.url;
        nav.querySelectorAll("button").forEach((b) => b.style.color = inactiveColor);
        btn.style.color = activeColor;
      });
      nav.appendChild(btn);
    });
    document.body.appendChild(nav);
    document.body.style.paddingBottom = "56px";
  });
}
async function initOnboarding(bus2) {
  var _a2;
  const cfg = await loadConfig("onboarding-screens");
  const screens = (_a2 = cfg["screens"]) != null ? _a2 : [];
  if (!screens.length) return;
  const shown = localStorage.getItem("qa_onboarding_shown");
  if (shown) return;
  onDOMReady(() => {
    var _a3, _b;
    let currentIndex = 0;
    const skipText = String((_a3 = cfg["skipButtonText"]) != null ? _a3 : "Skip");
    const doneText = String((_b = cfg["doneButtonText"]) != null ? _b : "Get Started");
    const overlay = document.createElement("div");
    overlay.id = "qa-onboarding";
    overlay.style.cssText = "position:fixed;inset:0;z-index:99999;display:flex;flex-direction:column;";
    const render = () => {
      var _a4, _b2, _c, _d;
      const screen = screens[currentIndex];
      const bg = (_a4 = screen.backgroundColor) != null ? _a4 : "#FFFFFF";
      const fg = (_b2 = screen.textColor) != null ? _b2 : "#111827";
      const isLast = currentIndex === screens.length - 1;
      overlay.innerHTML = `
        <div style="flex:1;display:flex;flex-direction:column;align-items:center;justify-content:center;padding:32px 24px;background:${bg};gap:24px;">
          ${screen.imageUrl ? `<img src="${screen.imageUrl}" alt="${screen.title}" style="max-width:240px;max-height:240px;object-fit:contain;border-radius:12px;">` : ""}
          <h2 style="font-size:26px;font-weight:700;color:${fg};text-align:center;margin:0;">${screen.title}</h2>
          ${screen.subtitle ? `<p style="font-size:16px;color:${fg};opacity:0.7;text-align:center;margin:0;line-height:1.5;">${screen.subtitle}</p>` : ""}
          <div style="display:flex;gap:8px;margin-top:8px;">
            ${screens.map((_, i) => `<div style="width:${i === currentIndex ? 24 : 8}px;height:8px;border-radius:4px;background:${i === currentIndex ? "#F97316" : "#D1D5DB"};transition:width 0.3s;"></div>`).join("")}
          </div>
        </div>
        <div style="display:flex;justify-content:space-between;align-items:center;padding:16px 24px;background:${bg};padding-bottom:max(16px, env(safe-area-inset-bottom));">
          <button id="qa-ob-skip" style="padding:10px 20px;background:transparent;border:none;font-size:15px;color:${fg};opacity:0.5;cursor:pointer;">${isLast ? "" : skipText}</button>
          <button id="qa-ob-next" style="padding:12px 28px;background:#F97316;color:#fff;border:none;border-radius:10px;font-size:15px;font-weight:600;cursor:pointer;">${isLast ? doneText : "Next \u2192"}</button>
        </div>
      `;
      (_c = overlay.querySelector("#qa-ob-next")) == null ? void 0 : _c.addEventListener("click", () => {
        if (isLast) {
          localStorage.setItem("qa_onboarding_shown", "1");
          overlay.remove();
          bus2.emit("onboardingComplete", void 0);
        } else {
          currentIndex++;
          render();
        }
      });
      (_d = overlay.querySelector("#qa-ob-skip")) == null ? void 0 : _d.addEventListener("click", () => {
        if (!isLast) {
          localStorage.setItem("qa_onboarding_shown", "1");
          overlay.remove();
          bus2.emit("onboardingSkip", void 0);
        }
      });
    };
    render();
    document.body.appendChild(overlay);
  });
}
async function initPromoCard(bus2) {
  var _a2, _b;
  const cfg = await loadConfig("offer-promo-card");
  if (!cfg["title"]) return;
  const trigger = String((_a2 = cfg["trigger"]) != null ? _a2 : "on_open");
  const delayMs = Number((_b = cfg["delaySeconds"]) != null ? _b : 2) * 1e3;
  const show = () => {
    onDOMReady(() => {
      var _a3, _b2;
      const card = document.createElement("div");
      card.id = "qa-promo-card";
      card.style.cssText = "position:fixed;inset:0;z-index:9998;display:flex;align-items:flex-end;justify-content:center;background:rgba(0,0,0,0.5);padding:16px;";
      card.innerHTML = `
        <div style="background:#fff;border-radius:20px 20px 16px 16px;width:100%;max-width:480px;overflow:hidden;box-shadow:0 -4px 32px rgba(0,0,0,0.2);">
          ${cfg["imageUrl"] ? `<img src="${cfg["imageUrl"]}" alt="${cfg["title"]}" style="width:100%;max-height:200px;object-fit:cover;">` : ""}
          <div style="padding:20px 20px 24px;">
            <button id="qa-promo-close" style="float:right;background:none;border:none;font-size:20px;cursor:pointer;color:#9CA3AF;margin:-4px -8px 0 0;">\u2715</button>
            <h3 style="font-size:20px;font-weight:700;color:#111827;margin:0 0 8px;">${cfg["title"]}</h3>
            ${cfg["ctaText"] && cfg["ctaUrl"] ? `<a id="qa-promo-cta" href="${cfg["ctaUrl"]}" style="display:inline-block;padding:12px 24px;background:#F97316;color:#fff;border-radius:10px;font-size:15px;font-weight:600;text-decoration:none;margin-top:8px;">${cfg["ctaText"]}</a>` : ""}
          </div>
        </div>
      `;
      (_a3 = card.querySelector("#qa-promo-close")) == null ? void 0 : _a3.addEventListener("click", () => {
        card.remove();
        bus2.emit("promoCardDismiss", void 0);
      });
      (_b2 = card.querySelector("#qa-promo-cta")) == null ? void 0 : _b2.addEventListener("click", () => {
        bus2.emit("promoCardCta", { url: String(cfg["ctaUrl"]) });
      });
      document.body.appendChild(card);
    });
  };
  if (trigger === "on_open") {
    setTimeout(show, delayMs);
  } else if (trigger === "on_exit") {
    document.addEventListener("mouseleave", (e) => {
      if (e.clientY <= 0) show();
    }, { once: true });
  }
}
async function initPasscodeLock(bus2) {
  var _a2, _b;
  const cfg = await loadConfig("passcode-lock");
  const pinLength = Number((_a2 = cfg["pinLength"]) != null ? _a2 : 4);
  const inactivityTimeout = Number((_b = cfg["inactivityTimeout"]) != null ? _b : 5) * 60 * 1e3;
  const storageKey = "qa_passcode_hash";
  const lastActiveKey = "qa_last_active";
  let lastActive = Date.now();
  let lockShown = false;
  const updateActivity = () => {
    lastActive = Date.now();
    localStorage.setItem(lastActiveKey, String(lastActive));
  };
  document.addEventListener("click", updateActivity, { passive: true });
  document.addEventListener("touchstart", updateActivity, { passive: true });
  document.addEventListener("keydown", updateActivity, { passive: true });
  const showLock = () => {
    if (lockShown) return;
    lockShown = true;
    const stored2 = localStorage.getItem(storageKey);
    const isSetup = !stored2;
    const overlay = document.createElement("div");
    overlay.id = "qa-passcode-lock";
    overlay.style.cssText = "position:fixed;inset:0;z-index:99998;background:#F9FAFB;display:flex;flex-direction:column;align-items:center;justify-content:center;gap:24px;";
    let entered = "";
    let setupPin = "";
    let step = isSetup ? "setup" : "enter";
    const getMessage = () => {
      if (step === "setup") return "Set a PIN to protect your app";
      if (step === "confirm") return "Confirm your PIN";
      return "Enter your PIN to continue";
    };
    const render = () => {
      overlay.innerHTML = `
        <div style="text-align:center;">
          <h2 style="font-size:20px;font-weight:700;color:#111827;margin:0 0 8px;">\u{1F512} App Locked</h2>
          <p style="font-size:14px;color:#6B7280;margin:0;">${getMessage()}</p>
        </div>
        <div style="display:flex;gap:12px;">
          ${Array.from({ length: pinLength }, (_, i) => `<div style="width:16px;height:16px;border-radius:50%;background:${entered.length > i ? "#F97316" : "#E5E7EB"};transition:background 0.15s;"></div>`).join("")}
        </div>
        <div style="display:grid;grid-template-columns:repeat(3,80px);gap:12px;">
          ${[1, 2, 3, 4, 5, 6, 7, 8, 9, "", 0, "\u232B"].map((k) => `<button data-key="${k}" style="width:80px;height:80px;border-radius:50%;border:none;background:${k === "" ? "transparent" : "#fff"};box-shadow:${k === "" ? "none" : "0 2px 8px rgba(0,0,0,0.1)"};font-size:24px;font-weight:600;color:#111827;cursor:${k === "" ? "default" : "pointer"};">${k}</button>`).join("")}
        </div>
        ${cfg["biometricFallback"] ? `<button id="qa-biometric-btn" style="padding:10px 20px;background:transparent;border:1px solid #E5E7EB;border-radius:10px;font-size:14px;color:#6B7280;cursor:pointer;">Use Biometric</button>` : ""}
      `;
      overlay.querySelectorAll("[data-key]").forEach((btn) => {
        const key = btn.dataset["key"];
        if (!key && key !== "0") return;
        btn.addEventListener("click", () => {
          if (key === "\u232B") {
            entered = entered.slice(0, -1);
          } else if (key !== "" && entered.length < pinLength) {
            entered += key;
          }
          if (entered.length === pinLength) {
            setTimeout(() => {
              if (step === "setup") {
                setupPin = entered;
                entered = "";
                step = "confirm";
                render();
              } else if (step === "confirm") {
                if (entered === setupPin) {
                  localStorage.setItem(storageKey, btoa(entered));
                  overlay.remove();
                  lockShown = false;
                } else {
                  entered = "";
                  render();
                  overlay.querySelector("p").textContent = "\u274C PINs do not match. Try again.";
                }
              } else {
                if (btoa(entered) === stored2) {
                  overlay.remove();
                  lockShown = false;
                  bus2.emit("ready", void 0);
                } else {
                  entered = "";
                  render();
                  overlay.querySelector("p").textContent = "\u274C Incorrect PIN. Try again.";
                }
              }
            }, 100);
          } else {
            render();
          }
        });
      });
    };
    render();
    document.body.appendChild(overlay);
  };
  const stored = localStorage.getItem(storageKey);
  if (stored) {
    onDOMReady(showLock);
  } else {
    onDOMReady(showLock);
  }
  setInterval(() => {
    if (Date.now() - lastActive > inactivityTimeout && !lockShown) {
      showLock();
    }
  }, 3e4);
}
async function initTopActionBar(bus2) {
  const cfg = await loadConfig("top-action-bar");
  onDOMReady(() => {
    var _a2, _b, _c, _d, _e, _f;
    const bar = document.createElement("div");
    bar.id = "qa-top-bar";
    bar.style.cssText = `position:fixed;top:0;left:0;right:0;z-index:1000;height:44px;display:flex;align-items:center;justify-content:space-between;padding:0 12px;background:${(_a2 = cfg["backgroundColor"]) != null ? _a2 : "#FFFFFF"};box-shadow:0 1px 4px rgba(0,0,0,0.08);padding-top:env(safe-area-inset-top);`;
    const showBack = cfg["showBackButton"] !== false && window.history.length > 1;
    const showShare = cfg["showShare"] !== false;
    bar.innerHTML = `
      ${showBack ? `<button id="qa-top-back" style="padding:8px;background:none;border:none;cursor:pointer;color:${(_b = cfg["textColor"]) != null ? _b : "#111827"};">
        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polyline points="15 18 9 12 15 6"/></svg>
      </button>` : '<div style="width:40px;"></div>'}
      <div id="qa-top-title" style="font-size:16px;font-weight:600;color:${(_c = cfg["textColor"]) != null ? _c : "#111827"};"></div>
      ${showShare ? `<button id="qa-top-share" style="padding:8px;background:none;border:none;cursor:pointer;color:${(_d = cfg["textColor"]) != null ? _d : "#111827"};">
        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="18" cy="5" r="3"/><circle cx="6" cy="12" r="3"/><circle cx="18" cy="19" r="3"/><line x1="8.59" y1="13.51" x2="15.42" y2="17.49"/><line x1="15.41" y1="6.51" x2="8.59" y2="10.49"/></svg>
      </button>` : '<div style="width:40px;"></div>'}
    `;
    (_e = bar.querySelector("#qa-top-back")) == null ? void 0 : _e.addEventListener("click", () => {
      window.history.back();
      bus2.emit("backButton", void 0);
    });
    (_f = bar.querySelector("#qa-top-share")) == null ? void 0 : _f.addEventListener("click", () => {
      if (navigator.share) {
        navigator.share({ title: document.title, url: window.location.href }).catch(() => {
        });
      }
    });
    document.body.appendChild(bar);
    document.body.style.paddingTop = `calc(44px + env(safe-area-inset-top))`;
    const updateTitle = () => {
      var _a3;
      const el = bar.querySelector("#qa-top-title");
      if (el) el.textContent = (_a3 = document.title.split(" - ")[0]) != null ? _a3 : document.title;
    };
    updateTitle();
    const observer = new MutationObserver(updateTitle);
    const titleEl = document.querySelector("title");
    if (titleEl) observer.observe(titleEl, { childList: true, characterData: true });
  });
}
async function initAiChatbot(bus2) {
  const cfg = await loadConfig("ai-chatbot");
  onDOMReady(() => {
    var _a2, _b, _c, _d, _e;
    const pos = String((_a2 = cfg["position"]) != null ? _a2 : "bottom-right");
    const posStyle = pos === "bottom-left" ? "bottom:80px;left:20px" : "bottom:80px;right:20px";
    const iconUrl = cfg["iconUrl"];
    const fab = document.createElement("button");
    fab.id = "qa-chatbot-btn";
    fab.setAttribute("aria-label", "Open Chat");
    fab.style.cssText = `position:fixed;${posStyle};z-index:9997;width:52px;height:52px;border-radius:50%;background:#6366F1;border:none;cursor:pointer;box-shadow:0 4px 16px rgba(99,102,241,0.4);display:flex;align-items:center;justify-content:center;transition:transform 0.2s;`;
    fab.innerHTML = iconUrl ? `<img src="${iconUrl}" width="28" height="28" style="border-radius:50%;">` : `<svg width="24" height="24" viewBox="0 0 24 24" fill="white"><path d="M20 2H4c-1.1 0-2 .9-2 2v18l4-4h14c1.1 0 2-.9 2-2V4c0-1.1-.9-2-2-2zm-2 12H6v-2h12v2zm0-3H6V9h12v2zm0-3H6V6h12v2z"/></svg>`;
    const panel = document.createElement("div");
    panel.id = "qa-chatbot-panel";
    panel.style.cssText = `position:fixed;${pos.includes("left") ? "left:16px" : "right:16px"};bottom:148px;z-index:9996;width:320px;max-height:480px;background:#fff;border-radius:16px;box-shadow:0 8px 32px rgba(0,0,0,0.15);display:none;flex-direction:column;overflow:hidden;`;
    panel.innerHTML = `
      <div style="background:#6366F1;padding:14px 16px;display:flex;align-items:center;gap:10px;">
        <div style="width:8px;height:8px;background:#4ADE80;border-radius:50%;"></div>
        <span style="font-size:15px;font-weight:600;color:#fff;">AI Assistant</span>
        <button id="qa-chat-close" style="margin-left:auto;background:none;border:none;color:#fff;font-size:18px;cursor:pointer;">\u2715</button>
      </div>
      <div id="qa-chat-messages" style="flex:1;overflow-y:auto;padding:12px;display:flex;flex-direction:column;gap:8px;max-height:320px;"></div>
      <div style="padding:8px;border-top:1px solid #F3F4F6;display:flex;gap:8px;">
        <input id="qa-chat-input" type="text" placeholder="Type a message..." style="flex:1;padding:8px 12px;border:1px solid #E5E7EB;border-radius:8px;font-size:14px;outline:none;">
        <button id="qa-chat-send" style="padding:8px 14px;background:#6366F1;color:#fff;border:none;border-radius:8px;font-size:14px;cursor:pointer;">Send</button>
      </div>
    `;
    let isOpen = false;
    const addMessage = (role, text) => {
      const msgs = panel.querySelector("#qa-chat-messages");
      const el = document.createElement("div");
      el.style.cssText = `align-self:${role === "user" ? "flex-end" : "flex-start"};max-width:80%;padding:8px 12px;border-radius:12px;font-size:13px;line-height:1.4;background:${role === "user" ? "#6366F1" : "#F3F4F6"};color:${role === "user" ? "#fff" : "#111827"};`;
      el.textContent = text;
      msgs.appendChild(el);
      msgs.scrollTop = msgs.scrollHeight;
    };
    const systemPrompt = String((_b = cfg["systemPrompt"]) != null ? _b : "You are a helpful assistant for this app.");
    const sendMessage = async () => {
      const input = panel.querySelector("#qa-chat-input");
      const text = input.value.trim();
      if (!text) return;
      input.value = "";
      addMessage("user", text);
      addMessage("assistant", `I received: "${text}". (Configure AI endpoint in system prompt settings)`);
    };
    (_c = panel.querySelector("#qa-chat-send")) == null ? void 0 : _c.addEventListener("click", sendMessage);
    (_d = panel.querySelector("#qa-chat-input")) == null ? void 0 : _d.addEventListener("keydown", (e) => {
      if (e.key === "Enter") sendMessage();
    });
    (_e = panel.querySelector("#qa-chat-close")) == null ? void 0 : _e.addEventListener("click", () => {
      isOpen = false;
      panel.style.display = "none";
    });
    fab.addEventListener("click", () => {
      isOpen = !isOpen;
      panel.style.display = isOpen ? "flex" : "none";
      fab.style.transform = isOpen ? "scale(0.9)" : "scale(1)";
    });
    document.body.appendChild(fab);
    document.body.appendChild(panel);
    if (systemPrompt) {
      setTimeout(() => {
        if (!isOpen) {
          isOpen = true;
          panel.style.display = "flex";
          addMessage("assistant", "Hi! How can I help you today?");
        }
      }, 3e3);
    }
  });
}
async function initIndianLanguageOverlay(bus2) {
  var _a2, _b;
  const cfg = await loadConfig("indian-language-overlay");
  const languages = (_a2 = cfg["languages"]) != null ? _a2 : [];
  const defaultLang = String((_b = cfg["defaultLanguage"]) != null ? _b : "en");
  if (!languages.length) return;
  const LANGUAGE_NAMES = {
    en: "English",
    hi: "\u0939\u093F\u0928\u094D\u0926\u0940",
    mr: "\u092E\u0930\u093E\u0920\u0940",
    gu: "\u0A97\u0AC1\u0A9C\u0AB0\u0ABE\u0AA4\u0AC0",
    ta: "\u0BA4\u0BAE\u0BBF\u0BB4\u0BCD",
    te: "\u0C24\u0C46\u0C32\u0C41\u0C17\u0C41",
    kn: "\u0C95\u0CA8\u0CCD\u0CA8\u0CA1",
    ml: "\u0D2E\u0D32\u0D2F\u0D3E\u0D33\u0D02",
    bn: "\u09AC\u09BE\u0982\u09B2\u09BE",
    pa: "\u0A2A\u0A70\u0A1C\u0A3E\u0A2C\u0A40",
    or: "\u0B13\u0B21\u0B3C\u0B3F\u0B06",
    as: "\u0985\u09B8\u09AE\u09C0\u09AF\u09BC\u09BE"
  };
  onDOMReady(() => {
    var _a3, _b2;
    const currentLang = (_a3 = localStorage.getItem("qa_language")) != null ? _a3 : defaultLang;
    const selector = document.createElement("div");
    selector.id = "qa-lang-selector";
    selector.style.cssText = "position:fixed;top:env(safe-area-inset-top,8px);right:16px;z-index:9995;";
    const btn = document.createElement("button");
    btn.style.cssText = "padding:6px 12px;background:#fff;border:1px solid #E5E7EB;border-radius:8px;font-size:13px;font-weight:500;cursor:pointer;display:flex;align-items:center;gap:6px;box-shadow:0 2px 8px rgba(0,0,0,0.08);";
    btn.innerHTML = `\u{1F310} ${(_b2 = LANGUAGE_NAMES[currentLang]) != null ? _b2 : currentLang}`;
    const dropdown = document.createElement("div");
    dropdown.style.cssText = "display:none;position:absolute;right:0;top:calc(100% + 4px);background:#fff;border-radius:10px;border:1px solid #E5E7EB;box-shadow:0 4px 16px rgba(0,0,0,0.12);overflow:hidden;min-width:140px;";
    const allLangs = [defaultLang, ...languages.filter((l) => l !== defaultLang)];
    allLangs.forEach((lang) => {
      var _a4;
      const item = document.createElement("button");
      item.style.cssText = `width:100%;padding:10px 14px;background:${lang === currentLang ? "#FFF7ED" : "transparent"};border:none;text-align:left;font-size:13px;cursor:pointer;color:${lang === currentLang ? "#F97316" : "#111827"};font-weight:${lang === currentLang ? "600" : "400"};`;
      item.textContent = (_a4 = LANGUAGE_NAMES[lang]) != null ? _a4 : lang;
      item.addEventListener("click", () => {
        var _a5;
        localStorage.setItem("qa_language", lang);
        document.documentElement.lang = lang;
        dropdown.style.display = "none";
        btn.innerHTML = `\u{1F310} ${(_a5 = LANGUAGE_NAMES[lang]) != null ? _a5 : lang}`;
        bus2.emit("ready", void 0);
        window.location.reload();
      });
      dropdown.appendChild(item);
    });
    btn.addEventListener("click", () => {
      dropdown.style.display = dropdown.style.display === "none" ? "block" : "none";
    });
    document.addEventListener("click", (e) => {
      if (!selector.contains(e.target)) dropdown.style.display = "none";
    });
    document.documentElement.lang = currentLang;
    selector.appendChild(btn);
    selector.appendChild(dropdown);
    document.body.appendChild(selector);
  });
}
async function initTawkTo() {
  const cfg = await loadConfig("tawkto");
  if (!cfg["propertyId"] || !cfg["widgetId"]) return;
  onDOMReady(() => {
    var _a2;
    window.Tawk_API = (_a2 = window.Tawk_API) != null ? _a2 : {};
    window.Tawk_LoadStart = /* @__PURE__ */ new Date();
    const s = document.createElement("script");
    s.async = true;
    s.src = `https://embed.tawk.to/${cfg["propertyId"]}/${cfg["widgetId"]}`;
    s.charset = "UTF-8";
    s.setAttribute("crossorigin", "*");
    document.head.appendChild(s);
  });
}
function initNoInternetScreen(noInternetCfg, bus2) {
  var _a2, _b, _c, _d;
  const heading = (_a2 = noInternetCfg.headingText) != null ? _a2 : "No Internet Connection";
  const body = (_b = noInternetCfg.bodyText) != null ? _b : "Please check your connection and try again.";
  const retryLabel = (_c = noInternetCfg.retryButtonLabel) != null ? _c : "Try Again";
  const retryColor = (_d = noInternetCfg.retryButtonColor) != null ? _d : "#F97316";
  let overlay = null;
  const show = () => {
    var _a3;
    if (overlay) return;
    overlay = document.createElement("div");
    overlay.id = "qa-no-internet";
    overlay.style.cssText = "position:fixed;inset:0;z-index:99999;background:#F9FAFB;display:flex;flex-direction:column;align-items:center;justify-content:center;gap:16px;padding:32px;text-align:center;";
    overlay.innerHTML = `
      <svg width="80" height="80" viewBox="0 0 24 24" fill="none" stroke="#9CA3AF" stroke-width="1.5"><line x1="1" y1="1" x2="23" y2="23"/><path d="M16.72 11.06A10.94 10.94 0 0119 12.55M5 12.55a10.94 10.94 0 015.17-2.39M10.71 5.05A16 16 0 0122.56 9M1.42 9a15.91 15.91 0 014.7-2.88M8.53 16.11a6 6 0 016.95 0M12 20h.01"/></svg>
      <h2 style="font-size:22px;font-weight:700;color:#111827;margin:0;">${heading}</h2>
      <p style="font-size:15px;color:#6B7280;margin:0;line-height:1.5;">${body}</p>
      <button id="qa-retry-btn" style="margin-top:8px;padding:12px 28px;background:${retryColor};color:#fff;border:none;border-radius:10px;font-size:15px;font-weight:600;cursor:pointer;">${retryLabel}</button>
    `;
    (_a3 = overlay.querySelector("#qa-retry-btn")) == null ? void 0 : _a3.addEventListener("click", () => {
      if (navigator.onLine) {
        overlay == null ? void 0 : overlay.remove();
        overlay = null;
      }
    });
    document.body.appendChild(overlay);
    bus2.emit("networkChange", { connected: false, connectionType: "none" });
  };
  const hide = () => {
    if (overlay) {
      overlay.remove();
      overlay = null;
      bus2.emit("networkChange", { connected: true, connectionType: "wifi" });
    }
  };
  window.addEventListener("offline", show);
  window.addEventListener("online", hide);
  if (!navigator.onLine) onDOMReady(show);
}

// src/index.ts
var bus = new EventBus();
var manifest = null;
var isReady = false;
var readyCallbacks = [];
function getPlatform() {
  if (typeof window === "undefined") return "web";
  const cap = window.Capacitor;
  if (!(cap == null ? void 0 : cap.isNativePlatform())) return "web";
  return cap.getPlatform();
}
var _a;
var isNative2 = typeof window !== "undefined" && !!((_a = window.Capacitor) == null ? void 0 : _a.isNativePlatform());
var bridge = {
  get version() {
    return "1.0.0";
  },
  get isNative() {
    return isNative2;
  },
  get platform() {
    return getPlatform();
  },
  get addons() {
    var _a2;
    return (_a2 = manifest == null ? void 0 : manifest.addons.map((a) => a.slug)) != null ? _a2 : [];
  },
  get manifest() {
    return manifest;
  },
  // ── Device ────────────────────────────────────────────────────────────────
  device: {
    getInfo: () => getDeviceInfo(),
    getNetworkStatus: () => getNetworkStatus(),
    openAppSettings: () => openAppSettings(),
    share: (options) => shareContent(options),
    vibrate: (duration) => vibrate(duration),
    keepScreenOn: (enabled) => keepScreenOn(enabled),
    setStatusBarStyle: (style, color) => setStatusBarStyle(style, color),
    hideStatusBar: () => hideStatusBar(),
    showStatusBar: () => showStatusBar()
  },
  // ── Notifications ─────────────────────────────────────────────────────────
  notifications: {
    requestPermission: () => requestNotificationPermission(),
    hasPermission: () => hasNotificationPermission(),
    schedule: (notification) => scheduleNotification(notification),
    cancel: (ids) => cancelNotifications(ids),
    getPending: () => getPendingNotifications(),
    setBadgeCount: (count) => setBadgeCount(count),
    clearBadge: () => setBadgeCount(0)
  },
  // ── Camera / QR ───────────────────────────────────────────────────────────
  camera: {
    takePhoto: (options) => takePhoto(options),
    pickFromGallery: (options) => pickFromGallery(options),
    scan: (options) => scanBarcode(options)
  },
  // ── Biometric ─────────────────────────────────────────────────────────────
  biometric: {
    isAvailable: () => isBiometricAvailable(),
    authenticate: (options) => authenticateBiometric(options)
  },
  // ── Clipboard ─────────────────────────────────────────────────────────────
  clipboard: {
    read: () => readClipboard(),
    write: (text) => writeClipboard(text)
  },
  // ── Storage ───────────────────────────────────────────────────────────────
  storage: {
    get: (key) => storageGet(key),
    set: (key, value) => storageSet(key, value),
    remove: (key) => storageRemove(key),
    clear: () => storageClear(),
    keys: () => storageKeys()
  },
  // ── Navigation ────────────────────────────────────────────────────────────
  navigation: {
    setBottomTabs: (tabs) => {
      var _a2, _b;
      bus.emit("bottomTabSelect", { id: (_b = (_a2 = tabs[0]) == null ? void 0 : _a2.id) != null ? _b : "" });
    },
    updateBadge: (_tabId, _count) => {
    },
    showSideDrawer: () => {
      const drawer = document.getElementById("qa-side-drawer");
      if (drawer) drawer.style.transform = "translateX(0)";
    },
    hideSideDrawer: () => {
      const drawer = document.getElementById("qa-side-drawer");
      if (drawer) drawer.style.transform = "translateX(-100%)";
    },
    toggleSideDrawer: () => {
      const drawer = document.getElementById("qa-side-drawer");
      if (drawer) {
        const isOpen = drawer.style.transform === "translateX(0)";
        drawer.style.transform = isOpen ? "translateX(-100%)" : "translateX(0)";
      }
    },
    goBack: () => window.history.back(),
    navigateTo: (url) => {
      window.location.href = url;
    },
    reload: () => window.location.reload()
  },
  // ── Payments ──────────────────────────────────────────────────────────────
  payments: {
    openRazorpay: (options) => openRazorpay(options)
  },
  // ── Analytics ─────────────────────────────────────────────────────────────
  analytics: {
    track: (event, properties) => {
      var _a2, _b;
      try {
        const w = window;
        if ((_a2 = w.mixpanel) == null ? void 0 : _a2.track) w.mixpanel.track(event, properties);
        if ((_b = w.amplitude) == null ? void 0 : _b.track) w.amplitude.track(event, properties);
        if (w.gtag) w.gtag("event", event, properties);
        if (w.fbq) w.fbq("trackCustom", event, properties);
      } catch (e) {
      }
    },
    identify: (userId, traits) => {
      var _a2, _b;
      try {
        const w = window;
        if ((_a2 = w.mixpanel) == null ? void 0 : _a2.identify) {
          w.mixpanel.identify(userId);
          if (traits) w.mixpanel.people.set(traits);
        }
        if ((_b = w.amplitude) == null ? void 0 : _b.setUserId) w.amplitude.setUserId(userId);
      } catch (e) {
      }
    },
    screen: (name, properties) => {
      var _a2;
      try {
        const w = window;
        if ((_a2 = w.mixpanel) == null ? void 0 : _a2.track) w.mixpanel.track(`Screen: ${name}`, properties);
        if (w.gtag) w.gtag("event", "screen_view", __spreadValues({ screen_name: name }, properties));
      } catch (e) {
      }
    },
    reset: () => {
      var _a2, _b;
      try {
        const w = window;
        if ((_a2 = w.mixpanel) == null ? void 0 : _a2.reset) w.mixpanel.reset();
        if ((_b = w.amplitude) == null ? void 0 : _b.reset) w.amplitude.reset();
      } catch (e) {
      }
    }
  },
  // ── WhatsApp ──────────────────────────────────────────────────────────────
  whatsapp: {
    open: (phone, message) => openWhatsApp(phone, message),
    isInstalled: () => isWhatsAppInstalled()
  },
  // ── Deep Links ────────────────────────────────────────────────────────────
  links: {
    open: (url) => openUrl(url),
    getLaunchOptions: () => getLaunchOptions()
  },
  // ── Utilities ─────────────────────────────────────────────────────────────
  hasAddon: (slug) => {
    var _a2;
    return (_a2 = manifest == null ? void 0 : manifest.addons.some((a) => a.slug === slug)) != null ? _a2 : false;
  },
  getAddonConfig: async (slug) => {
    try {
      const res = await fetch(`/addon-configs/${slug}.json`);
      if (!res.ok) return null;
      return await res.json();
    } catch (e) {
      return null;
    }
  },
  // ── Events ────────────────────────────────────────────────────────────────
  on: (event, handler) => {
    return bus.on(event, handler);
  },
  off: (event, handler) => {
    bus.off(event, handler);
  },
  emit: (event, data) => {
    bus.emit(event, data);
  },
  // ── Lifecycle ─────────────────────────────────────────────────────────────
  ready: (callback) => {
    if (isReady) {
      callback();
    } else {
      readyCallbacks.push(callback);
    }
  }
};
async function init() {
  var _a2, _b, _c, _d, _e, _f, _g, _h, _i, _j, _k, _l, _m;
  window.QuickApps = bridge;
  try {
    const res = await fetch("/quickapps-manifest.json");
    if (res.ok) {
      manifest = await res.json();
    }
  } catch (e) {
  }
  const activeAddons = (_a2 = manifest == null ? void 0 : manifest.addons.map((a) => a.slug)) != null ? _a2 : [];
  const appCfg = manifest == null ? void 0 : manifest.app;
  const initPromises = [];
  if (activeAddons.includes("whatsapp-bridge")) {
    initPromises.push(initWhatsAppBridge(bus));
  }
  if (activeAddons.includes("bottom-navigation") || activeAddons.includes("advanced-bottom-nav")) {
    initPromises.push(initBottomNavigation(bus));
  }
  if (activeAddons.includes("onboarding-screens")) {
    initPromises.push(initOnboarding(bus));
  }
  if (activeAddons.includes("offer-promo-card")) {
    initPromises.push(initPromoCard(bus));
  }
  if (activeAddons.includes("passcode-lock")) {
    initPromises.push(initPasscodeLock(bus));
  }
  if (activeAddons.includes("top-action-bar")) {
    initPromises.push(initTopActionBar(bus));
  }
  if (activeAddons.includes("ai-chatbot")) {
    initPromises.push(initAiChatbot(bus));
  }
  if (activeAddons.includes("indian-language-overlay")) {
    initPromises.push(initIndianLanguageOverlay(bus));
  }
  if (activeAddons.includes("tawkto")) {
    initPromises.push(initTawkTo());
  }
  if (appCfg == null ? void 0 : appCfg.noInternet) {
    initNoInternetScreen(appCfg.noInternet, bus);
  }
  await Promise.allSettled(initPromises);
  try {
    const cap = window.Capacitor;
    if (cap) {
      const App = (_d = (_b = cap.Plugins) == null ? void 0 : _b.App) != null ? _d : (_c = window.CapacitorPlugins) == null ? void 0 : _c.App;
      if (App == null ? void 0 : App.addListener) {
        App.addListener("appStateChange", ({ isActive }) => {
          bus.emit(isActive ? "resume" : "pause", void 0);
        });
        App.addListener("backButton", () => {
          bus.emit("backButton", void 0);
        });
        App.addListener("appUrlOpen", ({ url }) => {
          bus.emit("deepLink", { url });
        });
      }
      const Network = (_g = (_e = cap.Plugins) == null ? void 0 : _e.Network) != null ? _g : (_f = window.CapacitorPlugins) == null ? void 0 : _f.Network;
      if (Network == null ? void 0 : Network.addListener) {
        Network.addListener("networkStatusChange", (status) => {
          bus.emit("networkChange", status);
        });
      }
      const Keyboard = (_j = (_h = cap.Plugins) == null ? void 0 : _h.Keyboard) != null ? _j : (_i = window.CapacitorPlugins) == null ? void 0 : _i.Keyboard;
      if (Keyboard == null ? void 0 : Keyboard.addListener) {
        Keyboard.addListener("keyboardWillShow", ({ keyboardHeight }) => {
          bus.emit("keyboardShow", { height: keyboardHeight });
        });
        Keyboard.addListener("keyboardWillHide", () => {
          bus.emit("keyboardHide", void 0);
        });
      }
      const Push = (_m = (_k = cap.Plugins) == null ? void 0 : _k.PushNotifications) != null ? _m : (_l = window.CapacitorPlugins) == null ? void 0 : _l.PushNotifications;
      if (Push == null ? void 0 : Push.addListener) {
        Push.addListener("pushNotificationReceived", (notification) => {
          bus.emit("notification", notification);
        });
        Push.addListener("pushNotificationActionPerformed", (action) => {
          bus.emit("notificationAction", action);
        });
      }
    }
  } catch (e) {
  }
  isReady = true;
  readyCallbacks.forEach((cb) => {
    try {
      cb();
    } catch (e) {
    }
  });
  readyCallbacks.length = 0;
  bus.emit("ready", void 0);
  if (false) {
    console.log(
      `%c[QuickApps Bridge] v1.0.0 initialized \u2014 platform: ${getPlatform()}, addons: ${activeAddons.length}`,
      "color: #F97316; font-weight: bold;"
    );
  }
}
init().catch(console.error);
//# sourceMappingURL=quickapps-bridge.umd.js.map
