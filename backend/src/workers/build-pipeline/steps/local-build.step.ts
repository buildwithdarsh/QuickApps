import * as path from 'path';
import * as fs from 'fs-extra';
import { BuildContext, StepResult, ArtifactUrls, BUILD_ERROR_CODES } from '../types';

// eslint-disable-next-line @typescript-eslint/no-require-imports
const execa = require('execa');

/**
 * Local build step — runs npm install, cap add, cap sync, and Gradle
 * to produce a real APK without needing EAS.
 *
 * This step always succeeds (to allow source zip upload).
 * Individual sub-steps that fail are logged as warnings.
 */
export async function localBuildStep(ctx: BuildContext): Promise<StepResult> {
  const start = Date.now();
  const artifacts: ArtifactUrls = {};
  const warnings: string[] = [];

  try {
    const { workDir, build } = ctx;
    const platform = build.platform;

    // ── 1. npm install ──────────────────────────────

    let npmOk = false;
    try {
      await execa('npm', ['install', '--legacy-peer-deps', '--ignore-scripts'], {
        cwd: workDir,
        timeout: 180_000,
        env: { ...process.env, NODE_ENV: 'production' },
      });
      npmOk = true;
    } catch (e) {
      warnings.push(`npm install failed: ${(e as Error).message?.split('\n')[0]}`);
    }

    if (!npmOk) {
      // Can't proceed without dependencies, but still succeed for source zip
      return {
        success: true, duration: Date.now() - start, step: 'local-build',
        data: { artifacts, warnings, localBuild: true, skippedReason: 'npm install failed' },
      };
    }

    // ── 2. Capacitor add + sync ─────────────────────

    let capSyncOk = false;

    if (platform === 'android' || platform === 'both') {
      if (!await fs.pathExists(path.join(workDir, 'android'))) {
        try {
          await execa('npx', ['cap', 'add', 'android'], { cwd: workDir, timeout: 120_000 });
        } catch (e) {
          warnings.push(`cap add android: ${(e as Error).message?.split('\n')[0]}`);
        }
      }
    }

    if (platform === 'ios' || platform === 'both') {
      if (!await fs.pathExists(path.join(workDir, 'ios'))) {
        try {
          await execa('npx', ['cap', 'add', 'ios'], { cwd: workDir, timeout: 120_000 });
        } catch (e) {
          warnings.push(`cap add ios: ${(e as Error).message?.split('\n')[0]}`);
        }
      }
    }

    try {
      await execa('npx', ['cap', 'sync'], { cwd: workDir, timeout: 180_000 });
      capSyncOk = true;
    } catch (e) {
      warnings.push(`cap sync: ${(e as Error).message?.split('\n')[0]}`);
    }

    // ── 3. Gradle build (Android) ───────────────────

    if (capSyncOk && (platform === 'android' || platform === 'both')) {
      const androidDir = path.join(workDir, 'android');
      const gradlew = path.join(androidDir, 'gradlew');

      if (await fs.pathExists(gradlew)) {
        await fs.chmod(gradlew, 0o755);

        try {
          await execa('./gradlew', ['assembleDebug', '--no-daemon'], {
            cwd: androidDir,
            timeout: 600_000,
            env: {
              ...process.env,
              JAVA_HOME: process.env['JAVA_HOME'] ?? '',
              ANDROID_HOME: process.env['ANDROID_HOME'] ?? process.env['ANDROID_SDK_ROOT'] ?? '',
            },
          });

          const apkPath = path.join(androidDir, 'app', 'build', 'outputs', 'apk', 'debug', 'app-debug.apk');
          if (await fs.pathExists(apkPath)) {
            artifacts.apkUrl = apkPath;
          }
        } catch (e) {
          warnings.push(`gradle build: ${(e as Error).message?.split('\n')[0]}`);
        }
      } else {
        warnings.push('gradlew not found — Android SDK or cap add android may have failed');
      }
    }

    return {
      success: true, duration: Date.now() - start, step: 'local-build',
      data: {
        artifacts,
        warnings,
        localBuild: true,
        hasApk: !!artifacts.apkUrl,
        npmOk,
        capSyncOk,
      },
    };
  } catch (error) {
    return {
      success: true, duration: Date.now() - start, step: 'local-build',
      data: { artifacts, localBuild: true, error: (error as Error).message },
    };
  }
}
