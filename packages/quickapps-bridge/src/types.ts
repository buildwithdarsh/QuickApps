// ─────────────────────────────────────────────────────────────────────────────
// QuickApps Bridge — Public Type Definitions
// ─────────────────────────────────────────────────────────────────────────────

export type Platform = 'android' | 'ios' | 'web';

export interface DeviceInfo {
  platform: Platform;
  model: string;
  osVersion: string;
  appVersion: string;
  appBuild: string;
  isVirtual: boolean;
  batteryLevel?: number;
  isCharging?: boolean;
}

export interface NetworkStatus {
  connected: boolean;
  connectionType: 'wifi' | 'cellular' | 'none' | 'unknown';
}

export interface NotificationPermission {
  granted: boolean;
}

export interface ScheduledNotification {
  id?: number;
  title: string;
  body: string;
  /** ISO datetime or repeat schedule */
  at?: string;
  every?: 'minute' | 'hour' | 'day' | 'week' | 'month';
  data?: Record<string, unknown>;
  iconColor?: string;
  sound?: string;
}

export interface BiometricOptions {
  title?: string;
  subtitle?: string;
  description?: string;
  fallbackTitle?: string;
  negativeButtonText?: string;
}

export interface BiometricResult {
  verified: boolean;
  error?: string;
}

export interface ScanResult {
  text: string;
  format: string;
}

export interface PhotoResult {
  dataUrl: string;
  format: string;
  saved: boolean;
}

export interface ShareOptions {
  title?: string;
  text?: string;
  url?: string;
  dialogTitle?: string;
}

export interface RazorpayOptions {
  key: string;
  amount: number;
  currency?: string;
  name: string;
  description?: string;
  orderId?: string;
  prefill?: {
    name?: string;
    email?: string;
    contact?: string;
  };
  theme?: { color?: string };
}

export interface RazorpayResult {
  razorpay_payment_id: string;
  razorpay_order_id?: string;
  razorpay_signature?: string;
}

export interface BottomTab {
  id: string;
  label: string;
  icon: string;
  url: string;
  badge?: number;
}

export interface DrawerItem {
  id: string;
  label: string;
  icon?: string;
  url?: string;
  divider?: boolean;
}

export interface FloatingActionItem {
  id: string;
  label?: string;
  icon: string;
  color?: string;
  url?: string;
  action?: string;
}

export interface OnboardingScreen {
  title: string;
  subtitle?: string;
  imageUrl?: string;
  backgroundColor?: string;
  textColor?: string;
}

export interface PromoCardOptions {
  title: string;
  imageUrl?: string;
  ctaText?: string;
  ctaUrl?: string;
  dismissible?: boolean;
}

export interface ClipboardResult {
  value: string;
  type: 'text/plain' | 'text/html' | 'image/png';
}

export interface StorageValue {
  value: string | null;
}

export interface AppLaunchOptions {
  url?: string;
  source?: string;
}

export type BridgeEventMap = {
  'ready': void;
  'resume': void;
  'pause': void;
  'backButton': void;
  'deepLink': { url: string };
  'notification': { id: string; title: string; body: string; data?: Record<string, unknown> };
  'notificationAction': { actionId: string; inputValue?: string };
  'networkChange': NetworkStatus;
  'keyboardShow': { height: number };
  'keyboardHide': void;
  'drawerItemSelect': { id: string };
  'bottomTabSelect': { id: string };
  'fabAction': { id: string };
  'onboardingComplete': void;
  'onboardingSkip': void;
  'promoCardCta': { url: string };
  'promoCardDismiss': void;
  'paymentSuccess': RazorpayResult;
  'paymentFailure': { code: string; description: string };
  'biometricResult': BiometricResult;
  'scanResult': ScanResult;
  'socialLoginResult': { provider: string; userId: string; token: string };
};

export type BridgeEvent = keyof BridgeEventMap;
export type BridgeEventHandler<E extends BridgeEvent> = (data: BridgeEventMap[E]) => void;

export interface QuickAppsManifest {
  version: number;
  generatedAt: string;
  app: {
    jsBridgeEnabled: boolean;
    pullToRefresh: boolean;
    pinchToZoom: boolean;
    disableScreenshots: boolean;
    disableCaching: boolean;
    clipboardControl: boolean;
    sslEnforcement: boolean;
    customUserAgent?: string;
    noInternet?: {
      headingText?: string;
      bodyText?: string;
      retryButtonLabel?: string;
      retryButtonColor?: string;
    };
  };
  addons: Array<{
    slug: string;
    category: string;
    hasConfig: boolean;
    configFile: string;
    capacitorPlugin: string | null;
  }>;
}

