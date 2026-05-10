import {
  Injectable,
  BadRequestException,
  NotFoundException,
  Logger,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { PrismaService } from '../../database/prisma.service';
import { GST_RATE } from '../../common/constants';
import { PaymentType, PaymentGateway } from '@prisma/client';
import { createHmac } from 'crypto';

@Injectable()
export class PaymentsService {
  private readonly logger = new Logger(PaymentsService.name);
  private readonly razorpayKeyId: string;
  private readonly razorpayKeySecret: string;
  private readonly webhookSecret: string;

  constructor(
    private prisma: PrismaService,
    private config: ConfigService,
  ) {
    this.razorpayKeyId = this.config.get<string>('razorpay.keyId', '');
    this.razorpayKeySecret = this.config.get<string>('razorpay.keySecret', '');
    this.webhookSecret = this.config.get<string>('razorpay.webhookSecret', '');
  }

  async createOrder(orgId: string, amount: number, type: PaymentType, metadata?: Record<string, unknown>) {
    const gstAmount = Math.round(amount * GST_RATE);
    const totalAmount = amount + gstAmount;

    // Create Razorpay order
    const razorpayOrder = await this.createRazorpayOrder(totalAmount);

    // Create payment record
    const payment = await this.prisma.payment.create({
      data: {
        orgId,
        type,
        amount,
        gstAmount,
        totalAmount,
        gateway: 'razorpay',
        gatewayOrderId: razorpayOrder.id,
        status: 'pending',
        metadata: (metadata || {}) as any,
      },
    });

    return {
      paymentId: payment.id,
      razorpayOrderId: razorpayOrder.id,
      razorpayKeyId: this.razorpayKeyId,
      amount: totalAmount,
      currency: 'INR',
    };
  }

  async verifyPayment(
    razorpayOrderId: string,
    razorpayPaymentId: string,
    razorpaySignature: string,
  ) {
    // Verify signature
    const body = `${razorpayOrderId}|${razorpayPaymentId}`;
    const expectedSignature = createHmac('sha256', this.razorpayKeySecret)
      .update(body)
      .digest('hex');

    if (expectedSignature !== razorpaySignature) {
      throw new BadRequestException('Invalid payment signature');
    }

    // Update payment record
    const payment = await this.prisma.payment.findFirst({
      where: { gatewayOrderId: razorpayOrderId },
    });

    if (!payment) throw new NotFoundException('Payment not found');

    const updated = await this.prisma.payment.update({
      where: { id: payment.id },
      data: {
        status: 'completed',
        gatewayRef: razorpayPaymentId,
      },
    });

    // Process payment based on type
    await this.processCompletedPayment(updated);

    return { success: true, paymentId: updated.id };
  }

  async handleWebhook(body: string, signature: string) {
    // Verify webhook signature
    const expectedSignature = createHmac('sha256', this.webhookSecret)
      .update(body)
      .digest('hex');

    if (expectedSignature !== signature) {
      throw new BadRequestException('Invalid webhook signature');
    }

    const event = JSON.parse(body);
    this.logger.log(`Razorpay webhook: ${event.event}`);

    if (event.event === 'payment.captured') {
      const paymentEntity = event.payload?.payment?.entity;
      if (paymentEntity?.order_id) {
        const payment = await this.prisma.payment.findFirst({
          where: { gatewayOrderId: paymentEntity.order_id },
        });

        if (payment && payment.status === 'pending') {
          const updated = await this.prisma.payment.update({
            where: { id: payment.id },
            data: {
              status: 'completed',
              gatewayRef: paymentEntity.id,
            },
          });
          await this.processCompletedPayment(updated);
        }
      }
    }

    return { received: true };
  }

  async getHistory(orgId: string, page = 1, limit = 20) {
    const [payments, total] = await Promise.all([
      this.prisma.payment.findMany({
        where: { orgId },
        orderBy: { createdAt: 'desc' },
        skip: (page - 1) * limit,
        take: limit,
      }),
      this.prisma.payment.count({ where: { orgId } }),
    ]);

    return {
      data: payments,
      meta: { total, page, limit, totalPages: Math.ceil(total / limit) },
    };
  }

  // ── Private helpers ─────────────────────────────────

  private async createRazorpayOrder(amountInPaise: number) {
    const auth = Buffer.from(`${this.razorpayKeyId}:${this.razorpayKeySecret}`).toString('base64');

    const response = await fetch('https://api.razorpay.com/v1/orders', {
      method: 'POST',
      headers: {
        Authorization: `Basic ${auth}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        amount: amountInPaise,
        currency: 'INR',
        receipt: `qa_${Date.now()}`,
      }),
    });

    if (!response.ok) {
      const error = await response.text();
      this.logger.error(`Razorpay order creation failed: ${error}`);
      throw new BadRequestException('Failed to create payment order');
    }

    return response.json();
  }

  private async processCompletedPayment(payment: {
    id: string;
    orgId: string;
    type: PaymentType;
    metadata: unknown;
  }) {
    const metadata = (payment.metadata || {}) as Record<string, string>;

    switch (payment.type) {
      case 'plan_purchase': {
        const plan = metadata.plan as 'starter' | 'pro' | 'premium';
        if (plan) {
          await this.prisma.organisation.update({
            where: { id: payment.orgId },
            data: { plan },
          });
        }
        break;
      }
      case 'addon_purchase': {
        // Addon is already created in pending state during purchase flow
        break;
      }
      case 'revision_credit': {
        const appId = metadata.appId;
        if (appId) {
          await this.prisma.revision.update({
            where: { appId },
            data: { extraPurchased: { increment: 1 } },
          });
        }
        break;
      }
      case 'wallet_topup': {
        const amount = parseInt(metadata.amount || '0', 10);
        if (amount > 0) {
          await this.prisma.mintWallet.update({
            where: { orgId: payment.orgId },
            data: {
              balance: { increment: amount },
              lastUpdated: new Date(),
            },
          });
          // Log wallet transaction
          const wallet = await this.prisma.mintWallet.findUnique({
            where: { orgId: payment.orgId },
          });
          if (wallet) {
            await this.prisma.walletTransaction.create({
              data: {
                walletId: wallet.id,
                amount,
                balanceAfter: wallet.balance,
                description: 'Wallet top-up',
                referenceId: payment.id,
              },
            });
          }
        }
        break;
      }
    }
  }
}
