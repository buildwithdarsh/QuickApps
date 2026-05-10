// ─────────────────────────────────────────────────────────────────────────────
// Capacitor Plugin Wrappers
// These wrap the raw Capacitor plugin calls with a clean async/await API
// In non-native environments they gracefully no-op or return stubs
// ─────────────────────────────────────────────────────────────────────────────

import type {
  DeviceInfo, NetworkStatus, NotificationPermission, ScheduledNotification,
  BiometricOptions, BiometricResult, ScanResult, PhotoResult, ShareOptions,
  ClipboardResult, StorageValue, AppLaunchOptions,
} from './types';

const isNative = (): boolean =>
  typeof window !== 'undefined' &&
  typeof window.Capacitor !== 'undefined' &&
  window.Capacitor.isNativePlatform();

// Safely get a Capacitor plugin
function plugin(name: string): Record<string, unknown> | null {
  try {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const cap = (window as any).Capacitor;
    if (!cap) return null;
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const Plugins = (window as any).CapacitorPlugins ?? cap.Plugins ?? {};
    return Plugins[name] ?? null;
  } catch {
    return null;
  }
}

// ── Device ────────────────────────────────────────────────────────────────────

export async function getDeviceInfo(): Promise<DeviceInfo> {
  const p = plugin('Device');
  if (p?.getInfo) {
    const info = await (p.getInfo as () => Promise<DeviceInfo>)();
    return info;
  }
  return {
    platform: 'web',
    model: navigator.userAgent,
    osVersion: navigator.appVersion,
    appVersion: '1.0.0',
    appBuild: '1',
    isVirtual: false,
  };
}

export async function getNetworkStatus(): Promise<NetworkStatus> {
  const p = plugin('Network');
  if (p?.getStatus) {
    return (p.getStatus as () => Promise<NetworkStatus>)();
  }
  return { connected: navigator.onLine, connectionType: navigator.onLine ? 'wifi' : 'none' };
}

export async function openAppSettings(): Promise<void> {
  const p = plugin('NativeSettings');
  if (p?.open) await (p.open as (opts: { option: string }) => Promise<void>)({ option: 'application_details' });
}

export async function shareContent(options: ShareOptions): Promise<void> {
  const p = plugin('Share');
  if (p?.share) {
    await (p.share as (opts: ShareOptions) => Promise<void>)(options);
    return;
  }
  // Fallback to Web Share API
  if (navigator.share) await navigator.share(options);
}

export async function vibrate(duration = 300): Promise<void> {
  const p = plugin('Haptics');
  if (p?.vibrate) {
    await (p.vibrate as (opts: { duration: number }) => Promise<void>)({ duration });
    return;
  }
  if (navigator.vibrate) navigator.vibrate(duration);
}

export async function keepScreenOn(enabled: boolean): Promise<void> {
  const p = plugin('KeepAwake');
  if (enabled && p?.keepAwake) await (p.keepAwake as () => Promise<void>)();
  if (!enabled && p?.allowSleep) await (p.allowSleep as () => Promise<void>)();
}

export async function setStatusBarStyle(style: 'light' | 'dark', color?: string): Promise<void> {
  const p = plugin('StatusBar');
  if (!p) return;
  if (p.setStyle) await (p.setStyle as (opts: { style: string }) => Promise<void>)({ style: style.toUpperCase() });
  if (color && p.setBackgroundColor) await (p.setBackgroundColor as (opts: { color: string }) => Promise<void>)({ color });
}

export async function hideStatusBar(): Promise<void> {
  const p = plugin('StatusBar');
  if (p?.hide) await (p.hide as () => Promise<void>)();
}

export async function showStatusBar(): Promise<void> {
  const p = plugin('StatusBar');
  if (p?.show) await (p.show as () => Promise<void>)();
}

// ── Notifications ─────────────────────────────────────────────────────────────

export async function requestNotificationPermission(): Promise<NotificationPermission> {
  const p = plugin('LocalNotifications');
  if (p?.requestPermissions) {
    return (p.requestPermissions as () => Promise<NotificationPermission>)();
  }
  if ('Notification' in window) {
    const result = await Notification.requestPermission();
    return { granted: result === 'granted' };
  }
  return { granted: false };
}

