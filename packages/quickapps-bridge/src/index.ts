// ─────────────────────────────────────────────────────────────────────────────
// QuickApps Bridge — Entry Point
// Initializes window.QuickApps with the full native API
// Auto-reads quickapps-manifest.json to activate the right addons
// ─────────────────────────────────────────────────────────────────────────────

import { EventBus } from './events';
import type {
  QuickAppsBridge, QuickAppsManifest, Platform,
  DeviceInfo, NetworkStatus, NotificationPermission, ScheduledNotification,
  BiometricOptions, BiometricResult, ScanResult, PhotoResult, ShareOptions,
  ClipboardResult, StorageValue, AppLaunchOptions, BottomTab, RazorpayOptions, RazorpayResult,
  BridgeEvent, BridgeEventHandler, BridgeEventMap,
} from './types';
import {
  getDeviceInfo, getNetworkStatus, openAppSettings, shareContent, vibrate,
  keepScreenOn, setStatusBarStyle, hideStatusBar, showStatusBar,
  requestNotificationPermission, hasNotificationPermission, scheduleNotification,
  cancelNotifications, getPendingNotifications, setBadgeCount,
  takePhoto, pickFromGallery, scanBarcode,
  isBiometricAvailable, authenticateBiometric,
  readClipboard, writeClipboard,
  storageGet, storageSet, storageRemove, storageClear, storageKeys,
  openUrl, getLaunchOptions,
  openWhatsApp, isWhatsAppInstalled,
  openRazorpay,
} from './capacitor';
import {
  initWhatsAppBridge, initBottomNavigation, initOnboarding, initPromoCard,
  initPasscodeLock, initTopActionBar, initAiChatbot, initIndianLanguageOverlay,
  initTawkTo, initNoInternetScreen,
} from './addons';

// ─────────────────────────────────────────────────────────────────────────────

const bus = new EventBus();
let manifest: QuickAppsManifest | null = null;
let isReady = false;
const readyCallbacks: Array<() => void> = [];

function getPlatform(): Platform {
  if (typeof window === 'undefined') return 'web';
  const cap = window.Capacitor;
  if (!cap?.isNativePlatform()) return 'web';
  return cap.getPlatform() as Platform;
}

const isNative = typeof window !== 'undefined' && !!window.Capacitor?.isNativePlatform();

// ─────────────────────────────────────────────────────────────────────────────
// Core bridge object
// ─────────────────────────────────────────────────────────────────────────────

