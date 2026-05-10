import * as path from 'path';
import * as fs from 'fs-extra';
import { BuildContext, StepResult, DecryptedAddon, AppConfig, BUILD_ERROR_CODES } from '../types';
import { ADDON_CATALOG } from '../../../modules/addons/constants/addon-catalog';

// Pinned versions compatible with Capacitor 6.x
const CAPACITOR_PLUGIN_VERSIONS: Record<string, string> = {
  // Core plugins
  '@capacitor/app': '^6.0.0',
  '@capacitor/browser': '^6.0.0',
  '@capacitor/camera': '^6.1.0',
  '@capacitor/clipboard': '^6.0.0',
  '@capacitor/device': '^6.0.0',
  '@capacitor/geolocation': '^6.0.0',
  '@capacitor/haptics': '^6.0.0',
  '@capacitor/keyboard': '^6.0.0',
  '@capacitor/local-notifications': '^6.2.0',
  '@capacitor/motion': '^6.0.0',
  '@capacitor/network': '^6.0.0',
  '@capacitor/preferences': '^6.0.0',
  '@capacitor/push-notifications': '^6.0.0',
  '@capacitor/share': '^6.0.0',
  '@capacitor/splash-screen': '^6.0.0',
  '@capacitor/status-bar': '^6.0.0',
  // Firebase
  '@capacitor-firebase/analytics': '^6.2.0',
  '@capacitor-firebase/messaging': '^6.2.0',
  '@capacitor-firebase/in-app-messaging': '^6.2.0',
  // Community
  '@capacitor-community/admob': '^6.0.0',
  '@capacitor-community/barcode-scanner': '^4.0.0',
  '@capacitor-community/background-geolocation': '^1.2.0',
  '@capacitor-community/bluetooth-le': '^6.0.0',
  '@capacitor-community/contacts': '^6.0.0',
  '@capacitor-community/in-app-review': '^6.0.0',
  // Third party
  'onesignal-cordova-plugin': '^5.0.0',
  '@capgo/capacitor-purchases': '^5.0.0',
  '@capawesome/capacitor-app-update': '^6.0.0',
  'capacitor-native-biometric': '^4.2.0',
  'capacitor-flash': '^1.1.0',
};

export async function addonsStep(ctx: BuildContext): Promise<StepResult> {
  const start = Date.now();
  try {
    const { decryptedAddons, workDir, app } = ctx;

    if (decryptedAddons.length === 0) {
      await writeManifest(workDir, [], app.configJson);
      return { success: true, duration: Date.now() - start, step: 'addons', data: { count: 0 } };
    }

    // ── 1. Update package.json with addon plugins ───

    const pkgPath = path.join(workDir, 'package.json');
    const pkg = await fs.readJson(pkgPath);
    const installedPlugins: string[] = [];

    for (const addon of decryptedAddons) {
      if (!addon.isActive) continue;
      const def = ADDON_CATALOG.find(a => a.slug === addon.slug);
      if (def?.capacitorPlugin) {
        // Pin to Capacitor 6.x compatible versions (not latest which may require Cap 8+)
        pkg.dependencies[def.capacitorPlugin] = CAPACITOR_PLUGIN_VERSIONS[def.capacitorPlugin] ?? '^6.0.0';
        installedPlugins.push(def.capacitorPlugin);
      }
    }
    await fs.writeJson(pkgPath, pkg, { spaces: 2 });

    // ── 2. Write individual addon configs to www/ ───

    const wwwDir = path.join(workDir, 'www');
    const configDir = path.join(wwwDir, 'addon-configs');
    await fs.ensureDir(configDir);

    for (const addon of decryptedAddons) {
      if (!addon.isActive) continue;
      const config = addon.config ?? {};

      // Write addon config JSON (accessible via JS Bridge)
      await fs.writeJson(path.join(configDir, `${addon.slug}.json`), config, { spaces: 2 });

      // Handle file-based configs (base64 → native file)
      await handleFileConfigs(addon, config, workDir);
    }

    // ── 3. Write master manifest ────────────────────

    await writeManifest(workDir, decryptedAddons, app.configJson);

    // ── 4. Generate capacitor plugin configs ────────

    await generateCapacitorPluginConfigs(workDir, decryptedAddons);

    // ── 5. Generate JS Bridge initialization ────────

    await generateJsBridgeInit(workDir, decryptedAddons, app.configJson);

    return {
      success: true, duration: Date.now() - start, step: 'addons',
      data: { count: decryptedAddons.length, plugins: installedPlugins },
    };
  } catch (error) {
    return {
      success: false, duration: Date.now() - start, step: 'addons',
      error: (error as Error).message,
      data: { errorCode: BUILD_ERROR_CODES.ADDON_CONFIG_INVALID },
    };
  }
}

