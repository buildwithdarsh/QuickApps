import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../database/prisma.service';
import { PaginationDto } from '../../common/dto/pagination.dto';

@Injectable()
export class AdminService {
  constructor(private prisma: PrismaService) {}

  async getStats() {
    const [orgCount, userCount, appCount, buildCount, completedBuilds, revenue] =
      await Promise.all([
        this.prisma.organisation.count({ where: { deletedAt: null } }),
        this.prisma.user.count({ where: { deletedAt: null } }),
        this.prisma.app.count({ where: { deletedAt: null } }),
        this.prisma.build.count(),
        this.prisma.build.count({ where: { status: 'completed' } }),
        this.prisma.payment.aggregate({
          where: { status: 'completed' },
          _sum: { totalAmount: true },
        }),
      ]);

    return {
      organisations: orgCount,
      users: userCount,
      apps: appCount,
      totalBuilds: buildCount,
      completedBuilds,
      totalRevenue: revenue._sum.totalAmount || 0,
      totalRevenueFormatted: `₹${((revenue._sum.totalAmount || 0) / 100).toLocaleString('en-IN')}`,
    };
  }

  async listOrganisations(pagination: PaginationDto) {
    const [data, total] = await Promise.all([
      this.prisma.organisation.findMany({
        where: { deletedAt: null },
        include: {
          _count: { select: { users: true, apps: true, builds: true } },
          mintWallet: { select: { balance: true } },
        },
        orderBy: { createdAt: 'desc' },
        skip: pagination.skip,
        take: pagination.take,
      }),
      this.prisma.organisation.count({ where: { deletedAt: null } }),
    ]);

    return {
      data,
      meta: {
        total,
        page: pagination.page!,
        limit: pagination.limit!,
        totalPages: Math.ceil(total / pagination.take),
      },
    };
  }

  async listBuilds(pagination: PaginationDto, status?: string) {
    const where = status ? { status: status as any } : {};

    const [data, total] = await Promise.all([
      this.prisma.build.findMany({
        where,
        include: {
          app: { select: { name: true, bundleId: true } },
          organisation: { select: { name: true, slug: true } },
        },
        orderBy: { createdAt: 'desc' },
        skip: pagination.skip,
        take: pagination.take,
      }),
      this.prisma.build.count({ where }),
    ]);

    return {
      data,
      meta: {
        total,
        page: pagination.page!,
        limit: pagination.limit!,
        totalPages: Math.ceil(total / pagination.take),
      },
    };
  }

  async suspendOrg(orgId: string) {
    return this.prisma.organisation.update({
      where: { id: orgId },
      data: { status: 'suspended' },
    });
  }

  async reactivateOrg(orgId: string) {
    return this.prisma.organisation.update({
      where: { id: orgId },
      data: { status: 'active' },
    });
  }

  async getOrgDetails(orgId: string) {
    return this.prisma.organisation.findUnique({
      where: { id: orgId },
      include: {
        users: { select: { id: true, email: true, name: true, role: true, createdAt: true } },
        apps: { select: { id: true, name: true, bundleId: true, status: true, createdAt: true } },
        payments: { orderBy: { createdAt: 'desc' }, take: 10 },
        mintWallet: true,
        addonPurchases: true,
        _count: { select: { builds: true } },
      },
    });
  }
}
