import { IsObject, IsOptional, IsString, IsBoolean, IsNumber, Min, Max, IsEnum } from 'class-validator';
import { ApiPropertyOptional } from '@nestjs/swagger';
import { Type } from 'class-transformer';

// ── Section 1: Identity ──────────────────────────────
export class AppIdentityConfig {
  @IsOptional() @IsString() appName?: string;
  @IsOptional() @IsString() bundleId?: string;
  @IsOptional() @IsString() url?: string;
  @IsOptional() @IsString() shortDescription?: string;
  @IsOptional() @IsString() longDescription?: string;
}

// ── Section 2: Branding ──────────────────────────────
export class AppBrandingConfig {
  @IsOptional() @IsString() themeColor?: string;
  @IsOptional() @IsString() splashBgColor?: string;
  @IsOptional() @IsNumber() @Min(1) @Max(5) splashDuration?: number;
  @IsOptional() @IsString() splashAnimation?: string; // fade | slide-up | zoom | none
}

// ── Section 3: Display & Navigation ──────────────────
export class AppDisplayConfig {
  @IsOptional() @IsString() orientation?: string; // portrait | landscape | auto
  @IsOptional() @IsString() statusBarStyle?: string; // light | dark | match-theme
  @IsOptional() @IsString() statusBarColor?: string;
  @IsOptional() @IsBoolean() pullToRefresh?: boolean;
  @IsOptional() @IsBoolean() pinchToZoom?: boolean;
  @IsOptional() @IsBoolean() navigationProgressBar?: boolean;
}

// ── Section 4: Links & Routing ───────────────────────
export class LinkRule {
  @IsString() urlPattern: string;
  @IsString() action: string; // internal | in-app-browser | external
}

export class AppLinksConfig {
  @IsOptional() linkRules?: LinkRule[];
  @IsOptional() domainWhitelist?: string[];
  @IsOptional() domainBlacklist?: string[];
  @IsOptional() @IsString() customUrlScheme?: string;
}

// ── Section 5: Security ──────────────────────────────
export class AppSecurityConfig {
  @IsOptional() @IsBoolean() sslEnforcement?: boolean;
  @IsOptional() @IsBoolean() disableScreenshots?: boolean;
  @IsOptional() @IsBoolean() clipboardControl?: boolean;
  @IsOptional() @IsString() customUserAgent?: string;
  @IsOptional() @IsBoolean() disableCaching?: boolean;
}

// ── Section 6: No Internet Screen ────────────────────
export class AppNoInternetConfig {
  @IsOptional() @IsString() headingText?: string;
  @IsOptional() @IsString() bodyText?: string;
  @IsOptional() @IsString() retryButtonLabel?: string;
  @IsOptional() @IsString() retryButtonColor?: string;
}

// ── Section 7: Advanced ──────────────────────────────
export class AppAdvancedConfig {
  @IsOptional() @IsBoolean() jsBridgeEnabled?: boolean;
  @IsOptional() @IsString() appVersionName?: string;
  @IsOptional() @IsNumber() appVersionCode?: number;
  @IsOptional() @IsString() minAndroidSdk?: string;
  @IsOptional() @IsString() minIosVersion?: string;
}

// ── Full Config ──────────────────────────────────────
export class UpdateAppConfigDto {
  @ApiPropertyOptional()
  @IsOptional()
  @IsObject()
  @Type(() => AppIdentityConfig)
  identity?: AppIdentityConfig;

  @ApiPropertyOptional()
  @IsOptional()
  @IsObject()
  @Type(() => AppBrandingConfig)
  branding?: AppBrandingConfig;

  @ApiPropertyOptional()
  @IsOptional()
  @IsObject()
  @Type(() => AppDisplayConfig)
  display?: AppDisplayConfig;

  @ApiPropertyOptional()
  @IsOptional()
  @IsObject()
  @Type(() => AppLinksConfig)
  links?: AppLinksConfig;

  @ApiPropertyOptional()
  @IsOptional()
  @IsObject()
  @Type(() => AppSecurityConfig)
  security?: AppSecurityConfig;

  @ApiPropertyOptional()
  @IsOptional()
  @IsObject()
  @Type(() => AppNoInternetConfig)
  noInternet?: AppNoInternetConfig;

  @ApiPropertyOptional()
  @IsOptional()
  @IsObject()
  @Type(() => AppAdvancedConfig)
  advanced?: AppAdvancedConfig;
}