export async function hasNotificationPermission(): Promise<NotificationPermission> {
  const p = plugin('LocalNotifications');
  if (p?.checkPermissions) {
    return (p.checkPermissions as () => Promise<NotificationPermission>)();
  }
  return { granted: Notification?.permission === 'granted' };
}

export async function scheduleNotification(notification: ScheduledNotification): Promise<{ id: number }> {
  const p = plugin('LocalNotifications');
  const id = notification.id ?? Math.floor(Math.random() * 100000);

  if (p?.schedule) {
    await (p.schedule as (opts: { notifications: unknown[] }) => Promise<void>)({
      notifications: [{
        id,
        title: notification.title,
        body: notification.body,
        schedule: notification.at ? { at: new Date(notification.at) } :
                  notification.every ? { every: notification.every } : undefined,
        extra: notification.data,
        iconColor: notification.iconColor,
        sound: notification.sound,
      }],
    });
  }
  return { id };
}

export async function cancelNotifications(ids: number[]): Promise<void> {
  const p = plugin('LocalNotifications');
  if (p?.cancel) await (p.cancel as (opts: { notifications: { id: number }[] }) => Promise<void>)({ notifications: ids.map(id => ({ id })) });
}

export async function getPendingNotifications(): Promise<ScheduledNotification[]> {
  const p = plugin('LocalNotifications');
  if (p?.getPending) {
    const result = await (p.getPending as () => Promise<{ notifications: ScheduledNotification[] }>)();
    return result.notifications;
  }
  return [];
}

export async function setBadgeCount(count: number): Promise<void> {
  const p = plugin('Badge') ?? plugin('App');
  if (p?.set) await (p.set as (opts: { count: number }) => Promise<void>)({ count });
}

// ── Camera / QR ───────────────────────────────────────────────────────────────

export async function takePhoto(options: { quality?: number; saveToGallery?: boolean } = {}): Promise<PhotoResult> {
  const p = plugin('Camera');
  if (p?.getPhoto) {
    const result = await (p.getPhoto as (opts: Record<string, unknown>) => Promise<{ dataUrl: string; format: string; saved: boolean }>)({
      resultType: 'dataUrl',
      quality: options.quality ?? 90,
      saveToGallery: options.saveToGallery ?? false,
      source: 'CAMERA',
    });
    return result;
  }
  throw new Error('Camera not available');
}

export async function pickFromGallery(options: { quality?: number } = {}): Promise<PhotoResult> {
  const p = plugin('Camera');
  if (p?.getPhoto) {
    const result = await (p.getPhoto as (opts: Record<string, unknown>) => Promise<PhotoResult>)({
      resultType: 'dataUrl',
      quality: options.quality ?? 90,
      source: 'PHOTOS',
    });
    return result;
  }
  throw new Error('Gallery not available');
}

export async function scanBarcode(options: { formats?: string } = {}): Promise<ScanResult> {
  const p = plugin('BarcodeScanner') ?? plugin('MLKitBarcodeScanning');
  if (p?.scan) {
    const result = await (p.scan as (opts: Record<string, unknown>) => Promise<ScanResult>)(options);
    return result;
  }
  throw new Error('Barcode scanner not available');
}

// ── Biometric ─────────────────────────────────────────────────────────────────

export async function isBiometricAvailable(): Promise<boolean> {
  const p = plugin('BiometricAuth') ?? plugin('FingerprintAIO');
  if (!p?.isAvailable) return false;
  try {
    await (p.isAvailable as () => Promise<void>)();
    return true;
  } catch {
    return false;
  }
}

export async function authenticateBiometric(options: BiometricOptions = {}): Promise<BiometricResult> {
  const p = plugin('BiometricAuth') ?? plugin('FingerprintAIO');
  if (!p) return { verified: false, error: 'Biometric auth not available' };
  try {
    await (p.verify as (opts: BiometricOptions) => Promise<void>)(options);
    return { verified: true };
  } catch (e) {
    return { verified: false, error: (e as Error).message };
  }
}

// ── Clipboard ─────────────────────────────────────────────────────────────────

export async function readClipboard(): Promise<ClipboardResult> {
  const p = plugin('Clipboard');
  if (p?.read) {
    return (p.read as () => Promise<ClipboardResult>)();
  }
  if (navigator.clipboard?.readText) {
    const text = await navigator.clipboard.readText();
    return { value: text, type: 'text/plain' };
  }
  return { value: '', type: 'text/plain' };
}

