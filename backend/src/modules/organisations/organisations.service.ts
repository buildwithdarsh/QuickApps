import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../../database/prisma.service';

@Injectable()
export class OrganisationsService {
  constructor(private prisma: PrismaService) {}

  async findById(orgId: string) {
    const org = await this.prisma.organisation.findFirst({
      where: { id: orgId, deletedAt: null },
      include: { mintWallet: true },
    });

    if (!org) throw new NotFoundException('Organisation not found');
    return org;
  }

  async update(orgId: string, data: {
    name?: string;
    billingEmail?: string;
    billingName?: string;
    billingAddress?: string;
    gstNumber?: string;
  }) {
    return this.prisma.organisation.update({
      where: { id: orgId },
      data,
    });
  }

  async getMembers(orgId: string) {
    return this.prisma.user.findMany({
      where: { orgId, deletedAt: null },
      select: {
        id: true,
        email: true,
        name: true,
        role: true,
        avatarUrl: true,
        emailVerified: true,
        lastLoginAt: true,
        createdAt: true,
      },
      orderBy: { createdAt: 'asc' },
    });
  }
}