// ── Master manifest ─────────────────────────────────

async function writeManifest(workDir: string, addons: DecryptedAddon[], appConfig: AppConfig) {
  const manifest = {
    version: 1,
    generatedAt: new Date().toISOString(),
    app: {
      jsBridgeEnabled: appConfig.advanced?.jsBridgeEnabled ?? true,
      pullToRefresh: appConfig.display?.pullToRefresh ?? true,
      pinchToZoom: appConfig.display?.pinchToZoom ?? false,
      disableScreenshots: appConfig.security?.disableScreenshots ?? false,
      disableCaching: appConfig.security?.disableCaching ?? false,
      clipboardControl: appConfig.security?.clipboardControl ?? true,
      sslEnforcement: appConfig.security?.sslEnforcement ?? true,
      customUserAgent: appConfig.security?.customUserAgent,
      noInternet: appConfig.noInternet ?? {},
    },
    addons: addons
      .filter(a => a.isActive)
      .map(a => {
        const def = ADDON_CATALOG.find(d => d.slug === a.slug);
        return {
          slug: a.slug,
          category: def?.category ?? 'unknown',
          hasConfig: !!a.config && Object.keys(a.config).length > 0,
          configFile: `addon-configs/${a.slug}.json`,
          capacitorPlugin: def?.capacitorPlugin ?? null,
        };
      }),
  };

  await fs.writeJson(path.join(workDir, 'www', 'quickapps-manifest.json'), manifest, { spaces: 2 });
}

// ── File-based config handling ──────────────────────

async function handleFileConfigs(addon: DecryptedAddon, config: Record<string, unknown>, workDir: string) {
  const slug = addon.slug;

  // Firebase google-services.json / GoogleService-Info.plist
  if (['firebase-analytics', 'firebase-notifications'].includes(slug)) {
    await writeBase64File(config['googleServicesJson'], path.join(workDir, 'android', 'app', 'google-services.json'));
    await writeBase64File(config['googleServiceInfoPlist'], path.join(workDir, 'ios', 'App', 'App', 'GoogleService-Info.plist'));
  }

  // Custom notification sound
  if (slug === 'custom-notification-sound') {
    const rawDir = path.join(workDir, 'android', 'app', 'src', 'main', 'res', 'raw');
    await fs.ensureDir(rawDir);
    await writeBase64File(config['soundFile'], path.join(rawDir, 'notification_sound.mp3'));
    await writeBase64File(config['soundFile'], path.join(workDir, 'ios', 'App', 'App', 'notification_sound.mp3'));
  }

  // SSL pinning certificates
  if (slug === 'ssl-pinning') {
    await writeBase64File(config['certificates'], path.join(workDir, 'www', 'ssl-certificates.cer'));
  }

  // Side drawer header image
  if (slug === 'side-drawer') {
    await writeBase64File(config['headerImage'], path.join(workDir, 'www', 'assets', 'drawer-header.png'));
  }

  // FAB icon
  if (slug === 'floating-action-button') {
    await writeBase64File(config['icon'], path.join(workDir, 'www', 'assets', 'fab-icon.png'));
  }

  // FAM main icon
  if (slug === 'floating-action-menu') {
    await writeBase64File(config['mainIcon'], path.join(workDir, 'www', 'assets', 'fam-icon.png'));
  }
}

async function writeBase64File(data: unknown, filePath: string): Promise<void> {
  if (!data || typeof data !== 'string') return;
  await fs.ensureDir(path.dirname(filePath));

  if (data.startsWith('data:')) {
    const base64 = data.split(',')[1];
    if (base64) await fs.writeFile(filePath, Buffer.from(base64, 'base64'));
  } else if (data.startsWith('{') || data.startsWith('<')) {
    // Raw JSON or XML content
    await fs.writeFile(filePath, data);
  }
}

// ── Capacitor plugin configs ────────────────────────

