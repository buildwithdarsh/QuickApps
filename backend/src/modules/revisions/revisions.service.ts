import { Injectable, NotFoundException, ForbiddenException } from '@nestjs/common';
import { PrismaService } from '../../database/prisma.service';

@Injectable()
export class RevisionsService {
  constructor(private prisma: PrismaService) {}

  async getStatus(appId: string, orgId: string) {
    const revision = await this.prisma.revision.findFirst({
      where: { app: { id: appId, orgId } },
    });

    if (!revision) throw new NotFoundException('Revision tracker not found');

    const totalAvailable = revision.freeLimit + revision.extraPurchased;
    const remaining = totalAvailable - revision.usedCount;

    return {
      usedCount: revision.usedCount,
      freeLimit: revision.freeLimit,
      extraPurchased: revision.extraPurchased,
      totalAvailable,
      remaining,
      cycleStart: revision.cycleStart,
    };
  }

  async canBuild(appId: string): Promise<boolean> {
    const revision = await this.prisma.revision.findUnique({
      where: { appId },
    });

    if (!revision) return false;

    const totalAvailable = revision.freeLimit + revision.extraPurchased;
    return revision.usedCount < totalAvailable;
  }

  async consumeRevision(appId: string): Promise<void> {
    const revision = await this.prisma.revision.findUnique({ where: { appId } });
    if (!revision) throw new NotFoundException('Revision tracker not found');

    const totalAvailable = revision.freeLimit + revision.extraPurchased;
    if (revision.usedCount >= totalAvailable) {
      throw new ForbiddenException('No revision credits available. Purchase additional credits to build.');
    }

    await this.prisma.revision.update({
      where: { appId },
      data: { usedCount: { increment: 1 } },
    });
  }

  async refundRevision(appId: string): Promise<void> {
    const revision = await this.prisma.revision.findUnique({ where: { appId } });
    if (!revision || revision.usedCount <= 0) return;

    await this.prisma.revision.update({
      where: { appId },
      data: { usedCount: { decrement: 1 } },
    });
  }

  async addExtraCredits(appId: string, count: number): Promise<void> {
    await this.prisma.revision.update({
      where: { appId },
      data: { extraPurchased: { increment: count } },
    });
  }
}
