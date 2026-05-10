export interface AddonDefinition {
  slug: string;
  name: string;
  description: string;
  price: number; // in paise
  category: string;
  platforms: ('android' | 'ios')[];
  indiaExclusive?: boolean;
  capacitorPlugin?: string; // Capacitor plugin package name
  configSchema: Record<string, { type: string; required: boolean; label: string; options?: string[] }>;
}

export const ADDON_CATALOG: AddonDefinition[] = [
  // ═══════════════════════════════════════════════════════════════════════
  // PUSH NOTIFICATIONS
  // ═══════════════════════════════════════════════════════════════════════
  {
    slug: 'onesignal-push',
    name: 'OneSignal Push Notifications',
    description: 'Advanced push with segmentation, A/B testing, automation, and rich media. Paste one key.',
    price: 69900,
    category: 'notifications',
    platforms: ['android', 'ios'],
    capacitorPlugin: 'onesignal-cordova-plugin',
    configSchema: {
      appId: { type: 'string', required: true, label: 'OneSignal App ID' },
      restApiKey: { type: 'string', required: true, label: 'REST API Key' },
      appGroupId: { type: 'string', required: false, label: 'App Group ID (iOS)' },
    },
  },
  {
    slug: 'firebase-notifications',
    name: 'Firebase Cloud Messaging (FCM)',
    description: 'Direct Google Firebase push — topics, device-specific, and segment messaging.',
    price: 79900,
    category: 'notifications',
    platforms: ['android', 'ios'],
    capacitorPlugin: '@capacitor-firebase/messaging',
    configSchema: {
      googleServicesJson: { type: 'file', required: true, label: 'google-services.json (Android)' },
      googleServiceInfoPlist: { type: 'file', required: true, label: 'GoogleService-Info.plist (iOS)' },
    },
  },
  {
    slug: 'custom-notification-sound',
    name: 'Custom Notification Sound',
    description: 'Upload a custom .mp3 or .wav for specific notification types.',
    price: 29900,
    category: 'notifications',
    platforms: ['android', 'ios'],
    configSchema: {
      soundFile: { type: 'file', required: true, label: 'Sound file (.mp3 or .wav)' },
    },
  },
  {
    slug: 'in-app-messaging',
    name: 'In-App Messaging',
    description: 'Rich in-app banners, modals, and cards triggered by user events.',
    price: 49900,
    category: 'notifications',
    platforms: ['android', 'ios'],
    capacitorPlugin: '@capacitor-firebase/in-app-messaging',
    configSchema: {},
  },
  {
    slug: 'sms-deep-link',
    name: 'SMS Deep Link',
    description: 'Trigger app open from SMS links with context-aware parameters.',
    price: 34900,
    category: 'notifications',
    platforms: ['android', 'ios'],
    configSchema: {},
  },

  // ═══════════════════════════════════════════════════════════════════════
  // ANALYTICS & ATTRIBUTION
  // ═══════════════════════════════════════════════════════════════════════
  {
    slug: 'firebase-analytics',
    name: 'Google Firebase Analytics',
    description: 'Full Firebase Analytics — screen views, events, user properties, funnels.',
    price: 79900,
    category: 'analytics',
    platforms: ['android', 'ios'],
    capacitorPlugin: '@capacitor-firebase/analytics',
    configSchema: {
      googleServicesJson: { type: 'file', required: true, label: 'google-services.json' },
      googleServiceInfoPlist: { type: 'file', required: false, label: 'GoogleService-Info.plist (iOS)' },
    },
  },
  {
    slug: 'facebook-app-events',
    name: 'Facebook App Events',
    description: 'Track installs, in-app events, and custom events for Meta Ad attribution.',
    price: 59900,
    category: 'analytics',
    platforms: ['android', 'ios'],
    configSchema: {
      facebookAppId: { type: 'string', required: true, label: 'Facebook App ID' },
      clientToken: { type: 'string', required: true, label: 'Client Token' },
    },
  },
  {
    slug: 'appsflyer',
    name: 'AppsFlyer Mobile Attribution',
    description: 'Industry-standard attribution — installs, re-engagements, LTV, ROI.',
    price: 89900,
    category: 'analytics',
    platforms: ['android', 'ios'],
    configSchema: {
      devKey: { type: 'string', required: true, label: 'AppsFlyer Dev Key' },
      appId: { type: 'string', required: false, label: 'Apple App ID (iOS)' },
    },
  },
  {
    slug: 'mixpanel',
    name: 'Mixpanel',
    description: 'Product analytics — user flows, retention cohorts, funnel analysis.',
    price: 69900,
    category: 'analytics',
    platforms: ['android', 'ios'],
    configSchema: {
      projectToken: { type: 'string', required: true, label: 'Mixpanel Project Token' },
    },
  },
  {
    slug: 'amplitude',
    name: 'Amplitude Analytics',
    description: 'Behavioral analytics — user journeys, feature adoption, retention.',
    price: 69900,
    category: 'analytics',
    platforms: ['android', 'ios'],
    configSchema: {
      apiKey: { type: 'string', required: true, label: 'Amplitude API Key' },
    },
  },
  {
    slug: 'adjust',
    name: 'Adjust',
    description: 'Mobile measurement and fraud prevention. SKAdNetwork support for iOS.',
    price: 89900,
    category: 'analytics',
    platforms: ['android', 'ios'],
    configSchema: {
      appToken: { type: 'string', required: true, label: 'Adjust App Token' },
      environment: { type: 'select', required: true, label: 'Environment', options: ['sandbox', 'production'] },
    },
  },
  {
    slug: 'clarity',
    name: 'Clarity (Microsoft)',
    description: 'Session recordings and heatmaps for in-app behavior analysis.',
    price: 49900,
    category: 'analytics',
    platforms: ['android', 'ios'],
    configSchema: {
      projectId: { type: 'string', required: true, label: 'Clarity Project ID' },
    },
  },

  // ═══════════════════════════════════════════════════════════════════════
  // AUTHENTICATION & SECURITY
  // ═══════════════════════════════════════════════════════════════════════
  {
    slug: 'biometric-auth',
    name: 'Biometric Auth (Touch ID / Face ID / Fingerprint)',
    description: 'Lock app behind biometrics on open or after background timeout.',
    price: 49900,
    category: 'security',
    platforms: ['android', 'ios'],
    capacitorPlugin: 'capacitor-native-biometric',
    configSchema: {
      triggerMode: { type: 'select', required: true, label: 'Trigger', options: ['on_open', 'after_background', 'both'] },
      backgroundTimeoutMin: { type: 'number', required: false, label: 'Background timeout (minutes)' },
      fallback: { type: 'select', required: true, label: 'Fallback', options: ['passcode', 'none'] },
      promptMessage: { type: 'string', required: false, label: 'Biometric prompt message' },
    },
  },
  {
    slug: 'social-login',
    name: 'Social Login (Google / Facebook / Apple)',
    description: 'Native SDK social login — not a WebView popup. Token via JS Bridge.',
    price: 69900,
    category: 'security',
    platforms: ['android', 'ios'],
    configSchema: {
      googleClientId: { type: 'string', required: false, label: 'Google Sign-In Client ID' },
      googleEnabled: { type: 'boolean', required: false, label: 'Enable Google' },
      facebookAppId: { type: 'string', required: false, label: 'Facebook App ID' },
      facebookEnabled: { type: 'boolean', required: false, label: 'Enable Facebook' },
      appleServiceId: { type: 'string', required: false, label: 'Apple Service ID (iOS)' },
      appleEnabled: { type: 'boolean', required: false, label: 'Enable Apple Sign-In' },
      callbackFunctionName: { type: 'string', required: false, label: 'JS Bridge callback function' },
    },
  },
  {
    slug: 'passcode-lock',
    name: 'Passcode Lock (4–6 digit PIN)',
    description: 'Custom PIN lock screen on app open or after inactivity timeout.',
    price: 39900,
    category: 'security',
    platforms: ['android', 'ios'],
    configSchema: {
      pinLength: { type: 'select', required: true, label: 'PIN Length', options: ['4', '5', '6'] },
      inactivityTimeout: { type: 'number', required: false, label: 'Inactivity timeout (minutes)' },
      biometricFallback: { type: 'boolean', required: false, label: 'Allow biometric fallback' },
    },
  },
  {
    slug: 'device-lock',
    name: 'Device Lock (Device PIN / Pattern)',
    description: "Use the device's existing lock screen as the app lock — zero setup.",
    price: 29900,
    category: 'security',
    platforms: ['android'],
    configSchema: {},
  },
  {
    slug: 'ssl-pinning',
    name: 'SSL Certificate Pinning',
    description: 'Pin specific SSL certificates to prevent MITM attacks. For banking/fintech.',
    price: 59900,
    category: 'security',
    platforms: ['android', 'ios'],
    configSchema: {
      certificates: { type: 'file', required: true, label: 'Certificate files (.cer)' },
      domains: { type: 'string', required: true, label: 'Pinned domains (comma-separated)' },
    },
  },
  {
    slug: 'disable-screenshot-enhanced',
    name: 'Disable Screenshot (Enhanced)',
    description: 'Prevent screenshots, screen recordings, and screen sharing on specified pages.',
    price: 34900,
    category: 'security',
    platforms: ['ios'],
    configSchema: {
      pages: { type: 'string', required: false, label: 'Protected page URLs (comma-separated, or * for all)' },
    },
  },
  {
    slug: 'advanced-request-headers',
    name: 'Advanced Request Headers',
    description: 'Inject custom HTTP headers into every WebView request — auth tokens, API keys.',
    price: 49900,
    category: 'security',
    platforms: ['android', 'ios'],
    configSchema: {
      headers: { type: 'string', required: true, label: 'Headers (JSON: {"key": "value"})' },
      domains: { type: 'string', required: false, label: 'Apply to domains (comma-separated, or * for all)' },
    },
  },
  {
    slug: 'root-jailbreak-detection',
    name: 'Root / Jailbreak Detection',
    description: 'Detect rooted Android or jailbroken iOS and deny access or show warning.',
    price: 49900,
    category: 'security',
    platforms: ['android', 'ios'],
    configSchema: {
      action: { type: 'select', required: true, label: 'On detection', options: ['block', 'warn'] },
      warningMessage: { type: 'string', required: false, label: 'Warning message' },
    },
  },

  // ═══════════════════════════════════════════════════════════════════════
  // MONETIZATION
  // ═══════════════════════════════════════════════════════════════════════
  {
    slug: 'google-admob',
    name: 'Google AdMob',
    description: 'Banner, interstitial, rewarded video, and native ads.',
    price: 69900,
    category: 'monetization',
    platforms: ['android', 'ios'],
    capacitorPlugin: '@capacitor-community/admob',
    configSchema: {
      admobAppIdAndroid: { type: 'string', required: true, label: 'AdMob App ID (Android)' },
      admobAppIdIos: { type: 'string', required: false, label: 'AdMob App ID (iOS)' },
      bannerAdUnitId: { type: 'string', required: false, label: 'Banner Ad Unit ID' },
      bannerPosition: { type: 'select', required: false, label: 'Banner Position', options: ['top', 'bottom'] },
      interstitialAdUnitId: { type: 'string', required: false, label: 'Interstitial Ad Unit ID' },
      interstitialFrequency: { type: 'number', required: false, label: 'Show every N page loads' },
      rewardedAdUnitId: { type: 'string', required: false, label: 'Rewarded Ad Unit ID' },
      nativeAdUnitId: { type: 'string', required: false, label: 'Native Ad Unit ID' },
      testMode: { type: 'boolean', required: false, label: 'Test Mode' },
    },
  },
  {
    slug: 'meta-audience-network',
    name: 'Meta (Facebook) Audience Network',
    description: 'Facebook Audience Network ads — banner and interstitial.',
    price: 69900,
    category: 'monetization',
    platforms: ['android'],
    configSchema: {
      placementId: { type: 'string', required: true, label: 'Placement ID' },
    },
  },
  {
    slug: 'in-app-purchases',
    name: 'In-App Purchases (IAP)',
    description: 'Native IAP API — required for App Store digital goods. Server-side receipt validation.',
    price: 99900,
    category: 'monetization',
    platforms: ['android', 'ios'],
    capacitorPlugin: '@capgo/capacitor-purchases',
    configSchema: {
      productIds: { type: 'string', required: false, label: 'Product IDs (comma-separated)' },
    },
  },
  {
    slug: 'revenuecat',
    name: 'RevenueCat Subscription Management',
    description: 'Full subscription lifecycle — paywalls, receipt validation, subscriber analytics.',
    price: 99900,
    category: 'monetization',
    platforms: ['android', 'ios'],
    configSchema: {
      apiKey: { type: 'string', required: true, label: 'RevenueCat Public API Key' },
      entitlementId: { type: 'string', required: false, label: 'Entitlement ID' },
    },
  },
  {
    slug: 'stripe-tap-to-pay',
    name: 'Tap to Pay — Stripe Terminal',
    description: 'NFC contactless card payments in-app via Stripe Terminal SDK.',
    price: 149900,
    category: 'monetization',
    platforms: ['android', 'ios'],
    configSchema: {
      stripePublishableKey: { type: 'string', required: true, label: 'Stripe Publishable Key' },
      stripeLocationId: { type: 'string', required: true, label: 'Stripe Location ID' },
    },
  },

  // ═══════════════════════════════════════════════════════════════════════
  // NAVIGATION & UI
  // ═══════════════════════════════════════════════════════════════════════
  {
    slug: 'bottom-navigation',
    name: 'Bottom Navigation Tab',
    description: 'Native bottom nav bar with up to 5 tabs. Custom icons, labels, URLs, badges.',
    price: 59900,
    category: 'navigation',
    platforms: ['android', 'ios'],
    configSchema: {
      tabs: { type: 'array', required: true, label: 'Navigation tabs (up to 5)' },
      activeColor: { type: 'string', required: false, label: 'Active tab color' },
      inactiveColor: { type: 'string', required: false, label: 'Inactive tab color' },
      backgroundColor: { type: 'string', required: false, label: 'Background color' },
    },
  },
  {
    slug: 'advanced-bottom-nav',
    name: 'Advanced Bottom Navigation',
    description: 'Extended bottom nav — sub-tabs, animated transitions, badge counters, nested menus.',
    price: 79900,
    category: 'navigation',
    platforms: ['android', 'ios'],
    configSchema: {
      tabs: { type: 'array', required: true, label: 'Navigation tabs' },
      animation: { type: 'select', required: false, label: 'Transition animation', options: ['slide', 'fade', 'none'] },
    },
  },
  {
    slug: 'side-drawer',
    name: 'Side Navigation Drawer',
    description: 'Hamburger-menu side drawer with multi-level navigation, icons, section dividers.',
    price: 69900,
    category: 'navigation',
    platforms: ['android', 'ios'],
    configSchema: {
      items: { type: 'array', required: true, label: 'Menu items' },
      headerImage: { type: 'file', required: false, label: 'Header image' },
    },
  },
  {
    slug: 'secondary-nav-bar',
    name: 'Secondary Navigation Bar',
    description: 'A secondary tab or action bar for quick access to frequent sections.',
    price: 49900,
    category: 'navigation',
    platforms: ['android', 'ios'],
    configSchema: {
      items: { type: 'array', required: true, label: 'Nav items' },
      position: { type: 'select', required: true, label: 'Position', options: ['top', 'bottom'] },
    },
  },
  {
    slug: 'floating-action-button',
    name: 'Floating Action Button (FAB)',
    description: 'Persistent floating button — any corner, configurable icon and action.',
    price: 39900,
    category: 'navigation',
    platforms: ['android', 'ios'],
    configSchema: {
      position: { type: 'select', required: true, label: 'Position', options: ['bottom-right', 'bottom-left', 'top-right', 'top-left'] },
      icon: { type: 'file', required: true, label: 'Button icon' },
      action: { type: 'string', required: true, label: 'Action (URL or JS function)' },
      color: { type: 'string', required: false, label: 'Button color' },
    },
  },
  {
    slug: 'floating-action-menu',
    name: 'Floating Action Menu (FAM)',
    description: 'Expandable FAB revealing multiple sub-actions — Call, WhatsApp, Track Order, etc.',
    price: 49900,
    category: 'navigation',
    platforms: ['android', 'ios'],
    configSchema: {
      items: { type: 'array', required: true, label: 'Sub-action items (up to 5)' },
      mainIcon: { type: 'file', required: true, label: 'Main button icon' },
      mainColor: { type: 'string', required: false, label: 'Main button color' },
    },
  },
  {
    slug: 'top-action-bar',
    name: 'Top Action Bar',
    description: 'Native top app bar with back button, title, share icon, and custom actions.',
    price: 39900,
    category: 'navigation',
    platforms: ['android', 'ios'],
    configSchema: {
      showBackButton: { type: 'boolean', required: false, label: 'Show back button' },
      showShareButton: { type: 'boolean', required: false, label: 'Show share button' },
      backgroundColor: { type: 'string', required: false, label: 'Background color' },
      textColor: { type: 'string', required: false, label: 'Text color' },
    },
  },
  {
    slug: 'onboarding-screens',
    name: 'Onboarding Screens',
    description: 'Multi-page swipeable intro carousel on first launch. Images, text, CTA buttons.',
    price: 59900,
    category: 'navigation',
    platforms: ['android', 'ios'],
    configSchema: {
      screens: { type: 'array', required: true, label: 'Onboarding screens' },
      skipButtonText: { type: 'string', required: false, label: 'Skip button text' },
      doneButtonText: { type: 'string', required: false, label: 'Done button text' },
    },
  },
  {
    slug: 'offer-promo-card',
    name: 'Offer / Promo Card',
    description: 'Configurable promotional overlay — on launch, after N seconds, or on specific pages.',
    price: 34900,
    category: 'navigation',
    platforms: ['android', 'ios'],
    configSchema: {
      imageUrl: { type: 'string', required: false, label: 'Promo image URL' },
      title: { type: 'string', required: true, label: 'Title' },
      ctaText: { type: 'string', required: false, label: 'CTA button text' },
      ctaUrl: { type: 'string', required: false, label: 'CTA URL' },
      trigger: { type: 'select', required: true, label: 'Show trigger', options: ['on_launch', 'after_delay', 'on_page'] },
      delaySeconds: { type: 'number', required: false, label: 'Delay seconds' },
    },
  },
  {
    slug: 'app-shortcut',
    name: 'App Shortcut (Long Press)',
    description: 'Long-press app icon for quick actions — Track Order, Open Cart, Contact Support.',
    price: 29900,
    category: 'navigation',
    platforms: ['android', 'ios'],
    configSchema: {
      shortcuts: { type: 'array', required: true, label: 'Shortcuts (up to 4)' },
    },
  },
  {
    slug: 'dynamic-app-icon',
    name: 'Dynamic App Icon',
    description: 'Let users switch app icons — seasonal, event, or preference based. Up to 10 variants.',
    price: 59900,
    category: 'navigation',
    platforms: ['android', 'ios'],
    configSchema: {
      icons: { type: 'array', required: true, label: 'Icon variants (up to 10)' },
    },
  },
  {
    slug: 'status-bar-customization',
    name: 'Status Bar Customization',
    description: 'Set status bar color, text color, and translucency per page via JS Bridge.',
    price: 24900,
    category: 'navigation',
    platforms: ['android', 'ios'],
    configSchema: {},
  },

  // ═══════════════════════════════════════════════════════════════════════
  // DEVICE & HARDWARE
  // ═══════════════════════════════════════════════════════════════════════
  {
    slug: 'qr-scanner',
    name: 'Barcode / QR Scanner',
    description: 'Native camera scanner — QR, Code 128, EAN, UPC, PDF417. Result via JS Bridge.',
    price: 49900,
    category: 'device',
    platforms: ['android', 'ios'],
    capacitorPlugin: '@capacitor-community/barcode-scanner',
    configSchema: {
      formats: { type: 'string', required: false, label: 'Supported formats (comma-separated, or all)' },
    },
  },
  {
    slug: 'background-location',
    name: 'Background Location Tracking',
    description: 'Track GPS continuously in background. For delivery, logistics, field service apps.',
    price: 69900,
    category: 'device',
    platforms: ['android', 'ios'],
    capacitorPlugin: '@capacitor-community/background-geolocation',
    configSchema: {
      interval: { type: 'number', required: false, label: 'Update interval (seconds)' },
      distanceFilter: { type: 'number', required: false, label: 'Min distance (meters) between updates' },
    },
  },
  {
    slug: 'native-contacts',
    name: 'Native Contacts Access',
    description: 'Fetch device contacts for autofill, selection, or invite flows. JSON via JS Bridge.',
    price: 49900,
    category: 'device',
    platforms: ['android', 'ios'],
    capacitorPlugin: '@capacitor-community/contacts',
    configSchema: {},
  },
  {
    slug: 'bluetooth',
    name: 'Bluetooth Connectivity',
    description: 'Scan, pair, and communicate with Bluetooth Classic and BLE devices.',
    price: 79900,
    category: 'device',
    platforms: ['android'],
    capacitorPlugin: '@capacitor-community/bluetooth-le',
    configSchema: {},
  },
  {
    slug: 'nfc-ibeacon',
    name: 'NFC / iBeacon Support',
    description: 'BLE beacon proximity detection and NFC tag reading. Retail, access control.',
    price: 89900,
    category: 'device',
    platforms: ['android', 'ios'],
    configSchema: {},
  },
  {
    slug: 'calendar-integration',
    name: 'Calendar Integration',
    description: 'Add events to device calendar from .ics files or programmatic event objects.',
    price: 39900,
    category: 'device',
    platforms: ['ios'],
    configSchema: {},
  },
  {
    slug: 'haptic-feedback',
    name: 'Haptic Feedback',
    description: 'Trigger native haptic patterns (impact, notification, selection) from JS Bridge.',
    price: 29900,
    category: 'device',
    platforms: ['ios'],
    configSchema: {},
  },
  {
    slug: 'siri-shortcuts',
    name: 'Siri Shortcuts',
    description: 'Create Siri voice shortcuts that trigger in-app actions or page opens.',
    price: 59900,
    category: 'device',
    platforms: ['ios'],
    configSchema: {
      shortcuts: { type: 'array', required: true, label: 'Siri Shortcuts' },
    },
  },
  {
    slug: 'device-sensors',
    name: 'Device Sensors',
    description: 'Access accelerometer, gyroscope, and barometer data via JS Bridge.',
    price: 49900,
    category: 'device',
    platforms: ['android', 'ios'],
    capacitorPlugin: '@capacitor/motion',
    configSchema: {},
  },
  {
    slug: 'nfc-tag-readwrite',
    name: 'NFC Tag Read/Write',
    description: 'Read and write NFC tags. Returns NDEF message to WebView. Payments, inventory.',
    price: 69900,
    category: 'device',
    platforms: ['android'],
    configSchema: {},
  },
  {
    slug: 'flashlight',
    name: 'Flashlight Control',
    description: 'Toggle device flashlight from WebView JavaScript via JS Bridge.',
    price: 19900,
    category: 'device',
    platforms: ['android', 'ios'],
    capacitorPlugin: 'capacitor-flash',
    configSchema: {},
  },

  // ═══════════════════════════════════════════════════════════════════════
  // PERFORMANCE & BACKGROUND
  // ═══════════════════════════════════════════════════════════════════════
  {
    slug: 'background-app-service',
    name: 'Background App Service',
    description: 'Run as persistent foreground service — socket connections alive in background.',
    price: 69900,
    category: 'performance',
    platforms: ['android'],
    configSchema: {
      notificationTitle: { type: 'string', required: true, label: 'Foreground notification title' },
      notificationText: { type: 'string', required: true, label: 'Foreground notification text' },
    },
  },
  {
    slug: 'app-auto-launch',
    name: 'App Auto Launch on Boot',
    description: 'Auto-start app on device boot. For kiosk, digital signage, always-on delivery.',
    price: 49900,
    category: 'performance',
    platforms: ['android'],
    configSchema: {},
  },
  {
    slug: 'in-app-update',
    name: 'In-App Update',
    description: 'Prompt users to update directly in-app from Play Store. Flexible or forced mode.',
    price: 34900,
    category: 'performance',
    platforms: ['android'],
    capacitorPlugin: '@capawesome/capacitor-app-update',
    configSchema: {
      updateMode: { type: 'select', required: true, label: 'Update mode', options: ['flexible', 'immediate'] },
    },
  },
  {
    slug: 'in-app-review',
    name: 'In-App Review Prompt',
    description: 'Show native app store review dialog at the right moment. Configurable trigger.',
    price: 29900,
    category: 'performance',
    platforms: ['android', 'ios'],
    capacitorPlugin: '@capacitor-community/in-app-review',
    configSchema: {},
  },
  {
    slug: 'download-manager',
    name: 'Download File Manager',
    description: 'Dedicated in-app file manager — list, preview, share, delete downloaded files.',
    price: 49900,
    category: 'performance',
    platforms: ['android', 'ios'],
    configSchema: {},
  },
  {
    slug: 'native-datastore',
    name: 'Native Datastore (Persistent)',
    description: 'Save key-value data natively — SharedPreferences / UserDefaults. Survives kills.',
    price: 39900,
    category: 'performance',
    platforms: ['android', 'ios'],
    capacitorPlugin: '@capacitor/preferences',
    configSchema: {},
  },
  {
    slug: 'custom-media-player',
    name: 'Custom Media Player',
    description: 'Background-capable media player with notification controls. Music, podcasts, audio.',
    price: 69900,
    category: 'performance',
    platforms: ['android'],
    configSchema: {},
  },
  {
    slug: 'offline-mode',
    name: 'Offline Mode with Service Worker',
    description: 'Pre-cache critical pages for offline access. Configure which URLs to cache.',
    price: 79900,
    category: 'performance',
    platforms: ['android', 'ios'],
    configSchema: {
      cachedUrls: { type: 'string', required: true, label: 'URLs to pre-cache (one per line)' },
    },
  },
  {
    slug: 'background-audio',
    name: 'Background Audio',
    description: 'Continue audio playback when app is backgrounded. Music, podcasts, meditation.',
    price: 49900,
    category: 'performance',
    platforms: ['ios'],
    configSchema: {},
  },
  {
    slug: 'app-state-persistence',
    name: 'App State Persistence',
    description: 'Save scroll position, form state, tab state when backgrounded and restored.',
    price: 34900,
    category: 'performance',
    platforms: ['android', 'ios'],
    configSchema: {},
  },

  // ═══════════════════════════════════════════════════════════════════════
  // INTEGRATIONS & COMMUNICATION
  // ═══════════════════════════════════════════════════════════════════════
  {
    slug: 'whatsapp-bridge',
    name: 'WhatsApp Business Bridge',
    description: 'Floating WhatsApp button — tap opens native WhatsApp with pre-configured number.',
    price: 29900,
    category: 'integrations',
    platforms: ['android', 'ios'],
    indiaExclusive: true,
    configSchema: {
      phoneNumber: { type: 'string', required: true, label: 'WhatsApp phone number (with country code)' },
      defaultMessage: { type: 'string', required: false, label: 'Default opening message' },
      buttonPosition: { type: 'select', required: false, label: 'Button position', options: ['bottom-right', 'bottom-left'] },
      buttonColor: { type: 'string', required: false, label: 'Button color' },
    },
  },
  {
    slug: 'intercom',
    name: 'Intercom Customer Support',
    description: 'Embed Intercom messenger in-app. Full conversation and inbox sync.',
    price: 79900,
    category: 'integrations',
    platforms: ['android', 'ios'],
    configSchema: {
      appId: { type: 'string', required: true, label: 'Intercom App ID' },
      androidApiKey: { type: 'string', required: true, label: 'Android API Key' },
      iosApiKey: { type: 'string', required: false, label: 'iOS API Key' },
    },
  },
  {
    slug: 'freshchat',
    name: 'Freshchat Integration',
    description: 'Embed Freshchat in-app support — ticket creation, live chat, bot support.',
    price: 69900,
    category: 'integrations',
    platforms: ['android', 'ios'],
    configSchema: {
      appId: { type: 'string', required: true, label: 'Freshchat App ID' },
      appKey: { type: 'string', required: true, label: 'Freshchat App Key' },
    },
  },
  {
    slug: 'tawkto',
    name: 'Tawk.to Live Chat',
    description: 'Embed Tawk.to free live chat widget natively in-app.',
    price: 29900,
    category: 'integrations',
    platforms: ['android', 'ios'],
    configSchema: {
      propertyId: { type: 'string', required: true, label: 'Tawk.to Property ID' },
      widgetId: { type: 'string', required: true, label: 'Widget ID' },
    },
  },
  {
    slug: 'zoho-salesiq',
    name: 'Zoho SalesIQ',
    description: 'Embed Zoho SalesIQ chat and visitor tracking for sales-heavy apps.',
    price: 49900,
    category: 'integrations',
    platforms: ['android', 'ios'],
    configSchema: {
      appKey: { type: 'string', required: true, label: 'SalesIQ App Key' },
      accessKey: { type: 'string', required: true, label: 'Access Key' },
    },
  },
  {
    slug: 'ai-chatbot',
    name: 'AI Chatbot (QuickApps Assistant)',
    description: 'Configurable AI chatbot — set icon, position, visible pages, system prompt.',
    price: 49900,
    category: 'integrations',
    platforms: ['android', 'ios'],
    configSchema: {
      systemPrompt: { type: 'string', required: true, label: 'System prompt' },
      position: { type: 'select', required: false, label: 'Button position', options: ['bottom-right', 'bottom-left'] },
      iconUrl: { type: 'string', required: false, label: 'Bot icon URL' },
      visiblePages: { type: 'string', required: false, label: 'Visible on pages (comma-separated, or * for all)' },
    },
  },
  {
    slug: 'branch-deep-links',
    name: 'Branch.io Deep Links',
    description: 'Robust deep linking with attribution, deferred deep linking, link analytics.',
    price: 69900,
    category: 'integrations',
    platforms: ['android', 'ios'],
    configSchema: {
      branchKey: { type: 'string', required: true, label: 'Branch Key' },
    },
  },

  // ═══════════════════════════════════════════════════════════════════════
  // PLATFORM-SPECIFIC
  // ═══════════════════════════════════════════════════════════════════════
  {
    slug: 'android-tv',
    name: 'Android TV Support',
    description: 'Enable app on Android Smart TV with D-pad navigation and large-screen layout.',
    price: 79900,
    category: 'platform',
    platforms: ['android'],
    configSchema: {},
  },
  {
    slug: 'android-automotive',
    name: 'Android Automotive Support',
    description: 'Adapt WebView to run in Android Auto / car infotainment screens.',
    price: 99900,
    category: 'platform',
    platforms: ['android'],
    configSchema: {},
  },
  {
    slug: 'ipad-tablet-layout',
    name: 'iPad / Tablet Optimized Layout',
    description: 'Detect iPad and render split-view or wider layout. Configurable breakpoints.',
    price: 49900,
    category: 'platform',
    platforms: ['ios'],
    configSchema: {
      breakpoint: { type: 'number', required: false, label: 'Tablet breakpoint (px)' },
    },
  },
  {
    slug: 'apple-watch',
    name: 'Apple Watch Companion',
    description: 'Basic Apple Watch app showing key data from the main iOS app (read-only widget).',
    price: 99900,
    category: 'platform',
    platforms: ['ios'],
    configSchema: {},
  },
  {
    slug: 'home-screen-widget',
    name: 'Widget (Home Screen)',
    description: 'Android home screen widget and iOS 14+ widget showing a snapshot of key app data.',
    price: 79900,
    category: 'platform',
    platforms: ['android', 'ios'],
    configSchema: {
      widgetUrl: { type: 'string', required: true, label: 'Widget data URL' },
      refreshInterval: { type: 'number', required: false, label: 'Refresh interval (minutes)' },
    },
  },

  // ═══════════════════════════════════════════════════════════════════════
  // PUBLISHING SERVICES
  // ═══════════════════════════════════════════════════════════════════════
  {
    slug: 'publish-google-play',
    name: 'Google Play Store Publishing',
    description: 'End-to-end submission: screenshots, listing copy, content rating. 2–5 business days.',
    price: 199900,
    category: 'publishing',
    platforms: ['android'],
    configSchema: {
      developerAccountEmail: { type: 'string', required: true, label: 'Google Play Developer Account Email' },
      appCategory: { type: 'string', required: true, label: 'App Category' },
      contentRating: { type: 'select', required: true, label: 'Content Rating', options: ['everyone', 'teen', 'mature'] },
      contactEmail: { type: 'string', required: true, label: 'Contact Email (public)' },
      privacyPolicyUrl: { type: 'string', required: true, label: 'Privacy Policy URL' },
    },
  },
  {
    slug: 'publish-app-store',
    name: 'Apple App Store Publishing',
    description: 'Full submission with screenshots, metadata, privacy manifest, review support.',
    price: 249900,
    category: 'publishing',
    platforms: ['ios'],
    configSchema: {
      appleDeveloperEmail: { type: 'string', required: true, label: 'Apple Developer Account Email' },
      appCategory: { type: 'string', required: true, label: 'App Category' },
      ageRating: { type: 'select', required: true, label: 'Age Rating', options: ['4+', '9+', '12+', '17+'] },
      privacyPolicyUrl: { type: 'string', required: true, label: 'Privacy Policy URL' },
      supportUrl: { type: 'string', required: true, label: 'Support URL' },
    },
  },
  {
    slug: 'publish-samsung',
    name: 'Samsung Galaxy Store Publishing',
    description: 'Submission to Samsung Galaxy Store with screenshot assistance.',
    price: 149900,
    category: 'publishing',
    platforms: ['android'],
    configSchema: {
      samsungSellerEmail: { type: 'string', required: true, label: 'Samsung Seller Account Email' },
    },
  },
  {
    slug: 'publish-amazon',
    name: 'Amazon Appstore Publishing',
    description: 'End-to-end Amazon Appstore submission — device testing, screenshots, listing.',
    price: 149900,
    category: 'publishing',
    platforms: ['android'],
    configSchema: {
      amazonDeveloperEmail: { type: 'string', required: true, label: 'Amazon Developer Email' },
    },
  },
  {
    slug: 'publish-huawei',
    name: 'Huawei AppGallery Publishing',
    description: 'Submission to Huawei AppGallery for HMS devices.',
    price: 149900,
    category: 'publishing',
    platforms: ['android'],
    configSchema: {
      huaweiDeveloperEmail: { type: 'string', required: true, label: 'Huawei Developer Email' },
    },
  },
  {
    slug: 'publish-xiaomi',
    name: 'Xiaomi GetApps Publishing',
    description: 'Submission to Xiaomi GetApps store.',
    price: 149900,
    category: 'publishing',
    platforms: ['android'],
    configSchema: {
      xiaomiDeveloperEmail: { type: 'string', required: true, label: 'Xiaomi Developer Email' },
    },
  },

  // ═══════════════════════════════════════════════════════════════════════
  // INDIA-EXCLUSIVE (QuickApps Only)
  // ═══════════════════════════════════════════════════════════════════════
  {
    slug: 'razorpay-checkout',
    name: 'Razorpay In-App Checkout',
    description: 'Native Razorpay payment sheet — UPI, cards, net banking, wallets, EMI, Pay Later.',
    price: 99900,
    category: 'india-exclusive',
    platforms: ['android', 'ios'],
    indiaExclusive: true,
    configSchema: {
      razorpayKeyId: { type: 'string', required: true, label: 'Razorpay Key ID' },
      razorpayKeySecret: { type: 'string', required: true, label: 'Razorpay Key Secret' },
      businessName: { type: 'string', required: true, label: 'Business Name' },
      defaultCurrency: { type: 'string', required: false, label: 'Currency (default: INR)' },
      acceptedMethods: { type: 'array', required: false, label: 'Accepted payment methods' },
      callbackFunctionName: { type: 'string', required: false, label: 'JS Bridge callback' },
    },
  },
  {
    slug: 'upi-deep-link',
    name: 'UPI Deep Link Payment',
    description: 'Direct UPI via intent — opens GPay, PhonePe, Paytm. Confirmation via JS Bridge.',
    price: 49900,
    category: 'india-exclusive',
    platforms: ['android'],
    indiaExclusive: true,
    configSchema: {},
  },
  {
    slug: 'indian-language-overlay',
    name: 'Indian Language UI Overlay',
    description: 'Overlay language selector — switch between English, Hindi, regional languages.',
    price: 69900,
    category: 'india-exclusive',
    platforms: ['android', 'ios'],
    indiaExclusive: true,
    configSchema: {
      languages: { type: 'array', required: true, label: 'Supported languages' },
      defaultLanguage: { type: 'string', required: true, label: 'Default language' },
    },
  },
  {
    slug: 'mintwallet-display',
    name: 'MintWallet Balance Display',
    description: 'Show MintWallet balance in-app; allow top-up and cross-product redemptions.',
    price: 59900,
    category: 'india-exclusive',
    platforms: ['android', 'ios'],
    indiaExclusive: true,
    configSchema: {},
  },
  {
    slug: 'gst-invoice-generator',
    name: 'GST Invoice Generator',
    description: 'Generate GST-compliant PDF invoices within the app. GSTIN, HSN codes, tax rates.',
    price: 79900,
    category: 'india-exclusive',
    platforms: ['android', 'ios'],
    indiaExclusive: true,
    configSchema: {
      businessGstin: { type: 'string', required: true, label: 'Business GSTIN' },
      businessName: { type: 'string', required: true, label: 'Business Name' },
      businessAddress: { type: 'string', required: true, label: 'Business Address' },
      defaultHsnCode: { type: 'string', required: false, label: 'Default HSN/SAC Code' },
      defaultTaxRate: { type: 'select', required: false, label: 'Default GST Rate', options: ['5', '12', '18', '28'] },
    },
  },
  {
    slug: 'js-bridge-extended',
    name: 'QuickApps JS Bridge Extended',
    description: 'Full access to all JS Bridge APIs — NFC, Bluetooth, accelerometer, audio, camera.',
    price: 89900,
    category: 'india-exclusive',
    platforms: ['android', 'ios'],
    indiaExclusive: true,
    configSchema: {},
  },
];

