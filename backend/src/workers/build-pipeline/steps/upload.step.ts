import * as fs from 'fs-extra';
import { BuildContext, StepResult, ArtifactUrls, BUILD_ERROR_CODES } from '../types';
import { StorageService } from '../../../services/storage/storage.service';

// eslint-disable-next-line @typescript-eslint/no-require-imports
const archiverLib = require('archiver') as typeof import('archiver');

export async function uploadStep(
  ctx: BuildContext,
  artifacts: ArtifactUrls,
  storage: StorageService,
): Promise<StepResult> {
  const start = Date.now();
  try {
    const { buildId, appId, orgId, workDir } = ctx;
    const uploaded: ArtifactUrls = {};

    // ── 1. Upload build artifacts (APK/AAB/IPA) ──
    // Artifacts can be URLs (from EAS) or local file paths (from Gradle)

    if (artifacts.apkUrl) {
      const buffer = await getArtifactBuffer(artifacts.apkUrl);
      const key = `builds/${orgId}/${appId}/${buildId}/app-release.apk`;
      await storage.uploadBuffer(key, buffer, 'application/vnd.android.package-archive');
      uploaded.apkUrl = key;
    }

    if (artifacts.aabUrl) {
      const buffer = await getArtifactBuffer(artifacts.aabUrl);
      const key = `builds/${orgId}/${appId}/${buildId}/app-release.aab`;
      await storage.uploadBuffer(key, buffer, 'application/octet-stream');
      uploaded.aabUrl = key;
    }

    if (artifacts.ipaUrl) {
      const buffer = await getArtifactBuffer(artifacts.ipaUrl);
      const key = `builds/${orgId}/${appId}/${buildId}/app.ipa`;
      await storage.uploadBuffer(key, buffer, 'application/octet-stream');
      uploaded.ipaUrl = key;
    }

    // ── 2. Always upload source zip to S3 ──

    const sourceKey = `builds/${orgId}/${appId}/${buildId}/source.zip`;
    if (await fs.pathExists(workDir)) {
      const zipBuffer = await createZipBuffer(workDir);
      await storage.uploadBuffer(sourceKey, zipBuffer, 'application/zip');
      uploaded.sourceZipUrl = sourceKey;
    }

    return {
      success: true, duration: Date.now() - start, step: 'upload',
      data: { artifacts: uploaded },
    };
  } catch (error) {
    return {
      success: false, duration: Date.now() - start, step: 'upload',
      error: (error as Error).message,
      data: { errorCode: BUILD_ERROR_CODES.S3_UPLOAD_FAILED },
    };
  }
}

/** Reads an artifact from a URL or local file path */
async function getArtifactBuffer(urlOrPath: string): Promise<Buffer> {
  // Local file path (from Gradle build)
  if (urlOrPath.startsWith('/') || urlOrPath.match(/^[A-Z]:\\/i)) {
    if (await fs.pathExists(urlOrPath)) {
      return fs.readFile(urlOrPath);
    }
    throw new Error(`Local artifact not found: ${urlOrPath}`);
  }

  // Remote URL (from EAS build)
  const res = await fetch(urlOrPath);
  if (!res.ok) throw new Error(`Failed to download artifact: ${res.status}`);
  return Buffer.from(await res.arrayBuffer());
}

async function createZipBuffer(dir: string): Promise<Buffer> {
  return new Promise((resolve, reject) => {
    const archive = archiverLib('zip', { zlib: { level: 6 } });
    const chunks: Buffer[] = [];

    archive.on('data', (chunk: Buffer) => chunks.push(chunk));
    archive.on('end', () => resolve(Buffer.concat(chunks)));
    archive.on('error', (err) => reject(err));

    archive.directory(dir, false);
    archive.finalize();
  });
}
