import * as path from 'path';
import * as fs from 'fs-extra';
import * as xml2js from 'xml2js';
import * as plist from 'plist';
import { BuildContext, StepResult } from '../types';
import { ANDROID_MANIFEST_MAP } from '../constants/android-permissions';
import { IOS_PLIST_MAP } from '../constants/ios-permissions';

export async function nativeConfigStep(ctx: BuildContext): Promise<StepResult> {
  const start = Date.now();
  try {
    const { decryptedAddons, workDir, build } = ctx;
    const platform = build.platform;

    // ── Android Modifications ────────────────────────

    if (platform === 'android' || platform === 'both') {
      await modifyAndroidManifest(workDir, decryptedAddons.map(a => a.slug));
      await modifyAndroidStrings(workDir, ctx.app.name);
      await modifyAndroidColors(workDir, ctx.app.configJson.branding.themeColor);
    }

    // ── iOS Modifications ────────────────────────────

    if (platform === 'ios' || platform === 'both') {
      await modifyInfoPlist(workDir, ctx, decryptedAddons.map(a => a.slug));
    }

    return { success: true, duration: Date.now() - start, step: 'native-config' };
  } catch (error) {
    return {
      success: false, duration: Date.now() - start, step: 'native-config',
      error: (error as Error).message,
    };
  }
}

// ── Android ─────────────────────────────────────────

async function modifyAndroidManifest(workDir: string, addonSlugs: string[]) {
  const manifestPath = path.join(workDir, 'android', 'app', 'src', 'main', 'AndroidManifest.xml');
  if (!(await fs.pathExists(manifestPath))) return;

  const xml = await fs.readFile(manifestPath, 'utf-8');
  const parsed = await xml2js.parseStringPromise(xml);

  const manifest = parsed.manifest;
  if (!manifest['uses-permission']) manifest['uses-permission'] = [];
  if (!manifest['uses-feature']) manifest['uses-feature'] = [];

  const app = manifest.application?.[0];
  if (app && !app['meta-data']) app['meta-data'] = [];
  if (app && !app['receiver']) app['receiver'] = [];

  // Collect all needed permissions
  const allPermissions = new Set<string>();
  const allMetaData: { name: string; value: string }[] = [];
  const allFeatures: { name: string; required: boolean }[] = [];
  const allReceivers: { name: string; actions: string[] }[] = [];

  for (const slug of addonSlugs) {
    const entry = ANDROID_MANIFEST_MAP[slug];
    if (!entry) continue;

    entry.permissions.forEach(p => allPermissions.add(p));
    if (entry.metaData) allMetaData.push(...entry.metaData);
    if (entry.features) allFeatures.push(...entry.features);
    if (entry.receivers) allReceivers.push(...entry.receivers);
  }

  // Add permissions
  const existingPerms = new Set(
    manifest['uses-permission'].map((p: Record<string, Record<string, string>>) => p.$?.['android:name']),
  );
  for (const perm of allPermissions) {
    const fullPerm = perm.startsWith('android.permission.') ? perm : `android.permission.${perm}`;
    if (!existingPerms.has(fullPerm)) {
      manifest['uses-permission'].push({ $: { 'android:name': fullPerm } });
    }
  }

  // Add features
  for (const feature of allFeatures) {
    manifest['uses-feature'].push({
      $: { 'android:name': feature.name, 'android:required': String(feature.required ?? false) },
    });
  }

  // Add meta-data to application
  if (app) {
    for (const meta of allMetaData) {
      app['meta-data'].push({
        $: { 'android:name': meta.name, 'android:value': meta.value },
      });
    }

    // Add receivers
    for (const receiver of allReceivers) {
      app['receiver'].push({
        $: { 'android:name': receiver.name, 'android:exported': 'false' },
        'intent-filter': [{
          action: receiver.actions.map(a => ({ $: { 'android:name': a } })),
        }],
      });
    }
  }

  // Write back
  const builder = new xml2js.Builder({ renderOpts: { pretty: true, indent: '    ' } });
  await fs.writeFile(manifestPath, builder.buildObject(parsed));
}

async function modifyAndroidStrings(workDir: string, appName: string) {
  const stringsPath = path.join(workDir, 'android', 'app', 'src', 'main', 'res', 'values', 'strings.xml');
  await fs.ensureDir(path.dirname(stringsPath));

  const xml = `<?xml version="1.0" encoding="utf-8"?>
<resources>
    <string name="app_name">${escapeXml(appName)}</string>
    <string name="title_activity_main">${escapeXml(appName)}</string>
    <string name="package_name">{{PACKAGE_NAME}}</string>
    <string name="custom_url_scheme">{{URL_SCHEME}}</string>
</resources>`;
  await fs.writeFile(stringsPath, xml);
}

async function modifyAndroidColors(workDir: string, themeColor: string) {
  const colorsPath = path.join(workDir, 'android', 'app', 'src', 'main', 'res', 'values', 'colors.xml');
  await fs.ensureDir(path.dirname(colorsPath));

  const xml = `<?xml version="1.0" encoding="utf-8"?>
<resources>
    <color name="colorPrimary">${themeColor}</color>
    <color name="colorPrimaryDark">${themeColor}</color>
    <color name="colorAccent">${themeColor}</color>
    <color name="splash_bg">${themeColor}</color>
</resources>`;
  await fs.writeFile(colorsPath, xml);
}

// ── iOS ─────────────────────────────────────────────

async function modifyInfoPlist(workDir: string, ctx: BuildContext, addonSlugs: string[]) {
  const plistPath = path.join(workDir, 'ios', 'App', 'App', 'Info.plist');
  if (!(await fs.pathExists(plistPath))) return;

  const raw = await fs.readFile(plistPath, 'utf-8');
  let parsed: Record<string, unknown>;
  try {
    parsed = plist.parse(raw) as Record<string, unknown>;
  } catch {
    // If no valid plist exists, create a base one
    parsed = {};
  }

  // Set basic app info
  parsed['CFBundleDisplayName'] = ctx.app.name;
  parsed['CFBundleName'] = ctx.app.name;
  parsed['CFBundleIdentifier'] = ctx.app.bundleId;
  parsed['CFBundleShortVersionString'] = ctx.app.configJson.advanced.appVersionName ?? '1.0.0';
  parsed['CFBundleVersion'] = String(ctx.app.configJson.advanced.appVersionCode ?? ctx.build.buildNumber);

  // URL scheme
  if (ctx.app.configJson.links.customUrlScheme) {
    parsed['CFBundleURLTypes'] = [{
      CFBundleURLSchemes: [ctx.app.configJson.links.customUrlScheme],
    }];
  }

  // Collect background modes
  const backgroundModes = new Set<string>();

  // Add addon-specific plist entries
  for (const slug of addonSlugs) {
    const entry = IOS_PLIST_MAP[slug];
    if (!entry) continue;

    // Add permission description keys
    for (const [key, value] of Object.entries(entry.keys)) {
      if (typeof value === 'string') {
        parsed[key] = value;
      }
    }

    // Collect background modes
    if (entry.backgroundModes) {
      entry.backgroundModes.forEach(m => backgroundModes.add(m));
    }
  }

  // Write background modes if any
  if (backgroundModes.size > 0) {
    parsed['UIBackgroundModes'] = Array.from(backgroundModes);
  }

  // Write back
  const output = plist.build(parsed as plist.PlistObject);
  await fs.writeFile(plistPath, output);
}

// ── Helpers ─────────────────────────────────────────

function escapeXml(str: string): string {
  return str
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&apos;');
}
