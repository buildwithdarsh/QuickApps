import * as path from 'path';
import * as fs from 'fs-extra';
import { BuildContext, StepResult, ArtifactUrls, BUILD_ERROR_CODES } from '../types';

// eslint-disable-next-line @typescript-eslint/no-require-imports
const execa = require('execa');

const EAS_POLL_INTERVAL = 30_000; // 30 seconds
const EAS_TIMEOUT = 60 * 60_000;  // 60 minutes

interface EasBuildResult {
  id: string;
  status: string;
  artifacts?: { buildUrl?: string };
  error?: { message?: string };
}

export async function easBuildStep(ctx: BuildContext): Promise<StepResult> {
  const start = Date.now();
  const artifacts: ArtifactUrls = {};

  try {
    const { workDir, build, app } = ctx;
    const platform = build.platform;
    const easToken = process.env['EXPO_TOKEN'];

    if (!easToken) {
      return {
        success: false, duration: Date.now() - start, step: 'eas-build',
        error: 'EXPO_TOKEN not configured. Cannot trigger EAS Build.',
        data: { errorCode: BUILD_ERROR_CODES.EAS_BUILD_FAILED },
      };
    }

    const env = { ...process.env, EXPO_TOKEN: easToken, EAS_BUILD_NO_EXPO_GO_WARNING: 'true' };

    // ── 1. Install dependencies ────────────────────

    console.log('[eas-build] Installing dependencies...');
    await execa('npm', ['install', '--legacy-peer-deps'], {
      cwd: workDir, env, timeout: 300_000,
    });

    // ── 2. Add Android platform + sync ─────────────

    if (platform === 'android' || platform === 'both') {
      const androidDir = path.join(workDir, 'android');
      if (!await fs.pathExists(androidDir)) {
        console.log('[eas-build] Adding Android platform...');
        await execa('npx', ['cap', 'add', 'android'], { cwd: workDir, env, timeout: 120_000 });
      }
    }

    // Sync only the platforms we're building
    if (platform === 'android' || platform === 'both') {
      console.log('[eas-build] Running cap sync android...');
      await execa('npx', ['cap', 'sync', 'android'], { cwd: workDir, env, timeout: 180_000 });
    }
    if (platform === 'ios') {
      console.log('[eas-build] Running cap sync ios...');
      await execa('npx', ['cap', 'sync', 'ios'], { cwd: workDir, env, timeout: 180_000 });
    }

    // ── 3. Initialize git repo + EAS project ────────

    if (!await fs.pathExists(path.join(workDir, '.git'))) {
      await execa('git', ['init'], { cwd: workDir, env });
    }

    // Link to EAS project (creates it if needed)
    const appJson = await fs.readJson(path.join(workDir, 'app.json'));
    if (!appJson.expo?.extra?.eas?.projectId) {
      console.log('[eas-build] Linking EAS project...');
      await execa('npx', ['eas-cli', 'init', '--non-interactive', '--force'], {
        cwd: workDir, env: { ...env, EAS_BUILD_NO_EXPO_GO_WARNING: 'true' }, timeout: 60_000,
      });
    }

    // Commit everything for EAS
    await execa('git', ['add', '.'], { cwd: workDir, env });
    try {
      await execa('git', [
        '-c', 'user.email=build@quickapps.in',
        '-c', 'user.name=QuickApps Build',
        'commit', '-m', `Build #${build.buildNumber} for ${app.name}`,
      ], { cwd: workDir, env });
    } catch {
      // Already committed or nothing to commit
    }

    // ── 4. Trigger EAS Build ───────────────────────

    if (platform === 'android' || platform === 'both') {
      console.log('[eas-build] Triggering Android APK build...');
      const apkBuildId = await triggerEasBuild(workDir, 'android', 'production', env);

      if (apkBuildId) {
        console.log(`[eas-build] Waiting for Android build ${apkBuildId}...`);
        const result = await pollEasBuild(apkBuildId, easToken);

        if (result.status === 'finished' && result.artifacts?.buildUrl) {
          artifacts.apkUrl = result.artifacts.buildUrl;
          console.log(`[eas-build] APK ready: ${artifacts.apkUrl}`);
        } else if (result.status === 'errored') {
          return {
            success: false, duration: Date.now() - start, step: 'eas-build',
            error: `Android build failed: ${result.error?.message ?? 'Unknown error'}`,
            data: { errorCode: BUILD_ERROR_CODES.EAS_BUILD_FAILED, easBuildId: apkBuildId },
          };
        }
      }
    }

    if (platform === 'ios' || platform === 'both') {
      console.log('[eas-build] Triggering iOS build...');
      const iosBuildId = await triggerEasBuild(workDir, 'ios', 'production-ios', env);

      if (iosBuildId) {
        const result = await pollEasBuild(iosBuildId, easToken);
        if (result.status === 'finished' && result.artifacts?.buildUrl) {
          artifacts.ipaUrl = result.artifacts.buildUrl;
        } else if (result.status === 'errored') {
          // iOS build failure is non-fatal if Android succeeded
          console.warn(`[eas-build] iOS build failed: ${result.error?.message}`);
        }
      }
    }

    const hasArtifacts = artifacts.apkUrl || artifacts.aabUrl || artifacts.ipaUrl;
    if (!hasArtifacts) {
      return {
        success: false, duration: Date.now() - start, step: 'eas-build',
        error: 'No build artifacts were produced by EAS',
        data: { errorCode: BUILD_ERROR_CODES.EAS_BUILD_FAILED },
      };
    }

    return {
      success: true, duration: Date.now() - start, step: 'eas-build',
      data: { artifacts },
    };
  } catch (error) {
    return {
      success: false, duration: Date.now() - start, step: 'eas-build',
      error: (error as Error).message,
      data: { errorCode: BUILD_ERROR_CODES.EAS_BUILD_FAILED },
    };
  }
}

// ── Helpers ─────────────────────────────────────────

async function triggerEasBuild(
  workDir: string,
  platform: 'android' | 'ios',
  profile: string,
  env: Record<string, string | undefined>,
): Promise<string | null> {
  try {
    const result = await execa('npx', [
      'eas-cli', 'build',
      '--platform', platform,
      '--profile', profile,
      '--non-interactive',
      '--json',
      '--no-wait',
    ], { cwd: workDir, env, timeout: 120_000 });

    const output = result.stdout;
    const parsed = JSON.parse(output);
    return parsed[0]?.id ?? parsed?.id ?? null;
  } catch (err) {
    console.error(`EAS build trigger failed for ${platform}/${profile}:`, (err as Error).message?.split('\n').slice(0, 3).join('\n'));
    return null;
  }
}

async function pollEasBuild(buildId: string, token: string): Promise<EasBuildResult> {
  const startTime = Date.now();

  while (Date.now() - startTime < EAS_TIMEOUT) {
    try {
      const res = await fetch(`https://api.expo.dev/v2/builds/${buildId}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = await res.json();
      const build = data.data ?? data;

      if (['finished', 'errored', 'canceled'].includes(build.status)) {
        return build as EasBuildResult;
      }

      console.log(`[eas-build] Build ${buildId} status: ${build.status}, waiting...`);
      await sleep(EAS_POLL_INTERVAL);
    } catch {
      await sleep(EAS_POLL_INTERVAL);
    }
  }

  return { id: buildId, status: 'errored', error: { message: 'Build timed out after 60 minutes' } };
}

function sleep(ms: number): Promise<void> {
  return new Promise(resolve => setTimeout(resolve, ms));
}
