import {
  Injectable,
  NotFoundException,
  BadRequestException,
  ForbiddenException,
} from '@nestjs/common';
import { PrismaService } from '../../database/prisma.service';
import { PLAN_LIMITS } from '../../common/constants';
import { CreateAppDto } from './dto/create-app.dto';
import { UpdateAppConfigDto } from './dto/update-app-config.dto';
import { OrgPlan } from '@prisma/client';

@Injectable()
export class AppsService {
  constructor(private prisma: PrismaService) {}

  async create(orgId: string, dto: CreateAppDto) {
    // Check plan limits
    const org = await this.prisma.organisation.findUnique({ where: { id: orgId } });
    if (!org) throw new NotFoundException('Organisation not found');

    const appCount = await this.prisma.app.count({
      where: { orgId, deletedAt: null },
    });

    const limits = PLAN_LIMITS[org.plan as keyof typeof PLAN_LIMITS];
    if (appCount >= limits.maxApps) {
      throw new ForbiddenException(`Your ${org.plan} plan allows a maximum of ${limits.maxApps} app(s)`);
    }

    // Generate bundleId if not provided
    const bundleId = dto.bundleId || this.generateBundleId(org.slug, dto.name);

    const app = await this.prisma.app.create({
      data: {
        orgId,
        name: dto.name,
        url: dto.url,
        bundleId,
        shortDescription: dto.shortDescription,
        longDescription: dto.longDescription,
        configJson: {
          identity: { appName: dto.name, bundleId, url: dto.url },
          branding: { themeColor: '#F97316', splashDuration: 2, splashAnimation: 'fade' },
          display: { orientation: 'portrait', pullToRefresh: true, pinchToZoom: false, navigationProgressBar: true },
          links: { linkRules: [], domainWhitelist: [], domainBlacklist: [] },
          security: { sslEnforcement: true, disableScreenshots: false, clipboardControl: true, disableCaching: false },
          noInternet: { headingText: 'No Internet Connection', bodyText: 'Please check your connection and try again.', retryButtonLabel: 'Try Again', retryButtonColor: '#F97316' },
          advanced: { jsBridgeEnabled: true, appVersionName: '1.0.0', appVersionCode: 1 },
        },
      },
    });

    // Create revision tracker
    const freeLimit = PLAN_LIMITS[org.plan as keyof typeof PLAN_LIMITS].freeRevisions;
    await this.prisma.revision.create({
      data: { appId: app.id, freeLimit },
    });

    return app;
  }

  async findAll(orgId: string) {
    return this.prisma.app.findMany({
      where: { orgId, deletedAt: null },
      include: {
        revision: true,
        builds: {
          orderBy: { createdAt: 'desc' },
          take: 1,
          select: {
            id: true,
            status: true,
            platform: true,
            createdAt: true,
            completedAt: true,
          },
        },
      },
      orderBy: { createdAt: 'desc' },
    });
  }

  async findOne(orgId: string, appId: string) {
    const app = await this.prisma.app.findFirst({
      where: { id: appId, orgId, deletedAt: null },
      include: {
        revision: true,
        builds: {
          orderBy: { createdAt: 'desc' },
          take: 5,
        },
      },
    });

    if (!app) throw new NotFoundException('App not found');
    return app;
  }

  async updateConfig(orgId: string, appId: string, dto: UpdateAppConfigDto) {
    const app = await this.prisma.app.findFirst({
      where: { id: appId, orgId, deletedAt: null },
    });

    if (!app) throw new NotFoundException('App not found');

    // Merge config sections
    const currentConfig = (app.configJson as Record<string, unknown> | null) || {};
    const mergedConfig: Record<string, unknown> = { ...currentConfig };

    for (const [section, values] of Object.entries(dto)) {
      if (values && typeof values === 'object') {
        mergedConfig[section] = {
          ...((currentConfig[section] as Record<string, unknown>) || {}),
          ...values,
        };
      }
    }

    return this.prisma.app.update({
      where: { id: appId },
      data: {
        configJson: mergedConfig as any,
        status: 'configured',
      },
    });
  }

  async updateBasicInfo(orgId: string, appId: string, data: {
    name?: string;
    url?: string;
    shortDescription?: string;
    longDescription?: string;
  }) {
    const app = await this.prisma.app.findFirst({
      where: { id: appId, orgId, deletedAt: null },
    });

    if (!app) throw new NotFoundException('App not found');
    return this.prisma.app.update({ where: { id: appId }, data });
  }

  async softDelete(orgId: string, appId: string) {
    const app = await this.prisma.app.findFirst({
      where: { id: appId, orgId, deletedAt: null },
    });

    if (!app) throw new NotFoundException('App not found');

    return this.prisma.app.update({
      where: { id: appId },
      data: { deletedAt: new Date() },
    });
  }

  private generateBundleId(orgSlug: string, appName: string): string {
    const cleanOrg = orgSlug.replace(/[^a-z0-9]/g, '').slice(0, 20);
    const cleanApp = appName.toLowerCase().replace(/[^a-z0-9]/g, '').slice(0, 20);
    return `com.quickapps.${cleanOrg}.${cleanApp}`;
  }
}
