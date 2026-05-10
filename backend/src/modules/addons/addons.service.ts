import {
  Injectable,
  NotFoundException,
  BadRequestException,
  ConflictException,
  ForbiddenException,
} from '@nestjs/common';
import { PrismaService } from '../../database/prisma.service';
import { EncryptionService } from '../../services/encryption/encryption.service';
import { WalletService } from '../wallet/wallet.service';
import { ADDON_CATALOG, getAddonBySlug } from './constants/addon-catalog';

@Injectable()
export class AddonsService {
  constructor(
    private prisma: PrismaService,
    private encryption: EncryptionService,
    private wallet: WalletService,
  ) {}

  getCatalog() {
    return ADDON_CATALOG.map(({ configSchema, ...addon }) => addon);
  }

  getCatalogFull() {
    return ADDON_CATALOG;
  }

  async getForApp(orgId: string, appId: string) {
    await this.verifyAppOwnership(orgId, appId);

    const purchases = await this.prisma.addonPurchase.findMany({
      where: { appId, orgId },
      orderBy: { purchasedAt: 'desc' },
    });

    return purchases.map((p) => ({
      ...p,
      configJson: p.configJson ? JSON.parse(this.encryption.decrypt(p.configJson)) : null,
      addonMeta: getAddonBySlug(p.addonSlug),
    }));
  }

  async getAllForOrg(orgId: string) {
    const purchases = await this.prisma.addonPurchase.findMany({
      where: { orgId },
      orderBy: { purchasedAt: 'desc' },
      include: { app: { select: { id: true, name: true } } },
    });

    return purchases.map((p) => ({
      ...p,
      configJson: p.configJson ? JSON.parse(this.encryption.decrypt(p.configJson)) : null,
      addonMeta: getAddonBySlug(p.addonSlug),
    }));
  }

  async purchase(orgId: string, appId: string, slug: string) {
    const addon = getAddonBySlug(slug);
    if (!addon) throw new NotFoundException(`Addon "${slug}" not found`);

    await this.verifyAppOwnership(orgId, appId);

    // Check if already purchased for this app
    const existing = await this.prisma.addonPurchase.findUnique({
      where: { appId_addonSlug: { appId, addonSlug: slug } },
    });
    if (existing) throw new ConflictException('Addon already added to this app');

    // Check plan allows addon store
    const org = await this.prisma.organisation.findUnique({ where: { id: orgId } });
    if (!org || org.plan === 'free') {
      throw new ForbiddenException('Upgrade your plan to access the addon store');
    }

    // Check wallet balance first
    const walletData = await this.prisma.mintWallet.findUnique({ where: { orgId } });
    if (!walletData || walletData.balance < addon.price) {
      const needed = addon.price - (walletData?.balance ?? 0);
      throw new BadRequestException(
        `Insufficient balance. Need ₹${(addon.price / 100).toLocaleString('en-IN')}, ` +
        `have ₹${((walletData?.balance ?? 0) / 100).toLocaleString('en-IN')}. ` +
        `Top up ₹${(needed / 100).toLocaleString('en-IN')} to continue.`,
      );
    }

    // Deduct and create in one go — debit first, then create
    await this.wallet.debit(orgId, addon.price, `Addon: ${addon.name}`, `addon:${slug}:${appId}`);

    const purchase = await this.prisma.addonPurchase.create({
      data: { orgId, appId, addonSlug: slug, isActive: true },
    });

    const updatedBalance = await this.prisma.mintWallet.findUnique({ where: { orgId } });

    return {
      ...purchase,
      charged: addon.price,
      chargedFormatted: `₹${(addon.price / 100).toLocaleString('en-IN')}`,
      newBalance: updatedBalance?.balance ?? 0,
      newBalanceFormatted: `₹${((updatedBalance?.balance ?? 0) / 100).toLocaleString('en-IN')}`,
    };
  }

