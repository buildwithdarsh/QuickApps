import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { PrismaService } from '../../database/prisma.service';
import { WALLET_MIN_TOPUP } from '../../common/constants';

@Injectable()
export class WalletService {
  constructor(private prisma: PrismaService) {}

  async getBalance(orgId: string) {
    const wallet = await this.prisma.mintWallet.findUnique({
      where: { orgId },
    });

    if (!wallet) throw new NotFoundException('Wallet not found');

    return {
      balance: wallet.balance,
      balanceFormatted: `₹${(wallet.balance / 100).toLocaleString('en-IN')}`,
      lastUpdated: wallet.lastUpdated,
    };
  }

  async getTransactions(orgId: string, page = 1, limit = 20) {
    const wallet = await this.prisma.mintWallet.findUnique({
      where: { orgId },
    });

    if (!wallet) throw new NotFoundException('Wallet not found');

    const [transactions, total] = await Promise.all([
      this.prisma.walletTransaction.findMany({
        where: { walletId: wallet.id },
        orderBy: { createdAt: 'desc' },
        skip: (page - 1) * limit,
        take: limit,
      }),
      this.prisma.walletTransaction.count({ where: { walletId: wallet.id } }),
    ]);

    return {
      data: transactions,
      meta: { total, page, limit, totalPages: Math.ceil(total / limit) },
    };
  }

  async debit(orgId: string, amount: number, description: string, referenceId?: string) {
    if (amount <= 0) throw new BadRequestException('Amount must be positive');

    const wallet = await this.prisma.mintWallet.findUnique({
      where: { orgId },
    });

    if (!wallet) throw new NotFoundException('Wallet not found');
    if (wallet.balance < amount) {
      throw new BadRequestException('Insufficient wallet balance');
    }

    const updated = await this.prisma.mintWallet.update({
      where: { orgId },
      data: {
        balance: { decrement: amount },
        lastUpdated: new Date(),
      },
    });

    await this.prisma.walletTransaction.create({
      data: {
        walletId: wallet.id,
        amount: -amount,
        balanceAfter: updated.balance,
        description,
        referenceId,
      },
    });

    return updated;
  }

  async credit(orgId: string, amount: number, description: string, referenceId?: string) {
    if (amount <= 0) throw new BadRequestException('Amount must be positive');

    const wallet = await this.prisma.mintWallet.findUnique({
      where: { orgId },
    });

    if (!wallet) throw new NotFoundException('Wallet not found');

    const updated = await this.prisma.mintWallet.update({
      where: { orgId },
      data: {
        balance: { increment: amount },
        lastUpdated: new Date(),
      },
    });

    await this.prisma.walletTransaction.create({
      data: {
        walletId: wallet.id,
        amount,
        balanceAfter: updated.balance,
        description,
        referenceId,
      },
    });

    return updated;
  }
}