async function generateCapacitorPluginConfigs(workDir: string, addons: DecryptedAddon[]) {
  // Generate a capacitor-plugins.json that gets merged into the Capacitor config
  const pluginConfigs: Record<string, Record<string, unknown>> = {};

  for (const addon of addons) {
    if (!addon.isActive) continue;
    const config = addon.config ?? {};

    switch (addon.slug) {
      case 'onesignal-push':
        pluginConfigs['OneSignal'] = { appId: config['appId'] };
        break;

      case 'google-admob':
        pluginConfigs['AdMob'] = {
          appId: config['admobAppIdAndroid'],
          appIdIos: config['admobAppIdIos'],
          bannerAdUnitId: config['bannerAdUnitId'],
          interstitialAdUnitId: config['interstitialAdUnitId'],
          rewardedAdUnitId: config['rewardedAdUnitId'],
          nativeAdUnitId: config['nativeAdUnitId'],
          bannerPosition: config['bannerPosition'] ?? 'bottom',
          testMode: config['testMode'] ?? false,
        };
        break;

      case 'biometric-auth':
        pluginConfigs['BiometricAuth'] = {
          triggerMode: config['triggerMode'] ?? 'on_open',
          backgroundTimeout: config['backgroundTimeoutMin'] ? Number(config['backgroundTimeoutMin']) * 60 : 300,
          fallback: config['fallback'] ?? 'passcode',
          promptMessage: config['promptMessage'] ?? 'Verify your identity',
        };
        break;

      case 'background-location':
        pluginConfigs['BackgroundGeolocation'] = {
          interval: config['interval'] ? Number(config['interval']) * 1000 : 30000,
          distanceFilter: config['distanceFilter'] ? Number(config['distanceFilter']) : 50,
        };
        break;

      case 'in-app-update':
        pluginConfigs['AppUpdate'] = {
          updateMode: config['updateMode'] ?? 'flexible',
        };
        break;

      case 'revenuecat':
        pluginConfigs['RevenueCat'] = {
          apiKey: config['apiKey'],
          entitlementId: config['entitlementId'],
        };
        break;

      case 'intercom':
        pluginConfigs['Intercom'] = {
          appId: config['appId'],
          androidApiKey: config['androidApiKey'],
          iosApiKey: config['iosApiKey'],
        };
        break;

      case 'branch-deep-links':
        pluginConfigs['Branch'] = {
          branchKey: config['branchKey'],
        };
        break;

      case 'adjust':
        pluginConfigs['Adjust'] = {
          appToken: config['appToken'],
          environment: config['environment'] ?? 'production',
        };
        break;

      case 'home-screen-widget':
        pluginConfigs['Widget'] = {
          widgetUrl: config['widgetUrl'],
          refreshInterval: config['refreshInterval'] ?? 30,
        };
        break;

      case 'firebase-analytics':
      case 'firebase-notifications':
        pluginConfigs['FirebaseMessaging'] = { presentationOptions: ['badge', 'sound', 'alert'] };
        break;

      case 'qr-scanner':
        pluginConfigs['BarcodeScanner'] = {
          formats: config['formats'] ?? 'QR_CODE,EAN_13,EAN_8,CODE_128',
        };
        break;

      case 'in-app-purchases':
        pluginConfigs['Purchases'] = {
          productIds: config['productIds'] ? String(config['productIds']).split(',').map(s => s.trim()) : [],
        };
        break;

      case 'facebook-app-events':
        pluginConfigs['FacebookAppEvents'] = {
          appId: config['facebookAppId'],
          clientToken: config['clientToken'],
        };
        break;

      case 'appsflyer':
        pluginConfigs['AppsFlyer'] = {
          devKey: config['devKey'],
          appId: config['appId'],
        };
        break;

      case 'mixpanel':
        pluginConfigs['Mixpanel'] = { projectToken: config['projectToken'] };
        break;

      case 'amplitude':
        pluginConfigs['Amplitude'] = { apiKey: config['apiKey'] };
        break;

      case 'clarity':
        pluginConfigs['Clarity'] = { projectId: config['projectId'] };
        break;

      case 'freshchat':
        pluginConfigs['Freshchat'] = { appId: config['appId'], appKey: config['appKey'] };
        break;

      case 'zoho-salesiq':
        pluginConfigs['ZohoSalesIQ'] = { appKey: config['appKey'], accessKey: config['accessKey'] };
        break;

      case 'stripe-tap-to-pay':
        pluginConfigs['StripeTerminal'] = {
          publishableKey: config['stripePublishableKey'],
          locationId: config['stripeLocationId'],
        };
        break;

      case 'razorpay-checkout':
        pluginConfigs['Razorpay'] = {
          keyId: config['razorpayKeyId'],
          businessName: config['businessName'],
          currency: config['defaultCurrency'] ?? 'INR',
        };
        break;

      case 'passcode-lock':
        pluginConfigs['PasscodeLock'] = {
          pinLength: config['pinLength'] ?? '4',
          inactivityTimeout: config['inactivityTimeout'] ?? 5,
          biometricFallback: config['biometricFallback'] ?? false,
        };
        break;

      case 'social-login':
        pluginConfigs['SocialLogin'] = {
          googleClientId: config['googleClientId'],
          googleEnabled: config['googleEnabled'] ?? false,
          facebookAppId: config['facebookAppId'],
          facebookEnabled: config['facebookEnabled'] ?? false,
          appleServiceId: config['appleServiceId'],
          appleEnabled: config['appleEnabled'] ?? false,
        };
        break;

      case 'root-jailbreak-detection':
        pluginConfigs['RootDetection'] = {
          action: config['action'] ?? 'warn',
          warningMessage: config['warningMessage'] ?? 'This device may be compromised.',
        };
        break;

      case 'advanced-request-headers':
        pluginConfigs['RequestHeaders'] = {
          headers: config['headers'],
          domains: config['domains'],
        };
        break;

      case 'offline-mode':
        pluginConfigs['OfflineMode'] = {
          cachedUrls: config['cachedUrls'] ? String(config['cachedUrls']).split('\n').map(s => s.trim()).filter(Boolean) : [],
        };
        break;

      case 'background-app-service':
        pluginConfigs['BackgroundService'] = {
          notificationTitle: config['notificationTitle'],
          notificationText: config['notificationText'],
        };
        break;

      // ── Navigation & UI (JS Bridge only — config in www/) ──
      case 'bottom-navigation':
      case 'advanced-bottom-nav':
        pluginConfigs['BottomNav'] = {
          tabs: config['tabs'] ?? [],
          activeColor: config['activeColor'],
          inactiveColor: config['inactiveColor'],
          backgroundColor: config['backgroundColor'],
          animation: config['animation'],
        };
        break;

      case 'side-drawer':
        pluginConfigs['SideDrawer'] = { items: config['items'] ?? [], headerImage: config['headerImage'] ? 'assets/drawer-header.png' : null };
        break;

      case 'secondary-nav-bar':
        pluginConfigs['SecondaryNav'] = { items: config['items'] ?? [], position: config['position'] ?? 'bottom' };
        break;

      case 'floating-action-button':
        pluginConfigs['FAB'] = { position: config['position'], action: config['action'], color: config['color'], icon: 'assets/fab-icon.png' };
        break;

      case 'floating-action-menu':
        pluginConfigs['FAM'] = { items: config['items'] ?? [], mainColor: config['mainColor'], mainIcon: 'assets/fam-icon.png' };
        break;

      case 'top-action-bar':
        pluginConfigs['TopBar'] = { showBackButton: config['showBackButton'], showShareButton: config['showShareButton'], backgroundColor: config['backgroundColor'], textColor: config['textColor'] };
        break;

      case 'onboarding-screens':
        pluginConfigs['Onboarding'] = { screens: config['screens'] ?? [], skipButtonText: config['skipButtonText'], doneButtonText: config['doneButtonText'] };
        break;

      case 'offer-promo-card':
        pluginConfigs['PromoCard'] = { title: config['title'], imageUrl: config['imageUrl'], ctaText: config['ctaText'], ctaUrl: config['ctaUrl'], trigger: config['trigger'], delaySeconds: config['delaySeconds'] };
        break;

      case 'app-shortcut':
        pluginConfigs['AppShortcuts'] = { shortcuts: config['shortcuts'] ?? [] };
        break;

      case 'dynamic-app-icon':
        pluginConfigs['DynamicIcon'] = { icons: config['icons'] ?? [] };
        break;

      case 'siri-shortcuts':
        pluginConfigs['SiriShortcuts'] = { shortcuts: config['shortcuts'] ?? [] };
        break;

      // ── Integration configs ──
      case 'whatsapp-bridge':
        pluginConfigs['WhatsApp'] = { phoneNumber: config['phoneNumber'], defaultMessage: config['defaultMessage'], buttonPosition: config['buttonPosition'], buttonColor: config['buttonColor'] };
        break;

      case 'tawkto':
        pluginConfigs['TawkTo'] = { propertyId: config['propertyId'], widgetId: config['widgetId'] };
        break;

      case 'ai-chatbot':
        pluginConfigs['AIChatbot'] = { systemPrompt: config['systemPrompt'], position: config['position'], iconUrl: config['iconUrl'], visiblePages: config['visiblePages'] };
        break;

      case 'meta-audience-network':
        pluginConfigs['MetaAds'] = { placementId: config['placementId'] };
        break;

      // ── Misc ──
      case 'custom-notification-sound':
        pluginConfigs['NotificationSound'] = { soundFile: 'notification_sound.mp3' };
        break;

      case 'ssl-pinning':
        pluginConfigs['SSLPinning'] = { domains: config['domains'], certificateFile: 'ssl-certificates.cer' };
        break;

      case 'disable-screenshot-enhanced':
        pluginConfigs['ScreenshotProtection'] = { pages: config['pages'] ?? '*' };
        break;

      case 'ipad-tablet-layout':
        pluginConfigs['TabletLayout'] = { breakpoint: config['breakpoint'] ?? 768 };
        break;

      case 'indian-language-overlay':
        pluginConfigs['LanguageOverlay'] = { languages: config['languages'] ?? [], defaultLanguage: config['defaultLanguage'] ?? 'en' };
        break;

      case 'gst-invoice-generator':
        pluginConfigs['GSTInvoice'] = { businessGstin: config['businessGstin'], businessName: config['businessName'], businessAddress: config['businessAddress'], defaultHsnCode: config['defaultHsnCode'], defaultTaxRate: config['defaultTaxRate'] };
        break;

      // ── Publishing services (config stored, not injected into app) ──
      case 'publish-google-play':
      case 'publish-app-store':
      case 'publish-samsung':
      case 'publish-amazon':
      case 'publish-huawei':
      case 'publish-xiaomi':
        pluginConfigs['Publishing_' + addon.slug] = config;
        break;
    }
  }

  await fs.writeJson(path.join(workDir, 'www', 'capacitor-plugin-configs.json'), pluginConfigs, { spaces: 2 });

  // Also inject into capacitor.config.ts if it exists
  const capConfigPath = path.join(workDir, 'capacitor.config.ts');
  if (Object.keys(pluginConfigs).length > 0 && await fs.pathExists(capConfigPath)) {
    let capConfig = await fs.readFile(capConfigPath, 'utf-8');

    // Build plugin entries string
    const pluginEntries = Object.entries(pluginConfigs)
      .map(([name, cfg]) => {
        const entries = Object.entries(cfg)
          .filter(([, v]) => v !== undefined && v !== null)
          .map(([k, v]) => `      ${k}: ${JSON.stringify(v)}`)
          .join(',\n');
        return `    ${name}: {\n${entries}\n    }`;
      })
      .join(',\n');

    // Inject before the closing of plugins: { ... }
    capConfig = capConfig.replace(
      /plugins:\s*\{/,
      `plugins: {\n${pluginEntries},`,
    );

    await fs.writeFile(capConfigPath, capConfig);
  }
}

// ── JS Bridge initialization script ─────────────────
// Uses the pre-built @quickapps/bridge package from packages/quickapps-bridge/dist/

// Resolve bridge dist path relative to this file's location at runtime
const BRIDGE_DIST = path.resolve(__dirname, '..', '..', '..', '..', '..', 'packages', 'quickapps-bridge', 'dist');

async function generateJsBridgeInit(workDir: string, addons: DecryptedAddon[], appConfig: AppConfig) {
  const activeAddons = addons.filter(a => a.isActive);

  // Copy the pre-built bridge IIFE from @quickapps/bridge package
  const bridgeSrcPath = path.join(BRIDGE_DIST, 'quickapps-bridge.js');
  const bridgeDestPath = path.join(workDir, 'www', 'quickapps-bridge.js');

  if (await fs.pathExists(bridgeSrcPath)) {
    await fs.copy(bridgeSrcPath, bridgeDestPath);
  } else {
    // Fallback: generate a minimal bootstrap if pre-built bridge isn't found
    await fs.writeFile(bridgeDestPath, `
/* QuickApps Bridge — minimal bootstrap (pre-built package not found) */
window.QuickApps = {
  version: '1.0.0',
  isNative: typeof Capacitor !== 'undefined' && Capacitor.isNativePlatform(),
  platform: typeof Capacitor !== 'undefined' ? Capacitor.getPlatform() : 'web',
  addons: ${JSON.stringify(activeAddons.map(a => a.slug))},
  hasAddon: function(slug) { return this.addons.includes(slug); },
  getAddonConfig: async function(slug) {
    try { const r = await fetch('/addon-configs/' + slug + '.json'); return await r.json(); } catch { return null; }
  },
  on: function() {}, off: function() {}, emit: function() {}, ready: function(cb) { cb(); },
};
console.log('[QuickApps] Bridge v1.0.0 (minimal) — ${activeAddons.length} addons active.');
`.trim());
  }

  // Inject the script tag into index.html
  const indexPath = path.join(workDir, 'www', 'index.html');
  if (await fs.pathExists(indexPath)) {
    let html = await fs.readFile(indexPath, 'utf-8');
    if (!html.includes('quickapps-bridge.js')) {
      html = html.replace('</head>', '  <script src="/quickapps-bridge.js"></script>\n</head>');
      await fs.writeFile(indexPath, html);
    }
  }
}
