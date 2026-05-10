import {
  Injectable,
  NotFoundException,
  BadRequestException,
  ForbiddenException,
  Logger,
} from '@nestjs/common';
import { InjectQueue } from '@nestjs/bullmq';
import { Queue } from 'bullmq';
import * as path from 'path';
import * as os from 'os';
import * as fs from 'fs-extra';
// eslint-disable-next-line @typescript-eslint/no-require-imports
const archiver = require('archiver') as typeof import('archiver');
import { Response } from 'express';
import { PrismaService } from '../../database/prisma.service';
import { StorageService } from '../../services/storage/storage.service';
import { PLAN_LIMITS, QUEUE_NAMES, S3_PATHS } from '../../common/constants';
import { RevisionsService } from '../revisions/revisions.service';
import { OrgPlan, BuildPlatform } from '@prisma/client';

@Injectable()
export class BuildsService {
  private readonly logger = new Logger(BuildsService.name);

  constructor(
    private prisma: PrismaService,
    private storage: StorageService,
    private revisions: RevisionsService,
    @InjectQueue(QUEUE_NAMES.BUILD_STANDARD) private standardQueue: Queue,
    @InjectQueue(QUEUE_NAMES.BUILD_PRIORITY) private priorityQueue: Queue,
    @InjectQueue(QUEUE_NAMES.BUILD_IMMEDIATE) private immediateQueue: Queue,
    @InjectQueue(QUEUE_NAMES.BUILD_FREE) private freeQueue: Queue,
  ) {}

  async triggerBuild(orgId: string, appId: string, platform?: BuildPlatform) {
    // Fetch app and org
    const app = await this.prisma.app.findFirst({
      where: { id: appId, orgId, deletedAt: null },
    });
    if (!app) throw new NotFoundException('App not found');

    const org = await this.prisma.organisation.findUnique({ where: { id: orgId } });
    if (!org) throw new NotFoundException('Organisation not found');

    // Determine platform
    const planLimits = PLAN_LIMITS[org.plan as keyof typeof PLAN_LIMITS];
    const buildPlatform = platform || (planLimits.iosSupport ? 'both' : 'android');

    if (buildPlatform !== 'android' && !planLimits.iosSupport) {
      throw new ForbiddenException('iOS builds require Pro plan or higher');
    }

    // Check revision credits
    const canBuild = await this.revisions.canBuild(appId);
    if (!canBuild) {
      throw new ForbiddenException('No revision credits available. Purchase additional credits.');
    }

    // Validate config
    const config = app.configJson as Record<string, unknown>;
    if (!config || !app.url) {
      throw new BadRequestException('App must have a URL and basic config before building');
    }

    // Get purchased addons for this specific app
    const addons = await this.prisma.addonPurchase.findMany({
      where: { appId, orgId, isActive: true },
    });

    // Get next build number
    const lastBuild = await this.prisma.build.findFirst({
      where: { appId },
      orderBy: { buildNumber: 'desc' },
    });
    const buildNumber = (lastBuild?.buildNumber || 0) + 1;

    // Create build record
    const build = await this.prisma.build.create({
      data: {
        appId,
        orgId,
        status: 'pending',
        queue: planLimits.buildQueue,
        platform: buildPlatform,
        buildNumber,
        configSnapshot: config as any,
        addonsSnapshot: addons.map((a) => ({ slug: a.addonSlug, isActive: a.isActive })) as any,
        revisionUsed: true,
      },
    });

    // Consume revision
    await this.revisions.consumeRevision(appId);

    // Enqueue to appropriate queue
    const queue = this.getQueue(planLimits.buildQueue);
    await queue.add(
      'build',
      {
        buildId: build.id,
        appId,
        orgId,
      },
      {
        attempts: 3,
        backoff: { type: 'exponential', delay: 30000 },
        removeOnComplete: { count: 100 },
        removeOnFail: { count: 50 },
      },
    );

    this.logger.log(`Build ${build.id} enqueued to ${planLimits.buildQueue} queue`);

    return {
      buildId: build.id,
      buildNumber,
      status: build.status,
      queue: build.queue,
      platform: build.platform,
    };
  }