const bridge: QuickAppsBridge = {
  get version() { return '1.0.0'; },
  get isNative() { return isNative; },
  get platform() { return getPlatform(); },
  get addons() { return manifest?.addons.map(a => a.slug) ?? []; },
  get manifest() { return manifest; },

  // ── Device ────────────────────────────────────────────────────────────────
  device: {
    getInfo: (): Promise<DeviceInfo> => getDeviceInfo(),
    getNetworkStatus: (): Promise<NetworkStatus> => getNetworkStatus(),
    openAppSettings: (): Promise<void> => openAppSettings(),
    share: (options: ShareOptions): Promise<void> => shareContent(options),
    vibrate: (duration?: number): Promise<void> => vibrate(duration),
    keepScreenOn: (enabled: boolean): Promise<void> => keepScreenOn(enabled),
    setStatusBarStyle: (style: 'light' | 'dark', color?: string): Promise<void> => setStatusBarStyle(style, color),
    hideStatusBar: (): Promise<void> => hideStatusBar(),
    showStatusBar: (): Promise<void> => showStatusBar(),
  },

  // ── Notifications ─────────────────────────────────────────────────────────
  notifications: {
    requestPermission: (): Promise<NotificationPermission> => requestNotificationPermission(),
    hasPermission: (): Promise<NotificationPermission> => hasNotificationPermission(),
    schedule: (notification: ScheduledNotification): Promise<{ id: number }> => scheduleNotification(notification),
    cancel: (ids: number[]): Promise<void> => cancelNotifications(ids),
    getPending: (): Promise<ScheduledNotification[]> => getPendingNotifications(),
    setBadgeCount: (count: number): Promise<void> => setBadgeCount(count),
    clearBadge: (): Promise<void> => setBadgeCount(0),
  },

  // ── Camera / QR ───────────────────────────────────────────────────────────
  camera: {
    takePhoto: (options?: { quality?: number; saveToGallery?: boolean }): Promise<PhotoResult> => takePhoto(options),
    pickFromGallery: (options?: { quality?: number }): Promise<PhotoResult> => pickFromGallery(options),
    scan: (options?: { formats?: string }): Promise<ScanResult> => scanBarcode(options),
  },

  // ── Biometric ─────────────────────────────────────────────────────────────
  biometric: {
    isAvailable: (): Promise<boolean> => isBiometricAvailable(),
    authenticate: (options?: BiometricOptions): Promise<BiometricResult> => authenticateBiometric(options),
  },

  // ── Clipboard ─────────────────────────────────────────────────────────────
  clipboard: {
    read: (): Promise<ClipboardResult> => readClipboard(),
    write: (text: string): Promise<void> => writeClipboard(text),
  },

  // ── Storage ───────────────────────────────────────────────────────────────
  storage: {
    get: (key: string): Promise<StorageValue> => storageGet(key),
    set: (key: string, value: string): Promise<void> => storageSet(key, value),
    remove: (key: string): Promise<void> => storageRemove(key),
    clear: (): Promise<void> => storageClear(),
    keys: (): Promise<string[]> => storageKeys(),
  },

  // ── Navigation ────────────────────────────────────────────────────────────
  navigation: {
    setBottomTabs: (tabs: BottomTab[]): void => {
      bus.emit('bottomTabSelect', { id: tabs[0]?.id ?? '' });
    },
    updateBadge: (_tabId: string, _count: number): void => {
      // Implemented by bottom-nav addon init
    },
    showSideDrawer: (): void => {
      const drawer = document.getElementById('qa-side-drawer');
      if (drawer) drawer.style.transform = 'translateX(0)';
    },
    hideSideDrawer: (): void => {
      const drawer = document.getElementById('qa-side-drawer');
      if (drawer) drawer.style.transform = 'translateX(-100%)';
    },
    toggleSideDrawer: (): void => {
      const drawer = document.getElementById('qa-side-drawer');
      if (drawer) {
        const isOpen = drawer.style.transform === 'translateX(0)';
        drawer.style.transform = isOpen ? 'translateX(-100%)' : 'translateX(0)';
      }
    },
    goBack: (): void => window.history.back(),
    navigateTo: (url: string): void => { window.location.href = url; },
    reload: (): void => window.location.reload(),
  },

  // ── Payments ──────────────────────────────────────────────────────────────
  payments: {
    openRazorpay: (options: RazorpayOptions): Promise<RazorpayResult> => openRazorpay(options),
  },

  // ── Analytics ─────────────────────────────────────────────────────────────
  analytics: {
    track: (event: string, properties?: Record<string, unknown>): void => {
      // Try multiple analytics providers in order of priority
      try {
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const w = window as any;
        if (w.mixpanel?.track) w.mixpanel.track(event, properties);
        if (w.amplitude?.track) w.amplitude.track(event, properties);
        if (w.gtag) w.gtag('event', event, properties);
        if (w.fbq) w.fbq('trackCustom', event, properties);
      } catch {}
    },
    identify: (userId: string, traits?: Record<string, unknown>): void => {
      try {
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const w = window as any;
        if (w.mixpanel?.identify) { w.mixpanel.identify(userId); if (traits) w.mixpanel.people.set(traits); }
        if (w.amplitude?.setUserId) w.amplitude.setUserId(userId);
      } catch {}
    },
    screen: (name: string, properties?: Record<string, unknown>): void => {
      try {
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const w = window as any;
        if (w.mixpanel?.track) w.mixpanel.track(`Screen: ${name}`, properties);
        if (w.gtag) w.gtag('event', 'screen_view', { screen_name: name, ...properties });
      } catch {}
    },
    reset: (): void => {
      try {
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const w = window as any;
        if (w.mixpanel?.reset) w.mixpanel.reset();
        if (w.amplitude?.reset) w.amplitude.reset();
      } catch {}
    },
  },

  // ── WhatsApp ──────────────────────────────────────────────────────────────
  whatsapp: {
    open: (phone: string, message?: string): void => openWhatsApp(phone, message),
    isInstalled: (): Promise<boolean> => isWhatsAppInstalled(),
  },

  // ── Deep Links ────────────────────────────────────────────────────────────
  links: {
    open: (url: string): Promise<void> => openUrl(url),
    getLaunchOptions: (): Promise<AppLaunchOptions> => getLaunchOptions(),
  },

  // ── Utilities ─────────────────────────────────────────────────────────────
  hasAddon: (slug: string): boolean => {
    return manifest?.addons.some(a => a.slug === slug) ?? false;
  },

  getAddonConfig: async <T = Record<string, unknown>>(slug: string): Promise<T | null> => {
    try {
      const res = await fetch(`/addon-configs/${slug}.json`);
      if (!res.ok) return null;
      return await res.json() as T;
    } catch {
      return null;
    }
  },

  // ── Events ────────────────────────────────────────────────────────────────
  on: <E extends BridgeEvent>(event: E, handler: BridgeEventHandler<E>): () => void => {
    return bus.on(event, handler);
  },

  off: <E extends BridgeEvent>(event: E, handler: BridgeEventHandler<E>): void => {
    bus.off(event, handler);
  },

  emit: <E extends BridgeEvent>(event: E, data: BridgeEventMap[E]): void => {
    bus.emit(event, data);
  },

  // ── Lifecycle ─────────────────────────────────────────────────────────────
  ready: (callback: () => void): void => {
    if (isReady) {
      callback();
    } else {
      readyCallbacks.push(callback);
    }
  },
};

