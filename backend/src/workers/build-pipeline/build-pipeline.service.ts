import { Injectable, Logger } from '@nestjs/common';
import * as path from 'path';
import * as os from 'os';
import * as fs from 'fs-extra';
import { PrismaService } from '../../database/prisma.service';
import { StorageService } from '../../services/storage/storage.service';
import { EncryptionService } from '../../services/encryption/encryption.service';
import { BuildContext, StepResult, ArtifactUrls, BUILD_ERROR_CODES } from './types';

// Pipeline steps
import { scaffoldStep } from './steps/scaffold.step';
import { assetsStep } from './steps/assets.step';
import { addonsStep } from './steps/addons.step';
import { nativeConfigStep } from './steps/native-config.step';
import { easBuildStep } from './steps/eas-build.step';
import { localBuildStep } from './steps/local-build.step';
import { uploadStep } from './steps/upload.step';
import { cleanupStep } from './steps/cleanup.step';

@Injectable()
export class BuildPipelineService {
  private readonly logger = new Logger(BuildPipelineService.name);

  constructor(
    private prisma: PrismaService,
    private storage: StorageService,
    private encryption: EncryptionService,
  ) {}

  async execute(buildId: string, appId: string, orgId: string): Promise<void> {
    const pipelineStart = Date.now();
    let ctx: BuildContext | null = null;

    try {
      // ── 1. Fetch build context ────────────────────

      await this.updateBuildStatus(buildId, 'preparing');

      const [build, app, org] = await Promise.all([
        this.prisma.build.findUnique({ where: { id: buildId } }),
        this.prisma.app.findUnique({ where: { id: appId } }),
        this.prisma.organisation.findUnique({ where: { id: orgId } }),
      ]);

      if (!build || !app || !org) {
        throw new Error('Build, app, or org not found');
      }

      // Decrypt addon configs
      const addonPurchases = await this.prisma.addonPurchase.findMany({
        where: { appId, orgId, isActive: true },
      });

      const decryptedAddons = addonPurchases.map(p => ({
        slug: p.addonSlug,
        isActive: p.isActive,
        config: p.configJson ? JSON.parse(this.encryption.decrypt(p.configJson)) : null,
      }));

      // Create work directory
      const workDir = path.join(os.tmpdir(), 'quickapps-builds', buildId);
      await fs.ensureDir(workDir);

      ctx = {
        buildId,
        appId,
        orgId,
        app: {
          name: app.name,
          bundleId: app.bundleId,
          url: app.url,
          configJson: (build.configSnapshot ?? app.configJson) as unknown as BuildContext['app']['configJson'],
          iconUrl: app.iconUrl,
          splashBgUrl: app.splashBgUrl,
          splashLogoUrl: app.splashLogoUrl,
          noInternetBgUrl: app.noInternetBgUrl,
          noInternetLogoUrl: app.noInternetLogoUrl,
          pageLoaderUrl: app.pageLoaderUrl,
        },
        build: {
          platform: build.platform as 'android' | 'ios' | 'both',
          buildNumber: build.buildNumber,
          queue: build.queue,
        },
        org: { slug: org.slug, plan: org.plan },
        decryptedAddons,
        workDir,
      };

      this.logger.log(`Build ${buildId} started — ${app.name} (${build.platform}) with ${decryptedAddons.length} addons`);

      // ── 2. Run pipeline steps ─────────────────────

      // Required pipeline steps (must all pass)
      const requiredSteps: { name: string; fn: () => Promise<StepResult> }[] = [
        { name: 'scaffold', fn: () => scaffoldStep(ctx!) },
        { name: 'assets', fn: () => assetsStep(ctx!) },
        { name: 'addons', fn: () => addonsStep(ctx!) },
        { name: 'native-config', fn: () => nativeConfigStep(ctx!) },
      ];

      const stepResults: StepResult[] = [];

      for (const step of requiredSteps) {
        this.logger.log(`Build ${buildId} — running step: ${step.name}`);
        const result = await step.fn();
        stepResults.push(result);

        if (!result.success) {
          this.logger.error(`Build ${buildId} — step ${step.name} failed: ${result.error}`);
          await this.failBuild(buildId, result.error ?? 'Unknown error', result.data?.['errorCode'] as string);
          return;
        }

        this.logger.log(`Build ${buildId} — step ${step.name} completed in ${result.duration}ms`);
      }

      // ── Build step (EAS cloud or local Gradle) ──

      await this.updateBuildStatus(buildId, 'building');
      let artifacts: ArtifactUrls = {};
      const hasEas = !!process.env['EXPO_TOKEN'];

      if (hasEas) {
        // Cloud build via EAS
        const easResult = await easBuildStep(ctx!);
        stepResults.push(easResult);

        if (easResult.success) {
          artifacts = (easResult.data?.['artifacts'] ?? {}) as ArtifactUrls;
        } else {
          this.logger.error(`Build ${buildId} — eas-build failed: ${easResult.error}`);
          await this.failBuild(buildId, easResult.error ?? 'EAS Build failed', easResult.data?.['errorCode'] as string);
          return;
        }
      } else {
        // Local build via npm install + cap sync + Gradle
        this.logger.log(`Build ${buildId} — EXPO_TOKEN not set, using local build`);
        const localResult = await localBuildStep(ctx!);
        stepResults.push(localResult);

        if (localResult.success) {
          artifacts = (localResult.data?.['artifacts'] ?? {}) as ArtifactUrls;
          this.logger.log(`Build ${buildId} — local build done, APK: ${artifacts.apkUrl ? 'yes' : 'no'}`);
        } else {
          this.logger.error(`Build ${buildId} — local build failed: ${localResult.error}`);
          await this.failBuild(buildId, localResult.error ?? 'Local build failed', localResult.data?.['errorCode'] as string);
          return;
        }
      }

      // ── 3. Upload artifacts ───────────────────────

      await this.updateBuildStatus(buildId, 'packaging');

      const uploadResult = await uploadStep(ctx, artifacts, this.storage);
      if (!uploadResult.success) {
        this.logger.error(`Build ${buildId} — upload failed: ${uploadResult.error}`);
        // Build succeeded but upload failed — still mark with partial success
      }

      const uploadedArtifacts = (uploadResult.data?.['artifacts'] ?? {}) as ArtifactUrls;

      // ── 4. Complete build ─────────────────────────

      await this.prisma.build.update({
        where: { id: buildId },
        data: {
          status: 'completed',
          completedAt: new Date(),
          buildDurationMs: Date.now() - pipelineStart,
          apkUrl: uploadedArtifacts.apkUrl ?? artifacts.apkUrl,
          aabUrl: uploadedArtifacts.aabUrl ?? artifacts.aabUrl,
          ipaUrl: uploadedArtifacts.ipaUrl ?? artifacts.ipaUrl,
          sourceZipUrl: uploadedArtifacts.sourceZipUrl,
        },
      });

      const totalDuration = Date.now() - pipelineStart;
      this.logger.log(`Build ${buildId} — COMPLETED in ${(totalDuration / 1000).toFixed(1)}s`);
      this.logger.log(`  Steps: ${stepResults.map(r => `${r.step}=${r.duration}ms`).join(', ')}`);

    } catch (error) {
      this.logger.error(`Build ${buildId} — pipeline error: ${(error as Error).message}`);
      await this.failBuild(buildId, (error as Error).message, BUILD_ERROR_CODES.UNKNOWN);
    } finally {
      // Cleanup — skip in dev so we can inspect output
      if (process.env['NODE_ENV'] !== 'development' && ctx) {
        await cleanupStep(ctx);
      } else if (ctx) {
        this.logger.log(`Build ${buildId} — DEV MODE: output preserved at ${ctx.workDir}`);
      }
    }
  }

  private async updateBuildStatus(buildId: string, status: string) {
    await this.prisma.build.update({
      where: { id: buildId },
      data: {
        status: status as any,
        ...(status === 'building' ? { startedAt: new Date() } : {}),
      },
    });
  }

  private async failBuild(buildId: string, errorMessage: string, errorCode?: string) {
    await this.prisma.build.update({
      where: { id: buildId },
      data: {
        status: 'failed',
        completedAt: new Date(),
        errorMessage,
        errorCode: errorCode ?? BUILD_ERROR_CODES.UNKNOWN,
      },
    });
  }
}