  async getBuildHistory(orgId: string, appId: string, page = 1, limit = 10) {
    const org = await this.prisma.organisation.findUnique({ where: { id: orgId } });
    const historyLimit = PLAN_LIMITS[(org?.plan || 'free') as keyof typeof PLAN_LIMITS].buildHistoryLimit;

    const effectiveLimit = historyLimit === -1 ? limit : Math.min(limit, historyLimit);

    const [builds, total] = await Promise.all([
      this.prisma.build.findMany({
        where: { appId, orgId },
        orderBy: { createdAt: 'desc' },
        skip: (page - 1) * effectiveLimit,
        take: effectiveLimit,
        select: {
          id: true,
          buildNumber: true,
          status: true,
          platform: true,
          queue: true,
          apkUrl: true,
          aabUrl: true,
          ipaUrl: true,
          sourceZipUrl: true,
          errorMessage: true,
          buildDurationMs: true,
          startedAt: true,
          completedAt: true,
          createdAt: true,
          revisionUsed: true,
        },
      }),
      this.prisma.build.count({ where: { appId, orgId } }),
    ]);

    return {
      data: builds,
      meta: { total, page, limit: effectiveLimit, totalPages: Math.ceil(total / effectiveLimit) },
    };
  }

  async getBuildDetails(orgId: string, buildId: string) {
    const build = await this.prisma.build.findFirst({
      where: { id: buildId, orgId },
    });

    if (!build) throw new NotFoundException('Build not found');
    return build;
  }

  async retryBuild(orgId: string, buildId: string) {
    const build = await this.prisma.build.findFirst({
      where: { id: buildId, orgId, status: 'failed' },
    });

    if (!build) throw new NotFoundException('Failed build not found');

    // Reset build status
    await this.prisma.build.update({
      where: { id: buildId },
      data: {
        status: 'pending',
        errorMessage: null,
        errorCode: null,
        retryCount: { increment: 1 },
      },
    });

    // Re-enqueue
    const queue = this.getQueue(build.queue);
    await queue.add('build', {
      buildId,
      appId: build.appId,
      orgId,
    });

    return { retried: true, buildId };
  }

  async getDownloadUrl(orgId: string, buildId: string, artifact: 'apk' | 'aab' | 'ipa') {
    const build = await this.prisma.build.findFirst({
      where: { id: buildId, orgId, status: 'completed' },
    });

    if (!build) throw new NotFoundException('Completed build not found');

    const urlField = `${artifact}Url` as 'apkUrl' | 'aabUrl' | 'ipaUrl';
    const s3Key = build[urlField];

    if (!s3Key) throw new NotFoundException(`${artifact.toUpperCase()} not available for this build`);

    const signedUrl = await this.storage.getSignedDownloadUrl(s3Key);
    return { url: signedUrl, artifact };
  }

  async streamSourceZip(orgId: string, appId: string, buildId: string, res: Response) {
    const build = await this.prisma.build.findFirst({
      where: { id: buildId, orgId, appId },
    });
    if (!build) throw new NotFoundException('Build not found');

    // Try local workDir first (dev mode), then fallback to S3 signed URL
    const workDir = path.join(os.tmpdir(), 'quickapps-builds', buildId);
    const localExists = await fs.pathExists(workDir);

    if (localExists) {
      // Stream zip of local dir
      const filename = `quickapps-source-build${build.buildNumber}.zip`;
      res.setHeader('Content-Type', 'application/zip');
      res.setHeader('Content-Disposition', `attachment; filename="${filename}"`);

      const archive = archiver('zip', { zlib: { level: 9 } });
      archive.on('error', (err) => { throw err; });
      archive.pipe(res);
      archive.directory(workDir, false);
      await archive.finalize();
      return;
    }

    // Fallback: redirect to S3 signed URL for source zip
    if (build.sourceZipUrl) {
      const signedUrl = await this.storage.getSignedDownloadUrl(build.sourceZipUrl);
      res.redirect(signedUrl);
      return;
    }

    throw new NotFoundException('Build source not available. The build directory has been cleaned up and no source zip was uploaded to storage.');
  }

  private getQueue(queueTier: string): Queue {
    switch (queueTier) {
      case 'immediate': return this.immediateQueue;
      case 'priority': return this.priorityQueue;
      case 'free': return this.freeQueue;
      default: return this.standardQueue;
    }
  }
}