// ─────────────────────────────────────────────────────────────────────────────
// Initialization
// ─────────────────────────────────────────────────────────────────────────────

async function init(): Promise<void> {
  // Attach to window immediately (allows calling bridge.ready() before init)
  window.QuickApps = bridge;

  // Load manifest
  try {
    const res = await fetch('/quickapps-manifest.json');
    if (res.ok) {
      manifest = await res.json() as QuickAppsManifest;
    }
  } catch {
    // Not in a QuickApps build — running on web directly
  }

  const activeAddons = manifest?.addons.map(a => a.slug) ?? [];
  const appCfg = manifest?.app;

  // ── Init active addons ─────────────────────────────────────────────────────

  const initPromises: Promise<void>[] = [];

  if (activeAddons.includes('whatsapp-bridge')) {
    initPromises.push(initWhatsAppBridge(bus));
  }

  if (activeAddons.includes('bottom-navigation') || activeAddons.includes('advanced-bottom-nav')) {
    initPromises.push(initBottomNavigation(bus));
  }

  if (activeAddons.includes('onboarding-screens')) {
    initPromises.push(initOnboarding(bus));
  }

  if (activeAddons.includes('offer-promo-card')) {
    initPromises.push(initPromoCard(bus));
  }

  if (activeAddons.includes('passcode-lock')) {
    initPromises.push(initPasscodeLock(bus));
  }

  if (activeAddons.includes('top-action-bar')) {
    initPromises.push(initTopActionBar(bus));
  }

  if (activeAddons.includes('ai-chatbot')) {
    initPromises.push(initAiChatbot(bus));
  }

  if (activeAddons.includes('indian-language-overlay')) {
    initPromises.push(initIndianLanguageOverlay(bus));
  }

  if (activeAddons.includes('tawkto')) {
    initPromises.push(initTawkTo());
  }

  // No-internet screen (always active if bridge is loaded)
  if (appCfg?.noInternet) {
    initNoInternetScreen(appCfg.noInternet, bus);
  }

  // Wait for non-critical addon inits
  await Promise.allSettled(initPromises);

  // ── Setup Capacitor event listeners ───────────────────────────────────────

  try {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const cap = (window as any).Capacitor;
    if (cap) {
      // App state changes
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const App = cap.Plugins?.App ?? (window as any).CapacitorPlugins?.App;
      if (App?.addListener) {
        App.addListener('appStateChange', ({ isActive }: { isActive: boolean }) => {
          bus.emit(isActive ? 'resume' : 'pause', undefined);
        });
        App.addListener('backButton', () => {
          bus.emit('backButton', undefined);
        });
        App.addListener('appUrlOpen', ({ url }: { url: string }) => {
          bus.emit('deepLink', { url });
        });
      }

      // Network changes
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const Network = cap.Plugins?.Network ?? (window as any).CapacitorPlugins?.Network;
      if (Network?.addListener) {
        Network.addListener('networkStatusChange', (status: NetworkStatus) => {
          bus.emit('networkChange', status);
        });
      }

      // Keyboard
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const Keyboard = cap.Plugins?.Keyboard ?? (window as any).CapacitorPlugins?.Keyboard;
      if (Keyboard?.addListener) {
        Keyboard.addListener('keyboardWillShow', ({ keyboardHeight }: { keyboardHeight: number }) => {
          bus.emit('keyboardShow', { height: keyboardHeight });
        });
        Keyboard.addListener('keyboardWillHide', () => {
          bus.emit('keyboardHide', undefined);
        });
      }

      // Push notifications
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const Push = cap.Plugins?.PushNotifications ?? (window as any).CapacitorPlugins?.PushNotifications;
      if (Push?.addListener) {
        Push.addListener('pushNotificationReceived', (notification: { id: string; title: string; body: string; data?: Record<string, unknown> }) => {
          bus.emit('notification', notification);
        });
        Push.addListener('pushNotificationActionPerformed', (action: { actionId: string; inputValue?: string }) => {
          bus.emit('notificationAction', action);
        });
      }
    }
  } catch {
    // Capacitor not available
  }

  // ── Mark as ready ──────────────────────────────────────────────────────────

  isReady = true;
  readyCallbacks.forEach(cb => { try { cb(); } catch {} });
  readyCallbacks.length = 0;
  bus.emit('ready', undefined);

  if (process.env['NODE_ENV'] !== 'production') {
    console.log(
      `%c[QuickApps Bridge] v1.0.0 initialized — platform: ${getPlatform()}, addons: ${activeAddons.length}`,
      'color: #F97316; font-weight: bold;',
    );
  }
}

// Auto-initialize
init().catch(console.error);

export { bridge as QuickApps };
export type { QuickAppsBridge, QuickAppsManifest, Platform };
export * from './types';
