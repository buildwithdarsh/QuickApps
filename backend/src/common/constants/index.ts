// ── Queue Names ──────────────────────────────────────
export const QUEUE_NAMES = {
  BUILD_FREE: 'build-queue-free',
  BUILD_STANDARD: 'build-queue-standard',
  BUILD_PRIORITY: 'build-queue-priority',
  BUILD_IMMEDIATE: 'build-queue-immediate',
  EMAIL: 'email-queue',
  INVOICE: 'invoice-queue',
} as const;

// ── Plan Limits ──────────────────────────────────────
export const PLAN_LIMITS = {
  free: {
    maxApps: 1,
    buildQueue: 'free' as const,
    freeRevisions: 1,
    addonStoreAccess: false,
    iosSupport: false,
    buildHistoryLimit: 3,
  },
  starter: {
    maxApps: 1,
    buildQueue: 'standard' as const,
    freeRevisions: 3,
    addonStoreAccess: true,
    iosSupport: false,
    buildHistoryLimit: 10,
  },
  pro: {
    maxApps: 3,
    buildQueue: 'priority' as const,
    freeRevisions: 3,
    addonStoreAccess: true,
    iosSupport: true,
    buildHistoryLimit: -1, // unlimited
  },
  premium: {
    maxApps: 5,
    buildQueue: 'immediate' as const,
    freeRevisions: 5,
    addonStoreAccess: true,
    iosSupport: true,
    buildHistoryLimit: -1,
  },
} as const;

// ── Plan Prices (in paise) ───────────────────────────
export const PLAN_PRICES = {
  free: 0,
  starter: 199900,    // ₹1,999
  pro: 399900,        // ₹3,999
  premium: 799900,    // ₹7,999
} as const;

// ── GST Rate ─────────────────────────────────────────
export const GST_RATE = 0.18;

// ── Revision Credit Price (in paise) ─────────────────
export const REVISION_CREDIT_PRICE = 29900; // ₹299
export const REVISION_CREDIT_PRICE_PREMIUM = 19900; // ₹199

// ── Build Timeouts ───────────────────────────────────
export const BUILD_TIMEOUT_MS = 60 * 60 * 1000; // 60 minutes
export const BUILD_POLL_INTERVAL_MS = 30 * 1000; // 30 seconds
export const BUILD_MAX_RETRIES = 2;

// ── S3 Paths ─────────────────────────────────────────
export const S3_PATHS = {
  ICONS: 'assets/icons',
  SPLASH: 'assets/splash',
  BUILDS: 'builds',
  INVOICES: 'invoices',
} as const;

// ── S3 Signed URL Expiry ────────────────────────────
export const DOWNLOAD_URL_EXPIRY_SECONDS = 3600; // 1 hour

// ── MintWallet ───────────────────────────────────────
export const WALLET_MIN_TOPUP = 10000; // ₹100 in paise