  async purchaseBulk(orgId: string, appId: string, slugs: string[]) {
    await this.verifyAppOwnership(orgId, appId);

    // Check plan
    const org = await this.prisma.organisation.findUnique({ where: { id: orgId } });
    if (!org || org.plan === 'free') {
      throw new ForbiddenException('Upgrade your plan to access the addon store');
    }

    // Filter out already purchased + invalid slugs
    const existing = await this.prisma.addonPurchase.findMany({
      where: { appId, addonSlug: { in: slugs } },
      select: { addonSlug: true },
    });
    const existingSlugs = new Set(existing.map((e) => e.addonSlug));
    const validAddons = slugs
      .filter((s) => !existingSlugs.has(s))
      .map((s) => ({ slug: s, addon: getAddonBySlug(s) }))
      .filter((a) => a.addon != null);

    if (validAddons.length === 0) return { added: 0, slugs: [], totalCharged: 0, totalChargedFormatted: '₹0' };

    // Calculate total cost
    const totalCost = validAddons.reduce((sum, a) => sum + (a.addon?.price ?? 0), 0);

    // Check wallet balance
    const walletData = await this.prisma.mintWallet.findUnique({ where: { orgId } });
    if (!walletData || walletData.balance < totalCost) {
      const needed = totalCost - (walletData?.balance ?? 0);
      throw new BadRequestException(
        `Insufficient balance. Need ₹${(totalCost / 100).toLocaleString('en-IN')} for ${validAddons.length} addon${validAddons.length > 1 ? 's' : ''}, ` +
        `have ₹${((walletData?.balance ?? 0) / 100).toLocaleString('en-IN')}. ` +
        `Top up ₹${(needed / 100).toLocaleString('en-IN')} to continue.`,
      );
    }

    // Deduct total from wallet
    await this.wallet.debit(
      orgId,
      totalCost,
      `${validAddons.length} addon${validAddons.length > 1 ? 's' : ''} added`,
      `addon-bulk:${appId}`,
    );

    await this.prisma.addonPurchase.createMany({
      data: validAddons.map((a) => ({
        orgId,
        appId,
        addonSlug: a.slug,
        isActive: true,
      })),
    });

    const updatedBalance = await this.prisma.mintWallet.findUnique({ where: { orgId } });

    return {
      added: validAddons.length,
      slugs: validAddons.map((a) => a.slug),
      totalCharged: totalCost,
      totalChargedFormatted: `₹${(totalCost / 100).toLocaleString('en-IN')}`,
      newBalance: updatedBalance?.balance ?? 0,
      newBalanceFormatted: `₹${((updatedBalance?.balance ?? 0) / 100).toLocaleString('en-IN')}`,
    };
  }

  async remove(orgId: string, appId: string, slug: string) {
    const purchase = await this.prisma.addonPurchase.findUnique({
      where: { appId_addonSlug: { appId, addonSlug: slug } },
    });
    if (!purchase || purchase.orgId !== orgId) throw new NotFoundException('Addon not found on this app');

    const addon = getAddonBySlug(slug);

    await this.prisma.addonPurchase.delete({ where: { id: purchase.id } });

    // Refund to wallet
    if (addon) {
      await this.wallet.credit(
        orgId,
        addon.price,
        `Refund: ${addon.name}`,
        `addon-refund:${slug}:${appId}`,
      );
    }

    return {
      removed: true,
      refunded: addon?.price ?? 0,
      refundedFormatted: addon ? `₹${(addon.price / 100).toLocaleString('en-IN')}` : '₹0',
    };
  }

  async saveConfig(orgId: string, appId: string, slug: string, config: Record<string, unknown>) {
    const purchase = await this.prisma.addonPurchase.findUnique({
      where: { appId_addonSlug: { appId, addonSlug: slug } },
    });
    if (!purchase || purchase.orgId !== orgId) throw new NotFoundException('Addon not found on this app');

    const encrypted = this.encryption.encrypt(JSON.stringify(config));

    return this.prisma.addonPurchase.update({
      where: { id: purchase.id },
      data: { configJson: encrypted },
    });
  }

  async getConfig(orgId: string, appId: string, slug: string) {
    const purchase = await this.prisma.addonPurchase.findUnique({
      where: { appId_addonSlug: { appId, addonSlug: slug } },
    });
    if (!purchase || purchase.orgId !== orgId) throw new NotFoundException('Addon not found on this app');

    const addon = getAddonBySlug(slug);
    return {
      slug,
      addonName: addon?.name,
      configSchema: addon?.configSchema,
      config: purchase.configJson
        ? JSON.parse(this.encryption.decrypt(purchase.configJson))
        : null,
      isActive: purchase.isActive,
    };
  }

  async toggleActive(orgId: string, appId: string, slug: string, isActive: boolean) {
    const purchase = await this.prisma.addonPurchase.findUnique({
      where: { appId_addonSlug: { appId, addonSlug: slug } },
    });
    if (!purchase || purchase.orgId !== orgId) throw new NotFoundException('Addon not found on this app');

    return this.prisma.addonPurchase.update({
      where: { id: purchase.id },
      data: { isActive },
    });
  }

  private async verifyAppOwnership(orgId: string, appId: string) {
    const app = await this.prisma.app.findFirst({
      where: { id: appId, orgId, deletedAt: null },
    });
    if (!app) throw new NotFoundException('App not found');
    return app;
  }
}