export function getAddonBySlug(slug: string): AddonDefinition | undefined {
  return ADDON_CATALOG.find((a) => a.slug === slug);
}

export function getAddonsByCategory(category: string): AddonDefinition[] {
  if (category === 'all') return ADDON_CATALOG;
  return ADDON_CATALOG.filter((a) => a.category === category);
}

export const ADDON_CATEGORIES = [
  { slug: 'all', label: 'All', count: ADDON_CATALOG.length },
  { slug: 'notifications', label: 'Notifications', count: ADDON_CATALOG.filter((a) => a.category === 'notifications').length },
  { slug: 'analytics', label: 'Analytics', count: ADDON_CATALOG.filter((a) => a.category === 'analytics').length },
  { slug: 'security', label: 'Security', count: ADDON_CATALOG.filter((a) => a.category === 'security').length },
  { slug: 'monetization', label: 'Monetization', count: ADDON_CATALOG.filter((a) => a.category === 'monetization').length },
  { slug: 'navigation', label: 'Navigation', count: ADDON_CATALOG.filter((a) => a.category === 'navigation').length },
  { slug: 'device', label: 'Device', count: ADDON_CATALOG.filter((a) => a.category === 'device').length },
  { slug: 'performance', label: 'Performance', count: ADDON_CATALOG.filter((a) => a.category === 'performance').length },
  { slug: 'integrations', label: 'Integrations', count: ADDON_CATALOG.filter((a) => a.category === 'integrations').length },
  { slug: 'platform', label: 'Platform-Specific', count: ADDON_CATALOG.filter((a) => a.category === 'platform').length },
  { slug: 'publishing', label: 'Publishing', count: ADDON_CATALOG.filter((a) => a.category === 'publishing').length },
  { slug: 'india-exclusive', label: 'India-Exclusive', count: ADDON_CATALOG.filter((a) => a.category === 'india-exclusive').length },
] as const;
