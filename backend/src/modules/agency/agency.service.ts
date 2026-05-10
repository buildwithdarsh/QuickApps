import {
  Injectable,
  NotFoundException,
  ForbiddenException,
  ConflictException,
} from '@nestjs/common';
import { PrismaService } from '../../database/prisma.service';
import { EmailService } from '../../services/email/email.service';

@Injectable()
export class AgencyService {
  constructor(
    private prisma: PrismaService,
    private email: EmailService,
  ) {}

  async getProfile(orgId: string) {
    const agency = await this.prisma.agency.findUnique({
      where: { orgId },
      include: {
        clients: {
          include: {
            clientOrg: {
              select: { id: true, name: true, slug: true, plan: true },

            },
          },
        },
        _count: { select: { clients: true, managedOrgs: true } },
      },
    });

    if (!agency) throw new NotFoundException('Agency profile not found. Upgrade to an agency plan.');
    return agency;
  }

  async createProfile(orgId: string, data: {
    brandName: string;
    brandColor?: string;
    subdomain?: string;
  }) {
    const existing = await this.prisma.agency.findUnique({ where: { orgId } });
    if (existing) throw new ConflictException('Agency profile already exists');

    return this.prisma.agency.create({
      data: {
        orgId,
        brandName: data.brandName,
        brandColor: data.brandColor,
        subdomain: data.subdomain,
      },
    });
  }

  async updateProfile(orgId: string, data: {
    brandName?: string;
    brandColor?: string;
    customDomain?: string;
    subdomain?: string;
    logoUrl?: string;
  }) {
    const agency = await this.prisma.agency.findUnique({ where: { orgId } });
    if (!agency) throw new NotFoundException('Agency profile not found');

    return this.prisma.agency.update({
      where: { orgId },
      data,
    });
  }

  async inviteClient(orgId: string, email: string) {
    const agency = await this.prisma.agency.findUnique({ where: { orgId } });
    if (!agency) throw new NotFoundException('Agency profile not found');

    // Check client limit
    const clientCount = await this.prisma.agencyClient.count({
      where: { agencyId: agency.id, status: { in: ['invited', 'active'] } },
    });

    if (clientCount >= agency.maxClients) {
      throw new ForbiddenException(`Client limit reached (${agency.maxClients}). Upgrade your agency plan.`);
    }

    // Create client org
    const slug = `${agency.subdomain || 'client'}-${Math.random().toString(36).slice(2, 8)}`;
    const clientOrg = await this.prisma.organisation.create({
      data: {
        name: email.split('@')[0],
        slug,
        billingEmail: email,
        agencyId: agency.id,
      },
    });

    // Create wallet for client
    await this.prisma.mintWallet.create({ data: { orgId: clientOrg.id } });

    // Create agency-client link
    const agencyClient = await this.prisma.agencyClient.create({
      data: {
        agencyId: agency.id,
        clientOrgId: clientOrg.id,
        status: 'invited',
        inviteEmail: email,
      },
    });

    // Send invite email
    await this.email.send({
      to: email,
      subject: `${agency.brandName} has invited you to build your app`,
      html: `
        <div style="font-family: sans-serif; max-width: 480px; margin: 0 auto;">
          <h2>${agency.brandName} App Builder</h2>
          <p>You've been invited to create your mobile app powered by ${agency.brandName}.</p>
          <a href="https://app.quickapps.in/register" style="display: inline-block; padding: 12px 24px; background: #F97316; color: white; text-decoration: none; border-radius: 8px; margin: 16px 0;">
            Accept Invitation
          </a>
        </div>
      `,
    });

    return agencyClient;
  }

  async getClients(orgId: string) {
    const agency = await this.prisma.agency.findUnique({ where: { orgId } });
    if (!agency) throw new NotFoundException('Agency profile not found');

    return this.prisma.agencyClient.findMany({
      where: { agencyId: agency.id },
      include: {
        clientOrg: {
          select: {
            id: true,
            name: true,
            slug: true,
            plan: true,
            status: true,
            _count: { select: { apps: true, builds: true } },
          },
        },
      },
      orderBy: { createdAt: 'desc' },
    });
  }

  async removeClient(orgId: string, clientId: string) {
    const agency = await this.prisma.agency.findUnique({ where: { orgId } });
    if (!agency) throw new NotFoundException('Agency profile not found');

    return this.prisma.agencyClient.update({
      where: { id: clientId },
      data: { status: 'removed' },
    });
  }

  async getStats(orgId: string) {
    const agency = await this.prisma.agency.findUnique({ where: { orgId } });
    if (!agency) throw new NotFoundException('Agency profile not found');

    const clientIds = await this.prisma.agencyClient.findMany({
      where: { agencyId: agency.id, status: 'active' },
      select: { clientOrgId: true },
    });

    const orgIds = clientIds.map((c) => c.clientOrgId);

    const [totalClients, totalApps, totalBuilds, completedBuilds] = await Promise.all([
      this.prisma.agencyClient.count({ where: { agencyId: agency.id, status: { in: ['active', 'invited'] } } }),
      this.prisma.app.count({ where: { orgId: { in: orgIds }, deletedAt: null } }),
      this.prisma.build.count({ where: { orgId: { in: orgIds } } }),
      this.prisma.build.count({ where: { orgId: { in: orgIds }, status: 'completed' } }),
    ]);

    return { totalClients, totalApps, totalBuilds, completedBuilds, maxClients: agency.maxClients, maxApps: agency.maxApps, plan: agency.plan };
  }
}
