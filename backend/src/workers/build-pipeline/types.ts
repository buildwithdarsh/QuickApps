export interface BuildContext {
  buildId: string;
  appId: string;
  orgId: string;

  app: {
    name: string;
    bundleId: string;
    url: string;
    configJson: AppConfig;
    iconUrl?: string | null;
    splashBgUrl?: string | null;
    splashLogoUrl?: string | null;
    noInternetBgUrl?: string | null;
    noInternetLogoUrl?: string | null;
    pageLoaderUrl?: string | null;
  };

  build: {
    platform: 'android' | 'ios' | 'both';
    buildNumber: number;
    queue: string;
  };

  org: {
    slug: string;
    plan: string;
  };

  decryptedAddons: DecryptedAddon[];
  workDir: string;
}

export interface AppConfig {
  identity: {
    appName: string;
    bundleId: string;
    url: string;
    shortDescription?: string;
    longDescription?: string;
  };
  branding: {
    themeColor: string;
    splashBgColor?: string;
    splashDuration?: number;
    splashAnimation?: string;
  };
  display: {
    orientation: string;
    statusBarStyle?: string;
    statusBarColor?: string;
    pullToRefresh?: boolean;
    pinchToZoom?: boolean;
    navigationProgressBar?: boolean;
  };
  links: {
    customUrlScheme?: string;
    domainWhitelist?: string[];
    domainBlacklist?: string[];
  };
  security: {
    sslEnforcement?: boolean;
    disableScreenshots?: boolean;
    clipboardControl?: boolean;
    customUserAgent?: string;
    disableCaching?: boolean;
  };
  noInternet: {
    headingText?: string;
    bodyText?: string;
    retryButtonLabel?: string;
    retryButtonColor?: string;
  };
  advanced: {
    jsBridgeEnabled?: boolean;
    appVersionName?: string;
    appVersionCode?: number;
  };
}

export interface DecryptedAddon {
  slug: string;
  isActive: boolean;
  config: Record<string, unknown> | null;
  capacitorPlugin?: string;
}

export interface StepResult {
  success: boolean;
  duration: number;
  step: string;
  error?: string;
  data?: Record<string, unknown>;
}

export type PipelineStep = (ctx: BuildContext) => Promise<StepResult>;

export interface ArtifactUrls {
  apkUrl?: string;
  aabUrl?: string;
  ipaUrl?: string;
  sourceZipUrl?: string;
}

export const BUILD_ERROR_CODES = {
  CONFIG_INVALID: 'CONFIG_INVALID',
  ASSET_INVALID: 'ASSET_INVALID',
  ASSET_DOWNLOAD_FAILED: 'ASSET_DOWNLOAD_FAILED',
  NPM_INSTALL_FAILED: 'NPM_INSTALL_FAILED',
  CAP_SYNC_FAILED: 'CAP_SYNC_FAILED',
  EAS_BUILD_FAILED: 'EAS_BUILD_FAILED',
  EAS_TIMEOUT: 'EAS_TIMEOUT',
  EAS_CANCELLED: 'EAS_CANCELLED',
  ARTIFACT_DOWNLOAD_FAILED: 'ARTIFACT_DOWNLOAD_FAILED',
  S3_UPLOAD_FAILED: 'S3_UPLOAD_FAILED',
  ADDON_CONFIG_INVALID: 'ADDON_CONFIG_INVALID',
  UNKNOWN: 'UNKNOWN',
} as const;