// ── Public Bridge API ──────────────────────────────────────────────────────

export interface QuickAppsDevice {
  getInfo(): Promise<DeviceInfo>;
  getNetworkStatus(): Promise<NetworkStatus>;
  openAppSettings(): Promise<void>;
  share(options: ShareOptions): Promise<void>;
  vibrate(duration?: number): Promise<void>;
  keepScreenOn(enabled: boolean): Promise<void>;
  setStatusBarStyle(style: 'light' | 'dark', color?: string): Promise<void>;
  hideStatusBar(): Promise<void>;
  showStatusBar(): Promise<void>;
}

export interface QuickAppsNotifications {
  requestPermission(): Promise<NotificationPermission>;
  hasPermission(): Promise<NotificationPermission>;
  schedule(notification: ScheduledNotification): Promise<{ id: number }>;
  cancel(ids: number[]): Promise<void>;
  getPending(): Promise<ScheduledNotification[]>;
  setBadgeCount(count: number): Promise<void>;
  clearBadge(): Promise<void>;
}

export interface QuickAppsCamera {
  takePhoto(options?: { quality?: number; saveToGallery?: boolean }): Promise<PhotoResult>;
  pickFromGallery(options?: { quality?: number }): Promise<PhotoResult>;
  scan(options?: { formats?: string }): Promise<ScanResult>;
}

export interface QuickAppsBiometric {
  isAvailable(): Promise<boolean>;
  authenticate(options?: BiometricOptions): Promise<BiometricResult>;
}

export interface QuickAppsClipboard {
  read(): Promise<ClipboardResult>;
  write(text: string): Promise<void>;
}

export interface QuickAppsStorage {
  get(key: string): Promise<StorageValue>;
  set(key: string, value: string): Promise<void>;
  remove(key: string): Promise<void>;
  clear(): Promise<void>;
  keys(): Promise<string[]>;
}

export interface QuickAppsNavigation {
  setBottomTabs(tabs: BottomTab[]): void;
  updateBadge(tabId: string, count: number): void;
  showSideDrawer(): void;
  hideSideDrawer(): void;
  toggleSideDrawer(): void;
  goBack(): void;
  navigateTo(url: string): void;
  reload(): void;
}

export interface QuickAppsPayments {
  openRazorpay(options: RazorpayOptions): Promise<RazorpayResult>;
}

export interface QuickAppsAnalytics {
  track(event: string, properties?: Record<string, unknown>): void;
  identify(userId: string, traits?: Record<string, unknown>): void;
  screen(name: string, properties?: Record<string, unknown>): void;
  reset(): void;
}

export interface QuickAppsWhatsApp {
  open(phone: string, message?: string): void;
  isInstalled(): Promise<boolean>;
}

export interface QuickAppsDeepLinks {
  open(url: string): Promise<void>;
  getLaunchOptions(): Promise<AppLaunchOptions>;
}

export interface QuickAppsBridge {
  readonly version: string;
  readonly isNative: boolean;
  readonly platform: Platform;
  readonly addons: string[];
  readonly manifest: QuickAppsManifest | null;

  // Namespaces
  device: QuickAppsDevice;
  notifications: QuickAppsNotifications;
  camera: QuickAppsCamera;
  biometric: QuickAppsBiometric;
  clipboard: QuickAppsClipboard;
  storage: QuickAppsStorage;
  navigation: QuickAppsNavigation;
  payments: QuickAppsPayments;
  analytics: QuickAppsAnalytics;
  whatsapp: QuickAppsWhatsApp;
  links: QuickAppsDeepLinks;

  // Utilities
  hasAddon(slug: string): boolean;
  getAddonConfig<T = Record<string, unknown>>(slug: string): Promise<T | null>;

  // Event system
  on<E extends BridgeEvent>(event: E, handler: BridgeEventHandler<E>): () => void;
  off<E extends BridgeEvent>(event: E, handler: BridgeEventHandler<E>): void;
  emit<E extends BridgeEvent>(event: E, data: BridgeEventMap[E]): void;

  // Lifecycle
  ready(callback: () => void): void;
}

declare global {
  interface Window {
    QuickApps: QuickAppsBridge;
    Capacitor?: {
      isNativePlatform(): boolean;
      getPlatform(): string;
    };
  }
}