export async function writeClipboard(text: string): Promise<void> {
  const p = plugin('Clipboard');
  if (p?.write) {
    await (p.write as (opts: { string: string }) => Promise<void>)({ string: text });
    return;
  }
  if (navigator.clipboard?.writeText) {
    await navigator.clipboard.writeText(text);
  }
}

// ── Storage (Preferences) ─────────────────────────────────────────────────────

export async function storageGet(key: string): Promise<StorageValue> {
  const p = plugin('Preferences') ?? plugin('Storage');
  if (p?.get) {
    return (p.get as (opts: { key: string }) => Promise<StorageValue>)({ key });
  }
  return { value: localStorage.getItem(key) };
}

export async function storageSet(key: string, value: string): Promise<void> {
  const p = plugin('Preferences') ?? plugin('Storage');
  if (p?.set) {
    await (p.set as (opts: { key: string; value: string }) => Promise<void>)({ key, value });
    return;
  }
  localStorage.setItem(key, value);
}

export async function storageRemove(key: string): Promise<void> {
  const p = plugin('Preferences') ?? plugin('Storage');
  if (p?.remove) {
    await (p.remove as (opts: { key: string }) => Promise<void>)({ key });
    return;
  }
  localStorage.removeItem(key);
}

export async function storageClear(): Promise<void> {
  const p = plugin('Preferences') ?? plugin('Storage');
  if (p?.clear) { await (p.clear as () => Promise<void>)(); return; }
  localStorage.clear();
}

export async function storageKeys(): Promise<string[]> {
  const p = plugin('Preferences') ?? plugin('Storage');
  if (p?.keys) {
    const result = await (p.keys as () => Promise<{ keys: string[] }>)();
    return result.keys;
  }
  return Object.keys(localStorage);
}

// ── Deep Links ────────────────────────────────────────────────────────────────

export async function openUrl(url: string): Promise<void> {
  const p = plugin('Browser');
  if (p?.open) {
    await (p.open as (opts: { url: string }) => Promise<void>)({ url });
    return;
  }
  window.open(url, '_blank');
}

export async function getLaunchOptions(): Promise<AppLaunchOptions> {
  const p = plugin('App');
  if (p?.getLaunchUrl) {
    const result = await (p.getLaunchUrl as () => Promise<{ url: string } | null>)();
    return { url: result?.url };
  }
  return { url: undefined };
}

// ── WhatsApp ──────────────────────────────────────────────────────────────────

export function openWhatsApp(phone: string, message?: string): void {
  const cleaned = phone.replace(/[^0-9+]/g, '');
  const base = `https://wa.me/${cleaned}`;
  const url = message ? `${base}?text=${encodeURIComponent(message)}` : base;
  window.open(url, '_blank');
}

export async function isWhatsAppInstalled(): Promise<boolean> {
  if (!isNative()) return false;
  const p = plugin('App');
  if (p?.canOpenUrl) {
    const result = await (p.canOpenUrl as (opts: { url: string }) => Promise<{ value: boolean }>)({ url: 'whatsapp://' });
    return result.value;
  }
  return false;
}

// ── Razorpay ──────────────────────────────────────────────────────────────────

import type { RazorpayOptions, RazorpayResult } from './types';

export async function openRazorpay(options: RazorpayOptions): Promise<RazorpayResult> {
  // Try native Razorpay plugin first
  const p = plugin('Razorpay');
  if (p?.open) {
    return (p.open as (opts: RazorpayOptions) => Promise<RazorpayResult>)(options);
  }

  // Fallback: load Razorpay web SDK
  return new Promise((resolve, reject) => {
    const script = document.createElement('script');
    script.src = 'https://checkout.razorpay.com/v1/checkout.js';
    script.onload = () => {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const rzp = new (window as any).Razorpay({
        ...options,
        handler: (response: RazorpayResult) => resolve(response),
        modal: { ondismiss: () => reject(new Error('Payment dismissed')) },
      });
      rzp.open();
    };
    script.onerror = () => reject(new Error('Failed to load Razorpay'));
    document.head.appendChild(script);
  });
}
